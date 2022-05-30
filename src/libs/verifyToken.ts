import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
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
        // console.log(process.env["SECRET_TOKEN"]);

        const payload = jwt.verify(
          token,
          process.env["SECRET_TOKEN"] || "defaultToken"
        ) as IPayload;
        // var tok = payload._id;
        req.body.id = payload._id;
        next();
      }
    } catch (err) {
      res.status(403).json({ msg: "Invalid token" });
    }
  };
}

const validationToken = new ValidationToken();
export default validationToken;
