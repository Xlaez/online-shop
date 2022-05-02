import nodemailer from "nodemailer";
import path from "path";
import Mail from "nodemailer/lib/mailer";
import dotenv from "dotenv";
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const transport = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.EMAIL_ACCOUNT,
    pass: process.env.EMAIL_PASS,
  },
  logger: true,
});

var mailFunc = function (data: any) {
  return transport.sendMail({ ...data, from: "Ecommerce website" });
};

export default mailFunc;
