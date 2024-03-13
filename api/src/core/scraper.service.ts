import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { load } from 'cheerio';
import { TextChunk } from 'src/types/text-chunk';

@Injectable()
export class ScraperService {
  async scrapeWebsite(url: string): Promise<TextChunk[]> {
    const links = await this.getLinks(url, url, 1);
    const paragraphs = await this.scrape(links);
    return paragraphs;
  }

  private async scrape(urls: string[]): Promise<TextChunk[]> {
    const paragraphs: TextChunk[] = [];
    if (!urls || urls.length === 0) return paragraphs;
    for (const url of urls) {
      try {
        const { data } = await axios.get(url);
        const $ = load(data);

        $('p').each((_index, element) => {
          const paragraph = $(element).text();
          const words = paragraph.split(' ');
          if (words.length < 4) return;
          paragraphs.push({
            source: url,
            text: paragraph,
          });
        });
      } catch (error) {
        console.error(`Error scraping ${url}: ${error}`);
      }
    }
    return paragraphs;
  }

  private async getLinks(
    baseUrl: string,
    currentUrl: string,
    depth: number,
  ): Promise<string[]> {
    if (!depth || depth === 0) return [];

    const baseHost = new URL(baseUrl);
    try {
      const { data } = await axios.get(currentUrl);
      const $ = load(data);
      const links: string[] = [];

      $('a').each((index, element) => {
        const link = $(element).attr('href');
        if (link) {
          try {
            const linkHost = new URL(link);

            if (linkHost.host === baseHost.host) {
              links.push(link);
            }
          } catch (error) {
            console.error(`Error parsing ${link}: ${error}`);
          }
        }
      });

      const uniqueLinks = Array.from(new Set(links));
      for (const link of uniqueLinks) {
        const deeperLinks = await this.getLinks(baseUrl, link, depth - 1);
        deeperLinks.forEach((l) => links.push(l));
      }

      return Array.from(new Set(links));
    } catch (error) {
      console.error(`Error fetching links: ${error}`);
      return [];
    }
  }
}
