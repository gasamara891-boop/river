"use client";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { pricedeta } from "@/app/api/data";
import Image from "next/image";
import { getImagePrefix } from "@/utils/utils";
import { useEffect, useState } from "react";



const CardSlider = () => {
  const [items, setItems] = useState(pricedeta);

  // Map from the title/name you have in pricedeta to CoinGecko IDs
  const coinMap: Record<string, string> = {
    Bitcoin: "bitcoin",
    Ethereum: "ethereum",
    "Bitcoin Cash ": "bitcoin-cash",
    Litecoin: "litecoin",
    Solana: "solana",
    Dogecoin: "dogecoin",
  };

  useEffect(() => {
    let mounted = true;
    const ids = Object.values(coinMap).join(",");

    const fetchPrices = async () => {
      try {
        const res = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`
        );
        if (!res.ok) throw new Error("Failed to fetch CoinGecko");
        const data = await res.json();

        const updated = pricedeta.map((it) => {
          const id = coinMap[it.title];
          if (!id || !data[id] || typeof data[id].usd !== "number") {
            return it; // keep original if not found
          }

          const priceNum: number = data[id].usd;
          const change24h: number = data[id].usd_24h_change ?? 0;

          const priceFormatted =
            priceNum >= 1
              ? new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(priceNum)
              : new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                  minimumFractionDigits: 3,
                  maximumFractionDigits: 6,
                }).format(priceNum);

          const changeFormatted =
            (change24h >= 0 ? "+" : "") + change24h.toFixed(1) + "%";
          const markString = `${priceFormatted} (${changeFormatted})`;

          return {
            ...it,
            price: priceFormatted,
            mark: markString,
          };
        });

        if (mounted) setItems(updated);
      } catch (e) {
        console.error("CoinGecko fetch error:", e);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 60_000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const settings = {
    autoplay: true,
    dots: false,
    arrows: false,
    infinite: true,
    autoplaySpeed: 1500,
    speed: 300,
    slidesToShow: 4,
    slidesToScroll: 1,
    cssEase: "ease-in-out",
    variableWidth: false, // ensure fixed-width slides based on container (important)
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 479,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  return (
    // wrapper forces clipping of .slick-track so it cannot expand beyond viewport
    <div className="relative w-full overflow-hidden lg:-mt-16 mt-16">
      <div className="w-full">
        <Slider {...settings}>
          {items.map((item, index) => (
            // slide uses w-full so slick-track doesn't create cumulative overflow
            <div key={index} className="w-full">
              {/* internal card uses padding for spacing (no extra horizontal margin on slide element) */}
              <div className="px-3 md:px-4">
                <div className="px-5 py-6 bg-dark_grey bg-opacity-80 rounded-xl w-full overflow-hidden">
                  <div className="flex items-center gap-5">
                    <div
                      className={`${item.background} ${item.padding} rounded-full flex-shrink-0`}
                    >
                      <Image
                        src={`${getImagePrefix()}${item.icon}`}
                        alt={item.title ?? "icon"}
                        width={item.width}
                        height={item.height}
                        className="w-auto h-auto"
                      />
                    </div>
                    <p className="text-white text-xs font-normal ">
                      <span className="text-16 font-bold mr-2">{item.title}</span>
                      {item.short}
                    </p>
                  </div>
                  <div className="flex justify-between mt-7">
                    <div>
                      <p className="text-16 font-bold text-white mb-0 leading-none">
                        {item.price}
                      </p>
                    </div>
                    <div>
                      <span
                        className={`text-xs ${
                          item.mark?.includes("+") ? "text-success" : "text-error"
                        }`}
                      >
                        {item.mark}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default CardSlider;