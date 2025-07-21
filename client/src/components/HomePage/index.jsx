// src/pages/HomeCarousel.jsx
import { useEffect, useMemo, useCallback, useState } from "react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import FeatureCard from "./FeaturedCard";
import LazyMotionImg from "./LazyLoadingImage";

import {
  imageLink,
  collectionsImageLink,
  themeCollectionImageLink,
  features,
} from "../../constants/homePageConstants";

export default function HomeCarousel() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  // ✅ Carousel slides (memoized)
  const carouselSlides = useMemo(
    () =>
      imageLink.map((src, idx) => {
        const loading = idx === 0 || idx === currentIndex + 1 ? "eager" : "lazy";
        const priority = idx === 0 ? "high" : "auto";

        return (
          <motion.div
            key={idx}
            className="aspect-w-16 aspect-h-9 bg-gray-100 overflow-hidden rounded-lg"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <LazyMotionImg
              src={src}
              alt={`Banner ${idx + 1}`}
              className="w-full h-full object-cover"
              loading={loading}
              fetchPriority={priority}
            />
          </motion.div>
        );
      }),
    [currentIndex]
  );

  // ✅ Shop by Collection grid (memoized)
  const collectionItems = useMemo(
    () =>
      collectionsImageLink.map(({ url, path }, idx) => (
        <motion.div
          key={idx}
          className="cursor-pointer w-full h-[400px] overflow-hidden rounded-lg shadow-md"
          onClick={() => navigate(path)}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.4, delay: idx * 0.05 }}
          whileHover={{ scale: 1.03 }}
        >
          <LazyMotionImg
            src={url}
            alt={`Collection ${idx + 1}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </motion.div>
      )),
    [navigate]
  );

  // ✅ Shop by Theme grid (memoized)
  const themeItems = useMemo(
    () =>
      themeCollectionImageLink.map(({ url, path }, idx) => (
        <motion.div
          key={idx}
          className="cursor-pointer w-full h-[400px] overflow-hidden rounded-lg shadow-md"
          onClick={() => navigate(path)}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.4, delay: idx * 0.05 }}
          whileHover={{ scale: 1.03 }}
        >
          <LazyMotionImg
            src={url}
            alt={`Theme ${idx + 1}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </motion.div>
      )),
    [navigate]
  );

  // ✅ Button click handler
  const onShopNow = useCallback(() => {
    navigate("/products");
  }, [navigate]);

  return (
    <>
      {/* —— Hero Carousel —— */}
      <div className="max-w-full mx-auto relative">
        <Carousel
          autoPlay
          infiniteLoop
          showThumbs={false}
          showStatus={false}
          showIndicators
          interval={5000}
          stopOnHover
          dynamicHeight={false}
          lazyLoad={true}
          swipeable
          emulateTouch
          preventMovementUntilSwipeScrollTolerance
          swipeScrollTolerance={50}
          onChange={(index) => setCurrentIndex(index)}
        >
          {carouselSlides}
        </Carousel>

        <motion.button
          aria-label="Shop Now"
          onClick={onShopNow}
          className="absolute bottom-6 left-1/2 transform -translate-x-1/2 
                     bg-white px-6 py-2 rounded-xl shadow-lg 
                     text-lg font-semibold hover:bg-gray-100 transition"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          whileHover={{ scale: 1.05 }}
        >
          Shop Now
        </motion.button>
      </div>

      {/* —— Shop by Collection —— */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center mb-8">Shop by Collection</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {collectionItems}
        </div>
      </section>

      {/* —— Shop by Theme —— */}
      <section className="max-w-6xl mx-auto px-4 py-12 bg-gray-50 rounded-xl my-8">
        <h2 className="text-3xl font-bold text-center mb-8">Shop by Theme</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {themeItems}
        </div>
      </section>

      {/* —— Features —— */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold text-center mb-8">Why Choose Us</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <FeatureCard icon={f.icon} title={f.title} description={f.description} />
            </motion.div>
          ))}
        </div>
      </section>
    </>
  );
}
