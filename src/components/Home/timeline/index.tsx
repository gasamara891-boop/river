"use client";
import Image from "next/image";
import { timelineData } from "@/app/api/data";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { getImagePrefix } from "@/utils/utils";

// --- Define types ---
type Position = "top-left" | "top-right" | "bottom-left" | "bottom-right";

interface TimelineItem {
  title: string;
  text: string;
  icon: string;
  position: Position;
}

const items: TimelineItem[] = [
  {
    title: "Planning",
    text: "Map the investments's scope and architecture",
    icon: "images/timeline/icon-planning.svg",
    position: "top-left",
  },
  {
    title: "Refinement",
    text: "Refined and improved profitability",
    icon: "images/timeline/icon-refinement.svg",
    position: "top-right",
  },
  {
    title: "Security",
    text: "We've got firewalls and RLS to protect you and your investments",
    icon: "images/timeline/icon-prototype.svg",
    position: "bottom-left",
  },
  {
    title: "Support",
    text: "24/7 Customer support services",
    icon: "images/timeline/icon-support.svg",
    position: "bottom-right",
  },
];

const positionStyles: Record<Position, string> = {
  "top-left": "md:absolute md:top-40 md:left-0 md:w-72 md:flex-row flex-col",
  "top-right": "md:absolute md:top-40 md:right-0 md:w-72 md:flex-row-reverse flex-col",
  "bottom-left": "md:absolute md:bottom-48 md:left-0 md:w-72 md:flex-row flex-col",
  "bottom-right": "md:absolute md:bottom-48 md:right-0 md:w-72 md:flex-row-reverse flex-col"
};

const TimeLine = () => {
  const ref = useRef(null);
  const inView = useInView(ref);

  return (
    <section className="md:pt-40 pt-9" id="development">
      <div className="container mx-auto lg:max-w-screen-xl md:max-w-screen-md lg:px-16 px-4">
        <div className="text-center">
          <motion.div
            whileInView={{ y: 0, opacity: 1 }}
            initial={{ y: "-100%", opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-muted sm:text-2xl text-lg mb-9">
              Investment <span className="text-primary">timeline</span>
            </p>
            <h2 className="text-white sm:text-4xl text-2xl font-medium lg:w-[80%] mx-auto mb-20">
              We can enter at any point or help you all the way 
              in your investments journey.
            </h2>
          </motion.div>
          <motion.div
            whileInView={{ scale: 1, opacity: 1 }}
            initial={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div>
              <Image
                src={`${getImagePrefix()}images/timeline/img-timeline.png`}
                alt="timeline"
                width={1220}
                height={1000}
                className="w-full max-w-xl mx-auto object-contain"
                priority
              />
            </div>
            {/* Overlays: stacked vertically on mobile, absolute on desktop */}
            <div className="w-full flex flex-col gap-8 mt-8 md:mt-0 md:pointer-events-none">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex items-center md:gap-6 gap-4 
                    ${positionStyles[item.position]} 
                    px-2 py-2 md:bg-transparent bg-light_grey bg-opacity-20 rounded-xl
                  `}
                  style={{
                    position: idx > 1 ? 'relative' : undefined // only non-absolute on mobile
                  }}
                >
                  {/* Icon */}
                  <div className="bg-light_grey bg-opacity-45 backdrop-blur-sm px-5 py-2 rounded-full mr-0">
                    <Image
                      src={`${getImagePrefix()}${item.icon}`}
                      alt={item.title}
                      width={44}
                      height={44}
                    />
                  </div>
                  {/* Text */}
                  <div className={`text-start md:text-${item.position.includes('right') ? 'left' : 'right'}`}>
                    <h5 className="text-muted text-2xl mb-3">{item.title}</h5>
                    <p className="text-base text-muted text-opacity-60">
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TimeLine;