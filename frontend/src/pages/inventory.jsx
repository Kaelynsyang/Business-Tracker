import "../styles/inventory.css";
import { useEffect, useState } from "react";

function InventoryPage(){
    const [products, setProducts] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [adjustment, setAdjustment] = useState("");
    const [showPopup, setShowPopup] = useState(false);
    const [stockChange, setStockChange] = useState(0);
    const [note, setNote] = useState("");
    const [logs, setLogs] = useState([]);
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
    
    useEffect(() => {
        fetch(`${API_URL}/products`)
        .then(res => res.json())
        .then(data => setProducts(data));
    }, []);

    useEffect(() => {
        fetch(`${API_URL}/inventory-logs`)
        .then(res => res.json())
        .then(data => setLogs(data))
    }, [])
    
    const deleteOrder = async (id) => {
        await fetch(
            `${API_URL}/inventory-logs/${id}`,
            {
                method: "DELETE"
            });

        setLogs(
            logs.filter(log => log._id !== id)
        );
    };

    const openPopup = (product, item) => {
        setSelectedItem({
            product,
            inventory: item
        });
        setShowPopup(true);
    }
    
    const closePopup = () => {
        setAdjustment(0);
        setShowPopup(false);
    }
    
    const saveStock = async () => {
        const response = await fetch(`${API_URL}/products/adjust-stock`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                productId: selectedItem.product._id,
                design: selectedItem.inventory.design,
                size: selectedItem.inventory.size,
                adjustment: Number(adjustment),
                note
            })
        })

        if (!response.ok) {
            const error = await response.json();
            console.error(error);
            return;
        }

        closePopup();

        const res = await fetch(`${API_URL}/products`);
        const data = await res.json();
        setProducts(data);

        const res2 = await fetch(`${API_URL}/inventory-logs`);
        const data2 = await res2.json();

        setLogs(data2);
    }


    return(
        <div id="inventory">
            <div>
                <h1>Inventory</h1>
            </div>
            <div className="displayinv">
                {products.map(product => (
                    <div key={product._id}>
                        <h3>{product.name}</h3>

                        <ul>
                            {product.inventory.map((item, index) => (
                                
                                <li key={`${product._id}-${index}`}>
                                    {item.design}
                                    {item.size && <> | {item.size}</>}
                                    {" | $"} 
                                    {item.size ? product.pricing[item.size.toLowerCase()] : product.pricing.base}
                                    {" | Current Stock: "} 
                                    {item.stock}
                                    <button onClick={() => openPopup(product, item)}>Adjust Stock</button>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

                {showPopup && (
                    <div className="overlay">
                    <div className="popupInventory">
                        <h2>Adjust Stock</h2>
                        <p>{selectedItem?.product.name} | {selectedItem?.inventory.design} 
                            {selectedItem?.inventory.size && <>| {selectedItem?.inventory.size}</>}</p>
                        <p>Current Stock: {selectedItem?.inventory.stock}</p>
                        <div className="adjustsection">
                            <p>Adjust: </p>
                            <input
                                className="popupinput"
                                type="number"
                                value={adjustment}
                                onChange={(e) => setAdjustment(e.target.value)}
                            />    
                        </div>
                        <div className="notesection">
                            <p>Note: </p>
                            <input
                                className="popupinput"
                                type="string"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                            />
                        </div>
                        
                        
                        <div className="buttonMenu">
                            <button className="save" onClick={() => saveStock()}>Save</button>
                            <button className="closePopup" onClick={() => closePopup()}>Cancel</button>
                        </div>
                    </div>
                    </div>
                    
                )}

            <div className="inventoryLogs">
                <h2>Inventory Logs</h2>
                <div className="inventoryTable">
                    <div className="inventoryHeader">
                        <div style={{textAlign: "left"}}>Product</div>
                        <div style={{textAlign: "left"}}>Design</div>
                        <div style={{textAlign: "left"}}>Size</div>
                        <div>Update</div>
                        <div>Past</div>
                        <div>Current</div>
                        <div>Date</div>
                        <div>Note</div>
                    </div>
                    <div className="inventoryBody">
                {logs.map(log => (
                    //<div key={log._id} className="inventoryLog">
                    //<th>Log #</th>
                    //td>#{log._id}</td>
                    <div key={log._id}>
                        <div style={{textAlign: "left"}}>{log.productName}</div>
                        <div style={{textAlign: "left"}}>{log.design}</div>
                        <div style={{textAlign: "left"}}>{log?.size && <> {log?.size}</>} </div>
                        <div>{log.change}</div>
                        <div>{log.stockBefore}</div>
                        <div>{log.stockAfter}</div>
                        <div>{new Date(log.createdAt).toLocaleString()}</div>
                        <div>{log.note}</div>
                        <div><button className="deleteButton" onClick={() => deleteOrder(log._id)}>X</button></div>
                    </div>
                    //</div>
                ))}

                    </div>
                </div>
            </div>
        </div>
    );
}

export default InventoryPage;