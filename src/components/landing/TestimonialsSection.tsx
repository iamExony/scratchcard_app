"use client";

import { useState, useEffect } from "react";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";

export default function TestimonialsSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const testimonials = [
    {
      name: "Chinedu Okoro",
      role: "Student",
      location: "Lagos",
      rating: 5,
      comment: "ResultPins saved me during my WAEC exams! The instant delivery worked perfectly, and I could check my results immediately. Highly recommended!",
      cardType: "WAEC"
    },
    {
      name: "Amina Yusuf",
      role: "Parent",
      location: "Kano",
      rating: 5,
      comment: "I purchased NECO tokens for my three children. The process was smooth, and the customer support was excellent when I had questions.",
      cardType: "NECO"
    },
    {
      name: "Mr. Johnson Adebayo",
      role: "School Owner",
      location: "Ibadan",
      rating: 5,
      comment: "As a school owner, I regularly buy scratch cards in bulk. ResultPins has made this process so much easier and more reliable.",
      cardType: "Multiple"
    },
    {
      name: "Grace Chukwu",
      role: "Graduate",
      location: "Port Harcourt",
      rating: 5,
      comment: "The NABTEB card I bought worked perfectly. The email delivery is genius - no more worrying about losing scratch cards!",
      cardType: "NABTEB"
    },
    {
      name: "David Mohammed",
      role: "Teacher",
      location: "Abuja",
      rating: 5,
      comment: "I recommend ResultPins to all my students. The platform is user-friendly, and the scratch cards always work without issues.",
      cardType: "WAEC & NECO"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  // Auto-advance slides
  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section 
      id="testimonials" 
      className="py-20 relative bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url("https://cdn.prod.website-files.com/634681057b887c6f4830fae2/67dd4edf967ba7ce775bc488_8%20Effective%20Ways%20to%20Run%20a%20Successful%20Business%20Meeting.png")',
        backgroundBlendMode: 'darken'
      }}
    >
      {/* Background pattern overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            What Our Customers Say
          </h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Don't just take our word for it. Here's what thousands of satisfied 
            customers have to say about their experience with ResultPins.
          </p>
        </div>

        {/* Testimonial Slider */}
        <div className="max-w-4xl mx-auto">
          <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-white/20">
            {/* Quote Icon */}
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <Quote className="h-6 w-6 text-white" />
              </div>
            </div>

            {/* Testimonial Content */}
            <div className="text-center mb-8">
              {/* Rating */}
              <div className="flex items-center justify-center mb-6">
                {[...Array(testimonials[currentSlide].rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-6 w-6 text-yellow-400 fill-current"
                  />
                ))}
              </div>

              {/* Comment */}
              <p className="text-xl md:text-2xl text-white italic mb-8 leading-relaxed">
                "{testimonials[currentSlide].comment}"
              </p>

              {/* User Info */}
              <div className="flex items-center justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                  {testimonials[currentSlide].name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-white text-lg">
                    {testimonials[currentSlide].name}
                  </h4>
                  <p className="text-blue-200 text-sm">
                    {testimonials[currentSlide].role} • {testimonials[currentSlide].location}
                  </p>
                  <p className="text-yellow-300 text-sm font-medium">
                    {testimonials[currentSlide].cardType} User
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-all duration-200"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-all duration-200"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            {/* Slide Indicators */}
            <div className="flex justify-center space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${
                    index === currentSlide 
                      ? 'bg-white' 
                      : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-white">10K+</div>
            <div className="text-blue-200">Happy Customers</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white">50K+</div>
            <div className="text-blue-200">Cards Sold</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white">98%</div>
            <div className="text-blue-200">Success Rate</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white">24/7</div>
            <div className="text-blue-200">Support</div>
          </div>
        </div>
      </div>
    </section>
  );
}