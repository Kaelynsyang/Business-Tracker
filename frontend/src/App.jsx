import "./index.css";
import { Routes, Route } from "react-router-dom";
import Homepage from "./pages/homepage";
import Navbar from "./components/navbar";
import SalesPage from "./pages/salespage";
import InventoryPage from "./pages/inventory";
import DocumentationPage from "./pages/documentation";

function App() {

  return (
    <div>
      <Navbar/>
      <Routes>
        <Route path = "/homepage" element={<Homepage />}></Route>
        <Route path = "/sales" element={<SalesPage />}></Route>
        <Route path = "/inventory" element={<InventoryPage />}></Route>
        <Route path = "/documentation" element={<DocumentationPage />}></Route>
      </Routes>
    </div>
  );
};

export default App;
