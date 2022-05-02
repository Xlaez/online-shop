import mongoose from "mongoose";

export interface Ipurchase extends mongoose.Document {
  products: any;
  user: any;
}

const schema: any = mongoose.Schema;

const purchaseSchema = new schema(
  {
    products: [
      {
        product: {
          type: Object,
          required: true,
        },
      },
    ],
    user: {
      email: {
        type: String,
        required: true,
      },
      userId: {
        type: schema.Types.ObjectId,
        required: true,
        ref: "Users",
      },
    },
  },
  {
    timestamps: true,
  }
);

const purchaseModel = mongoose.model<Ipurchase>("Purchase", purchaseSchema);

export default purchaseModel;
