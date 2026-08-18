from dataclasses import dataclass
from typing import Tuple

@dataclass(frozen=True)
class TensorSpec:
    axes: Tuple[str, ...]
    shape: Tuple[int | None, ...]
    semantic_type: str

    def compatible_with(self, other: 'TensorSpec') -> bool:
        if self.semantic_type != other.semantic_type or self.axes != other.axes:
            return False
        if len(self.shape) != len(other.shape):
            return False
        return all(a is None or b is None or a == b for a, b in zip(self.shape, other.shape))

@dataclass(frozen=True)
class ComponentSpec:
    name: str
    input_spec: TensorSpec
    output_spec: TensorSpec

class GraphValidationError(ValueError):
    pass

def validate_chain(components: list[ComponentSpec]) -> None:
    if not components:
        raise GraphValidationError('graph must contain at least one component')
    for left, right in zip(components, components[1:]):
        if not left.output_spec.compatible_with(right.input_spec):
            raise GraphValidationError(
                f'incompatible edge {left.name}->{right.name}: '
                f'{left.output_spec} != {right.input_spec}'
            )
