import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useCallback, useMemo, lazy, Suspense } from "react";
import FeatureCard from "./FeaturedCard";

// Lazy load heavy components
const LazyMotionImg = lazy(() => import('./LazyLoadingImage'));

const imageLink = [
  "https://codeswear.nyc3.cdn.digitaloceanspaces.com/constants/landing/banner/6.webp",
  "https://codeswear.nyc3.cdn.digitaloceanspaces.com/constants/landing/banner/3.webp",
  "https://codeswear.nyc3.cdn.digitaloceanspaces.com/constants/landing/banner/2.webp",
  "https://codeswear.nyc3.cdn.digitaloceanspaces.com/constants/landing/banner/5.webp",
];

const collectionsImageLink = [
  "https://codeswear.nyc3.cdn.digitaloceanspaces.com/constants/landing/collections/caps.webp",
  "https://codeswear.nyc3.cdn.digitaloceanspaces.com/constants/landing/collections/hoodie.webp",
  "https://codeswear.nyc3.cdn.digitaloceanspaces.com/constants/landing/collections/oversizedtshirt.webp",
  "https://codeswear.nyc3.cdn.digitaloceanspaces.com/constants/landing/collections/polotshirts.webp",
  "https://codeswear.nyc3.cdn.digitaloceanspaces.com/constants/landing/collections/tshirt.webp",
  "https://codeswear.nyc3.cdn.digitaloceanspaces.com/constants/landing/collections/sweatshirt.webp",
];

const themeCollectionImageLink = [
  "https://codeswear.nyc3.cdn.digitaloceanspaces.com/constants/landing/themes/combooffers.webp",
  "https://codeswear.nyc3.cdn.digitaloceanspaces.com/constants/landing/themes/gaming.webp",
  "https://codeswear.nyc3.cdn.digitaloceanspaces.com/constants/landing/themes/fitness.webp",
  "https://codeswear.nyc3.cdn.digitaloceanspaces.com/constants/landing/themes/lifestyle.webp",
  "https://codeswear.nyc3.cdn.digitaloceanspaces.com/constants/landing/themes/programming.webp",
  "https://codeswear.nyc3.cdn.digitaloceanspaces.com/constants/landing/themes/trending.webp",
];

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

// Optimized Image component with better lazy loading
const OptimizedImage = ({ src, alt, className, onClick, loading = "lazy" }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
  }, []);

  if (hasError) {
    return (
      <div className={`${className} bg-gray-200 flex items-center justify-center`}>
        <span className="text-gray-500">Failed to load image</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse rounded-lg" />
      )}
      <img
        src={src}
        alt={alt}
        loading={loading}
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        onClick={onClick}
        className={`${className} transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          aspectRatio: className.includes('h-[400px]') ? '4/5' : 'auto'
        }}
      />
    </div>
  );
};

// Optimized Motion Image component
const MotionImage = ({ src, alt, className, index = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ 
        duration: 0.3, 
        delay: index * 0.1,
        ease: "easeOut"
      }}
      whileHover={{ scale: 1.05 }}
      className="cursor-pointer"
    >
      <OptimizedImage
        src={src}
        alt={alt}
        className={className}
      />
    </motion.div>
  );
};

const Index = () => {
  const navigate = useNavigate();

  // Memoize carousel images to prevent re-renders
  const carouselImages = useMemo(() => 
    imageLink.map((src, index) => (
      <div key={index}>
        <OptimizedImage
          src={src}
          alt={`Banner ${index + 1}`}
          className="w-full h-auto"
          loading={index === 0 ? "eager" : "lazy"} // Load first image immediately
        />
      </div>
    )), []);

  // Memoize collection images
  const collectionImages = useMemo(() => 
    collectionsImageLink.map((src, index) => (
      <MotionImage
        key={`collection-${index}`}
        src={src}
        alt={`Collection ${index + 1}`}
        className="rounded-lg shadow-md w-full h-64 object-cover"
        index={index}
      />
    )), []);

  // Memoize theme images
  const themeImages = useMemo(() => 
    themeCollectionImageLink.map((src, index) => (
      <MotionImage
        key={`theme-${index}`}
        src={src}
        alt={`Theme ${index + 1}`}
        className="w-full h-[400px] object-cover rounded-lg shadow-md"
        index={index}
      />
    )), []);

  const handleShopNowClick = useCallback(() => {
    navigate("/products");
  }, [navigate]);

  return (
    <>
      {/* Hero Carousel Section */}
      <div className="max-w-full mx-auto relative flex justify-center items-center">
        <div className="w-full">
          <Carousel 
            autoPlay 
            infiniteLoop 
            showThumbs={false} 
            showStatus={false} 
            showIndicators={true} 
            interval={4000}
            stopOnHover 
            dynamicHeight={false}
            lazyLoad={true}
            swipeable={true}
            emulateTouch={true}
          >
            {carouselImages}
          </Carousel>

          <button 
            className="absolute bottom-6 md:bottom-12 text-sm md:text-xl lg:text-2xl py-2 px-6 md:px-8 bg-white font-semibold md:font-bold rounded-xl md:rounded-2xl cursor-pointer hover:bg-gray-100 transition-colors duration-200 z-10 shadow-lg left-1/2 transform -translate-x-1/2" 
            onClick={handleShopNowClick}
            aria-label="Shop Now"
          >
            Shop Now
          </button>
        </div>
      </div>
      
      {/* Collection Section */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Shop by Collection</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {collectionImages}
        </div>
      </section>

      {/* Theme Section */}
      <section className="max-w-6xl mx-auto px-4 py-12 bg-gray-50 rounded-xl my-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Shop by Theme</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Suspense fallback={
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="w-full h-[400px] bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse rounded-lg" />
              ))}
            </div>
          }>
            {themeImages}
          </Suspense>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Why Choose Us</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((item, index) => (
            <FeatureCard
              key={index}
              icon={item.icon}
              title={item.title}
              description={item.description}
            />
          ))}
        </div>
      </section>
    </>
  );
};

export default Index;