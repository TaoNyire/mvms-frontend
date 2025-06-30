import OrgSidebar from "./OrgSidebar";

export default function OrgLayout({ children }) {
  return (
    <div className="flex">
      <OrgSidebar />
      <main className="flex-1 p-6 bg-gray-50 min-h-screen">{children}</main>
    </div>
  );
}
