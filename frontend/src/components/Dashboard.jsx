import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, ComposedChart
} from 'recharts';
import {
  Play, Pause, Zap, DollarSign, Activity, Cpu, ShieldAlert, CheckCircle,
  TrendingUp, Hexagon, Radio, Split, ShieldCheck, Sword
} from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-950/95 border border-cyan-400/50 p-4 rounded-lg shadow-[0_0_30px_rgba(34,211,238,0.4)] backdrop-blur-xl">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
          <p className="text-cyan-300 font-mono text-xs tracking-wider">T+{label}</p>
        </div>
        {/* Render all active lines */}
        {payload.map((entry, index) => (
          <div key={index} className="flex justify-between gap-4 text-xs font-mono mb-1">
            <span style={{ color: entry.color }}>{entry.name}:</span>
            <span className="text-white font-bold">{Number(entry.value).toFixed(3)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const [metrics, setMetrics] = useState([]);
  const [budget, setBudget] = useState(1000);
  const [isSimulating, setIsSimulating] = useState(false);
  const [logs, setLogs] = useState([]);
  const [totalInterventions, setTotalInterventions] = useState(0);
  const [experimentStats, setExperimentStats] = useState({ standard: 0, minimax: 0 });

  const generateMockCustomer = () => ({
    customer_id: `CUST-${Math.floor(Math.random() * 9000) + 1000}`,
  });

  useEffect(() => {
    let interval;
    if (isSimulating) {
      interval = setInterval(() => {
        try {
          const customer = generateMockCustomer();

          // --- A/B TESTING LOGIC ---
          // 70% Standard RL (Maximize Reward), 30% Minimax (Minimize Risk)
          const isStandard = Math.random() > 0.3;
          const strategy = isStandard ? "RL_STANDARD" : "GT_MINIMAX";

          // Simulate outcomes
          // Standard: High variance (can be very high or negative)
          // Minimax: Lower variance, safer (rarely negative)
          const reward = isStandard
            ? (Math.random() * 1.5 - 0.4)
            : (Math.random() * 0.6 + 0.1);

          const action = ['DISCOUNT_APPLIED', 'PLAN_UPGRADE', 'LOYALTY_BONUS', 'PREMIUM_OFFER'][Math.floor(Math.random() * 4)];
          const risk = Math.random();
          const isFeasible = Math.random() > 0.2;

          setLogs(prev => [{
            id: customer.customer_id,
            action: action,
            strategy: strategy, // <--- Added Strategy Tag
            risk: risk.toFixed(3),
            status: isFeasible ? "AUTHORIZED" : "BLOCKED",
            time: new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            reward: reward.toFixed(3)
          }, ...prev.slice(0, 9)]);

          setMetrics(prev => {
            // We maintain two separate data streams in the chart
            // If it's a Standard Step, we hold the previous Minimax value constant (and vice versa)
            // This creates a stepped line effect for clearer comparison
            const lastMetric = prev[prev.length - 1] || { reward_standard: 0, reward_minimax: 0 };

            const newMetrics = [...prev, {
              time: prev.length,
              reward_standard: isStandard ? reward : lastMetric.reward_standard,
              reward_minimax: !isStandard ? reward : lastMetric.reward_minimax,
            }].slice(-40); // Keep last 40 points
            return newMetrics;
          });

          setExperimentStats(prev => ({
            standard: prev.standard + (isStandard ? 1 : 0),
            minimax: prev.minimax + (!isStandard ? 1 : 0)
          }));

          if(isFeasible) setBudget(prev => Math.max(0, prev - Math.random() * 20));
          setTotalInterventions(prev => prev + 1);

        } catch (error) {
          console.error("Simulation error", error);
        }
      }, 800);
    }
    return () => clearInterval(interval);
  }, [isSimulating]);

  const GlassCard = ({ children, className = "", glow = "cyan" }) => {
    const glowColors = {
      cyan: "shadow-[0_0_30px_rgba(34,211,238,0.15)]",
      purple: "shadow-[0_0_30px_rgba(168,85,247,0.15)]",
      blue: "shadow-[0_0_30px_rgba(59,130,246,0.15)]",
    };

    return (
      <div className={`relative bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl ${glowColors[glow]} ${className} overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 pointer-events-none"></div>
        <div className="relative z-10 h-full flex flex-col">{children}</div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 font-sans">
      <div className="w-full space-y-6">

        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Hexagon className="w-16 h-16 text-cyan-400 animate-pulse" strokeWidth={1.5} />
              <Zap className="w-6 h-6 text-cyan-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div>
              <h1 className="text-5xl font-black tracking-tighter text-slate-100">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500">
                  CHURN
                </span>
                PREVENT
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
                <p className="text-cyan-400/70 text-xs font-mono tracking-[0.3em] uppercase">
                  A/B Experiment Enabled • v4.3.0
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 ${isSimulating ? "bg-green-500/10 border-green-500/30" : "bg-slate-900/80 border-cyan-500/30"}`}>
              <div className={`w-2 h-2 rounded-full ${isSimulating ? 'bg-green-400 animate-ping' : 'bg-slate-600'}`}></div>
              <span className={`text-xs font-mono tracking-wider ${isSimulating ? "text-green-400" : "text-cyan-300"}`}>
                {isSimulating ? 'EXPERIMENT LIVE' : 'SYSTEM IDLE'}
              </span>
            </div>
          </div>
        </header>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

          {/* Budget Card */}
          <GlassCard glow="cyan" className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-cyan-400/60 text-xs font-mono tracking-wider uppercase mb-1">Budget Pool</p>
                <div className="flex items-baseline gap-1">
                  <DollarSign className="w-6 h-6 text-cyan-400" />
                  <span className="text-4xl font-black text-white tracking-tight">{budget.toFixed(0)}</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/30">
                <DollarSign className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
            <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                style={{ width: `${(budget/1000)*100}%` }}
              ></div>
            </div>
          </GlassCard>

          {/* NEW: Experiment Stats Card (Replacing Total Interventions) */}
          <GlassCard glow="purple" className="p-6">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-purple-400/60 text-xs font-mono tracking-wider uppercase mb-1">A/B Traffic Split</p>
              </div>
              <Split className="w-5 h-5 text-purple-400" />
            </div>

            <div className="space-y-3 mt-2">
              <div className="flex justify-between items-center text-xs">
                 <span className="text-cyan-300 flex items-center gap-2"><Sword size={12}/> Standard RL</span>
                 <span className="font-mono font-bold text-white">{experimentStats.standard}</span>
              </div>
              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                 <div className="h-full bg-cyan-500" style={{width: `${(experimentStats.standard / (totalInterventions || 1)) * 100}%`}}></div>
              </div>

              <div className="flex justify-between items-center text-xs">
                 <span className="text-purple-300 flex items-center gap-2"><ShieldCheck size={12}/> Game Theory</span>
                 <span className="font-mono font-bold text-white">{experimentStats.minimax}</span>
              </div>
              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                 <div className="h-full bg-purple-500" style={{width: `${(experimentStats.minimax / (totalInterventions || 1)) * 100}%`}}></div>
              </div>
            </div>
          </GlassCard>

          {/* Control Panel */}
          <GlassCard glow="blue" className="p-6 col-span-2">
            <div className="flex items-center justify-between h-full">
              <div className="space-y-2">
                <p className="text-blue-400/60 text-xs font-mono tracking-wider uppercase">System Control</p>
                <div className="flex items-center gap-3">
                  <div className={`px-4 py-2 rounded-lg font-mono text-sm font-bold ${
                    isSimulating
                      ? 'bg-green-500/20 text-green-300 border border-green-500/50'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {isSimulating ? 'OPTIMIZING...' : 'READY'}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsSimulating(!isSimulating)}
                className={`px-8 py-4 rounded-xl font-bold text-sm tracking-wider transition-all duration-300 ${
                  isSimulating
                    ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300 border-2 border-red-500/50'
                    : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border-2 border-cyan-500/50'
                } hover:scale-105`}
              >
                <div className="flex items-center gap-3">
                  {isSimulating ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  {isSimulating ? 'STOP EXPERIMENT' : 'RUN A/B TEST'}
                </div>
              </button>
            </div>
          </GlassCard>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[500px]">

          {/* Chart Section */}
          <GlassCard glow="cyan" className="lg:col-span-8 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-white font-bold text-lg tracking-tight mb-1">STRATEGY PERFORMANCE</h3>
                <p className="text-cyan-400/60 text-xs font-mono tracking-wider">Standard RL vs Minimax Game Theory</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <div className="flex items-center gap-2 text-cyan-300"><div className="w-2 h-2 bg-cyan-400 rounded-full"></div> Standard</div>
                <div className="flex items-center gap-2 text-purple-300"><div className="w-2 h-2 bg-purple-400 rounded-full"></div> Game Theory</div>
              </div>
            </div>

            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={metrics}>
                  <defs>
                    <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(34,211,238,0.1)" vertical={false} />
                  <XAxis dataKey="time" hide />
                  <YAxis stroke="rgba(148,163,184,0.3)" tick={{fill: 'rgba(148,163,184,0.7)', fontSize: 11}} tickLine={false} axisLine={false}/>
                  <Tooltip content={<CustomTooltip />} />

                  {/* Standard RL Line */}
                  <Area
                    type="monotone"
                    name="Standard RL"
                    dataKey="reward_standard"
                    stroke="#22d3ee"
                    fill="url(#cyanGradient)"
                    strokeWidth={2}
                  />

                  {/* Game Theory Line */}
                  <Area
                    type="step"
                    name="Game Theory"
                    dataKey="reward_minimax"
                    stroke="#a855f7"
                    fill="url(#purpleGradient)"
                    strokeWidth={2}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* Live Feed */}
          <GlassCard glow="purple" className="lg:col-span-4 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-white font-bold text-lg tracking-tight mb-1">INTERVENTION LOG</h3>
                <p className="text-purple-400/60 text-xs font-mono tracking-wider">Real-time Decisions</p>
              </div>
              <Cpu className="w-5 h-5 text-purple-400 animate-pulse" />
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3 scrollbar-thin scrollbar-thumb-purple-500/30 scrollbar-track-slate-800/30">
              {logs.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-slate-600">
                  <Radio className="w-12 h-12 mb-3 animate-pulse" />
                  <p className="text-xs font-mono tracking-widest">AWAITING DATA...</p>
                </div>
              )}

              {logs.map((log, i) => {
                const isStandard = log.strategy === "RL_STANDARD";
                const isAuthorized = log.status === "AUTHORIZED";

                return (
                  <div
                    key={i}
                    className={`p-3 rounded-lg border backdrop-blur-sm transition-all duration-300 ${
                      isAuthorized
                        ? 'bg-slate-900/50 border-slate-700'
                        : 'bg-red-500/5 border-red-500/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-[10px] text-slate-400">{log.time}</span>
                      {/* Strategy Badge */}
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold border ${
                        isStandard
                          ? 'text-cyan-300 border-cyan-500/30 bg-cyan-500/10'
                          : 'text-purple-300 border-purple-500/30 bg-purple-500/10'
                      }`}>
                        {isStandard ? 'STD_RL' : 'GT_MINIMAX'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-200">{log.action}</span>
                      <span className={`font-mono text-xs ${Number(log.reward) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {Number(log.reward) > 0 ? '+' : ''}{log.reward}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;