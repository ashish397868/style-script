import { useEffect } from "react";

export default function ColorAndSizeSelector({ variants, color, size, setColor, setSize }) {
  const STANDARD_SIZES = ["S", "M", "L", "XL", "XXL"];

  // Unique colors
  const colorOptions = [...new Set(variants.map((v) => v.color).filter(Boolean))];

  // Variant finder  // Is function ka kaam hai specific color + size ka variant object dhoondhna.
  const getVariant = (selectedColor, selectedSize) => variants.find((v) => v.color === selectedColor && v.size === selectedSize);

  // Auto-select first size when color changes
  useEffect(() => {
    if (!color) return;
    const availableSizes = variants.filter((v) => v.color === color).map((v) => v.size); //Us color ke saare sizes nikaale.
    const firstAvailable = STANDARD_SIZES.find((s) => availableSizes.includes(s)); //STANDARD_SIZES me se jo pehla size available hai, wo select kar diya.
    if (firstAvailable && firstAvailable !== size) { //Agar already same size selected hai to kuch nahi kiya. nhi to first select krliya
      setSize(firstAvailable);
    }
  }, [color]);

  return (
    <div className="py-4 space-y-6">
      {/* Color Selection */}
      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-3">Color</h3>
        <div className="flex flex-wrap gap-2">
          {colorOptions.map((colorOption) => {
            const hasStock = variants.some((v) => v.color === colorOption);

            return (
              <button
                key={colorOption}
                onClick={() => {
                  setColor(colorOption);
                  const availableSizes = variants.filter((v) => v.color === colorOption).map((v) => v.size);
                  const firstSize = STANDARD_SIZES.find((s) => availableSizes.includes(s));
                  if (firstSize) setSize(firstSize);
                }}
                className={`capitalize cursor-pointer px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all duration-200 ${
                  color === colorOption ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm" : "border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
                disabled={!hasStock}
              >
                {colorOption}
              </button>
            );
          })}
        </div>
      </div>

      {/* Size Selection */}
      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-3">Size</h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {STANDARD_SIZES.map((sizeOption) => {
            const exists = color ? !!getVariant(color, sizeOption) : false;
            const isSelected = size === sizeOption;

            return (
              <button
                key={sizeOption}
                onClick={() => setSize(sizeOption)}
                disabled={!exists}
                className={`py-2 px-3 text-sm font-medium rounded-lg border-2 transition-all duration-200 ${
                  isSelected ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm" : exists ? "border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50" : "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed"
                }`}
              >
                {sizeOption}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stock Message */}
      {color && size && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-green-800 text-sm font-medium">In Stock - Ready to ship</span>
        </div>
      )}
    </div>
  );
}
