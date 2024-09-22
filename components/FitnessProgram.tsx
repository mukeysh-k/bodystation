import Image from "next/image";

export default function FitnessProgram() {
  const programs = [
    {
      title: "Conditioning",
      description:
        "Improve your cardiovascular health and stamina with targeted conditioning exercises designed to enhance your overall fitness. Feel energized and ready to take on any challenge.",
      image: "/conditioning.jpg",
    },
    {
      title: "Strength",
      description:
        "Build muscle, increase power, and develop functional strength with structured strength training programs that are designed for athletes of all levels.",
      image: "/strength.jpg",
    },
    {
      title: "Endurance",
      description:
        "Push your limits and develop lasting endurance through tailored workouts that help you maintain peak performance for longer periods.",
      image: "/endurance.jpg",
    },
    {
      title: "Yoga",
      description:
        "Achieve mental and physical balance through yoga practices that improve flexibility, reduce stress, and strengthen your core.",
      image: "/yoga.jpg",
    },
  ];

  return (
    <div id="training" className="px-4 py-8 text-white">
      <section className="text-center mb-16">
        <h2 className="text-4xl font-bold mb-4">
          Unlock Your <span className="text-yellow-400">True Potential</span>
        </h2>
        <p className="text-xl max-w-3xl mx-auto">
          Enhance every aspect of your fitness journey with tailored programs
          that build strength, boost endurance, improve flexibility, and empower
          your mind and body.
        </p>
      </section>

      <div className="grid md:grid-cols-2">
        {programs.map((program, index) => (
          <div key={index} className="relative group overflow-hidden">
            <Image
              src={program.image}
              alt={program.title}
              width={600}
              height={400}
              className="object-cover w-full h-[400px] transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-6 text-white">
              <div className="text-center">
                <h3 className="text-3xl font-bold mb-2 uppercase">
                  {program.title}
                </h3>
                <p className="text-lg mx-auto">{program.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
