import Joi from "@hapi/joi";
import { Iuser } from "../model/userModel";

class JoiValidate {
  constructor() {}

  //signup verification
  signupValidation = (data: Iuser) => {
    const userSchema = Joi.object({
      name: Joi.string().required(),
      mobile: Joi.string().required(),
      email: Joi.string().required(),
      password: Joi.string().required(),
    });
    return userSchema.validate(data);
  };

  //login verfication
  loginVerification = (data: Iuser) => {
    const userSchema = Joi.object({
      email: Joi.string().required(),
      password: Joi.string().required(),
    });
    return userSchema.validate(data);
  };
}

const JoiValidation = new JoiValidate();
export default JoiValidation;
