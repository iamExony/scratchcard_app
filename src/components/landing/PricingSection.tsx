"use client";

import { Check, Zap } from "lucide-react";

export default function PricingSection() {
  const plans = [
    {
      name: "WAEC Scratch Card",
      price: "₦3,500",
      originalPrice: "₦4,000",
      description: "Check your WAEC results instantly",
      features: [
        "Instant email delivery",
        "Valid for one result checking",
        "24/7 availability",
        "Customer support",
        "Mobile friendly"
      ],
      popular: false,
      cardType: "WAEC"
    },
    {
      name: "NECO Token",
      price: "₦1,200",
      originalPrice: "₦1,500",
      description: "Access your NECO results immediately",
      features: [
        "Instant email delivery",
        "Valid for one result checking",
        "24/7 availability",
        "Customer support",
        "Mobile friendly",
        "Bulk purchase discounts"
      ],
      popular: true,
      cardType: "NECO"
    },
    {
      name: "NABTEB Pin",
      price: "₦1,800",
      originalPrice: "₦2,000",
      description: "Check NABTEB results with ease",
      features: [
        "Instant email delivery",
        "Valid for one result checking",
        "24/7 availability",
        "Customer support",
        "Mobile friendly",
        "Secure payment"
      ],
      popular: false,
      cardType: "NABTEB"
    },
    {
      name: "NBAIS Checker",
      price: "₦1,500",
      originalPrice: "₦1,800",
      description: "Access NBAIS results instantly",
      features: [
        "Instant email delivery",
        "Valid for one result checking",
        "24/7 availability",
        "Customer support",
        "Mobile friendly",
        "Secure payment"
      ],
      popular: false,
      cardType: "NBAIS"
    }
  ];

  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Affordable Pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get the best value for your money with our competitive pricing. 
            All cards come with instant delivery and full support.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-2xl p-6 border-2 transition-all duration-300 hover:scale-105 ${
                plan.popular
                  ? "border-blue-500 bg-blue-50 shadow-xl"
                  : "border-gray-200 bg-white shadow-lg"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <Zap className="h-4 w-4" />
                    Most Popular
                  </span>
                </div>
              )}

              {/* Card Header */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-3xl font-bold text-gray-900">
                    {plan.price}
                  </span>
                  <span className="text-lg text-gray-500 line-through">
                    {plan.originalPrice}
                  </span>
                </div>
                <p className="text-gray-600 text-sm">
                  {plan.description}
                </p>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button
                onClick={() => window.location.href = '/register'}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${
                  plan.popular
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-gray-900 hover:bg-gray-800 text-white"
                }`}
              >
                Get {plan.cardType} Card
              </button>
            </div>
          ))}
        </div>

        {/* Bulk Purchase Note */}
        <div className="mt-12 text-center">
          <p className="text-gray-600">
            Need cards in bulk for your school or organization?{" "}
            <a href="#contact" className="text-blue-600 hover:text-blue-700 font-semibold">
              Contact us for special discounts
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}