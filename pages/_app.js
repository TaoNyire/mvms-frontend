import '../src/app/globals.css'; // Import Tailwind and your custom CSS
import { AuthProvider } from "../context/AuthContext";
import AdminLayout from "../components/admin/AdminLayout";
import VolunteerLayout from "../components/volunteer/VolunteerLayout";
import OrgLayout from "../components/organization/OrgLayout";

export default function App({ Component, pageProps, router }) {
  // Check route and wrap with correct layout
  if (router.pathname.startsWith("/admin")) {
    return (
      <AuthProvider>
        <AdminLayout>
          <Component {...pageProps} />
        </AdminLayout>
      </AuthProvider>
    );
  }
  if (router.pathname.startsWith("/volunteer")) {
    return (
      <AuthProvider>
        <VolunteerLayout>
          <Component {...pageProps} />
        </VolunteerLayout>
      </AuthProvider>
    );
  }
  if (router.pathname.startsWith("/organization")) {
    return (
      <AuthProvider>
        <OrgLayout>
          <Component {...pageProps} />
        </OrgLayout>
      </AuthProvider>
    );
  }
  // Default: no dashboard layout
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}