import Navbar from "../../components/Navbar";
import { menuItems, productItems,adminItems } from "../../constants/menuItems";
function App() {
  

  return (
      <Navbar
        menuItems={menuItems}
        productItems={productItems}
        adminItems={adminItems}
        brandName="StyleScript"
        logoSrc="https://www.svgrepo.com/show/42638/clothes.svg"
        backgroundColor="bg-gray-900"
        textColor="text-white"
        hoverColor="hover:text-blue-300"
      />

  );
}

export default App;
