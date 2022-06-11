import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { array, Schema } from "@hapi/joi";

export interface Iuser extends mongoose.Document {
  name: string;
  mobile: string;
  email: string;
  password: string;
  resetToken: string | null;
  resetTokenExpDate: number | null;
  cart: any;
  encryptPassword(password: string): Promise<string>;
  validatePassword(password: string): Promise<boolean>;
  addToCart(product: object): Promise<string | boolean>;
  removeFromCart(product: object): Promise<string>;
  clearCart: Function;
}

const schema: any = mongoose.Schema;

const userschema = new schema(
  {
    name: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
      required: true,
    },
    email: {
      type: String,
    },
    password: {
      type: String,
      required: true,
      min: 5,
    },
    resetToken: {
      type: String,
    },
    resetTokenExpDate: Date,
    cart: {
      items: [
        {
          productId: {
            type: schema.Types.ObjectId,
            ref: "products",
            required: true,
          },
          quantity: { type: Number, required: true },
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

userschema.methods.encryptPassword = async (
  password: string
): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hashSync(password, salt);
};
userschema.methods.validatePassword = async function (
  password: string
): Promise<Boolean> {
  return bcrypt.compareSync(password, this.password);
};
userschema.methods.addToCart = function (
  product: any
): Promise<string | boolean> {
  const cartProductIndex = this.cart.items.findIndex((cp: any) => {
    return cp.productId.toString() === product._id.toString();
  });
  let newQuantity = 1;
  const updatedCartItems = [...this.cart.items];

  if (cartProductIndex >= 0) {
    newQuantity = this.cart.items[cartProductIndex].quantity + 1;
    updatedCartItems[cartProductIndex].quantity = newQuantity;
  } else {
    updatedCartItems.push({
      productId: product._id,
      quantity: newQuantity,
    });
  }
  const updatedCart = {
    items: updatedCartItems,
  };
  this.cart = updatedCart;
  return this.save();
};
userschema.methods.removeFromCart = function (productId: any): Promise<string> {
  const updatedCartItems = this.cart.items.filter((item: any) => {
    return item.productId.toString() !== productId.toString();
  });
  this.cart.items = updatedCartItems;
  return this.save();
};
userschema.methods.clearCart = function (): Function {
  this.cart = { items: [] };
  return this.save();
};
const userModel = mongoose.model<Iuser>("Users", userschema);

export default userModel;
