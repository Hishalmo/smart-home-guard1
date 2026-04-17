export type ClassLabel = 'Benign' | 'BruteForce' | 'Recon' | 'Spoofing'

export interface PredictionResult {
  category: ClassLabel
  confidence: number
}
