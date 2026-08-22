import {
  ArrowLeft,
  FileText,
  Mail,
  ShieldCheck,
  Upload,
} from "lucide-react";

import { useState } from "react";

import {
  analyzeMessage,
  type AnalysisResponse,
} from "../services/api";

import mammoth from "mammoth";

import * as pdfjsLib from "pdfjs-dist";

import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";


// ============================================================
// PDF WORKER
// ============================================================

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;


// ============================================================
// COMPONENT
// ============================================================

export default function AnalyzePage() {

  // ----------------------------------------------------------
  // Input states
  // ----------------------------------------------------------

  const [sender, setSender] = useState("");

  const [subject, setSubject] = useState("");

  const [message, setMessage] = useState("");


  // ----------------------------------------------------------
  // File state
  // ----------------------------------------------------------

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);


  // ----------------------------------------------------------
  // Analysis states
  // ----------------------------------------------------------

  const [result, setResult] =
    useState<AnalysisResponse | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [fileLoading, setFileLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  // ==========================================================
  // EXTRACT TEXT FROM TXT
  // ==========================================================

  const extractTextFromTxt = async (
    file: File,
  ): Promise<string> => {

    return await file.text();
  };


  // ==========================================================
  // PARSE EML USING BACKEND
  // ==========================================================

  const extractTextFromEml = async (
    file: File,
  ): Promise<{
    sender: string;
    subject: string;
    message: string;
  }> => {

    const formData = new FormData();

    formData.append("file", file);


    const response = await fetch(
  "https://phishexplain-ai-3.onrender.com/api/parse-eml",
  {
    method: "POST",
    body: formData,
  },
    );
    if (!response.ok) {

      const errorText =
        await response.text();

      throw new Error(
        `Unable to parse email (${response.status}): ${errorText}`,
      );
    }


    const data =
      await response.json();


    return {
      sender: data.sender || "",
      subject: data.subject || "",
      message: data.message || "",
    };
  };


  // ==========================================================
  // EXTRACT TEXT FROM DOCX
  // ==========================================================

  const extractTextFromDocx = async (
    file: File,
  ): Promise<string> => {

    const arrayBuffer =
      await file.arrayBuffer();


    const result =
      await mammoth.extractRawText({
        arrayBuffer,
      });


    return result.value.trim();
  };


  // ==========================================================
  // EXTRACT TEXT FROM PDF
  // ==========================================================

  const extractTextFromPdf = async (
    file: File,
  ): Promise<string> => {

    const arrayBuffer =
      await file.arrayBuffer();


    const pdf =
      await pdfjsLib.getDocument({
        data: arrayBuffer,
      }).promise;


    let extractedText = "";


    for (
      let pageNumber = 1;
      pageNumber <= pdf.numPages;
      pageNumber++
    ) {

      const page =
        await pdf.getPage(pageNumber);


      const textContent =
        await page.getTextContent();


      const pageText =
        textContent.items
          .map((item) => {

            if ("str" in item) {
              return item.str;
            }

            return "";
          })
          .join(" ");


      extractedText +=
        pageText + "\n\n";
    }


    return extractedText.trim();
  };


  // ==========================================================
  // HANDLE FILE UPLOAD
  // ==========================================================

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {

    const file =
      event.target.files?.[0];


    if (!file) {
      return;
    }


    // --------------------------------------------------------
    // Reset previous state
    // --------------------------------------------------------

    setSelectedFile(file);

    setError("");

    setResult(null);

    setFileLoading(true);


    try {

      const fileName =
        file.name.toLowerCase();


      // ------------------------------------------------------
      // TXT
      // ------------------------------------------------------

      if (
        fileName.endsWith(".txt")
      ) {

        const text =
          await extractTextFromTxt(file);


        setMessage(text);

        return;
      }


      // ------------------------------------------------------
      // EML
      // ------------------------------------------------------

      if (
        fileName.endsWith(".eml")
      ) {

        const email =
          await extractTextFromEml(file);


        // Fill sender

        setSender(
          email.sender,
        );


        // Fill subject

        setSubject(
          email.subject,
        );


        // Fill clean email body

        setMessage(
          email.message,
        );


        return;
      }


      // ------------------------------------------------------
      // DOCX
      // ------------------------------------------------------

      if (
        fileName.endsWith(".docx")
      ) {

        const text =
          await extractTextFromDocx(file);


        setMessage(text);

        return;
      }


      // ------------------------------------------------------
      // PDF
      // ------------------------------------------------------

      if (
        fileName.endsWith(".pdf")
      ) {

        const text =
          await extractTextFromPdf(file);


        if (!text.trim()) {

          throw new Error(
            "No readable text was found in this PDF.",
          );
        }


        setMessage(text);

        return;
      }


      // ------------------------------------------------------
      // Unsupported file
      // ------------------------------------------------------

      throw new Error(
        "Unsupported file type. Please upload .txt, .eml, .pdf, or .docx files.",
      );


    } catch (err) {

      console.error(
        "File extraction error:",
        err,
      );


      setError(
        err instanceof Error
          ? err.message
          : "Unable to read the uploaded file.",
      );


    } finally {

      setFileLoading(false);
    }
  };


  // ==========================================================
  // ANALYZE MESSAGE
  // ==========================================================

  const handleAnalyze = async () => {

    setError("");

    setResult(null);


    // --------------------------------------------------------
    // Validate message
    // --------------------------------------------------------

    if (!message.trim()) {

      setError(
        "Please enter a message or upload a file before analyzing.",
      );

      return;
    }


    try {

      setLoading(true);


      // ------------------------------------------------------
      // Call FastAPI
      // ------------------------------------------------------

      const analysisResult =
        await analyzeMessage({

          sender,

          subject,

          message,
        });


      setResult(
        analysisResult,
      );


    } catch (err) {

      console.error(
        "Analysis error:",
        err,
      );


      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while analyzing the message.",
      );


    } finally {

      setLoading(false);
    }
  };


  // ==========================================================
  // CLEAR ALL
  // ==========================================================

  const handleClear = () => {

    setSender("");

    setSubject("");

    setMessage("");

    setSelectedFile(null);

    setResult(null);

    setError("");


    // Reset file input

    const fileInput =
      document.getElementById(
        "email-file",
      ) as HTMLInputElement | null;


    if (fileInput) {
      fileInput.value = "";
    }
  };


  // ==========================================================
  // UI
  // ==========================================================

  return (

    <div className="min-h-screen bg-slate-50">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="border-b border-slate-200 bg-white">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">

              <ShieldCheck size={23} />

            </div>


            <div>

              <h1 className="text-lg font-bold text-slate-900">
                PhishExplain AI
              </h1>

              <p className="text-xs text-slate-500">
                Intelligent phishing analysis
              </p>

            </div>

          </div>


          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >

            <ArrowLeft size={17} />

            Back to Home

          </a>

        </div>

      </header>


      {/* ======================================================
          MAIN
      ====================================================== */}

      <main className="mx-auto max-w-5xl px-6 py-12">

        {/* Page Heading */}

        <div className="mb-10 text-center">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">

            <Mail size={28} />

          </div>


          <h2 className="mt-5 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">

            Analyze a Message

          </h2>


          <p className="mx-auto mt-3 max-w-2xl leading-7 text-slate-600">

            Paste an email or upload a document below and
            PhishExplain AI will analyze it for potential
            phishing indicators.

          </p>

        </div>


        {/* ==================================================
            ANALYSIS CARD
        ================================================== */}

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">

          <div>

            <h3 className="text-xl font-bold text-slate-900">

              Enter Message Details

            </h3>


            <p className="mt-1 text-sm text-slate-500">

              Provide as much information as possible for
              a better analysis.

            </p>

          </div>


          {/* =================================================
              INPUTS
          ================================================= */}

          <div className="mt-7 space-y-6">

            {/* Sender */}

            <div>

              <label
                htmlFor="sender"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >

                Sender

              </label>


              <input
                id="sender"
                type="email"
                value={sender}
                onChange={(event) =>
                  setSender(event.target.value)
                }
                placeholder="security@example.com"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />

            </div>


            {/* Subject */}

            <div>

              <label
                htmlFor="subject"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >

                Subject

              </label>


              <input
                id="subject"
                type="text"
                value={subject}
                onChange={(event) =>
                  setSubject(event.target.value)
                }
                placeholder="Urgent account verification required"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />

            </div>


            {/* Message */}

            <div>

              <label
                htmlFor="message"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >

                Message Body

              </label>


              <textarea
                id="message"
                value={message}
                onChange={(event) =>
                  setMessage(event.target.value)
                }
                placeholder="Paste the email or message content here, or upload a file below..."
                rows={10}
                className="w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />

            </div>

          </div>


          {/* =================================================
              UPLOAD DIVIDER
          ================================================= */}

          <div className="my-8 flex items-center gap-4">

            <div className="h-px flex-1 bg-slate-200" />

            <span className="text-sm text-slate-400">
              OR
            </span>

            <div className="h-px flex-1 bg-slate-200" />

          </div>


          {/* =================================================
              FILE UPLOAD
          ================================================= */}

          <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center transition hover:border-blue-400 hover:bg-blue-50">

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">

              <Upload size={23} />

            </div>


            <h4 className="mt-4 font-semibold text-slate-900">

              Upload Email / Message

            </h4>


            <p className="mt-2 text-sm text-slate-500">

              Supported formats: .txt, .eml, .pdf, .docx

            </p>


            <label
              htmlFor="email-file"
              className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >

              <FileText size={17} />

              {fileLoading
                ? "Reading File..."
                : "Choose File"}


              <input
                id="email-file"
                type="file"
                accept=".txt,.eml,.pdf,.docx"
                className="hidden"
                disabled={fileLoading}
                onChange={handleFileChange}
              />

            </label>


            {/* Selected file */}

            {selectedFile &&
              !fileLoading && (

                <div className="mt-4">

                  <p className="text-sm font-medium text-blue-600">

                    Selected: {selectedFile.name}

                  </p>


                  {message && (

                    <p className="mt-1 text-xs text-emerald-600">

                      ✓ File content extracted successfully

                    </p>

                  )}

                </div>

              )}

          </div>


          {/* =================================================
              BUTTONS
          ================================================= */}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">

            <button
              type="button"
              onClick={handleAnalyze}
              disabled={
                loading ||
                fileLoading
              }
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-4 font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >

              <ShieldCheck size={20} />

              {loading
                ? "Analyzing..."
                : "Analyze for Phishing"}

            </button>


            <button
              type="button"
              onClick={handleClear}
              disabled={
                loading ||
                fileLoading
              }
              className="rounded-xl border border-slate-300 bg-white px-6 py-4 font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >

              Clear

            </button>

          </div>


          {/* Disclaimer */}

          <p className="mt-4 text-center text-xs leading-5 text-slate-500">

            Detection results are predictions and should not
            be treated as a definitive security verdict.

          </p>

        </div>


        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (

          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">

            {error}

          </div>

        )}


        {/* ==================================================
            RESULT
        ================================================== */}

        {result && (

          <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">

            {/* Result Header */}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <p className="text-sm font-medium text-slate-500">

                  Analysis Result

                </p>


                <h3 className="mt-1 text-2xl font-bold text-slate-900">

                  {result.prediction === "phishing"
                    ? "Phishing Detected"
                    : "Likely Legitimate"}

                </h3>

              </div>


              <span
                className={`inline-flex w-fit rounded-full px-4 py-2 text-sm font-bold ${
                  result.risk_level === "high"
                    ? "bg-red-100 text-red-700"
                    : result.risk_level === "medium"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-emerald-100 text-emerald-700"
                }`}
              >

                {result.risk_level.toUpperCase()} RISK

              </span>

            </div>


            {/* Confidence */}

            <div className="mt-6">

              <div className="mb-2 flex justify-between text-sm">

                <span className="font-medium text-slate-600">

                  Confidence

                </span>


                <span className="font-bold text-slate-900">

                  {Math.round(
                    result.confidence * 100,
                  )}

                  %

                </span>

              </div>


              <div className="h-3 overflow-hidden rounded-full bg-slate-200">

                <div
                  className={`h-full rounded-full ${
                    result.risk_level === "high"
                      ? "bg-red-500"
                      : result.risk_level === "medium"
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                  }`}
                  style={{
                    width: `${result.confidence * 100}%`,
                  }}
                />

              </div>

            </div>


            {/* Indicators */}

            <div className="mt-7">

              <h4 className="font-bold text-slate-900">

                Threat Indicators

              </h4>


              <div className="mt-3 grid gap-3 sm:grid-cols-2">

                {result.indicators.map(
                  (indicator) => (

                    <div
                      key={indicator}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700"
                    >

                      <span className="mr-2 text-red-500">

                        ●

                      </span>


                      {indicator}

                    </div>

                  ),
                )}

              </div>

            </div>


            {/* Explanation */}

            <div className="mt-7 rounded-2xl bg-blue-50 p-5">

              <h4 className="font-bold text-blue-800">

                Security Explanation

              </h4>


              <p className="mt-2 leading-7 text-slate-600">

                {result.explanation}

              </p>

            </div>


            {/* Recommendation */}

            <div className="mt-4 rounded-2xl bg-emerald-50 p-5">

              <h4 className="font-bold text-emerald-800">

                Recommended Action

              </h4>


              <p className="mt-2 leading-7 text-slate-600">

                {result.recommended_action}

              </p>

            </div>

          </div>

        )}

      </main>

    </div>
  );
}