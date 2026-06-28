import React, { useState, useEffect } from 'react';
import { Shield, Users, CreditCard, RefreshCw, CheckCircle, AlertCircle, Coins, Search, ArrowUpRight, TrendingUp } from 'lucide-react';
import { Profile, Transaction } from '../types.ts';

interface AdminPanelProps {
  currentAgent: Profile;
  onCoinsResetSuccess: (newBalance: number) => void;
}

export default function AdminPanel({ currentAgent, onCoinsResetSuccess }: AdminPanelProps) {
  const [agents, setAgents] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalAds, setTotalAds] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Coin management inputs per agent
  const [creditAmounts, setCreditAmounts] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  // Load data
  const loadAdminData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/developer/data?devId=${currentAgent.id}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch administrator data.');
      }

      setAgents(data.profiles || []);
      setTransactions(data.transactions || []);
      setTotalAds(data.adsCount || 0);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentAgent.isDeveloper) {
      loadAdminData();
    }
  }, [currentAgent]);

  // Handle Manual Coin Credit to Agent
  const handleCreditCoins = async (agentId: string) => {
    setError('');
    const amt = creditAmounts[agentId];
    if (!amt || isNaN(Number(amt)) || Number(amt) <= 0) {
      alert('Please enter a valid positive number of coins to credit.');
      return;
    }

    try {
      const response = await fetch('/api/developer/credit-coins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          devId: currentAgent.id,
          agentId,
          coins: Number(amt)
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to credit coins.');
      }

      // Update local state
      setAgents((prev) =>
        prev.map((agent) =>
          agent.id === agentId ? { ...agent, coinBalance: data.newBalance } : agent
        )
      );

      // Clear input
      setCreditAmounts((prev) => ({ ...prev, [agentId]: '' }));
      alert('Coins credited successfully!');
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Handle UTR Transaction Approval
  const handleApproveTransaction = async (txId: string) => {
    setError('');
    try {
      const response = await fetch('/api/developer/approve-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          devId: currentAgent.id,
          transactionId: txId
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to approve payment.');
      }

      // Refresh both lists
      await loadAdminData();
      alert('Payment approved! Coins credited to agent.');
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Trigger developer daily reset manually
  const handleResetDeveloperCoins = async () => {
    setError('');
    setResetLoading(true);
    try {
      const response = await fetch('/api/developer/reset-developer-coins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          devId: currentAgent.id
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset developer coins.');
      }

      onCoinsResetSuccess(data.coinBalance);
      await loadAdminData();
      alert('Daily coin balance reset to exactly 30 Coins for your Developer account!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setResetLoading(false);
    }
  };

  // Filter lists based on search
  const filteredAgents = agents.filter(a =>
    a.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingTx = transactions.filter(t => t.status === 'pending');
  const completedTx = transactions.filter(t => t.status === 'completed');

  if (!currentAgent.isDeveloper) {
    return (
      <div className="max-w-xl mx-auto p-8 text-center bg-red-500/10 border border-red-500/20 rounded-2xl my-12 shadow-lg">
        <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Access Denied</h3>
        <p className="text-sm text-slate-300">
          This panel is reserved exclusively for the hardcoded Developer account (<code className="text-amber-500">developer49@gmail.com</code>).
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6" id="developer-admin-panel">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="font-serif text-3xl font-bold text-white flex items-center gap-2">
            <Shield className="w-8 h-8 text-amber-500" />
            <span>Developer Admin Panel</span>
          </h2>
          <p className="text-sm text-slate-400">Manage Skocha agents, verify manual UTR payments, and monitor ecosystem health.</p>
        </div>

        {/* Manual Cron Reset trigger */}
        <button
          onClick={handleResetDeveloperCoins}
          disabled={resetLoading}
          id="btn-admin-coin-reset"
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-800 text-slate-950 text-sm font-bold rounded-lg flex items-center justify-center space-x-1.5 transition-colors self-start sm:self-auto shadow-md shadow-amber-500/5"
        >
          <RefreshCw className={`w-4 h-4 ${resetLoading ? 'animate-spin' : ''}`} />
          <span>Reset My Balance to 30 Coins (1:00 AM Cron)</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start space-x-3 text-sm text-red-400 mb-6 text-left">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Summary Bento Block */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Total Registered Agents</p>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-white font-mono">{agents.length}</span>
            <Users className="w-4 h-4 text-amber-500" />
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Pending UTR Approvals</p>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-amber-500 font-mono">{pendingTx.length}</span>
            <span className="text-xs px-1.5 py-0.5 bg-amber-500/10 text-amber-500 rounded font-bold font-sans">Requires Verification</span>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Completed Payments</p>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-emerald-500 font-mono">{completedTx.length}</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Total Active Ads</p>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-300 font-mono">{totalAds}</span>
            <span className="text-xs text-slate-500">Listings Live</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 font-mono text-xs">
          <RefreshCw className="w-6 h-6 text-amber-500 animate-spin mx-auto mb-3" />
          <span>Synchronizing with live profiles database...</span>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Section: Pending UTR Verifications */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-amber-500" />
                <span>Pending UPI Payments ({pendingTx.length})</span>
              </h3>
              <span className="text-xs text-slate-500">Facilitates the "5-minute" credit promise</span>
            </div>

            {pendingTx.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 font-mono">
                No pending UTR validations at this moment. Everything is up-to-date!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/20 text-slate-400 font-bold uppercase">
                      <th className="p-4">Agent Email</th>
                      <th className="p-4">Requested Coins</th>
                      <th className="p-4">Price (INR)</th>
                      <th className="p-4">UTR Number (12-digit)</th>
                      <th className="p-4">Submitted Date</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {pendingTx.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-950/40" id={`pending-tx-row-${tx.id}`}>
                        <td className="p-4 font-semibold text-slate-200">{tx.agentEmail}</td>
                        <td className="p-4">
                          <span className="flex items-center space-x-1 font-mono font-bold text-amber-400">
                            <Coins className="w-3.5 h-3.5 text-amber-500" />
                            <span>{tx.coins} Coins</span>
                          </span>
                        </td>
                        <td className="p-4 font-mono font-bold text-white">₹{tx.amount}</td>
                        <td className="p-4">
                          <span className="bg-slate-900 border border-slate-800 text-slate-300 font-mono px-2 py-1 rounded select-all tracking-wider font-semibold">
                            {tx.utrNumber}
                          </span>
                        </td>
                        <td className="p-4 text-slate-500">{new Date(tx.createdAt).toLocaleString()}</td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleApproveTransaction(tx.id)}
                            id={`btn-approve-tx-${tx.id}`}
                            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded text-xs transition-colors shadow-sm shadow-emerald-500/10"
                          >
                            Approve & Credit Coins
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Section: Agent Profiles Directory */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-500" />
                <span>Agent Accounts Directory ({filteredAgents.length})</span>
              </h3>

              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search agent email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 bg-slate-950/60 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/50"
                />
              </div>
            </div>

            {filteredAgents.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 font-mono">
                No agents found matching your query.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/20 text-slate-400 font-bold uppercase">
                      <th className="p-4">Agent Profile ID</th>
                      <th className="p-4">Email Account</th>
                      <th className="p-4">Join Date</th>
                      <th className="p-4">Coin Balance</th>
                      <th className="p-4 text-right">Manual Credit Coins</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredAgents.map((agent) => (
                      <tr key={agent.id} className="hover:bg-slate-950/40" id={`agent-profile-row-${agent.id}`}>
                        <td className="p-4 font-mono text-slate-500">{agent.id}</td>
                        <td className="p-4 font-semibold text-slate-200">
                          {agent.email}
                          {agent.isDeveloper && (
                            <span className="ml-2 bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider font-mono">
                              Developer Account
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-slate-500">{new Date(agent.createdAt).toLocaleDateString()}</td>
                        <td className="p-4">
                          <span className="flex items-center space-x-1 font-mono font-bold text-amber-400">
                            <Coins className="w-3.5 h-3.5 text-amber-500" />
                            <span>{agent.coinBalance} Coins</span>
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <input
                              type="number"
                              min="1"
                              placeholder="+ Coins"
                              value={creditAmounts[agent.id] || ''}
                              onChange={(e) => setCreditAmounts({ ...creditAmounts, [agent.id]: e.target.value })}
                              className="w-20 px-2 py-1 bg-slate-950 border border-slate-800 rounded font-mono text-center text-xs text-slate-200 focus:outline-none"
                            />
                            <button
                              onClick={() => handleCreditCoins(agent.id)}
                              id={`btn-credit-coins-${agent.id}`}
                              className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded text-[11px] uppercase tracking-wide transition-colors"
                            >
                              Credit
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Section: Historical Approved Log Payments */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/40">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                Historical Approved Transactions ({completedTx.length})
              </h3>
            </div>

            {completedTx.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-600 font-mono">
                No past transactions recorded in this session.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/20 text-slate-500 font-bold uppercase">
                      <th className="p-4">Agent</th>
                      <th className="p-4">Coins Credited</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">UTR Number</th>
                      <th className="p-4">Approval Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {completedTx.map((tx) => (
                      <tr key={tx.id} className="text-slate-400 hover:bg-slate-950/20">
                        <td className="p-4 font-medium">{tx.agentEmail}</td>
                        <td className="p-4 font-mono text-emerald-400 font-bold">+{tx.coins} Coins</td>
                        <td className="p-4 font-mono">₹{tx.amount}</td>
                        <td className="p-4 font-mono">{tx.utrNumber}</td>
                        <td className="p-4">
                          <span className="inline-flex items-center space-x-1 text-emerald-500 font-bold font-sans">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>APPROVED</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
