"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Banner from "./Banner";
import About from "./About";
import OwnerInfo from "./AboutOwner";
import TrainingPrices from "./TrainingPrices";
import Plans from "./Plans";
import Map from "./Map";
import FitnessProgram from "./FitnessProgram";
import Footer from "./Footer";

export default function HomeComponent() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Banner */}
      <Banner />
      <About />

      <OwnerInfo />
      <Plans />
      <FitnessProgram />
      <TrainingPrices />
      <Map />
      <Footer />
    </div>
  );
}
