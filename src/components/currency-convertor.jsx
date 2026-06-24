import { useEffect, useState } from "react";
import CurrencyDropdown from "./dropdown";
import { HiArrowsRightLeft } from "react-icons/hi2";

const CurrencyConverter = () => {
  const [currencies, setCurrencies] = useState([]);
  const [amount, setAmount] = useState(1);
  const [fromCurrency, setFromCurrency] = useState("EUR");
  const [toCurrency, setToCurrency] = useState("INR");
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [converting, setConverting] = useState(false);

  const [favorites, setFavorites] = useState(
    JSON.parse(localStorage.getItem("favorites")) || ["INR", "EUR"],
  );

  // Fetch currencies
  const fetchCurrencies = async () => {
    try {
      const res = await fetch("http://localhost:5000/currencies");
      const data = await res.json();

      setCurrencies(data.map((c) => c.code));
    } catch (error) {
      console.error(error);
    }
  };

  // Convert currency
  const convertCurrency = async () => {
    if (!amount) return;

    setConverting(true);

    try {
      const res = await fetch(
        `http://localhost:5000/convert?from=${fromCurrency}&to=${toCurrency}&amount=${amount}`,
      );

      const data = await res.json();

      setConvertedAmount(`${data.result} ${toCurrency}`);
    } catch (error) {
      console.error(error);
    } finally {
      setConverting(false);
    }
  };

  useEffect(() => {
    fetchCurrencies();
  }, []);

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

  return (
    <div className="max-w-xl mx-auto my-10 p-5 bg-white rounded-lg shadow-md">
      <h2 className="mb-5 text-2xl font-semibold text-gray-700">
        Currency Converter
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
        <CurrencyDropdown
          favorites={favorites}
          currencies={currencies}
          title="From:"
          currency={fromCurrency}
          setCurrency={setFromCurrency}
          handleFavorite={handleFavorite}
        />

        <div className="flex justify-center -mb-5 sm:mb-0">
          <button
            onClick={swapCurrencies}
            className="p-2 bg-gray-200 rounded-full hover:bg-gray-300"
          >
            <HiArrowsRightLeft className="text-xl text-gray-700" />
          </button>
        </div>

        <CurrencyDropdown
          favorites={favorites}
          currencies={currencies}
          title="To:"
          currency={toCurrency}
          setCurrency={setToCurrency}
          handleFavorite={handleFavorite}
        />
      </div>

      <div className="mt-4">
        <label
          htmlFor="amount"
          className="block text-sm font-medium text-gray-700"
        >
          Amount:
        </label>

        <input
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          type="number"
          min="1"
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mt-1"
        />
      </div>

      <div className="flex justify-end mt-6">
        <button
          onClick={convertCurrency}
          className={`px-5 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700
          ${converting ? "animate-pulse" : ""}`}
        >
          Convert
        </button>
      </div>

      {convertedAmount && (
        <div className="mt-4 text-lg font-medium text-right text-green-600">
          {amount} {fromCurrency} = {convertedAmount}
        </div>
      )}
    </div>
  );
};

export default CurrencyConverter;
