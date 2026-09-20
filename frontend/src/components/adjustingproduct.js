import "../index.css"
import { useState } from "react"

export default function adjustProduct(productName, order, setOrder){
    setOrder([
        ...order, 
        {
            product: productName,
            quantity: 1
        }
    ]);
};
