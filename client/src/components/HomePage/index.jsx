// src/pages/HomeCarousel.jsx
import { useCallback } from "react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import FeatureCard from "./FeaturedCard";
import LazyMotionImg from "./LazyLoadingImage";
import { imageLink, collectionsImageLink, themeCollectionImageLink, features } from "../../constants/homePageConstants";

export default function HomeCarousel() {
  const navigate = useNavigate();

  const onShopNow = useCallback(() => {
    navigate("/products");
  }, [navigate]);

  return (
    <>
      {/* Hero Carousel */}
      <div className="max-w-full mx-auto relative">
        <Carousel
          autoPlay
          infiniteLoop
          showThumbs={false} //thumbnails are not needed
          showStatus={false}
          showIndicators
          interval={3000}
          swipeable //Mobile ya touchscreen device pe user finger swipe karke slide change kar sakta hai.
          emulateTouch // Mouse drag ko bhi swipe jaise treat kare (desktop pe swipe effect ka experience).
        >
          {imageLink.map((src, idx) => (
            <div key={idx} className="aspect-w-16 aspect-h-9 bg-gray-100 overflow-hidden rounded-lg">
              <LazyMotionImg 
                src={src} 
                alt={`Banner ${idx + 1}`} 
                className="w-full h-full object-cover" 
                loading={idx === 0 ? "eager" : "lazy"}
                fetchPriority={idx === 0 ? "high" : "auto"} 
              />
            </div>
          ))}
        </Carousel>
        
        <button
          onClick={onShopNow}
          className="cursor-pointer absolute bottom-6 left-1/2 transform -translate-x-1/2 
                     bg-white px-6 py-2 rounded-xl shadow-lg 
                     text-lg font-semibold hover:bg-gray-100 transition-colors duration-300"
        >
          Shop Now
        </button>
      </div>

      {/* Shop by Collection */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center mb-8">Shop by Collection</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {collectionsImageLink.map((item, index) => (
            <LazyMotionImg 
              key={index} 
              src={item.url} 
              alt={`Collection ${item.title}`} 
              loading="lazy" 
              path={item.path} 
            />
          ))}
        </div>
      </section>

      {/* Shop by Theme */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center mb-8">Shop by Theme</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {themeCollectionImageLink.map((item, index) => (
            <LazyMotionImg 
              key={index} 
              src={item.url} 
              alt={`Theme ${item.title}`} 
              loading="lazy" 
              path={item.path} 
            />
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center mb-8">Why Choose Us</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          {features.map((f, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 20 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true, amount: 0.2 }} 
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <FeatureCard icon={f.icon} title={f.title} description={f.description} />
            </motion.div>
          ))}
        </div>
      </section>
    </>
  );
}