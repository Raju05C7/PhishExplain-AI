import { useState } from "react";
import {
  analyzeMessage,
  type AnalysisResponse,
} from "../services/api";

const API_BASE_URL = "https://phishexplain-ai-3.onrender.com";

export default function AnalyzePage() {
  const [sender, setSender] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<AnalysisResponse | null>(null);

  // ============================
  // Parse uploaded EML file
  // ============================
  const extractTextFromEml = async (file: File) => {
    setFileLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `${API_BASE_URL}/api/parse-eml`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
          `Failed to parse email (${response.status}): ${errorText}`,
        );
      }

      const data = await response.json();

      setSender(data.sender || "");
      setSubject(data.subject || "");
      setMessage(data.message || "");
      setFileName(file.name);

      if (!data.message) {
        throw new Error(
          "The uploaded email did not contain readable message content.",
        );
      }
    } catch (err) {
      console.error("EML parsing error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to read the uploaded email.",
      );

      setSender("");
      setSubject("");
      setMessage("");
    } finally {
      setFileLoading(false);
    }
  };

  // ============================
  // Handle file upload
  // ============================
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedExtensions = [
      ".eml",
      ".txt",
      ".pdf",
      ".docx",
    ];

    const extension = file.name
      .substring(file.name.lastIndexOf("."))
      .toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      setError(
        "Unsupported file type. Please upload an EML, TXT, PDF, or DOCX file.",
      );
      return;
    }

    setError("");
    setResult(null);

    if (extension === ".eml") {
      await extractTextFromEml(file);
      return;
    }

    // TXT file
    if (extension === ".txt") {
      try {
        setFileLoading(true);

        const text = await file.text();

        setMessage(text);
        setSender("");
        setSubject("");
        setFileName(file.name);
      } catch (err) {
        console.error(err);

        setError("Unable to read the TXT file.");
      } finally {
        setFileLoading(false);
      }

      return;
    }

    // PDF / DOCX
    // These files should be parsed using the existing frontend
    // extraction logic if available.
    setFileName(file.name);

    setError(
      "PDF/DOCX upload detected. Please use the extracted message content before analyzing.",
    );
  };

  // ============================
  // Analyze message
  // ============================
  const handleAnalyze = async () => {
    setError("");
    setResult(null);

    if (!message.trim()) {
      setError(
        "Please enter a message or upload a file before analyzing.",
      );
      return;
    }

    setLoading(true);

    try {
      const response = await analyzeMessage({
        sender: sender.trim(),
        subject: subject.trim(),
        message: message.trim(),
      });

      setResult(response);
    } catch (err) {
      console.error("Analysis error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to analyze the message.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            PhishExplain AI
          </h1>

          <p className="mt-2 text-slate-400">
            Analyze emails and detect potential phishing threats.
          </p>
        </div>

        {/* Main Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
          {/* File Upload */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Upload Email File
            </label>

            <input
              type="file"
              accept=".eml,.txt,.pdf,.docx"
              onChange={handleFileUpload}
              disabled={fileLoading || loading}
              className="block w-full cursor-pointer rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-slate-300"
            />

            {fileName && (
              <p className="mt-2 text-sm text-emerald-400">
                Selected file: {fileName}
              </p>
            )}

            {fileLoading && (
              <p className="mt-2 text-sm text-blue-400">
                Reading email file...
              </p>
            )}
          </div>

          {/* Sender */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Sender
            </label>

            <input
              type="text"
              value={sender}
              onChange={(e) => setSender(e.target.value)}
              placeholder="example@company.com"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
            />
          </div>

          {/* Subject */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Subject
            </label>

            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
            />
          </div>

          {/* Message */}
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Message
            </label>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Paste email content here or upload an .eml file..."
              rows={12}
              className="w-full resize-y rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* Analyze Button */}
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={loading || fileLoading}
            className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Analyzing..." : "Analyze for Phishing"}
          </button>
        </div>

        {/* Result */}
        {result && (
          <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
            <h2 className="mb-6 text-2xl font-bold">
              Analysis Result
            </h2>

            {/* Prediction */}
            <div className="mb-4 grid gap-4 md:grid-cols-3">
              <div className="rounded-xl bg-slate-950 p-4">
                <p className="text-sm text-slate-400">
                  Prediction
                </p>

                <p
                  className={`mt-2 text-xl font-bold ${
                    result.prediction === "phishing"
                      ? "text-red-400"
                      : "text-emerald-400"
                  }`}
                >
                  {result.prediction.toUpperCase()}
                </p>
              </div>

              {/* Confidence */}
              <div className="rounded-xl bg-slate-950 p-4">
                <p className="text-sm text-slate-400">
                  Confidence
                </p>

                <p className="mt-2 text-xl font-bold text-blue-400">
                  {(result.confidence * 100).toFixed(1)}%
                </p>
              </div>

              {/* Risk */}
              <div className="rounded-xl bg-slate-950 p-4">
                <p className="text-sm text-slate-400">
                  Risk Level
                </p>

                <p className="mt-2 text-xl font-bold capitalize">
                  {result.risk_level}
                </p>
              </div>
            </div>

            {/* Indicators */}
            <div className="mb-5">
              <h3 className="mb-3 text-lg font-semibold">
                Threat Indicators
              </h3>

              <div className="rounded-xl bg-slate-950 p-4">
                {result.indicators?.length > 0 ? (
                  <ul className="list-disc space-y-2 pl-5 text-slate-300">
                    {result.indicators.map(
                      (indicator, index) => (
                        <li key={index}>{indicator}</li>
                      ),
                    )}
                  </ul>
                ) : (
                  <p className="text-slate-400">
                    No major suspicious indicators detected.
                  </p>
                )}
              </div>
            </div>

            {/* Explanation */}
            <div className="mb-5">
              <h3 className="mb-3 text-lg font-semibold">
                Explanation
              </h3>

              <div className="rounded-xl bg-slate-950 p-4 text-slate-300">
                {result.explanation}
              </div>
            </div>

            {/* Recommended Action */}
            <div>
              <h3 className="mb-3 text-lg font-semibold">
                Recommended Action
              </h3>

              <div className="rounded-xl bg-slate-950 p-4 text-slate-300">
                {result.recommended_action}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}