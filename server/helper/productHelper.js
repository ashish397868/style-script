// Helper function to group products by title
const groupProductsByTitle = (products) => {
  const grouped = {};
  
  products.forEach(product => {
    const key = product.title;
    if (!grouped[key]) {
      grouped[key] = {
        ...product,
        variants: []
      };
    }
    
    // Add this product as a variant
    grouped[key].variants.push(product);
  });
  
  // Convert to array and process each group
  return Object.values(grouped).map(group => {
    // Filter out variants with 0 quantity
    group.variants = group.variants.filter(variant => variant.availableQty > 0);
    
    // If no variants are available, don't include this product group
    if (group.variants.length === 0) {
      return null;
    }
    
    // Set the main product data to the first available variant
    const firstAvailableVariant = group.variants[0];
    return {
      ...firstAvailableVariant,
      variants: group.variants
    };
  }).filter(Boolean); // Remove null entries
};

module.exports={
    groupProductsByTitle
}
