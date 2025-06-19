import Navbar from "../../components/Navbar";
import { menuItems, productItems,adminItems } from "../../constants/menuItems";
function App() {
  

  return (
      <Navbar
        menuItems={menuItems}
        productItems={productItems}
        adminItems={adminItems}
        brandName="FitnessPro"
        backgroundColor="bg-gray-900"
        textColor="text-white"
        hoverColor="hover:text-blue-300"
      />

  );
}

export default App;
