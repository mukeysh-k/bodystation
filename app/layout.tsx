import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const zenDots = localFont({
  src: "./fonts/ZenDots-Regular.ttf",
  variable: "--font-zen-dots",
  weight: "400",
});
const poppins = localFont({
  src: "./fonts/Poppins-Regular.ttf",
  variable: "--font-poppins",
  weight: "400",
});

export const metadata: Metadata = {
  title: "Best Gym in Kangra | Achieve Your Fitness Goals Today",
  description:
    "Join Body Stattion Fitness Gym, the top-rated gym in Kangra. 24/7 access, expert trainers, modern equipment, and personalized programs to help you reach your fitness goals",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${zenDots.variable} ${poppins.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
