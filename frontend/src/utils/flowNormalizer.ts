import type { NetworkFlow } from '@/types'

const FIELD_MAP: Record<string, string> = {
  id: 'id',
  session_id: 'sessionId',
  captured_at: 'timestamp',
  source_ip: 'sourceIp',
  destination_ip: 'destinationIp',
  source_port: 'sourcePort',
  destination_port: 'destinationPort',
  protocol_type: 'protocolType',
  protocol_name: 'protocolName',
  flow_duration: 'flowDuration',
  header_length: 'headerLength',
  rate: 'rate',
  fin_flag_number: 'finFlagNumber',
  syn_flag_number: 'synFlagNumber',
  rst_flag_number: 'rstFlagNumber',
  psh_flag_number: 'pshFlagNumber',
  ack_flag_number: 'ackFlagNumber',
  urg_flag_number: 'urgFlagNumber',
  ece_flag_number: 'eceFlagNumber',
  cwr_flag_number: 'cwrFlagNumber',
  ack_count: 'ackCount',
  syn_count: 'synCount',
  fin_count: 'finCount',
  urg_count: 'urgCount',
  rst_count: 'rstCount',
  max: 'maxLength',
  min: 'minLength',
  tot_sum: 'sumLength',
  avg: 'avgLength',
  std: 'stdLength',
  mqtt: 'mqtt',
  coap: 'coap',
  http: 'http',
  https: 'https',
  dns: 'dns',
  ssh: 'ssh',
  tcp: 'tcp',
  udp: 'udp',
  arp: 'arp',
  icmp: 'icmp',
  igmp: 'igmp',
  tot_size: 'totSize',
  iat: 'iat',
  magnitue: 'magnitude',  // maps Python misspelling to correct TS field
  magnitude: 'magnitude',
  covariance: 'covariance',
  variance: 'variance',
  flow_idle_time: 'flowIdleTime',
  flow_active_time: 'flowActiveTime',
  predicted_category: 'prediction',
  confidence: 'confidence',
}

export function normalizeFlow(raw: Record<string, unknown>): NetworkFlow {
  const result: Record<string, unknown> = {}

  for (const [rawKey, tsKey] of Object.entries(FIELD_MAP)) {
    if (rawKey in raw) {
      result[tsKey] = raw[rawKey]
    }
  }

  // Assemble the prediction object from flat fields
  if ('predicted_category' in raw || 'confidence' in raw) {
    result.prediction = {
      category: raw.predicted_category ?? raw.category ?? 'Benign',
      confidence: Number(raw.confidence ?? 0),
    }
  }

  return result as unknown as NetworkFlow
}
