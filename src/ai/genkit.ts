import { genkit } from 'genkit';

export const ai = genkit({});

ai.defineModel(
  {
    name: 'mistral-7b-instruct-v0.3',
    apiVersion: 'v2',
  },
  async (request) => {
    console.log("🚀 HF MODEL CALLED");
    const lastMessage = request.messages[request.messages.length - 1];
    if (!lastMessage || !lastMessage.content[0]) {
      throw new Error("No prompt provided to Mistral model.");
    }

    const rawPrompt = lastMessage.content[0].text;
    
    if (!process.env.HF_TOKEN) {
      throw new Error("HF_TOKEN environment variable is not set.");
    }

    const response = await fetch(
      "https://router.huggingface.co/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "mistralai/Mistral-7B-Instruct-v0.2",
          messages: [
            {
              role: "user",
              content: rawPrompt,
            },
          ],
          temperature: 0.1,
          max_tokens: 1000,
        }),
      }
    );

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Hugging Face API Error:", errorText);
        throw new Error(`Hugging Face API request failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log("HF RAW DATA RECEIVED");

    if (!data?.choices?.[0]?.message?.content) {
      console.error("HF response missing content:", data);
      throw new Error("Model returned empty response.");
    }

    let text = data.choices[0].message.content;
    
    // Robust JSON extraction
    // First, remove potential markdown code block markers
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    // Find the first '{' and last '}'
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1) {
      text = text.substring(firstBrace, lastBrace + 1);
    }
    
    console.log("HF PROCESSED TEXT READY");

    return {
      candidates: [
        {
          index: 0,
          finishReason: 'stop',
          message: {
            role: 'model',
            content: [{ text }],
          },
        },
      ],
    };
  }
);
