/**
 * LLM Service Factory
 * Choose your provider at runtime
 */

import { LLMProvider, LLMConfig } from './types';
import { OllamaProvider } from './ollama';
import { OpenAIProvider } from './openai';

let llmInstance: LLMProvider | null = null;

export function initLLM(config: LLMConfig): LLMProvider {
  if (config.provider === 'ollama') {
    llmInstance = new OllamaProvider(
      config.endpoint || 'http://localhost:11434',
      config.model || 'mistral',
      config.temperature || 0.7
    );
  } else if (config.provider === 'openai') {
    if (!config.apiKey) {
      throw new Error('OpenAI API key is required');
    }
    llmInstance = new OpenAIProvider(config.apiKey, config.model || 'gpt-3.5-turbo');
  } else {
    throw new Error(`Unsupported LLM provider: ${config.provider}`);
  }

  console.log(`✅ LLM initialized: ${config.provider} (${config.model})`);
  return llmInstance;
}

export function getLLM(): LLMProvider {
  if (!llmInstance) {
    // Default to Ollama for development
    return initLLM({
      provider: 'ollama',
      model: 'mistral',
      endpoint: process.env.OLLAMA_ENDPOINT || 'http://localhost:11434',
    });
  }
  return llmInstance;
}

export * from './types';
