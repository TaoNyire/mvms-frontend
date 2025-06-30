import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/router";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();

const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const userData = await login(email, password); // from context
    console.log("✅ User data:", userData);

    const role = userData?.user?.role?.toLowerCase(); // normalize

    if (!role) {
      throw new Error("❌ Role not found");
    }

    // Role-based redirection
    if (role === "volunteer") {
      router.push("/volunteer/dashboard");
    } else if (role === "organization") {
      router.push("/organization/dashboard");
    } else if (role === "admin") {
      router.push("/admin/dashboard");
    } else {
      setError("Unknown role. Please contact support.");
    }
  } catch (err) {
    setError(err.response?.data?.message || err.message || "Login failed");
  }

  setLoading(false);
};


  const handleForgotPassword = () => {
    router.push("/forgot-password");
  };
return (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-blue-100 px-4">
    <div className="w-full max-w-md p-8 sm:p-10 bg-white rounded-2xl shadow-lg">
      <h2 className="text-4xl font-bold text-blue-700 text-center mb-8">Sign in to your account</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-blue-900 mb-1">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="username"
            required
            disabled={loading}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-4 py-3 rounded-md border border-blue-300 text-blue-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="relative">
          <label htmlFor="password" className="block text-sm font-medium text-blue-900 mb-1">
            Password
          </label>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            disabled={loading}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full px-4 py-3 rounded-md border border-blue-300 text-blue-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-9 text-sm text-blue-600 hover:underline"
            tabIndex={-1}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center text-sm text-blue-800">
            <input
              type="checkbox"
              className="mr-2 h-4 w-4 border-blue-300 text-blue-600 focus:ring-blue-500"
              checked={rememberMe}
              onChange={() => setRememberMe((v) => !v)}
              disabled={loading}
            />
            Remember Me
          </label>

          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-sm text-blue-600 hover:underline"
            disabled={loading}
          >
            Forgot Password?
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-md shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-400 transition disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {error && <p className="text-center text-red-500 text-sm">{error}</p>}
      </form>
    </div>
  </div>
);

}