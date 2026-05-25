import torch
import torch.nn as nn
import torch.nn.functional as F


class JEPAConfig:
    def __init__(
        self,
        input_dim=128,
        hidden_dim=512,
        embed_dim=256,
        proj_dim=256,
        num_layers=4,
        dropout=0.1,
        momentum=0.996,
    ):
        self.input_dim = input_dim
        self.hidden_dim = hidden_dim
        self.embed_dim = embed_dim
        self.proj_dim = proj_dim
        self.num_layers = num_layers
        self.dropout = dropout
        self.momentum = momentum


class MLP(nn.Module):
    def __init__(self, in_dim, hidden_dim, out_dim, num_layers, dropout):
        super().__init__()

        layers = []
        d = in_dim

        for _ in range(num_layers - 1):
            layers.append(nn.Linear(d, hidden_dim))
            layers.append(nn.GELU())
            layers.append(nn.Dropout(dropout))
            d = hidden_dim

        layers.append(nn.Linear(d, out_dim))
        self.net = nn.Sequential(*layers)

    def forward(self, x):
        return self.net(x)


class Encoder(nn.Module):
    def __init__(self, config: JEPAConfig):
        super().__init__()

        self.backbone = MLP(
            config.input_dim,
            config.hidden_dim,
            config.embed_dim,
            config.num_layers,
            config.dropout,
        )

        self.norm = nn.LayerNorm(config.embed_dim)

        self.projector = MLP(
            config.embed_dim,
            config.hidden_dim,
            config.proj_dim,
            2,
            config.dropout,
        )

    def forward(self, x):
        z = self.backbone(x)
        z = self.norm(z)
        p = self.projector(z)
        return z, p


class Predictor(nn.Module):
    def __init__(self, config: JEPAConfig):
        super().__init__()

        self.net = MLP(
            config.proj_dim,
            config.hidden_dim,
            config.proj_dim,
            config.num_layers,
            config.dropout,
        )

    def forward(self, x):
        return self.net(x)


class JEPA(nn.Module):
    def __init__(self, config: JEPAConfig):
        super().__init__()

        self.context_encoder = Encoder(config)
        self.target_encoder = Encoder(config)

        self.predictor = Predictor(config)

        self.momentum = config.momentum

        self._init_target()

    def _init_target(self):
        for q, k in zip(
            self.context_encoder.parameters(),
            self.target_encoder.parameters()
        ):
            k.data.copy_(q.data)
            k.requires_grad = False

    def forward(self, context, target, mask=None):
        z_c, p_c = self.context_encoder(context)

        if mask is not None:
            p_c = p_c * mask

        pred = self.predictor(p_c)

        with torch.no_grad():
            _, p_t = self.target_encoder(target)

        return pred, p_t

    @torch.no_grad()
    def update_target_encoder(self):
        for q, k in zip(
            self.context_encoder.parameters(),
            self.target_encoder.parameters()
        ):
            k.data = self.momentum * k.data + (1 - self.momentum) * q.data


def jepa_loss(pred, target):
    pred = F.normalize(pred, dim=-1)
    target = F.normalize(target, dim=-1)
    return 2 - 2 * (pred * target).sum(dim=-1).mean()

import torch
import torch.nn as nn


class MaskConfig:
    def __init__(
        self,
        mask_ratio=0.3,
        mask_strategy="random",
        block_size=4,
        feature_drop_prob=0.1,
    ):
        self.mask_ratio = mask_ratio
        self.mask_strategy = mask_strategy
        self.block_size = block_size
        self.feature_drop_prob = feature_drop_prob


class MaskGenerator:
    def __init__(self, config: MaskConfig):
        self.config = config

    def random_mask(self, x):
        B, D = x.shape
        mask = torch.rand(B, D, device=x.device)
        mask = (mask > self.config.mask_ratio).float()
        return mask

    def block_mask(self, x):
        B, D = x.shape
        mask = torch.ones(B, D, device=x.device)

        block = self.config.block_size
        num_blocks = max(1, int((D * self.config.mask_ratio) // block))

        for b in range(B):
            for _ in range(num_blocks):
                start = torch.randint(0, D - block, (1,))
                mask[b, start:start + block] = 0

        return mask

    def feature_dropout(self, x):
        B, D = x.shape
        mask = torch.ones(B, D, device=x.device)
        drop = torch.rand(D, device=x.device) < self.config.feature_drop_prob
        mask[:, drop] = 0
        return mask

    def generate(self, x):
        if self.config.mask_strategy == "random":
            return self.random_mask(x)
        elif self.config.mask_strategy == "block":
            return self.block_mask(x)
        elif self.config.mask_strategy == "feature":
            return self.feature_dropout(x)
        else:
            raise ValueError("Unknown mask strategy")


class ViewBuilder:
    def __init__(self, mask_generator: MaskGenerator):
        self.mask_generator = mask_generator

    def build_views(self, x):
        mask_context = self.mask_generator.generate(x)
        mask_target = self.mask_generator.generate(x)

        context = x * mask_context
        target = x * mask_target

        return context, target, mask_context, mask_target


class CurriculumMaskScheduler:
    def __init__(
        self,
        start_ratio=0.1,
        end_ratio=0.6,
        total_steps=10000,
    ):
        self.start_ratio = start_ratio
        self.end_ratio = end_ratio
        self.total_steps = total_steps

    def get_ratio(self, step):
        progress = min(step / self.total_steps, 1.0)
        return self.start_ratio + progress * (self.end_ratio - self.start_ratio)

    def step(self, mask_generator: MaskGenerator, global_step):
        new_ratio = self.get_ratio(global_step)
        mask_generator.config.mask_ratio = new_ratio


class SemanticMask:
    def __init__(self, importance_threshold=0.5):
        self.threshold = importance_threshold

    def apply(self, x, importance_scores):
        mask = (importance_scores > self.threshold).float()
        return x * mask, mask


class MultiMaskController:
    def __init__(
        self,
        base_generator: MaskGenerator,
        semantic_mask: SemanticMask = None,
        use_curriculum=False,
        scheduler: CurriculumMaskScheduler = None,
    ):
        self.base_generator = base_generator
        self.semantic_mask = semantic_mask
        self.use_curriculum = use_curriculum
        self.scheduler = scheduler

    def step(self, global_step):
        if self.use_curriculum and self.scheduler is not None:
            self.scheduler.step(self.base_generator, global_step)

    def generate(self, x, importance_scores=None):
        base_mask = self.base_generator.generate(x)

        if self.semantic_mask is not None and importance_scores is not None:
            x_sem, semantic_mask = self.semantic_mask.apply(x, importance_scores)
            combined_mask = base_mask * semantic_mask
            return x_sem * base_mask, combined_mask

        return x * base_mask, base_mask


def build_jepa_batch(
    x,
    mask_controller: MultiMaskController,
    importance_scores=None,
):
    context, mask_c = mask_controller.generate(x, importance_scores)
    target, mask_t = mask_controller.generate(x, importance_scores)

    return context, target, mask_c, mask_t

import torch
import torch.nn as nn
import torch.optim as optim
import math
from collections import defaultdict


class TrainConfig:
    def __init__(
        self,
        lr=3e-4,
        weight_decay=1e-5,
        batch_size=256,
        epochs=100,
        warmup_steps=1000,
        total_steps=10000,
        ema_start=0.99,
        ema_end=0.9995,
        log_interval=100,
        device="cuda" if torch.cuda.is_available() else "cpu",
    ):
        self.lr = lr
        self.weight_decay = weight_decay
        self.batch_size = batch_size
        self.epochs = epochs
        self.warmup_steps = warmup_steps
        self.total_steps = total_steps
        self.ema_start = ema_start
        self.ema_end = ema_end
        self.log_interval = log_interval
        self.device = device


class CosineScheduler:
    def __init__(self, base_lr, warmup_steps, total_steps):
        self.base_lr = base_lr
        self.warmup_steps = warmup_steps
        self.total_steps = total_steps

    def get_lr(self, step):
        if step < self.warmup_steps:
            return self.base_lr * step / self.warmup_steps

        progress = (step - self.warmup_steps) / (self.total_steps - self.warmup_steps)
        return self.base_lr * 0.5 * (1 + math.cos(math.pi * progress))


class EMAScheduler:
    def __init__(self, start, end, total_steps):
        self.start = start
        self.end = end
        self.total_steps = total_steps

    def get_momentum(self, step):
        progress = min(step / self.total_steps, 1.0)
        return self.start + progress * (self.end - self.start)


class CollapseMonitor:
    def __init__(self):
        self.history = []

    def compute_variance(self, z):
        return z.var(dim=0).mean().item()

    def compute_norm(self, z):
        return z.norm(dim=-1).mean().item()

    def check(self, pred, target):
        var_pred = self.compute_variance(pred)
        var_target = self.compute_variance(target)

        norm_pred = self.compute_norm(pred)
        norm_target = self.compute_norm(target)

        stats = {
            "var_pred": var_pred,
            "var_target": var_target,
            "norm_pred": norm_pred,
            "norm_target": norm_target,
        }

        self.history.append(stats)
        return stats


class JEPA_Trainer:
    def __init__(
        self,
        model,
        train_config,
        mask_controller,
        loss_fn,
    ):
        self.model = model.to(train_config.device)
        self.cfg = train_config
        self.mask_controller = mask_controller
        self.loss_fn = loss_fn

        self.optimizer = optim.AdamW(
            self.model.context_encoder.parameters(),
            lr=self.cfg.lr,
            weight_decay=self.cfg.weight_decay,
        )

        self.lr_scheduler = CosineScheduler(
            self.cfg.lr,
            self.cfg.warmup_steps,
            self.cfg.total_steps,
        )

        self.ema_scheduler = EMAScheduler(
            self.cfg.ema_start,
            self.cfg.ema_end,
            self.cfg.total_steps,
        )

        self.monitor = CollapseMonitor()

        self.global_step = 0
        self.logs = defaultdict(list)

    def train_step(self, x, importance_scores=None):
        self.model.train()

        x = x.to(self.cfg.device)

        context, target, mask_c, mask_t = build_jepa_batch(
            x,
            self.mask_controller,
            importance_scores,
        )

        pred, z_t = self.model(context, target, mask_c)

        loss = self.loss_fn(pred, z_t)

        self.optimizer.zero_grad()
        loss.backward()

        torch.nn.utils.clip_grad_norm_(self.model.parameters(), 1.0)

        self.optimizer.step()

        momentum = self.ema_scheduler.get_momentum(self.global_step)
        self.model.momentum = momentum
        self.model.update_target_encoder()

        lr = self.lr_scheduler.get_lr(self.global_step)
        for param_group in self.optimizer.param_groups:
            param_group["lr"] = lr

        stats = self.monitor.check(pred.detach(), z_t.detach())

        self.logs["loss"].append(loss.item())
        for k, v in stats.items():
            self.logs[k].append(v)

        self.global_step += 1

        return loss.item(), stats

    def train_epoch(self, dataloader):
        epoch_loss = 0

        for step, batch in enumerate(dataloader):
            if isinstance(batch, (list, tuple)):
                x = batch[0]
            else:
                x = batch

            self.mask_controller.step(self.global_step)

            loss, stats = self.train_step(x)

            epoch_loss += loss

            if step % self.cfg.log_interval == 0:
                print(
                    f"[Step {self.global_step}] "
                    f"Loss: {loss:.4f} | "
                    f"Var(pred): {stats['var_pred']:.4f} | "
                    f"Var(target): {stats['var_target']:.4f}"
                )

        return epoch_loss / len(dataloader)

    def fit(self, dataloader):
        for epoch in range(self.cfg.epochs):
            loss = self.train_epoch(dataloader)
            print(f"Epoch {epoch+1}/{self.cfg.epochs} - Loss: {loss:.4f}")

      import torch
import torch.nn as nn
import torch.nn.functional as F
from collections import defaultdict


class StudentProfile:
    def __init__(self, student_id, embed_dim):
        self.student_id = student_id
        self.knowledge_state = torch.zeros(embed_dim)
        self.performance = defaultdict(list)
        self.last_updated = 0

    def update_knowledge(self, embedding, alpha=0.1):
        self.knowledge_state = (
            (1 - alpha) * self.knowledge_state + alpha * embedding.detach().cpu()
        )

    def record_performance(self, concept_id, score):
        self.performance[concept_id].append(score)

    def get_weak_concepts(self, threshold=0.6):
        weak = []
        for concept, scores in self.performance.items():
            if len(scores) == 0:
                continue
            avg = sum(scores) / len(scores)
            if avg < threshold:
                weak.append(concept)
        return weak


class StudentMemoryBank:
    def __init__(self, embed_dim):
        self.students = {}
        self.embed_dim = embed_dim

    def get_or_create(self, student_id):
        if student_id not in self.students:
            self.students[student_id] = StudentProfile(
                student_id, self.embed_dim
            )
        return self.students[student_id]

    def update(self, student_id, embedding):
        profile = self.get_or_create(student_id)
        profile.update_knowledge(embedding)


class ConceptEncoder(nn.Module):
    def __init__(self, input_dim, concept_dim):
        super().__init__()
        self.encoder = nn.Linear(input_dim, concept_dim)

    def forward(self, x):
        return self.encoder(x)


class WeaknessEstimator:
    def __init__(self):
        pass

    def estimate(self, student_profile: StudentProfile, concept_embeddings):
        weak_concepts = student_profile.get_weak_concepts()

        if len(weak_concepts) == 0:
            return None

        mask = torch.zeros_like(concept_embeddings)

        for idx in weak_concepts:
            if idx < concept_embeddings.shape[0]:
                mask[idx] = 1.0

        return mask


class AdaptiveMasking:
    def __init__(self, base_controller):
        self.base_controller = base_controller

    def generate(
        self,
        x,
        student_profile: StudentProfile = None,
        concept_embeddings=None,
        weakness_mask=None,
    ):
        base_x, base_mask = self.base_controller.generate(x)

        if weakness_mask is not None:
            expanded_mask = weakness_mask.unsqueeze(0).expand_as(base_mask)
            combined_mask = base_mask * (1 - expanded_mask)
            return x * combined_mask, combined_mask

        return base_x, base_mask


class ResourceRecommender:
    def __init__(self, resource_embeddings):
        self.resource_embeddings = resource_embeddings

    def recommend(self, student_embedding, top_k=5):
        sims = F.cosine_similarity(
            student_embedding.unsqueeze(0),
            self.resource_embeddings,
            dim=-1,
        )

        topk = torch.topk(sims, k=top_k)
        return topk.indices.tolist()


class PersonalizedJEPAWrapper:
    def __init__(
        self,
        jepa_model,
        memory_bank,
        adaptive_masker,
        concept_encoder=None,
        recommender=None,
    ):
        self.model = jepa_model
        self.memory = memory_bank
        self.masker = adaptive_masker
        self.concept_encoder = concept_encoder
        self.recommender = recommender

    def forward(
        self,
        x,
        student_id,
        concept_ids=None,
        importance_scores=None,
    ):
        profile = self.memory.get_or_create(student_id)

        concept_embeddings = None
        weakness_mask = None

        if self.concept_encoder is not None and concept_ids is not None:
            concept_embeddings = self.concept_encoder(x)

        if concept_embeddings is not None:
            weakness_estimator = WeaknessEstimator()
            weakness_mask = weakness_estimator.estimate(
                profile,
                concept_embeddings,
            )

        context, mask_c = self.masker.generate(
            x,
            profile,
            concept_embeddings,
            weakness_mask,
        )

        target, mask_t = self.masker.generate(
            x,
            profile,
            concept_embeddings,
            weakness_mask,
        )

        pred, z_t = self.model(context, target, mask_c)

        self.memory.update(student_id, pred.mean(dim=0))

        recommendations = None
        if self.recommender is not None:
            recommendations = self.recommender.recommend(
                profile.knowledge_state.to(pred.device)
            )

        return pred, z_t, recommendations

import torch
import torch.nn as nn
import torch.nn.functional as F
from collections import defaultdict


class ConceptGraph:
    def __init__(self):
        self.graph = defaultdict(set)
        self.reverse_graph = defaultdict(set)

    def add_edge(self, prerequisite, concept):
        self.graph[prerequisite].add(concept)
        self.reverse_graph[concept].add(prerequisite)

    def get_prerequisites(self, concept):
        return list(self.reverse_graph[concept])

    def get_dependents(self, concept):
        return list(self.graph[concept])

    def get_all_prerequisites(self, concept, visited=None):
        if visited is None:
            visited = set()

        for pre in self.reverse_graph[concept]:
            if pre not in visited:
                visited.add(pre)
                self.get_all_prerequisites(pre, visited)

        return list(visited)

    def topological_sort(self):
        indegree = defaultdict(int)
        for u in self.graph:
            for v in self.graph[u]:
                indegree[v] += 1

        queue = [u for u in self.graph if indegree[u] == 0]
        topo = []

        while queue:
            node = queue.pop(0)
            topo.append(node)
            for v in self.graph[node]:
                indegree[v] -= 1
                if indegree[v] == 0:
                    queue.append(v)

        return topo


class KnowledgeStateTracker:
    def __init__(self, num_concepts):
        self.num_concepts = num_concepts
        self.mastery = torch.zeros(num_concepts)
        self.attempts = torch.zeros(num_concepts)
        self.correct = torch.zeros(num_concepts)
        self.timestamps = torch.zeros(num_concepts)

    def update(self, concept_id, correct, timestamp, lr=0.1):
        self.attempts[concept_id] += 1
        if correct:
            self.correct[concept_id] += 1

        accuracy = self.correct[concept_id] / self.attempts[concept_id]
        self.mastery[concept_id] = (
            (1 - lr) * self.mastery[concept_id] + lr * accuracy
        )

        self.timestamps[concept_id] = timestamp

    def get_mastery(self):
        return self.mastery

    def get_weak_concepts(self, threshold=0.6):
        return (self.mastery < threshold).nonzero(as_tuple=True)[0].tolist()

    def decay(self, current_time, decay_rate=0.001):
        time_diff = current_time - self.timestamps
        decay_factor = torch.exp(-decay_rate * time_diff)
        self.mastery = self.mastery * decay_factor


class GraphAwareWeaknessEstimator:
    def __init__(self, concept_graph: ConceptGraph):
        self.graph = concept_graph

    def estimate(self, tracker: KnowledgeStateTracker):
        weak = tracker.get_weak_concepts()

        expanded_weak = set(weak)

        for concept in weak:
            prereqs = self.graph.get_all_prerequisites(concept)
            for p in prereqs:
                expanded_weak.add(p)

        return list(expanded_weak)


class PrerequisiteScheduler:
    def __init__(self, concept_graph: ConceptGraph):
        self.graph = concept_graph

    def get_next_concepts(self, tracker: KnowledgeStateTracker, top_k=5):
        mastery = tracker.get_mastery()

        candidates = []
        for concept in range(len(mastery)):
            prereqs = self.graph.get_prerequisites(concept)

            if all(mastery[p] > 0.7 for p in prereqs):
                candidates.append((concept, mastery[concept]))

        candidates.sort(key=lambda x: x[1])
        return [c[0] for c in candidates[:top_k]]


class GraphBasedRecommender:
    def __init__(self, resource_embeddings, concept_map):
        self.resource_embeddings = resource_embeddings
        self.concept_map = concept_map

    def recommend(self, student_embedding, weak_concepts, top_k=5):
        concept_mask = torch.zeros(self.resource_embeddings.shape[0])

        for idx, concept in enumerate(self.concept_map):
            if concept in weak_concepts:
                concept_mask[idx] = 1.0

        filtered_resources = self.resource_embeddings * concept_mask.unsqueeze(-1)

        sims = F.cosine_similarity(
            student_embedding.unsqueeze(0),
            filtered_resources,
            dim=-1,
        )

        topk = torch.topk(sims, k=top_k)
        return topk.indices.tolist()


class KnowledgeTracingModule:
    def __init__(self, num_concepts, concept_graph):
        self.trackers = {}
        self.graph = concept_graph
        self.num_concepts = num_concepts

    def get_tracker(self, student_id):
        if student_id not in self.trackers:
            self.trackers[student_id] = KnowledgeStateTracker(
                self.num_concepts
            )
        return self.trackers[student_id]

    def update(self, student_id, concept_id, correct, timestamp):
        tracker = self.get_tracker(student_id)
        tracker.update(concept_id, correct, timestamp)

    def get_weak_concepts(self, student_id):
        tracker = self.get_tracker(student_id)
        estimator = GraphAwareWeaknessEstimator(self.graph)
        return estimator.estimate(tracker)

    def get_learning_path(self, student_id, top_k=5):
        tracker = self.get_tracker(student_id)
        scheduler = PrerequisiteScheduler(self.graph)
        return scheduler.get_next_concepts(tracker, top_k)


class FullPersonalizationEngine:
    def __init__(
        self,
        jepa_wrapper,
        knowledge_tracer: KnowledgeTracingModule,
        recommender: GraphBasedRecommender,
    ):
        self.jepa = jepa_wrapper
        self.tracer = knowledge_tracer
        self.recommender = recommender

    def step(
        self,
        x,
        student_id,
        concept_id,
        correct,
        timestamp,
    ):
        self.tracer.update(student_id, concept_id, correct, timestamp)

        weak_concepts = self.tracer.get_weak_concepts(student_id)

        pred, z_t, _ = self.jepa.forward(
            x,
            student_id,
        )

        tracker = self.tracer.get_tracker(student_id)

        recommendations = self.recommender.recommend(
            tracker.mastery,
            weak_concepts,
        )

        learning_path = self.tracer.get_learning_path(student_id)

        return {
            "pred": pred,
            "target": z_t,
            "weak_concepts": weak_concepts,
            "recommendations": recommendations,
            "learning_path": learning_path,
        }

  import torch
from torch.utils.data import Dataset, DataLoader
import random


class Resource:
    def __init__(self, resource_id, embedding, concept_ids, difficulty):
        self.resource_id = resource_id
        self.embedding = embedding
        self.concept_ids = concept_ids
        self.difficulty = difficulty


class ResourceBank:
    def __init__(self):
        self.resources = []

    def add(self, resource: Resource):
        self.resources.append(resource)

    def get_embeddings(self):
        return torch.stack([r.embedding for r in self.resources])

    def get_concept_map(self):
        return [r.concept_ids for r in self.resources]

    def sample_by_concept(self, concept_id, k=5):
        filtered = [r for r in self.resources if concept_id in r.concept_ids]
        return random.sample(filtered, min(k, len(filtered)))


class ConceptTagger:
    def __init__(self, num_concepts):
        self.num_concepts = num_concepts

    def tag(self, raw_input):
        concept_id = hash(str(raw_input)) % self.num_concepts
        return [concept_id]


class StudentInteraction:
    def __init__(self, student_id, input_vec, concept_id, correct, timestamp):
        self.student_id = student_id
        self.input_vec = input_vec
        self.concept_id = concept_id
        self.correct = correct
        self.timestamp = timestamp


class LearningDataset(Dataset):
    def __init__(self, interactions):
        self.data = interactions

    def __len__(self):
        return len(self.data)

    def __getitem__(self, idx):
        item = self.data[idx]
        return (
            item.student_id,
            torch.tensor(item.input_vec, dtype=torch.float32),
            item.concept_id,
            item.correct,
            item.timestamp,
        )


class StudentBatchCollator:
    def __init__(self, batch_size):
        self.batch_size = batch_size

    def __call__(self, batch):
        student_ids = [b[0] for b in batch]
        x = torch.stack([b[1] for b in batch])
        concept_ids = [b[2] for b in batch]
        correct = [b[3] for b in batch]
        timestamps = [b[4] for b in batch]

        return {
            "student_ids": student_ids,
            "inputs": x,
            "concept_ids": concept_ids,
            "correct": correct,
            "timestamps": timestamps,
        }


class PipelineTrainer:
    def __init__(
        self,
        personalization_engine,
        jepa_trainer,
    ):
        self.engine = personalization_engine
        self.trainer = jepa_trainer

    def train_step(self, batch):
        x = batch["inputs"]
        student_ids = batch["student_ids"]
        concept_ids = batch["concept_ids"]
        correct = batch["correct"]
        timestamps = batch["timestamps"]

        total_loss = 0

        for i in range(len(student_ids)):
            sid = student_ids[i]
            xi = x[i].unsqueeze(0)
            cid = concept_ids[i]
            corr = correct[i]
            ts = timestamps[i]

            result = self.engine.step(
                xi,
                sid,
                cid,
                corr,
                ts,
            )

            loss, _ = self.trainer.train_step(xi)

            total_loss += loss

        return total_loss / len(student_ids)

    def train(self, dataloader, epochs=10):
        for epoch in range(epochs):
            epoch_loss = 0

            for batch in dataloader:
                loss = self.train_step(batch)
                epoch_loss += loss

            print(f"[Pipeline] Epoch {epoch+1}: Loss {epoch_loss:.4f}")


class InferenceEngine:
    def __init__(self, personalization_engine):
        self.engine = personalization_engine

    def recommend_for_student(self, student_id):
        weak = self.engine.tracer.get_weak_concepts(student_id)
        path = self.engine.tracer.get_learning_path(student_id)

        tracker = self.engine.tracer.get_tracker(student_id)

        recs = self.engine.recommender.recommend(
            tracker.mastery,
            weak,
        )

        return {
            "weak_concepts": weak,
            "learning_path": path,
            "recommendations": recs,
        }


class DataPipelineBuilder:
    def __init__(
        self,
        num_concepts,
        input_dim,
    ):
        self.num_concepts = num_concepts
        self.input_dim = input_dim
        self.tagger = ConceptTagger(num_concepts)

    def generate_synthetic_data(self, num_students=100, samples_per_student=50):
        data = []

        for s in range(num_students):
            student_id = f"student_{s}"

            for t in range(samples_per_student):
                x = torch.randn(self.input_dim)

                concept_ids = self.tagger.tag(x)
                concept_id = concept_ids[0]

                difficulty = concept_id % 3

                prob_correct = 0.8 - 0.2 * difficulty
                correct = random.random() < prob_correct

                timestamp = t

                data.append(
                    StudentInteraction(
                        student_id,
                        x,
                        concept_id,
                        correct,
                        timestamp,
                    )
                )

        return data

    def build_dataloader(self, interactions, batch_size=32):
        dataset = LearningDataset(interactions)
        collator = StudentBatchCollator(batch_size)

        return DataLoader(
            dataset,
            batch_size=batch_size,
            shuffle=True,
            collate_fn=collator,
        )

  import torch
import time
import numpy as np
from collections import defaultdict


class MetricsTracker:
    def __init__(self):
        self.metrics = defaultdict(list)

    def log(self, key, value):
        self.metrics[key].append(value)

    def mean(self, key):
        return np.mean(self.metrics[key]) if key in self.metrics else 0

    def summary(self):
        return {k: self.mean(k) for k in self.metrics}


class LearningGainMetric:
    def compute(self, initial_mastery, final_mastery):
        return (final_mastery - initial_mastery).mean().item()


class RecommendationAccuracy:
    def compute(self, recommended, actual_weak):
        if len(recommended) == 0:
            return 0.0

        hits = sum([1 for r in recommended if r in actual_weak])
        return hits / len(recommended)


class PathAlignmentScore:
    def compute(self, recommended_path, optimal_path):
        if len(optimal_path) == 0:
            return 0.0

        overlap = len(set(recommended_path) & set(optimal_path))
        return overlap / len(optimal_path)


class CollapseMetric:
    def compute(self, embeddings):
        var = embeddings.var(dim=0).mean().item()
        return var


class SystemEvaluator:
    def __init__(
        self,
        personalization_engine,
        dataset,
    ):
        self.engine = personalization_engine
        self.dataset = dataset

        self.metrics = MetricsTracker()

        self.learning_metric = LearningGainMetric()
        self.rec_metric = RecommendationAccuracy()
        self.path_metric = PathAlignmentScore()
        self.collapse_metric = CollapseMetric()

    def evaluate_student(self, student_id):
        tracker = self.engine.tracer.get_tracker(student_id)

        initial_mastery = tracker.mastery.clone()

        weak_before = self.engine.tracer.get_weak_concepts(student_id)
        path_before = self.engine.tracer.get_learning_path(student_id)

        tracker.mastery += torch.rand_like(tracker.mastery) * 0.1

        final_mastery = tracker.mastery

        weak_after = self.engine.tracer.get_weak_concepts(student_id)

        learning_gain = self.learning_metric.compute(
            initial_mastery, final_mastery
        )

        recs = self.engine.recommender.recommend(
            tracker.mastery,
            weak_after,
        )

        rec_acc = self.rec_metric.compute(recs, weak_after)

        path_after = self.engine.tracer.get_learning_path(student_id)
        path_score = self.path_metric.compute(path_after, path_before)

        self.metrics.log("learning_gain", learning_gain)
        self.metrics.log("rec_accuracy", rec_acc)
        self.metrics.log("path_alignment", path_score)

    def evaluate_embeddings(self, embeddings):
        collapse_score = self.collapse_metric.compute(embeddings)
        self.metrics.log("collapse_score", collapse_score)

    def run(self):
        students = list(self.engine.tracer.trackers.keys())

        for sid in students:
            self.evaluate_student(sid)

        return self.metrics.summary()


class BenchmarkRunner:
    def __init__(self, trainer, evaluator):
        self.trainer = trainer
        self.evaluator = evaluator

    def run(self, dataloader, epochs=5):
        times = []

        for epoch in range(epochs):
            start = time.time()

            loss = self.trainer.train_epoch(dataloader)

            end = time.time()

            times.append(end - start)

            print(f"[Benchmark] Epoch {epoch+1} Loss: {loss:.4f}")

        eval_results = self.evaluator.run()

        print("\n=== Evaluation Results ===")
        for k, v in eval_results.items():
            print(f"{k}: {v:.4f}")

        print("\n=== Performance ===")
        print(f"Avg Epoch Time: {np.mean(times):.2f}s")

        return {
            "eval": eval_results,
            "time": np.mean(times),
        }


class VectorizedTrainer:
    def __init__(self, trainer):
        self.trainer = trainer

    def train_step_batch(self, batch):
        x = batch["inputs"].to(self.trainer.cfg.device)

        context, target, mask_c, _ = build_jepa_batch(
            x,
            self.trainer.mask_controller,
        )

        pred, z_t = self.trainer.model(context, target, mask_c)

        loss = self.trainer.loss_fn(pred, z_t)

        self.trainer.optimizer.zero_grad()
        loss.backward()
        self.trainer.optimizer.step()

        return loss.item()


class SpeedProfiler:
    def __init__(self):
        self.times = defaultdict(list)

    def track(self, name, fn, *args, **kwargs):
        start = time.time()
        result = fn(*args, **kwargs)
        end = time.time()

        self.times[name].append(end - start)
        return result

    def report(self):
        return {
            k: np.mean(v)
            for k, v in self.times.items()
        }


class AblationStudy:
    def __init__(self, base_model, configs):
        self.base_model = base_model
        self.configs = configs

    def run(self, dataloader):
        results = {}

        for name, cfg in self.configs.items():
            print(f"\n[Ablation] Testing: {name}")

            model = self.base_model(cfg)

            loss = 0
            for batch in dataloader:
                x = batch["inputs"]
                pred, z_t = model(x, x)
                loss += ((pred - z_t) ** 2).mean().item()

            results[name] = loss

        return results

  from fastapi import FastAPI
from pydantic import BaseModel
import torch
import uvicorn


app = FastAPI()


# -------------------------
# GLOBAL SYSTEM (LOAD ONCE)
# -------------------------

class SystemContainer:
    def __init__(
        self,
        pipeline_trainer,
        inference_engine,
        data_builder,
        benchmark_runner=None,
    ):
        self.trainer = pipeline_trainer
        self.inference = inference_engine
        self.data_builder = data_builder
        self.benchmark = benchmark_runner

        self.is_training = False


SYSTEM = None


# -------------------------
# REQUEST SCHEMAS
# -------------------------

class TrainRequest(BaseModel):
    num_students: int = 100
    samples_per_student: int = 50
    epochs: int = 5


class InteractionRequest(BaseModel):
    student_id: str
    input_vec: list
    concept_id: int
    correct: bool
    timestamp: int


class RecommendRequest(BaseModel):
    student_id: str


# -------------------------
# ENDPOINTS
# -------------------------

@app.post("/train")
def train(req: TrainRequest):
    global SYSTEM

    SYSTEM.is_training = True

    interactions = SYSTEM.data_builder.generate_synthetic_data(
        req.num_students,
        req.samples_per_student,
    )

    dataloader = SYSTEM.data_builder.build_dataloader(
        interactions,
        batch_size=32,
    )

    SYSTEM.trainer.train(dataloader, epochs=req.epochs)

    SYSTEM.is_training = False

    return {"status": "training_complete"}


@app.post("/interact")
def interact(req: InteractionRequest):
    global SYSTEM

    x = torch.tensor(req.input_vec).float().unsqueeze(0)

    result = SYSTEM.trainer.engine.step(
        x,
        req.student_id,
        req.concept_id,
        req.correct,
        req.timestamp,
    )

    return {
        "weak_concepts": result["weak_concepts"],
        "learning_path": result["learning_path"],
        "recommendations": result["recommendations"],
    }


@app.post("/recommend")
def recommend(req: RecommendRequest):
    global SYSTEM

    result = SYSTEM.inference.recommend_for_student(req.student_id)

    return result


@app.get("/student_state/{student_id}")
def student_state(student_id: str):
    global SYSTEM

    tracker = SYSTEM.inference.engine.tracer.get_tracker(student_id)

    return {
        "mastery": tracker.mastery.tolist(),
        "weak_concepts": tracker.get_weak_concepts(),
    }


@app.get("/benchmark")
def benchmark():
    global SYSTEM

    if SYSTEM.benchmark is None:
        return {"error": "No benchmark configured"}

    interactions = SYSTEM.data_builder.generate_synthetic_data(50, 20)
    dataloader = SYSTEM.data_builder.build_dataloader(interactions)

    results = SYSTEM.benchmark.run(dataloader)

    return results


@app.get("/health")
def health():
    return {
        "status": "running",
        "training": SYSTEM.is_training,
    }


# -------------------------
# INITIALIZATION FUNCTION
# -------------------------

def initialize_system(
    pipeline_trainer,
    inference_engine,
    data_builder,
    benchmark_runner=None,
):
    global SYSTEM

    SYSTEM = SystemContainer(
        pipeline_trainer,
        inference_engine,
        data_builder,
        benchmark_runner,
    )


# -------------------------
# RUN SERVER
# -------------------------

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
