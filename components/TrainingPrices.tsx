import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Clock,
  ClipboardList,
  Dumbbell,
  Utensils,
  MessageCircle,
  Activity,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function TrainingPrices() {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Animate the card when it comes into view
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1.5,
          ease: "power2.out",
          scrollTrigger: {
            trigger: cardRef.current,
            start: "top 80%",
          },
        }
      );
    }
  }, []);

  return (
    <div className="text-white container mx-auto px-4 py-10 text-center">
      <p className="text-base text-white">Training Prices</p>
      <h2 className="text-3xl font-semibold mt-2 text-white mb-6">
        Book Your Personal Trainings
      </h2>
      <Card
        ref={cardRef}
        className="w-full max-w-md mx-auto shadow-lg rounded-lg p-10 bg-[#1d1d1d] text-white border-0"
      >
        <CardContent>
          <div className="text-center mb-6 text-white">
            <p className="text-sm text-muted-foreground text-yellow-400 mb-4">
              Monthly Fee
            </p>
            <p className="text-5xl mb-10 font-bold text-primary transition-transform transform hover:scale-110 text-white">
              ₹6,000
            </p>
          </div>
          <ul className="">
            <FeatureItem icon={Clock} text="1 Hour of Individual Training" />
            <FeatureItem
              icon={ClipboardList}
              text="Personalized Training Plan"
            />
            <FeatureItem icon={Dumbbell} text="Advanced Workout Plan" />
            <FeatureItem icon={Utensils} text="Meal and Diet Plan" />
            <FeatureItem icon={MessageCircle} text="Free Support and Advice" />
            <FeatureItem icon={Activity} text="Health Monitoring" />
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

// FeatureItem Component with Explicit Typing for Icon
interface FeatureItemProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  text: string;
}

function FeatureItem({ icon: Icon, text }: FeatureItemProps) {
  return (
    <li className="flex items-center space-x-3 transition-transform transform hover:scale-105 my-6">
      <Icon className="h-5 w-5 text-white" />
      <span>{text}</span>
    </li>
  );
}
