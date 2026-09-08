import React, { useEffect, useRef, useState } from "react";
import {
  Cpu, MemoryStick, Wifi, Database, Server, Workflow, BrainCircuit,
  Volume2, VolumeX, AlertTriangle, Activity, Trophy, RotateCcw,
  Search, TrendingUp, Undo2, Wrench, ShieldAlert, Trash2, Route, Brain, Link2,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Static config — component dashboard + incident + action definitions
// ---------------------------------------------------------------------------

const COMPONENT_DEFS = [
  { id: "cpu", label: "CPU", unit: "%", baseline: 34, icon: Cpu },
  { id: "ram", label: "RAM", unit: "%", baseline: 47, icon: MemoryStick },
  { id: "network", label: "Network", unit: "ms", baseline: 38, icon: Wifi },
  { id: "database", label: "Database", unit: "ms", baseline: 110, icon: Database },
  { id: "api", label: "API", unit: "ms", baseline: 85, icon: Server },
  { id: "pipeline", label: "Data Pipeline", unit: "rec/s", baseline: 1180, icon: Workflow },
  { id: "ai", label: "AI / ML Service", unit: "ms", baseline: 205, icon: BrainCircuit },
];

const BASELINE = Object.fromEntries(COMPONENT_DEFS.map((c) => [c.id, c.baseline]));

const ACTIONS = [
  { id: "TRACE", label: "Trace", icon: Search },
  { id: "RESTART", label: "Restart", icon: RotateCcw },
  { id: "SCALE", label: "Scale", icon: TrendingUp },
  { id: "ROLLBACK", label: "Rollback", icon: Undo2 },
  { id: "REPAIR", label: "Repair", icon: Wrench },
  { id: "ISOLATE", label: "Isolate", icon: ShieldAlert },
  { id: "CLEANUP", label: "Cleanup", icon: Trash2 },
  { id: "REDIRECT", label: "Redirect", icon: Route },
  { id: "RETRAIN", label: "Retrain", icon: Brain },
  { id: "RESTORE", label: "Restore", icon: Link2 },
];

const INCIDENTS = [
  {
    id: "cpu_spike", stage: 1, title: "CPU Spike", affects: ["cpu"], correctAction: "TRACE", severity: 2.7,
    symptoms: [
      { label: "CPU Utilization", value: "98%" },
      { label: "Active Processes", value: "347 (+210%)" },
      { label: "Thread Queue", value: "Critical" },
    ],
    resolveMsg: "Rogue process traced and killed. CPU load normalizing.",
    failMsg: "Wrong call — CPU load keeps climbing.",
  },
  {
    id: "memory_leak", stage: 1, title: "Memory Leak", affects: ["ram"], correctAction: "RESTART", severity: 1.9,
    symptoms: [
      { label: "RAM Usage", value: "94%" },
      { label: "Garbage Collection", value: "Stalled" },
      { label: "Allocation Rate", value: "+18 MB/s" },
    ],
    resolveMsg: "Service restarted. Memory reclaimed.",
    failMsg: "Leak untouched — RAM still climbing.",
  },
  {
    id: "network_congestion", stage: 1, title: "Network Congestion", affects: ["network"], correctAction: "REDIRECT", severity: 3.2,
    symptoms: [
      { label: "Network Latency", value: "890 ms" },
      { label: "Packet Loss", value: "12%" },
      { label: "Throughput", value: "-64%" },
    ],
    resolveMsg: "Traffic redirected. Latency dropping.",
    failMsg: "Congestion persists — packets still dropping.",
  },
  {
    id: "api_failure", stage: 1, title: "API Failure", affects: ["api"], correctAction: "RESTART", severity: 3.0,
    symptoms: [
      { label: "API Error Rate", value: "47%" },
      { label: "Failed Requests", value: "1,204" },
      { label: "Status Code", value: "503 x N" },
    ],
    resolveMsg: "API service restarted. Requests succeeding again.",
    failMsg: "Errors keep piling up.",
  },
  {
    id: "disk_full", stage: 1, title: "Disk Full", affects: ["database"], correctAction: "CLEANUP", severity: 1.6,
    symptoms: [
      { label: "Storage Used", value: "99%" },
      { label: "Write Operations", value: "Failing" },
      { label: "Free Space", value: "0.4 GB" },
    ],
    resolveMsg: "Old logs purged. Storage freed up.",
    failMsg: "Disk still critical — writes failing.",
  },
  {
    id: "db_overload", stage: 2, title: "Database Overload", affects: ["database"], correctAction: "SCALE", severity: 2.4,
    symptoms: [
      { label: "DB Response Time", value: "4.8 s" },
      { label: "Request Queue", value: "+340%" },
      { label: "Active Connections", value: "2,847" },
    ],
    resolveMsg: "Database scaled up. Response time recovering.",
    failMsg: "Database still buckling under load.",
  },
  {
    id: "db_connection", stage: 2, title: "Database Connection Failure", affects: ["api", "database"], correctAction: "RESTORE", severity: 2.0,
    symptoms: [
      { label: "API \u2194 Database", value: "Disconnected" },
      { label: "Timeout Errors", value: "89/min" },
      { label: "Retry Attempts", value: "Exhausted" },
    ],
    resolveMsg: "Connection restored between services.",
    failMsg: "Services still can't reach each other.",
  },
  {
    id: "pipeline_failure", stage: 2, title: "Data Pipeline Failure", affects: ["pipeline"], correctAction: "REPAIR", severity: 0.05,
    symptoms: [
      { label: "Incoming Records", value: "0 / min" },
      { label: "Pipeline Status", value: "Stalled" },
      { label: "Last Sync", value: "6 min ago" },
    ],
    resolveMsg: "Pipeline repaired. Records flowing again.",
    failMsg: "Pipeline still stalled.",
  },
  {
    id: "corrupted_data", stage: 2, title: "Corrupted Data", affects: ["pipeline", "database"], correctAction: "ROLLBACK", severity: 2.2,
    symptoms: [
      { label: "Validation Errors", value: "+215%" },
      { label: "Schema Mismatches", value: "38" },
      { label: "Data Integrity", value: "Compromised" },
    ],
    resolveMsg: "Rolled back to last clean snapshot.",
    failMsg: "Corruption spreading further.",
  },
  {
    id: "ml_drift", stage: 3, title: "ML Model Drift", affects: ["ai"], correctAction: "RETRAIN", severity: 2.6,
    symptoms: [
      { label: "Prediction Accuracy", value: "-31%" },
      { label: "Confidence Score", value: "0.41" },
      { label: "Input Distribution", value: "Shifted" },
    ],
    resolveMsg: "Model retrained on fresh data. Accuracy back up.",
    failMsg: "Model still drifting.",
  },
  {
    id: "ai_overload", stage: 3, title: "AI Inference Overload", affects: ["ai"], correctAction: "SCALE", severity: 3.4,
    symptoms: [
      { label: "Inference Latency", value: "6.2 s" },
      { label: "GPU Utilization", value: "100%" },
      { label: "Request Backlog", value: "1,830" },
    ],
    resolveMsg: "AI service scaled out. Latency dropping.",
    failMsg: "Inference queue keeps growing.",
  },
  {
    id: "iot_sensor", stage: 3, title: "IoT Sensor Failure", affects: ["pipeline"], correctAction: "ISOLATE", severity: 0.35,
    symptoms: [
      { label: "Sensor Readings", value: "Erratic" },
      { label: "Anomaly Score", value: "0.97" },
      { label: "Device Status", value: "Unstable" },
    ],
    resolveMsg: "Faulty sensor isolated. Feed stabilizing.",
    failMsg: "Bad data still flooding the pipeline.",
  },
];

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

function createInitialState() {
  const components = {};
  COMPONENT_DEFS.forEach((def) => {
    components[def.id] = {
      value: def.baseline,
      history: Array(18).fill(def.baseline),
      status: "green",
      forcedTarget: null,
    };
  });
  return {
    health: 100,
    timeLeft: 60,
    incidentsSolved: 0,
    wrongActions: 0,
    responseTimes: [],
    activeIncident: null,
    incidentTimeLeft: 0,
    incidentTotalTimeout: 1,
    spawnCountdown: 4,
    lastIncidentId: null,
    components,
  };
}

function getStage(timeLeft) {
  const elapsed = 60 - timeLeft;
  return elapsed < 20 ? 1 : elapsed < 40 ? 2 : 3;
}
const STAGE_NAME = { 1: "Infrastructure", 2: "Data", 3: "Deep Tech" };

// ---------------------------------------------------------------------------
// Small presentational pieces
// ---------------------------------------------------------------------------

function Sparkline({ history }) {
  const w = 100, h = 28;
  const min = Math.min(...history), max = Math.max(...history);
  const range = max - min || 1;
  const pts = history
    .map((v, i) => `${(i / (history.length - 1)) * w},${h - ((v - min) / range) * h}`)
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-6 md:h-7" preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ComponentCard({ def, data }) {
  const Icon = def.icon;
  const tone =
    data.status === "red" ? { dot: "bg-rose-500", text: "text-rose-500", border: "border-rose-500", glow: "rgba(244,63,94,0.85)" } :
    data.status === "yellow" ? { dot: "bg-amber-400", text: "text-amber-400", border: "border-slate-800", glow: "rgba(251,191,36,0.6)" } :
    { dot: "bg-emerald-400", text: "text-emerald-400", border: "border-slate-800", glow: "rgba(52,211,153,0.55)" };

  return (
    <div
      className={`relative bg-slate-900 border rounded-2xl p-3 md:p-4 transition-colors duration-300 ${tone.border}`}
      style={data.status === "red" ? { boxShadow: "0 0 22px rgba(244,63,94,0.22)" } : undefined}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-slate-300">
          <Icon className="w-4 h-4 md:w-5 md:h-5" />
          <span className="text-xs font-mono uppercase tracking-wide">{def.label}</span>
        </div>
        <span className={`w-2.5 h-2.5 rounded-full ${tone.dot}`} style={{ boxShadow: `0 0 8px ${tone.glow}` }} />
      </div>
      <div className={`font-mono font-black text-xl md:text-3xl mb-1 ${tone.text}`}>
        {Math.round(data.value).toLocaleString()}
        <span className="text-xs md:text-sm ml-1 text-slate-500">{def.unit}</span>
      </div>
      <div className={tone.text}>
        <Sparkline history={data.history} />
      </div>
    </div>
  );
}

function StartScreen({ onStart }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 gap-6">
      <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs md:text-sm uppercase tracking-widest">
        <Activity className="w-4 h-4" /> Live Systems Monitor
      </div>
      <h1 className="text-4xl md:text-7xl font-black tracking-tight">
        SAVE THE <span className="text-cyan-400">SERVER</span>
      </h1>
      <p className="max-w-xl text-slate-400 text-sm md:text-lg">
        You're on call. Incidents will hit CPU, memory, network, the database, the pipeline and the
        AI service — read the symptoms, pick the right fix, and keep the system alive for 60 seconds.
      </p>
      <div className="flex flex-wrap gap-3 justify-center text-xs md:text-sm text-slate-500 font-mono">
        <span>7 LIVE COMPONENTS</span><span>路</span><span>12 INCIDENT TYPES</span><span>路</span><span>60 SECONDS</span>
      </div>
      <button
        onClick={onStart}
        className="mt-4 px-10 py-5 md:px-14 md:py-6 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xl md:text-2xl rounded-2xl transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-300"
        style={{ boxShadow: "0 0 40px rgba(34,211,238,0.35)" }}
      >
        START SHIFT
      </button>
    </div>
  );
}

function EndScreen({ result, onReplay }) {
  if (!result) return null;
  const saved = result.result === "saved";
  const stats = [
    { label: "System Health", value: `${result.health}%` },
    { label: "Incidents Solved", value: result.incidentsSolved },
    { label: "Wrong Actions", value: result.wrongActions },
    { label: "Time Survived", value: `${result.timeSurvived}s` },
  ];
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 gap-5">
      <div className={`text-4xl md:text-7xl font-black tracking-tight ${saved ? "text-emerald-400" : "text-rose-500"}`}>
        {saved ? "SERVER SAVED!" : "SERVER CRASHED!"}
      </div>
      <div className="flex items-center gap-2 text-slate-300">
        <Trophy className="w-5 h-5 text-amber-400" />
        <span className="font-mono text-lg md:text-xl uppercase tracking-wide">{result.rank}</span>
      </div>
      <div className="text-6xl md:text-8xl font-black font-mono text-cyan-400">
        {result.score}<span className="text-2xl md:text-3xl text-slate-500">/100</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 w-full max-w-2xl mt-2">
        {stats.map((st, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-3 md:p-4">
            <div className="text-slate-500 text-xs font-mono uppercase mb-1">{st.label}</div>
            <div className="text-lg md:text-2xl font-bold font-mono">{st.value}</div>
          </div>
        ))}
      </div>
      <button
        onClick={onReplay}
        className="mt-4 px-10 py-5 md:px-14 md:py-6 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xl md:text-2xl rounded-2xl transition-all active:scale-95 flex items-center gap-3 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-300"
        style={{ boxShadow: "0 0 40px rgba(34,211,238,0.35)" }}
      >
        <RotateCcw className="w-6 h-6" /> PLAY AGAIN
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main app
// ---------------------------------------------------------------------------

export default function SaveTheServer() {
  const stateRef = useRef(null);
  if (!stateRef.current) stateRef.current = createInitialState();

  const [screen, setScreen] = useState("start");
  const [feedback, setFeedback] = useState(null);
  const [finalResult, setFinalResult] = useState(null);
  const [muted, setMuted] = useState(false);
  const [, setRenderTick] = useState(0);
  const rerender = () => setRenderTick((t) => t + 1);

  const mutedRef = useRef(false);
  useEffect(() => { mutedRef.current = muted; }, [muted]);
  const audioCtxRef = useRef(null);
  const feedbackTimerRef = useRef(null);

  function beep(freq, duration, type = "sine", vol = 0.18, delay = 0) {
    if (mutedRef.current) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const t0 = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t0);
      gain.gain.setValueAtTime(vol, t0);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + duration + 0.02);
    } catch (e) { /* audio unavailable, fail silently */ }
  }

  function playSound(name) {
    switch (name) {
      case "alert": beep(880, 0.12, "square", 0.12); beep(660, 0.14, "square", 0.12, 0.14); break;
      case "correct": beep(660, 0.08, "sine", 0.16); beep(990, 0.12, "sine", 0.16, 0.09); break;
      case "wrong": beep(180, 0.28, "sawtooth", 0.18); break;
      case "success": beep(523, 0.14, "sine", 0.17); beep(659, 0.14, "sine", 0.17, 0.14); beep(784, 0.24, "sine", 0.17, 0.28); break;
      case "fail": beep(300, 0.2, "sawtooth", 0.15); beep(220, 0.32, "sawtooth", 0.15, 0.2); break;
      default: break;
    }
  }

  function spawnIncident() {
    const s = stateRef.current;
    const stage = getStage(s.timeLeft);
    let pool = INCIDENTS.filter((i) => i.stage === stage && i.id !== s.lastIncidentId);
    if (pool.length === 0) pool = INCIDENTS.filter((i) => i.stage === stage);
    const incident = pool[Math.floor(Math.random() * pool.length)];
    s.lastIncidentId = incident.id;
    s.activeIncident = { incident, spawnedAt: Date.now() };
    const timeout = stage === 1 ? 9 : stage === 2 ? 8 : 7;
    s.incidentTimeLeft = timeout;
    s.incidentTotalTimeout = timeout;
    incident.affects.forEach((id) => {
      s.components[id].forcedTarget = BASELINE[id] * incident.severity;
    });
    playSound("alert");
  }

  function handleAction(actionId) {
    const s = stateRef.current;
    if (!s.activeIncident) return;
    const { incident, spawnedAt } = s.activeIncident;
    const responseTime = (Date.now() - spawnedAt) / 1000;
    const correct = actionId === incident.correctAction;

    if (correct) {
      s.health = Math.min(100, s.health + 10);
      s.incidentsSolved += 1;
      s.responseTimes.push(responseTime);
    } else {
      s.health = Math.max(0, s.health - 10);
      s.wrongActions += 1;
      if (actionId) s.responseTimes.push(responseTime);
    }

    incident.affects.forEach((id) => { s.components[id].forcedTarget = null; });
    s.activeIncident = null;
    const stage = getStage(s.timeLeft);
    s.spawnCountdown = stage === 1 ? 5 + Math.floor(Math.random() * 3)
      : stage === 2 ? 4 + Math.floor(Math.random() * 3)
      : 3 + Math.floor(Math.random() * 3);

    clearTimeout(feedbackTimerRef.current);
    setFeedback({
      type: correct ? "correct" : "wrong",
      title: correct ? "System Stabilized" : "Action Failed",
      msg: correct ? incident.resolveMsg : incident.failMsg,
      delta: correct ? "+10 HEALTH" : "-10 HEALTH",
    });
    feedbackTimerRef.current = setTimeout(() => setFeedback(null), 1400);
    playSound(correct ? "correct" : "wrong");
    rerender();
  }

  function finishGame(result) {
    const s = stateRef.current;
    s.activeIncident = null;
    const timeSurvived = result === "crashed" ? 60 - s.timeLeft : 60;
    const avgResp = s.responseTimes.length
      ? s.responseTimes.reduce((a, b) => a + b, 0) / s.responseTimes.length
      : null;
    const speedBonus = avgResp != null ? clamp(15 - avgResp * 1.5, 0, 15) : 0;
    let score = s.health * 0.35 + s.incidentsSolved * 5.5 + (timeSurvived / 60) * 15 + speedBonus - s.wrongActions * 6;
    score = Math.round(clamp(score, 0, 100));
    const rank = score >= 90 ? "System Saviour" : score >= 75 ? "Tech Commander" : score >= 50 ? "Incident Responder" : "System Trainee";
    setFinalResult({
      result, score, rank,
      health: Math.round(s.health),
      incidentsSolved: s.incidentsSolved,
      wrongActions: s.wrongActions,
      timeSurvived,
    });
    playSound(result === "saved" ? "success" : "fail");
    setScreen("ended");
  }

  function mainTick() {
    const s = stateRef.current;
    s.timeLeft -= 1;
    if (s.activeIncident) {
      s.incidentTimeLeft -= 1;
      if (s.incidentTimeLeft <= 0) handleAction(null);
    } else {
      s.spawnCountdown -= 1;
      if (s.spawnCountdown <= 0) spawnIncident();
    }
    if (s.health <= 0) { finishGame("crashed"); return; }
    if (s.timeLeft <= 0) { finishGame(s.health > 0 ? "saved" : "crashed"); return; }
    rerender();
  }

  function fastTick() {
    const s = stateRef.current;
    Object.values(s.components).forEach((c) => {
      if (c.forcedTarget != null) {
        c.value = c.value + (c.forcedTarget - c.value) * 0.35 + (Math.random() - 0.5) * c.forcedTarget * 0.04;
        c.status = "red";
      } else {
        c.value = c.value + (c.baseline - c.value) * 0.12 + (Math.random() - 0.5) * c.baseline * 0.06;
        const dev = Math.abs(c.value - c.baseline) / (c.baseline || 1);
        c.status = dev > 0.18 ? "yellow" : "green";
      }
      c.history.push(c.value);
      if (c.history.length > 18) c.history.shift();
    });
    rerender();
  }

  useEffect(() => {
    if (screen !== "playing") return;
    const t1 = setInterval(mainTick, 1000);
    const t2 = setInterval(fastTick, 350);
    return () => { clearInterval(t1); clearInterval(t2); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  function handleStart() {
    stateRef.current = createInitialState();
    setFinalResult(null);
    setFeedback(null);
    setScreen("playing");
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      } else if (audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume();
      }
    } catch (e) { /* ignore */ }
    rerender();
  }

  const s = stateRef.current;
  const stage = getStage(s.timeLeft);
  const healthBarClass = s.health > 60 ? "bg-emerald-400" : s.health > 30 ? "bg-amber-400" : "bg-rose-500";
  const healthTextClass = s.health > 60 ? "text-emerald-400" : s.health > 30 ? "text-amber-400" : "text-rose-500";

  return (
    <div
      className="w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col select-none"
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
        backgroundSize: "34px 34px",
      }}
    >
      {screen === "start" && <StartScreen onStart={handleStart} />}
      {screen === "ended" && <EndScreen result={finalResult} onReplay={handleStart} />}

      {screen === "playing" && (
        <div className="flex-1 flex flex-col p-3 md:p-5 gap-3 md:gap-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-baseline gap-2">
              <span className="text-cyan-400 font-black tracking-tight text-lg md:text-2xl">SAVE THE SERVER</span>
              <span className="text-slate-500 text-xs md:text-sm font-mono uppercase">
                Stage {stage} 路 {STAGE_NAME[stage]}
              </span>
            </div>

            <div className="flex-1 min-w-[220px] max-w-md">
              <div className="flex items-center justify-between text-xs md:text-sm font-mono text-slate-400 mb-1">
                <span>System Health</span>
                <span className={healthTextClass}>{Math.round(s.health)}%</span>
              </div>
              <div className="h-3 md:h-4 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${healthBarClass} transition-all duration-500`}
                  style={{ width: `${Math.max(0, s.health)}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className={`font-mono font-black text-3xl md:text-5xl ${s.timeLeft <= 10 ? "text-rose-500 animate-pulse" : "text-slate-100"}`}>
                {Math.max(0, s.timeLeft)}
              </div>
              <button
                onClick={() => setMuted((m) => !m)}
                aria-label={muted ? "Unmute" : "Mute"}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
              >
                {muted ? <VolumeX className="w-5 h-5 text-slate-400" /> : <Volume2 className="w-5 h-5 text-slate-300" />}
              </button>
            </div>
          </div>

          <div className="grid gap-3 md:gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))" }}>
            {COMPONENT_DEFS.map((def) => (
              <ComponentCard key={def.id} def={def} data={s.components[def.id]} />
            ))}
          </div>

          <div className="flex-1" />
        </div>
      )}

      {screen === "playing" && s.activeIncident && (
        <div className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-slate-950" role="alertdialog" aria-live="assertive">
          <div
            className="w-full max-w-3xl bg-slate-900 border-2 border-rose-500 rounded-2xl p-5 md:p-8 shadow-2xl"
            style={{ boxShadow: "0 0 60px rgba(244,63,94,0.35)" }}
          >
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-8 h-8 md:w-10 md:h-10 text-rose-500 animate-pulse" />
              <div>
                <div className="text-rose-500 font-black text-2xl md:text-3xl tracking-tight">CRITICAL ALERT</div>
                <div className="text-slate-300 font-mono text-sm md:text-base uppercase">{s.activeIncident.incident.title}</div>
              </div>
            </div>

            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mb-5">
              <div
                className="h-full bg-rose-500"
                style={{ width: `${(s.incidentTimeLeft / s.incidentTotalTimeout) * 100}%`, transition: "width 1s linear" }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              {s.activeIncident.incident.symptoms.map((sym, i) => (
                <div key={i} className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                  <div className="text-slate-500 text-xs font-mono uppercase mb-1">{sym.label}</div>
                  <div className="text-slate-100 font-mono text-lg md:text-xl font-bold">{sym.value}</div>
                </div>
              ))}
            </div>

            <div className="grid gap-2 md:gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))" }}>
              {ACTIONS.map((a) => (
                <button
                  key={a.id}
                  onClick={() => handleAction(a.id)}
                  className="flex flex-col items-center justify-center gap-1.5 bg-slate-800 hover:bg-cyan-600 active:scale-95 border border-slate-700 hover:border-cyan-400 rounded-xl py-3 md:py-4 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                >
                  <a.icon className="w-5 h-5 md:w-6 md:h-6" />
                  <span className="text-xs md:text-sm font-bold tracking-wide">{a.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {screen === "playing" && feedback && (
        <div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none p-4">
          <div
            className={`px-8 py-6 rounded-2xl border-2 text-center ${
              feedback.type === "correct" ? "bg-emerald-950 border-emerald-400" : "bg-rose-950 border-rose-500"
            }`}
          >
            <div className={`text-3xl md:text-4xl font-black mb-1 ${feedback.type === "correct" ? "text-emerald-400" : "text-rose-500"}`}>
              {feedback.type === "correct" ? "\u2713 " : "\u2715 "}
              {feedback.title}
            </div>
            <div className="text-slate-300 text-sm md:text-base mb-1">{feedback.msg}</div>
            <div className={`font-mono font-bold text-lg ${feedback.type === "correct" ? "text-emerald-400" : "text-rose-500"}`}>
              {feedback.delta}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
