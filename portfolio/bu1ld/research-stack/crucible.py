from dataclasses import dataclass

@dataclass(frozen=True)
class BenchmarkSpec:
    name: str
    primary_metric: str
    baselines: tuple[str, ...]
    seed_policy: str
    artifact_policy: str

    def validate(self):
        if not self.primary_metric:
            raise ValueError('primary_metric required')
        if not self.baselines:
            raise ValueError('at least one baseline required')
        if self.seed_policy not in {'fixed', 'declared', 'deterministic'}:
            raise ValueError('invalid seed policy')
        return True

WEATHER_JEPA_SMOKE = BenchmarkSpec(
    name='weather-jepa-smoke',
    primary_metric='synthetic_smoke_pass',
    baselines=('persistence',),
    seed_policy='deterministic',
    artifact_policy='retain-config-and-output',
)
