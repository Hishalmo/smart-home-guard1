from enum import Enum


class ClassLabel(str, Enum):
    BENIGN = "Benign"
    BRUTE_FORCE = "BruteForce"
    RECON = "Recon"
    SPOOFING = "Spoofing"


class AlertSeverity(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    INFO = "info"


CATEGORY_SEVERITY: dict[ClassLabel, AlertSeverity] = {
    ClassLabel.BRUTE_FORCE: AlertSeverity.CRITICAL,
    ClassLabel.SPOOFING: AlertSeverity.HIGH,
    ClassLabel.RECON: AlertSeverity.MEDIUM,
    ClassLabel.BENIGN: AlertSeverity.INFO,
}
