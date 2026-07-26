/**
 * Ollama LLM Provider (Free, Local)
 * Great for development and beta testing
 * Supports Mistral, Neural-Chat, Llama2, etc.
 */

import { LLMProvider, CoverLetterParams, CVTailorParams, NetworkMessageParams, HousingInquiryParams, RelevanceScoreParams } from './types';

export class OllamaProvider implements LLMProvider {
  private endpoint: string;
  private model: string;
  private temperature: number;

  constructor(
    endpoint: string = 'http://localhost:11434',
    model: string = 'mistral',
    temperature: number = 0.7
  ) {
    this.endpoint = endpoint;
    this.model = model;
    this.temperature = temperature;
  }

  private async call(prompt: string, systemPrompt?: string): Promise<string> {
    try {
      const response = await fetch(`${this.endpoint}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          prompt,
          system: systemPrompt,
          stream: false,
          temperature: this.temperature,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama error: ${response.statusText}`);
      }

      const data: any = await response.json();
      return data.response || '';
    } catch (error) {
      console.error('Ollama LLM Error:', error);
      throw error;
    }
  }

  async generateCoverLetter(params: CoverLetterParams): Promise<string> {
    const prompt = `
Write a professional and compelling cover letter for the following job application:

Job Title: ${params.jobTitle}
Company: ${params.company}
Company Description: ${params.companyDescription}

Job Description:
${params.jobDescription}

Applicant Background:
Name: ${params.userBackground.name}
Education: ${params.userBackground.education.join(', ')}
Experience: ${params.userBackground.experience.join(', ')}
Key Skills: ${params.userBackground.skills.join(', ')}
Achievements: ${params.userBackground.achievements.join(', ')}

Tone: ${params.tone || 'professional'}

Write a cover letter that:
1. Highlights relevant experience and skills
2. Shows enthusiasm for the specific role and company
3. Explains why this candidate is a great fit
4. Is concise (3-4 paragraphs)
5. Maintains a ${params.tone || 'professional'} tone

Cover Letter:
`;

    const systemPrompt = 'You are an expert career coach and cover letter writer. Write compelling, authentic cover letters that highlight the candidate\'s strengths and fit for the role.';
    return this.call(prompt, systemPrompt);
  }

  async tailorCV(params: CVTailorParams): Promise<string> {
    const prompt = `
Tailor the following CV for a specific job:

Original CV:
${params.baseCV}

Job Description:
${params.jobDescription}

Company Core Values:
${params.companyValues.join(', ')}

Key Skills Required:
${params.keySkills.join(', ')}

Task:
1. Reorder experience to highlight the most relevant achievements first
2. Adjust skill descriptions to match the job requirements
3. Add accomplishments that align with the company values
4. Ensure technical keywords from the job description are included
5. Keep the same overall structure and length

Return only the tailored CV:
`;

    const systemPrompt = 'You are a professional CV writer. Tailor CVs to highlight relevant experience and skills for specific jobs while maintaining authenticity.';
    return this.call(prompt, systemPrompt);
  }

  async generateNetworkMessage(params: NetworkMessageParams): Promise<string> {
    const prompt = `
Write a personalized networking message to connect with a professional:

Target Person:
Name: ${params.targetName}
Role: ${params.targetRole}
Company: ${params.targetCompany}
Bio: ${params.targetBio}

Sender Background:
Name: ${params.userBackground.name}
Current Role: ${params.userBackground.currentRole}
Skills: ${params.userBackground.skills.join(', ')}
Interests: ${params.userBackground.interests.join(', ')}

Connection Reason: ${params.reasonToConnect}
Platform: ${params.platform}

Write a message that:
1. Is personalized and references something specific about the target
2. Explains why you're reaching out (authentic, not generic)
3. Shows genuine interest in their work
4. Proposes a specific next step (coffee chat, 15-min call, etc.)
5. Is concise (2-3 sentences for LinkedIn, 4-5 for email)
6. Maintains a professional but warm tone

Message:
`;

    const systemPrompt = 'You are an expert in professional networking. Write authentic, personalized messages that create genuine connections without being salesy or generic.';
    return this.call(prompt, systemPrompt);
  }

  async generateHousingInquiry(params: HousingInquiryParams): Promise<string> {
    const prompt = `
Write a professional inquiry message to a landlord about renting a property:

Landlord Name: ${params.landlordName}
Property Address: ${params.propertyAddress}
Monthly Rent: £${params.rent}

Property Description:
${params.listingDescription}

Tenant Information:
Name: ${params.userProfile.name}
University: ${params.userProfile.universityName}
Course: ${params.userProfile.courseTitle}
Move-in Date: ${params.userProfile.moveInDate}
Status: ${params.studentStatus}

Write an inquiry message that:
1. Expresses genuine interest in the property
2. Introduces the tenant professionally
3. Confirms availability and move-in date
4. Mentions student status and university (builds trust)
5. Proposes viewing times (flexible)
6. Is polite, professional, and concise (3-4 sentences)

Inquiry Message:
`;

    const systemPrompt = 'You are helping an international student find housing. Write professional, friendly inquiry messages that present the student in the best light.';
    return this.call(prompt, systemPrompt);
  }

  async scoreRelevance(params: RelevanceScoreParams): Promise<number> {
    const prompt = `
Score the relevance of a networking target on a scale of 0-1:

Target Profile:
${params.targetProfile}

User Goals:
${params.userGoals.join(', ')}

Context:
${params.context}

Score this person's relevance (0.0 to 1.0) based on:
1. Alignment with user's career goals
2. Potential for meaningful connection
3. Ability to provide value or opportunities
4. Geographic/industry alignment

Respond with ONLY a number between 0 and 1 (e.g., 0.75):
`;

    const systemPrompt = 'You are an expert at identifying relevant professional connections. Provide accurate scores.';
    const result = await this.call(prompt, systemPrompt);
    const score = parseFloat(result.trim());
    return isNaN(score) ? 0 : Math.min(1, Math.max(0, score));
  }
}
