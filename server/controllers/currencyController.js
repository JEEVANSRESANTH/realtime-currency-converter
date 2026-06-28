import Currency from "../models/Currency.js";
import { getIO } from "../socket/index.js";

const safeEmit = (event, data) => {
  try { getIO().emit(event, data); } catch (e) { /* socket not ready */ }
};

const emitRates = async () => {
  try {
    const currencies = await Currency.find().lean();
    safeEmit("rates:updated", currencies);
  } catch (e) {
    console.error("emitRates error:", e.message);
  }
};

export const getCurrencies = async (req, res) => {
  try {
    const currencies = await Currency.find();
    res.json(currencies);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const createCurrency = async (req, res) => {
  try {
    const { code, name, rate } = req.body;
    if (!code || !name || rate == null) {
      return res.status(400).json({ message: "Code, name, and rate are required" });
    }

    const existing = await Currency.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({ message: "Currency already exists" });
    }

    const currency = await Currency.create({ code: code.toUpperCase(), name, rate, lastUpdated: new Date() });
    res.status(201).json(currency);
    emitRates();
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateCurrency = async (req, res) => {
  try {
    const { code, name, rate } = req.body;
    const existing = await Currency.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: "Currency not found" });
    }

    const update = {};
    if (code) update.code = code.toUpperCase();
    if (name) update.name = name;
    if (rate != null) {
      update.previousRate = existing.rate;
      update.rate = rate;
      update.lastUpdated = new Date();
    }

    const currency = await Currency.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    res.json(currency);
    emitRates();
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteCurrency = async (req, res) => {
  try {
    const currency = await Currency.findByIdAndDelete(req.params.id);
    if (!currency) {
      return res.status(404).json({ message: "Currency not found" });
    }
    res.json({ message: "Currency deleted successfully" });
    emitRates();
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const convertCurrency = async (req, res) => {
  try {
    const { from, to, amount } = req.query;

    if (!from || !to || !amount) {
      return res.status(400).json({ message: "from, to, and amount are required" });
    }

    const fromCurrency = await Currency.findOne({ code: from.toUpperCase() });
    const toCurrency = await Currency.findOne({ code: to.toUpperCase() });

    if (!fromCurrency || !toCurrency) {
      return res.status(404).json({ message: "Currency not found" });
    }

    const usdAmount = Number(amount) / fromCurrency.rate;
    const converted = usdAmount * toCurrency.rate;

    res.json({
      from: fromCurrency.code,
      to: toCurrency.code,
      amount: Number(amount),
      result: converted.toFixed(2),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const seedCurrencies = async (req, res) => {
  try {
    await Currency.deleteMany({});

    const now = new Date();
    const currencies = [
      { code: "USD", name: "US Dollar", rate: 1, previousRate: null, lastUpdated: now },
      { code: "EUR", name: "Euro", rate: 0.92, previousRate: null, lastUpdated: now },
      { code: "GBP", name: "British Pound", rate: 0.79, previousRate: null, lastUpdated: now },
      { code: "INR", name: "Indian Rupee", rate: 85.5, previousRate: null, lastUpdated: now },
      { code: "JPY", name: "Japanese Yen", rate: 146.2, previousRate: null, lastUpdated: now },
      { code: "AUD", name: "Australian Dollar", rate: 1.53, previousRate: null, lastUpdated: now },
      { code: "CAD", name: "Canadian Dollar", rate: 1.37, previousRate: null, lastUpdated: now },
      { code: "CHF", name: "Swiss Franc", rate: 0.88, previousRate: null, lastUpdated: now },
      { code: "CNY", name: "Chinese Yuan", rate: 7.17, previousRate: null, lastUpdated: now },
      { code: "SGD", name: "Singapore Dollar", rate: 1.29, previousRate: null, lastUpdated: now },
      { code: "NZD", name: "New Zealand Dollar", rate: 1.67, previousRate: null, lastUpdated: now },
      { code: "HKD", name: "Hong Kong Dollar", rate: 7.84, previousRate: null, lastUpdated: now },
      { code: "SEK", name: "Swedish Krona", rate: 10.6, previousRate: null, lastUpdated: now },
      { code: "NOK", name: "Norwegian Krone", rate: 10.8, previousRate: null, lastUpdated: now },
      { code: "DKK", name: "Danish Krone", rate: 6.86, previousRate: null, lastUpdated: now },
      { code: "ZAR", name: "South African Rand", rate: 18.1, previousRate: null, lastUpdated: now },
      { code: "BRL", name: "Brazilian Real", rate: 5.42, previousRate: null, lastUpdated: now },
      { code: "MXN", name: "Mexican Peso", rate: 18.9, previousRate: null, lastUpdated: now },
      { code: "KRW", name: "South Korean Won", rate: 1385.0, previousRate: null, lastUpdated: now },
      { code: "TRY", name: "Turkish Lira", rate: 39.4, previousRate: null, lastUpdated: now },
    ];

    await Currency.insertMany(currencies);
    res.json({ message: "Currencies seeded successfully" });
    emitRates();
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
