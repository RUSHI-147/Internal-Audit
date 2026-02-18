import { genkit } from 'genkit';

export const ai = genkit({});

ai.defineModel(
  {
    name: 'mistral-7b-instruct-v0.2',
    apiVersion: 'v2',
  },
  async (request) => {
    console.log("🚀 MISTRAL MODEL CALLED");
    const lastMessage = request.messages[request.messages.length - 1];
    const promptText = lastMessage.content[0].text;

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
        throw new Error(`Hugging Face API request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    let text =
      Array.isArray(data) && data[0]?.generated_text
        ? data[0].generated_text
        : JSON.stringify(data);
    
    // Extract JSON object if the model included extra text
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');

    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      text = text.substring(jsonStart, jsonEnd + 1);
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
