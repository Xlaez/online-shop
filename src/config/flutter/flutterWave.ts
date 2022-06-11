// import FlutterWave from "flutterwave-node-v3";
// import { config } from "dotenv";
// import path from "path";
// // import open from 'open'
// config({ path: path.resolve(process.cwd(), ".env") });

// const flw = new FlutterWave(
//   process.env["FLUTTER_WAVE_PUBLIC_KEY"],
//   process.env["FLUTTER_WAVE_SECRET_KEY"]
// );

// const payload = {
//   card_number: "",
//   cvv: "",
//   expiry_month: "",
//   expiry_year: "",
//   currency: "NGN",
//   amount: "",
//   redirect_url: "",
//   fullname: "",
//   email: "",
//   phone_number: "",
//   enckey: "",
// };

// const chargeCard = async () => {
//   try {
//     const response = await flw.Charge.card(payload);
//     console.log(response);
//     if (response.meta.authorization.mode === "pin") {
//       let payload2 = payload;
//       payload2.authorization = {
//         mode: "pin",
//         fields: ["pin"],
//         pin: 3310,
//       };
//       const reCallCharge = await flw.Charge.card(payload2);

//       const callValidate = await flw.Charge.validate({
//         otp: "12345",
//         flw_ref: reCallCharge.data.flw_ref,
//       });
//       console.log(callValidate);
//     }
//     if (response.meta.authorization.mode === "redirect") {
//       var url = response.meta.authorization.redirect;
//       open(url);
//     }

//     console.log(response);
//   } catch (error) {
//     console.log(error);
//   }
// };

// const charge_ng_acct = async () => {
//   try {
//     const payload = {
//       tx_ref: "MC-1585dshdhdsdv5050e8", //This is a unique reference, unique to the particular transaction being carried out. It is generated when it is not provided by the merchant for every transaction.
//       amount: "", //This is the amount to be charged.
//       account_bank: "", //This is the Bank numeric code. You can get a list of supported banks and their respective codes Here: https://developer.flutterwave.com/v3.0/reference#get-all-banks
//       account_number: "",
//       currency: "",
//       email: "",
//       phone_number: "", //This is the phone number linked to the customer's mobile money account
//       fullname: "",
//     };

//     const response = await flw.Charge.ng(payload);
//     console.log(response);
//   } catch (error) {
//     console.log(error);
//   }
// };
