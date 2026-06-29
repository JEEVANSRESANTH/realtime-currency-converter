import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [rates, setRates] = useState([]);
  const [userEvents, setUserEvents] = useState([]);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [changedCurrencies, setChangedCurrencies] = useState([]);

  useEffect(() => {
    const s = io("http://localhost:5000");

    s.on("connect", () => console.log("Socket connected"));
    s.on("clients:count", () => {});

    s.on("rates:updated", (data) => {
      setRates(data);
    });

    s.on("rates:update", (data) => {
      setLastSyncTime(data.updatedAt);
      setChangedCurrencies(data.changedCurrencies);

      setRates((prev) => {
        const map = new Map(prev.map((r) => [r.code, r]));
        for (const c of data.changedCurrencies) {
          map.set(c.code, c);
        }
        return Array.from(map.values());
      });
    });

    s.on("user:event", (data) => {
      setUserEvents((prev) => [data, ...prev].slice(0, 50));
    });

    setSocket(s);

    return () => s.disconnect();
  }, []);

  return (
    <SocketContext.Provider value={{ socket, rates, userEvents, lastSyncTime, changedCurrencies }}>
      {children}
    </SocketContext.Provider>
  );
};
