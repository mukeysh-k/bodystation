"use client";

import { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

type WorkoutPlan = {
  [key: string]: {
    exercises: string[];
    image: string;
  };
};

const workoutPlan: WorkoutPlan = {
  CHEST: {
    exercises: [
      "Flat Bench Press",
      "Decline Bench Press",
      "Incline Bench Press",
      "Cable Cross Over",
      "Dumbbell Flyes",
      "Dumbbell Pullover",
      "Bar Dips",
      "Pec Fly Machine",
    ],
    image: "/placeholder.svg?height=300&width=300",
  },
  BACK: {
    exercises: [
      "Chin-Ups",
      "Front Lats PullDown",
      "Back Lats PullDown",
      "Reverse Close Grip Lats Pulldown",
      "Ground Pully",
      "Bent Over Barbell Row",
      "Deadlift",
      "Hyper Extension"
    ],
    image: "/placeholder.svg?height=300&width=300",
  },
  BICEPS: {
    exercises: [
      "Barbell Curl",
      "Preacher Curl",
      "Concentration Curl",
      "Dumbbell Hammer Curl",
      "EZ Barbell Curl",
    ],
    image: "/placeholder.svg?height=300&width=300",
  },
  TRICEPS: {
    exercises: [
      "Triceps Pushdown",
      "Skull Crusher",
      "One Arm Tricep Extension",
      "Both Arm Tricep Extension",
      "Dumbbell Kick Back",
      "Tricpes Dips",
      "Skull Crusher"
    ],
    image: "/placeholder.svg?height=300&width=300",
  },
  FOREARMS: {
    exercises: ["Wrist Curl", "Reverse Barbell Curl", "Reverse Wrist Curl"],
    image: "/placeholder.svg?height=300&width=300",
  },
  SHOULDER: {
    exercises: [
      "Barbell Front Press",
      "Barbell Back Press",
      "Dumbbell Press",
      "Front Raise",
      "Side Raise",
      "Upright Row",
      "Shrug",
      "Rear Delt Fly",
    ],
    image: "/placeholder.svg?height=300&width=300",
  },
  ABDOMINAL: {
    exercises: [
      "Plank",
      "Crunches",
      "Side Crunches",
      "Sit Up Cruncher",
      "Star Cruncher",
      "Treadmill Bicycle",
      "Hanging Leg Raise",
      "V Sit",
      "Russian Twist",
      "Knee To Elbow Plank",
      "Leg Raise",
      "Bicycle Crunch",
    ],
    image: "/placeholder.svg?height=300&width=300",
  },
  CARDIO: {
    exercises: [
      "Treadmill",
      "Cros Trainer",
      "Traditional Jumping Jack",
      "Star Jump",
      "Box Jump",
      "Mountain Climber",
      "Jumping Jack",
      "High Knee",
      "Tuck Jump",
      "Jump Rope",
    ],
    image: "/placeholder.svg?height=300&width=300",
  },
};

export default function WorkoutPlan() {
  const [progress, setProgress] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("workoutProgress");
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });
  const [activeTab, setActiveTab] = useState("FOREARMS");
  const tabsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem("workoutProgress", JSON.stringify(progress));
  }, [progress]);

  const handleCheckboxChange = (group: string, exercise: string) => {
    setProgress((prev: any) => ({
      ...prev,
      [group]: {
        ...prev[group],
        [exercise]: !prev[group]?.[exercise],
      },
    }));
  };

  const calculateProgress = (group: keyof typeof workoutPlan) => {
    const exercises = workoutPlan[group].exercises;
    const completed = exercises.filter(
      (exercise) => progress[group]?.[exercise]
    ).length;
    return (completed / exercises.length) * 100;
  };

  const resetProgress = () => {
    setProgress({});
    localStorage.removeItem("workoutProgress");
  };

  const scrollTabs = (direction: "left" | "right") => {
    if (tabsRef.current) {
      const scrollAmount = 200;
      tabsRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="text-white container mx-auto px-4 py-10 text-center">
      <h2 className="text-4xl font-bold mb-4">
        Gym <span className="text-yellow-400">Workout Plan</span>
      </h2>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="relative">
          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 lg:hidden"
            onClick={() => scrollTabs("left")}
            aria-label="Scroll tabs left"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div
            ref={tabsRef}
            className="overflow-x-auto scrollbar-hide whitespace-nowrap py-2 px-8"
          >
            <TabsList className="inline-flex lg:gap-5">
              {Object.keys(workoutPlan).map((group) => (
                <TabsTrigger
                  key={group}
                  value={group}
                  className={`text-sm ${
                    activeTab === group ? "!bg-[#1d1d1d] !text-white" : ""
                  }`}
                >
                  {group}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 lg:hidden"
            onClick={() => scrollTabs("right")}
            aria-label="Scroll tabs right"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        {Object.entries(workoutPlan).map(([group, { exercises, image }]) => (
          <TabsContent key={group} value={group}>
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-2/3 m-auto">
                <h2 className="text-2xl font-semibold mb-4">{group}</h2>
                <Progress
                  value={calculateProgress(group as keyof typeof workoutPlan)}
                  className="mb-4"
                />
                <div className="space-y-2">
                  {exercises.map((exercise) => (
                    <div key={exercise} className="flex items-center space-x-3">
                      <Checkbox
                        id={`${group}-${exercise}`}
                        checked={progress[group]?.[exercise] || false}
                        onCheckedChange={() =>
                          handleCheckboxChange(group, exercise)
                        }
                        className="border-white"
                      />
                      <label
                        htmlFor={`${group}-${exercise}`}
                        className="text-lg font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {exercise}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              {/* <div className="md:w-1/3">
                <Image
                  src={image}
                  alt={`${group} exercises`}
                  width={300}
                  height={300}
                  className="rounded-lg object-cover w-full h-auto"
                />
              </div> */}
            </div>
          </TabsContent>
        ))}
      </Tabs>
      <Button onClick={resetProgress} className="mt-6" variant="secondary">
        Reset Progress
      </Button>
    </div>
  );
}
