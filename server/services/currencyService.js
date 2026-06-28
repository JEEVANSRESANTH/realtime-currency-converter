import Currency from "../models/Currency.js";

export const getAllCurrencies = () => Currency.find();

export const getCurrencyByCode = (code) =>
  Currency.findOne({ code: code.toUpperCase() });

export const createCurrency = (data) =>
  Currency.create({ code: data.code.toUpperCase(), name: data.name, rate: data.rate });

export const updateCurrencyById = (id, data) => {
  const update = {};
  if (data.code) update.code = data.code.toUpperCase();
  if (data.name) update.name = data.name;
  if (data.rate != null) update.rate = data.rate;
  return Currency.findByIdAndUpdate(id, update, { new: true, runValidators: true });
};

export const deleteCurrencyById = (id) =>
  Currency.findByIdAndDelete(id);

export const convert = async (fromCode, toCode, amount) => {
  const from = await getCurrencyByCode(fromCode);
  const to = await getCurrencyByCode(toCode);
  if (!from || !to) return null;
  const usdAmount = Number(amount) / from.rate;
  return (usdAmount * to.rate).toFixed(2);
};
