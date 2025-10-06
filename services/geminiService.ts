import { GoogleGenAI, Type } from "@google/genai";
import type { GenerateContentResponse } from "@google/genai";
import type { RecognitionResult, StoryResult, UtilityResult } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const fileToGenerativePart = (base64: string, mimeType: string) => {
  return {
    inlineData: {
      data: base64,
      mimeType,
    },
  };
};

export const recognizeObject = async (base64Image: string, language: string): Promise<RecognitionResult | { error: string }> => {
  try {
    const imagePart = fileToGenerativePart(base64Image, "image/jpeg");
    
    const langPrompt = language === 'Hindi'
      ? `आप छोटे बच्चों के लिए वस्तुओं की पहचान करने में एक विशेषज्ञ हैं जो हिंदी बोलते हैं। छवि को देखें और सबसे प्रमुख, सामान्य वस्तु की पहचान करें। वस्तु का नाम ('objectName') हिंदी में एक सरल और प्रासंगिक शब्द होना चाहिए, आदर्श रूप से 1-3 शब्द लंबा। विवरण ('description') बहुत सरल, सकारात्मक और छोटे वाक्यों का उपयोग करना चाहिए। यदि आप एक वस्तु पाते हैं, तो दिए गए स्कीमा का पालन करते हुए केवल एक JSON ऑब्जेक्ट के साथ प्रतिक्रिया दें। 'objectName' और 'description' मान हिंदी में होने चाहिए। यदि आप एक स्पष्ट, सामान्य वस्तु की पहचान नहीं कर सकते हैं, तो केवल इस JSON के साथ प्रतिक्रिया दें: {\"objectName\": \"unknown\", \"description\": \"मैं वस्तु को पहचान नहीं सका।\"}`
      : `You are an expert at identifying objects for young children. Look at the image and identify the single, most prominent, common object. The object's name ('objectName') should be a simple, common, and relevant term, ideally 1-3 words long. The description ('description') should be very simple, positive, and use short sentences. If you find one, respond ONLY with a JSON object following the provided schema. If you cannot identify a clear, common object, respond ONLY with this JSON: {\"objectName\": \"unknown\", \"description\": \"I could not recognize the object.\"}`;

    const response : GenerateContentResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: {
            parts: [
                { text: langPrompt },
                imagePart
            ],
        },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    objectName: { type: Type.STRING },
                    description: { type: Type.STRING }
                }
            }
        }
    });

    let jsonText = response.text.trim();
    
    // More robust JSON parsing: handle markdown code blocks that Gemini may return
    if (jsonText.startsWith('```json')) {
        jsonText = jsonText.substring(7); // remove ```json\n
        if (jsonText.endsWith('```')) {
            jsonText = jsonText.slice(0, -3); // remove ```
        }
    }

    let result;
    try {
        result = JSON.parse(jsonText);
    } catch(e) {
        console.error("Failed to parse JSON:", jsonText, e);
        return { error: "There was an issue processing the image response. The format was incorrect." };
    }
    
    if (result.objectName && result.objectName.toLowerCase() !== 'unknown') {
        const imageResponse = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: `A clear, friendly, and simple cartoon illustration of a single ${result.objectName}. The background should be a solid, light, and happy color. The style should be gentle and calming.`,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '1:1',
            }
        });
        
        const imageUrl = imageResponse.generatedImages[0]?.image.imageBytes ?? '';
        
        return {
            objectName: result.objectName,
            description: result.description,
            imageUrl: `data:image/jpeg;base64,${imageUrl}`,
        };
    } else {
        const errorMessage = language === 'Hindi' ? "मैं वस्तु को पहचान नहीं सका। कृपया फिर से प्रयास करें।" : "Could not recognize the object. Please try again.";
        return { error: errorMessage };
    }
  } catch (error) {
    console.error("Error in recognizeObject:", error);
    const errorMessage = language === 'Hindi' ? "वस्तु को पहचानने का प्रयास करते समय एक त्रुटि हुई।" : "An error occurred while trying to recognize the object.";
    return { error: errorMessage };
  }
};

export const generateStory = async (objectName: string, language: string): Promise<StoryResult> => {
    const storyPrompt = language === 'Hindi'
        ? `5 साल के बच्चे के लिए ${objectName} के बारे में एक बहुत छोटी, सरल, और खुशहाल कहानी हिंदी में लिखें। कहानी में एक सुखद अंत होना चाहिए और यह शांत और आश्वस्त करने वाली होनी चाहिए।`
        : `Write a very short, simple, and happy story for a 5-year-old child about a ${objectName}. The story must have a happy ending and be calming and reassuring. Use simple language.`;
        
    const storyResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: storyPrompt
    });
    const story = storyResponse.text;

    const imageResponse = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: `A gentle, calming, and happy cartoon illustration for a children's book, inspired by this story: "${story}" The style should be soft with warm colors.`,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: '1:1',
        }
    });

    const imageUrl = imageResponse.generatedImages[0]?.image.imageBytes ?? '';

    return {
        story,
        imageUrl: `data:image/jpeg;base64,${imageUrl}`
    };
};

export const generateUtilityInfo = async (objectName: string, language: string): Promise<UtilityResult> => {
    const utilityPrompt = language === 'Hindi'
        ? `${objectName} का उपयोग किस लिए किया जाता है, यह एक या दो बहुत ही सरल वाक्यों में समझाएं। ऐसी भाषा का प्रयोग करें जिसे 5 साल का बच्चा आसानी से समझ सके।`
        : `In one or two very simple sentences, explain what a ${objectName} is used for. Use positive and simple language a 5-year-old can easily understand.`;

    const utilityResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: utilityPrompt
    });
    const utility = utilityResponse.text;
    return { utility };
};