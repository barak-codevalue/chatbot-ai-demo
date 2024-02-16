import { RecordMetadata } from '@pinecone-database/pinecone';

export interface DataIndex {
  embeddings: number[];
  metadata: IndexMetadata;
}

export interface IndexMetadata extends RecordMetadata {
  source: string;
  text: string;
  tokenCount: number;
}
