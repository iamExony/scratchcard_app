"use client";

import { useState } from "react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setMessage(data.error || "Registration failed");
      return;
    }

    setMessage("Registration successful! You can now log in.");
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <h1 className="text-2xl font-semibold mb-4">Register</h1>

      {message && (
        <p className="mb-4 text-red-600 text-center">{message}</p>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 w-full max-w-sm"
      >
        <input
          type="text"
          placeholder="Full Name"
          className="border p-2 rounded"
          value={formData.name}
          onChange={(e) =>
            setFormData({ ...formData, name: e.target.value })
          }
        />

        <input
          type="email"
          placeholder="Email"
          className="border p-2 rounded"
          value={formData.email}
          onChange={(e) =>
            setFormData({ ...formData, email: e.target.value })
          }
        />

        <input
          type="password"
          placeholder="Password"
          className="border p-2 rounded"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
        />

        <input
          type="password"
          placeholder="Confirm Password"
          className="border p-2 rounded"
          value={formData.confirmPassword}
          onChange={(e) =>
            setFormData({
              ...formData,
              confirmPassword: e.target.value,
            })
          }
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white py-2 rounded"
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </main>
  );
}
