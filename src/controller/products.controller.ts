import { Request, Response } from "express";
import path from "path";
import fs from "fs";
import PDFDocument from "pdfkit";
import productModel, { Iproduct } from "../model/productModel";
import purchaseModel, { Ipurchase } from "../model/purchaseModel";
import userModel from "../model/userModel";
import { config } from "dotenv";
import cloudinaryConfig from "../config/cloudinaryConfig";
import mailFunc from "../config/mail";
config({ path: path.resolve(process.cwd(), ".env") });

class productsController {
  constructor() {}
  //Admin functionality
  createProduct = async (req: Request, res: Response) => {
    const data = {
      body: req.body,
      file: req.file,
    };

    var imageUploaded: any;
    if (!data.file || !data.body)
      return res.status(400).json({ msg: "Provide data for all fields" });
    imageUploaded = await cloudinaryConfig.uploader.upload(data.file.path);

    try {
      let newPrice: string;
      if (data.body.discount > 0) {
        var discount = data.body.discount;
        var solve: number = discount / 100;
        const newAmount: number = solve * Number(data.body.price);

        newPrice = (Number(data.body.price) - newAmount).toString();
      } else {
        newPrice = data.body.price;
      }
      var newProd: Iproduct = new productModel({
        ...data.body,
        newPrice,
        image: imageUploaded.secure_url,
        cloudinaryId: imageUploaded.public_id,
      });

      newProd = await newProd.save();

      if (newProd) {
        res.status(201).json({ data: newProd._id });
      } else {
        res.status(400).json({ msg: "An error occured" });
      }
    } catch (e) {
      res.status(500).json(e);
    }
  };

  getProducts = async (req: Request, res: Response) => {
    const currentPage: any = req.query.page || 1;
    const perpage = 6;
    let totalItems: number;
    var count = await productModel.find().countDocuments();
    totalItems = count;
    try {
      var products = await productModel
        .find()
        .skip((currentPage - 1) * perpage)
        .limit(perpage)
        .sort({ createdAt: "desc" });

      if (!products) {
        res.status(400).json({ msg: "There are no products" });
      } else {
        res.status(200).json({ data: products, totalItems });
      }
    } catch (err) {
      res.status(500).json(err);
    }
  };

  getProductsForStoreDisplay = async (req: Request, res: Response) => {
    var products = await productModel.find().sort({ createdAt: "desc" });

    try {
      res.status(200).json({ data: products });
    } catch (err) {
      res.status(500).json(err);
    }
  };

  getExclusiveProducts = async (req: Request, res: Response) => {
    var products = await productModel.find().sort({ price: 1 }).limit(3);
    try {
      if (!products) {
        res.status(400).json({ msg: "There are no products" });
      } else {
        res.status(200).json({ data: products });
      }
    } catch (err) {
      res.status(500).json(err);
    }
  };

  getSimilarProducts = async (req: Request, res: Response) => {
    var products = await productModel
      .find({ category: req.params.category })
      .sort({ price: "1" })
      .limit(3);
    try {
      if (!products) {
        res.status(400).json({ msg: "There are no products" });
      } else {
        res.status(200).json({ data: products });
      }
    } catch (err) {
      res.status(500).json(err);
    }
  };

  getProductsCategory = async (req: Request, res: Response) => {
    const currentPage: any = req.query.page || 1;
    const perpage = 6;
    let totalItems: number;
    var count = await productModel
      .find({ category: req.params.category })
      .countDocuments();
    totalItems = count;

    var products = await productModel
      .find({ category: req.params.category })
      .skip((currentPage - 1) * perpage)
      .limit(perpage)
      .sort({ createdAt: "desc" });
    try {
      if (!products) {
        res.status(400).json({ msg: "There are no products" });
      } else {
        res.status(200).json({ data: products, totalItems });
      }
    } catch (err) {
      res.status(500).json(err);
    }
  };

  getProduct = async (req: Request, res: Response) => {
    try {
      var product = await productModel.findById(req.params.id);
      var isSold = false;
      if (product?.prodNum === 0) {
        isSold = true;
      }
      if (!product) {
        res.status(400).json({ msg: "Product not found" });
      } else {
        res.status(200).json({ data: product, soldOut: isSold });
      }
    } catch (err) {
      res.status(500).json(err);
    }
  };

  getLatestProducts = async (req: Request, res: Response) => {
    var products = await productModel.find().sort({ updatedAt: -1 }).limit(6);
    try {
      res.status(200).json({ data: products });
    } catch (e) {
      res.status(400).json(e);
    }
  };

  editProduct = async (req: Request, res: Response) => {
    const data = {
      body: req.body,
      id: req.params.id,
    };
    try {
      var product = await productModel.findByIdAndUpdate(data.id, data.body);

      if (!product)
        return res.status(400).json({ msg: "something went wrong" });

      res.status(201).json({ msg: "success" });
    } catch (err) {
      res.status(500).json(err);
    }
  };

  //delete product
  deleteProduct = async (req: Request, res: Response) => {
    if (!req.params.id)
      return res.status(400).json({ msg: "provide a valid id param" });
    var productFetched = await productModel.findById(req.params.id);
    if (productFetched)
      //delete image from cloudinary
      await cloudinaryConfig.uploader.destroy(productFetched._id);

    try {
      var product = await productModel.findByIdAndDelete(req.params.id);

      if (!product) {
        res.status(400).json({ msg: "something went wrong" });
      } else {
        res.status(201).json({ msg: "success" });
      }
    } catch (err) {
      res.status(500).json(err);
    }
  };

  //Add to cart
  addToCart = async (req: Request, res: Response) => {
    const prodId = req.body.productId;
    const userId = req.body.id;
    const user = await userModel.findOne({ _id: userId });
    if (!user) return res.status(400).json({ msg: "user not founnd" });
    try {
      var product = await productModel.findById(prodId);
      if (!product)
        return res
          .status(400)
          .json({ msg: "An error occured while adding to cart." });

      var result = await user.addToCart(product);
      product.prodNum = product.prodNum - 1;
      await product.save();
      res.status(201).json({ data: result });
    } catch (err) {
      res.status(500).json(err);
    }
  };

  removeFromCart = async (req: Request, res: Response) => {
    const prodId = req.body.productId;
    const userId = req.body.id;
    try {
      var user = await userModel.findOne({ _id: userId });
      if (!user) return res.status(400).json({ msg: "cannot find user" });

      var product = await productModel.findById(prodId);

      if (!product)
        return res
          .status(400)
          .json({ msg: "An error occured while removing from cart" });

      product.prodNum = product.prodNum + 1;

      var success = user.removeFromCart(prodId);
      product = await product.save();
      if (!success)
        return res.status(400).json({ msg: "something went wrong." });

      res.status(200).json({ data: product });
    } catch (err) {
      res.status(500).json(err);
    }
  };

  getCart = async (req: Request, res: Response) => {
    const userId = req.body.id;
    try {
      var user = await userModel.findOne({ _id: userId });
      if (!user)
        return res.status(400).json({ msg: "user could not be found" });
      // var cart = user.cart;
      var getProduct = await user.populate("cart.items.productId");
      const product: any = getProduct.cart.items;
      res.status(200).json({ data: product });
    } catch (err) {
      res.status(500).json(err);
    }
  };

  postOrders = async (req: Request, res: Response) => {
    const userId = req.body.id;
    try {
      var user = await userModel.findOne({ _id: userId });
      if (!user) return res.status(400).json({ msg: "user not found!" });
      var populateItems = await user.populate("cart.items.productId");

      if (!populateItems)
        return res.status(400).json({ msg: "something went wrong" });
      const products: any = user.cart.items.map((i: any) => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      let order: Ipurchase = new purchaseModel({
        user: {
          email: user.email,
          userId: user._id,
        },
        products: products,
      });
      order = await order.save();
      if (order) {
        var clear = await user.clearCart();
        if (!clear)
          return res.status(400).json({ msg: "canot clear user cart" });
        var emailVar = await mailFunc({
          to: "adminemail@gmail.com",
          from: process.env.EMAIL_ACCOUNT,
          subject: "Proof of payment",
          html: `
                  ${user.email}has just purchased from your online shop.
                  visit the website for better details.....<a href="https://localhost:1818/dashboard">click here</a> 
                  `,
        });
        return res.status(200).json({ msg: "success", data: order });
      }
    } catch (err) {
      res.status(500).json(err);
    }
  };

  getInvoice = async (req: Request, res: Response) => {
    var order = await purchaseModel.findById(req.params.id);

    if (!order) return res.status(400).json({ msg: "no order's found" });

    // if (order.user.userId.toString() !== req.body.id.toString()) {
    //   return res.status(403).json({ msg: "Unauthorised" });
    // }

    const invoiceName = `invoice-${req.params.id.toString()}.pdf`;
    const invoicePath = path.resolve(
      process.cwd(),
      "assets",
      "data",
      invoiceName
    );

    const pdfDoc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'inline; filename=" ' + invoiceName + ' "'
    );
    pdfDoc.pipe(fs.createWriteStream(invoicePath));
    pdfDoc.pipe(res);

    pdfDoc.fontSize(26).text("Invoice", {
      underline: true,
    });

    pdfDoc.text("-----------------------");
    let totalPrice = 0;
    order.products.forEach((prod: any) => {
      totalPrice += prod.quantity * prod.product.price;
      pdfDoc
        .fontSize(14)
        .text(
          prod.product.name +
            " --- " +
            prod.quantity +
            " x " +
            "#" +
            prod.product.price
        );
    });

    pdfDoc.text("---");
    pdfDoc.fontSize(20).text("Total Price: #" + totalPrice);

    pdfDoc.end();
  };

  GetTotalOrders = async (req: Request, res: Response) => {
    var total = await purchaseModel.find().countDocuments();
    try {
      var orders = await purchaseModel.find().sort({ createdAt: -1 }).limit(20);

      const data = {
        total,
        orders,
      };

      res.status(200).json({ data });
    } catch (error) {
      res.status(400).json({ error });
    }
  };
}

const prodController = new productsController();

export default prodController;
