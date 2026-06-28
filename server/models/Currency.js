import mongoose from "mongoose";

const currencySchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  name: { type: String, required: true },
  rate: { type: Number, required: true },
  previousRate: { type: Number, default: null },
  lastUpdated: { type: Date, default: null },
});

export default mongoose.model("Currency", currencySchema);
