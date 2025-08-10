import { memo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const OptimizedLazyImage = ({
  src,
  alt,
  className = "",
  fetchPriority = "auto",
  loading = "lazy",
  path = ""
}) => {

  return (
    <motion.div
      className={`relative overflow-hidden cursor-pointer h-[400px] rounded-lg shadow-md ${className}`}
      initial={{ opacity: 0, y: 50 }} // pehle hidden
      whileInView={{ opacity: 1, y: 0 }} // jab viewport me aaye
      viewport={{ once: true, amount: 0.2 }} // ek hi baar trigger ho
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Link to={path} className="block w-full h-full">
        <motion.img
          src={src}
          alt={alt}
          loading={loading}
          fetchPriority={fetchPriority}
          decoding="async"
          className="w-full h-full object-contain rounded-lg transition-all duration-500 ease-out"
          whileHover={{ scale: 1.05 }} // hover par zoom
          transition={{ duration: 0.3 }}
        />
      </Link>

    </motion.div>
  );
};

export default memo(OptimizedLazyImage);

/**
 * object-contain ka matlab hota hai:

"Image ko box ke andar rakh lekin ratio maintain karke, overflow na kare".


 */