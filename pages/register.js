import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import Link from "next/link";

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
  const router = useRouter();

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

    // Clear error for this field
    setValidationErrors((prev) => ({ ...prev, [name]: "" }));

    // Special handling for passwords
    if (name === "password" || name === "password_confirmation") {
      if (form.password !== form.password_confirmation && form.password && form.password_confirmation) {
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
      await register(form); // Make sure this sends data to backend

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
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 sm:p-10 mt-12 sm:mt-20">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Create Account</h2>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-md border ${
                validationErrors.name ? "border-red-500" : "border-gray-300"
              } text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
            />
            {validationErrors.name && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className={`w-full px-4 py-3 rounded-md border ${
                validationErrors.email ? "border-red-500" : "border-gray-300"
              } text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
            />
            {validationErrors.email && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="create password"
              className={`w-full px-4 py-3 rounded-md border ${
                validationErrors.password ? "border-red-500" : "border-gray-300"
              } text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
            />
            {validationErrors.password && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              id="password_confirmation"
              name="password_confirmation"
              type="password"
              value={form.password_confirmation}
              onChange={handleChange}
              placeholder="confirm password"
              className={`w-full px-4 py-3 rounded-md border ${
                validationErrors.password_confirmation ? "border-red-500" : "border-gray-300"
              } text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
            />
            {validationErrors.password_confirmation && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.password_confirmation}</p>
            )}
          </div>

          {/* Role */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              id="role"
              name="role"
              value={form.role}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-md border ${
                validationErrors.role ? "border-red-500" : "border-gray-300"
              } text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
            >
              <option value="" disabled>Select Role</option>
              <option value="volunteer">volunteer</option>
              <option value="organization">organization</option>
              <option value="admin">admin</option>
            </select>
            {validationErrors.role && (
              <p className="text-red-500 text-sm mt-1">{validationErrors.role}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={Object.keys(validationErrors).length > 0 || loading}
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Registering..." : "Register"}
          </button>

          {/* Error Message */}
          {error && (
            <p className="text-center text-red-500 text-sm mt-2">{error}</p>
          )}
        </form>

        {/* Login Redirect */}
        <p className="mt-6 text-center text-gray-900">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}