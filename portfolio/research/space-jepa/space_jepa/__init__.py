"""Space-JEPA: pre-outcome spacecraft telemetry representation learning baseline."""

from .config import SpaceJEPAConfig
from .model import SpaceJEPA

__all__ = ["SpaceJEPA", "SpaceJEPAConfig"]
