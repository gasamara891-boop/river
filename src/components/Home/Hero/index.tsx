"use client";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useRef, useState, useCallback } from "react";
import { getImagePrefix } from "@/utils/utils";
import CardSlider from "./slider";
import TypingLoop from "@/components/TypingLoop/TypingLoop";

const Hero = () => {
  const [isBuying, setIsBuyingOpen] = useState(false);
  const [isSelling, setIsSellingOpen] = useState(false);
  const BuyRef = useRef<HTMLDivElement>(null);
  const SellRef = useRef<HTMLDivElement>(null);

  // Fix TS error by typing event as MouseEvent
  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (BuyRef.current && !BuyRef.current.contains(event.target as Node)) {
        setIsBuyingOpen(false);
      }
      if (SellRef.current && !SellRef.current.contains(event.target as Node)) {
        setIsSellingOpen(false);
      }
    },
    []
  );

  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => handleClickOutside(event);
    document.addEventListener("mousedown", handleMouseDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, [handleClickOutside]);

  useEffect(() => {
    document.body.style.overflow = isBuying || isSelling ? "hidden" : "";
  }, [isBuying, isSelling]);

  const leftAnimation = {
    initial: { x: "-100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "-100%", opacity: 0 },
    transition: { duration: 0.6 },
  };

  const rightAnimation = {
    initial: { x: "100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "100%", opacity: 0 },
    transition: { duration: 0.6 },
  };

  return (
    <section
      className="relative md:pt-40 md:pb-28 py-20 overflow-hidden z-1"
      id="main-banner"
    >
      <div className="container mx-auto lg:max-w-screen-xl px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-10 lg:gap-x-8 items-center">
          {/* Left Section */}
          <motion.div {...leftAnimation} className="lg:col-span-5 col-span-1">
            <div className="flex gap-4 items-center lg:justify-start justify-center mb-6 mt-16">
              <Image
                src={`${getImagePrefix()}images/icons/icon-bag.svg`}
                alt="icon"
                width={40}
                height={40}
              />
              <p className="text-white sm:text-2xl text-lg mb-0 text-center sm:text-left">
                Crypto <span className="text-primary">Broker</span>
              </p>
            </div>

            <h1 className="font-medium lg:text-6xl md:text-5xl text-4xl lg:text-start text-center text-white mb-10 leading-tight">
              Join <span className="text-primary">The River Broker</span> And{" "}
              <span className="text-primary">Breakthrough The stock market</span>!
            </h1>
            <TypingLoop />
            {/* App Store Buttons */}
            <div className="flex flex-wrap justify-center md:justify-start gap-6 sm:gap-10 mt-16">
              
              <h1 className="text-light">Best Entries</h1>
            </div>
          </motion.div>
<motion.div
  {...rightAnimation}
  className="lg:col-span-7 col-span-1 flex lg:justify-end justify-center"
>
  <div
    className="
      w-full 
      max-w-sm              /* mobile */
      sm:max-w-md
      md:max-w-lg
      lg:max-w-md           /* desktop: MUCH SMALLER */
      xl:max-w-lg           /* slightly bigger on large screens */
      2xl:max-w-xl          /* bigger but still controlled */
      mx-auto
    "
  >
    <Image
      src={`${getImagePrefix()}images/hero/hero-asset-64c2ed3c3d55af5e85064d743ec9424f24ad.webp`}
      alt="Banner"
      width={1000}
      height={1000}
      className="w-full h-auto object-contain"
      priority
    />
  </div>
</motion.div>

        </div>

        {/* Card Slider */}
        <div className="mt-16">
          <CardSlider />
        </div>
      </div>

      {/* Background Gradient */}
      <div className="absolute w-60 h-60 bg-gradient-to-bl from-tealGreen to-charcoalGray blur-[400px] rounded-full -top-64 -right-14 -z-10"></div>
    </section>
  );
};

export default Hero;