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
    
    // For Mistral-7B-Instruct, wrapping in [INST] tags often improves instruction following
    const promptText = `[INST] ${rawPrompt} [/INST]`;

    console.log("HF TOKEN VALUE:", process.env.HF_TOKEN ? "Present" : "Missing");
    if (!process.env.HF_TOKEN) {
      throw new Error("HF_TOKEN environment variable is not set.");
    }

    // Corrected to use the full router path for serverless inference
    const response = await fetch(
      'https://router.huggingface.co/hf-inference/models/mistralai/Mistral-7B-Instruct-v0.3',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: promptText,
          parameters: {
            temperature: 0.1,
            max_new_tokens: 1000,
            return_full_text: false,
          },
          options: {
            wait_for_model: true,
          },
        }),
      }
    );

    if (!response.ok) {
        const errorText = await response.text();
        console.error("Hugging Face API Error:", errorText);
        throw new Error(`Hugging Face API request failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log("HF RAW DATA:", data);
    
    let text =
      Array.isArray(data) && data[0]?.generated_text
        ? data[0].generated_text
        : JSON.stringify(data);
    
    // Robust JSON extraction using regex to find the first '{' and last '}'
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      text = jsonMatch[0];
    }
    
    console.log("HF GENERATED TEXT:", text);

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
