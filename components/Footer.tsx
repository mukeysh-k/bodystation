import Link from "next/link";
import { Facebook, Instagram, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="  text-white">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <h3 className="text-xl font-semibold mb-4">
              Stay in touch with us
            </h3>
            <div className="flex space-x-4">
              <Link
                href="https://www.facebook.com/people/Body-station-The-fitness-gym/100066601358747/"
                target="_blank"
                className="hover:text-blue-400"
              >
                <Facebook className="w-6 h-6" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link
                href="https://www.instagram.com/bodystationthefitness"
                className="hover:text-pink-400"
                target="_blank"
              >
                <Instagram className="w-6 h-6" />
                <span className="sr-only">Instagram</span>
              </Link>
            </div>
          </div>
          <div className="text-center md:text-right">
            <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
            <address className="not-italic mb-2">
              Amar complex, jayanti vihar, Talpura
              <br />
              Kangra, Himachal Pradesh 176001
            </address>
            <p className="mb-2">
              <strong>Working Hours:</strong>
              <br />
              Mon-Sat: 6:00 AM - 10:00 PM
            </p>
            <p>
              <strong>Contact:</strong> 9805599020
            </p>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>
            &copy; {new Date().getFullYear()} Body Station The Fitness Gym. All
            rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
