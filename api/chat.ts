import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const policy_document = `
FoodFix Customer Support Policy

1. Refund Policy
Customers may be eligible for a refund if:
- The order is cancelled by the restaurant.
- The order is not delivered.
- The delivered food is spoiled, unsafe, or not edible.
- A major item is missing from the order.
- The wrong item is delivered.

Refunds are not guaranteed automatically. Final refund approval may require review by the FoodFix support team.

2. Refund Timeline
Once approved, refunds usually take 3 to 7 business days to reflect in the customer's original payment method.
Wallet refunds may reflect faster.

3. Delay Compensation Policy
If an order is delayed, the customer may be eligible for an apology coupon depending on the delay duration and order value.
A delayed order does not always mean automatic refund.
If the customer wants exact live order status, the issue should be escalated to a human agent.

4. Cancellation Policy
Customers can cancel an order before the restaurant starts preparing it.
Once preparation has started, cancellation may not be allowed.
If the order is extremely delayed, FoodFix support may review the case.

5. Coupon Policy
Only one coupon can be applied per order unless clearly mentioned in the offer.
Coupons may fail if the order does not meet minimum order value, restaurant eligibility, location eligibility, or payment method conditions.

6. Missing or Wrong Item Policy
If an item is missing or the wrong item is delivered, the customer should report it through support.
FoodFix may ask for order details or an image.
Refund or replacement depends on verification.

7. Food Quality Policy
If food is spoiled, unsafe, spilled, leaked, or packaging is damaged, the customer should upload a clear image.
FoodFix support will review the complaint.
The customer may be eligible for refund, coupon, or replacement depending on the case.

8. Human Escalation Policy
Escalate to a human agent if:
- The customer asks for a human.
- The issue needs payment verification.
- The issue needs live order tracking.
- The issue is unclear.
- The customer is very angry.
- The AI is not sure about the answer.
`;

const guards = `You are a food business chatbot, be empathetic but dont answer any unrelated questions, Keep the response short in this case. Do not generate or falsify information and if name provided address user with name. `;

let aiInstance: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("API key is missing: Please specify GOOGLE_API_KEY or GEMINI_API_KEY in your environment.");
    }
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

// Helper to parse the structured bot response securely
interface BotResult {
  text: string;
  isEscalated: boolean;
}

function parseBotResult(rawText: string, fallbackText: string): BotResult {
  try {
    // Clean string case where markdown json fence is returned despite instructions
    let jsonStr = rawText.trim();
    if (jsonStr.startsWith("```json")) {
      jsonStr = jsonStr.substring(7);
    }
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.substring(3);
    }
    if (jsonStr.endsWith("```")) {
      jsonStr = jsonStr.substring(0, jsonStr.length - 3);
    }
    jsonStr = jsonStr.trim();
    
    const parsed = JSON.parse(jsonStr);
    return {
      text: parsed.text || fallbackText,
      isEscalated: typeof parsed.isEscalated === "boolean" ? parsed.isEscalated : false,
    };
  } catch (e) {
    // Fallback parsing of raw text if any error occurs
    return {
      text: rawText || fallbackText,
      isEscalated: rawText.toLowerCase().includes("escalat to a human") || rawText.toLowerCase().includes("transfer you to a human agent"),
    };
  }
}

async function handlePolicyQuery(query: string, history_text: string) {
  const prompt = `You are a helpful, professional customer support Assistant for a food ordering business called "Food Fix". Be Courteous and empathetic. 
Here is the Customer query - ${query}. Strictly follow the guardrails which are - ${guards}. 
Use the following Conversation history-${history_text}.
Use the Policy Document to answer the query - ${policy_document}.

In your response:
1. Always be helpful, clear, and address the customer's question directly.
2. If AND ONLY IF the user query meets the specific triggers in the "Human Escalation Policy" (such as explicitly asking for a human agent, demanding live order tracking, or payment verification), then route the customer to a human agent by setting "isEscalated" to true, and state in your message that you are routing them to a human agent now.
3. If they are just asking a general question about our policies (e.g., refund times, coupon validity), answer it accurately as per the policy document, and set "isEscalated" to false. Do NOT escalate general Q&A queries.`;

  const response = await getAI().models.generateContent({
    model: "gemini-3.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          text: {
            type: "STRING",
            description: "Friendly customer support response. Do not use phrases like 'Support Team' or 'Human Agent' in general Q&A unless you are actually hand-shifting to a human support agent because the user asked or a policy trigger is met."
          },
          isEscalated: {
            type: "BOOLEAN",
            description: "Explicitly set to true only when you are transferring the customer to a real human agent based on the Escalation Policy triggers. Otherwise false."
          }
        },
        required: ["text", "isEscalated"]
      }
    }
  });

  return response.text || JSON.stringify({ text: "I apologize, but I could not formulate a response. Please try again.", isEscalated: false });
}

async function handleFoodQualityQuery(query: string, history_text: string, imageBase64Data: string, mimeType: string) {
  const prompt = `You're a helpful, polite assistant for a food delivery service called "Food Fix".
Use the following policy document to evaluate the quality image -
${policy_document}.

Check the food quality image carefully:
- If the food is NOT corrupt (meaning it does NOT look clearly burnt and has NO visible mould/spoilage), then explain to the customer that based on the image, the item does not appear to be corrupt or defective. Explicitly state that you are escalating this to our human support team now for a secondary evaluation, and set "isEscalated" to true in your JSON response.
- If the food looks. corrupt (such as clearly burnt, has mould, or is spoiled), say that you are extremely sorry about this, a refund has been approved and is being processed, and set "isEscalated" to false in your JSON response since we resolved/refunded.

Here is the query - ${query}.
Use the following historical conversation -
${history_text}`;

  const imagePart = {
    inlineData: {
      mimeType,
      data: imageBase64Data,
    },
  };

  const response = await getAI().models.generateContent({
    model: "gemini-3.5-flash",
    contents: [
      { parts: [imagePart, { text: prompt }] }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          text: {
            type: "STRING",
            description: "Your courteous customer support response text."
          },
          isEscalated: {
            type: "BOOLEAN",
            description: "Set to true only if you are transferring the user to a human agent because the food does not look corrupt or they demand manual assistance. Set to false if you handled and resolved/refunded."
          }
        },
        required: ["text", "isEscalated"]
      }
    }
  });

  return response.text || JSON.stringify({ text: "Unable to analyze the image.", isEscalated: false });
}

// Vercel Serverless Function Handler
export default async function handler(req: any, res: any) {
  // Handle CORS options request
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  // Set standard response headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { query, history, image } = req.body || {};

    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    // Format historical messages to human-readable string
    const formattedHistory = (history || [])
      .map((m: { text: string; isBot: boolean }) => `${m.isBot ? "Assistant" : "User"}: ${m.text}`)
      .join("\n");

    const classificationPrompt = `
You are a customer support query routing classifier for "Food Fix" food delivery business.
Categorize the user's current query into exactly one of three categories: "food_quality", "policy", or "other".

- "food_quality": The user is mentioning, complaining about, or asking about a physical quality issue of the food they actually received (e.g., food being burnt, spoiled, mouldy, cold, rotten, bad taste, hair inside, weird smell, etc.).
- "policy": The user is asking about delivery, delay compensations, cancel options, refund timelines, missing items, coupons, or other support policy topics.
- "other": Completely unrelated queries, chit-chat, or questions not about Food Fix.

User Query: "${query}"

Return only a single JSON state like:
{"category": "category_name"}
Do not output any reasoning outside JSON.
`;

    const classificationResponse = await getAI().models.generateContent({
      model: "gemini-3.5-flash",
      contents: classificationPrompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    let category = "policy";
    try {
      const parsed = JSON.parse(classificationResponse.text || "{}");
      category = parsed.category || "policy";
    } catch (e) {
      const text = (classificationResponse.text || "").toLowerCase();
      if (text.includes("food_quality")) {
        category = "food_quality";
      } else if (text.includes("other")) {
        category = "other";
      }
    }

    if (category === "other") {
      const rejectPrompt = `
User Query: "${query}"
Guardrail: You are a food business chatbot, be empathetic but dont answer any unrelated questions, Keep the response short in this case. Do not generate or falsify information.
`;
      const response = await getAI().models.generateContent({
        model: "gemini-3.5-flash",
        contents: rejectPrompt,
      });
      return res.status(200).json({
        text: response.text || "I'm sorry, I'm only able to assist with Food Fix order policies and food quality inquiries.",
        category: "other",
        isEscalated: false
      });
    }

    if (category === "food_quality") {
      if (image && image.includes("base64,")) {
        const parts = image.split("base64,");
        const mimeType = parts[0].split(":")[1].split(";")[0];
        const base64Data = parts[1];

        const rawResponse = await handleFoodQualityQuery(query, formattedHistory, base64Data, mimeType);
        const parsed = parseBotResult(rawResponse, "Unable to analyze the image.");
        return res.status(200).json({
          text: parsed.text,
          isEscalated: parsed.isEscalated,
          category: "food_quality",
          hasImageAnalyzed: true
        });
      } else {
        return res.status(200).json({
          text: "I am really sorry to hear about the food quality issue. Please upload a clear photo of the food using the upload button below so I can verify if it is burnt or mouldy, or escalate to our human team.",
          category: "food_quality",
          isEscalated: false,
          needsImage: true
        });
      }
    }

    const rawResponse = await handlePolicyQuery(query, formattedHistory);
    const parsed = parseBotResult(rawResponse, "I apologize, but I could not formulate a response. Please try again.");
    return res.status(200).json({
      text: parsed.text,
      isEscalated: parsed.isEscalated,
      category: "policy"
    });

  } catch (error: any) {
    console.error("Serverless Error in /api/chat:", error);
    return res.status(500).json({
      error: "Failed to query server-side AI model",
      details: error.message
    });
  }
}
