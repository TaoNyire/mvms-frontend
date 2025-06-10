import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/router";
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
  const [error, setError] = useState("");
  const router = useRouter();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await register(form);
      router.push("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg mx-auto mt-12">
      <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          placeholder="Name"
        />
        <input
          className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
          placeholder="Email"
          type="email"
        />
        <input
          className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          name="password"
          value={form.password}
          onChange={handleChange}
          required
          placeholder="Password"
          type="password"
        />
        <input
          className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          name="password_confirmation"
          value={form.password_confirmation}
          onChange={handleChange}
          required
          placeholder="Confirm Password"
          type="password"
        />
        <select
          className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          name="role"
          value={form.role}
          onChange={handleChange}
          required
        >
          <option value="" disabled>Select Role</option>
          <option value="admin">Admin</option>
          <option value="volunteer">Volunteer</option>
          <option value="organisation">Organisation</option>
        </select>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Register
        </button>
        {error && <div className="text-red-500 text-center">{error}</div>}
      </form>
      <p className="mt-4 text-center">
        Already have an account?{" "}
        <Link href="/login" className="text-blue-600 hover:underline">Login</Link>
      </p>
    </div>
  );
}