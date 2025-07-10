import { useEffect } from "react";

export default function ColorAndSizeSelector({ 
  product, 
  variants, 
  color, 
  size, 
  setColor, 
  setSize 
}) {
  // Define standard sizes
  const STANDARD_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  
  // Get all available variants (including current product)
  const allVariants = [...variants];
  if (product && !allVariants.find(v => v._id === product._id)) {
    allVariants.push(product);
  }

  // For colors: Only show colors that actually exist in variants
  const colorOptions = Array.from(
    new Set(allVariants.map(v => v.color).filter(Boolean)
  ))

  // For sizes: Show all standard sizes
  const sizeOptions = STANDARD_SIZES;

  // Function to check if a color-size combination is available
  const isVariantAvailable = (selectedColor, selectedSize) => {
    const variant = allVariants.find(v => 
      v.color === selectedColor && 
      v.size === selectedSize && 
      v.availableQty > 0
    );
    return !!variant;
  };

  // Function to get variant for a specific color-size combination
  const getVariant = (selectedColor, selectedSize) => {
    return allVariants.find(v => 
      v.color === selectedColor && 
      v.size === selectedSize
    );
  };

  // When color changes, set size to a valid size for that color
  useEffect(() => {
    if (!color || !variants.length) return;
    const validSizes = variants
      .filter((v) => v.color === color && v.title === product?.title && v.availableQty > 0)
      .map((v) => v.size);
      
    if (validSizes.length && !validSizes.includes(size)) {
      setSize(validSizes[0]);
    }
  }, [color, variants, product?.title]);

  return (
    <div className="py-6 border-b border-gray-200 mb-6">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Color</h3>
        <div className="flex flex-wrap gap-2">
          {colorOptions.map((c) => (
            <ColorButton
              key={c} 
              color={c} 
              isActive={color === c} 
              onClick={() => setColor(c)}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">Size</h3>
        <div className="flex flex-wrap gap-2">
          <SizeSelect 
            sizes={sizeOptions} 
            value={size} 
            onChange={(e) => setSize(e.target.value)}
            selectedColor={color}
            isVariantAvailable={isVariantAvailable}
            getVariant={getVariant}
            allVariants={allVariants}
          />
        </div>
      </div>

      <AvailabilityMessage 
        color={color} 
        size={size} 
        isVariantAvailable={isVariantAvailable}
        getVariant={getVariant}
      />
    </div>
  );
}

// Sub-components for ColorAndSizeSelector
function ColorButton({ 
  color: buttonColor, 
  isActive, 
  onClick
}) {
  return (
    <button
      onClick={onClick}
      className={`
        px-4 py-2 rounded-md border-2 text-sm font-medium transition-all
        ${isActive 
          ? 'border-pink-500 bg-pink-50 text-pink-700' 
          : 'border-gray-300 hover:border-pink-300 text-gray-700'}
      `}
    >
      {buttonColor}
    </button>
  );
}

function SizeSelect({ 
  sizes, 
  value, 
  onChange, 
  selectedColor,
  isVariantAvailable,
  getVariant,
  allVariants
}) {
  return (
    <select 
      value={value} 
      onChange={onChange}
      className="border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-pink-500"
    >
      <option value="">Select Size</option>
      {sizes.map(s => {
        const available = selectedColor 
          ? isVariantAvailable(selectedColor, s) 
          : allVariants.some(v => v.size === s);
          
        const exists = selectedColor 
          ? getVariant(selectedColor, s) 
          : allVariants.some(v => v.size === s);
        
        let label = s;
        if (selectedColor && exists && !available) {
          label += ' - Out of Stock';
        } else if (selectedColor && !exists) {
          label += ' - Currently Unavailable';
        }
        
        return (
          <option 
            key={s} 
            value={s}
            disabled={selectedColor && !exists}
          >
            {label}
          </option>
        );
      })}
    </select>
  );
}

function AvailabilityMessage({ 
  color, 
  size, 
  isVariantAvailable,
  getVariant
}) {
  if (!color || !size) return null;
  
  const available = isVariantAvailable(color, size);
  const exists = getVariant(color, size);
  
  if (available) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-md p-3 mt-4">
        <p className="text-green-800 text-sm font-medium">✓ In Stock - Ready to ship</p>
      </div>
    );
  } else if (exists) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-3 mt-4">
        <p className="text-red-800 text-sm font-medium">Currently out of stock</p>
        <p className="text-red-600 text-xs mt-1">We don't know when or if this item will be back in stock</p>
      </div>
    );
  } else {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-md p-3 mt-4">
        <p className="text-gray-700 text-sm font-medium">Currently unavailable</p>
        <p className="text-gray-600 text-xs mt-1">We don't know when or if this item will be back in stock</p>
      </div>
    );
  }
}