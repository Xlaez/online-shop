import mongoose from "mongoose";

export interface IContact extends mongoose.Document {
  name: string;
  email: string;
  mobile: string;
  message: string;
}

const schema: any = mongoose.Schema;

const contactSchema = new schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      reqiured: true,
    },
    mobile: {
      type: String,
    },
    message: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const contactModel = mongoose.model<IContact>("Messages", contactSchema);

export default contactModel;
