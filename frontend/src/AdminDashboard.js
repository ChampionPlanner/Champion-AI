import { useState, useEffect } from "react";
import axios from "axios";
import { 
  Users, FileText, CreditCard, TrendingUp, Calendar, PieChart, 
  RefreshCw, LogOut, Plus, Trash2, Eye, Download, Shield
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AdminDashboard() {
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [addCreditsUserId, setAddCreditsUserId] = useState("");
  const [addCreditsAmount, setAddCreditsAmount] = useState(10);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await axios.post(`${API}/admin/login?password=${encodeURIComponent(password)}`);
      setIsLoggedIn(true);
      fetchDashboard();
    } catch (e) {
      setError("Invalid password");
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/admin/dashboard?password=${encodeURIComponent(password)}`);
      setData(res.data);
    } catch (e) {
      setError("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCredits = async () => {
    if (!addCreditsUserId) return;
    try {
      await axios.post(`${API}/admin/add-credits?user_id=${addCreditsUserId}&credits=${addCreditsAmount}&password=${encodeURIComponent(password)}`);
      alert(`Added ${addCreditsAmount} credits!`);
      fetchDashboard();
      setAddCreditsUserId("");
    } catch (e) {
      alert("Failed to add credits");
    }
  };

  const handleDeleteUser = async (userId, email) => {
    if (!window.confirm(`Delete user ${email}? This cannot be undone.`)) return;
    try {
      await axios.delete(`${API}/admin/user/${userId}?password=${encodeURIComponent(password)}`);
      alert("User deleted");
      fetchDashboard();
    } catch (e) {
      alert("Failed to delete user");
    }
  };

  const exportCSV = () => {
    if (!data?.all_users) return;
    const headers = ["Email", "Name", "Credits", "Plan", "Generations", "Referral Credits", "Created At"];
    const rows = data.all_users.map(u => [
      u.email, u.name, u.credits, u.plan, u.generations_count, u.referral_credits, u.created_at
    ]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "champion_ai_users.csv";
    a.click();
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md border border-white/20">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Shield className="h-10 w-10 text-purple-400" />
            <h1 className="text-2xl font-bold text-white">Admin Login</h1>
          </div>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="Admin Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 mb-4"
            />
            {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-black/30 border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-purple-400" />
            <h1 className="text-xl font-bold text-white">Champion AI Studio - Admin</h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchDashboard} className="p-2 text-gray-400 hover:text-white">
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={exportCSV} className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm">
              <Download className="h-4 w-4" /> Export CSV
            </button>
            <button onClick={() => setIsLoggedIn(false)} className="p-2 text-gray-400 hover:text-white">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Overview Cards */}
        {data && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="h-5 w-5 text-blue-400" />
                  <span className="text-gray-400 text-sm">Total Users</span>
                </div>
                <div className="text-3xl font-bold text-white">{data.overview.total_users}</div>
                <div className="text-green-400 text-sm mt-1">+{data.overview.today_new_users} today</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="h-5 w-5 text-purple-400" />
                  <span className="text-gray-400 text-sm">Generations</span>
                </div>
                <div className="text-3xl font-bold text-white">{data.overview.total_generations}</div>
                <div className="text-green-400 text-sm mt-1">+{data.overview.today_generations} today</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <CreditCard className="h-5 w-5 text-yellow-400" />
                  <span className="text-gray-400 text-sm">Credits in Circulation</span>
                </div>
                <div className="text-3xl font-bold text-white">{data.overview.total_credits_in_circulation}</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                  <span className="text-gray-400 text-sm">This Week</span>
                </div>
                <div className="text-3xl font-bold text-white">{data.overview.week_new_users}</div>
                <div className="text-gray-400 text-sm mt-1">new users</div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              {["overview", "users", "generations"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg font-medium ${activeTab === tab ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-400 hover:text-white'}`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="grid md:grid-cols-2 gap-6">
                {/* Users by Plan */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-purple-400" /> Users by Plan
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(data.users_by_plan).map(([plan, count]) => (
                      <div key={plan} className="flex justify-between items-center">
                        <span className="text-gray-300 capitalize">{plan}</span>
                        <span className="text-white font-semibold">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Content Type Usage */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-purple-400" /> Content Type Usage
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(data.content_type_usage).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
                      <div key={type} className="flex justify-between items-center">
                        <span className="text-gray-300">{type.replace(/_/g, ' ')}</span>
                        <span className="text-white font-semibold">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add Credits */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Plus className="h-5 w-5 text-green-400" /> Add Credits to User
                  </h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="User ID or Email"
                      value={addCreditsUserId}
                      onChange={(e) => setAddCreditsUserId(e.target.value)}
                      className="flex-1 p-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-500 text-sm"
                    />
                    <input
                      type="number"
                      value={addCreditsAmount}
                      onChange={(e) => setAddCreditsAmount(parseInt(e.target.value) || 0)}
                      className="w-20 p-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm"
                    />
                    <button onClick={handleAddCredits} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm">
                      Add
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === "users" && (
              <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="text-left p-4 text-gray-400 font-medium">User</th>
                        <th className="text-left p-4 text-gray-400 font-medium">Credits</th>
                        <th className="text-left p-4 text-gray-400 font-medium">Plan</th>
                        <th className="text-left p-4 text-gray-400 font-medium">Generations</th>
                        <th className="text-left p-4 text-gray-400 font-medium">Referrals</th>
                        <th className="text-left p-4 text-gray-400 font-medium">Created</th>
                        <th className="text-left p-4 text-gray-400 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.all_users.map((user) => (
                        <tr key={user.id} className="border-t border-white/5 hover:bg-white/5">
                          <td className="p-4">
                            <div className="text-white font-medium">{user.name}</div>
                            <div className="text-gray-400 text-sm">{user.email}</div>
                          </td>
                          <td className="p-4 text-white">{user.credits}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded text-xs ${user.plan === 'pro' ? 'bg-purple-500/20 text-purple-300' : user.plan === 'unlimited' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-gray-500/20 text-gray-300'}`}>
                              {user.plan}
                            </span>
                          </td>
                          <td className="p-4 text-white">{user.generations_count}</td>
                          <td className="p-4 text-green-400">{user.referral_credits}</td>
                          <td className="p-4 text-gray-400 text-sm">{new Date(user.created_at).toLocaleDateString()}</td>
                          <td className="p-4">
                            <button onClick={() => handleDeleteUser(user.id, user.email)} className="p-2 text-red-400 hover:text-red-300">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Generations Tab */}
            {activeTab === "generations" && (
              <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white/5">
                      <tr>
                        <th className="text-left p-4 text-gray-400 font-medium">Topic</th>
                        <th className="text-left p-4 text-gray-400 font-medium">Type</th>
                        <th className="text-left p-4 text-gray-400 font-medium">Language</th>
                        <th className="text-left p-4 text-gray-400 font-medium">Credits</th>
                        <th className="text-left p-4 text-gray-400 font-medium">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recent_generations.map((gen) => (
                        <tr key={gen.id} className="border-t border-white/5 hover:bg-white/5">
                          <td className="p-4 text-white max-w-xs truncate">{gen.topic}</td>
                          <td className="p-4">
                            <span className="px-2 py-1 rounded text-xs bg-purple-500/20 text-purple-300">
                              {gen.content_type}
                            </span>
                          </td>
                          <td className="p-4 text-gray-400">{gen.language || 'en'}</td>
                          <td className="p-4 text-yellow-400">{gen.credits_used}</td>
                          <td className="p-4 text-gray-400 text-sm">{new Date(gen.created_at).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {loading && !data && (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="h-8 w-8 text-purple-400 animate-spin" />
          </div>
        )}
      </main>
    </div>
  );
}
