"use client"
import React, { useEffect, useRef } from "react";
import { FaDumbbell } from "react-icons/fa";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const Banner = () => {
  const backgroundRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    // Smooth parallax effect for background
    gsap.to(backgroundRef.current, {
      yPercent: 15,
      ease: "power2.out", // Smoother easing function
      scrollTrigger: {
        trigger: backgroundRef.current,
        start: "top top",
        scrub: 1.5, // Slower and smoother scroll
      },
    });

    // Smoother fade-in animation for content
    gsap.fromTo(
      contentRef.current,
      { opacity: 0, y: 60 },
      {
        opacity: 1,
        y: 0,
        duration: 1.8, // Increased duration for a smoother effect
        ease: "power2.out", // Smoother easing
        delay: 0.4, // Adjusted delay for smoother entrance
        scrollTrigger: {
          trigger: contentRef.current,
          start: "top 75%",
        },
      }
    );
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Background Image with Smooth Parallax */}
      <div
        ref={backgroundRef}
        className="absolute inset-0 bg-cover bg-center transform-gpu"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80')",
        }}
        aria-hidden="true"
      ></div>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>

      {/* Content */}
      <div
        ref={contentRef}
        className="relative z-10 flex h-full flex-col items-center justify-center text-white p-5"
      >
        {/* Heading with Smooth Scale */}
        <h1 className="mb-4 font-bold tracking-tight text-3xl sm:text-4xl md:text-6xl lg:text-7xl drop-shadow transform transition-transform duration-700 ease-out hover:scale-105">
          Your <span className="text-yellow-400">Fitness</span> Journey Starts
          Here
        </h1>

        {/* Paragraph with Smooth Opacity */}
        <p className="mb-8 max-w-5xl text-center leading-loose text-xl font-semibold sm:text-xl md:text-2xl drop-shadow transition-opacity duration-700 ease-out hover:opacity-95">
          Join a community dedicated to fitness and transformation. Whether
          you're looking to lose weight, build strength, or improve your health,
          we offer the tools and support to help you succeed. Start your journey
          today with us.
        </p>

        {/* Button with Smooth Hover Effects */}
        <button className="group relative inline-flex items-center overflow-hidden rounded-full bg-yellow-400 px-8 py-3 text-lg font-bold text-black transition-all duration-700 ease-out hover:bg-yellow-500 hover:scale-105 transform">
          <span className="absolute right-0 translate-x-full transition-transform duration-700 ease-out group-hover:-translate-x-4">
            <FaDumbbell className="h-6 w-6 group-hover:rotate-90 transition-transform duration-700 ease-out" />
          </span>
          Get Started
        </button>
      </div>
    </div>
  );
};

export default Banner;
