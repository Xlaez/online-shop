import { Request, Response } from "express";
import productModel, { Iproduct } from "../model/productModel";
import purchaseModel, { Ipurchase } from "../model/purchaseModel";
import userModel from "../model/userModel";

class productsController {
  constructor() {}
  //Admin functionality
  createProduct = async (req: Request, res: Response) => {
    const data = {
      body: req.body,
      file: req.file,
    };
    console.log(data.file);
    if (!data.file || !data.body)
      return res.status(400).json({ msg: "Provide data for all fields" });
    try {
      var newProd: Iproduct = new productModel({
        ...data.body,
        image: data.file.path,
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
    try {
      var products = await productModel.find().sort({ category: "desc" });

      if (!products) {
        res.status(400).json({ msg: "There are no products" });
      } else {
        res.status(200).json({ data: products });
      }
    } catch (err) {
      res.status(500).json(err);
    }
  };

  getProduct = async (req: Request, res: Response) => {
    try {
      var product = await productModel.findById(req.params.id);

      if (!product) {
        res.status(400).json({ msg: "Product not found" });
      } else {
        if (product.discount > 0) {
          var discount = product.discount;
          var solve: number = discount / 100;
          const newAmount: number = solve * Number(product.price);
          const data = {
            product,
            newPrice: (Number(product.price) - newAmount).toString(),
          };
          res.status(200).json({ data });
        }
      }
    } catch (err) {
      res.status(500).json(err);
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
    const userId = req.get("useraccess");
    const user = await userModel.findOne({ _id: userId });
    if (!user) return res.status(400).json({ msg: "user not founnd" });
    try {
      var product = await productModel.findById(prodId);
      if (!product)
        return res
          .status(400)
          .json({ msg: "An error occured while adding to cart." });

      var result = await user.addToCart(product);

      res.status(201).json({ data: result });
    } catch (err) {
      res.status(500).json(err);
    }
  };

  removeFromCart = async (req: Request, res: Response) => {
    const prodId = req.body.productId;
    const userId = req.get("useraccess");
    try {
      var user = await userModel.findOne({ _id: userId });
      if (!user) return res.status(400).json({ msg: "cannot find user" });

      var success = user.removeFromCart(prodId);
      if (!success)
        return res.status(400).json({ msg: "something went wrong." });

      res.status(200).json({ msg: "success" });
    } catch (err) {
      res.status(500).json(err);
    }
  };

  getCart = async (req: Request, res: Response) => {
    const userId = req.get("useraccess");
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
    const userId = req.get("user-access");
    try {
      var user = await userModel.findOne({ _id: userId });
      if (!user) return res.status(400).json({ msg: "user not found!" });
      var populateItems = user.populate("cart.items.prodctId");

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
        return res.status(200).json({ msg: "success", data: clear });
      }
    } catch (err) {
      res.status(500).json(err);
    }
  };
}

const prodController = new productsController();

export default prodController;
