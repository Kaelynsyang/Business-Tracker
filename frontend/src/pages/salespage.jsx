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
import "../styles/orders.css";

function SalesPage() {
    const [order, setOrder] = useState([]);
    const [orders, setOrders] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedOptions, setSelectedOptions] = useState({});
    const [selectedSize, setSelectedSize] = useState([]);
    const [quantity, setQuantity] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState("");
    const [selectedDeals, setSelectedDeals] = useState([]);
    const [products, setProducts] = useState([]);
    const [event, setEvent] = useState("");
    const [showPopup, setShowPopup] = useState(false);
    const [orderPopup, setOrderPopup] = useState(null);
    const [dealInput, setDealInput] = useState("");
    const [dateTime, setDateTime] = useState("");

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

    const deals = [
        {   name: "None",
            discount: 0 }, 
        { 
            name: "2 for $22 keychains",
            discount: 4 }, 
        { 
            name: "3 for $40 l prints",
            discount: 5 }, 
        { 
            name: "3 for $25 s prints",
            discount: 5 }, 
        { 
            name: "3 stickers for 8",
            discount: 1 }, 
        { 
            name: "Gacha",
            discount: 5 }, 
        { 
            name: "Gacha Guarentee",
            discount: 0 }, 
        { 
            name: "3 for $15 Sticker Sheet",
            discount: 3 }, 
        { 
            name: "3 for $15 Heart pins",
            discount: 3 }, 
        { 
            name: "3 for $20 Foil pins",
            discount: 4 }, 
        { 
            name: "2 for $75 plushies",
            discount: 5 },
        { 
            name: "2 for $20 keychains",
            discount: 6 }, 
        { 
            name: "1 for $12 keychains",
            discount: 1 },
        { 
            name: "5 for $55 keychains",
            discount: 10 }
    ]

    const events = [
        "TGEX 26",
        "AIOC 26",
        "ASD 26",
        "ANM SEP 26", 
        "ANM JUN 26"
    ]
    
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

    const toggleDeal = (deal) => {
        setSelectedDeals((currentDeals) => {
            const selected = currentDeals.some(
                (selectedDeal) => selectedDeal.name === deal.name
            )

            if (selected) {
                return currentDeals.filter(
                    (selectedDeal) => selectedDeal.name !== deal.name
                )
            }

            if (deal.name === "None") {
                return [deal];
            }

            const withoutNone = currentDeals.filter(
                (selectedDeal) => selectedDeal.name !== "None"
            );

            return [...withoutNone, deal ]
        });
    };

    const toggleOption = (fieldName, option) => {
        setSelectedOptions((currentOptions) => {
            const value = option.value;

            if (fieldName === "fandom") {
                return {
                    ...currentOptions, fandom: currentOptions.fandom === value ? undefined : value
                }
            }
        
            const currentValues = currentOptions[fieldName] || [];
            const selected = currentValues.includes(value);
        
            return {
                ...currentOptions, [fieldName]: selected 
                ? currentValues.filter((item) !== value)
                : [...currentValues, value]
            }
        })
    };

    const addToCart = () => {
        const unitPrice = selectedProductData?.pricing?.base ??
                            selectedProductData?.pricing?.[selectedOptions?.size] ??
                            0;
        console.log("selected Options", selectedOptions);

        const designs = selectedOptions.design || [];
        const quantity = Number(selectedOptions.quantity || 1);

        const newOrderItems = designs.map((design) => ({
                product: selectedProduct,
                option: {
                    fandom: selectedOptions.fandom,
                    design: design,
                    ...(selectedOptions.size ? { size: selectedOptions.size } : {})
                },
                quantity,
                unitPrice,
                lineTotal: unitPrice * quantity
            }))

        setOrder((currentOrder) => [
            ...currentOrder,
            ...newOrderItems 
        ]);
        setSelectedProduct(null);
        setSelectedOptions([]);
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
                    //discount,
                    deals: selectedDeals,   //here?
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
        setSelectedOptions([]);
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
    const totalDiscount = selectedDeals.reduce((total, deal) => total + deal.discount, 0)
    const total = Math.max(subtotal - totalDiscount, 0);

    //Handle adjusting orders and dropdowns
    const updateField = (fieldName, newValue) => {
        if (fieldName === 'paymentMethod') setPaymentMethod(newValue);
        if (fieldName === 'event') setEvent(newValue);
        if (fieldName === 'date') setDateTime(newValue);
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        updateField(name, value);
    }
    
    const handleDealChange = (e) => {
        const value = e.target.value;
        setDealInput(value);
        const deal = deals.find((deal) => deal.name === value);
        if (deal) {
            toggleDeal(deal);
            setDealInput("");
        }
    }

    const openPopupOrder = (order) => {
        setShowPopup(true);
        setOrderPopup(order);
    }

    const closePopupOrder = () => {
        setShowPopup(false);
        setPaymentMethod("");
        setSelectedDeals([]);
        setDealInput("");
        setEvent("");
    }

    const handleSave = async (id) => {
        try {
            const response = await fetch(`${API_URL}/orders/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    paymentMethod,
                    deals: selectedDeals,
                    event,
                    createdAt: dateTime
                })
            })

            const updatedOrder = await response.json();

            setOrders((currentOrders) => 
                currentOrders.map((order) => order._id === updatedOrder._id ? updatedOrder : order));

            closePopupOrder();
        } catch(error) {
            console.error("Failed to save data: ", error);
        }
    }

    return (
    <div id="orders">
      <h1>Record Sales</h1>
      <div className="saleUI">
        <div className="selectionitem">
            <div className="selectionitembuttons">
            {products.map((product) => (
            <button
                key={product._id}
                className={selectedProduct === product.name ? "selected" : ""}
                onClick={() => setSelectedProduct(product.name)}
            >
            {product.name}
            </button>
            ))}
        </div>
    {selectedProduct && (
        <div className="orderpopup">
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
                        return !selectedOptions[field] || selectedOptions[field] === value;
                    });
                });

                return (
                    <div className="popupSection" key={fieldName}>
                        {visibleOptions.length > 0 && (<h3>{fieldName}</h3>)}
                        {visibleOptions.map((option) => {
                            const value = option.value;

                            return (
                                <button
                                    key={value}
                                    onClick={() => toggleOption(fieldName, option)}
                                    className={fieldName === "fandom" ? selectedOptions.fandom === option.value
                                        ? "selected" : ""
                                        : selectedOptions[fieldName]?.includes(option.value) ? "selected" : ""
                                    }>
                                    {option.value}
                                </button>
                            );
                        })}
                    </div>
                );
            })}
        <div className="checkout">
            <button onClick={addToCart}>Add to Cart</button>
        </div>
      </div>
    )}
    </div>
        <div className="cart">
            <h2>Cart</h2>
            <div className="cartitems">
                <h3>Total Items</h3>
                <ul>
                    {order.map((item, index) => (
                        <li key={`${item.product}-${index}`}>
                            {item.product}{" - "}
                            {item.option?.size && `${item.option.size} - `}
                            {item.option?.design && `${item.option.design} - `}
                            x{item.quantity} {" | "}
                            {"Fandom"}: {item.option?.fandom} {" | "}
                            ${item.unitPrice} {" | Total: $"}
                            {item.lineTotal}
                        </li>
                    ))}
                </ul>
            </div>
        <div className="cartitems">
            <h3>Deals</h3>
            <div className="cartbuttons">
                {deals.map((deal) => (
                    <button key={deal.name} onClick={() => toggleDeal(deal)} 
                    className={selectedDeals.some((selectedDeal) => selectedDeal.name === deal.name) ? "selected" : ""}>
                        {deal.name}</button>
                ))}
            </div>
        </div>

        <div className="cartitems">
            <h3>Event</h3>

            <div className="cartbuttons">
                {events.map((eventMap) => (
                    <button key={eventMap} onClick={() => setEvent(eventMap)} 
                    className={eventMap === event ? "selected" : ""}>
                        {eventMap}</button>
                ))}
            </div>
        </div>
        
        <div className="cartitems">
<h3>Payment Method</h3>

        <div className="cartbuttons payment">
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
            </div>
        </div>
        
        
        <div className="cartitems">
            <h3>Summary</h3>
                <ul>
                    {order.map((item, index) => (
                        <li key={`${item.product}-${index}`}>
                            {item.product}{" - "}
                            {item.option?.size && `${item.option.size} - `}
                            {item.option?.design && `${item.option.design} - `}
                            x{item.quantity} {" | "}
                            {"Fandom"}: {item.option?.fandom} {" | "}
                            ${item.unitPrice} {" | Total: $"}
                            {item.lineTotal}
                        </li>
                    ))}
                    <p>Payment: {paymentMethod} | Deal: {selectedDeals?.map(deal => deal.name).join(", ")} | Event: {event}</p>

                </ul>                    

            
            <h3>Subtotal: ${subtotal}</h3>
            <h3 style={{color: "#858585"}}>Discount: ${totalDiscount}</h3>
            <h2>Total: ${total}</h2>
        </div>

        <div className="checkout">
            <button onClick={checkout}>Checkout</button>
        </div>
        </div>
        </div>

        <div className="orderlogs">

        <div className="ordersearchbar">
            <h2>Search</h2>
        </div>

        <div className="completedOrders">
            <h2>Completed Orders</h2>
            {orders.map((order) => (
                <div key={order._id} className="order">
                    <div className="orderheader">
                        <button className="editorder" onClick={() => openPopupOrder(order)}>Edit</button>
                        <button className="deleteorderbutton" onClick={() => deleteOrder(order._id)}>Delete</button>
                        <h3>Order #{order._id} | Event: {order.event}</h3>
                    </div>
                    <p className="orderdate">{new Date(order.createdAt).toLocaleString()}</p>
                    <div className="orderbody">
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

                        <div className="receiptfooter">
                            <p>Deal(s): {order.deals?.map(deal => deal.name).join(", ")} <br /> 
                                Payment: {order.paymentMethod} <br /> 
                                Subtotal: {order.subtotal} 
                            </p>
                            <h3>Total: ${order.total}</h3>
                        </div>  
                    </div>
                    
                </div>   
            ))}
        </div>
        </div>

        {showPopup && (
            <div className="overlay">
            <div className="adjustmentMenu">
            <form>
                <h2>Adjust Order</h2>
                <p>Order ID: #{orderPopup._id}</p>

                <label htmlFor="paymentInput">Payment: </label>
                <input type="text" id="paymentInput" name="paymentMethod" list="paymentMethod-options" value={paymentMethod}
                onChange={handleChange} placeholder={orderPopup.paymentMethod}/>
                <datalist id="paymentMethod-options">
                    <option value="Cash" />
                    <option value="Card" />
                    <option value="Zelle" />
                </datalist>

                <label htmlFor="dealsInput"> <br/> Deal(s): </label>
                <input type="text" id="dealsInput" name="selectedDeals" list="selectedDeals-options" value={dealInput}
                 onChange={handleDealChange} placeholder={orderPopup.deals?.map(deal => deal.name).join(", ")}/>
                <datalist id="selectedDeals-options">
                    {deals.map(deal => (
                        <option key={deal.name} value={deal.name}/>
                    ))}
                </datalist>
                <div>
                {selectedDeals.map((deal) => (
                    <span key={deal.name}>
                        {deal.name}
                            <button type="button" onClick={() => toggleDeal(deal)}>x</button>
                    </span>
                ))}
                </div>

                <label htmlFor="eventInput"> <br/> Event: </label>
                <input type="text" id="eventInput" name="event" list="event-options" value={event}
                 onChange={handleChange} placeholder={orderPopup.event}/>
                <datalist id="event-options">
                    {events.map(event => (
                        <option key={event} value={event}/>
                    ))}
                </datalist>
                    
                <label htmlFor="dateInput"> <br/> Date and Time: </label>
                <input type="datetime-local" id="dateInput" name="date" list="date-options" value={dateTime}
                 onChange={handleChange}/>
            </form>
                <p>Date: {new Date(orderPopup.createdAt).toLocaleString()}</p>
        
                <div className="buttonMenu">
                    <button className="save" onClick={() => handleSave(orderPopup._id)}>Save</button>
                    <button className="closePopup" onClick={() => closePopupOrder()}>Cancel</button>
                </div>
            </div>
            </div>
        )}
        
    </div>
  );
}

export default SalesPage;