import uuid

from fastapi import APIRouter, Depends, UploadFile, File

from backend.middleware.auth import verify_token
from backend.models.enums import ClassLabel
from backend.models.schemas import (
    AnalyzeResponse,
    AnalysisSummary,
    FlowResult,
    TopSourceIp,
)

router = APIRouter()


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_pcap(
    file: UploadFile = File(...)
) -> AnalyzeResponse:
    """returns mock data. later"""
    session_id = str(uuid.uuid4())

    mock_flow = FlowResult(
        id=str(uuid.uuid4()),
        source_ip="192.168.1.10",
        destination_ip="192.168.1.1",
        source_port=54321,
        destination_port=80,
        protocol_name="TCP",
        flow_duration=1.23,
        rate=45.6,
        fin_flag_number=0,
        syn_flag_number=1,
        rst_flag_number=0,
        psh_flag_number=0,
        ack_flag_number=1,
        urg_flag_number=0,
        ece_flag_number=0,
        cwr_flag_number=0,
        predicted_category=ClassLabel.BENIGN,
        confidence=0.97,
        features={},
    )

    summary = AnalysisSummary(
        total_flows=1,
        benign_count=1,
        spoofing_count=0,
        recon_count=0,
        brute_force_count=0,
        protocol_counts={"TCP": 1},
        top_source_ips=[TopSourceIp(ip="192.168.1.10", count=1)],
    )

    return AnalyzeResponse(
        session_id=session_id,
        flows=[mock_flow],
        summary=summary,
        processing_time_ms=0.0,
    )
