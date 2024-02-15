import { RecordMetadata } from '@pinecone-database/pinecone';

export class DataIndex {
  embeddings: number[];
  metadata: IndexMetadata;
}

export interface IndexMetadata extends RecordMetadata {
  source: string;
  text: string;
  tokenCount: number;
}
