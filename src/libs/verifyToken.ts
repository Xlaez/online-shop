import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import userModel from "../model/userModel";
dotenv.config();
export interface IPayload {
  _id: string;
  iat: number;
  exp: number;
}

class ValidationToken {
  constructor() {}

  TokenValidation: any = (req: Request, res: Response, next: NextFunction) => {
    try {
      var token = req.get("Authorization");
      if (!token) {
        res.status(403).json({ msg: "Access denied" });
      } else {
        const payload = jwt.verify(
          token,
          process.env["SECRET_TOKEN"] || "defaultToken"
        ) as IPayload;
        req.body.id = payload._id;
        next();
      }
    } catch (err) {
      res.status(403).json({ msg: "Invalid token" });
    }
  };
  IsAdmin: any = async (req: Request, res: Response, next: NextFunction) => {
    var id = req.body.id;
    if (!id) return res.status(403).json({ msg: "unauthorized" });
    var user = await userModel.findById(id);

    try {
      if (user?.email !== "admin2@gmail.com")
        return res.status(400).send("unauthorized");
      next();
    } catch (error) {
      res.status(403).json({ msg: "unauthorized" });
    }
  };
}

const validationToken = new ValidationToken();
export default validationToken;
