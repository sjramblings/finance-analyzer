import { BaseParser } from './BaseParser.js';
import { ChaseParser } from './ChaseParser.js';

export class ParserFactory {
  private parsers: BaseParser[] = [
    new ChaseParser(),
    // Add more parsers here as they're implemented
    // new BankOfAmericaParser(),
    // new WellsFargoParser(),
    // new AmexParser(),
  ];

  detectParser(csvContent: string): BaseParser | null {
    for (const parser of this.parsers) {
      if (parser.detectFormat(csvContent)) {
        return parser;
      }
    }
    return null;
  }

  parseCSV(csvContent: string): { parser: string; transactions: any[] } {
    const parser = this.detectParser(csvContent);

    if (!parser) {
      throw new Error(
        'Unable to detect bank format. Please ensure your CSV is from a supported bank.'
      );
    }

    const transactions = parser.parse(csvContent);

    return {
      parser: parser.bankName,
      transactions,
    };
  }

  getSupportedBanks(): string[] {
    return this.parsers.map(p => p.bankName);
  }
}

export const parserFactory = new ParserFactory();
