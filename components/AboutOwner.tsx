"use client";
import React, { useState } from "react";
import { FaEnvelope, FaPhone, FaLinkedin } from "react-icons/fa";
import about1 from "../public/about1.jpg";
import Image from "next/image";
const OwnerInfo = () => {
  const [isHovered, setIsHovered] = useState(false);
  const ownerData = {
    name: "Ankush Dhalla",
    bio: `With over 10 years of experience in the fitness industry, <strong className='text-yellow-400'>Ankush Dhalla</strong> brings a wealth of knowledge and passion to BodyStation The Fitness Gym. A former competitive wrestler and a certified fitness trainer, <strong className='text-yellow-400'>Ankush Dhalla</strong> has dedicated his life to helping others achieve their health and fitness goals.`,
    email: "ankushdhalla.dhalla@gmail.com",
    phone: "9805599020",
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-center container mx-auto px-4 py-10 text-white relative z-10">
      <div className="md:w-1/2 pr-8">
        <h2 className="text-3xl font-bold mb-4">
          Meet Our Founder:{" "}
          <span className="text-yellow-400">{ownerData.name}</span>
        </h2>
        <p
          className="text-white mb-6 text-lg"
          dangerouslySetInnerHTML={{ __html: ownerData.bio }}
        ></p>
        <div className="space-y-2">
          <a
            href={`mailto:${ownerData.email}`}
            className="flex items-center text-white transition-colors duration-300"
          >
            <FaEnvelope className="mr-2" />
            {ownerData.email}
          </a>
          <a
            href={`tel:${ownerData.phone}`}
            className="flex items-center transition-colors duration-300"
          >
            <FaPhone className="mr-2" />
            {ownerData.phone}
          </a>
        </div>
      </div>
      <div className="md:w-1/2 mt-8 md:mt-0">
        <div className="relative overflow-hidden rounded-lg shadow-md">
          <Image
            src={about1}
            alt="Owner's profile"
            className={`w-full h-auto transition-transform duration-300`}
          />
        </div>
      </div>
    </div>
  );
};
export default OwnerInfo;
