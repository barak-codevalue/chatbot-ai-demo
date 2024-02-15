export class DataIndex {
  embeddings: number[];
  metadata: IndexMetadata;
}

export interface IndexMetadata {
  source: string;
  text: string;
  tokenCount: number;
}
