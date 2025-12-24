import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

// OpenAI Configuration
if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID,
});

// Anthropic (Claude) Configuration
if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error('ANTHROPIC_API_KEY is not set');
}

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Auto-Tasks with GPT-3.5
export const parseAutoTaskIntent = async (userInput: string) => {
  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: `You are a task parsing assistant. Extract intent, entities (who, what, when, where), and action from user input.
Respond with JSON: { intent: string, entities: {}, action: string }`,
      },
      { role: 'user', content: userInput },
    ],
    temperature: 0.7,
  });

  const content = completion.choices[0].message.content || '{}';
  return JSON.parse(content);
};

// Smart Week Scheduling with Claude
export const generateSmartWeekSchedule = async ({
  tasks,
  energyLevels,
  preferences,
}: {
  tasks: Array<{ name: string; duration: number; priority: string }>;
  energyLevels: Record<string, string>;
  preferences: Record<string, any>;
}) => {
  const response = await anthropic.messages.create({
    model: 'claude-3-opus-20240229',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: `Create an optimized weekly schedule based on:
        Tasks: ${JSON.stringify(tasks)}
        Energy levels: ${JSON.stringify(energyLevels)}
        User preferences: ${JSON.stringify(preferences)}
        
        Return a JSON schedule with 90-minute focus blocks, breaks, and estimated time saved.`,
      },
    ],
  });

  const content = response.content[0];
  if (content.type === 'text') {
    try {
      return JSON.parse(content.text);
    } catch {
      return { schedule: content.text };
    }
  }
  return null;
};

// Extract text from documents for Digital Paperwork
export const extractDocumentFields = async (documentText: string) => {
  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: `You are a document extraction specialist. Extract key fields from documents.
        Return JSON with extracted fields and values.`,
      },
      { role: 'user', content: `Extract fields from: ${documentText}` },
    ],
  });

  const content = completion.choices[0].message.content || '{}';
  return JSON.parse(content);
};
