import '../index.css';
import { useEffect, useState } from "react"

function DocumentationPage() {
    return(
        <div>
            <h1>Documentation</h1>
            <p>
                Placing an order will subtract from the inventory and log it. All time stock is 
                tracked by any positive changes to the inventory logs.
            </p>
        </div>
    )
}

export default DocumentationPage;