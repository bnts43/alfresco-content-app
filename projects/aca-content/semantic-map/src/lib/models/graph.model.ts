export interface GraphNode {
  id: string;
  alfrescoNodeId: string;
  label: string;
  x: number;
  y: number;
  size: number;
  color: string;
  themeId: string;
  themeName: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  weight: number;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface Theme {
  id: string;
  name: string;
  nameFr: string;
  description: string;
  color: string;
  documentCount: number;
}

export interface DocumentDetail {
  id: string;
  alfrescoNodeId: string;
  name: string;
  path: string;
  summaryFr: string;
  summaryEn: string;
  keyFindings: string[];
  themes: Theme[];
  x: number;
  y: number;
}

export interface SimilarDocument {
  id: string;
  alfrescoNodeId: string;
  name: string;
  similarityScore: number;
}

export interface ProcessingJob {
  jobId: string;
  jobType: string;
  status: string;
  totalDocuments: number;
  processedCount: number;
  failedCount: number;
  startedAt: string;
  completedAt: string;
}
