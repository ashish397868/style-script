// src/components/FilterSidebar.jsx
import { FaTimes } from 'react-icons/fa';
import { MdOutlineCategory } from 'react-icons/md';
import colorMap from '../../constants/colorMap';

const FilterSidebar = ({
  isOpen,
  onClose,
  categories,
  selectedCategory,
  onSelectCategory,
  priceRange,
  onPriceRangeChange,
  sizes,
  selectedSizes,
  onSizeChange,
  colors,
  selectedColors,
  onColorChange,
  onResetFilters
}) => {
  // Toggle a size selection
  const handleSizeToggle = (size) => {
    if (selectedSizes.includes(size)) {
      onSizeChange(selectedSizes.filter(s => s !== size));
    } else {
      onSizeChange([...selectedSizes, size]);
    }
  };

  // Toggle a color selection
  const handleColorToggle = (color) => {
    if (selectedColors.includes(color)) {
      onColorChange(selectedColors.filter(c => c !== color));
    } else {
      onColorChange([...selectedColors, color]);
    }
  };

  return (
    <div
      className={`${
        isOpen ? 'fixed inset-0 z-50 bg-white p-4 overflow-auto md:static md:block md:w-1/4 md:pr-8' : 'hidden md:block md:w-1/4 md:pr-8'
      }`}
      aria-modal={isOpen ? 'true' : undefined}
      role={isOpen ? 'dialog' : undefined}
    >
      {/* Filter Header */}
      <div className={`${isOpen ? 'flex' : 'hidden md:hidden'} justify-between items-center mb-6 md:hidden`}>
        <h2 className="text-xl font-bold">Filters</h2>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 p-2"
          aria-label="Close filters"
        >
          <FaTimes className="w-5 h-5" />
        </button>
      </div>
      
      {/* Categories */}
      <div className="mb-8">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center">
          <MdOutlineCategory className="mr-2" /> Categories
        </h3>
        <ul className="space-y-2">
          {categories.map(category => (
            <li key={category.id}>
              <button 
                onClick={() => onSelectCategory(category.id)}
                className={`flex items-center w-full text-left p-2 rounded-md transition-colors ${
                  selectedCategory === category.id 
                    ? 'bg-pink-100 text-pink-700 font-medium' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                aria-pressed={selectedCategory === category.id}
              >
                {category.icon} {category.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
      
      {/* Price Range */}
      <div className="mb-8">
        <h3 className="font-bold text-gray-900 mb-4">Price Range</h3>
        <div className="px-2">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>₹{priceRange[0]}</span>
            <span>₹{priceRange[1]}</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="5000" 
            step="100"
            value={priceRange[0]}
            onChange={e => onPriceRangeChange([parseInt(e.target.value), priceRange[1]])}
            className="w-full mb-4"
          />
          <input 
            type="range" 
            min="0" 
            max="5000" 
            step="100"
            value={priceRange[1]}
            onChange={e => onPriceRangeChange([priceRange[0], parseInt(e.target.value)])}
            className="w-full"
          />
        </div>
      </div>
      
      {/* Sizes */}
      {sizes.length > 0 && (
        <div className="mb-8">
          <h3 className="font-bold text-gray-900 mb-4">Sizes</h3>
          <div className="flex flex-wrap gap-2">
            {sizes.map(size => (
              <button
                key={size}
                onClick={() => handleSizeToggle(size)}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedSizes.includes(size)
                    ? 'bg-pink-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
                aria-pressed={selectedSizes.includes(size)}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Colors */}
      {colors.length > 0 && (
        <div className="mb-8">
          <h3 className="font-bold text-gray-900 mb-4">Colors</h3>
          <div className="flex flex-wrap gap-2">
            {colors.map(color => {
              const colorKey = color.toLowerCase();
              const colorInfo = colorMap.find(c => c.name.toLowerCase() === colorKey) || { name: colorKey, className: '' };
              return (
                <button
                  key={color}
                  onClick={() => handleColorToggle(color)}
                  aria-pressed={selectedColors.includes(color)}
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center
                    ${selectedColors.includes(color) ? 'ring-2 ring-offset-2 ring-pink-500' : ''}
                    ${colorInfo.className || ''}`}
                  style={!colorInfo.className ? { backgroundColor: colorKey } : {}}
                  aria-label={color}
                >
                  {selectedColors.includes(color) && (
                    <span className="text-white text-xs">✓</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Reset Filters */}
      <button 
        onClick={onResetFilters}
        className="w-full py-2 border border-pink-600 text-pink-600 rounded-md hover:bg-pink-50 transition-colors"
        aria-label="Reset all filters"
      >
        Reset Filters
      </button>
    </div>
  );
};

export default FilterSidebar;