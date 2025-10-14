"use client";

import { CheckCircle, Shield, Zap, Users } from "lucide-react";

export default function AboutSection() {
  const features = [
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Bank-level security for all transactions and scratch card deliveries"
    },
    {
      icon: Zap,
      title: "Instant Delivery",
      description: "Get your scratch cards immediately after payment via email"
    },
    {
      icon: Users,
      title: "Trusted by Thousands",
      description: "Join thousands of satisfied customers across Nigeria"
    },
    {
      icon: CheckCircle,
      title: "100% Guaranteed",
      description: "All scratch cards are verified and guaranteed to work"
    }
  ];

  return (
    <section id="about" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose Scratchcard?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We are Nigeria's most trusted platform for examination scratch cards, 
            serving students, schools, and educational centers nationwide.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-lg hover:shadow-lg transition-all duration-300"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <feature.icon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Our Story
            </h3>
            <p className="text-gray-600 mb-4">
              Scratchcard emerged from the need for a reliable, 
              convenient platform to purchase examination scratch cards. We noticed 
              the challenges students faced in accessing genuine scratch cards from 
              traditional vendors.
            </p>
            <p className="text-gray-600 mb-4">
              Today, we serve thousands of customers across all 36 states in Nigeria, 
              providing instant access to WAEC, NECO, NABTEB, and NBAIS scratch cards 
              with just a few clicks.
            </p>
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">10,000+</div>
                <div className="text-gray-600">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">50,000+</div>
                <div className="text-gray-600">Cards Delivered</div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
            <h4 className="text-2xl font-bold mb-4">Our Mission</h4>
            <p className="text-blue-100 mb-4">
              To make examination result checking accessible, affordable, and 
              convenient for every Nigerian student through technology.
            </p>
            <h4 className="text-2xl font-bold mb-4">Our Vision</h4>
            <p className="text-blue-100">
              To become Nigeria's leading digital platform for educational services, 
              empowering students to achieve academic excellence.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}