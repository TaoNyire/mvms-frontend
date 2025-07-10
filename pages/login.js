import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import {
  HeartIcon,
  EyeIcon,
  EyeSlashIcon,
  EnvelopeIcon,
  LockClosedIcon,
  ArrowRightIcon,
  UserPlusIcon,
  XCircleIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const router = useRouter();

  // Email validation
  const validateEmail = (email) => {
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!email.trim()) {
      setEmailError("Email is required");
      return false;
    } else if (!emailRegex.test(email.trim())) {
      setEmailError("Please enter a valid email address");
      return false;
    } else {
      setEmailError("");
      return true;
    }
  };

  // Password validation
  const validatePassword = (password) => {
    if (!password) {
      setPasswordError("Password is required");
      return false;
    } else {
      setPasswordError("");
      return true;
    }
  };

  // Handle input changes
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (value) validateEmail(value);
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    if (value) validatePassword(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate form
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    setLoading(true);

    try {
      const userData = await login(email, password);
      let user = userData?.user;
      if (user && user.role && !user.roles) {
        user.roles = [{ name: user.role }];
      }

      let role = user?.role?.toLowerCase();
      if (!role && Array.isArray(user?.roles) && user.roles.length > 0) {
        role = user.roles[0].name?.toLowerCase();
      }
      if (!role) {
        throw new Error("Role not found for this user.");
      }

      // Store remember me preference
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }

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
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Sign In - MVMS</title>
        <meta name="description" content="Sign in to your MVMS account and continue making a difference" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex flex-col justify-center py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="sm:mx-auto sm:w-full sm:max-w-lg">
          <div className="flex justify-center mb-6">
            <div className="flex items-center space-x-2">
              <HeartIcon className="w-10 h-10 text-green-600" />
              <span className="text-2xl font-bold text-gray-900">MVMS</span>
            </div>
          </div>
          <h2 className="text-center text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Welcome Back
          </h2>
          <p className="text-center text-lg text-gray-600 mb-8">
            Sign in to continue your volunteer journey
          </p>
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-lg">
          <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-gray-100 sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="Enter your email address"
                  className={`block w-full pl-10 pr-3 py-3 border ${
                    emailError
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : email && !emailError
                      ? "border-green-300 focus:ring-green-500 focus:border-green-500"
                      : "border-gray-300 focus:ring-green-500 focus:border-green-500"
                  } rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 sm:text-sm text-gray-900 transition-colors`}
                />
                {email && !emailError && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  </div>
                )}
                {emailError && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <XCircleIcon className="h-5 w-5 text-red-500" />
                  </div>
                )}
              </div>
              {emailError && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <XCircleIcon className="w-4 h-4 mr-1" />
                  {emailError}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder="Enter your password"
                  className={`block w-full pl-10 pr-12 py-3 border ${
                    passwordError
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : password && !passwordError
                      ? "border-green-300 focus:ring-green-500 focus:border-green-500"
                      : "border-gray-300 focus:ring-green-500 focus:border-green-500"
                  } rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 sm:text-sm text-gray-900 transition-colors`}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              {passwordError && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <XCircleIcon className="w-4 h-4 mr-1" />
                  {passwordError}
                </p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded transition-colors"
                />
                <label htmlFor="remember-me" className="ml-3 block text-sm font-medium text-gray-700">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link href="/forgot-password" className="font-semibold text-green-600 hover:text-green-700 transition-colors">
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading || emailError || passwordError || !email || !password}
                className="w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-xl shadow-lg text-base font-semibold text-white bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing In...
                  </>
                ) : (
                  <>
                    <ShieldCheckIcon className="w-5 h-5 mr-2" />
                    Sign In
                  </>
                )}
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-4">
                <div className="flex items-center">
                  <XCircleIcon className="w-5 h-5 text-red-500 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                  </div>
                </div>
              </div>
            )}
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">
                  New to MVMS?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/register"
                className="w-full flex justify-center items-center py-3 px-4 border-2 border-gray-300 rounded-xl shadow-sm text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:border-green-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
              >
                <UserPlusIcon className="w-4 h-4 mr-2" />
                Create Account
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            By signing in, you agree to our{' '}
            <Link href="/terms" className="text-green-600 hover:text-green-700 font-medium">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-green-600 hover:text-green-700 font-medium">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
    </>
  );
}