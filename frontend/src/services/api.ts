const API_BASE_URL = "https://phishexplain-ai-3.onrender.com";
export interface AnalysisRequest {
  sender: string;
  subject: string;
  message: string;
}

export interface AnalysisResponse {
  prediction: "phishing" | "legitimate";
  confidence: number;
  risk_level: "low" | "medium" | "high";
  indicators: string[];
  explanation: string;
  recommended_action: string;
}

export async function analyzeMessage(
  data: AnalysisRequest,
): Promise<AnalysisResponse> {
  const response = await fetch(`${API_BASE_URL}/api/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Analysis failed (${response.status}): ${errorText}`,
    );
  }

  return response.json();
}