import { Link } from "react-router-dom";
import "../index.css"

export default function Navbar(){
    return (
        <nav className="bar nav">
            <ul>
                <li><Link to="/homepage">Home</Link></li>
                <li><Link to="/sales">Sales</Link></li>
                <li><Link to="/inventory">Inventory</Link></li>                
            </ul>
        </nav>
    );
};