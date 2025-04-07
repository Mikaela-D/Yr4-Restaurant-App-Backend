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
  availability: { type: String, required: false },
  anArray: { type: Array, required: false },
  anObject: { type: Object, required: false },
});

const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

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

router.get("/addProduct", (req, res, next) => {
  generateUniqueId()
    .then((newId) => {
      return new Product({
        ourId: newId,
        name: "widget",
        price: 3.95,
        category: "gadgets",
        brand: "widgetBrand",
        description: "A useful widget",
        color: "red",
        weight: "200g",
        availability: "In stock",
        size: "large",
      }).save();
    })
    .then(() => {
      console.log("saved product to database");
      res.redirect("/");
    })
    .catch((err) => {
      console.log("failed to add product: " + err);
      res.redirect("/");
    });
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
    console.log("Updated product in database:", updatedProduct);
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
    console.log("Deleted product from database:", deletedProduct);
    res.json({ success: true });
  } catch (err) {
    console.log("Failed to delete product:", err);
    res.json({ success: false, theError: err });
  }
});

exports.routes = router;
