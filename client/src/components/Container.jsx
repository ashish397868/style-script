const Container = ({ children, className = "" }) => (
  <section
    className={`min-h-[370px] container mx-auto px-4 py-12 max-w-3xl w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-6xl ${className}`}
  >
    {children}
  </section>
);

export default Container;