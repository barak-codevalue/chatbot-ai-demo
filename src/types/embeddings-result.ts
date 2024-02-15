export class EmbeddingsResult {
  embeddingsItems: EmbeddingsItems[];
  tokenUsage?: number;
}

export class EmbeddingsItems {
  index: number;
  embeddings: number[];
}
