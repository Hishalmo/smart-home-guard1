"""Validate uploaded PCAP files before processing."""

from __future__ import annotations

from pathlib import Path

from fastapi import HTTPException

MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024  # 2 GiB

# Magic bytes for supported formats
_PCAP_MAGIC = b"\xd4\xc3\xb2\xa1"
_PCAP_MAGIC_SWAPPED = b"\xa1\xb2\xc3\xd4"
_PCAPNG_MAGIC = b"\x0a\x0d\x0d\x0a"

_VALID_EXTENSIONS = {".pcap", ".pcapng"}


def validate_pcap(file_path: Path, filename: str) -> None:
    """Raise HTTPException(400) if the file is not a valid PCAP upload.

    Validates against the file on disk so large files are never fully
    loaded into memory just for validation.
    """
    # Check 1 — file size
    size = file_path.stat().st_size
    if size > MAX_FILE_SIZE:
        raise HTTPException(
            400,
            detail=f"File too large ({size / (1024**3):.1f} GiB). Maximum is 2 GiB.",
        )

    # Check 2 — file extension
    ext = Path(filename).suffix.lower()
    if ext not in _VALID_EXTENSIONS:
        raise HTTPException(
            400,
            detail=f"Unsupported file extension '{ext}'. Must be .pcap or .pcapng.",
        )

    # Check 3 — magic bytes
    with open(file_path, "rb") as f:
        magic = f.read(4)

    if magic not in (_PCAP_MAGIC, _PCAP_MAGIC_SWAPPED, _PCAPNG_MAGIC):
        raise HTTPException(
            400,
            detail="File does not appear to be a valid PCAP or PCAPNG file.",
        )
