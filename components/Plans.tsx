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
  CoffeeIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  {
    title: "1 Day",
    price: "₹250",
    description:
      "Perfect for a quick workout or a trial session. Ideal if you're visiting or want to experience our gym for a day.",
    perks: [
      {
        text: ["Free Coffee Shot", "Free Wi-Fi"],
        icons: [
          <Coffee className="h-4 w-4 mr-2" />,
          <Wifi className="h-4 w-4 mr-2 text-white" />,
        ],
      },
    ],
    benefit:
      "No commitment. Pay as you go, with a refreshing coffee shot to start your workout.",
    discount: null,
    icon: <Coffee className="h-4 w-4 mr-2" />,
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
        icons: [
          <Coffee className="h-4 w-4 mr-2" />,
          <Wifi className="h-4 w-4 mr-2 text-white" />,
        ],
      },
    ],
    benefit:
      "A special student price with access to all gym facilities, including personalized plans, Wi-Fi, and a coffee boost.",
    discount: "Valid Student ID Required",
    icon: <GraduationCap className="h-4 w-4 mr-2" />,
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
        icons: [
          <ShowerHead className="h-4 w-4 mr-2 text-white" />,
          <Coffee className="h-4 w-4 mr-2" />,
          <Wifi className="h-4 w-4 mr-2 text-white" />,
        ],
      },
    ],
    benefit:
      "Access to all gym facilities, personalized workout plans, and a relaxing steam bath to help you unwind.",
    discount: "10% Discount",
    icon: <Droplet className="h-4 w-4 mr-2" />,
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
        icons: [
          <ShowerHead className="h-4 w-4 mr-2 text-white" />,
          <Coffee className="h-4 w-4 mr-2" />,
          <Wifi className="h-4 w-4 mr-2 text-white" />,
        ],
      },
    ],
    benefit:
      "Significant savings, personalized training plan, and regular steam baths to relax your muscles after intense sessions.",
    discount: "10% Discount",
    icon: <Activity className="h-4 w-4 mr-2" />,
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
        icons: [
          <ShowerHead className="h-4 w-4 mr-2 text-white" />,
          <Coffee className="h-4 w-4 mr-2" />,
          <Wifi className="h-4 w-4 mr-2 text-white" />,
        ],
      },
    ],
    benefit:
      "Enjoy a 20% discount, personalized workout plans, health monitoring, and monthly steam baths for recovery and relaxation.",
    discount: "20% Discount",
    icon: <Activity className="h-4 w-4 mr-2" />,
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
        icons: [
          <ShowerHead className="h-4 w-4 mr-2 text-white" />,
          <HeartPulse className="h-4 w-4 mr-2" />,
          <Coffee className="h-4 w-4 mr-2" />,
          <Wifi className="h-4 w-4 mr-2 text-white" />,
        ],
      },
    ],
    benefit:
      "Maximum savings with 30% off, regular steam baths, health checkups, and full access to all gym services, including Wi-Fi.",
    discount: "30% Discount",
    icon: <Activity className="h-4 w-4 mr-2" />,
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
        icons: [
          <ShowerHead className="h-4 w-4 mr-2 text-white" />,
          <HeartPulse className="h-4 w-4 mr-2" />,
          <Coffee className="h-4 w-4 mr-2" />,
          <Wifi className="h-4 w-4 mr-2 text-white" />,
        ],
      },
    ],
    benefit:
      "Special couple discount, shared benefits like steam baths, and full gym access for both individuals.",
    discount: "Special Discount",
    icon: <Users className="h-4 w-4 mr-2" />,
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
        icons: [
          <ShowerHead className="h-4 w-4 mr-2 text-white" />,
          <HeartPulse className="h-4 w-4 mr-2" />,
          <Coffee className="h-4 w-4 mr-2" />,
          <Wifi className="h-4 w-4 mr-2 text-white" />,
        ],
      },
    ],
    benefit:
      "A comprehensive fitness plan for the entire family with shared perks like steam baths and free Wi-Fi for everyone.",
    discount: "Special Offer",
    icon: <Users className="h-4 w-4 mr-2" />,
    gradient: "bg-gradient-to-br from-teal-800 to-emerald-600",
  },
];

export default function Plans() {
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
                  {plan.icon}
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
                    <div key={perkIndex}>
                      {perk.icons.map((icon, iconIndex) => (
                        <div key={iconIndex} className="flex items-center">
                          {icon}
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
                <Button
                  variant="secondary"
                  className="bg-white text-black hover:bg-white/90"
                >
                  Choose Plan
                </Button>
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
