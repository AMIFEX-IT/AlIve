import { GoogleGenAI, Type } from "@google/genai";

// 1. Food Health Analysis
export const analyzeFood = async (base64Image: string, patientInfo: string) => {
  try {
    // Initialize inside function to ensure environment variables are ready
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: "image/jpeg",
            },
          },
          {
            text: `Analyze this meal for a patient with the following medical profile: ${patientInfo}. 
            Provide:
            1. Estimated Calorie Count & Macros.
            2. Suitability check (Green/Yellow/Red flag based on profile).
            3. Specific advice or warnings.
            Format the response in JSON.`,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                calories: { type: Type.STRING },
                macros: { type: Type.STRING },
                suitability: { type: Type.STRING, enum: ["Safe", "Caution", "Avoid"] },
                advice: { type: Type.STRING }
            }
        }
      },
    });
    return response.text ? JSON.parse(response.text) : null;
  } catch (error) {
    console.error("Food Analysis Error:", error);
    throw error;
  }
};

// 2. Hospital Locator
export const findHospitals = async (latitude: number, longitude: number) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Find the top 3 nearest hospitals or rehab centers with high ratings. List their names, estimated distance, and a brief summary of their specialties.",
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude,
              longitude,
            },
          },
        },
      },
    });
    
    // Maps grounding returns text with grounding chunks, but for this app we'll display the text 
    // and parse the chunks if available for links.
    return {
      text: response.text,
      chunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks
    };
  } catch (error) {
    console.error("Hospital Finder Error:", error);
    throw error;
  }
};

// 3. Intelligent Medical OCR & Parsing
export const parseMedicalRecord = async (base64Image: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
           {
            inlineData: {
              data: base64Image,
              mimeType: "image/jpeg",
            },
           },
           {
            text: `You are an expert AI Medical Scribe. Analyze this image of a medical document (lab report, prescription, or surgery note).
            Extract the following information with high accuracy:
            1. Hospital/Facility Name (e.g., "City General").
            2. Diagnosis/Title (e.g., "Blood Test", "MRI Scan").
            3. Date (YYYY-MM-DD). Use today's date if not found.
            4. Summary (1-2 sentences of key findings).
            5. Full Text (A faithful transcription of the visible text).
            
            Return JSON.`,
           }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            hospital: { type: Type.STRING },
            diagnosis: { type: Type.STRING },
            date: { type: Type.STRING },
            summary: { type: Type.STRING },
            fullText: { type: Type.STRING }
          }
        }
      }
    });
    return response.text ? JSON.parse(response.text) : null;
  } catch (error) {
    console.error("Medical Parsing Error:", error);
    return null;
  }
};