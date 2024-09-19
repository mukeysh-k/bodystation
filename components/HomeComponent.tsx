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
import { Textarea } from "@/components/ui/textarea";
import { Dumbbell, Mail, MapPin, Phone } from "lucide-react";

export default function HomeComponent() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Banner */}
      <section
        className="relative h-[60vh] bg-cover bg-center flex items-center justify-center"
        style={{
          backgroundImage: "url('/placeholder.svg?height=600&width=1200')",
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative z-10 text-center text-white">
          <h1 className="text-5xl font-bold mb-4">FitLife Gym</h1>
          <p className="text-xl">Your Journey to a Healthier You Starts Here</p>
        </div>
      </section>

      {/* About Gym */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">About Our Gym</h2>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-1/2">
              <img
                src="/placeholder.svg?height=400&width=600"
                alt="Gym Interior"
                className="rounded-lg shadow-lg"
              />
            </div>
            <div className="md:w-1/2">
              <p className="text-lg mb-4">
                FitLife Gym is dedicated to helping you achieve your fitness
                goals in a supportive and motivating environment. Our
                state-of-the-art facilities and expert trainers are here to
                guide you every step of the way.
              </p>
              <p className="text-lg mb-4">
                Whether you are a beginner or an experienced athlete, we
                have the equipment and classes to suit your needs. Join us and
                become part of a community committed to health and wellness.
              </p>
              <Button>Learn More</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Gym Schedule */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Gym Schedule</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Monday</TableHead>
                <TableHead>Tuesday</TableHead>
                <TableHead>Wednesday</TableHead>
                <TableHead>Thursday</TableHead>
                <TableHead>Friday</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>6:00 AM - 7:00 AM</TableCell>
                <TableCell>Yoga</TableCell>
                <TableCell>Spin</TableCell>
                <TableCell>Body Pump</TableCell>
                <TableCell>HIIT</TableCell>
                <TableCell>Pilates</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>8:00 AM - 9:00 AM</TableCell>
                <TableCell>Zumba</TableCell>
                <TableCell>Boxing</TableCell>
                <TableCell>Yoga</TableCell>
                <TableCell>Spin</TableCell>
                <TableCell>Body Pump</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>6:00 PM - 7:00 PM</TableCell>
                <TableCell>HIIT</TableCell>
                <TableCell>Pilates</TableCell>
                <TableCell>Zumba</TableCell>
                <TableCell>Boxing</TableCell>
                <TableCell>Yoga</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>7:30 PM - 8:30 PM</TableCell>
                <TableCell>Body Pump</TableCell>
                <TableCell>HIIT</TableCell>
                <TableCell>Spin</TableCell>
                <TableCell>Yoga</TableCell>
                <TableCell>Zumba</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </section>

      {/* Fee Plans */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">
            Membership Plans
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { name: "1 Day Pass", price: "$15", duration: "1 day" },
              { name: "Weekly Pass", price: "$50", duration: "7 days" },
              { name: "Monthly Pass", price: "$100", duration: "30 days" },
              { name: "Quarterly Pass", price: "$250", duration: "3 months" },
              { name: "Annual Pass", price: "$800", duration: "1 year" },
            ].map((plan) => (
              <Card key={plan.name}>
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.duration}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{plan.price}</p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Choose Plan</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Us */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Contact Us</h2>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/2">
              <form className="space-y-4">
                <Input placeholder="Your Name" />
                <Input type="email" placeholder="Your Email" />
                <Input placeholder="Subject" />
                <Textarea placeholder="Your Message" />
                <Button type="submit">Send Message</Button>
              </form>
            </div>
            <div className="md:w-1/2">
              <div className="space-y-4">
                <div className="flex items-center">
                  <MapPin className="mr-2" />
                  <p>123 Fitness Street, Healthy City, 12345</p>
                </div>
                <div className="flex items-center">
                  <Phone className="mr-2" />
                  <p>+1 (123) 456-7890</p>
                </div>
                <div className="flex items-center">
                  <Mail className="mr-2" />
                  <p>info@fitlifegym.com</p>
                </div>
              </div>
              <div className="mt-8">
                <img
                  src="/placeholder.svg?height=300&width=500"
                  alt="Map"
                  className="rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Gallery</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <img
                key={i}
                src={`/placeholder.svg?height=300&width=300&text=Gym Image ${
                  i + 1
                }`}
                alt={`Gym Image ${i + 1}`}
                className="rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <Dumbbell className="inline-block mb-4" size={32} />
          <p>&copy; 2023 FitLife Gym. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
