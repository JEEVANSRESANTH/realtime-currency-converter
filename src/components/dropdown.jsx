import { motion } from "framer-motion";
import { Star } from "lucide-react";

const CurrencyDropdown = ({
  currencies,
  currency,
  setCurrency,
  favorites,
  handleFavorite,
  title = "",
}) => {
  const isFavorite = (curr) => favorites.includes(curr);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">
        {title}
      </label>

      <div className="relative group">
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className="w-full appearance-none pl-4 pr-10 py-3 bg-white dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-gray-100 font-medium
                     focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500
                     hover:border-gray-300 dark:hover:border-slate-600
                     transition-all duration-200 cursor-pointer"
        >
          {favorites.length > 0 && (
            <optgroup label="★ Favorites" className="font-semibold">
              {favorites.map((fav) => (
                <option className="bg-white dark:bg-slate-800" value={fav} key={fav}>
                  {fav}
                </option>
              ))}
            </optgroup>
          )}
          <optgroup label="All Currencies" className="font-semibold">
            {currencies
              .filter((c) => !favorites.includes(c))
              .map((cur) => (
                <option className="bg-white dark:bg-slate-800" value={cur} key={cur}>
                  {cur}
                </option>
              ))}
          </optgroup>
        </select>

        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={() => handleFavorite(currency)}
          className="absolute right-8 inset-y-0 flex items-center px-2 cursor-pointer z-10"
          title={isFavorite(currency) ? "Remove from favorites" : "Add to favorites"}
        >
          <motion.div
            animate={isFavorite(currency) ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            <Star
              className={`w-4 h-4 transition-colors duration-200 ${
                isFavorite(currency)
                  ? "fill-amber-400 text-amber-400"
                  : "text-gray-300 dark:text-gray-600 hover:text-amber-400"
              }`}
            />
          </motion.div>
        </motion.button>
      </div>
    </div>
  );
};

export default CurrencyDropdown;
