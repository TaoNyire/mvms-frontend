'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <main className={darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}>
      {/* Hero Section */}
      <section
        className={`min-h-screen flex items-center justify-center px-6 ${
          darkMode
            ? 'bg-gradient-to-br from-blue-900 via-gray-800 to-gray-700'
            : 'bg-gradient-to-r from-sky-200 via-blue-100 to-sky-300'
        }`}
      >
        <div className="max-w-2xl text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-blue-900 dark:text-white">
            Empowering Change Through Volunteering
          </h1>
          <p className="text-lg md:text-xl mb-6 text-blue-800 dark:text-gray-300">
            Join our community to connect with opportunities and track your impact.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <button className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-md transition">
                Join Now
              </button>
            </Link>
            <Link href="/login">
              <button className="border border-blue-700 text-blue-700 hover:bg-blue-100 px-6 py-3 rounded-md transition">
                Login
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={darkMode ? 'bg-gray-800 py-6' : 'bg-slate-100 py-6'}>
        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          &copy; 2025 VolunteerHub. All rights reserved.{' '}
          <a href="mailto:support@volunteerhub.com" className="underline hover:text-blue-600">
            Contact Us
          </a>
        </div>
      </footer>
    </main>
  );
}
