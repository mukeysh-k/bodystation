"use client"
import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import about1 from "../public/about1.jpg";

gsap.registerPlugin(ScrollTrigger);

const About = () => {
  const imageRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    // Ensure imageRef and textRef are defined before animation
    if (imageRef.current) {
      // Image fade and zoom effect
      gsap.fromTo(
        imageRef.current,
        { opacity: 0, scale: 0.9 },
        {
          opacity: 1,
          scale: 1,
          duration: 1.5,
          ease: "power2.out",
          scrollTrigger: {
            trigger: imageRef.current,
            start: "top 80%", // Image fades in when 80% into view
          },
        }
      );
    }

    if (textRef.current) {
      // Text fade-in with staggered effect
      gsap.fromTo(
        textRef.current.querySelectorAll("p"),
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1.5,
          ease: "power2.out",
          stagger: 0.3, // Stagger the animation of each text block
          scrollTrigger: {
            trigger: textRef.current,
            start: "top 80%", // Text fades in when 80% into view
          },
        }
      );
    }

    if (headingRef.current) {
      // Heading animation
      gsap.fromTo(
        headingRef.current,
        { opacity: 0, y: -20 },
        {
          opacity: 1,
          y: 0,
          duration: 1.5,
          ease: "power2.out",
          scrollTrigger: {
            trigger: headingRef.current,
            start: "top 90%", // Heading fades in when it's almost in view
          },
        }
      );
    }
  }, []);

  return (
    <section className="py-16 relative">
      {/* Parallax background effect */}
      {/* <div
        className="absolute inset-0 bg-fixed bg-cover bg-center opacity-30 z-0"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1583454110558-4d63407b68cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80')",
        }}
      ></div> */}
      <div className="container mx-auto px-4 text-white relative z-10">
        <h2 ref={headingRef} className="text-4xl font-bold mb-8 text-center">
          <span className="text-yellow-400">About</span> Our Gym
        </h2>
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2">
            {/* Image with animation */}
            <div ref={imageRef}>
              <Image
                src={about1}
                alt="Gym Interior"
                className="rounded-lg shadow-lg w-full"
              />
            </div>
          </div>
          <div ref={textRef} className="md:w-1/2">
            <p className="text-xl mb-4 leading-loose">
              Welcome to{" "}
              <span className="text-yellow-400">BodyStation Fitness Gym</span>,
              the premier fitness destination in{" "}
              <span className="text-yellow-400">Kangra!</span> For the past 8
              years, we have been helping individuals of all fitness levels
              achieve their health and wellness goals. Our mission is to provide
              a supportive and motivating environment where everyone can strive
              to be the best version of themselves. At BodyStation Fitness Gym,
              we pride ourselves on offering state-of-the-art facilities,
              cutting-edge equipment, and a diverse range of programs tailored
              to meet your unique needs. Whether you're looking to build
              strength, improve your cardio, or find balance with yoga, our
              certified trainers are here to guide you every step of the way.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
