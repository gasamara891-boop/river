import React, { FC } from "react";
import Link from "next/link";
import { headerData } from "../Header/Navigation/menuData";
import Image from "next/image";
import { Icon } from "@iconify/react";
import Logo from "../Header/Logo";

const Footer: FC = () => {
  return (
    <footer className="pt-16 bg-darkmode">
      <div className="container mx-auto lg:max-w-screen-xl md:max-w-screen-md px-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 lg:gap-20 md:gap-6 sm:gap-12 gap-6 pb-16">
          {/* --- Logo & Socials --- */}
          <div className="lg:col-span-4 md:col-span-6 col-span-6">
            <Logo />
            <div className="flex gap-6 items-center mt-8">
              <Link href="#" className="group">
                <Icon
                  icon="fa6-brands:facebook-f"
                  width="24"
                  height="24"
                  className="text-white group-hover:text-primary"
                />
              </Link>
              <Link href="#" className="group">
                <Icon
                  icon="fa6-brands:instagram"
                  width="24"
                  height="24"
                  className="text-white group-hover:text-primary"
                />
              </Link>
              <Link href="#" className="group">
                <Icon
                  icon="fa6-brands:x-twitter"
                  width="24"
                  height="24"
                  className="text-white group-hover:text-primary"
                />
              </Link>
            </div>
            <h3 className="text-white text-24 font-medium sm:mt-20 mt-12">
              2025 Copyright | River
            </h3>
          </div>

          {/* --- Links --- */}
          <div className="lg:col-span-2 md:col-span-3 col-span-6">
            <h4 className="text-white mb-4 font-medium text-24">Links</h4>
            <ul>
              {headerData.map((item, index) => (
                <li key={index} className="pb-4">
                  <Link
                    href={item.href}
                    className="text-white hover:text-primary text-17"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* --- Address --- */}
          <div className="lg:col-span-2 md:col-span-3 col-span-6">
            <h4 className="text-white mb-4 font-medium text-24">Visit Us</h4>
            <ul className="text-17 text-white space-y-4">
              <li className="flex items-start gap-3">
                <Icon icon="mdi:map-marker" width="20" height="20" className="text-primary mt-1" />
                <span>123 CA, New York</span>
              </li>
              <li className="flex items-center gap-3">
                <Icon icon="mdi:phone" width="20" height="20" className="text-primary" />
                <span>+151476383923</span>
              </li>
              <li className="flex items-center gap-3">
                <Icon icon="mdi:email" width="20" height="20" className="text-primary" />
                <span>support@river.ai</span>
              </li>
            </ul>
          </div>

          {/* --- Subscribe --- */}
          <div className="lg:col-span-4 md:col-span-4 col-span-6">
            <h3 className="text-white text-24 font-medium">Subscribe</h3>
            <p className="text-muted text-opacity-60 text-18 mt-5">
              Subscribe to get the latest
              <br /> news and updates.
            </p>
            <div className="relative lg:w-80%">
              <input
                type="email"
                name="mail"
                id="mail"
                placeholder="Enter Email"
                className="bg-transparent border border-dark_border border-opacity-60 py-4 text-white rounded-lg w-full mt-6 px-6"
              />
              <Icon
                icon="tabler:send"
                width="24"
                height="24"
                className="text-primary absolute right-7 bottom-4"
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
