// src/pages/HomeCarousel.jsx
import { useEffect, useMemo, useCallback, useState } from "react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { useNavigate } from "react-router-dom";
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

  // 1) Preload carousel images - only preload the first few that are likely to be seen
  useEffect(() => {
    // Only preload the first 2 images to avoid unnecessary network requests
    const imagesToPreload = imageLink.slice(0, 2);
    
    const linkTags = imagesToPreload.map((src, index) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = src;
      // Add fetchPriority="high" to the first image
      if (index === 0) {
        link.setAttribute("fetchPriority", "high");
      }
      document.head.appendChild(link);
      return link;
    });
    
    return () => {
      linkTags.forEach((link) => {
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
      });
    };
  }, []);

  // 2) Keep track of current slide index so we can eager-load the next one
  const [currentIndex, setCurrentIndex] = useState(0);

  // Memoize carousel slides
  const carouselSlides = useMemo(
    () =>
      imageLink.map((src, idx) => {
        // Decide loading strategy per-slide:
        // - idx === 0  → eager (first slide) with high priority
        // - idx === currentIndex + 1 → eager (preload the next slide)
        // - otherwise → lazy
        const loading = idx === 0 || idx === currentIndex + 1 ? "eager" : "lazy";
        const priority = idx === 0 ? "high" : "auto";
        
        return (
          <div key={idx} className="aspect-w-16 aspect-h-9 bg-gray-100">
            <LazyMotionImg
              src={src}
              alt={`Banner ${idx + 1}`}
              className="w-full h-full object-cover"
              loading={loading}
              fetchPriority={priority}
            />
          </div>
        );
      }),
    [imageLink, currentIndex]
  );

  // Collections grid
  const collectionItems = useMemo(
    () =>
      collectionsImageLink.map(({ url, path }, idx) => (
        <div
          key={idx}
          className="cursor-pointer w-full h-[400px] overflow-hidden rounded-lg shadow-md"
          onClick={() => navigate(path)}
        >
          <LazyMotionImg
            src={url}
            alt={`Collection ${idx + 1}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )),
    [collectionsImageLink, navigate]
  );

  // Themes grid
  const themeItems = useMemo(
    () =>
      themeCollectionImageLink.map(({ url, path }, idx) => (
        <div
          key={idx}
          className="cursor-pointer w-full h-[400px] overflow-hidden rounded-lg shadow-md"
          onClick={() => navigate(path)}
        >
          <LazyMotionImg
            src={url}
            alt={`Theme ${idx + 1}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )),
    [themeCollectionImageLink, navigate]
  );

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

        <button
          aria-label="Shop Now"
          onClick={onShopNow}
          className="absolute bottom-6 left-1/2 transform -translate-x-1/2 
                     bg-white px-6 py-2 rounded-xl shadow-lg 
                     text-lg font-semibold hover:bg-gray-100 transition"
        >
          Shop Now
        </button>
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
            <FeatureCard
              key={i}
              icon={f.icon}
              title={f.title}
              description={f.description}
            />
          ))}
        </div>
      </section>
    </>
  );
}
