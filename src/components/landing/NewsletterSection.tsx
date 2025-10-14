"use client";

import { useState } from "react";
import { Mail, CheckCircle, Loader2 } from "lucide-react";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    const res = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Failed to subscribe");
      setMessageType("error");
      return;
    }

    setSubscribed(true);
    setMessage(data.message);

  } catch (error) {
    setMessage("An error occurred. Please try again.");
    setMessageType("error");
  } finally {
    setLoading(false);
  }
};

  return (
    <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-700">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {subscribed ? (
            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Welcome to the ResultPins Family!
              </h3>
              <p className="text-gray-600 text-lg mb-6">
                Thank you for subscribing to our newsletter. You'll be the first to know 
                about new features, special offers, and educational updates.
              </p>
              <button
                onClick={() => setSubscribed(false)}
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Subscribe another email
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Stay Updated with ResultPins
              </h2>
              <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
                Get the latest updates on new features, special discounts, and educational 
                tips delivered straight to your inbox. No spam, just valuable information.
              </p>

              <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Subscribing...
                      </>
                    ) : (
                      "Subscribe Now"
                    )}
                  </button>
                </div>
              </form>

              <p className="text-gray-500 text-sm mt-4">
                🔒 We respect your privacy. Unsubscribe at any time.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8 text-sm text-gray-600">
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Exclusive discounts
                </div>
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Early access to features
                </div>
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Educational tips & updates
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}