import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Initialize the standard Gemini Client as requested by the guidelines
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

const app = express();
const PORT = 3000;

// Enable rich JSON payloads to handle uploaded base64 photos easily
app.use(express.json({ limit: "15mb" }));

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

// Function for Policy-related questions:
async function handlePolicyQuery(query: string, history_text: string) {
  const prompt = `You are an helpful, professional Assistant for a food ordering Business. Be Courteous and empathetic. 
Here is the Customer query - ${query}. Strictily follow the guardrails which are - ${guards}. 
Use the following Coversation history-${history_text}.
Use the Policy Document to answer the query - ${policy_document}`;

  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: prompt,
  });

  return response.text || "I apologize, but I could not formulate a response. Please try again.";
}

// Function for Food Quality related questions with an uploaded image:
async function handleFoodQualityQuery(query: string, history_text: string, imageBase64Data: string, mimeType: string) {
  const prompt = `You're a helpful assistant of a food service company called food fix,
 please respond to user's query, be courteous.
 Use the following policy document -
 ${policy_document}.
 Check the food quality and if the food quality is bad- food is burnt or there is mould then tell him that refund is being processed and also apologize. If the food is NOT corrupt (meaning it does not look burnt and has no mould), explicitly state that it does not seem to be corrupt and escalate to a human agent as per the policy.
 Here is the query - ${query}.
Use the following historical conversation -
${history_text}`;

  const imagePart = {
    inlineData: {
      mimeType,
      data: imageBase64Data,
    },
  };

  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: [
      { parts: [imagePart, { text: prompt }] }
    ],
  });

  return response.text || "Unable to analyze the image.";
}

// API endpoint for support routing
app.post("/api/chat", async (req, res) => {
  try {
    const { query, history, image } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    // Format historical messages to human-readable string
    const formattedHistory = (history || [])
      .map((m: { text: string; isBot: boolean }) => `${m.isBot ? "Assistant" : "User"}: ${m.text}`)
      .join("\n");

    // 1. First classify the query to decide whether we need an image or can answer immediately
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

    const classificationResponse = await ai.models.generateContent({
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
      // Fallback: check text content
      const text = (classificationResponse.text || "").toLowerCase();
      if (text.includes("food_quality")) {
        category = "food_quality";
      } else if (text.includes("other")) {
        category = "other";
      }
    }

    // 2. Handle based on category
    if (category === "other") {
      // Unrelated - adhere to strict guardrail (short response, empathetic but reject)
      const rejectPrompt = `
User Query: "${query}"
Guardrail: You are a food business chatbot, be empathetic but dont answer any unrelated questions, Keep the response short in this case. Do not generate or falsify information.
`;
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: rejectPrompt,
      });
      return res.json({
        text: response.text || "I'm sorry, I'm only able to assist with Food Fix order policies and food quality inquiries.",
        category: "other"
      });
    }

    if (category === "food_quality") {
      // If image is provided, process with Quality Function
      if (image && image.includes("base64,")) {
        const parts = image.split("base64,");
        const mimeType = parts[0].split(":")[1].split(";")[0];
        const base64Data = parts[1];

        const botResponse = await handleFoodQualityQuery(query, formattedHistory, base64Data, mimeType);
        return res.json({
          text: botResponse,
          category: "food_quality",
          hasImageAnalyzed: true
        });
      } else {
        // Ask user to upload an image
        return res.json({
          text: "I am really sorry to hear about the food quality issue. Please upload a clear photo of the food using the upload button below so I can verify if it is burnt or mouldy, or escalate to our human team.",
          category: "food_quality",
          needsImage: true
        });
      }
    }

    // Default or category === "policy": Handle with Policy Function
    const botResponse = await handlePolicyQuery(query, formattedHistory);
    return res.json({
      text: botResponse,
      category: "policy"
    });

  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    return res.status(500).json({
      error: "Failed to query server-side AI model",
      details: error.message
    });
  }
});

// Configure Vite middleware or production static files build flow
async function initializeVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Food Fix server running on http://localhost:${PORT}`);
  });
}

initializeVite();
