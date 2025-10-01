import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config.js';

export interface CategorizedTransaction {
  transactionId: number;
  suggestedCategory: string;
  confidence: number;
  reasoning: string;
  alternatives?: { category: string; confidence: number }[];
}

export class AgentService {
  private client: Anthropic;

  constructor() {
    if (!config.anthropicApiKey) {
      throw new Error('ANTHROPIC_API_KEY is required');
    }
    this.client = new Anthropic({
      apiKey: config.anthropicApiKey,
    });
  }

  async categorizeTransactions(
    transactions: any[],
    categories: string[]
  ): Promise<CategorizedTransaction[]> {
    const prompt = `You are a financial transaction categorization specialist.

Available categories: ${categories.join(', ')}

Transactions to categorize:
${JSON.stringify(transactions, null, 2)}

For each transaction, analyze the description and merchant to determine the most appropriate category.
Return a JSON array with the following structure for each transaction:
{
  "transactionId": <id>,
  "suggestedCategory": "<category name>",
  "confidence": <0.0 to 1.0>,
  "reasoning": "<brief explanation>",
  "alternatives": [{ "category": "<name>", "confidence": <0.0 to 1.0> }]
}

Respond with only the JSON array, no additional text.`;

    const message = await this.client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type === 'text') {
      try {
        return JSON.parse(content.text);
      } catch (error) {
        console.error('Failed to parse categorization response:', error);
        throw new Error('Invalid response from categorization agent');
      }
    }

    throw new Error('Unexpected response format from categorization agent');
  }

  async analyzeSpending(startDate: string, endDate: string, transactions: any[]): Promise<any> {
    const prompt = `Analyze the following financial transactions between ${startDate} and ${endDate}.

Transactions:
${JSON.stringify(transactions, null, 2)}

Provide insights on:
1. Recurring subscriptions (monthly, yearly)
2. Spending anomalies (transactions that are unusually high)
3. Spending trends by category
4. Recommendations for budget optimization

Return structured JSON with:
{
  "subscriptions": [{ "merchant": "", "amount": 0, "frequency": "" }],
  "anomalies": [{ "transactionId": 0, "reason": "" }],
  "trends": [{ "category": "", "trend": "increasing|decreasing|stable", "percentage": 0 }],
  "recommendations": ["recommendation 1", "recommendation 2"]
}

Respond with only the JSON object, no additional text.`;

    const message = await this.client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type === 'text') {
      try {
        return JSON.parse(content.text);
      } catch (error) {
        console.error('Failed to parse analysis response:', error);
        throw new Error('Invalid response from analysis agent');
      }
    }

    throw new Error('Unexpected response format from analysis agent');
  }

  async chat(message: string, context?: string): Promise<string> {
    const systemPrompt = `You are a personal finance assistant. Help users understand their spending patterns and provide actionable advice.

${context ? `Context:\n${context}` : ''}`;

    const response = await this.client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: message,
        },
      ],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      return content.text;
    }

    throw new Error('Unexpected response format from chat agent');
  }

  async generateReport(month: string, transactions: any[], budgets: any[]): Promise<any> {
    const prompt = `Generate a comprehensive monthly financial report for ${month}.

Transactions:
${JSON.stringify(transactions, null, 2)}

Budgets:
${JSON.stringify(budgets, null, 2)}

Provide:
1. Executive summary with key metrics
2. Spending breakdown by category
3. Budget performance
4. Month-over-month comparisons
5. Actionable recommendations

Return structured JSON with detailed analysis.`;

    const message = await this.client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type === 'text') {
      try {
        return JSON.parse(content.text);
      } catch (error) {
        console.error('Failed to parse report response:', error);
        throw new Error('Invalid response from report agent');
      }
    }

    throw new Error('Unexpected response format from report agent');
  }
}
