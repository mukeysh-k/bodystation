import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Coffee,
  Wifi,
  Droplet,
  Activity,
  Users,
  GraduationCap,
  ShowerHead,
  HeartPulse,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateGpayLink, isMobileDevice } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { QRCodeCanvas } from "qrcode.react";
import { useEffect, useState } from "react";

const plans = [
  {
    title: "1 Day",
    price: "₹250",
    description:
      "Perfect for a quick workout or a trial session. Ideal if you're visiting or want to experience our gym for a day.",
    perks: [
      {
        text: ["Free Coffee Shot", "Free Wi-Fi"],
        icons: ["coffee", "wifi"], // Icon names as strings
      },
    ],
    benefit:
      "No commitment. Pay as you go, with a refreshing coffee shot to start your workout.",
    discount: null,
    icon: "coffee", // Icon name as string
    gradient: "bg-gradient-to-br from-red-800 to-pink-600",
  },
  {
    title: "Student Offer",
    price: "₹1,500",
    description:
      "Affordable pricing for students with valid ID cards, ensuring you can stay fit while balancing studies.",
    perks: [
      {
        text: ["Free Coffee Shot", "Free Wi-Fi"],
        icons: ["coffee", "wifi"], // Icon names as strings
      },
    ],
    benefit:
      "A special student price with access to all gym facilities, including personalized plans, Wi-Fi, and a coffee boost.",
    discount: "Valid Student ID Required",
    icon: "graduation-cap", // Icon name as string
    gradient: "bg-gradient-to-br from-cyan-800 to-sky-600",
  },
  {
    title: "1 Month",
    price: "₹2,000",
    description:
      "Great for short-term fitness goals. This plan offers flexibility to experience our gym services with added perks.",
    perks: [
      {
        text: ["1 Free Steam Bath", "Free Coffee Shot", "Free Wi-Fi"],
        icons: ["ShowerHead", "coffee", "wifi"], // Icon names as strings
      },
    ],
    benefit:
      "Access to all gym facilities, personalized workout plans, and a relaxing steam bath to help you unwind.",
    discount: "10% Discount",
    icon: "droplet", // Icon name as string
    gradient: "bg-gradient-to-br from-blue-800 to-indigo-600",
  },
  {
    title: "3 Months",
    price: "₹5,500",
    description:
      "Ideal for building long-term habits and seeing visible results. This plan allows for extended access with more benefits.",
    perks: [
      {
        text: ["3 Free Steam Bath", "Free Coffee Shot", "Free Wi-Fi"],
        icons: ["ShowerHead", "coffee", "wifi"], // Icon names as strings
      },
    ],
    benefit:
      "Significant savings, personalized training plan, and regular steam baths to relax your muscles after intense sessions.",
    discount: "10% Discount",
    icon: "activity", // Icon name as string
    gradient: "bg-gradient-to-br from-green-800 to-emerald-600",
  },
  {
    title: "6 Months",
    price: "₹10,000",
    description:
      "A great option for those dedicated to achieving long-term results. Six months gives you ample time to work on your fitness.",
    perks: [
      {
        text: ["9 Free Steam Bath", "Free Coffee Shot", "Free Wi-Fi"],
        icons: ["ShowerHead", "coffee", "wifi"], // Icon names as strings
      },
    ],
    benefit:
      "Enjoy a 20% discount, personalized workout plans, health monitoring, and monthly steam baths for recovery and relaxation.",
    discount: "20% Discount",
    icon: "activity", // Icon name as string
    gradient: "bg-gradient-to-br from-purple-800 to-fuchsia-600",
  },
  {
    title: "12 Months",
    price: "₹20,000",
    description:
      "The best value for dedicated fitness enthusiasts. A full-year membership ensures time for achieving and maintaining your fitness goals.",
    perks: [
      {
        text: [
          "15 Free Steam Bath",
          "1 Free Health Checkup",
          "Free Coffee Shot",
          "Free Wi-Fi",
        ],
        icons: ["ShowerHead", "HeartPulse", "coffee", "wifi"], // Icon names as strings
      },
    ],
    benefit:
      "Maximum savings with 30% off, regular steam baths, health checkups, and full access to all gym services, including Wi-Fi.",
    discount: "30% Discount",
    icon: "activity", // Icon name as string
    gradient: "bg-gradient-to-br from-amber-700 to-orange-600",
    popular: true,
  },
  {
    title: "Couple Plan",
    price: "₹25,000",
    description:
      "A plan designed for couples who want to train together and enjoy the journey to fitness.",
    perks: [
      {
        text: [
          "15 Free Steam Bath",
          "1 Free Health Checkup",
          "Free Coffee Shot",
          "Free Wi-Fi",
        ],
        icons: ["ShowerHead", "HeartPulse", "coffee", "wifi"], // Icon names as strings
      },
    ],
    benefit:
      "Special couple discount, shared benefits like steam baths, and full gym access for both individuals.",
    discount: "Special Discount",
    icon: "users", // Icon name as string
    gradient: "bg-gradient-to-br from-pink-800 to-rose-600",
  },
  {
    title: "Family Pack",
    price: "₹45,000",
    description:
      "The family pack is perfect for multiple family members to join in a fitness journey together.",
    perks: [
      {
        text: [
          "15 Free Steam Bath",
          "1 Free Health Checkup",
          "Free Coffee Shot",
          "Free Wi-Fi",
        ],
        icons: ["ShowerHead", "HeartPulse", "coffee", "wifi"], // Icon names as strings
      },
    ],
    benefit:
      "A comprehensive fitness plan for the entire family with shared perks like steam baths and free Wi-Fi for everyone.",
    discount: "Special Offer",
    icon: "users", // Icon name as string
    gradient: "bg-gradient-to-br from-teal-800 to-emerald-600",
  },
];
const getIcon = (iconName: string) => {
  switch (iconName) {
    case "coffee":
      return <Coffee className="h-4 w-4 mr-2" />;
    case "wifi":
      return <Wifi className="h-4 w-4 mr-2" />;
    case "users":
      return <Users className="h-4 w-4 mr-2" />;
    case "ShowerHead":
      return <ShowerHead className="h-4 w-4 mr-2" />;
    case "HeartPulse":
      return <HeartPulse className="h-4 w-4 mr-2" />;
    case "graduation-cap":
      return <GraduationCap className="h-4 w-4 mr-2" />;
    case "droplet":
      return <Droplet className="h-4 w-4 mr-2" />;
    case "activity":
      return <Activity className="h-4 w-4 mr-2" />;
    default:
      return null;
  }
};

export default function Plans() {
  const [isMobile, setIsMobile] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const handleOpenQRCode = (plan: any) => {
    setSelectedPlan(plan);
  };
  useEffect(()=> {
    if (typeof window !== "undefined") {
      setIsMobile(isMobileDevice());
    }
  },[])
  return (
    <div id="plan" className="min-h-screen text-white py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">
          Choose Your Perfect{" "}
          <span className="text-yellow-400">Fitness Plan</span>
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`flex flex-col ${plan.gradient} text-white border-0 shadow-lg relative overflow-hidden`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-yellow-400 text-black font-semibold py-1 px-4 rounded-bl-lg z-10">
                  Popular
                </div>
              )}
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  {getIcon(plan.icon)}{" "}
                  {/* Use the getIcon function for plan icons */}
                  {plan.title}
                </CardTitle>
                <CardDescription className="text-white text-lg font-semibold">
                  {plan.price}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-white mb-4">{plan.description}</p>
                <div className="space-y-2">
                  {plan.perks.map((perk, perkIndex) => (
                    // Loop through both text and icons arrays together
                    <div key={`perk-${perkIndex}`}>
                      {perk.icons.map((iconName, iconIndex) => (
                        <div
                          key={`icon-${perkIndex}-${iconIndex}`}
                          className="flex items-center"
                        >
                          {getIcon(iconName)} {/* Use the getIcon function */}
                          <span className="text-sm">
                            {perk.text[iconIndex]}
                          </span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-sm font-medium">Benefit:</p>
                <p className="text-sm text-white">{plan.benefit}</p>
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                {isMobile ? (
                  <a
                    href={generateGpayLink(plan.price)}
                    className="bg-white text-black py-2 px-4 rounded-lg hover:bg-white/90"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Pay with Google Pay
                  </a>
                ) : (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="secondary"
                        className="bg-white text-black hover:bg-white/90"
                        onClick={() => handleOpenQRCode(plan)}
                      >
                        Pay Now
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md bg-white">
                      <DialogHeader>
                        <DialogTitle>Scan QR Code to Pay</DialogTitle>
                        <DialogDescription>
                          Use your mobile device to scan this QR code and
                          complete the payment for the {plan.title} plan.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex items-center justify-center p-6">
                        <QRCodeCanvas
                          value={generateGpayLink(plan.price)}
                          size={256}
                        />
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
                {/* <Button
                  variant="secondary"
                  className="bg-white text-black hover:bg-white/90"
                >
                  Choose Plan
                </Button> */}
                {plan.discount && (
                  <Badge
                    variant="outline"
                    className="ml-2 bg-white text-black font-semibold border-0 px-2 py-1"
                  >
                    {plan.discount}
                  </Badge>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
