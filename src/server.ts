import mongoose from "mongoose";
import express, { Application, Request, Response } from "express";
import * as dotenv from "dotenv";
import * as path from "path";
import multer from "multer";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import prodRoutes from "./routes/products.routes";
import multerOptions from "./libs/multerConfig";

class Server {
  public app: Application;

  constructor() {
    this.app = express();
    this.config();
  }

  public config(): void {
    //load env
    dotenv.config({ path: path.resolve(process.cwd(), ".env") });

    //Mongodb varaible for connection
    const url: any = process.env.MONGODB_URI;
    const option = {
      promiseLibrary: Promise,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };
    //set up mongoose
    const Mongo = mongoose.connect(url, option);
    console.log("======> connecting to database .....");

    Mongo.then((result) => {
      console.log("======> connected to database");
    }).catch((err) => {
      console.log("======>", err);
    });
    //config

    this.app.use(express.json({ limit: "25mb" }));
    this.app.use(express.urlencoded({ limit: "25mb", extended: true }));
    this.app.use(
      "assets/images",
      express.static(path.join(__dirname, "assets", "images"))
    );
    this.app.use(
      multer({
        storage: multerOptions.fileStorage,
        fileFilter: multerOptions.fileFilter,
      }).single("image")
    );

    this.app.use(
      cors({
        origin: "*",
        optionsSuccessStatus: 200,
      })
    );
  }

  public routes() {
    this.app.use("/api/auth", authRoutes);
    this.app.use("/api/prod", prodRoutes);
  }
}

export default new Server();
