import History from "../models/History.js";
import Currency from "../models/Currency.js";

export const getHistory = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === "user") {
      query.userId = req.user._id;
    }

    const history = await History.find(query)
      .populate("userId", "name email")
      .sort({ timestamp: -1 });

    res.json(history);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteHistory = async (req, res) => {
  try {
    const record = await History.findById(req.params.id);

    if (!record) {
      return res.status(404).json({ message: "History record not found" });
    }

    if (req.user.role === "user" && record.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await History.findByIdAndDelete(req.params.id);
    res.json({ message: "History record deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const convertAndSave = async (req, res) => {
  try {
    const { from, to, amount } = req.body;

    if (!from || !to || !amount) {
      return res.status(400).json({ message: "from, to, and amount are required" });
    }

    const fromCurrency = await Currency.findOne({ code: from.toUpperCase() });
    const toCurrency = await Currency.findOne({ code: to.toUpperCase() });

    if (!fromCurrency || !toCurrency) {
      return res.status(404).json({ message: "Currency not found" });
    }

    const usdAmount = Number(amount) / fromCurrency.rate;
    const converted = (usdAmount * toCurrency.rate).toFixed(2);

    const history = await History.create({
      userId: req.user._id,
      fromCurrency: fromCurrency.code,
      toCurrency: toCurrency.code,
      amount: Number(amount),
      convertedAmount: converted,
    });

    res.json({
      from: fromCurrency.code,
      to: toCurrency.code,
      amount: Number(amount),
      result: converted,
      history,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
