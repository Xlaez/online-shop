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
      .route("/display")
      .get(
        validationToken.TokenValidation,
        prodController.getProductsForStoreDisplay
      );
    this.router.route("/exclusive").get(prodController.getExclusiveProducts);
    this.router
      .route("/get")
      .get(validationToken.TokenValidation, prodController.getCart);
    this.router.route("/latest").get(prodController.getLatestProducts);
    this.router
      .route("/:id")
      .get(prodController.getProduct)
      .put(prodController.editProduct)
      .delete(
        validationToken.TokenValidation,
        validationToken.IsAdmin,
        prodController.deleteProduct
      );
    this.router
      .route("/all/category/:category")
      .get(prodController.getProductsCategory);
    this.router
      .route("/category/:category")
      .get(prodController.getSimilarProducts);
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
      .route("/total/orders")
      .post(
        validationToken.TokenValidation,
        validationToken.IsAdmin,
        prodController.GetTotalOrders
      );
    this.router.route("/invoice/:id").get(prodController.getInvoice);
  }
}

export default new prodRouter().router;
