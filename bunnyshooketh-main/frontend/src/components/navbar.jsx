import { Link } from "react-router-dom";
import "../index.css"

export default function Navbar(){
    return (
        <nav className="bar nav">
            <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/sales">Sales</Link></li>
            </ul>
        </nav>
    );
};