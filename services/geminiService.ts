import { GoogleGenAI, Type } from '@google/genai';
import { ApiResponse } from '../types';
import { GEMINI_MODEL_NAME, GENERATION_PROMPT } from '../constants';

/**
 * Generates thesis topics using the Google Gemini API.
 * @param keywords - A string of keywords provided by the user.
 * @returns A promise that resolves to an array of ThesisTopic objects.
 * @throws Error if the API key is not configured or if the API call fails.
 */
export async function generateThesisTopics(keywords: string): Promise<ApiResponse> {
  // Always create a new GoogleGenAI instance right before making an API call
  // to ensure it always uses the most up-to-date API key from the dialog.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = GENERATION_PROMPT(keywords);

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topics: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                  potentialResearchQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ['title', 'description', 'keywords'],
                propertyOrdering: ['title', 'description', 'keywords', 'potentialResearchQuestions'],
              },
            },
          },
          required: ['topics'],
        },
      },
    });

    const jsonStr = response.text.trim();
    const parsedResponse: ApiResponse = JSON.parse(jsonStr);

    if (!parsedResponse || !Array.isArray(parsedResponse.topics)) {
      throw new Error('Invalid response format from Gemini API: "topics" array not found or invalid.');
    }

    return parsedResponse;
  } catch (error) {
    console.error('Error generating thesis topics:', error);
    if (error instanceof SyntaxError) {
      throw new Error('Failed to parse AI response. The generated content might not be valid JSON.');
    }
    // Re-throw the error to be handled by the calling component (App.tsx)
    throw error;
  }
}