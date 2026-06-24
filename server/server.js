import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import Currency from "./models/Currency.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
mongoose
  .connect("mongodb://127.0.0.1:27017/currencydb")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
app.get("/", (req, res) => {
  res.send("Currency API Running 🚀");
});

app.get("/seed", async (req, res) => {
  await Currency.deleteMany({});

  await Currency.insertMany([
    { code: "USD", name: "US Dollar", rate: 1 },
    { code: "EUR", name: "Euro", rate: 0.92 },
    { code: "GBP", name: "British Pound", rate: 0.79 },
    { code: "INR", name: "Indian Rupee", rate: 85.5 },
    { code: "JPY", name: "Japanese Yen", rate: 146.2 },
    { code: "AUD", name: "Australian Dollar", rate: 1.53 },
    { code: "CAD", name: "Canadian Dollar", rate: 1.37 },
    { code: "CHF", name: "Swiss Franc", rate: 0.88 },
    { code: "CNY", name: "Chinese Yuan", rate: 7.17 },
    { code: "SGD", name: "Singapore Dollar", rate: 1.29 },
    { code: "NZD", name: "New Zealand Dollar", rate: 1.67 },
    { code: "HKD", name: "Hong Kong Dollar", rate: 7.84 },
    { code: "SEK", name: "Swedish Krona", rate: 10.6 },
    { code: "NOK", name: "Norwegian Krone", rate: 10.8 },
    { code: "DKK", name: "Danish Krone", rate: 6.86 },
    { code: "ZAR", name: "South African Rand", rate: 18.1 },
    { code: "BRL", name: "Brazilian Real", rate: 5.42 },
    { code: "MXN", name: "Mexican Peso", rate: 18.9 },
    { code: "KRW", name: "South Korean Won", rate: 1385.0 },
    { code: "TRY", name: "Turkish Lira", rate: 39.4 },
  ]);

  res.send("Currencies Seeded");
});
app.get("/currencies", async (req, res) => {
  const currencies = await Currency.find();
  res.json(currencies);
});
app.get("/convert", async (req, res) => {
  const { from, to, amount } = req.query;

  const fromCurrency = await Currency.findOne({ code: from });
  const toCurrency = await Currency.findOne({ code: to });

  if (!fromCurrency || !toCurrency) {
    return res.status(404).json({
      message: "Currency not found",
    });
  }

  const usdAmount = amount / fromCurrency.rate;
  const converted = usdAmount * toCurrency.rate;

  res.json({
    from,
    to,
    amount,
    result: converted.toFixed(2),
  });
});
