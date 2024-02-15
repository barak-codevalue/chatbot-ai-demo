import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Pinecone,
  PineconeRecord,
  ScoredPineconeRecord,
} from '@pinecone-database/pinecone';
import { DataIndex, IndexMetadata } from 'src/types/data-index';

@Injectable()
export class IndexService {
  pinecone: Pinecone;
  indexName: string;
  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('PINECONE_API_KEY');
    this.indexName = this.configService.get<string>('PINECONE_INDEX_NAME');
    this.pinecone = new Pinecone({
      apiKey,
    });
  }
  async indexData(dataIndexes: DataIndex[]): Promise<void> {
    const index = this.pinecone.index(this.indexName);
    const data: PineconeRecord[] = dataIndexes.map((dataIndex, index) => ({
      values: dataIndex.embeddings,
      id: `${dataIndex.metadata.source}#chunk${index}`,
      metadata: {
        text: dataIndex.metadata.text,
        source: dataIndex.metadata.source,
      },
    }));
    await index.upsert(data);
  }

  async removeIndexBySource(sources: string[]): Promise<void> {
    const index = this.pinecone.index(this.indexName);
    await index.deleteMany({
      filter: {
        source: {
          $in: sources,
        },
      },
    });
  }

  async similaritySearch(embeddings: number[]): Promise<string[]> {
    const index = this.pinecone.index(this.indexName);
    const result = await index.query({
      vector: embeddings,
      topK: 3,
      includeMetadata: true,
    });
    console.log('-----------------result.matches-----------------');
    console.log(result.matches);
    console.log('------------------------------------------------');
    return result.matches.map((record) => record.metadata.text as string);
  }
}
