import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import Link from "next/link";
import Head from "next/head";
import {
  HeartIcon,
  EyeIcon,
  EyeSlashIcon,
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

export default function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    role: "",
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const router = useRouter();

  // Password strength calculation
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  };

  // Role descriptions
  const roleDescriptions = {
    volunteer: {
      title: "Volunteer",
      description: "Join volunteer opportunities and make a difference in your community",
      icon: <UserIcon className="w-6 h-6" />,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    },
    organization: {
      title: "Organization",
      description: "Post volunteer opportunities and manage your volunteer programs",
      icon: <BuildingOfficeIcon className="w-6 h-6" />,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    admin: {
      title: "Administrator",
      description: "Manage the platform and oversee all volunteer activities",
      icon: <ShieldCheckIcon className="w-6 h-6" />,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200"
    }
  };

  // Validate form fields
  const validateForm = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = "Name can't be empty";
    if (!form.email.trim()) {
      errors.email = "Email can't be empty";
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(form.email.trim())
    ) {
      errors.email = "Invalid email address";
    }
    if (!form.password) errors.password = "Password can't be empty";
    if (!form.password_confirmation)
      errors.password_confirmation = "Confirm password can't be empty";
    else if (form.password !== form.password_confirmation)
      errors.password_confirmation = "Passwords do not match";
    if (!form.role) errors.role = "Please select a role";

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Re-validate form whenever any field changes
  useEffect(() => {
    validateForm();
  }, [form]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setValidationErrors((prev) => ({ ...prev, [name]: "" }));

    // Special handling for passwords
    if (name === "password") {
      setPasswordStrength(calculatePasswordStrength(value));
      if (form.password_confirmation && value !== form.password_confirmation) {
        setValidationErrors((prev) => ({
          ...prev,
          password_confirmation: "Passwords do not match",
        }));
      }
    }

    if (name === "password_confirmation") {
      if (form.password && value !== form.password) {
        setValidationErrors((prev) => ({
          ...prev,
          password_confirmation: "Passwords do not match",
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    setLoading(true);

    try {
      await register(form);

      if (form.role === "volunteer") {
        router.push("/volunteer/dashboard");
      } else if (form.role === "organization") {
        router.push("/organization/dashboard");
      } else if (form.role === "admin") {
        router.push("/admin/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

   return (
    <>
      <Head>
        <title>Join MVMS - Create Your Account</title>
        <meta name="description" content="Join the Malawi Volunteer Management System and start making a difference in your community" />
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
            Join Our Community
          </h2>
          <p className="text-center text-lg text-gray-600 mb-8">
            Create your account and start making a difference today
          </p>
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-lg">
          <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-gray-100 sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className={`block w-full pl-10 pr-3 py-3 border ${
                    validationErrors.name
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 focus:ring-green-500 focus:border-green-500"
                  } rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 sm:text-sm text-gray-900 transition-colors`}
                />
                {validationErrors.name && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <XCircleIcon className="h-5 w-5 text-red-500" />
                  </div>
                )}
              </div>
              {validationErrors.name && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <XCircleIcon className="w-4 h-4 mr-1" />
                  {validationErrors.name}
                </p>
              )}
            </div>

            {/* Email */}
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
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={`block w-full pl-10 pr-3 py-3 border ${
                    validationErrors.email
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 focus:ring-green-500 focus:border-green-500"
                  } rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 sm:text-sm text-gray-900 transition-colors`}
                />
                {validationErrors.email && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <XCircleIcon className="h-5 w-5 text-red-500" />
                  </div>
                )}
              </div>
              {validationErrors.email && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <XCircleIcon className="w-4 h-4 mr-1" />
                  {validationErrors.email}
                </p>
              )}
            </div>

            {/* Password */}
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
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  className={`block w-full pl-10 pr-12 py-3 border ${
                    validationErrors.password
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
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

              {/* Password Strength Indicator */}
              {form.password && (
                <div className="mt-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1">
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            className={`h-2 flex-1 rounded-full ${
                              level <= passwordStrength
                                ? passwordStrength <= 2
                                  ? 'bg-red-400'
                                  : passwordStrength <= 3
                                  ? 'bg-yellow-400'
                                  : 'bg-green-400'
                                : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className={`text-xs font-medium ${
                      passwordStrength <= 2 ? 'text-red-600' :
                      passwordStrength <= 3 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {passwordStrength <= 2 ? 'Weak' :
                       passwordStrength <= 3 ? 'Medium' : 'Strong'}
                    </span>
                  </div>
                </div>
              )}

              {validationErrors.password && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <XCircleIcon className="w-4 h-4 mr-1" />
                  {validationErrors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="password_confirmation" className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password_confirmation"
                  name="password_confirmation"
                  type={showConfirmPassword ? "text" : "password"}
                  value={form.password_confirmation}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className={`block w-full pl-10 pr-12 py-3 border ${
                    validationErrors.password_confirmation
                      ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                      : form.password_confirmation && form.password === form.password_confirmation
                      ? "border-green-300 focus:ring-green-500 focus:border-green-500"
                      : "border-gray-300 focus:ring-green-500 focus:border-green-500"
                  } rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 sm:text-sm text-gray-900 transition-colors`}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center space-x-2">
                  {form.password_confirmation && form.password === form.password_confirmation && !validationErrors.password_confirmation && (
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  )}
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              {validationErrors.password_confirmation && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <XCircleIcon className="w-4 h-4 mr-1" />
                  {validationErrors.password_confirmation}
                </p>
              )}
              {form.password_confirmation && form.password === form.password_confirmation && !validationErrors.password_confirmation && (
                <p className="mt-2 text-sm text-green-600 flex items-center">
                  <CheckCircleIcon className="w-4 h-4 mr-1" />
                  Passwords match!
                </p>
              )}
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-4">
                Choose Your Role
              </label>
              <div className="space-y-3">
                {Object.entries(roleDescriptions).map(([roleKey, roleInfo]) => (
                  <div
                    key={roleKey}
                    className={`relative rounded-xl border-2 p-4 cursor-pointer transition-all duration-200 ${
                      form.role === roleKey
                        ? `${roleInfo.borderColor} ${roleInfo.bgColor} shadow-md`
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      setForm(prev => ({ ...prev, role: roleKey }));
                      setValidationErrors(prev => ({ ...prev, role: "" }));
                    }}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`flex-shrink-0 ${form.role === roleKey ? roleInfo.color : 'text-gray-400'}`}>
                        {roleInfo.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className={`text-sm font-semibold ${form.role === roleKey ? roleInfo.color : 'text-gray-900'}`}>
                            {roleInfo.title}
                          </h3>
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            form.role === roleKey
                              ? `${roleInfo.borderColor.replace('border-', 'border-')} bg-current`
                              : 'border-gray-300'
                          }`}>
                            {form.role === roleKey && (
                              <div className={`w-2 h-2 rounded-full bg-white m-0.5`} />
                            )}
                          </div>
                        </div>
                        <p className={`mt-1 text-xs ${form.role === roleKey ? 'text-gray-700' : 'text-gray-500'}`}>
                          {roleInfo.description}
                        </p>
                      </div>
                    </div>
                    <input
                      type="radio"
                      name="role"
                      value={roleKey}
                      checked={form.role === roleKey}
                      onChange={handleChange}
                      className="sr-only"
                    />
                  </div>
                ))}
              </div>
              {validationErrors.role && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <XCircleIcon className="w-4 h-4 mr-1" />
                  {validationErrors.role}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={Object.keys(validationErrors).length > 0 || loading || !form.role}
                className="w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-xl shadow-lg text-base font-semibold text-white bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </>
                ) : (
                  <>
                    <UserGroupIcon className="w-5 h-5 mr-2" />
                    Create Account
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
                  Already have an account?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/login"
                className="w-full flex justify-center items-center py-3 px-4 border-2 border-gray-300 rounded-xl shadow-sm text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:border-green-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
              >
                <UserIcon className="w-4 h-4 mr-2" />
                Sign In Instead
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            By creating an account, you agree to our{' '}
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