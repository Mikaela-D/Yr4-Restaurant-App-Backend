// C:\Users\Mikaela\Cloud Computing\Week7JsonMongoose\Week7JsonMongoose\routes\shop.js

const express = require("express");
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

const Product = mongoose.model("product", productSchema);

const generateUniqueId = async () => {
  const products = await Product.find().sort({ ourId: 1 });
  let newId = 1;
  for (const product of products) {
    if (parseInt(product.ourId) !== newId) {
      break;
    }
    newId++;
  }
  return newId.toString();
};

router.get("/addProduct", async (req, res, next) => {
  const newId = await generateUniqueId();
  new Product({
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
  })
    .save()
    .then((result) => {
      console.log("saved product to database");
      res.redirect("/");
    })
    .catch((err) => {
      console.log("failed to addAproduct: " + err);
      res.redirect("/");
    });
});

router.get("/", (req, res, next) => {
  console.log(req.query);
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
  console.log(req.body);
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
  const newId = await generateUniqueId();
  new Product({
    ourId: newId,
    name,
    price,
    category,
    brand,
    description,
    color,
    weight,
    availability,
  })
    .save()
    .then((result) => {
      console.log("saved product to database");
      res.json({ success: true });
    })
    .catch((err) => {
      console.log("failed to add product: " + err);
      res.json({ success: false, theError: err });
    });
});

router.post("/updateSpecificProduct", (req, res, next) => {
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
  console.log("Updating product with ID:", ourId);
  Product.findOneAndUpdate(
    { ourId },
    { name, price, category, brand, description, color, weight, availability },
    { new: true }
  )
    .then((updatedProduct) => {
      if (!updatedProduct) {
        console.log("Product not found");
        return res.json({ success: false, theError: "Product not found" });
      }
      console.log("Updated product in database:", updatedProduct);
      res.json({ success: true, updatedProduct });
    })
    .catch((err) => {
      console.log("Failed to update product:", err);
      res.json({ success: false, theError: err });
    });
});

router.post("/deleteSpecificProduct", (req, res, next) => {
  const { ourId } = req.body;
  Product.findOneAndRemove({ ourId })
    .then((deletedProduct) => {
      if (!deletedProduct) {
        console.log("Product not found");
        return res.json({ success: false, theError: "Product not found" });
      }
      console.log("Deleted product from database:", deletedProduct);
      res.json({ success: true });
    })
    .catch((err) => {
      console.log("Failed to delete product:", err);
      res.json({ success: false, theError: err });
    });
});

exports.routes = router;
