import "../styles/homepage.css";
import { useEffect, useState } from "react"

function Homepage(){
    const API_URL = import.meta.env.VITE_API_URL;
    const [stats, setStats] = useState({});
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

    const fields = ["Stickers", "Prints", "Keychains", "Sticker Sheet", "Heart Pins", "Foil Pins", "Standees", "Plushies", "Fandom", "Event"] //THIS IS HARD CODED

    const statItems = [
        { label: "Best Deal", value: `${stats.topDeal}`, count: `${stats.topDealCount}` },
        { label: "2nd Best Deal", value: `${stats.secondTopDeal}`, count: `${stats.secondTopDealCount}` },
        { label: "Best Event", value: `${stats.topEvent}`, count: `${stats.topEventCount}` },
        { label: "Preferred Payment", value: `${stats.topPayment}`, count: `${stats.topPaymentCount}` },
        { label: "Total Items Sold", value: stats.totalItemSoldCount }
    ];
    

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

    function RegularSection({products, stats}) {
        return (
            <div className="inventoryTable detailTable">
                <div className="inventoryHeader detailHeader">
                    <div>Design</div>
                    <div>All-time Stock</div>
                    <div>Total Sold</div>
                </div>
                <div className="inventoryBody detailBody">
                    {products.flatMap(product => (
                        product.inventory.map(item => {
                            const key = `${product.name}-${item.design}-${item.size}`;
                            const statsAllTime = stats.hashMapAllTime[key];
                            const statsTotalSold = stats.hashMapTotalSold[key];
                        
                            return (
                                <div className="detailRow" key={key}>
                                    <div key={`${key}-design`}>
                                        {item.design} {item.size && <> | {item.size}</>}
                                    </div>
                                    <div key={`${key}-stock`}>
                                        {statsAllTime ?? 0}
                                    </div>
                                    <div key={`${key}-sold`}>
                                        {statsTotalSold ?? 0}
                                    </div>
                                </div>
                            )})
                    ))} 
                </div>
            </div>
        )
    }
    
    function FandomSection() {
        return ( 
            <div className="detailpopup">
                <div className="detailContent">
                <div className="detailTableButtons">
                {[...new Set(stats.fandoms)].map(fandom => {
                    return (
                        <button key={fandom} onClick={() => setSelectedFandom(fandom)}>{fandom}</button>
                        )
                })}
                </div>
                {selectedFandom && (
                    <>
                        <h4>All Products</h4>
                            <div className="inventoryTable detailTable">
                                <div className="inventoryHeader detailHeader">
                                    <div>Product</div>
                                    <div>Design</div>
                                    <div>Amount Sold</div>
                                </div>
                                <div className="inventoryBody detailBody">
                                    {stats.fandomResults.map((product) => (
                                            <div className="detailRow" key={`${product.type}-${product.design}-${product.size}`}>
                                                <div>{product.type}</div>
                                                <div>{product.design} {product.size && <> | {product.size} </>}</div>
                                                <div>{product.amountSold}</div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                    </>
                )}
                </div>
                {selectedFandom && (
                    <div className="detailDashboard">
                    <h4>Product Statistics</h4>
                    <h4 style={{"fontWeight": "400"}}>Units Sold</h4>
                        <div className="unitsSold">
                            {products.map(product => {
                                 const filterFandom = stats.fandomResults
                                    .filter(result => result.type === product.name)
                                    .reduce((total, result) => total + result.amountSold, 0)

                                return (
                                    <div className="unitSold" key={product._id}>
                                        <div>{product.name}</div>
                                        <div>{filterFandom}</div>
                                    </div>
                                )
                            })}
                        </div>
                        <p>
                            <br/>
                            future stats can go here such as maybe how much proft from each product
                            or most popular design in this fandom or i can just max out the table height smaller 
                        </p>
                    </div>
                )}
            </div>
        )
    }               

    function EventSection() {
        return (
            <div className="event detailpopup">
                <div className="detailContent">
                <div className="detailTableButtons">
                {events.map((eventMap) => (
                    <button key={eventMap} onClick={() => setSelectedEvent(eventMap)} 
                    className={eventMap === selectedEvent ? "selected" : ""}>
                {eventMap}</button>
                ))}
                </div>
                {selectedEvent && (
                    <>
                    <h4>All Products</h4>
                        <div className="inventoryTable detailTable">
                                <div className="inventoryHeader detailHeader">
                                    <div>Product</div>
                                    <div>Design</div>
                                    <div>Amount Sold</div>
                                </div>
                                <div className="inventoryBody detailBody">
                                    {stats.eventResults.map((product) => {
                                        return (
                                            <div className="detailRow" key={`${product.type}-${product.design}-${product.size}`}>
                                                <div>{product.type}</div>
                                                <div>{product.design} {product.size && <> | {product.size} </>}</div>
                                                <div>{product.amountSold}</div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                            </>
                        )}
                        </div>
                        {selectedEvent && (
                        <div className="detailDashboard">
                        <h4>Event Revenue: ${stats.eventRevenue}</h4>
                            <h4>Product Statistics</h4>
                            <h4 style={{"fontWeight": "400"}}>Units Sold | Profit</h4>
                            <div className="unitsSold">
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
                                    <div className="unitSold">
                                        <div key={product._id}>{product.name}</div>
                                        <div>{filterProduct} | ${revenue}</div>
                                    </div>
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
                <div className="statsRow">
                    {statItems.map((item) => (
                        <div className="statCol" key={item.label}>
                            <h3>{item.value}</h3>
                            <p>{item.label}</p>
                            <div className="statCount">
                                <h3>{item?.count}</h3>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="detailsSection">
                <h2>Details</h2>
                    <div className="detail">
                        {fields.map((field, index) => (
                            <button 
                            key={index}
                            className={fieldChoice === field ? "selected" : ""}
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
                <h2>Export/Import Data</h2>
                <div className="exportImportContainer">
                <div className="export exportImportCard">
                    <h3>Export</h3>
                    <div className="exportImportButtons">
                        <button onClick={() =>
                            window.open(`${API_URL}/export-orders`, "_blank"
                        )}>Export Orders (CSV)</button>
                        <button onClick={() =>
                            window.open(`${API_URL}/export-inventory-logs`, "_blank"
                        )}>Export Inventory Logs(CSV)</button>
                        <button onClick={() =>
                            window.open(`${API_URL}/export-inventory`, "_blank"
                        )}>Export Inventory</button>
                    </div>
                    
                </div>
                <div className="import exportImportCard">
                    <h3>Import</h3>
                    <div className="exportImportButtons">
                        <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files[0])}/>
                        <button onClick={importInventory}>Import Inventory</button>
                        <button onClick={importInventoryLogs}>Import Inventory Logs</button>
                        <button onClick={importOrders}>Import Orders</button>
                    </div>
                </div>
            </div>
            </div>
            </div>
        </div>
    );
}

export default Homepage;