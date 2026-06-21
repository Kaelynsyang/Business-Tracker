import "./index.css";
import { Routes, Route } from "react-router-dom";
import Homepage from "./pages/homepage";
import Navbar from "./components/navbar";
import SalesPage from "./pages/salespage";

function App() {

  return (
    <div>
      <Navbar/>
      <Routes>
        <Route path = "/" element={<Homepage />}></Route>
        <Route path = "/sales" element={<SalesPage />}></Route>
      </Routes>
    </div>
  );
};

export default App;
