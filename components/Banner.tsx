"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import logo from "../public/logo.jpg";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Menu } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const navItems = [
  { name: "About", href: "#about" },
  { name: "Plans", href: "#plan" },
  { name: "Training", href: "#training" },
  { name: "Personal Training", href: "#pt" },
];

export default function Banner() {
  const backgroundRef = useRef(null);
  const contentRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.to(backgroundRef.current, {
      yPercent: 15,
      ease: "power2.out",
      scrollTrigger: {
        trigger: backgroundRef.current,
        start: "top top",
        scrub: 1.5,
      },
    });

    gsap.fromTo(
      contentRef.current,
      { opacity: 0, y: 60 },
      {
        opacity: 1,
        y: 0,
        duration: 1.8,
        ease: "power2.out",
        delay: 0.4,
        scrollTrigger: {
          trigger: contentRef.current,
          start: "top 75%",
        },
      }
    );

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const scrollToSection = (sectionId: string) => {
    const section = document.querySelector(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
    setIsMenuOpen(false);
  };

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <nav className="absolute top-0 left-0 right-0 z-50 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Image src={logo} alt="logo" className="w-24 md:w-32" />
          <div className="hidden md:flex space-x-4">
            {navItems.map((item) => (
              <Button
                key={item.name}
                variant="ghost"
                className="text-yellow-400 hover:text-yellow-400 text-lg font-bold hover:bg-transparent transition-colors"
                onClick={() => scrollToSection(item.href)}
              >
                {item.name}
              </Button>
            ))}
          </div>
          <div className="relative md:hidden" ref={menuRef}>
            <Button
              variant="ghost"
              size="icon"
              className="text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                {navItems.map((item) => (
                  <button
                    key={item.name}
                    className="block w-full text-left px-4 py-2 text-lg text-gray-700 hover:bg-gray-100"
                    onClick={() => scrollToSection(item.href)}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </nav>
      <div
        ref={backgroundRef}
        className="absolute inset-0 bg-cover bg-center transform-gpu"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80')",
        }}
        aria-hidden="true"
      ></div>
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      <div
        ref={contentRef}
        className="relative z-10 flex h-full flex-col items-center justify-center text-white p-5"
      >
        <h1 className="mb-4 text-center font-bold tracking-tight text-3xl sm:text-4xl md:text-5xl lg:text-6xl drop-shadow transform transition-transform duration-700 ease-out hover:scale-105">
          Your <span className="text-yellow-400">Fitness</span> Journey Starts
          Here
        </h1>
        <p className="mb-8 max-w-5xl text-center leading-loose text-xl font-semibold sm:text-xl md:text-2xl drop-shadow transition-opacity duration-700 ease-out hover:opacity-95">
          Join a community dedicated to fitness and transformation. Whether you
          are looking to lose weight, build strength, or improve your health, we
          offer the tools and support to help you succeed. Start your journey
          today with us.
        </p>
      </div>
    </div>
  );
}
