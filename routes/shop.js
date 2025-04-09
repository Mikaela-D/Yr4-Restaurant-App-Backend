// C:\Users\Mikaela\Cloud Computing\Week7JsonMongoose\Week7JsonMongoose\routes\shop.js

const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema({
  name: { type: String, required: true },
  price: { type: String, required: true },
  ourId: { type: String, required: true },
  category: { type: String, required: false },
  brand: { type: String, required: false },
  description: { type: String, required: false },
  color: { type: String, required: false },
  weight: { type: String, required: false },
  availability: { type: Number, required: true },
  anArray: { type: Array, required: false },
  anObject: { type: Object, required: false },
});

const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const logSchema = new Schema({
  action: { type: String, required: true }, // e.g., "ADD_PRODUCT", "UPDATE_PRODUCT", "DELETE_PRODUCT"
  details: { type: Object, required: true }, // Details of the action (e.g., product data)
  timestamp: {
    type: Date,
    default: () => {
      const now = new Date();
      now.setHours(now.getHours() + 1); // Adjust by +1 hour
      return now;
    },
  },
});

const cartItemSchema = new Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: String, required: true },
  addedAt: { type: Date, default: Date.now },
});

const CartItem = mongoose.model("cartItem", cartItemSchema);

const Log = mongoose.model("log", logSchema);
const Product = mongoose.model("product", productSchema);
const User = mongoose.model("user", userSchema);

const generateUniqueId = async () => {
  try {
    const products = await Product.find().sort({ ourId: 1 });
    let newId = 1;
    for (const product of products) {
      if (parseInt(product.ourId) !== newId) {
        break;
      }
      newId++;
    }
    return newId.toString();
  } catch (err) {
    console.error("Error generating unique ID:", err);
    throw err;
  }
};

router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.json({ success: false, message: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    res.json({ success: true, message: "User registered successfully" });
  } catch (err) {
    console.error("Error registering user:", err);
    res.json({ success: false, message: "Failed to register user" });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.json({
        success: false,
        message: "Invalid username or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.json({
        success: false,
        message: "Invalid username or password",
      });
    }

    res.json({ success: true, message: "Login successful" });
  } catch (err) {
    console.error("Error logging in:", err);
    res.json({ success: false, message: "Failed to log in" });
  }
});

router.post("/addProduct", async (req, res, next) => {
  const {
    name,
    price,
    category,
    brand,
    description,
    color,
    weight,
    availability,
  } = req.body;

  try {
    const newId = await generateUniqueId();
    const newProduct = new Product({
      ourId: newId,
      name,
      price,
      category,
      brand,
      description,
      color,
      weight,
      availability,
    });
    await newProduct.save();

    // Log the action
    const logEntry = new Log({
      action: "ADD_PRODUCT",
      details: newProduct,
    });
    await logEntry.save();

    console.log("Saved product to database and logged action");
    res.json({ success: true });
  } catch (err) {
    console.log("Failed to add product:", err);
    res.json({ success: false, theError: err });
  }
});

router.get("/", (req, res, next) => {
  Product.find()
    .then((products) => {
      res.send(JSON.stringify(products));
    })
    .catch((err) => {
      console.log("Failed to find: " + err);
      res.send(JSON.stringify(err));
    });
});

router.post("/", (req, res, next) => {
  Product.find()
    .then((products) => {
      res.json({ success: true, Products: products });
    })
    .catch((err) => {
      console.log("Failed to find: " + err);
      res.json({ success: false, theError: err });
    });
});

router.get("/getSpecificProduct", (req, res, next) => {
  Product.find({ ourId: req.query.ourId })
    .then((products) => {
      res.send(JSON.stringify(products[0]));
    })
    .catch((err) => {
      console.log("Failed to find product: " + err);
      res.send(JSON.stringify(err));
    });
});

router.post("/getSpecificProduct", (req, res, next) => {
  Product.find({ ourId: req.body.ourId })
    .then((products) => {
      res.json({ success: true, theProduct: products[0] });
    })
    .catch((err) => {
      console.log("Failed to find product: " + err);
      res.json({ success: false, theError: err });
    });
});

router.post("/addProduct", async (req, res, next) => {
  const {
    name,
    price,
    category,
    brand,
    description,
    color,
    weight,
    availability,
  } = req.body;

  try {
    const newId = await generateUniqueId();
    const newProduct = new Product({
      ourId: newId,
      name,
      price,
      category,
      brand,
      description,
      color,
      weight,
      availability,
    });
    await newProduct.save();
    console.log("saved product to database");
    res.json({ success: true });
  } catch (err) {
    console.log("failed to add product: " + err);
    res.json({ success: false, theError: err });
  }
});

router.post("/updateSpecificProduct", async (req, res, next) => {
  const {
    ourId,
    name,
    price,
    category,
    brand,
    description,
    color,
    weight,
    availability,
  } = req.body;

  try {
    const updatedProduct = await Product.findOneAndUpdate(
      { ourId },
      {
        name,
        price,
        category,
        brand,
        description,
        color,
        weight,
        availability,
      },
      { new: true }
    );
    if (!updatedProduct) {
      console.log("Product not found");
      return res.json({ success: false, theError: "Product not found" });
    }

    // Log the action
    const logEntry = new Log({
      action: "UPDATE_PRODUCT",
      details: updatedProduct,
    });
    await logEntry.save();

    console.log("Updated product in database and logged action");
    res.json({ success: true, updatedProduct });
  } catch (err) {
    console.log("Failed to update product:", err);
    res.json({ success: false, theError: err });
  }
});

router.post("/deleteSpecificProduct", async (req, res, next) => {
  const { ourId } = req.body;

  try {
    const deletedProduct = await Product.findOneAndRemove({ ourId });
    if (!deletedProduct) {
      console.log("Product not found");
      return res.json({ success: false, theError: "Product not found" });
    }

    // Log the action
    const logEntry = new Log({
      action: "DELETE_PRODUCT",
      details: deletedProduct,
    });
    await logEntry.save();

    console.log("Deleted product from database and logged action");
    res.json({ success: true });
  } catch (err) {
    console.log("Failed to delete product:", err);
    res.json({ success: false, theError: err });
  }
});

router.get("/logs", async (req, res) => {
  try {
    const logs = await Log.find().sort({ timestamp: -1 }); // Sort by most recent
    res.json({ success: true, logs });
  } catch (err) {
    console.error("Failed to fetch logs:", err);
    res.json({ success: false, message: "Failed to fetch logs" });
  }
});

router.post("/addToCart", async (req, res) => {
  const { productId, name, price } = req.body;

  try {
    const product = await Product.findOne({ ourId: productId });

    if (!product) {
      return res.json({ success: false, message: "Product not found" });
    }

    if (product.availability <= 0) {
      return res.json({ success: false, message: "Product is out of stock" });
    }

    const newCartItem = new CartItem({ productId, name, price });
    await newCartItem.save();

    product.availability -= 1; // Deduct availability
    await product.save();

    console.log("Added product to cart and updated availability");
    res.json({ success: true });
  } catch (err) {
    console.log("Failed to add product to cart:", err);
    res.json({ success: false, theError: err });
  }
});

router.post("/removeFromCart", async (req, res) => {
  const { productId } = req.body;

  try {
    const cartItem = await CartItem.findOne({ productId });

    if (!cartItem) {
      console.log("Cart item not found");
      return res.json({ success: false, message: "Cart item not found" });
    }

    // Remove the cart item if quantity is 1, otherwise decrement quantity
    if (cartItem.quantity && cartItem.quantity > 1) {
      cartItem.quantity -= 1;
      await cartItem.save();
    } else {
      await CartItem.findOneAndRemove({ productId });
    }

    console.log("Updated cart item in database");
    res.json({ success: true });
  } catch (err) {
    console.log("Failed to remove product from cart:", err);
    res.json({ success: false, theError: err });
  }
});

exports.routes = router;
