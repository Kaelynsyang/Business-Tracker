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
    await ProductModel.deleteMany({});
    await ProductModel.findOneAndUpdate(
        {name: "Stickers"}, {
        $set: {fields: {
            fandom: [
                { value: "Bunny"},
                { value: "Demon Slayer"},
                { value: "Genshin Impact"},
                { value: "LADS"},
                { value: "Limbus Company"},
                { value: "Kpop DH"},
                { value: "Nezha"},
                { value: "Vocaloid"}],
            design: [
                { value: "purple bunny", dependsOn: { fandom: "Bunny"}},
                { value: "green bunny", dependsOn: { fandom: "Bunny"}},
                { value: "white rabbit", dependsOn: { fandom: "Bunny"}},
                { value: "shinobu", dependsOn: { fandom: "Demon Slayer"}},
                { value: "Xiao lantern", dependsOn: { fandom: "Genshin Impact"}},
                { value: "flins", dependsOn: { fandom: "Genshin Impact"}},
                { value: "Xavier wedding", dependsOn: { fandom: "LADS"}},
                { value: "dunce faust", dependsOn: { fandom: "Limbus Company"}},
                { value: "winrate", dependsOn: { fandom: "Limbus Company"}},
                { value: "wordle", dependsOn: { fandom: "Limbus Company"}},
                { value: "medicine don", dependsOn: { fandom: "Limbus Company"}},
                { value: "rumi", dependsOn: { fandom: "Kpop DH"}},
                { value: "Mira", dependsOn: { fandom: "Kpop DH"}},
                { value: "Zoey", dependsOn: { fandom: "Kpop DH"}},
                { value: "mystery", dependsOn: { fandom: "Kpop DH"}},
                { value: "nezha", dependsOn: { fandom: "Nezha"}},
                { value: "kaito grape", dependsOn: { fandom: "Vocaloid"}}],
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
            fandom: [
                { value: "Deltarune"},
                { value: "Flowers bloom"},
                { value: "Genshin Impact"},
                { value: "LADS"},
                { value: "Limbus Company"},
                { value: "Nezha"},
                { value: "Overwatch"},
                { value: "Twisted Wonderland"},
                { value: "Vocaloid"}
            ],
            size: ["small", "large"],
            design: [
                { value: "kris night", dependsOn: { fandom: "Deltarune"}},
                { value: "kris light", dependsOn: { fandom: "Deltarune"}},
                { value: "flowers comic", dependsOn: { fandom: "Flowers bloom"}},
                { value: "Colmbina", dependsOn: { fandom: "Genshin Impact"}},
                { value: "flins", dependsOn: { fandom: "Genshin Impact"}},
                { value: "king Xavier", dependsOn: { fandom: "LADS"}},
                { value: "canto ego ryoshu", dependsOn: { fandom: "Limbus Company"}},
                { value: "canto honglu", dependsOn: { fandom: "Limbus Company"}},
                { value: "canto yisang", dependsOn: { fandom: "Limbus Company"}},
                { value: "faust gallery", dependsOn: { fandom: "Limbus Company"}},
                { value: "rodya gallery", dependsOn: { fandom: "Limbus Company"}},
                { value: "honglu gallery", dependsOn: { fandom: "Limbus Company"}},
                { value: "nezha", dependsOn: { fandom: "Nezha"}},
                { value: "Wuyang", dependsOn: { fandom: "Overwatch"}},
                { value: "anran", dependsOn: { fandom: "Overwatch"}},
                { value: "riddle lantern", dependsOn: { fandom: "Twisted Wonderland"}},
                { value: "Deuce star", dependsOn: { fandom: "Twisted Wonderland"}},
                { value: "silver knight", dependsOn: { fandom: "Twisted Wonderland"}},
                { value: "silver rabbit", dependsOn: { fandom: "Twisted Wonderland"}},
                { value: "idia", dependsOn: { fandom: "Twisted Wonderland"}},
                { value: "teto", dependsOn: { fandom: "Vocaloid"}}],
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
            fandom: [
                { value: "Blue Lock"},
                { value: "Bunny"},
                { value: "Demon Slayer"},
                { value: "Flowers bloom"},
                { value: "Gachiakuta"},
                { value: "Limbus Company"},
                { value: "TBHX"},
                { value: "Twisted Wonderland"},
                { value: "Valorant"},
                { value: "Vocaloid"}
            ],
            design: [
                { value: "rin", dependsOn: { fandom: "Blue Lock"}},
                { value: "reo", dependsOn: { fandom: "Blue Lock"}},
                { value: "nagi", dependsOn: { fandom: "Blue Lock"}},
                { value: "Isagi", dependsOn: { fandom: "Blue Lock"}},
                { value: "Strawberry cake", dependsOn: { fandom: "Bunny"}},
                { value: "melon soda", dependsOn: { fandom: "Bunny"}},
                { value: "Shinobu", dependsOn: { fandom: "Demon Slayer"}},
                { value: "flower cake", dependsOn: { fandom: "Flowers bloom"}},
                { value: "Enjin", dependsOn: { fandom: "Gachiakuta"}},
                { value: "Zanka", dependsOn: { fandom: "Gachiakuta"}},
                { value: "Amo", dependsOn: { fandom: "Gachiakuta"}},
                { value: "Tamsy", dependsOn: { fandom: "Gachiakuta"}},
                { value: "Rudo", dependsOn: { fandom: "Gachiakuta"}},
                { value: "Riyo", dependsOn: { fandom: "Gachiakuta"}},
                { value: "faust", dependsOn: { fandom: "Limbus Company"}},
                { value: "yisang", dependsOn: { fandom: "Limbus Company"}},
                { value: "Don Quixote", dependsOn: { fandom: "Limbus Company"}},
                { value: "Honglu", dependsOn: { fandom: "Limbus Company"}},
                { value: "Heathcliff", dependsOn: { fandom: "Limbus Company"}},
                { value: "Ishmael", dependsOn: { fandom: "Limbus Company"}},
                { value: "Sinclair", dependsOn: { fandom: "Limbus Company"}},
                { value: "Ryoshu", dependsOn: { fandom: "Limbus Company"}},
                { value: "Meursault", dependsOn: { fandom: "Limbus Company"}},
                { value: "Gregor", dependsOn: { fandom: "Limbus Company"}},
                { value: "Rodya", dependsOn: { fandom: "Limbus Company"}},
                { value: "Outis", dependsOn: { fandom: "Limbus Company"}},
                { value: "Dante", dependsOn: { fandom: "Limbus Company"}},
                { value: "Bari", dependsOn: { fandom: "Limbus Company"}},
                { value: "Canto Ego Don", dependsOn: { fandom: "Limbus Company"}},
                { value: "Canto Ego Honglu", dependsOn: { fandom: "Limbus Company"}},
                { value: "MangerDon", dependsOn: { fandom: "Limbus Company"}},
                { value: "X", dependsOn: { fandom: "TBHX"}},
                { value: "Nice", dependsOn: { fandom: "TBHX"}},
                { value: "LingLin", dependsOn: { fandom: "TBHX"}},
                { value: "Ghostblade", dependsOn: { fandom: "TBHX"}},
                { value: "Queen", dependsOn: { fandom: "TBHX"}},
                { value: "Loli", dependsOn: { fandom: "TBHX"}},
                { value: "THAT DOG I HATE", dependsOn: { fandom: "TBHX"}},
                { value: "Lucky Cyan", dependsOn: { fandom: "TBHX"}},
                { value: "Dragon boy", dependsOn: { fandom: "TBHX"}},
                { value: "Little Johnny", dependsOn: { fandom: "TBHX"}},
                { value: "Riddle", dependsOn: { fandom: "Twisted Wonderland"}},
                { value: "Malleus", dependsOn: { fandom: "Twisted Wonderland"}},
                { value: "Azul", dependsOn: { fandom: "Twisted Wonderland"}},
                { value: "Leona", dependsOn: { fandom: "Twisted Wonderland"}},
                { value: "Vil", dependsOn: { fandom: "Twisted Wonderland"}},
                { value: "Kalim", dependsOn: { fandom: "Twisted Wonderland"}},
                { value: "Idia", dependsOn: { fandom: "Twisted Wonderland"}},
                { value: "jett", dependsOn: { fandom: "Valorant"}},
                { value: "gecko", dependsOn: { fandom: "Valorant"}},
                { value: "cypher", dependsOn: { fandom: "Valorant"}},
                { value: "reyna", dependsOn: { fandom: "Valorant"}},
                { value: "fade", dependsOn: { fandom: "Valorant"}},
                { value: "viper", dependsOn: { fandom: "Valorant"}},
                { value: "omen", dependsOn: { fandom: "Valorant"}},
                { value: "sage", dependsOn: { fandom: "Valorant"}},
                { value: "Kaito", dependsOn: { fandom: "Vocaloid"}},
                { value: "Rin", dependsOn: { fandom: "Vocaloid"}},
                { value: "Len", dependsOn: { fandom: "Vocaloid"}},
                { value: "Miku", dependsOn: { fandom: "Vocaloid"}},
                { value: "Miku cinnamon roll", dependsOn: { fandom: "Vocaloid"}},
                { value: "full cherry", dependsOn: { fandom: "Vocaloid"}},
                { value: "full og", dependsOn: { fandom: "Vocaloid"}}],
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
            fandom: [
                { value: "Chiiawaka" },
                { value: "Miffy"}],
            design: [
                { value: "CW Food", dependsOn: { fandom: "Chiiawaka"}},
                { value: "CW Emotions", dependsOn: { fandom: "Chiiawaka"}},
                { value: "CW Study", dependsOn: { fandom: "Chiiawaka"}},
                { value: "MY Bake", dependsOn: { fandom: "Miffy"}},
                { value: "MY matcha", dependsOn: { fandom: "Miffy"}},
                { value: "MY fruit", dependsOn: { fandom: "Miffy"}},
                { value: "MU Songs", dependsOn: { fandom: "Miffy"}},
            ],
            quantity: [1, 2, 3, 4, 5]
        },
        pricing: {
            "base": 6
        }}},
    {upsert: true}
    );
    
    await ProductModel.findOneAndUpdate({
        name: "Heart Pins"},{
        $set: {
            fields: {
            fandom: [
                { value: "LADS"}],
            design: [
                { value: "Xavier", dependsOn: { fandom: "LADS"}},
                { value: "stylus", dependsOn: { fandom: "LADS"}},
                { value: "Zayne", dependsOn: { fandom: "LADS"}},
                { value: "Rafael", dependsOn: { fandom: "LADS"}},
                { value: "Caleb", dependsOn: { fandom: "LADS"}}],
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
            fandom: [
                {value: "Deltarune"}
            ],
            design: [
                { value: "Kris", dependsOn: { fandom: "Deltarune"}},
                { value: "Susie", dependsOn: { fandom: "Deltarune"}},
                { value: "Ralsei", dependsOn: { fandom: "Deltarune"}},],
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
            fandom: [
                { value: "Limbus Company"}
                ],
            design: [
                {value: "big 3 don", dependsOn: { fandom: "Limbus Company"}}
            ],
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
