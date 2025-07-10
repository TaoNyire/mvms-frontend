import VolunteerSidebar from "./VolunteerSidebar";
import VolunteerHeader from "./VolunteerHeader";

export default function VolunteerLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <VolunteerSidebar />
      <main className="flex-1 min-w-0">
        {/* Add padding for mobile hamburger button, and account for sidebar on desktop */}
        <div className="pt-16 md:pt-0 px-4 sm:px-6 lg:px-8 py-6">
          <VolunteerHeader />
          <div className="mt-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
