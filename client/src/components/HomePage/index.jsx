import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { useNavigate } from "react-router-dom";
import { useMemo, Suspense, useCallback, useEffect } from "react";
import FeatureCard from "./FeaturedCard";
import { imageLink, collectionsImageLink, themeCollectionImageLink, features } from "../../constants/homePageConstants";
import LazyMotionImg from "./LazyLoadingImage";

const Index = () => {
  const navigate = useNavigate();

  // Preload critical carousel images
  useEffect(() => {
    const preloadImages = imageLink.slice(0, 2).map(src => {
      const img = new Image();
      img.src = src;
      return img;
    });
    
    return () => {
      preloadImages.forEach(img => {
        img.src = '';
      });
    };
  }, []);

  // Memoize carousel images to prevent re-renders with optimizations
  const carouselImages = useMemo(() => 
    imageLink.map((src, index) => (
      <div key={index}>
        <LazyMotionImg
          src={src}
          alt={`Banner ${index + 1}`}
          className="w-full h-auto"
          index={index}
          loading={index === 0 ? "eager" : "lazy"} // Load first image immediately
          priority={index === 0} // Prioritize first image
        />
      </div>
    )), []);

  // Memoize collection images - updated to match theme size
  const collectionImages = useMemo(() => 
    collectionsImageLink.map((item, index) => (
      <LazyMotionImg
        key={`collection-${index}`}
        src={item.url}
        alt={`Collection ${index + 1}`}
        className="w-full h-[400px] object-cover rounded-lg shadow-md"
        index={index}
        path={item.path} // Pass path for navigation
      />
    )), []);

  // Memoize theme images
  const themeImages = useMemo(() => 
    themeCollectionImageLink.map((item, index) => (
      <LazyMotionImg
        key={`theme-${index}`}
        src={item.url}
        alt={`Theme ${index + 1}`}
        className="w-full h-[400px] object-cover rounded-lg shadow-md"
        index={index}
        path={item.path} // Pass path for navigation
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
          {/* Preload first few images */}
          {imageLink.slice(0, 3).map((src, index) => (
            <link key={`preload-${index}`} rel="preload" as="image" href={src} />
          ))}
          
          <Carousel 
            autoPlay 
            infiniteLoop 
            showThumbs={false} 
            showStatus={false} 
            showIndicators={true} 
            interval={5000} // Increased interval for better loading
            stopOnHover 
            dynamicHeight={false}
            lazyLoad={false} // Disable carousel's lazy loading since we're handling it
            swipeable={true}
            emulateTouch={true}
            preventMovementUntilSwipeScrollTolerance={true}
            swipeScrollTolerance={50}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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