'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between py-4">
            <div className="text-2xl font-bold text-gray-900">🤖 ChatBot</div>
            <Link
              href="/chat"
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Start Chat
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900">
            AI-Powered Customer Support
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Instant answers, 24/7. No waiting on hold.
          </p>

          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/chat"
              className="rounded-lg bg-blue-600 px-8 py-4 text-lg font-semibold text-white hover:bg-blue-700"
            >
              Try It Now
            </Link>
            <a
              href="https://github.com/railwayapp-templates/ai-chatbot"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border-2 border-blue-600 px-8 py-4 text-lg font-semibold text-blue-600 hover:bg-blue-50"
            >
              View on GitHub
            </a>
          </div>
        </div>

        {/* Features */}
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {[
            {
              icon: '⚡',
              title: 'Lightning Fast',
              desc: 'Streaming responses with real-time typing effect',
            },
            {
              icon: '💾',
              title: 'Persistent History',
              desc: 'All conversations saved for continuity',
            },
            {
              icon: '🚀',
              title: 'Production Ready',
              desc: 'Rate limiting, error handling, and caching',
            },
          ].map((feature, i) => (
            <div key={i} className="rounded-lg bg-white p-6 shadow">
              <div className="text-4xl">{feature.icon}</div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                {feature.title}
              </h3>
              <p className="mt-2 text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Deployment */}
        <div className="mt-16 rounded-lg bg-white p-8 shadow">
          <h2 className="text-2xl font-bold text-gray-900">
            Deploy to Railway in 3 steps
          </h2>
          <ol className="mt-6 space-y-4 text-gray-700">
            <li>
              <strong>1. Click Deploy Button</strong> - Fork the repo and connect to Railway
            </li>
            <li>
              <strong>2. Set Environment Variables</strong> - Add OpenAI API key
            </li>
            <li>
              <strong>3. Go Live</strong> - Your chatbot is live in seconds
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
