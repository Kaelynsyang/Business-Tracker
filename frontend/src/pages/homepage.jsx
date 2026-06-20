import '../index.css'
import { useState } from "react"

function Homepage(){
    const API_URL = import.meta.env.VITE_API_URL;
    const [stickers, setStickers] = useState(0);
    return(
        <div>
            <div className="home">
            <div>
                <h1>SalesTracker</h1>
            </div>
            <div className='buttons'>
                <button
                    onClick={() =>
                    window.open(
                        `${API_URL}/export-orders`,
                        "_blank"
                    )
                }
>
    Export CSV
</button>
            </div>
            </div>
        </div>
    );
}

export default Homepage;