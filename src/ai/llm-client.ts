export interface AuditAIResponse {
  explanation: string;
  riskScore: number;
  evidence: string[];
}

export async function callLLM(prompt: string): Promise<AuditAIResponse> {
  if (!process.env.HF_TOKEN) {
    throw new Error("HF_TOKEN environment variable is not set.");
  }

  // Updated to use the recommended router endpoint for v0.3
  const response = await fetch(
    "https://router.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          temperature: 0.2,
          max_new_tokens: 600,
          return_full_text: false,
        },
        options: {
          wait_for_model: true,
        },
      }),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`HF API Error: ${errText}`);
  }

  const data = await response.json();

  let generatedText = "";
  if (Array.isArray(data) && data[0]?.generated_text) {
    generatedText = data[0].generated_text;
  } else {
    generatedText = JSON.stringify(data);
  }

  // Extract JSON from response
  const jsonMatch = generatedText.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    throw new Error("Model did not return valid JSON.");
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);

    if (
      typeof parsed.explanation !== "string" ||
      typeof parsed.riskScore !== "number" ||
      !Array.isArray(parsed.evidence)
    ) {
      throw new Error("Incomplete AI response structure.");
    }

    return parsed;
  } catch (error) {
    throw new Error("Failed to parse AI JSON response.");
  }
}
