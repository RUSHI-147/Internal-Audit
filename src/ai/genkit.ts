import { genkit } from 'genkit';

export const ai = genkit({});

ai.defineModel(
  {
    name: 'huggingface-llama3',
    apiVersion: 'v2',
  },
  async (request) => {
    console.log("🚀 HF MODEL CALLED");
    // Llama-3-Instruct expects a plain prompt, not one with roles.
    // We'll take the content of the last message which contains the full prompt.
    const lastMessage = request.messages[request.messages.length - 1];
    const prompt = lastMessage.content[0].text;

    const response = await fetch(
      'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2',
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
            return_full_text: false, // Only return the generated text
          },
          options: {
            wait_for_model: true, // Avoid "model is loading" errors
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
    console.log("HF Raw Data",data);

    if (data.error) {
        throw new Error(`Hugging Face API Error: ${data.error}`);
    }

    let text =
      Array.isArray(data) && data[0]?.generated_text
        ? data[0].generated_text
        : JSON.stringify(data);
    
    console.log("HF Generated Text",text)

    // The response from instruct models on HF may include the original prompt
    // or other conversational text. We need to robustly extract the JSON object.
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');

    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      const potentialJson = text.substring(jsonStart, jsonEnd + 1);
      try {
        // Validate that it's actually parsable JSON
        JSON.parse(potentialJson);
        text = potentialJson;
      } catch (e) {
        console.error("Could not parse extracted JSON from model response:", potentialJson, e);
        throw new Error("Model returned a string containing an invalid JSON object.");
      }
    } else {
      // If we can't find a JSON object, the call has failed from our perspective.
      console.error("Could not find a valid JSON object in the model response:", text);
      throw new Error("Model did not return a parsable JSON object.");
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
