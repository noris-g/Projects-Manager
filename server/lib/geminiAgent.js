import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const MODEL_NAME = "gemini-2.5-flash-lite";

export function getIntentModel(systemInstruction) {
  return genAI.getGenerativeModel({
    model: MODEL_NAME,
    systemInstruction,
  });
}

export function getGenericModel(systemInstruction) {
  return genAI.getGenerativeModel({
    model: MODEL_NAME,
    systemInstruction,
  });
}
