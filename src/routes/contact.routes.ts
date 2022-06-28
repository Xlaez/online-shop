import { Router } from "express";
import contactController from "../controller/contact.controller";
import validationToken from "../libs/verifyToken";

class contactRouter {
  router: Router;

  constructor() {
    this.router = Router();
    this.routes();
  }

  routes() {
    this.router
      .route("/")
      .post(contactController.postMessages)
      .get(
        validationToken.TokenValidation,
        validationToken.IsAdmin,
        contactController.getMessage
      );
    this.router
      .route("/:id")
      .delete(
        validationToken.TokenValidation,
        validationToken.IsAdmin,
        contactController.deleteMessage
      )
      .get(
        validationToken.TokenValidation,
        validationToken.IsAdmin,
        contactController.getSingleMessgae
      );
  }
}

export default new contactRouter().router;
