import Currency from "../models/Currency.js";
import { getIO } from "../socket/index.js";

let intervalHandle = null;

const log = (msg) => console.log(`[RateWatcher] ${msg}`);

const FRANKFURTER_URL = "https://api.frankfurter.app/latest?from=USD";

export const startRateWatcher = () => {
  const interval = parseInt(process.env.RATE_UPDATE_INTERVAL, 10) || 60000;

  log("Rate Watcher Started");
  log(`Update interval: ${interval}ms`);

  const tick = async () => {
    try {
      log("Fetching latest rates...");

      const response = await fetch(FRANKFURTER_URL);

      if (!response.ok) {
        log(`Frankfurter API Error: HTTP ${response.status}`);
        return;
      }

      const data = await response.json();
      log("Frankfurter API Success");

      const apiRates = data.rates;
      apiRates.USD = 1;

      const allCurrencies = await Currency.find().lean();
      const bulkOps = [];
      const changedCurrencies = [];

      for (const currency of allCurrencies) {
        const code = currency.code;
        const newRate = apiRates[code];

        if (newRate === undefined) continue;

        if (currency.rate === newRate) continue;

        bulkOps.push({
          updateOne: {
            filter: { _id: currency._id },
            update: {
              $set: {
                rate: newRate,
                previousRate: currency.rate,
                lastUpdated: new Date(),
              },
            },
          },
        });

        changedCurrencies.push({
          _id: currency._id,
          code,
          name: currency.name,
          rate: newRate,
          previousRate: currency.rate,
          lastUpdated: new Date(),
        });
      }

      if (bulkOps.length > 0) {
        await Currency.bulkWrite(bulkOps);
        log(`${changedCurrencies.length} currencies updated`);
      } else {
        log("No currency changes detected");
      }

      getIO().emit("rates:update", {
        updatedAt: new Date(),
        changedCurrencies,
      });

      log("Socket event emitted");

      if (changedCurrencies.length > 0) {
        const allUpdated = await Currency.find().lean();
        getIO().emit("rates:updated", allUpdated);
      }

      log(`Waiting ${interval}ms...`);
    } catch (error) {
      log(`Frankfurter API Error: ${error.message}`);
      log("Retrying on next interval...");
    }
  };

  tick();

  intervalHandle = setInterval(tick, interval);
};

export const stopRateWatcher = () => {
  if (intervalHandle) {
    clearInterval(intervalHandle);
    intervalHandle = null;
    log("Rate Watcher Stopped");
  }
};
