import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { useNavigate } from "react-router-dom";

import { motion } from "framer-motion";
import FeatureCard from "./FeaturedCard";

const imageLink = [
  "https://codeswear.nyc3.cdn.digitaloceanspaces.com/constants/landing/banner/6.webp",
  "https://codeswear.nyc3.cdn.digitaloceanspaces.com/constants/landing/banner/3.webp",
  "https://codeswear.nyc3.cdn.digitaloceanspaces.com/constants/landing/banner/2.webp",
  "https://codeswear.nyc3.cdn.digitaloceanspaces.com/constants/landing/banner/5.webp",
];

const collectionsImageLink = [
  " https://codeswear.nyc3.cdn.digitaloceanspaces.com/constants/landing/collections/caps.webp",
  "https://codeswear.nyc3.cdn.digitaloceanspaces.com/constants/landing/collections/hoodie.webp",
  "https://codeswear.nyc3.cdn.digitaloceanspaces.com/constants/landing/collections/oversizedtshirt.webp",
  "https://codeswear.nyc3.cdn.digitaloceanspaces.com/constants/landing/collections/polotshirts.webp",
  "https://codeswear.nyc3.cdn.digitaloceanspaces.com/constants/landing/collections/tshirt.webp",
  "https://codeswear.nyc3.cdn.digitaloceanspaces.com/constants/landing/collections/sweatshirt.webp",
];

const themeCollectionImageLink=[
    "https://codeswear.nyc3.cdn.digitaloceanspaces.com/constants/landing/themes/combooffers.webp",
    "https://codeswear.nyc3.cdn.digitaloceanspaces.com/constants/landing/themes/gaming.webp",
    "https://codeswear.nyc3.cdn.digitaloceanspaces.com/constants/landing/themes/fitness.webp",
    "https://codeswear.nyc3.cdn.digitaloceanspaces.com/constants/landing/themes/lifestyle.webp",
    "https://codeswear.nyc3.cdn.digitaloceanspaces.com/constants/landing/themes/programming.webp",
    "https://codeswear.nyc3.cdn.digitaloceanspaces.com/constants/landing/themes/trending.webp",


]

  const features = [
    {
      icon: "👕",
      title: "Premium Tshirts",
      description: "Our T-Shirts are 100% made of cotton.",
    },
    {
      icon: "🚚",
      title: "Free Shipping",
      description: "We ship all over India for FREE.",
    },
    {
      icon: "₹",
      title: "Exciting Offers",
      description: "We provide amazing offers & discounts on our products.",
    },
  ];

const Index = () => {
  const navigate = useNavigate();
  return (
    <>
      <div className="max-w-full mx-auto p-4 relative flex justify-center items-center">
        <Carousel autoPlay infiniteLoop showThumbs={false} showStatus={false} showIndicators={true} interval={3000} stopOnHover dynamicHeight={false}>
          {imageLink.map((src, index) => (
            <div key={index}>
              <img src={src} loading="lazy" alt={`Banner ${index + 1}`} className="w-full h-auto" />
            </div>
          ))}
        </Carousel>

        <button className="absolute bottom-6 md:bottom-12 text-sm md:text-xl lg:text-2xl py-2 px-6 md:px-8 bg-gray-50 font-semibold md:font-bold rounded-xl md:rounded-2xl cursor-pointer hover:bg-gray-200 transition" onClick={() => navigate("/products/t-shirts")}>
          Shop Now
        </button>
      </div>
      
        <div className="p-4">
            <h2 className="text-xl md:text-2xl font-bold mb-4 text-center">Collection</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-hidden">
        {imageLink.map((src, index) => (
          <motion.img key={index} src={src} alt={`Banner ${index + 1}`} 
          whileHover={{ scale: 1.1 }}
           transition={{ type: "spring", stiffness: 300,delay: 0.2 }}
            className="rounded-lg shadow-md cursor-pointer"
            loading="lazy"
             />
        ))}
      </div>
        </div>

      <div className="p-4">
        <h2 className="text-xl md:text-2xl font-bold mb-4 text-center">Shop by Theme</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {themeCollectionImageLink.map((src, index) => (
            <motion.img
                loading="lazy"
                key={index}
                src={src}
                alt={`Theme ${index + 1}`}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300, delay: index * 0.1 }}
                className="w-full h-[400px] object-cover rounded-lg shadow-md cursor-pointer"
            />
            ))}
        </div>
        </div>


            <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {features.map((item, index) => (
        <FeatureCard
          key={index}
          icon={item.icon}
          title={item.title}
          description={item.description}
        />
      ))}
    </div>

    </>
  );
};

export default Index;
