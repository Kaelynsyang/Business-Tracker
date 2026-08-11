/*
css styling
dashboard
specifics with more buttons and stuff and prices
discounts/deals
i traded lol
cash or card
fandom then design options

*/


import { useEffect, useState } from "react";
import "../index.css";

function SalesPage() {
    const [order, setOrder] = useState([]);
    const [orders, setOrders] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedOption, setSelectedOption] = useState({});
    const [selectedSize, setSelectedSize] = useState([]);
    const [quantity, setQuantity] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState("");
    const [deal, setDeal] = useState("");
    const [products, setProducts] = useState([]);
    const [discount, setDiscount] = useState(0);
    const [event, setEvent] = useState("");
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
    
    useEffect(() => {
    fetch(`${API_URL}/orders`)
        .then(async (res) => {
            const data = await res.json();

            console.log("ORDERS API RESPONSE:", data);

            if (Array.isArray(data)) {
                setOrders(data);
            } else {
                setOrders([]); // fallback prevents crash
            }
        })
        .catch(err => {
            console.error("Fetch failed:", err);
            setOrders([]);
        });
    }, []);
    
    const adjustProduct = (productName) => {
        setSelectedProduct(productName);
    }

    const addToCart = () => {
        const unitPrice = selectedProductData?.pricing?.base ??
                            selectedProductData?.pricing?.[selectedOption?.size] ??
                            0;

        setOrder([
            ...order, 
            {
                product: selectedProduct,
                option: selectedOption,
                quantity: Number(selectedOption.quantity || 1),
                unitPrice,
                lineTotal: unitPrice * Number(selectedOption.quantity || 1)
            }
        ]);
        setSelectedProduct(null);
        setSelectedOption({});
        setQuantity(quantity);
    }

    const checkout = async () => {

    if (order.length === 0) {
        return;
    }
        const response = await fetch(
            `${API_URL}/orders`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    items: order,
                    subtotal,
                    discount,
                    deal,   //here?
                    total,
                    paymentMethod,
                    event
                })
            }
        )

        const savedOrder = await response.json();

        setOrders(prev => [savedOrder, ...prev]);
        setOrder([]);
    }

    const deleteOrder = async (id) => {
        await fetch(
            `${API_URL}/orders/${id}`,
            {
                method: "DELETE"
            });

        setOrders(
            orders.filter(order => order._id !== id)
        );
    };

    useEffect(() => {
        setSelectedOption({});
        setQuantity(1);
    }, [selectedProduct]);

    useEffect(() => {
        fetch(`${API_URL}/products`)
        .then(res => res.json())
        .then(data => setProducts(data));
    }, []);
    
    const productMap = Object.fromEntries(
        products.map(p => [p.name, p])
    );

    const selectedProductData = selectedProduct
        ? products.find(p => p.name === selectedProduct)
        : null;

    const fieldOrder = ["fandom", "size", "design", "quantity"];

    const selectedProductFieldNames = selectedProductData?.fields
        ? Object.keys(selectedProductData.fields).sort((a, b) => {
            const indexA = fieldOrder.indexOf(a);
            const indexB = fieldOrder.indexOf(b);
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
            return a.localeCompare(b);
        })
        : [];

    const subtotal = order.reduce((sum, item) => sum + item.lineTotal, 0);

    const total = Math.max(subtotal - discount, 0);


    return (
    <div>
      <h1>Record Sales</h1>
      <div className="saleUI">
        <div className="addtocart">
            <div className="addtocartbutton">
            {products.map((product) => (
            <button
                key={product._id}
                onClick={() => setSelectedProduct(product.name)}
            >
            {product.name}
            </button>
            ))}
        </div>
    {selectedProduct && (
        <div className="popup">
            <h2>{selectedProduct}</h2>
        
            {selectedProductData?.fields &&
            selectedProductFieldNames.map((fieldName) => {
                const options = selectedProductData.fields[fieldName];
                const normalizedOptions = (Array.isArray(options) ? options : []).map(opt =>
                    typeof opt === "string" || typeof opt === "number"
                        ? { value: opt }
                        : opt
                );

                const visibleOptions = normalizedOptions.filter(option => {
                    if (!option.dependsOn) return true;
                    return Object.entries(option.dependsOn).every(([field, value]) => {
                        return !selectedOption[field] || selectedOption[field] === value;
                    });
                });
                /*
                if (visibleOptions.length === 0) {
                    return (
                        <div key={fieldName}>
                            <h3>{fieldName}</h3>
                            <p>
                                {fieldName === "design"
                                    ? "Select a fandom first to see designs."
                                    : "No available options."}
                            </p>
                        </div>
                    );
                }
                */

                return (
                    <div key={fieldName}>
                        {visibleOptions.length > 0 && (<h3>{fieldName}</h3>)}
                        {visibleOptions.map((option) => {
                            const value = option.value;

                            return (
                                <button
                                    key={value}
                                    onClick={() =>
                                        setSelectedOption({
                                            ...selectedOption,
                                            [fieldName]: value
                                        })
                                    }
                                    className={
                                        selectedOption?.[fieldName] === value
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    {value}
                                </button>
                            );
                        })}
                    </div>
                );
            })}

        <button onClick={addToCart}>
          Add to Cart
        </button>
      </div>
    )}
    </div>
        <div className="cart">
            <ul>
                {order.map((item, index) => (
                    <li key={`${item.product}-${index}`}>
                        {item.product}{" - "}
                        {item.option?.size && `${item.option.size} - `}
                        {item.option?.design && `${item.option.design} - `}
                        x{item.quantity} {" | "}
                        {Object.entries(item.option).map(([key, value]) => (
                            <span key={key}>
                                {key}: {value}{" | "}
                            </span>))}
                        ${item.unitPrice} {" | Total: $"}
                        {item.lineTotal}
                    </li>
                ))}
            </ul>
        <h3>Deals</h3>

        <button
        onClick={() => {setDiscount(0), setDeal("None")}}
        className={deal === "None" ? "selected" : ""}
        >None</button>

        <button
        onClick={() => {setDiscount(5), setDeal("3 for $40 L prints")}}
        className={deal === "3 for $40 L prints" ? "selected" : ""}
        >3 for $40 l prints</button>

        <button
        onClick={() => {setDiscount(5), setDeal("3 for $25 S prints")}}
        className={deal === "3 for $25 S prints" ? "selected" : ""}
        >3 for $25 s prints</button>

        <button
        onClick={() => {setDiscount(1), setDeal("3 for 8 stickers")}}
        className={deal === "3 for 8 stickers" ? "selected" : ""}
        >
        3 stickers for 8</button>

        <button
        onClick={() => {setDiscount(4), setDeal("Gatcha")}}
        className={deal === "Gatcha" ? "selected" : ""}
        >Gatcha</button>

        <button
        onClick={() => {setDiscount(0), setDeal("Gatcha Guarentee")}}
        className={deal === "Gatcha Guarentee" ? "selected" : ""}
        >Gatcha Guarentee</button>

        <button
        onClick={() => {setDiscount(3), setDeal("3 for 15 Sticker Sheet")}}
        className={deal === "3 for 15 Sticker Sheet" ? "selected" : ""}
        >3 for 15 Sticker Sheet</button>

        <button
        onClick={() => {setDiscount(3), setDeal("3 for 15 Heart pins")}}
        className={deal === "3 for 15 Heart pins" ? "selected" : ""}
        >3 for 15 Heart pins</button>

        <button
        onClick={() => {setDiscount(5), setDeal("2 for 75 plushies")}}
        className={deal === "2 for 75 plushies" ? "selected" : ""}
        >2 for 35 plushies</button>

        <h3>Payment Method</h3>

        <button
        onClick={() => setPaymentMethod("Cash")}
        className={paymentMethod === "Cash" ? "selected" : ""}
        >Cash</button>

        <button
        onClick={() => setPaymentMethod("Card")}
        className={paymentMethod === "Card" ? "selected" : ""}
        >Card</button>

        <button
        onClick={() => setPaymentMethod("Zelle")}
        className={paymentMethod === "Zelle" ? "selected" : ""}
        >Zelle</button>


        <h3>Event</h3>
        
        <button
        onClick={() => setEvent("anime night market sep 26")}
        className={event === "anime night market sep 26" ? "selected" : ""}
        >anime night market sep 26</button>
        
        <button
        onClick={() => setEvent("anime night market june 26")}
        className={event === "anime night market june 26" ? "selected" : ""}
        >anime night market june 26</button>
        
        <button
        onClick={() => setEvent("TGEX 26")}
        className={event === "TGEX 26" ? "selected" : ""}
        >TGEX 26</button>


        <h2>Subtotal: ${subtotal}</h2>
        <h3>Complete Order</h3>
        <button onClick={checkout}>Checkout</button>
        </div>
        </div>
        <div className="completedOrders">
            <h2>Completed Orders</h2>
            {orders.map((order) => (
                <div key={order._id} className="order">
                    <h4>Order #{order._id}</h4>
                    <p>Total: ${order.total} | Payment: {order.paymentMethod} | Deal: {order.deal} | Event: {order.event} | Date: {new Date(order.createdAt).toLocaleString()}</p>
                    <ul>
                        {order.items?.map((item, index) => (
                            <li key={`${order._id}-${index}`}>
                            {item.product} | x{item.quantity} |
                            {item.option &&
                                Object.entries(item.option).map(([key, value]) => (
                                    <span key={key}>
                                        {key}: {value}{" "}
                                    </span>
                                    ))}
                                </li>
                            ))}
                    </ul>
                    <button onClick={() => deleteOrder(order._id)}>Delete</button>
                </div>   
            ))}
        </div>
    </div>
  );
}

export default SalesPage;