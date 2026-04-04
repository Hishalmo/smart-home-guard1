from pydantic import BaseModel

from backend.models.enums import ClassLabel


class TopSourceIp(BaseModel):
    ip: str
    count: int


class FlowResult(BaseModel):
    id: str
    source_ip: str
    destination_ip: str
    source_port: int
    destination_port: int
    protocol_name: str
    flow_duration: float
    rate: float
    fin_flag_number: int
    syn_flag_number: int
    rst_flag_number: int
    psh_flag_number: int
    ack_flag_number: int
    urg_flag_number: int
    ece_flag_number: int
    cwr_flag_number: int
    predicted_category: ClassLabel
    confidence: float
    features: dict


class AnalysisSummary(BaseModel):
    total_flows: int
    benign_count: int
    spoofing_count: int
    recon_count: int
    brute_force_count: int
    protocol_counts: dict[str, int]
    top_source_ips: list[TopSourceIp]


class AnalyzeResponse(BaseModel):
    session_id: str
    flows: list[FlowResult]
    summary: AnalysisSummary
    processing_time_ms: float
