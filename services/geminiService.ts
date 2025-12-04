import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysisResult, CategoryType, UrgencyLevel } from '../types';

// Initialize Gemini Client
// In a real production app, this would likely be proxied through a backend
// to protect the API key, but for this demo, we use it directly as per instructions.
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const analyzeEmailWithGemini = async (emailContent: string, childNames: string[]): Promise<AIAnalysisResult> => {
  if (!ai) {
    console.warn("Gemini API Key missing. Returning mock data.");
    return mockAnalysis(childNames[0]);
  }

  const modelId = "gemini-2.5-flash"; // Efficient for text processing

  const prompt = `
    You are an intelligent assistant for the "SchoolSync" app. 
    Analyze the following school email text.
    
    Context - Known Children: ${childNames.join(', ')}.
    
    Task:
    1. Identify which child this relates to (or null if unsure).
    2. Categorize the email.
    3. Extract a short summary.
    4. Determine urgency.
    5. Extract any specific events (dates, times).
    6. Extract any specific actions required by the parent.

    Email Content:
    "${emailContent}"
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            childName: { type: Type.STRING, nullable: true },
            category: { type: Type.STRING, enum: Object.values(CategoryType) },
            summary: { type: Type.STRING },
            urgency: { type: Type.STRING, enum: Object.values(UrgencyLevel) },
            events: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  date: { type: Type.STRING, description: "ISO Date string" },
                  time: { type: Type.STRING },
                  location: { type: Type.STRING }
                }
              }
            },
            actions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  deadline: { type: Type.STRING, description: "ISO Date string" }
                }
              }
            }
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No response from Gemini");

    return JSON.parse(jsonText) as AIAnalysisResult;

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    // Fallback for demo purposes if API fails or key is invalid
    return mockAnalysis(childNames[0]);
  }
};

export const generateDraftReply = async (emailSubject: string, emailSender: string, summary: string | undefined): Promise<string> => {
  if (!ai) return "Gemini API key missing. Cannot generate draft.";

  const modelId = "gemini-2.5-flash";
  const prompt = `
    You are an assistant for a busy parent. 
    Draft a polite, professional, and concise email reply.
    
    Incoming Email Subject: "${emailSubject}"
    Sender: ${emailSender}
    Context/Summary of incoming email: "${summary || 'General school update'}"
    
    If it's about a payment, confirm it will be handled. 
    If it's about an event, acknowledge receipt.
    If the context is unclear, draft a generic polite acknowledgement.
    Keep it short (under 50 words). Do not include placeholders like [Your Name], just sign off as 'Parent'.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });
    return response.text || "Could not generate draft.";
  } catch (error) {
    console.error("Gemini Reply Generation Failed:", error);
    return "Error generating reply.";
  }
};

export const askDashboardAgent = async (query: string, context: { events: any[], actions: any[] }): Promise<string> => {
  if (!ai) return "Gemini API key missing. Cannot answer queries.";

  const modelId = "gemini-2.5-flash";

  // Format context for the model
  const contextString = JSON.stringify({
    upcoming_events: context.events,
    outstanding_actions: context.actions.filter(a => !a.isCompleted)
  }, null, 2);

  const prompt = `
    You are a helpful AI assistant called "SchoolSync" for a parent's dashboard.
    
    Context Data (Events & Actions):
    ${contextString}
    
    User Query: "${query}"
    
    Answer the user's question based strictly on the context provided.
    If the answer isn't in the data, say so politely.
    Keep answers conversational, helpful and concise.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
    });
    return response.text || "I couldn't figure that out based on your schedule.";
  } catch (error) {
    console.error("Gemini Agent Failed:", error);
    return "Sorry, I encountered an error processing your request.";
  }
};

const mockAnalysis = (defaultChild: string): AIAnalysisResult => ({
  childName: defaultChild,
  category: CategoryType.ACTION_REQUIRED,
  summary: "Simulated AI Analysis: Please pay for the upcoming field trip.",
  urgency: UrgencyLevel.HIGH,
  events: [
    {
      title: "Science Museum Trip",
      date: new Date(Date.now() + 604800000).toISOString(),
      time: "09:00",
      location: "Science Museum"
    }
  ],
  actions: [
    {
      title: "Pay £15 via ParentPay",
      deadline: new Date(Date.now() + 259200000).toISOString()
    }
  ]
});