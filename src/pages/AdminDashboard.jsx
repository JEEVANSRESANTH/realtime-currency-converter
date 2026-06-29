import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import toast from "react-hot-toast";
import axios from "axios";
import GlassCard from "../components/ui/GlassCard";
import ScrollReveal from "../components/ui/ScrollReveal";
import { TableSkeleton } from "../components/ui/Skeleton";
import useAnimatedNumber from "../hooks/useAnimatedNumber";
import {
  LayoutDashboard,
  Users,
  Banknote,
  Clock,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  Trash2,
  Edit3,
  UserPlus,
  Shield,
  Star,
  ChevronUp,
  ChevronDown,
  RefreshCw,
  Wifi,
  Plus,
  Save,
  X,
  Search,
} from "lucide-react";

const tabs = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "users", label: "Users", icon: Users },
  { key: "currencies", label: "Currencies", icon: Banknote },
  { key: "history", label: "History", icon: Clock },
  { key: "rates", label: "Live Rates", icon: Activity },
];

const formatTime = (dateStr) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleTimeString();
};

const StatCard = ({ label, value, icon: Icon, color, delay = 0 }) => {
  const animated = useAnimatedNumber(value, 800);
  return (
    <ScrollReveal delay={delay}>
      <GlassCard className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 font-mono">
            {Math.round(animated)}
          </p>
        </div>
      </GlassCard>
    </ScrollReveal>
  );
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const { rates, userEvents, lastSyncTime, socket } = useSocket();
  const navigate = useNavigate();

  const [connectedClients, setConnectedClients] = useState(0);
  const [users, setUsers] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [editUser, setEditUser] = useState(null);
  const [editCurrency, setEditCurrency] = useState(null);
  const [newCurrency, setNewCurrency] = useState({ code: "", name: "", rate: "" });

  useEffect(() => {
    if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
      navigate("/");
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [usersRes, currenciesRes, historyRes, clientsRes] = await Promise.all([
          axios.get("/api/users"),
          axios.get("/api/currencies"),
          axios.get("/api/history"),
          axios.get("/api/connected-clients"),
        ]);
        setUsers(usersRes.data);
        setCurrencies(currenciesRes.data);
        setHistory(historyRes.data);
        setConnectedClients(clientsRes.data.count);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handler = (count) => setConnectedClients(count);
    socket.on("clients:count", handler);
    return () => socket.off("clients:count", handler);
  }, [socket]);

  const handleDeleteUser = async (id) => {
    try {
      await axios.delete(`/api/users/${id}`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      toast.success("User deleted");
    } catch {
      toast.error("Failed to delete user");
    }
  };

  const handleUpdateUser = async (id, data) => {
    try {
      const res = await axios.put(`/api/users/${id}`, data);
      setUsers((prev) => prev.map((u) => (u._id === id ? res.data : u)));
      setEditUser(null);
      toast.success("User updated");
    } catch {
      toast.error("Failed to update user");
    }
  };

  const handleCreateCurrency = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/currencies", newCurrency);
      const { data } = await axios.get("/api/currencies");
      setCurrencies(data);
      setNewCurrency({ code: "", name: "", rate: "" });
      toast.success("Currency added");
    } catch {
      toast.error("Failed to add currency");
    }
  };

  const handleUpdateCurrency = async (id, data) => {
    try {
      const res = await axios.put(`/api/currencies/${id}`, data);
      setCurrencies((prev) => prev.map((c) => (c._id === id ? res.data : c)));
      setEditCurrency(null);
      toast.success("Currency updated");
    } catch {
      toast.error("Failed to update currency");
    }
  };

  const handleDeleteCurrency = async (id) => {
    try {
      await axios.delete(`/api/currencies/${id}`);
      setCurrencies((prev) => prev.filter((c) => c._id !== id));
      toast.success("Currency deleted");
    } catch {
      toast.error("Failed to delete currency");
    }
  };

  const handlePromote = async (id) => {
    try {
      await axios.put(`/api/users/role/promote/${id}`);
      const { data } = await axios.get("/api/users");
      setUsers(data);
      toast.success("User promoted to admin");
    } catch {
      toast.error("Failed to promote user");
    }
  };

  const handleDemote = async (id) => {
    try {
      await axios.put(`/api/users/role/demote/${id}`);
      const { data } = await axios.get("/api/users");
      setUsers(data);
      toast.success("Admin demoted to user");
    } catch {
      toast.error("Failed to demote user");
    }
  };

  const filteredUsers = useMemo(
    () => users.filter((u) => u.name?.toLowerCase().includes(searchTerm.toLowerCase())),
    [users, searchTerm],
  );

  if (!user || (user.role !== "admin" && user.role !== "superadmin")) return null;

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 relative">
      <div className="blob w-[500px] h-[500px] bg-indigo-500 top-[-200px] right-[-200px]" />
      <div className="blob w-[400px] h-[400px] bg-purple-500 bottom-[-150px] left-[-150px]" />

      <div className="max-w-7xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Monitor and manage your currency exchange platform</p>
        </motion.div>

        <div className="flex gap-2 mb-8 flex-wrap">
          {tabs.map((t) => (
            <motion.button
              key={t.key}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === t.key
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20"
                  : "glass text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </motion.button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="skeleton h-24 rounded-2xl" />
              ))}
            </div>
            <TableSkeleton rows={5} cols={4} />
          </div>
        ) : (
          <>
            {activeTab === "overview" && (
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <StatCard label="Connected Clients" value={connectedClients} icon={Wifi} color="from-indigo-500 to-blue-600" delay={0} />
                  <StatCard label="Total Users" value={users.length} icon={Users} color="from-green-500 to-emerald-600" delay={0.1} />
                  <StatCard label="Currencies" value={currencies.length} icon={Banknote} color="from-blue-500 to-cyan-600" delay={0.2} />
                  <StatCard label="Recent Events" value={userEvents.length} icon={Activity} color="from-orange-500 to-red-600" delay={0.3} />
                </div>

                <GlassCard>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-indigo-500" />
                    Live Events
                  </h2>
                  <div className="max-h-64 overflow-y-auto space-y-1">
                    {userEvents.length === 0 && (
                      <p className="text-gray-400 text-sm py-4 text-center">No events yet</p>
                    )}
                    <AnimatePresence>
                      {userEvents.map((ev, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.02 }}
                          className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 py-2 px-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <span className={`w-2 h-2 rounded-full ${
                            ev.type === "register" ? "bg-green-500" :
                            ev.type === "login" ? "bg-blue-500" :
                            ev.type === "logout" ? "bg-gray-500" : "bg-indigo-500"
                          }`} />
                          <span className="font-medium capitalize">{ev.type}</span>
                          {ev.user?.name && <span>— {ev.user.name}</span>}
                          {ev.user?.email && <span className="text-gray-400">({ev.user.email})</span>}
                          <span className="ml-auto text-xs text-gray-400">{new Date(ev.timestamp).toLocaleTimeString()}</span>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </GlassCard>
              </div>
            )}

            {activeTab === "users" && (
              <GlassCard>
                <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-500" />
                    Users
                  </h2>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search users..."
                      className="input-field pl-9 py-2 text-sm w-48"
                    />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                        <th className="p-3 text-left font-medium">Name</th>
                        <th className="p-3 text-left font-medium">Email</th>
                        <th className="p-3 text-left font-medium">Role</th>
                        <th className="p-3 text-left font-medium">Created</th>
                        <th className="p-3 text-right font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u, i) => (
                        <motion.tr
                          key={u._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className="group border-t border-gray-100 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors rounded-xl"
                        >
                          {editUser === u._id ? (
                            <>
                              <td className="p-3">
                                <input defaultValue={u.name} className="input-field py-1.5 text-sm" id={`edit-name-${u._id}`} />
                              </td>
                              <td className="p-3">
                                <input defaultValue={u.email} className="input-field py-1.5 text-sm" id={`edit-email-${u._id}`} />
                              </td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${
                                  u.role === "superadmin" ? "bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300" :
                                  u.role === "admin" ? "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300" :
                                  "bg-gray-100 dark:bg-gray-500/20 text-gray-700 dark:text-gray-300"
                                }`}>{u.role}</span>
                              </td>
                              <td className="p-3 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                              <td className="p-3 text-right">
                                <div className="flex gap-1 justify-end">
                                  <motion.button whileTap={{ scale: 0.9 }}
                                    onClick={() => {
                                      const n = document.getElementById(`edit-name-${u._id}`).value;
                                      const e = document.getElementById(`edit-email-${u._id}`).value;
                                      handleUpdateUser(u._id, { name: n, email: e });
                                    }}
                                    className="p-1.5 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
                                  >
                                    <Save className="w-3.5 h-3.5" />
                                  </motion.button>
                                  <motion.button whileTap={{ scale: 0.9 }}
                                    onClick={() => setEditUser(null)}
                                    className="p-1.5 rounded-lg bg-gray-500 text-white hover:bg-gray-600 transition-colors"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </motion.button>
                                </div>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="p-3 font-medium text-gray-900 dark:text-gray-100">{u.name}</td>
                              <td className="p-3 text-gray-500">{u.email}</td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${
                                  u.role === "superadmin" ? "bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300" :
                                  u.role === "admin" ? "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300" :
                                  "bg-gray-100 dark:bg-gray-500/20 text-gray-700 dark:text-gray-300"
                                }`}>{u.role}</span>
                              </td>
                              <td className="p-3 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                              <td className="p-3 text-right">
                                <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                  <motion.button whileTap={{ scale: 0.9 }}
                                    onClick={() => setEditUser(u._id)}
                                    className="p-1.5 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 transition-colors"
                                    title="Edit"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </motion.button>
                                  {user.role === "superadmin" && u.role === "user" && (
                                    <motion.button whileTap={{ scale: 0.9 }}
                                      onClick={() => handlePromote(u._id)}
                                      className="p-1.5 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
                                      title="Promote to Admin"
                                    >
                                      <ChevronUp className="w-3.5 h-3.5" />
                                    </motion.button>
                                  )}
                                  {user.role === "superadmin" && u.role === "admin" && (
                                    <motion.button whileTap={{ scale: 0.9 }}
                                      onClick={() => handleDemote(u._id)}
                                      className="p-1.5 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 transition-colors"
                                      title="Demote to User"
                                    >
                                      <ChevronDown className="w-3.5 h-3.5" />
                                    </motion.button>
                                  )}
                                  {user.role === "superadmin" && u.role !== "superadmin" && (
                                    <motion.button whileTap={{ scale: 0.9 }}
                                      onClick={() => handleDeleteUser(u._id)}
                                      className="p-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                                      title="Delete"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </motion.button>
                                  )}
                                </div>
                              </td>
                            </>
                          )}
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            )}

            {activeTab === "currencies" && (
              <div>
                <GlassCard className="mb-4">
                  <form onSubmit={handleCreateCurrency} className="flex gap-3 items-end flex-wrap">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Code</label>
                      <input value={newCurrency.code} onChange={(e) => setNewCurrency({ ...newCurrency, code: e.target.value.toUpperCase() })} className="input-field py-2 text-sm w-20" required />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Name</label>
                      <input value={newCurrency.name} onChange={(e) => setNewCurrency({ ...newCurrency, name: e.target.value })} className="input-field py-2 text-sm w-40" required />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Rate</label>
                      <input type="number" step="any" value={newCurrency.rate} onChange={(e) => setNewCurrency({ ...newCurrency, rate: e.target.value })} className="input-field py-2 text-sm w-24" required />
                    </div>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="btn-primary text-sm flex items-center gap-1.5 py-2.5">
                      <Plus className="w-4 h-4" /> Add Currency
                    </motion.button>
                  </form>
                </GlassCard>

                <GlassCard>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <Banknote className="w-5 h-5 text-indigo-500" />
                    All Currencies
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                          <th className="p-3 text-left font-medium">Code</th>
                          <th className="p-3 text-left font-medium">Name</th>
                          <th className="p-3 text-left font-medium">Rate</th>
                          <th className="p-3 text-right font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currencies.map((c, i) => (
                          <motion.tr
                            key={c._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.02 }}
                            className="group border-t border-gray-100 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors"
                          >
                            {editCurrency === c._id ? (
                              <>
                                <td className="p-3"><input defaultValue={c.code} className="input-field py-1.5 text-sm w-16" id={`cc-code-${c._id}`} /></td>
                                <td className="p-3"><input defaultValue={c.name} className="input-field py-1.5 text-sm w-32" id={`cc-name-${c._id}`} /></td>
                                <td className="p-3"><input type="number" step="any" defaultValue={c.rate} className="input-field py-1.5 text-sm w-20" id={`cc-rate-${c._id}`} /></td>
                                <td className="p-3 text-right">
                                  <div className="flex gap-1 justify-end">
                                    <motion.button whileTap={{ scale: 0.9 }}
                                      onClick={() => {
                                        const code = document.getElementById(`cc-code-${c._id}`).value;
                                        const name = document.getElementById(`cc-name-${c._id}`).value;
                                        const rate = document.getElementById(`cc-rate-${c._id}`).value;
                                        handleUpdateCurrency(c._id, { code, name, rate: Number(rate) });
                                      }}
                                      className="p-1.5 rounded-lg bg-green-500 text-white hover:bg-green-600"
                                    ><Save className="w-3.5 h-3.5" /></motion.button>
                                    <motion.button whileTap={{ scale: 0.9 }}
                                      onClick={() => setEditCurrency(null)}
                                      className="p-1.5 rounded-lg bg-gray-500 text-white hover:bg-gray-600"
                                    ><X className="w-3.5 h-3.5" /></motion.button>
                                  </div>
                                </td>
                              </>
                            ) : (
                              <>
                                <td className="p-3 font-mono font-medium text-gray-900 dark:text-gray-100">{c.code}</td>
                                <td className="p-3 text-gray-600 dark:text-gray-300">{c.name}</td>
                                <td className="p-3 font-mono text-gray-900 dark:text-gray-100">{c.rate}</td>
                                <td className="p-3 text-right">
                                  <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                    <motion.button whileTap={{ scale: 0.9 }}
                                      onClick={() => setEditCurrency(c._id)}
                                      className="p-1.5 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600"
                                      title="Edit"
                                    ><Edit3 className="w-3.5 h-3.5" /></motion.button>
                                    <motion.button whileTap={{ scale: 0.9 }}
                                      onClick={() => handleDeleteCurrency(c._id)}
                                      className="p-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600"
                                      title="Delete"
                                    ><Trash2 className="w-3.5 h-3.5" /></motion.button>
                                  </div>
                                </td>
                              </>
                            )}
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </GlassCard>
              </div>
            )}

            {activeTab === "history" && (
              <GlassCard>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-500" />
                  Conversion History
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                        <th className="p-3 text-left font-medium">User</th>
                        <th className="p-3 text-left font-medium">From</th>
                        <th className="p-3 text-left font-medium">To</th>
                        <th className="p-3 text-left font-medium">Amount</th>
                        <th className="p-3 text-left font-medium">Result</th>
                        <th className="p-3 text-left font-medium">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-gray-400">
                            <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            No conversion history yet
                          </td>
                        </tr>
                      ) : (
                        history.map((h, i) => (
                          <motion.tr
                            key={h._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.02 }}
                            className="group border-t border-gray-100 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors"
                          >
                            <td className="p-3 font-medium text-gray-900 dark:text-gray-100">{h.userId?.name || "N/A"}</td>
                            <td className="p-3 font-mono text-gray-600 dark:text-gray-300">{h.fromCurrency}</td>
                            <td className="p-3 font-mono text-gray-600 dark:text-gray-300">{h.toCurrency}</td>
                            <td className="p-3 font-mono text-gray-900 dark:text-gray-100">{h.amount}</td>
                            <td className="p-3 font-mono font-medium text-green-600 dark:text-green-400">{h.convertedAmount}</td>
                            <td className="p-3 text-gray-500 text-xs">{new Date(h.timestamp).toLocaleString()}</td>
                          </motion.tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            )}

            {activeTab === "rates" && (
              <div>
                <GlassCard className="mb-4 flex items-center justify-between flex-wrap gap-2">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-indigo-500" />
                    Live Exchange Rates
                  </h2>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="flex items-center gap-1.5 text-gray-500">
                      <RefreshCw className="w-3.5 h-3.5" />
                      Last sync:
                    </span>
                    <span className="font-mono font-medium text-gray-900 dark:text-gray-100">
                      {formatTime(lastSyncTime)}
                    </span>
                  </div>
                </GlassCard>

                <GlassCard>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                          <th className="p-3 text-left font-medium">Currency</th>
                          <th className="p-3 text-left font-medium">Current Rate</th>
                          <th className="p-3 text-left font-medium">Previous Rate</th>
                          <th className="p-3 text-left font-medium">Diff</th>
                          <th className="p-3 text-left font-medium">Trend</th>
                          <th className="p-3 text-left font-medium">Updated</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rates.map((r, i) => {
                          const diff = r.previousRate != null ? r.rate - r.previousRate : null;
                          const pct = r.previousRate != null ? ((diff / r.previousRate) * 100).toFixed(2) : null;
                          const increased = diff > 0;
                          const decreased = diff < 0;

                          return (
                            <motion.tr
                              key={r._id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.02 }}
                              className={`group border-t border-gray-100 dark:border-slate-700/50 transition-all duration-500 ${
                                increased ? "bg-green-50/50 dark:bg-green-500/5" :
                                decreased ? "bg-red-50/50 dark:bg-red-500/5" : ""
                              }`}
                            >
                              <td className="p-3">
                                <span className="font-mono font-bold text-gray-900 dark:text-gray-100">{r.code}</span>
                                <span className="ml-2 text-gray-500 dark:text-gray-400 text-xs">{r.name}</span>
                              </td>
                              <td className={`p-3 font-mono font-semibold ${
                                increased ? "text-green-600 dark:text-green-400" :
                                decreased ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-gray-100"
                              }`}>
                                <motion.span
                                  key={r.rate}
                                  initial={{ scale: 1.2 }}
                                  animate={{ scale: 1 }}
                                  transition={{ duration: 0.3 }}
                                >
                                  {r.rate}
                                </motion.span>
                              </td>
                              <td className="p-3 font-mono text-gray-500 dark:text-gray-400">
                                {r.previousRate != null ? r.previousRate : "—"}
                              </td>
                              <td className={`p-3 font-mono ${
                                increased ? "text-green-600" : decreased ? "text-red-600" : "text-gray-500"
                              }`}>
                                {diff != null ? `${increased ? "+" : ""}${diff.toFixed(4)}` : "—"}
                                {pct != null && (
                                  <span className="text-xs ml-1">({increased ? "+" : ""}{pct}%)</span>
                                )}
                              </td>
                              <td className="p-3">
                                {increased ? (
                                  <span className="flex items-center gap-1 text-green-600 font-medium">
                                    <TrendingUp className="w-4 h-4" /> Up
                                  </span>
                                ) : decreased ? (
                                  <span className="flex items-center gap-1 text-red-600 font-medium">
                                    <TrendingDown className="w-4 h-4" /> Down
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1 text-gray-400">
                                    <Minus className="w-4 h-4" /> Flat
                                  </span>
                                )}
                              </td>
                              <td className="p-3 text-xs text-gray-500 dark:text-gray-400 font-mono">
                                {formatTime(r.lastUpdated)}
                              </td>
                            </motion.tr>
                          );
                        })}
                        {rates.length === 0 && (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-gray-400">
                              <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                              Waiting for rate updates...
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </GlassCard>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
