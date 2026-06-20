/*
css styling
dashboard
specifics with more buttons and stuff and prices
discounts/deals
i traded lol
cash or card
fandom
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

    /*
    const products = {
        Stickers: {
            fields:{
                size: ["2x3", "3x3"],
                design: ["a", "b", "c", "d"]
            }},
        Keychains: {
            fields:{
                size: ["2x3", "3x3"],
                design: ["cat", "dog", "pig", "frog"]
            }},
        Prints: {
            fields:{
                size: ["Small", "Medium", "Large"],
                design: ["1", "2", "3", "4"]}},
        Buttons: {
            fields:
            {
                size: ["Small", "Medium", "Large"],
                design: ["asd", "adfs", "hgfgd", "adsfb"]}
        }

};
*/
    
    useEffect(() => {
        fetch(`${API_URL}/orders`)
        .then(res => res.json())
        .then(data => setOrders(data));
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
                    total,
                    paymentMethod,
                    discount
                })
            }
        )

        const savedOrder = await response.json();

        setOrders([savedOrder, ...orders]);
        setOrder([]);
    }

    const deleteOrder = async (id) => {
        await fetch(
            `${API_URL}/orders${id}`,
            {
                method: "DELETE"
            });

        setOrders(
            orders.filter(order => order._id !== id)
        );
    };

    useEffect(() => {
        fetch(`${API_URL}/products`)
        .then(res => res.json())
        .then(data => setProducts(data));
    }, []);
    
    const productMap = Object.fromEntries(
        products.map(p => [p.name, p])
    );

    const selectedProductData = products.find(
        p => p.name === selectedProduct
    );

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
    
    {selectedProductData?.fields && Object.entries(selectedProductData.fields)
    .filter(([_, options]) => options && options.length > 0)
    .map(([fieldName, options]) => (
    <div key={fieldName}>
      <h3>{fieldName}</h3>

      {options.map((option) => (
        <button
          key={option}
          onClick={() =>
            setSelectedOption({
              ...selectedOption,
              [fieldName]: option
            })
          }
          className={
            selectedOption?.[fieldName] === option
              ? "selected"
              : ""
          }
        >
          {option}
        </button>
      ))}
    </div>
  )
)}

    <button onClick={addToCart}>
      Add to Cart
    </button>
    </div>
    )}
        </div>
        <div className="cart">
            <ul>
                {order.map((item, index) => (
                    <li key={`${item.product}-${item.size}-${item.design}-${index}`}>
                        {item.product}{" - "}
                        {item.size && `${item.size} - `}
                        {item.design && `${item.design} - `}
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
        onClick={() => {setDiscount(5), setDeal("3 for $40 l prints")}}
        className={deal === "3 for $40 l prints" ? "selected" : ""}
        >3 for $40 l prints</button>

        <button
        onClick={() => {setDiscount(5), setDeal("3 for $25 s prints")}}
        className={deal === "3 for $30" ? "selected" : ""}
        >3 for $30 s prints</button>

        <button
        onClick={() => {setDiscount(1), setDeal("3 for 8 stickers")}}
        className={deal === "3 stickers for 8" ? "selected" : ""}
        >
        3 stickers for 8</button>

        <button
        onClick={() => {setDiscount(4), setDeal("Gatcha")}}
        className={deal === "Gatcha" ? "selected" : ""}
        >Gatcha</button>

        <button
        onClick={() => {setDiscount(3), setDeal("3 for 15 Sticker Sheet")}}
        className={deal === "Sticker Sheet" ? "selected" : ""}
        >Sticker Sheet</button>

        <button
        onClick={() => {setDiscount(3), setDeal("3 for 15 Heart pins")}}
        className={deal === "3 for 15 Heart pins" ? "selected" : ""}
        >3 for 15 Heart pins</button>

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
                    <p>Total: ${order.total} | Payment: {order.paymentMethod} | Deal: {order.deal} | Date: {new Date(order.createdAt).toLocaleString()}</p>
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