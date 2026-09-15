const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const ProductModel = require("./models/ProductSchema");
const OrderModel = require("./models/OrderSchema");
const InventoryLog = require("./models/InventoryLogSchema");
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

app.patch("/products/adjust-stock", async (req, res) => {
    try {
        const { productId, design, size, adjustment, note } = req.body;
        const product = await ProductModel.findById(productId);

        if(!product) {
            return res.status(404).json({ message: "Product not found"});
        }

        const inventoryItem = product.inventory.find(item => 
            item.design === design &&
            (item.size || null) === (size || null)
        );
        
        if (!inventoryItem){
            return res.status(404).json({ message: "Inventory item not found" });
        }

        const stockBefore = inventoryItem.stock;

        inventoryItem.stock += adjustment;

        const stockAfter = inventoryItem.stock;

        await product.save();

        await InventoryLog.create({
            productId: product._id,
            productName: product.name,
            design: inventoryItem.design,
            size: inventoryItem.size,
            change: adjustment,
            stockBefore,
            stockAfter,
            note
        })

        res.json(product);
    } catch (err) {
        res.status(500).json({message: err.message})
    }
})

function getTopEntry(countsObj) {
    let firstKey = null;
    let secondKey = null;
    let thirdKey = null;
    let first = 0;
    let second = 0;
    let third = 0;

    for (const key in countsObj) {
        const count = countsObj[key];
        if (count > first) {
            third = second;
            thirdKey = secondKey;

            second = first;
            secondKey = firstKey;

            first = count;
            firstKey = key;
        } else if (count > second) {
            third = second;
            thirdKey = secondKey;

            second = count;
            secondKey = key;
        } else if (count > third) {
            third = count;
            thirdKey = key;
        }
    }

    return { firstKey: firstKey, first: first, secondKey: secondKey, second: second, thirdKey: thirdKey, third: third };
}


app.get("/homepage", async (req, res) => {
    try {
    const event = req.query.event;
    const fandom = req.query.fandom;
    const logs = await InventoryLog.find();
    const orders = await OrderModel.find();
    const products = await ProductModel.find();

    const hashMapTopSeller = {};
    const hashMapTopType = {};
    const hashMapTopFandom = {};
    const hashMapTopDeal = {};
    const hashMapTopEvent = {};
    const hashMapTopPayment = {};
    const hashMapAllTime = {};
    const hashMapTotalSold = {};
    const hashMapProducts = {};
    
    const salesByProduct = {};
    const salesByFandom = {};
    const totalSalesByFandom = {};
    let eventRevenue = 0;

    let totalItemSoldCount = 0;
    
    const eventOrders = event
    ? orders.filter(order => order.event === event)
    : [];
    
    const fandomItems = fandom
    ? orders.flatMap(order => 
        order.items.filter(item => item.option.fandom === fandom))
    : [];
    
    for (const log of logs) {
        const key = `${log.productName}-${log.design}-${log.size}`;
        
        if (log.change > 0){
            hashMapAllTime[key] = (hashMapAllTime[key] ?? 0) + log.change;
        }
    }

    for (const order of orders) {
        for (const item of order.items){
            hashMapTopSeller[item.option.design] = (hashMapTopSeller[item.option.design] || 0) + item.quantity;
            hashMapTopType[item.product] = (hashMapTopType[item.product] || 0) + item.quantity;
            hashMapTopFandom[item.option.fandom] = (hashMapTopFandom[item.option.fandom] || 0) + item.quantity;
            
            const key = `${item.product}-${item.option.design}-${item.option.size}`;
            hashMapTotalSold[key] = (hashMapTotalSold[key] || 0) + item.quantity;
            totalItemSoldCount += item.quantity;

            if (!hashMapProducts[item.product]) {
                hashMapProducts[item.product] = {
                    count: 0,
                    revenue: 0
                };
            }

            hashMapProducts[item.product].count += item.quantity;
            hashMapProducts[item.product].revenue += item.unitPrice * item.quantity;        

            if (!totalSalesByFandom[item.option.fandom]) {
                totalSalesByFandom[item.option.fandom] = {
                    count: 0,
                    revenue: 0
                };
            }

            totalSalesByFandom[item.option.fandom].count += item.quantity;
            totalSalesByFandom[item.option.fandom].revenue += item.unitPrice * item.quantity; 
        }
        order.deals?.forEach(deal => {
            if (deal.name !== "None"){
                hashMapTopDeal[deal.name] = (hashMapTopDeal[deal.name] || 0) + 1;
            }
        })
        
        hashMapTopEvent[order.event] = (hashMapTopEvent[order.event] || 0) + order.total;
        hashMapTopPayment[order.paymentMethod] = (hashMapTopPayment[order.paymentMethod] || 0) + 1;
    }
    
    for (const order of eventOrders) {
        eventRevenue += order.total;

        for (const item of order.items){
            const key = `${item.product}-${item.option.design}-${item.option.size}`;
            salesByProduct[key] = (salesByProduct[key] || 0) + item.quantity;
        }
    }

    for (const item of fandomItems) {
        const key = `${item.product}-${item.option.design}-${item.option.size}`;
        salesByFandom[key] = (salesByFandom[key] || 0) + item.quantity;
    }

    const max_topSeller = getTopEntry(hashMapTopSeller);
    const max_topType = getTopEntry(hashMapTopType);
    const max_topFandom = getTopEntry(hashMapTopFandom);
    const max_topDeal = getTopEntry(hashMapTopDeal);
    const max_topEvent = getTopEntry(hashMapTopEvent);
    const max_topPayment = getTopEntry(hashMapTopPayment);

    const eventResults = products.flatMap(product => 
        product.fields.design.flatMap(design => 
            product.inventory
            .filter(item => item.design === design.value)
            .map(item => {
                const key = `${product.name}-${design.value}-${item.size}`;
                return {
                    type: product.name,
                    design: design.value,
                    size: item.size,
                    amountSold: salesByProduct[key] || 0
                }
            }))
    )
    
    const fandomResults = products.flatMap(product => 
        product.fields.design
        .filter(design => design.dependsOn?.get("fandom") === fandom)
        .flatMap(design => 
            product.inventory
            .filter(item => item.design === design.value)
            .map(item => {
                const key = `${product.name}-${design.value}-${item.size}`;
                return {
                    type: product.name,
                    design: design.value,
                    size: item.size,
                    amountSold: salesByFandom[key] || 0
                }
            }))
        )
    
    const fandoms = [
        "Blue Lock", "Bunny", "Chiiawaka", "Deltarune", "Demon Slayer", "Flowers bloom", "Gachiakuta", "Genshin Impact", "Hypnosis Mic", 
        "Kpop DH",  "LADS", "Limbus Company", "Library of Ruina", "Miffy", "Nezha", "Overwatch", "Rally Leftovers", "TBHX", "Twisted Wonderland", "Valorant", "Vocaloid" 
    ];

    res.json({ //Clean this up later
        topSeller: max_topSeller?.firstKey ?? null, 
        topSellerCount: max_topSeller?.first ?? null, 
        secondSeller: max_topSeller?.secondKey ?? null, 
        secondSellerCount: max_topSeller?.second ?? null, 
        thirdSeller: max_topSeller?.thirdKey ?? null, 
        thirdSellerCount: max_topSeller?.third ?? null, 
        topType: max_topType?.firstKey ?? null, 
        topTypeCount: max_topType?.first ?? null, 
        secondType: max_topType?.secondKey ?? null, 
        secondTypeCount: max_topType?.second ?? null, 
        thirdType: max_topType?.thirdKey ?? null, 
        thirdTypeCount: max_topType?.third ?? null,
        topFandom: max_topFandom?.firstKey ?? null, 
        topFandomCount: max_topFandom?.first ?? null, 
        secondFandom: max_topFandom?.secondKey ?? null, 
        secondFandomCount: max_topFandom?.second ?? null, 
        thirdFandom: max_topFandom?.thirdKey ?? null, 
        thirdFandomCount: max_topFandom?.third ?? null,
        topDeal: max_topDeal?.firstKey ?? null,
        topDealCount: max_topDeal?.first ?? null, 
        secondTopDeal: max_topDeal?.secondKey ?? null,
        secondTopDealCount: max_topDeal?.second ?? null, 
        topEvent: max_topEvent?.firstKey ?? null, 
        topEventCount: max_topEvent?.first ?? null, 
        topPayment: max_topPayment?.firstKey ?? null,
        topPaymentCount: max_topPayment?.first ?? null,
        totalItemSoldCount,
        hashMapAllTime,
        hashMapTotalSold,
        eventResults,
        eventRevenue,
        fandoms,
        fandomResults,
        totalSalesByFandom,
        hashMapProducts
    });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }})




// Inventory and jazz

app.get("/inventory-logs", async (req, res) => {
    try {
    const logs = await InventoryLog.find()
                                   .sort({ createdAt: -1 });
    res.json(logs);
    } catch (err) {
        res.status(500).json({ error: error.message });
    }
})

app.delete("/inventory-logs/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const log = await InventoryLog.findByIdAndDelete(id);
        res.sendStatus(200);
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
})

const stickerDesigns = [
                { value: "purple bunny", dependsOn: { fandom: "Bunny"}},
                { value: "green bunny", dependsOn: { fandom: "Bunny"}},
                { value: "white rabbit", dependsOn: { fandom: "Bunny"}},
                { value: "Strawberry sandwich bunny", dependsOn: { fandom: "Bunny"}},
                { value: "shinobu", dependsOn: { fandom: "Demon Slayer"}},
                { value: "Enji", dependsOn: { fandom: "Gachiakuta"}},
                { value: "zanka", dependsOn: { fandom: "Gachiakuta"}},
                { value: "riyo", dependsOn: { fandom: "Gachiakuta"}},
                { value: "rudo", dependsOn: { fandom: "Gachiakuta"}},
                { value: "amo", dependsOn: { fandom: "Gachiakuta"}},
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
                { value: "bp fairy Moira", dependsOn: { fandom: "Overwatch"}},
                { value: "rowance rook stamp", dependsOn: { fandom: "Twisted Wonderland"}},
                { value: "kaito grape", dependsOn: { fandom: "Vocaloid"}}];

const stickerInventory = stickerDesigns.map(design => ({
    design: design.value,
    stock: 0
}))

const printDesigns = [
                { value: "kris night", sizes: ["small"], dependsOn: { fandom: "Deltarune"}},
                { value: "kris light", sizes: ["small"], dependsOn: { fandom: "Deltarune"}},
                { value: "flowers comic", sizes: ["large"], dependsOn: { fandom: "Flowers bloom"}},
                { value: "Colmbina", sizes: ["large"],  dependsOn: { fandom: "Genshin Impact"}},
                { value: "flins", sizes: ["large"],  dependsOn: { fandom: "Genshin Impact"}},
                { value: "king Xavier", sizes: ["large"], dependsOn: { fandom: "LADS"}},
                { value: "canto ego ryoshu", sizes: ["small", "large"],  dependsOn: { fandom: "Limbus Company"}},
                { value: "canto honglu", sizes: ["small", "large"],  dependsOn: { fandom: "Limbus Company"}},
                { value: "canto ego honglu", sizes: ["small", "large"],  dependsOn: { fandom: "Limbus Company"}},
                { value: "canto yisang", sizes: ["small", "large"],  dependsOn: { fandom: "Limbus Company"}},
                { value: "canto ego ishmael", sizes: ["small", "large"],  dependsOn: { fandom: "Limbus Company"}},
                { value: "faust gallery", sizes: ["small"], dependsOn: { fandom: "Limbus Company"}},
                { value: "rodya gallery", sizes: ["small"], dependsOn: { fandom: "Limbus Company"}},
                { value: "honglu gallery", sizes: ["small"], dependsOn: { fandom: "Limbus Company"}},
                { value: "bad end id honglu", sizes: ["small"], dependsOn: { fandom: "Limbus Company"}},
                { value: "nezha", sizes: ["large"],  dependsOn: { fandom: "Nezha"}},
                { value: "Wuyang", sizes: ["small", "large"], dependsOn: { fandom: "Overwatch"}},
                { value: "anran", sizes: ["small", "large"], dependsOn: { fandom: "Overwatch"}},
                { value: "bp fairy lifeweaver", sizes: ["small"], dependsOn: { fandom: "Overwatch"}},
                { value: "riddle rapunzel", sizes: ["small"], dependsOn: { fandom: "Twisted Wonderland"}},
                { value: "Deuce star", sizes: ["small"], dependsOn: { fandom: "Twisted Wonderland"}},
                { value: "silver knight", sizes: ["small"], dependsOn: { fandom: "Twisted Wonderland"}},
                { value: "silver rabbit", sizes: ["small"], dependsOn: { fandom: "Twisted Wonderland"}},
                { value: "ace new year", sizes: ["small"], dependsOn: { fandom: "Twisted Wonderland"}},
                { value: "Rowance Riddle", sizes: ["small"], dependsOn: { fandom: "Twisted Wonderland"}},
                { value: "dorm idia", sizes: ["small", "large"], dependsOn: { fandom: "Twisted Wonderland"}},
                { value: "teto", sizes: ["large"],  dependsOn: { fandom: "Vocaloid"}},
                { value: "summer outfit miku", sizes: ["small"],  dependsOn: { fandom: "Vocaloid"}}]

const printInventory = printDesigns.flatMap(design => 
    design.sizes.map(size => ({
        design: design.value,
        size,
        stock: 0
    }))
)

const keychainDesigns = [
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
                { value: "ramuda chibi", dependsOn: { fandom: "Hypnosis Mic"}},
                { value: "jakurai chibi", dependsOn: { fandom: "Hypnosis Mic"}},
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
                { value: "ryoshu red string pair", dependsOn: { fandom: "Limbus Company"}},
                { value: "Araya red string pair", dependsOn: { fandom: "Limbus Company"}},
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
                { value: "Mekio", dependsOn: { fandom: "Vocaloid"}},
                { value: "Miku", dependsOn: { fandom: "Vocaloid"}},
                { value: "Miku full body", dependsOn: { fandom: "Vocaloid"}},
                { value: "Miku cinnamon roll", dependsOn: { fandom: "Vocaloid"}},
                { value: "full cherry", dependsOn: { fandom: "Vocaloid"}},
                { value: "teto", dependsOn: { fandom: "Vocaloid"}}]

const keychainInventory = keychainDesigns.map(design => ({
    design: design.value,
    stock: 0
}))

const specialtyKeychainDesigns = [
                { value: "Ryoshu Hell Screen Lace", dependsOn: { fandom: "Limbus Company"}},
                { value: "Araya Hell Screen Lace", dependsOn: { fandom: "Limbus Company"}},
                { value: "X Cards", dependsOn: { fandom: "TBHX"}}
            ]


const specialtyKeychainInventory = specialtyKeychainDesigns.map(design => ({
    design: design.value,
    stock: 0
}))

const stickerSheetDesigns = [
                { value: "CW Food", dependsOn: { fandom: "Chiiawaka"}},
                { value: "CW Emotions", dependsOn: { fandom: "Chiiawaka"}},
                { value: "CW Study", dependsOn: { fandom: "Chiiawaka"}},
                { value: "Genshin Xiao Rally", dependsOn: { fandom: "Rally Leftovers"}},
                { value: "TGEX MATCHA", dependsOn: { fandom: "Rally Leftovers"}},
                { value: "Trio FlingP", dependsOn: { fandom: "Hypnosis Mic"}},
                { value: "Trio Materno", dependsOn: { fandom: "Hypnosis Mic"}},
                { value: "MY Bake", dependsOn: { fandom: "Miffy"}},
                { value: "MY matcha", dependsOn: { fandom: "Miffy"}},
                { value: "MY fruit", dependsOn: { fandom: "Miffy"}},
                { value: "MU Songs", dependsOn: { fandom: "Vocaloid"}}
            ]

const stickerSheetInventory = stickerSheetDesigns.map(design => ({
    design: design.value,
    stock: 0
}))

const heartPinDesigns = [
                { value: "Xavier", dependsOn: { fandom: "LADS"}},
                { value: "stylus", dependsOn: { fandom: "LADS"}},
                { value: "Zayne", dependsOn: { fandom: "LADS"}},
                { value: "Rafael", dependsOn: { fandom: "LADS"}},
                { value: "Caleb", dependsOn: { fandom: "LADS"}}]

const heartPinInventory = heartPinDesigns.map(design => ({
    design: design.value,
    stock: 0
}))

const foilPinsDesigns = [
                { value: "Kris", dependsOn: { fandom: "Deltarune"}},
                { value: "Susie", dependsOn: { fandom: "Deltarune"}},
                { value: "Ralsei", dependsOn: { fandom: "Deltarune"}}]

const foilPinsInventory = foilPinsDesigns.map(design => ({
    design: design.value,
    stock: 0
}))

const standeeDesigns = [
                {value: "Canto 7: The Dream Ending", dependsOn: { fandom: "Limbus Company"}},
                {value: "Canto 4: The Unchanging", dependsOn: { fandom: "Limbus Company"}},
                {value: "Canto 9: The Unsevering", dependsOn: { fandom: "Limbus Company"}},
                {value: "Riddle cup", dependsOn: { fandom: "Twisted Wonderland"}}
            ]

const standeeInventory = standeeDesigns.map(design => ({
    design: design.value,
    stock: 0
}))

const plushieDesigns = [
                {value: "Angela", dependsOn: { fandom: "Library of Ruina"}},
                {value: "Roland", dependsOn: { fandom: "Library of Ruina"}},
                {value: "Samatoki", dependsOn: { fandom: "Hypnosis Mic"}},
                {value: "Ramuda", dependsOn: { fandom: "Hypnosis Mic"}},
                {value: "Doppo", dependsOn: { fandom: "Hypnosis Mic"}}
            ]

const plushieInventory = plushieDesigns.map(design => ({
    design: design.value,
    stock: 0
}))

async function mergeInventory(productName, fields, inventory, pricing){
    const existingProduct = await ProductModel.findOne({ name: productName });

    const mergedInventory = inventory.map(newItem => {
    const existingItem = existingProduct?.inventory.find(item =>
        item.design === newItem.design &&
        item.size === newItem.size
    );

    return existingItem ?? newItem;
});

    await ProductModel.findOneAndUpdate(
        {name: productName },
        {
            $set: {
                fields,
                inventory: mergedInventory,
                pricing
            }
        },
        { upsert: true }
    )
}


// Orders

app.post("/orders", async (req, res) => {
    try {
        const newOrder = new OrderModel(req.body);
        const savedOrder = await newOrder.save();

        for (const item of savedOrder.items){
            const product = await ProductModel.findOne({ name: item.product });

            const inventoryItem = product?.inventory.find(
                inv =>
                    inv.design === item.option.design && 
                    (inv.size || null) === (item.option.size || null)
            );

            if (!product || !inventoryItem) {
                throw new Error(
                    `Inventory item not found: ${item.product}, ` +
                    `${item.option.design}, ${item.option.size}`
                );
            }

            console.log(item);
            console.log(item.option);
            
            const stockBefore = inventoryItem.stock;
            inventoryItem.stock -= item.quantity;
            const stockAfter = inventoryItem.stock;
            await product.save();
            
            await InventoryLog.create({
                productId: product._id,
                productName: product.name,
                design: item.option.design,
                size: item.option.size,
                change: -item.quantity,
                stockBefore,
                stockAfter,
                note: `Order #${savedOrder._id}`
            });
        }

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

    res.json([...orders].reverse() || []);
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

app.patch("/orders/:id", async (req, res) => {
    try {
        const updatedOrder = await OrderModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            { returnDocument: "after", runValidators: true}
        );

        if (!updatedOrder) {
            return res.status(404).json({ error: "Order not found" });
        }

        res.json(updatedOrder);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: err.message
        });
    }
})

app.post("/orders/undo", async (req, res) => {
    const session = await mongoose.startSession();

    try {
        let result;

        await session.withTransaction(async () => {
            const order = req.body;

            for (const item of order.items){
                const product = await ProductModel.findOne({ name: item.product }).session(session);

                const inventoryItem = product?.inventory.find(
                inv =>
                    inv.design === item.option.design && 
                    (inv.size || null) === (item.option.size || null)
                );

                if (!product || !inventoryItem) {
                    throw new Error(
                        `Inventory item not found: ${item.product}, ` +
                        `${item.option.design}, ${item.option.size}`
                    );
                }
            
                const stockBefore = inventoryItem.stock;
                inventoryItem.stock += item.quantity;
                const stockAfter = inventoryItem.stock;
                await product.save({ session });
            
                await InventoryLog.create([{
                    productId: product._id,
                    productName: product.name,
                    design: item.option.design,
                    size: item.option.size,
                    change: item.quantity,
                    stockBefore,
                    stockAfter,
                    note: `Undoing Order #${order._id}`
                }],
                    { session }
                );
            }

            result = {
                success: true,
                orderId: order._id
            };
        });

        res.json(result);

    } catch(err) {
        console.error(err);
        res.status(500).json({
            error: err.message
        });
    } finally {
        await session.endSession();
    }
});

//Products

app.get("/seed-products", async (req, res) => {

    await mergeInventory(
        "Stickers", {
            fandom: [
                { value: "Bunny"},
                { value: "Demon Slayer"},
                { value: "Genshin Impact"},
                { value: "Gachiakuta"},
                { value: "Hypnosis Mic"},
                { value: "LADS"},
                { value: "Limbus Company"},
                { value: "Kpop DH"},
                { value: "Nezha"},
                { value: "Twisted Wonderland"},
                { value: "Vocaloid"}],
            design: stickerDesigns,
            quantity: [1, 2, 3, 4, 5, 6]
        },
        stickerInventory,
        {
            "base": 3
        }
    );

    await mergeInventory(
        "Prints", {
            fandom: [
                { value: "Deltarune"},
                { value: "Flowers bloom"},
                { value: "Genshin Impact"},
                { value: "Hypnosis Mic"},
                { value: "LADS"},
                { value: "Limbus Company"},
                { value: "Nezha"},
                { value: "Overwatch"},
                { value: "Twisted Wonderland"},
                { value: "Vocaloid"}],
            size: ["small", "large"],
            design: printDesigns,
            quantity: [1, 2, 3, 4, 5]
        },
        printInventory,
        {
            "small": 10,
            "large": 15
        }
    );

    await mergeInventory(
        "Keychains", {
            fandom: [
                { value: "Blue Lock"},
                { value: "Bunny"},
                { value: "Demon Slayer"},
                { value: "Flowers bloom"},
                { value: "Gachiakuta"},
                { value: "Hypnosis Mic"},
                { value: "Limbus Company"},
                { value: "TBHX"},
                { value: "Twisted Wonderland"},
                { value: "Valorant"},
                { value: "Vocaloid"}
            ],
            design: keychainDesigns,
            quantity: [1, 2, 3, 4, 5]
        },
        keychainInventory,
        {
            "base": 13
        }
    );

    await mergeInventory(
        "Specialty Keychains", {
            fandom: [
                { value: "Limbus Company"},
                { value: "TBHX"}
            ],
            design: specialtyKeychainDesigns,
            quantity: [1, 2, 3, 4, 5]
        },
        specialtyKeychainInventory,
        {
            "base": 18
        }
    );
    
    await mergeInventory(
        "Sticker Sheet",{
            fandom: [
                { value: "Chiiawaka" },
                { value: "Hypnosis Mic"},
                { value: "Miffy"},
                { value: "Rally Leftovers"},
                { value: "Vocaloid"}
            ],
            design: stickerSheetDesigns,
            quantity: [1, 2, 3, 4, 5]
        },
        stickerSheetInventory,
        {
            "base": 6
        }
    );
    
    await mergeInventory(
        "Heart Pins",{
            fandom: [
                { value: "LADS"}],
            design: heartPinDesigns,
            quantity: [1, 2, 3, 4, 5]
        },
        heartPinInventory,
        {
            "base": 6
        }
    );
    
    await mergeInventory(
        "Foil Pins",{
            fandom: [
                {value: "Deltarune"}
            ],
            design: foilPinsDesigns,
            quantity: [1, 2, 3, 4, 5]
        },
        foilPinsInventory,
        {
            "base": 8
        }
    );
    
    await mergeInventory(
        "Standees",{
            fandom: [
                { value: "Limbus Company"},
                { value: "Twisted Wonderland"}
                ],
            design: standeeDesigns,
            quantity: [1, 2, 3, 4, 5]
        },
        standeeInventory,
        {
            "base": 45
        }
    );

    await mergeInventory(
        "Plushies",{
            fandom: [
                { value: "Library of Ruina"},
                { value: "Hypnosis Mic"}
                ],
            design: plushieDesigns,
            quantity: [1, 2, 3, 4, 5]
        },
        plushieInventory,
        {
            "base": 40
        }
    );

    res.send("Seeded");
});

app.get("reset-products", async (req, res) => {
    await ProductModel.deleteMany({});
    res.send("All products deleted.");
})



//export to sheets
app.get("/export-orders", async (req, res) => {
    const orders = await OrderModel.find();


    let csv =
        "Date,Time,Event,Design,Size,Product,Fandom,Quantity,Unit Price,Deal,Payment Method,Subtotal,Total,Note,Id\n";

    orders.forEach(order => {
        order.items.forEach(item => {
            const deals = (order.deals || []).map(deal => `${deal.name} ($${deal.discount} off)`).join(" | ");
            csv +=
                `${(order.createdAt).toLocaleString()},` +
                `${order.event || ""},` +
                `${item.option.design},` +
                `${item.option.size || ""},` +
                `${item.product},` +
                `${item.option.fandom},` +
                `${item.quantity},` +
                `${item.unitPrice},` +
                `"${deals}",` +
                `${order.paymentMethod || ""},` +
                `${order.subtotal || 0},` +
                `${order.total || 0},` +
                `${order.note || ""},` +
                `${order._id || ""}\n`;
        });
    });

    res.header("Content-Type", "text/csv");
    res.attachment("orders.csv");
    res.send(csv);
});

app.get("/export-inventory-logs", async (req, res) => {
    const logs = await InventoryLog.find();

    let csv =
        "Date,Time,Design,Size,Product,Past,Update,Current,Note,Id\n";

    logs.forEach(log => {
            csv +=
                `${(log.createdAt).toLocaleString()},` +
                `${log.design},` +
                `${log.size || ""},` +
                `${log.productName},` +
                `${log.stockBefore || 0},` +
                `${log.change || 0},` +
                `${log.stockAfter || 0},` +
                `${log.note || ""},` + 
                `${log._id || ""}\n`;
    });

    res.header("Content-Type", "text/csv");
    res.attachment("inventoryLogs.csv");
    res.send(csv);
});


app.get("/export-inventory", async (req, res) => {
    const products = await ProductModel.find();
    const inventoryRows = [];

    let csv =
        "Fandom,Design,Size,Product,Stock,,Products,Sizes,Price\n";

    products.forEach(product => {
        product.inventory.forEach(inventoryItem => {

            const design = product.fields.design.find(
                design => design.value === inventoryItem.design
            );

            const fandom = design?.dependsOn?.get("fandom");

            inventoryRows.push([
                fandom || "",
                inventoryItem.design || "",
                inventoryItem.size || "",
                product.name || "",
                inventoryItem.stock ?? ""
            ])
        });
    });

    const productRows = [];

    products.forEach(product => {
        for (const [size,price] of product.pricing.entries()) {
            productRows.push([
                product.name,
                size,
                price
            ])
        }
    });

    const rowCount = Math.max(inventoryRows.length, productRows.length);

    for (let i = 0; i < rowCount; i++) {
        const inventory = inventoryRows[i] || ["", "", "", "", ""];
        const product = productRows[i] || ["", "", ""];

        csv += [
            ...inventory,
            "",
            ...product
        ].join(",") + "\n";
    }

    res.header("Content-Type", "text/csv");
    res.attachment("inventory.csv");
    res.send(csv);
});


//import to sheets

const multer = require("multer");
const { parse } = require("csv-parse/sync");

const upload = multer({
    storage: multer.memoryStorage()
});

app.post("/import-inventory", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                error: "No CSV file uploaded"
            });
        }

        const csv = req.file.buffer.toString("utf-8");
        
        const records = parse(csv, {
            columns: true,
            skip_empty_lines: true,
            trim: true
        })

        console.log(records);

        const errors = [];
        const products = new Map();
        let imported = 0;

        for (const row of records) {
            let product = products.get(row.Product);

            if (!product) {
                product = await ProductModel.findOne({
                    name: row.Product
                })

                if(!product) {
                    errors.push({
                        row,
                        error: `Product not found: ${row.Product}`
                    });
                    continue;
                }
                products.set(row.Product, product)
            }

            const current = Number(row.Current);
            const stock = Number.isNaN(current) ? Number(row.Stock) : current;

            if(!Number.isInteger(stock)) {
                errors.push({
                    row,
                    error: `Invalid stock: ${row.Current}`
                })
                continue;
            }
            
            const inventoryItem = product.inventory.find(
                inv =>
                    inv.design === row.Design &&
                    (inv.size || null) === (row.Size || null)
            );

            if (!inventoryItem) {
                errors.push({
                    row,
                    error: `Inventory item not found`
                });
                continue;
            }

            inventoryItem.fandom = row.Fandom;
            inventoryItem.stock = stock;
            imported++;
        }
        
        for (const product of products.values()) {
            await product.save();
        }

        res.json({
            imported,
            productsUpdated: products.size,
            errors
        });
    } catch (error) {
        console.log(error);

        res.status(500).json({
            error: "Failed to import inventory"
        });
    }
});


app.post("/import-inventory-logs", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                error: "No CSV file uploaded"
            });
        }

        const csv = req.file.buffer.toString("utf-8");
        
        const records = parse(csv, {
            columns: true,
            skip_empty_lines: true,
            trim: true
        })

        console.log(records);

        const errors = [];
        const products = new Map();
        let imported = 0;

        for (const row of records) {
            let product = products.get(row.Product);

            if (!product) {
                product = await ProductModel.findOne({
                    name: row.Product
                })

                if(!product) {
                    errors.push({
                        row,
                        error: `Product not found: ${row.Product}`
                    });
                    continue;
                }
                products.set(row.Product, product)
            }

            const inventoryItem = product.inventory.find(item => 
                item.design === row.Design &&
                (item.size || null) === (row.Size || null)
            );
        
            if (!inventoryItem){
                errors.push({
                    row,
                    error: `Inventory item not found: ${row.Design} / ${row.Size}`
                });
                continue;
            }

            const logId = row.Id;
            const stockBefore = Number(row.Past);
            const change = Number(row.Update);
            const stockAfter = Number(row.Current);
            const note = row.Note;

            const log = new InventoryLog({
                _id: logId,
                createdAt: new Date(`${row.Date} ${row.Time}`),
                productId: product._id,
                productName: product.name,
                design: inventoryItem.design,
                size: inventoryItem.size,
                change,
                stockBefore,
                stockAfter,
                note
            })

            await log.save();
            imported++;
        } 

        res.json({
            imported,
            errors
        })

    } catch (error) {
        console.log(error);

        res.status(500).json({
            error: "Failed to import inventory logs"
        })
    }
})


app.post("/import-orders", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                error: "No CSV file uploaded"
            });
        }

        const csv = req.file.buffer.toString("utf-8");

        const records = parse(csv, {
            columns: true,
            skip_empty_lines: true,
            trim: true
        })

        console.log(records);

        const errors = [];
        const orders = new Map();
        let imported = 0;

        for (const row of records) {
            const id = row.Id;
            
            if (!orders.has(id)) {
                orders.set(id, []);
            }
            orders.get(id).push(row)
        }

        for (const [orderId, rows] of orders) {
            const firstRow = rows[0];
            
            const dealsArray = [];

            if (firstRow.Deal) {
                const dealStrings = firstRow.Deal.split(" | ");

                for (const dealString of dealStrings) {
                    const match = dealString.match(/^(.*?) \(\$(\d+(?:\.\d+)?) off\)$/);

                    if (match) {
                        dealsArray.push({
                            name: match[1],
                            discount: Number(match[2])
                        });
                    }
                }
            }

            const existingId = await OrderModel.exists({
                _id: orderId
            });

            if (existingId) { 
                errors.push({
                    row: rows[0],
                    error: `Order already exists: ${orderId}`
                });

                continue;
            }

            const subtot = Number(firstRow.Subtotal);
            const tot = Number(firstRow.Total);

            if(!Number.isInteger(subtot)) {
                errors.push({
                    row: firstRow,
                    error: `Invalid subtotal: ${firstRow.Subtotal}`
                })
                continue;
            }

            if(!Number.isInteger(tot)) {
                errors.push({
                    row: firstRow,
                    error: `Invalid total: ${firstRow.Total}`
                })
                continue;
            }

            const note = firstRow.Note;

            const items = [];

            for (const row of rows) {
                const quantity = Number(row.Quantity);
                const unitPrice = Number(row["Unit Price"]);
                const deals = row.Deal;

                if(!Number.isInteger(quantity)) {
                    errors.push({
                        row,
                        error: `Invalid quantity: ${row.quantity}`
                    })
                    continue;
                }

                if(!Number.isFinite(unitPrice)) {
                    errors.push({
                        row,
                        error: `Invalid unitPrice: ${row.unitPrice}`
                    })
                    continue;
                }
                
                items.push({
                    product: row.Product,

                    option: {
                        design: row.Design,
                        fandom: row.Fandom,
                        size: row.Size || undefined
                    },

                    quantity,
                    unitPrice,
                    total: unitPrice * quantity
                })
                
            }


            const order = new OrderModel({
                _id: orderId,
                createdAt: new Date(`${firstRow.Date} ${firstRow.Time}`).toISOString(),
                deals: dealsArray,
                event: firstRow.Event,
                items,
                subtotal: subtot,
                total: tot,
                paymentMethod: firstRow["Payment Method"],
                note
            })

            await order.save();
            imported++;
        }

        res.json({
            imported,
            errors
        })

    } catch (error) {
        console.log(error);

        res.status(500).json({
            error: "Failed to import orders"
        })
    }
})