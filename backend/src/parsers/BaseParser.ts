export interface ParsedTransaction {
  date: Date;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
  originalDescription: string;
  merchant?: string;
  category?: string;
}

export abstract class BaseParser {
  abstract bankName: string;
  abstract detectFormat(csvContent: string): boolean;
  abstract parse(csvContent: string): ParsedTransaction[];

  protected normalizeAmount(amount: string): number {
    // Remove currency symbols, commas, and handle parentheses for negative amounts
    let normalized = amount.replace(/[$,\s]/g, '');

    // Handle parentheses notation for negative (e.g., "(100.00)" = -100.00)
    if (normalized.startsWith('(') && normalized.endsWith(')')) {
      normalized = '-' + normalized.slice(1, -1);
    }

    return parseFloat(normalized);
  }

  protected parseDate(dateString: string): Date {
    // Try multiple date formats
    const formats = [
      // MM/DD/YYYY
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
      // YYYY-MM-DD
      /^(\d{4})-(\d{1,2})-(\d{1,2})$/,
      // MM-DD-YYYY
      /^(\d{1,2})-(\d{1,2})-(\d{4})$/,
    ];

    for (const format of formats) {
      const match = dateString.match(format);
      if (match) {
        // Try parsing as is first
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
          return date;
        }
      }
    }

    // Fallback to standard parsing
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error(`Unable to parse date: ${dateString}`);
    }
    return date;
  }

  protected extractMerchant(description: string): string {
    // Remove common prefixes and clean up merchant name
    let merchant = description
      .replace(/^(DEBIT CARD PURCHASE|CREDIT CARD|ACH|CHECK|TRANSFER|PAYMENT)\s*-?\s*/i, '')
      .replace(/\s+#\d+.*$/, '') // Remove transaction numbers
      .replace(/\s+\d{2}\/\d{2}.*$/, '') // Remove dates
      .trim();

    return merchant || description;
  }

  protected parseCSV(csvContent: string): string[][] {
    const lines = csvContent.split('\n').filter(line => line.trim());
    return lines.map(line => {
      const values: string[] = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }

      values.push(current.trim());
      return values.map(v => v.replace(/^"|"$/g, ''));
    });
  }
}
