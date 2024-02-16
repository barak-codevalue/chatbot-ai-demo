import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pinecone, PineconeRecord } from '@pinecone-database/pinecone';
import axios from 'axios';
import { DataIndex, IndexMetadata } from 'src/types/data-index';

@Injectable()
export class IndexService {
  pinecone: Pinecone;
  indexName: string;
  apiKey: string;
  indexHost: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('PINECONE_API_KEY');
    this.indexName = this.configService.get<string>('PINECONE_INDEX_NAME');
    this.indexHost = this.configService.get<string>('PINECONE_INDEX_HOST');
    this.pinecone = new Pinecone({
      apiKey: this.apiKey,
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
    const uniqueSources = Array.from(new Set(sources));
    const result = await Promise.allSettled(
      uniqueSources.map(async (source) => {
        const index = this.pinecone.index<IndexMetadata>(this.indexName);
        let paginationToken: string | undefined = undefined;
        do {
          const { ids, next } = await this.getPineconeRecordsWithPrefix(
            source,
            paginationToken,
          );
          if (!ids.length) {
            break;
          }
          console.info('Deleting records:', ids.length);
          await index.deleteMany(ids);
          console.info('Deleting next:', next);
          paginationToken = next;
        } while (paginationToken);
      }),
    );
    result.forEach((r) => {
      if (r.status === 'rejected') {
        console.error('Error removing index:', r.reason);
      }
    });
  }

  async similaritySearch(embeddings: number[]): Promise<string[]> {
    const index = this.pinecone.index(this.indexName);
    const result = await index.query({
      vector: embeddings,
      topK: 3,
      includeMetadata: true,
    });
    console.info('-----------------result.matches-----------------');
    console.info(result.matches);
    console.info('------------------------------------------------');
    return result.matches.map((record) => record.metadata.text as string);
  }

  private async getPineconeRecordsWithPrefix(
    prefix: string,
    paginationToken: string | undefined = undefined,
  ) {
    const limit = 100;
    let url = `${this.indexHost}/vectors/list?prefix=${prefix}&limit=${limit}`;
    if (paginationToken) {
      url += `&paginationToken=${paginationToken}`;
    }

    const response = await axios.get<PineconeResponse>(url, {
      headers: {
        'Api-Key': this.apiKey,
      },
    });
    const ids = response.data.vectors.map((vector) => vector.id);
    const next =
      ids.length < limit ? undefined : response.data.pagination?.next;
    return { ids, next };
  }
}

interface PineconeResponse {
  vectors: { id: string }[];
  pagination?: { next: string };
  namespace: string;
  usage: {
    readUnits: number;
  };
}
