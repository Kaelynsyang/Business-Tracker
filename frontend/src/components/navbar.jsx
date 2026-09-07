import { Link } from "react-router-dom";
import { useState } from 'react';
import "../styles/navbar.css"

export default function Navbar(){
    const [isOpen, setIsOpen] = useState(false);
    return (
        <nav className="bar nav">
            <ul className={isOpen ? "active" : ""}>
                <li><Link to="/homepage">Home</Link></li>
                <li><Link to="/sales">Sales</Link></li>
                <li><Link to="/inventory">Inventory</Link></li>     
                <li className="documentation"><Link to="/documentation">Documentation</Link></li>              
            </ul>
            <button className="menu-toggle" onClick={() => setIsOpen(!isOpen)}>
                ☰
            </button>
        </nav>
    );
};