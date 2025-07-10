import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-gray-50 p-6">
        <AdminHeader />
        {children}
      </main>
    </div>
  );
}