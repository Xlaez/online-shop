import { Request, Response } from "express";
import mailFunc from "../config/mail";
import path from "path";
import contactModel, { IContact } from "../model/contactModel";
import { config } from "dotenv";
config({ path: path.resolve(process.cwd(), ".env") });

class messagesController {
  constructor() {}

  postMessages = async (req: Request, res: Response) => {
    var body = req.body;

    let contact: IContact = new contactModel({
      ...body,
    });

    contact = await contact.save();

    if (contact) {
      var emailVar = await mailFunc({
        to: body.email,
        from: process.env.EMAIL_ACCOUNT,
        subject: "Ecommerce website",
        html: `
                  <h3>Notice Of Message</h3>
                  <br/>
                  <p> Dear ${body.name}, we have recievd your message and we will get back to you as soon as possible</p>
                  <br/>
                  <br/>
                  <small>Thank You</small>
                  `,
      });
      if (emailVar) return res.status(201).json({ msg: "success" });
    } else {
      res.status(400).json({ msg: "an error occured" });
    }
    if (!contact) {
      res.status(400).json("An error occured");
    } else {
      res.status(201).json({ msg: "success" });
    }
  };

  getMessage = async (req: Request, res: Response) => {
    var messages = await contactModel
      .find()
      .sort({ createdAt: -1 })
      .select(["name", "updatedAt"]);
    try {
      res.status(200).json({ data: messages });
    } catch (e) {
      res.status(400).json(e);
    }
  };

  deleteMessage = async (req: Request, res: Response) => {
    await contactModel.findByIdAndDelete(req.params.id);
    res.status(201).json({ msg: "success" });
  };

  getSingleMessgae = async (req: Request, res: Response) => {
    var message = await contactModel.findOne({ _id: req.params.id });

    try {
      if (message) return res.status(200).json({ data: message });
      if (!message) return res.status(400).json({ msg: "error" });
    } catch (e) {
      res.status(400).json(e);
    }
  };
}

const contactController = new messagesController();

export default contactController;
