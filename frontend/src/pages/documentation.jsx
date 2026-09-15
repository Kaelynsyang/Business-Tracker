import '../index.css';
import { useEffect, useState } from "react"

function DocumentationPage() {
    return(
        <div>
            <h1>Documentation</h1>
            <p>
                This website is intended for buisnesses to track their sales and place orders. Examples include 
                farmer market or artists who want to track their orders as they get them. 
                Fine Details: Placing an order will subtract from the inventory and log it. All time stock is 
                tracked by any positive changes to the inventory logs. Deleting the logs will affect the statics
                and can fix unintended changes. For example, to undo all time stock you need to delete the log.
            </p>
        </div>
    )
}

export default DocumentationPage;