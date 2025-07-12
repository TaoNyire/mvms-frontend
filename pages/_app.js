import '../src/app/globals.css'; // Import Tailwind and your custom CSS
import { AuthProvider } from "../context/AuthContext";
import AdminLayout from "../components/admin/AdminLayout";
import VolunteerLayout from "../components/volunteer/VolunteerLayout";
import OrgLayout from "../components/organization/OrgLayout";
import AppWrapper from "../components/AppWrapper";

export default function App({ Component, pageProps, router }) {
  // Check route and wrap with correct layout
  if (router.pathname.startsWith("/admin")) {
    return (
      <AuthProvider>
        <AppWrapper>
          <AdminLayout>
            <Component {...pageProps} />
          </AdminLayout>
        </AppWrapper>
      </AuthProvider>
    );
  }
  if (router.pathname.startsWith("/volunteer")) {
    return (
      <AuthProvider>
        <AppWrapper>
          <VolunteerLayout>
            <Component {...pageProps} />
          </VolunteerLayout>
        </AppWrapper>
      </AuthProvider>
    );
  }
  if (router.pathname.startsWith("/organization")) {
    return (
      <AuthProvider>
        <AppWrapper>
          <OrgLayout>
            <Component {...pageProps} />
          </OrgLayout>
        </AppWrapper>
      </AuthProvider>
    );
  }
  // Default: no dashboard layout
  return (
    <AuthProvider>
      <AppWrapper>
        <Component {...pageProps} />
      </AppWrapper>
    </AuthProvider>
  );
}