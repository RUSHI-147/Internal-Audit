import { genkit } from 'genkit';

export const ai = genkit({});

ai.defineModel(
  {
    name: 'huggingface-llama3',
    apiVersion: 'v2',
  },
  async (request) => {
    // Convert Genkit messages to plain prompt
    const prompt = request.messages
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join('\n');

    const response = await fetch(
      'https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            temperature: 0.2,
            max_new_tokens: 1000,
          },
        }),
      }
    );

    const data = await response.json();

    const text =
      Array.isArray(data) && data[0]?.generated_text
        ? data[0].generated_text
        : JSON.stringify(data);

    return {
      message: {
        role: 'model',
        content: text,
      },
    };
  }
);
