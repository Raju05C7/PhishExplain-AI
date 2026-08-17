import {
  ArrowRight,
  Brain,
  CheckCircle2,
  MailWarning,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  {
    icon: ShieldCheck,
    title: "ML Phishing Detection",
    description:
      "Analyze message content and identify patterns associated with phishing attacks.",
  },
  {
    icon: Brain,
    title: "AI Security Explanation",
    description:
      "Understand why a message was flagged through a simple, human-readable explanation.",
  },
  {
    icon: MailWarning,
    title: "Threat Indicators",
    description:
      "See suspicious URLs, urgency language, credential requests, and other warning signals.",
  },
];

const steps = [
  "Enter or upload an email",
  "Machine learning analyzes the message",
  "Risk indicators are identified",
  "Generative AI explains the threat",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* ==================== NAVBAR ==================== */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Logo */}
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

          {/* Navigation */}
          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#home"
              className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
            >
              Home
            </a>

            <a
              href="#how-it-works"
              className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
            >
              How It Works
            </a>

            <a
              href="#features"
              className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
            >
              Features
            </a>

            <a
              href="#about"
              className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
            >
              About
            </a>
          </nav>

          {/* Get Started */}
          <Link
            to="/analyze"
            className="hidden rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 md:block"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* ==================== HERO ==================== */}
      <main id="home">
        <section className="overflow-hidden">
          <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 py-20 lg:grid-cols-2 lg:py-28">
            {/* Hero Content */}
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
                <Sparkles size={16} />
                AI-powered cybersecurity assistance
              </div>

              <h2 className="max-w-3xl text-5xl font-bold leading-tight tracking-tight text-slate-950 md:text-6xl">
                Detect Phishing.
                <span className="block text-blue-600">
                  Understand the Threat.
                </span>
                Stay Safe.
              </h2>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                PhishExplain AI combines machine learning and generative AI to
                detect suspicious messages and explain cybersecurity threats in
                simple language.
              </p>

              {/* Buttons */}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/analyze"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 font-semibold text-white transition hover:bg-blue-700"
                >
                  Analyze a Message
                  <ArrowRight size={18} />
                </Link>

                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3.5 font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Learn How It Works
                </a>
              </div>

              {/* Trust indicators */}
              <div className="mt-8 flex flex-wrap gap-5 text-sm text-slate-500">
                <span className="flex items-center gap-2">
                  <CheckCircle2
                    size={17}
                    className="text-emerald-600"
                  />
                  ML-based detection
                </span>

                <span className="flex items-center gap-2">
                  <CheckCircle2
                    size={17}
                    className="text-emerald-600"
                  />
                  AI explanations
                </span>

                <span className="flex items-center gap-2">
                  <CheckCircle2
                    size={17}
                    className="text-emerald-600"
                  />
                  Security awareness
                </span>
              </div>
            </div>

            {/* Security Preview */}
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/50">
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Security Analysis
                  </p>

                  <p className="text-xs text-slate-500">
                    Recent message scan
                  </p>
                </div>

                <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                  HIGH RISK
                </span>
              </div>

              {/* Message Preview */}
              <div className="mt-5 rounded-2xl bg-slate-50 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600">
                    <MailWarning size={20} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Urgent Account Verification
                    </p>

                    <p className="text-xs text-slate-500">
                      suspicious-message@example.com
                    </p>
                  </div>
                </div>

                {/* Risk */}
                <div className="mt-5">
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-medium text-slate-600">
                      Risk Score
                    </span>

                    <span className="font-bold text-red-600">
                      94%
                    </span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full w-[94%] rounded-full bg-red-500" />
                  </div>
                </div>

                {/* Indicators */}
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {[
                    "Urgency language",
                    "Suspicious URL",
                    "Credential request",
                    "Domain mismatch",
                  ].map((indicator) => (
                    <div
                      key={indicator}
                      className="rounded-xl border border-red-100 bg-white px-4 py-3 text-sm font-medium text-slate-700"
                    >
                      <span className="mr-2 text-red-500">
                        ●
                      </span>

                      {indicator}
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Explanation */}
              <div className="mt-5 rounded-2xl bg-blue-50 p-5">
                <div className="flex items-center gap-2 text-blue-700">
                  <Brain size={18} />

                  <p className="font-semibold">
                    AI Explanation
                  </p>
                </div>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  This message creates urgency and requests sensitive
                  credentials through a suspicious link. These are common
                  characteristics of phishing attacks.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== HOW IT WORKS ==================== */}
        <section
          id="how-it-works"
          className="border-y border-slate-200 bg-white"
        >
          <div className="mx-auto max-w-7xl px-6 py-20">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                How It Works
              </p>

              <h3 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
                From suspicious message to clear explanation
              </h3>

              <p className="mt-4 leading-7 text-slate-600">
                Our pipeline separates threat detection from explanation so
                users can understand both the result and the reasons behind it.
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-4">
              {steps.map((step, index) => (
                <div
                  key={step}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-6"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-bold text-white">
                    {index + 1}
                  </div>

                  <p className="mt-5 font-semibold text-slate-900">
                    {step}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ==================== FEATURES ==================== */}
        <section id="features">
          <div className="mx-auto max-w-7xl px-6 py-20">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                Core Features
              </p>

              <h3 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
                Security analysis without the technical complexity
              </h3>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon;

                return (
                  <div
                    key={feature.title}
                    className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Icon size={23} />
                    </div>

                    <h4 className="mt-6 text-xl font-bold text-slate-900">
                      {feature.title}
                    </h4>

                    <p className="mt-3 leading-7 text-slate-600">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ==================== ABOUT ==================== */}
        <section id="about" className="bg-slate-900">
          <div className="mx-auto max-w-7xl px-6 py-20">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-cyan-400">
                  PhishExplain AI
                </p>

                <h3 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
                  Machine Learning detects.
                  <span className="block text-cyan-400">
                    Generative AI explains.
                  </span>
                </h3>

                <p className="mt-5 max-w-xl leading-7 text-slate-300">
                  The platform helps students, employees, cybersecurity
                  beginners, and organizations understand suspicious messages
                  and take safer actions.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-700 bg-slate-800 p-7">
                <div className="space-y-5">
                  {[
                    "Message analysis",
                    "ML phishing classification",
                    "Threat indicator detection",
                    "AI-generated explanation",
                    "Recommended safe action",
                  ].map((item, index) => (
                    <div
                      key={item}
                      className="flex items-center gap-4"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-400 font-bold text-slate-900">
                        {index + 1}
                      </div>

                      <p className="font-medium text-slate-200">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ==================== FOOTER ==================== */}
      <footer className="bg-slate-950">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex flex-col gap-4 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
            <p>
              © 2026 PhishExplain AI. Educational cybersecurity tool.
            </p>

            <p className="max-w-2xl">
              Detection results are predictions and should not be treated as a
              definitive security verdict.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}