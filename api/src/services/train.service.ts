import { Injectable } from '@nestjs/common';
import { encode } from 'gpt-3-encoder';
import { AiService } from 'src/core/ai.service';
import { IndexService } from 'src/core/index.service';
import { ScraperService } from 'src/core/scraper.service';
import { DataIndex } from 'src/types/data-index';
import { TextChunk } from 'src/types/text-chunk';

@Injectable()
export class TrainService {
  constructor(
    private readonly scraperService: ScraperService,
    private readonly aiService: AiService,
    private readonly indexService: IndexService,
  ) {}
  async indexSite(url: string) {
    const paragraphs = await this.scraperService.scrapeWebsite(url);
    await this.indexText(paragraphs);
  }

  async indexDocument(
    buffer: Buffer,
    documentName: string,
    documentMimetype: string,
  ) {
    if (!documentMimetype.includes('text')) {
      throw new Error('Invalid file type');
    }
    const text = buffer.toString();
    const paragraphs: TextChunk[] = text
      .split(/\r?\n\s*\r?\n/)
      .map((p) => ({
        source: documentName,
        text: p,
      }))
      .filter((p) => p.text.length > 0);

    await this.indexText(paragraphs);
  }

  private async indexText(textChunks: TextChunk[]) {
    const uniqueSources = Array.from(new Set(textChunks.map((t) => t.source)));
    const textArray = textChunks.map((p) => p.text);
    const embeddings = await this.aiService.createEmbeddings(textArray);
    const indexedParagraphs: DataIndex[] = embeddings.embeddingsItems.map(
      (item) => {
        const paragraphText = textChunks[item.index].text;
        return {
          embeddings: item.embeddings,
          metadata: {
            text: paragraphText,
            tokenCount: encode(paragraphText).length,
            source: textChunks[item.index].source,
          },
        };
      },
    );

    await this.indexService.removeIndexBySource(uniqueSources);
    console.info('Indexing data');
    await this.indexService.indexData(indexedParagraphs);
  }
}
