import { Router } from "express";
import prodController from "../controller/products.controller";
import validationToken from "../libs/verifyToken";

class prodRouter {
  router: Router;

  constructor() {
    this.router = Router();
    this.routes();
  }

  routes() {
    this.router
      .route("/")
      .post(prodController.createProduct)
      .get(prodController.getProducts);
    this.router
      .route("/:id")
      .get(prodController.getProduct)
      .put(prodController.editProduct)
      .delete(validationToken.TokenValidation, prodController.deleteProduct);
    this.router.route("/add").post(prodController.addToCart);
    this.router.route("/remove").post(prodController.removeFromCart);
    this.router.route("/get").get(prodController.getCart);
    this.router.route("/orders").post(prodController.postOrders);
  }
}

export default new prodRouter().router;
