import OrgSidebar from "./OrgSidebar";
import OrganizationHeader from "./OrganizationHeader";

export default function OrgLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      <OrgSidebar />
      <main className="flex-1 bg-gray-50 p-6">
        <OrganizationHeader />
        {children}
      </main>
    </div>
  );
}
