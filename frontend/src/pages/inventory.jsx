import "../index.css";
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
        <div>
            <div className="inventory">
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
                    <div className="popup">
                        <h2>Testing</h2>
                        <p>{selectedItem?.product.name} | {selectedItem?.inventory.design} 
                            {selectedItem?.inventory.size && <>| {selectedItem?.inventory.size}</>}</p>
                        <p>Current Stock: <br/> {selectedItem?.inventory.stock}</p>
                        <p>Adjust: </p>
                        <input
                            type="number"
                            value={adjustment}
                            onChange={(e) => setAdjustment(e.target.value)}
                        />
                        <p>Note: </p>
                        <input
                            type="string"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                        />
                        <button onClick={() => saveStock()}>Save</button>
                        <button onClick={() => closePopup()}>X</button>
                    </div>
                )}

            <div className="inventoryLog"></div>
                <h2>Inventory Log</h2>
                {logs.map(log => (
                    <div key={log._id} className="log">
                        <h4>Log #{log._id}</h4>
                        <button onClick={() => deleteOrder(log._id)}>Delete</button>
                        <p>Date: {new Date(log.createdAt).toLocaleString()} | Product: {log.productName} | Design: {log.design} 
                            {log?.size && <> | {log?.size}</>} 
                        </p>
                        <p>Update: {log.change} | Past: {log.stockBefore} | Current: {log.stockAfter}</p>
                        <p>Note: {log.note}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default InventoryPage;