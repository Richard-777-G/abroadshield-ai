/**
 * LLM Service Type Definitions
 * Supports multiple providers: Ollama (local), OpenAI, Claude, Gemini
 */

export interface LLMProvider {
  generateCoverLetter(params: CoverLetterParams): Promise<string>;
  tailorCV(params: CVTailorParams): Promise<string>;
  generateNetworkMessage(params: NetworkMessageParams): Promise<string>;
  generateHousingInquiry(params: HousingInquiryParams): Promise<string>;
  scoreRelevance(params: RelevanceScoreParams): Promise<number>;
}

export interface CoverLetterParams {
  jobTitle: string;
  company: string;
  companyDescription: string;
  jobDescription: string;
  userBackground: {
    name: string;
    education: string[];
    experience: string[];
    skills: string[];
    achievements: string[];
  };
  tone?: 'formal' | 'friendly' | 'enthusiastic';
}

export interface CVTailorParams {
  baseCV: string;
  jobDescription: string;
  companyValues: string[];
  keySkills: string[];
}

export interface NetworkMessageParams {
  targetName: string;
  targetRole: string;
  targetCompany: string;
  targetBio: string;
  userBackground: {
    name: string;
    currentRole: string;
    skills: string[];
    interests: string[];
  };
  reasonToConnect: string; // "Job search", "Mentorship", "Networking"
  platform: 'linkedin' | 'email' | 'alumni';
}

export interface HousingInquiryParams {
  landlordName: string;
  propertyAddress: string;
  listingDescription: string;
  rent: number;
  userProfile: {
    name: string;
    universityName: string;
    courseTitle: string;
    moveInDate: string;
  };
  studentStatus: string;
}

export interface RelevanceScoreParams {
  targetProfile: string;
  userGoals: string[];
  context: string;
}

export interface LLMConfig {
  provider: 'ollama' | 'openai' | 'claude' | 'gemini';
  model?: string;
  apiKey?: string;
  endpoint?: string;
  temperature?: number;
  maxTokens?: number;
}
