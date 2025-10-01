import AnthropicBedrock from '@anthropic-ai/bedrock-sdk';
import { config } from '../config.js';

export interface CategorizedTransaction {
  transactionId: number;
  suggestedCategory: string;
  confidence: number;
  reasoning: string;
  alternatives?: { category: string; confidence: number }[];
}

export class BedrockAgentService {
  private client: AnthropicBedrock;

  // Helper to strip markdown code blocks from JSON responses
  private stripMarkdown(text: string): string {
    // Remove markdown code blocks (```json ... ``` or ``` ... ```)
    return text.replace(/```(?:json)?\s*\n?([\s\S]*?)\n?```/g, '$1').trim();
  }

  constructor() {
    // Check if AWS region is configured (minimum requirement)
    if (!config.aws.region) {
      throw new Error('AWS_REGION is required for AWS Bedrock');
    }

    // Initialize Bedrock client with AWS credentials
    // Priority: Profile > Explicit credentials > Default providers
    const clientConfig: any = {
      awsRegion: config.aws.region,
    };

    // Option 1: Use AWS profile if specified
    if (config.aws.profile) {
      // Set AWS_PROFILE environment variable for SDK to use
      process.env.AWS_PROFILE = config.aws.profile;
      console.log(`Using AWS profile: ${config.aws.profile}`);
    }
    // Option 2: Use explicit credentials if provided
    else if (config.aws.accessKeyId && config.aws.secretAccessKey) {
      clientConfig.awsAccessKey = config.aws.accessKeyId;
      clientConfig.awsSecretKey = config.aws.secretAccessKey;

      // Add session token if provided (for temporary credentials)
      if (config.aws.sessionToken) {
        clientConfig.awsSessionToken = config.aws.sessionToken;
      }
      console.log('Using explicit AWS credentials');
    }
    // Option 3: Fall back to default credential providers
    else {
      console.log('Using default AWS credential providers (~/.aws/credentials, instance profile, etc.)');
    }

    this.client = new AnthropicBedrock(clientConfig);
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
      model: 'global.anthropic.claude-sonnet-4-5-20250929-v1:0',
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
        const cleanedText = this.stripMarkdown(content.text);
        return JSON.parse(cleanedText);
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
      model: 'global.anthropic.claude-sonnet-4-5-20250929-v1:0',
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
        const cleanedText = this.stripMarkdown(content.text);
        return JSON.parse(cleanedText);
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
      model: 'global.anthropic.claude-sonnet-4-5-20250929-v1:0',
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
      model: 'global.anthropic.claude-sonnet-4-5-20250929-v1:0',
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
        const cleanedText = this.stripMarkdown(content.text);
        return JSON.parse(cleanedText);
      } catch (error) {
        console.error('Failed to parse report response:', error);
        throw new Error('Invalid response from report agent');
      }
    }

    throw new Error('Unexpected response format from report agent');
  }
}
