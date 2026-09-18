import "../styles/homepage.css";
import { useEffect, useState } from "react"

function Homepage(){
    const API_URL = import.meta.env.VITE_API_URL;
    const [stickers, setStickers] = useState(0);
    const [stats, setStats] = useState({});
    const [dropDown, setDropDown] = useState("");
    const [fieldChoice, setFieldChoice] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState("");
    const [selectedFandom, setSelectedFandom] = useState("");
    const [products, setProducts] = useState([]);
    const [logs, setLogs] = useState([]);
    const [file, setFile] = useState(null);

    const events = [
        "TGEX 26",
        "AIOC 26",
        "ASD 26",
        "ANM SEP 26", 
        "ANM JUN 26"
    ]

    useEffect(() => {
        const fetchStats = async () => {
            const params = new URLSearchParams();
            if (selectedEvent) params.set("event", selectedEvent);
            if (selectedFandom) params.set("fandom", selectedFandom)

            const res = await fetch(`${API_URL}/homepage?${params.toString()}`);
            const data = await res.json();

            setStats(data);
        };

        fetchStats();
    }, [selectedEvent, selectedFandom])

    useEffect(() => {
        fetch(`${API_URL}/products`)
        .then(res => res.json())
        .then(data => setProducts(data))
    } , [])

    useEffect(() => {
        fetch(`${API_URL}/inventory-logs`)
        .then(res => res.json())
        .then(data => setLogs(data))
    }, [])


    const filteredProducts = products.filter(
        product => product.name === fieldChoice
    )

    const fields = ["Stickers", "Prints", "Keychains", "Sticker Sheet", "Heart Pins", "Foil Pins", "Standees", "Plushies", "Fandom", "Event"] //THIS IS HARD CODED
    
    function RegularSection({products, stats}) {
        return (
            <div>
                {products.map(product => (
                        <div key={product.name}>{product.inventory.map(item => {
                            const key = `${product.name}-${item.design}-${item.size}`;
                            const statsAllTime = stats.hashMapAllTime[key];
                            const statsTotalSold = stats.hashMapTotalSold[key];
                        
                            return(
                                    <div key={`${item.design}-${item.size}`}>
                                        {item.design} | {item.size && <>{item.size} |</>} All-time Stock: {statsAllTime ?? 0}| Total Sold: {statsTotalSold ?? 0}
                                    </div>
                            )})}
                        </div>
                    
                ))} 
            </div>
        )
    }
    
    function FandomSection() {
        return (
            <div>
                {[...new Set(stats.fandoms)].map(fandom => {
                    return (
                        <button key={fandom} onClick={() => setSelectedFandom(fandom)}>{fandom}</button>
                        )
                })}
                {selectedFandom && (
                    <div>
                        {products.map(product => {
                             const filterFandom = stats.fandomResults
                                .filter(result => result.type === product.name)
                                .reduce((total, result) => total + result.amountSold, 0)
                                
                            return (
                                    <div key={product._id}>{product.name} | Amount Sold: {filterFandom}</div>
                                )
                        })}

                        <h4>All Products</h4>
                            {stats.fandomResults.map((product) => {
                                return (
                                    <div key={`${product.type}-${product.design}`}>{product.type} | {product.design} {product.size && <> | {product.size} </>}| Amount sold: {product.amountSold}</div>
                                )
                            })}
                    </div>
                )}
            </div>
        )
    }               

    function EventSection() {
        return (
            <div>

                {events.map((eventMap) => (
                    <button key={eventMap} onClick={() => setSelectedEvent(eventMap)} 
                    className={eventMap === event ? "selected" : ""}>
                {eventMap}</button>
                ))}

                {selectedEvent && (
                    <div>
                        <h4>Event Revenue: ${stats.eventRevenue}</h4>
                            <div>
                                {products.map(product => {
                                    const productResults = stats.eventResults.filter(
                                        result => result.type === product.name
                                    );
                                    console.log(stats.eventResults);
                                    const filterProduct = productResults
                                    .filter(result => result.type === product.name)
                                    .reduce((total, result) => total + result.amountSold, 0)
                                    const revenue = productResults.reduce((total, result) => {
                                        const price = product.pricing?.[result.size] ?? product.pricing?.base ?? 1;
                                        return total + result.amountSold * price;
                                    }, 0)

                            return (
                                    <div key={product._id}>{product.name} | Amount Sold: {filterProduct} | Profit: ${revenue}</div>
                                )
                            })}
                    <h4>All Products</h4>
                        {stats.eventResults.map((product) => {
                            return (
                                <div key={`${product.type}-${product.design}-${product?.size}`}>{product.type} | {product.design} {product.size && <> | {product.size} </>}| Amount sold: {product.amountSold}</div>
                            )
                        })}
                    </div>
                    </div>
                    
                    )}
                    </div>
                )}


    const importInventory = async () => {
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`${API_URL}/import-inventory`, {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        console.log(data);
    }

    const importInventoryLogs = async () => {
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`${API_URL}/import-inventory-logs`, {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        console.log(data);
    }

    const importOrders = async () => {
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`${API_URL}/import-orders`, {
            method: "POST",
            body: formData
        })

        const data = await response.json();

        console.log(data);
    }

    console.log(products);
            
    return(
        <div id="homepage">
            <div className="home">
                <h1>Dashboard</h1>
            <div className="dashboard">
                <div className="topStatsRow">
                <div className="topStatsCard">
                    <h3>Best Seller</h3>
                    <p>
                        1st {stats.topSeller} at {stats.topSellerCount}<br/>
                        2nd {stats.secondSeller} at {stats.secondSellerCount}<br/> 
                        3rd {stats.thirdSeller} at {stats.thirdSellerCount}
                    </p>
                </div>
                <div className="topStatsCard">
                    <h3>Best Type/Category</h3>
                    <p>
                        1st {stats.topType} at {stats.topTypeCount}<br/> 
                        2nd {stats.secondType} at {stats.secondTypeCount}<br/> 
                        3rd {stats.thirdType} at {stats.thirdTypeCount} 
                    </p>
                </div>
                <div className="topStatsCard">
                    <h3>Top Fandom</h3>
                    <p>
                        1st {stats.topFandom} at {stats.topFandomCount}<br/> 
                        2nd {stats.secondFandom} at {stats.secondFandomCount}<br/> 
                        3rd {stats.thirdFandom} at {stats.thirdFandomCount}
                    </p>
                </div>
                </div>
                <div className="generalStats">
                    <p>
                        Best Deal: {stats.topDeal} at {stats.topDealCount}<br/> 
                        2nd Best Deal: {stats.secondTopDeal} at {stats.secondTopDealCount}<br/> 
                        Best Event: {stats.topEvent} at ${stats.topEventCount}<br/>
                        Preferred Payment: {stats.topPayment} at {stats.topPaymentCount}<br/>
                        Total Items Sold: {stats.totalItemSoldCount}
                    </p>
                </div>

                <p>
                    Net Profit:  <br/>
                    Expenses: 
                </p>
            </div>

            <div className="detailsSection">
                <h2>Details</h2>
                    <div className="detailSelection">
                        {fields.map((field, index) => (
                            <button 
                            key={index}
                            onClick={() => setFieldChoice(field)}
                            >{field}</button>
                        ))}
                    </div>
                    
                    {fieldChoice && (
                        <div className="popup">
                            <h3>{fieldChoice}</h3>

                            {fieldChoice === "Fandom" ? (
                                <FandomSection/>
                            ) : fieldChoice === "Event" ? (
                                <EventSection/>
                            ) : (
                                <RegularSection products={filteredProducts} stats={stats}/>
                            )}
                            
                        </div>
                    )}
            </div>
            <div className='exportImport'>
                <button onClick={() =>
                    window.open(
                        `${API_URL}/export-orders`,
                        "_blank"
                    )}>Export Orders (CSV)</button>
                <button onClick={() =>
                    window.open(
                        `${API_URL}/export-inventory-logs`,
                        "_blank"
                    )}>Export Inventory Logs(CSV)</button>
                <button onClick={() =>
                    window.open(
                        `${API_URL}/export-inventory`,
                        "_blank"
                    )}>Export Inventory</button>

                <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files[0])}/>
                <button onClick={importInventory}>Import Inventory</button>
                <button onClick={importInventoryLogs}>Import Inventory Logs</button>
                <button onClick={importOrders}>Import Orders</button>
            </div>
            </div>
        </div>
    );
}

export default Homepage;