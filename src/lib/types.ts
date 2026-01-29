export type AnomalyStatus = 'Pending Review' | 'Confirmed' | 'Dismissed';

export type Anomaly = {
  id: string;
  type: string;
  description: string;
  date: string;
  status: AnomalyStatus;
  riskScore: number;
  entity: string;
  details: {
    transactionId?: string;
    amount?: number;
    vendor?: string;
    violatedPatterns: string[];
    supportingEvidence: string[];
    transformationLogs: string[];
    sourceDocuments: string[];
  };
};

export type IngestionStatus = 'Completed' | 'Processing' | 'Failed';

export type Ingestion = {
  id: string;
  source: string;
  type: 'API' | 'File' | 'SFTP';
  fileName?: string;
  date: string;
  status: IngestionStatus;
  recordCount: number;
  hash: string;
};

export type UploadedDoc = {
  id: string;
  name: string;
  type: 'File';
  date: string;
  status: IngestionStatus;
}

export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
};

export type RiskHeatmapData = {
  process: string;
  risk: string;
  value: number;
}[];

export type TrendAnalysisData = {
  date: string;
  'Pending Review': number;
  Confirmed: number;
  Dismissed: number;
}[];

export type AuditStatus = 'CREATED' | 'READY' | 'RUNNING' | 'COMPLETED' | 'FAILED';
