import Navbar from "../../components/Navbar";

function App() {
  const menuItems = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" }
  ];
  
  const productItems = [
    { href: "/products/protein", label: "Protein Powders" },
    { href: "/products/vitamins", label: "Vitamins" },
    { href: "/products/equipment", label: "Equipment" }
  ];

  return (
      <Navbar 
        menuItems={menuItems}
        productItems={productItems}
        brandName="FitnessPro"
        backgroundColor="bg-gray-900"
        textColor="text-white"
        hoverColor="hover:text-blue-300"
      />
  );
}

export default App;