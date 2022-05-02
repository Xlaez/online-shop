import { Router } from "express";
import authController from "../controller/auth.controller";
import validationToken from "../libs/verifyToken";

class authRouter {
  router: Router;

  constructor() {
    this.router = Router();
    this.routes();
  }

  routes() {
    this.router
      .route("/")
      .post(authController.Signup)
      .get(validationToken.TokenValidation, authController.GetUsers);
    this.router
      .route("/:id")
      .get(validationToken.TokenValidation, authController.GetUser);
    this.router.route("/login").post(authController.Login);
    this.router.route("/reset").post(authController.Reset);
    this.router.route("/new_pass/:token").post(authController.ChangePassword);
  }
}

export default new authRouter().router;
