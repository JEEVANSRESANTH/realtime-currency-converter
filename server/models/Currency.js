import mongoose from "mongoose";

const currencySchema = new mongoose.Schema({
  code: String,
  name: String,
  rate: Number,
});

export default mongoose.model("Currency", currencySchema);
