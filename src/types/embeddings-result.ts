export interface EmbeddingsResult {
  embeddingsItems: EmbeddingsItems[];
  tokenUsage?: number;
}

export interface EmbeddingsItems {
  index: number;
  embeddings: number[];
}
