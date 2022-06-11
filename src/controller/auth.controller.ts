import { Request, Response } from "express";
import userModel, { Iuser } from "../model/userModel";
import crypto from "crypto";
import path from "path";
import jwt from "jsonwebtoken";
import JoiValidation from "../libs/joiValidation";
import sort_Page from "../libs/utils";
import { config } from "dotenv";
import mailFunc from "../config/mail";
config({ path: path.resolve(process.cwd(), ".env") });

class userController {
  constructor() {}

  //Jwt token middleware
  getToken = (user: any) => {
    return jwt.sign(
      { _id: user._id },
      process.env.SECRET_TOKEN || "defaultToken",
      {
        expiresIn: 60 * 60 * 24,
      }
    );
  };
  getRefreshToken = (user: any) => {
    return jwt.sign(
      { _id: user._id, email: user.email },
      process.env.REFRESH_TOKEN || "defaultTokenRefresh",
      { expiresIn: 60 * 60 * 60 * 24 * 7 }
    );
  };
  //signup
  Signup = async (req: Request, res: Response, body: any) => {
    //validate signup
    const { error } = JoiValidation.signupValidation(req.body);
    if (error) return res.status(400).json({ msg: error.message });

    //search for potential existence of user
    const isUser = await userModel.findOne({
      email: req.body.email,
    });

    if (isUser)
      return res
        .status(400)
        .json({ msg: "user already exist, try another email" });

    try {
      const user: Iuser = new userModel({
        ...req.body,
      });

      user.password = await user.encryptPassword(req.body.password);
      let newUser = await user.save();
      const data = {
        token: this.getToken(user),
        refreshToken: this.getRefreshToken(user),
        userId: newUser._id,
      };
      return res.status(201).json({ data });
    } catch (err) {
      res.status(500).json({ msg: err });
    }
  };

  //login
  Login = async (req: Request, res: Response) => {
    //Login verification
    const { error } = JoiValidation.loginVerification(req.body);
    if (error)
      return res.status(400).json({ msg: "check the parameters again." });

    //validate
    const user = await userModel.findOne({
      email: req.body.email,
    });

    if (!user) {
      res.status(403).json({ msg: "user does not exist." });
    } else {
      //validate password
      const isvalidPassword: Boolean = await user.validatePassword(
        req.body.password
      );

      if (!isvalidPassword) {
        return res
          .status(403)
          .json({ msg: "A parameter provided is in correct" });
      }

      //create a token
      var token: string = this.getToken(user);
      //get user data
      const data = {
        _id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        token: token,
        refreshToken: this.getRefreshToken(user),
      };

      res.status(200).json({ data });
    }
  };

  //Send ciphered code to user for reset acc password
  Reset = async (req: Request, res: Response) => {
    try {
      crypto.randomBytes(32, async (err, buffer) => {
        if (err)
          return res
            .status(400)
            .json({ msg: "error occured while creating buffer" });

        var token = buffer.toString("hex");

        var user = await userModel.findOne({ email: req.body.email });

        if (!user) return res.status(400).json({ msg: "user does not exist" });

        user.resetToken = token;
        user.resetTokenExpDate = Date.now() + 3600000;

        var result = await user.save();

        if (result) {
          var link = `http://localhost:8088/new_pass/${token}`;
          var mailVar = await mailFunc({
            to: "xlaezkamou@gmail.com",
            from: process.env.EMAIL_ACCOUNT,
            subject: "Ecommerce website",
            html: `
            <h3>You reset password</h3>
            <hr/>
            <p>Click this <a href=${link}>Link</a> to reset your password</p>
            <small><bold>Note:</bold>this link expires in 60 minutes.</small>
             `,
          });
          if (mailVar) {
            res.status(200).json({ msg: "success", token });
          } else {
            res.status(400).json({ msg: "an error occured" });
          }
        } else {
          res.status(400).json({ msg: "something went wrong" });
        }
      });
    } catch (err) {
      res.status(500).json(err);
    }
  };

  //reset user password
  ChangePassword = async (req: Request, res: Response) => {
    const data = {
      newPassword: req.body.newPassword,
      userId: req.get("useraccess"),
      passwordToken: req.params.token,
    };

    try {
      var user = await userModel.findOne({
        resetToken: data.passwordToken,
        _id: data.userId,
        resetTokenExpDate: { $gt: Date.now() },
      });

      if (user) {
        var newPassword = await user.encryptPassword(data.newPassword);
        user.password = newPassword;
        user.resetToken = null;
        user.resetTokenExpDate = null;
        user = await user.save();
        res.status(201).json({ data: user._id });
      } else {
        res.status(400).json({ msg: "wrong params, request a reset again." });
      }
    } catch (err) {
      res.status(500).json(err);
    }
  };

  //Fetch a single user data by id
  GetUsers = async (req: Request, res: Response) => {
    try {
      var user = await userModel
        .find()
        .sort({ name: -1 })
        .select(["name", "email", "mobile"]);
      if (user) {
        res.status(200).json({ data: user });
      } else {
        res.status(400).json({ msg: "users not found" });
      }
    } catch (e) {
      res.status(500).json({ msg: e });
    }
  };

  GetUser = async (req: Request, res: Response) => {
    try {
      var user = await userModel
        .findById(req.params.id)
        .select(["name", "email", "mobile"]);

      if (user) {
        res.status(200).json({ data: user });
      } else {
        res.status(400).json({ msg: "User not found, check the parameters." });
      }
    } catch (err) {
      res.status(500).json(err);
    }
  };

  GetTotalUsers = async (req: Request, res: Response) => {
    var users = await userModel.find().countDocuments();
    try {
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ error });
    }
  };
}

const authController = new userController();

export default authController;
