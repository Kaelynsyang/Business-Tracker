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
            fandom: ["Bunny", "Delatrune", "Genshin Impact", "Limbus Company", "Nezha", "Twisted Wonderland", "Valorant", "Vocaloid"],
            design: ["dunce faust", "winrate", "wordle", "kaito grape", "Zoey", "rumi", "medicine don", "shinobu", "Xiao lantern", "flins", "white rabbit", "Xavier wedding", "purple bunny", "green bunny", "mystery"],
            quantity: [1, 2, 3, 4, 5, 6]
        },
        pricing: {
            "base": 3
        }}},
    {upsert: true}
    );

    await ProductModel.findOneAndUpdate({
        name: "Prints"},{
        $set: {fields: {
            fandom: ["Genshin Impact", "Limbus Company", "Nezha", "Overwatch", "Flowers bloom", "Vocaloid"],
            size: ["small", "large"],
            design: ["Wuyang", "anran", "kris night", "kris light", "flowers comic", "king Xavier", "teto", "nezha", "flins", "Colmbina", "canto ego ryoshu", "canto honglu", "canto yisang", "silver knight", "Deuce star", "sliver rabbit", "idia", "riddle lantern", "faust gallery", "rodya gallery", "honglu gallery"],
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
            fandom: ["Blue Lock", "Bunny", "Genshin Impact", "Limbus Company", "TBHX", "Twisted Wonderland", "Valorant", "Vocaloid"],
            design: ["sage", "omen", "viper", "fade", "neon", "reyna", "cypher", "gecko", "jett", "faust", "yisang", "Don Quixote", "Honglu", "Heathcliff", "Ishmael", "Sinclair", "Ryoshu", "Meursault", "Gregor", "Rodya", "Outis", "Dante", "Bari", "Canto Ego Don", "Canto Ego Honglu", "MangerDon", "Riddle", "Malleus", "Azul", "Leona", "Vil", "Kalim", "Idia", "X", "Nice", "LingLin", "Ghostblade", "Queen", "Loli", "THAT DOG I HATE", "Lucky Cyan", "Dragon boy", "Esoul", "Little Johnny", "Enjin", "Zanka", "Amo", "Tamsy", "Rudo", "Riyo", "Shinobu", "Bari", "Canto Ego Don", "Canto Ego Honglu", "MangerDon", "Strawberry cake", "melon soda", "Nagi", "rin", "reo", "Isagi", "Miku cinnamon roll", "Flower cake", "Kaito", "Rin", "Len", "Miku", "Meiko", "full cherry", "full og"],
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
            fandom: ["Chiiawaka", "Miffy"],
            design: ["CW Food", "CW Emotions", "CW Study", "MY Bake", "MY matcha", "MY fruit", "MU Songs"],
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
            fandom: ["LADS"],
            design: ["Xavier", "stylus", "Zayne", "Rafael", "Caleb"],
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
            fandom: ["Delatrune"],
            design: ["Kris", "Susie", "Ralsei"],
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
            fandom: ["Limbus Company"],
            design: ["big 3 don"],
            quantity: [1, 2, 3, 4, 5]
        },
        pricing: {
            "base": 15
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
