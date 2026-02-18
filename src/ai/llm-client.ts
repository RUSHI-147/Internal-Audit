export interface AuditAIResponse {
  explanation: string;
  riskScore: number;
  evidence: string[];
}

export async function callLLM(prompt: string): Promise<AuditAIResponse> {
  if (!process.env.HF_TOKEN) {
    throw new Error("HF_TOKEN environment variable is not set.");
  }

  const response = await fetch(
    "https://api-inference.huggingface.co/v1/chat/completions",
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
            content: prompt,
          },
        ],
        temperature: 0.2,
        max_tokens: 600,
      }),
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`HF API Error: ${errText}`);
  }

  const data = await response.json();

  if (!data?.choices?.[0]?.message?.content) {
    throw new Error("Model returned empty response.");
  }

  let generatedText = data.choices[0].message.content;

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
