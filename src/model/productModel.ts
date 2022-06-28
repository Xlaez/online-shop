import mongoose from "mongoose";

export interface Iproduct extends mongoose.Document {
  name: string;
  descr: string;
  prodNum: number;
  isSoldOut: boolean;
  price: string;
  discount: number;
  image: string;
  category: string;
  newPrice: string;
  cloudinaryId: string;
}

const schema: any = mongoose.Schema;

const productSchema = new schema(
  {
    name: {
      type: String,
      required: true,
    },
    descr: {
      type: String,
    },
    prodNum: {
      type: Number,
      default: 0,
    },
    isSoldOut: {
      type: Boolean,
      default: false,
    },
    price: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: [true, "Most provide an image of type jpeg, jpg or png"],
    },
    cloudinaryId: {
      type: String,
    },
    discount: {
      type: Number,
    },
    category: String,
    newPrice: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

const productModel = mongoose.model<Iproduct>("products", productSchema);

export default productModel;
