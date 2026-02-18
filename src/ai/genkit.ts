import { genkit } from 'genkit';

export const ai = genkit({});

ai.defineModel(
  {
    name: 'mistral-7b-instruct-v0.2',
    apiVersion: 'v2',
  },
  async (request) => {
    const lastMessage = request.messages[request.messages.length - 1];
    if (!lastMessage || !lastMessage.content[0]) {
      throw new Error("No prompt provided to Mistral model.");
    }

    const rawPrompt = lastMessage.content[0].text;
    
    // For Mistral-7B-Instruct, wrapping in [INST] tags often improves instruction following
    const promptText = `[INST] ${rawPrompt} [/INST]`;

    if (!process.env.HF_TOKEN) {
      throw new Error("HF_TOKEN environment variable is not set.");
    }

    const response = await fetch(
      'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2',
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
    
    let text =
      Array.isArray(data) && data[0]?.generated_text
        ? data[0].generated_text
        : JSON.stringify(data);
    
    // Robust JSON extraction using regex to find the first '{' and last '}'
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      text = jsonMatch[0];
    } else {
      // If no JSON object is found, we pass back the text as is, 
      // but log a warning as it might fail schema validation
      console.warn("No JSON object found in Mistral response text.");
    }

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
