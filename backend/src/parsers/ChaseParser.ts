import { BaseParser, ParsedTransaction } from './BaseParser.js';

export class ChaseParser extends BaseParser {
  bankName = 'Chase';

  detectFormat(csvContent: string): boolean {
    const firstLine = csvContent.split('\n')[0].toLowerCase();
    return (
      firstLine.includes('posting date') &&
      firstLine.includes('description') &&
      firstLine.includes('amount')
    );
  }

  parse(csvContent: string): ParsedTransaction[] {
    const rows = this.parseCSV(csvContent);
    const headers = rows[0].map(h => h.toLowerCase());

    // Find column indices
    const dateIdx = headers.findIndex(h => h.includes('posting date') || h.includes('date'));
    const descIdx = headers.findIndex(h => h.includes('description'));
    const amountIdx = headers.findIndex(h => h.includes('amount'));
    const typeIdx = headers.findIndex(h => h.includes('type'));

    if (dateIdx === -1 || descIdx === -1 || amountIdx === -1) {
      throw new Error('Invalid Chase CSV format: missing required columns');
    }

    const transactions: ParsedTransaction[] = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row.length < 3) continue; // Skip empty or malformed rows

      try {
        const amount = Math.abs(this.normalizeAmount(row[amountIdx]));
        if (amount === 0) continue;

        const description = row[descIdx];
        const type = typeIdx !== -1 ? row[typeIdx].toLowerCase() : '';

        transactions.push({
          date: this.parseDate(row[dateIdx]),
          description: description,
          amount: amount,
          type: type.includes('debit') || amount < 0 ? 'debit' : 'credit',
          originalDescription: description,
          merchant: this.extractMerchant(description),
        });
      } catch (error) {
        console.warn(`Skipping row ${i + 1}: ${error}`);
      }
    }

    return transactions;
  }
}
