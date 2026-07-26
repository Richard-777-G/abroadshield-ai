/**
 * OpenAI LLM Provider (Paid, Production-grade)
 * Use when you're ready to scale
 * Supports GPT-4, GPT-4 Turbo, GPT-3.5-Turbo
 */

import { LLMProvider, CoverLetterParams, CVTailorParams, NetworkMessageParams, HousingInquiryParams, RelevanceScoreParams } from './types';

export class OpenAIProvider implements LLMProvider {
  private apiKey: string;
  private model: string;
  private endpoint: string = 'https://api.openai.com/v1/chat/completions';

  constructor(apiKey: string, model: string = 'gpt-3.5-turbo') {
    this.apiKey = apiKey;
    this.model = model;
  }

  private async call(messages: any[]): Promise<string> {
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenAI error: ${error.error?.message}`);
      }

      const data: any = await response.json();
      return data.choices?.[0]?.message?.content || '';
    } catch (error) {
      console.error('OpenAI LLM Error:', error);
      throw error;
    }
  }

  async generateCoverLetter(params: CoverLetterParams): Promise<string> {
    const systemPrompt = "You are an expert career coach and cover letter writer. Write compelling, authentic cover letters that highlight the candidate's strengths.";
    
    const userPrompt = `
Write a professional cover letter for this job application:

Job: ${params.jobTitle} at ${params.company}
Company: ${params.companyDescription}

Job Description:
${params.jobDescription}

Candidate:
Name: ${params.userBackground.name}
Education: ${params.userBackground.education.join(', ')}
Experience: ${params.userBackground.experience.join(', ')}
Skills: ${params.userBackground.skills.join(', ')}

Write a 3-4 paragraph cover letter that is ${params.tone || 'professional'} in tone.`;

    return this.call([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);
  }

  async tailorCV(params: CVTailorParams): Promise<string> {
    const systemPrompt = 'You are a professional CV writer. Tailor CVs to highlight relevant experience.';
    
    const userPrompt = `
Tailor this CV for a specific job:

Original CV:
${params.baseCV}

Job Requirements:
${params.jobDescription}

Company Values: ${params.companyValues.join(', ')}
Key Skills: ${params.keySkills.join(', ')}

Reorder experience and adjust descriptions to highlight relevance. Keep the same structure.`;

    return this.call([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);
  }

  async generateNetworkMessage(params: NetworkMessageParams): Promise<string> {
    const systemPrompt = 'You are an expert in professional networking. Write authentic, personalized connection messages.';
    
    const userPrompt = `
Write a personalized networking message:

Target: ${params.targetName} (${params.targetRole} at ${params.targetCompany})
About: ${params.targetBio}

Sender: ${params.userBackground.name}
Reason: ${params.reasonToConnect}

Write a ${params.platform === 'linkedin' ? '2-3 sentence' : '4-5 sentence'} message that references something specific about the target and creates genuine connection.`;

    return this.call([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);
  }

  async generateHousingInquiry(params: HousingInquiryParams): Promise<string> {
    const systemPrompt = 'You are helping an international student find housing. Write professional, friendly inquiry messages.';
    
    const userPrompt = `
Write a housing inquiry message:

Landlord: ${params.landlordName}
Property: ${params.propertyAddress}
Rent: £${params.rent}

Tenant: ${params.userProfile.name}
University: ${params.userProfile.universityName}
Move-in: ${params.userProfile.moveInDate}

Write a professional 3-4 sentence message expressing interest and proposing a viewing.`;

    return this.call([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);
  }

  async scoreRelevance(params: RelevanceScoreParams): Promise<number> {
    const systemPrompt = 'You are an expert at identifying relevant professional connections. Provide a single number score.';
    
    const userPrompt = `
Score relevance (0-1):

Profile: ${params.targetProfile}
Goals: ${params.userGoals.join(', ')}
Context: ${params.context}

Respond with ONLY a number between 0 and 1.`;

    const result = await this.call([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ]);
    
    const score = parseFloat(result.trim());
    return isNaN(score) ? 0 : Math.min(1, Math.max(0, score));
  }
}
