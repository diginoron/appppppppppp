export interface ThesisTopic {
  title: string;
  description: string;
  keywords: string[];
  potentialResearchQuestions?: string[];
}

export interface ApiResponse {
  topics: ThesisTopic[];
}