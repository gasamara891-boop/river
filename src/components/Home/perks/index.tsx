import { perksData } from "@/app/api/data";
import { getImagePrefix } from "@/utils/utils";
import Image from "next/image";

const Perks = () => {
  return (
    <section className="pb-20 sm:pb-28 relative overflow-hidden">
      <div className="container mx-auto lg:max-w-screen-xl px-4 sm:px-6">
        <div className="text-center">
          <p className="text-muted sm:text-2xl text-lg mb-4 pb-4 relative after:content-[''] after:w-8 after:h-0.5 after:bg-primary after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2">
            Always By <span className="text-primary">your side</span>
          </p>

          <h2 className="text-white sm:text-4xl text-2xl font-medium leading-tight px-2">
            Join <span className="text-primary">River</span> Community and Testify with others!
          </h2>

          <div
            className="
              mt-12 sm:mt-16 border border-border border-opacity-20 
              grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 
              gap-8 sm:gap-10 py-10 sm:py-16 px-6 sm:px-10 md:px-16 
              rounded-3xl sm:bg-perk bg-dark_grey bg-opacity-35 
              lg:bg-bottom bg-center bg-no-repeat
            "
          >
            {perksData.map((item, index) => (
              <div
                key={index}
                className="text-center flex items-center justify-end flex-col px-4"
              >
                <div className="bg-primary bg-opacity-25 backdrop-blur-sm p-4 rounded-full w-fit mb-4">
                  <Image
                    src={`${getImagePrefix()}${item.icon}`}
                    alt={item.title}
                    width={44}
                    height={44}
                  />
                </div>

                <h4 className={`text-white text-xl sm:text-2xl mb-3 ${item.space}`}>
                  {item.title}
                </h4>

                <div
                  className="text-muted text-sm sm:text-base text-opacity-70 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: item.text }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Background Blur */}
      <div className="bg-gradient-to-br from-tealGreen to-charcoalGray 
        sm:w-64 w-80 sm:h-64 h-80 rounded-full 
        sm:-bottom-80 bottom-0 blur-[300px] z-0 absolute 
        sm:-left-48 -left-20 opacity-60"
      ></div>
    </section>
  );
};

export default Perks;
