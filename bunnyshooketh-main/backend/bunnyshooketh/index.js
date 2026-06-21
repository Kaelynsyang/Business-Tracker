const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const ProductModel = require("./models/ProductSchema");
const OrderModel = require("./models/OrderSchema");
const path = require("path");

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => console.error(err));

app.get("/", (req, res) => {
    res.send("API is running");
});

app.get("/products", async (req, res) => {
  const products = await ProductModel.find();
  res.json(products);
});

app.get("/api/sales", async (req, res) => {
  const products = await ProductModel.find();
  res.json(products);
});

app.get('/findall', async (req, res) => {
    try {
        const products = await ProductModel.find();
        res.send(products);
    } catch (err) {
        console.error("Find all failed:", err);
        res.status(500).send("Error fetching data");
    }
});

app.post('/save', async (req, res) => {
    try {
        console.log("Received body:", req.body);

        const newProduct = new ProductModel(req.body);
        const savedProduct = await newProduct.save();

        console.log("Saved:", savedProduct);
        res.send("Data inserted");
    } catch (err) {
        console.error("Save failed:", err);
        res.status(500).send("Error inserting data");
    }
});

app.post('/update', async (req, res) => {
    try {
        const updatedProduct = await ProductModel.findByIdAndUpdate(
            req.body.id,
            { Name: req.body.Name },
            { new: true } // returns the updated document
        );

        if (!updatedProduct) {
            return res.status(404).send("Student not found");
        }

        console.log("Data updated!");
        res.send(updatedProduct);
    } catch (err) {
        console.error("Update failed:", err);
        res.status(500).send("Error updating data");
    }
});

app.post('/delete', async (req, res) => {
    try {
        const deletedProduct = await ProductModel.findByIdAndDelete(req.body.id);
        if (!deletedProduct) {
            return res.status(404).send("Student not found");
        }
        console.log("Data Deleted!");
        res.send(deletedProduct);
    } catch (err) {
        console.error("Delete failed:", err);
        res.status(500).send("Error deleting data");
    }
});


//Orders

app.post("/orders", async (req, res) => {
    try {
        console.log(req.body);

        const newOrder = new OrderModel(req.body);
        const savedOrder = await newOrder.save();

        res.json(savedOrder);
    } catch(err) {
        console.error(err);
        res.status(500).json({
            error: err.message
        });
    }
});


app.get("/orders", async (req, res) => {
    try {
    const orders = await OrderModel.find();

    res.json(orders || []);
    } catch (err) {
    res.status(500).json({
        error: err.message
    });
    }
});

app.delete("/orders/:id", async (req, res) => {
    try {
        await OrderModel.findByIdAndDelete(
            req.params.id
        );

        res.sendStatus(200);
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
})

//Products

app.get("/seed-products", async (req, res) => {
    await ProductModel.findOneAndUpdate(
        {name: "Stickers"}, {
        $set: {fields: {
            fandom: ["Blue Lock", "Bunny", "Chiiawaka", "Delatrune", "Genshin Impact", "LADS", "Limbus Company", "Miffy", "Nezha", "Overwatch", "TBHX", "Twisted Wonderland", "Valorant", "Vocaloid"],
            design: ["Dog", "Cat"],
            quantity: [1, 2, 3, 4, 5]
        },
        pricing: {
            "base": 3
        }}},
    {upsert: true}
    );

    await ProductModel.findOneAndUpdate({
        name: "Prints"},{
        $set: {fields: {
            fandom: ["Blue Lock", "Bunny", "Chiiawaka", "Delatrune", "Genshin Impact", "LADS", "Limbus Company", "Miffy", "Nezha", "Overwatch", "TBHX", "Twisted Wonderland", "Valorant", "Vocaloid"],
            size: ["small", "large"],
            design: ["aaa", "bbb"],
            quantity: [1, 2, 3, 4, 5]
        },
        pricing: {
            "small": 10,
            "large": 15
        }}},
    {upsert: true}
    );

    await ProductModel.findOneAndUpdate({
        name: "Keychains"},{
        $set: {fields: {
            fandom: ["Blue Lock", "Bunny", "Chiiawaka", "Delatrune", "Genshin Impact", "LADS", "Limbus Company", "Miffy", "Nezha", "Overwatch", "TBHX", "Twisted Wonderland", "Valorant", "Vocaloid"],
            design: ["asdf", "hdfghg"],
            quantity: [1, 2, 3, 4, 5]
        },
        pricing: {
            "base": 12
        }}},
    {upsert: true}
    );
    
    await ProductModel.findOneAndUpdate({
        name: "Sticker Sheet"},{
        $set: {fields: {
            fandom: ["Blue Lock", "Bunny", "Chiiawaka", "Delatrune", "Genshin Impact", "LADS", "Limbus Company", "Miffy", "Nezha", "Overwatch", "TBHX", "Twisted Wonderland", "Valorant", "Vocaloid"],
            design: ["asdf", "hdfghg"],
            quantity: [1, 2, 3, 4, 5]
        },
        pricing: {
            "base": 6
        }}},
    {upsert: true}
    );
    
    await ProductModel.findOneAndUpdate({
        name: "Heart Pins"},{
        $set: {fields: {
            fandom: ["Blue Lock", "Bunny", "Chiiawaka", "Delatrune", "Genshin Impact", "LADS", "Limbus Company", "Miffy", "Nezha", "Overwatch", "TBHX", "Twisted Wonderland", "Valorant", "Vocaloid"],
            design: ["asdf", "hdfghg"],
            quantity: [1, 2, 3, 4, 5]
        },
        pricing: {
            "base": 6
        }}},
    {upsert: true}
    );
    
    await ProductModel.findOneAndUpdate({
        name: "Foil Pins"},{
        $set: {fields: {
            fandom: ["Blue Lock", "Bunny", "Chiiawaka", "Delatrune", "Genshin Impact", "LADS", "Limbus Company", "Miffy", "Nezha", "Overwatch", "TBHX", "Twisted Wonderland", "Valorant", "Vocaloid"],
            design: ["asdf", "hdfghg"],
            quantity: [1, 2, 3, 4, 5]
        },
        pricing: {
            "base": 8
        }}},
    {upsert: true}
    );
    
    await ProductModel.findOneAndUpdate({
        name: "Standees"},{
        $set: {fields: {
            fandom: ["Blue Lock", "Bunny", "Chiiawaka", "Delatrune", "Genshin Impact", "LADS", "Limbus Company", "Miffy", "Nezha", "Overwatch", "TBHX", "Twisted Wonderland", "Valorant", "Vocaloid"],
            design: ["asdf", "hdfghg"],
            quantity: [1, 2, 3, 4, 5]
        },
        pricing: {
            "base": 15
        }}},
    {upsert: true}
    );
    
    await ProductModel.findOneAndUpdate({
        name: "Folding Screen"},{
        $set: {fields: {
            fandom: ["Blue Lock", "Bunny", "Chiiawaka", "Delatrune", "Genshin Impact", "LADS", "Limbus Company", "Miffy", "Nezha", "Overwatch", "TBHX", "Twisted Wonderland", "Valorant", "Vocaloid"],
            design: ["asdf", "hdfghg"],
            quantity: [1, 2, 3, 4, 5]
        },
        pricing: {
            "base": 40
        }}},
    {upsert: true}
    );

    res.send("Seeded");
});


//export to sheets

app.get("/export-orders", async (req, res) => {
    const orders = await OrderModel.find();

    let csv =
        "Date,Product,Quantity,Payment Method,Deal,Subtotal,Total\n";

    orders.forEach(order => {
        order.items.forEach(item => {
            csv +=
                `${order.createdAt},` +
                `${item.product},` +
                `${item.quantity},` +
                `${order.paymentMethod || ""},` +
                `${order.deal || ""},` +
                `${order.subtotal || 0},` +
                `${order.total || 0}\n`;
        });
    });

    res.header("Content-Type", "text/csv");
    res.attachment("orders.csv");
    res.send(csv);
});


//ALWAYS LAST
