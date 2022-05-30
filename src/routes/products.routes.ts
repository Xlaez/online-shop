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
    this.router.route("/get").post(prodController.getCart);
    // this.router.route("/get_form/:id").get(prodController.sendForm);
    this.router
      .route("/:id")
      .get(prodController.getProduct)
      .put(prodController.editProduct)
      .delete(validationToken.TokenValidation, prodController.deleteProduct);
    this.router
      .route("/add")
      .post(validationToken.TokenValidation, prodController.addToCart);
    this.router
      .route("/remove")
      .post(validationToken.TokenValidation, prodController.removeFromCart);
    this.router
      .route("/orders")
      .post(validationToken.TokenValidation, prodController.postOrders);
    this.router
      .route("/invoice/:id")
      .get(validationToken.TokenValidation, prodController.getInvoice);
  }
}

export default new prodRouter().router;
