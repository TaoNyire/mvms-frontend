// components/organization/Footer.js
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} VolunteerConnect. All rights reserved.</p>
          <div className="mt-4 md:mt-0">
            <Link href="/terms" className="hover:text-indigo-600 mr-4">Terms</Link>
            <Link href="/privacy" className="hover:text-indigo-600">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}