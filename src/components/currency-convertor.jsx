import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CurrencyDropdown from "./dropdown";
import { useSocket } from "../context/SocketContext";
import { ArrowLeftRight, RefreshCw, ArrowRight, Sparkles } from "lucide-react";
import { ConverterSkeleton } from "./ui/Skeleton";

const CurrencyConverter = () => {
  const { rates } = useSocket();
  const [currencies, setCurrencies] = useState([]);
  const [amount, setAmount] = useState(1);
  const [fromCurrency, setFromCurrency] = useState("EUR");
  const [toCurrency, setToCurrency] = useState("INR");
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [converting, setConverting] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [amountFocused, setAmountFocused] = useState(false);

  const [favorites, setFavorites] = useState(
    JSON.parse(localStorage.getItem("favorites")) || ["INR", "EUR"],
  );

  const fetchCurrencies = async () => {
    try {
      const res = await fetch("/api/currencies");
      const data = await res.json();
      setCurrencies(data.map((c) => c.code));
      setLoaded(true);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (rates.length > 0) {
      setCurrencies(rates.map((r) => r.code));
      setLoaded(true);
    } else {
      fetchCurrencies();
    }
  }, [rates]);

  const getRate = useCallback(
    (code) => {
      const c = rates.find((r) => r.code === code);
      return c ? c.rate : null;
    },
    [rates],
  );

  const convertCurrency = useCallback(async () => {
    if (!amount) return;
    setConverting(true);

    const fromRate = getRate(fromCurrency);
    const toRate = getRate(toCurrency);

    if (fromRate && toRate) {
      const usdAmount = Number(amount) / fromRate;
      const result = (usdAmount * toRate).toFixed(2);
      await new Promise((r) => setTimeout(r, 300));
      setConvertedAmount(`${result} ${toCurrency}`);
      setConverting(false);
      return;
    }

    try {
      const res = await fetch(
        `/api/currencies/convert?from=${fromCurrency}&to=${toCurrency}&amount=${amount}`,
      );
      const data = await res.json();
      await new Promise((r) => setTimeout(r, 300));
      setConvertedAmount(`${data.result} ${toCurrency}`);
    } catch (error) {
      console.error(error);
    } finally {
      setConverting(false);
    }
  }, [amount, fromCurrency, toCurrency, getRate]);

  useEffect(() => {
    if (rates.length > 0 && amount && loaded) {
      convertCurrency();
    }
  }, [rates, fromCurrency, toCurrency, loaded]);

  const handleFavorite = (currency) => {
    let updatedFavorites = [...favorites];
    if (favorites.includes(currency)) {
      updatedFavorites = updatedFavorites.filter((fav) => fav !== currency);
    } else {
      updatedFavorites.push(currency);
    }
    setFavorites(updatedFavorites);
    localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
  };

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  if (!loaded) return <ConverterSkeleton />;

  return (
    <div className="relative">
      <div className="blob w-72 h-72 bg-indigo-500 top-[-100px] right-[-100px]" />
      <div className="blob w-96 h-96 bg-purple-500 bottom-[-150px] left-[-150px]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative glass-strong rounded-2xl p-6 sm:p-8 max-w-xl mx-auto shadow-2xl shadow-indigo-500/10 dark:shadow-indigo-500/5"
      >
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3 mb-6"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Currency Converter
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Real-time exchange rates
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-[1fr,auto,1fr] gap-4 items-end">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <CurrencyDropdown
              favorites={favorites}
              currencies={currencies}
              title="From"
              currency={fromCurrency}
              setCurrency={setFromCurrency}
              handleFavorite={handleFavorite}
            />
          </motion.div>

          <div className="flex justify-center">
            <motion.button
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              onClick={swapCurrencies}
              className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 transition-shadow"
            >
              <ArrowLeftRight className="w-5 h-5" />
            </motion.button>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <CurrencyDropdown
              favorites={favorites}
              currencies={currencies}
              title="To"
              currency={toCurrency}
              setCurrency={setToCurrency}
              handleFavorite={handleFavorite}
            />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mt-5"
        >
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">
            Amount
          </label>
          <div
            className={`relative transition-all duration-200 rounded-xl ${
              amountFocused ? "ring-2 ring-indigo-500/50" : ""
            }`}
          >
            <input
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              onFocus={() => setAmountFocused(true)}
              onBlur={() => setAmountFocused(false)}
              type="number"
              min="1"
              className="w-full px-4 py-3.5 bg-white dark:bg-slate-800/50 border-2 border-gray-200 dark:border-slate-700 rounded-xl text-xl font-semibold text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500
                         focus:outline-none focus:border-indigo-500
                         transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex justify-end mt-5"
        >
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={convertCurrency}
            disabled={converting || !amount}
            className="btn-primary flex items-center gap-2 text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {converting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
            {converting ? "Converting..." : "Convert"}
          </motion.button>
        </motion.div>

        <AnimatePresence mode="wait">
          {convertedAmount && (
            <motion.div
              key={convertedAmount}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="mt-5 p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-500/10 dark:to-emerald-500/10 border border-green-200/50 dark:border-green-500/20"
            >
              <p className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wider mb-1">
                Converted Amount
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {amount} {fromCurrency}
                </span>
                <span className="text-gray-400">=</span>
                <span className="text-2xl font-bold text-green-700 dark:text-green-300 font-mono">
                  {convertedAmount}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default CurrencyConverter;
