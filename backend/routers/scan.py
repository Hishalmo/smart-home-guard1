from pathlib import Path

from fastapi import APIRouter, Depends, Header, HTTPException

from backend.middleware.auth import verify_token

router = APIRouter()


def _read_interfaces() -> list[dict]:
    try:
        lines = Path("/proc/net/dev").read_text().splitlines()
    except OSError:
        raise HTTPException(status_code=503, detail="Interface discovery not available on this platform")

    interfaces = []
    for line in lines[2:]:  # skip 2-line header
        name = line.split(":")[0].strip()
        if not name or name == "lo":
            continue

        name_lower = name.lower()
        if any(k in name_lower for k in ("wlan", "wifi", "wlp")):
            description = "Wireless"
        elif any(k in name_lower for k in ("eth", "enp", "eno", "ens")):
            description = "Ethernet"
        elif any(k in name_lower for k in ("docker", "br-", "veth", "virbr")):
            description = "Virtual/Docker"
        else:
            description = "Network Interface"

        interfaces.append({"name": name, "description": description})

    return interfaces


@router.get("/scan/interfaces")
async def list_interfaces(
    authorization: str | None = Header(default=None),
    claims: dict = Depends(verify_token),
) -> list[dict]:
    return _read_interfaces()
