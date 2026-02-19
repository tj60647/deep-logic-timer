
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TimerStatus, RobotMessage } from './types';
import { getRoboticStatus } from './services/geminiService';
import { CELESTIAL_BODIES, NOTABLE_COMETS, formatOrbitalPeriod } from './services/celestialData';
import { ThreeScene } from './components/ThreeScene';
import { 
  Play, Pause, RotateCcw,
  Terminal, Activity, Layers, Globe, Radio, 
  Settings, Database, Sun, Moon
} from 'lucide-react';

const INITIAL_TIME = 5 * 60; // 5 minutes in seconds

const App: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
  const [status, setStatus] = useState<TimerStatus>(TimerStatus.IDLE);
  const [messages, setMessages] = useState<RobotMessage[]>([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isDark, setIsDark] = useState(true);
  
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    document.body.classList.toggle('light-mode', !isDark);
  }, [isDark]);

  const addMessage = useCallback((text: string, type: RobotMessage['type'] = 'info') => {
    const newMessage: RobotMessage = {
      text,
      type,
      timestamp: Date.now()
    };
    setMessages(prev => [newMessage, ...prev].slice(0, 10));
  }, []);

  const fetchAIStatus = useCallback(async () => {
    if (status === TimerStatus.RUNNING) {
      const msg = await getRoboticStatus(timeLeft);
      addMessage(msg, 'status');
    }
  }, [status, timeLeft, addMessage]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (status === TimerStatus.RUNNING) fetchAIStatus();
    }, 40000);
    return () => clearInterval(interval);
  }, [status, fetchAIStatus]);

  useEffect(() => {
    if (status === TimerStatus.RUNNING && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setStatus(TimerStatus.COMPLETED);
            addMessage(`PHOBOS COMPLETES ONE ORBIT IN ${CELESTIAL_BODIES[0].orbitalPeriodHours.toFixed(2)}H. SESSION ELAPSED. NEXT: HALLEY'S COMET ${NOTABLE_COMETS[0].nextPerihelion}.`, "alert");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status, timeLeft, addMessage]);

  const toggleTimer = () => {
    if (status === TimerStatus.RUNNING) {
      setStatus(TimerStatus.PAUSED);
      addMessage("TEMPORAL DISPLACEMENT FROZEN.", "warning");
    } else {
      setStatus(TimerStatus.RUNNING);
      addMessage("INITIATING ALIEN LOGIC SEQUENCE.", "info");
    }
  };

  const resetTimer = () => {
    setStatus(TimerStatus.IDLE);
    setTimeLeft(INITIAL_TIME);
    addMessage("CALIBRATING INTERSTELLAR COORDINATES...", "info");
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX / innerWidth - 0.5) * 60;
    const y = (clientY / innerHeight - 0.5) * 60;
    setMousePos({ x, y });
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };



  return (
    <div 
      className={`relative w-full h-screen flex items-center justify-center overflow-hidden transition-all duration-700 select-none ${isDark ? 'bg-black' : 'bg-slate-100'}`}
      onMouseMove={handleMouseMove}
    >
      {/* THREE.JS ORBITING CAMERA SCENE */}
      <ThreeScene isRunning={status === TimerStatus.RUNNING} />

      <div className="glitch-overlay absolute inset-0 z-50 pointer-events-none" />

      {/* ALIEN ASTROLABE CORE */}
      <div 
        className="relative perspective-scene w-full h-full flex items-center justify-center"
        style={{ 
          transform: `rotateX(${-mousePos.y * 0.2}deg) rotateY(${mousePos.x * 0.2}deg)`
        }}
      >
        {/* MULTI-AXIS ORBITING RINGS rendered in Three.js scene above */}

        {/* 3D FLOATING CIRCUITRY NODES */}
        <div className="absolute inset-0 pointer-events-none" style={{ transformStyle: 'preserve-3d' }}>
           <div className="absolute top-1/4 left-1/4 w-[1px] h-64 bg-cyan-500/20 transform translateZ(300px) rotateY(45deg)" />
           <div className="absolute bottom-1/4 right-1/4 w-96 h-[1px] bg-purple-500/20 transform translateZ(-400px) rotateX(120deg)" />
        </div>

        {/* MAIN HUD INTERFACE - FRAGMENTED GLASS PLANES */}
        
        {/* Plane 1: Background Blur Shadow */}
        <div className="absolute w-[600px] h-[500px] bg-cyan-500/5 blur-3xl rounded-full transform translateZ(50px) pointer-events-none opacity-20" />

        {/* Plane 2: The Main Console */}
        <div 
          className="relative glass-pane w-[580px] h-[480px] rounded-[3rem] p-12 flex flex-col transform translateZ(250px) transition-transform duration-500 group"
          style={{ 
            boxShadow: '0 0 100px rgba(0, 0, 0, 0.8), inset 0 0 40px rgba(0, 255, 255, 0.05)'
          }}
        >
          {/* Holographic Header */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-500/10 rounded-xl animate-pulse">
                  <Globe size={20} className="text-cyan-400" />
                </div>
                <div className="flex flex-col">
                  <span className={`font-orbitron text-base tracking-[0.4em] uppercase leading-none ${isDark ? 'text-white/90' : 'text-slate-900'}`}>Astrolabe X-0</span>
                  <span className="text-[9px] text-cyan-400/50 font-bold tracking-[0.2em] mt-1">NASA_JPL_HORIZONS_v7</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
               <div className="flex flex-col items-end mr-4">
                 <div className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">Signal_Str</div>
                 <div className="flex gap-0.5 mt-1">
                   {[1,2,3,4,5].map(b => <div key={b} className={`w-1 h-3 ${b < 4 ? 'bg-cyan-500' : 'bg-gray-800'}`} />)}
                 </div>
               </div>
               <div className="p-2 bg-white/5 rounded-lg border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                  <Settings size={14} className="text-gray-400" />
               </div>
               <button
                 onClick={() => setIsDark(d => !d)}
                 className="p-2 bg-white/5 rounded-lg border border-white/5 cursor-pointer hover:bg-white/10 transition-colors"
                 title="Toggle light/dark mode"
               >
                 {isDark ? <Sun size={14} className="text-gray-400" /> : <Moon size={14} className="text-gray-600" />}
               </button>
            </div>
          </div>

          {/* TIMER CORE - VIBRATING & SPATIAL */}
          <div className="flex-1 flex flex-col items-center justify-center relative">
            {/* Pulsing Aura */}
            <div className={`absolute w-80 h-80 rounded-full border border-dashed transition-all duration-1000 ${status === TimerStatus.RUNNING ? 'border-cyan-500/20 animate-spin-z-cw' : 'border-gray-800'}`} />
            
            <div className="relative group/time text-center">
              <div className={`absolute inset-0 blur-3xl opacity-20 font-orbitron text-[10rem] scale-125 select-none pointer-events-none transition-all duration-1000 ${status === TimerStatus.RUNNING ? 'text-cyan-400' : 'text-gray-500'}`}>
                {formatTime(timeLeft)}
              </div>
              <div className={`font-orbitron text-[8.5rem] tracking-tighter select-none transition-all duration-700 relative z-10 
                ${status === TimerStatus.RUNNING ? `${isDark ? 'text-white' : 'text-slate-900'} drop-shadow-[0_0_30px_rgba(0,255,255,0.4)]` : `${isDark ? 'text-gray-700' : 'text-slate-400'}`} 
                ${timeLeft < 600 && status === TimerStatus.RUNNING ? 'animate-flicker text-red-500' : ''}`}>
                {formatTime(timeLeft)}
              </div>
              
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full border border-white/5 backdrop-blur-md">
                 <Radio size={10} className="text-cyan-400 animate-pulse" />
                 <span className="text-[8px] text-cyan-400 font-bold tracking-[0.2em] uppercase">Temporal Stream Active</span>
              </div>
            </div>
          </div>

          {/* LOWER CONTROLS & STATUS */}
          <div className="mt-8 flex items-end justify-between px-2">
            <div className="flex gap-4">
               <button 
                onClick={resetTimer}
                className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all active:scale-90"
                title="Recall Sequence"
               >
                 <RotateCcw size={22} />
               </button>
               <button 
                className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"
               >
                 <Database size={22} />
               </button>
            </div>

            <button 
              onClick={toggleTimer}
              className={`relative w-28 h-28 rounded-full flex items-center justify-center transition-all duration-500 transform active:scale-90 shadow-2xl
                ${status === TimerStatus.RUNNING 
                  ? 'bg-red-500/10 text-red-500 border-red-500/30' 
                  : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                } border-[2px] group`}
            >
              <div className={`absolute inset-0 rounded-full animate-ping opacity-10 ${status === TimerStatus.RUNNING ? 'bg-red-500' : 'bg-cyan-500'}`} />
              <div className="absolute inset-2 rounded-full border border-dashed border-current opacity-20 animate-spin-z-cw" />
              {status === TimerStatus.RUNNING ? <Pause size={48} fill="currentColor" /> : <Play size={48} fill="currentColor" className="ml-2" />}
            </button>

            <div className="flex flex-col items-end gap-3 w-40">
               <div className="flex items-center gap-2 text-cyan-400/60">
                  <Activity size={12} />
                  <span className="text-[10px] font-bold tracking-widest uppercase">System Load</span>
               </div>
               <div className="w-full h-2 bg-gray-900/50 rounded-full overflow-hidden border border-white/5 p-[1px]">
                 <div className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 shadow-[0_0_15px_rgba(0,255,255,0.6)] transition-all duration-1000" style={{ width: `${(timeLeft / INITIAL_TIME) * 100}%` }} />
               </div>
               <div className="text-[9px] text-gray-500 font-mono italic">
                 {Math.round((timeLeft / INITIAL_TIME) * 100)}% Vector Efficiency
               </div>
            </div>
          </div>
        </div>

        {/* SIDE WIDGET: NEURAL FEED (SPATIAL POSITION) */}
        <div 
          className="absolute top-20 -right-40 w-80 glass-pane rounded-[2rem] p-8 transform translateZ(500px) rotateY(-25deg) shadow-2xl transition-all duration-300 pointer-events-none"
        >
          <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
             <div className="flex items-center gap-2">
                <Terminal size={16} className="text-purple-400" />
                <span className={`text-[11px] font-bold uppercase tracking-widest ${isDark ? 'text-white/80' : 'text-slate-700'}`}>Neural Log</span>
             </div>
             <div className="text-[9px] text-purple-400/50 font-mono">LIVE_X88</div>
          </div>
          <div className="space-y-4 max-h-[300px] overflow-hidden">
            {messages.length === 0 && <div className="text-[11px] text-gray-600 animate-pulse italic">Connecting to logic core...</div>}
            {messages.map((msg, idx) => (
              <div key={msg.timestamp} className={`text-[11px] font-mono leading-relaxed flex flex-col gap-1 transition-all duration-500 opacity-${Math.max(20, 100 - (idx * 15))}`}>
                <div className="flex justify-between items-center opacity-40">
                  <span className="text-[9px]">LOG_{msg.timestamp.toString(16).slice(-4)}</span>
                  <span className="text-[9px]">{new Date(msg.timestamp).toLocaleTimeString([], { hour12: false, second: '2-digit' })}</span>
                </div>
                <span className={`${msg.type === 'alert' ? 'text-red-400 font-bold' : msg.type === 'warning' ? 'text-yellow-400' : 'text-cyan-400/80'}`}>
                  {msg.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* FRONT OVERLAY: ORBITAL SENSOR DATA */}
        <div className="absolute -bottom-10 -left-20 glass-pane w-72 p-6 rounded-[2rem] transform translateZ(600px) rotateX(10deg) pointer-events-none">
           <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-bold text-cyan-400/80 uppercase tracking-[0.2em]">Orbital Frequency</span>
              <Layers size={14} className="text-cyan-500/50" />
           </div>
           <div className="flex items-end gap-1.5 h-16">
             {Array.from({ length: 20 }).map((_, i) => (
               <div 
                key={i} 
                className="flex-1 bg-cyan-500/30 rounded-full" 
                style={{ 
                  height: `${Math.random() * 100}%`,
                  transition: 'height 0.8s ease-in-out',
                  animation: `flicker ${2 + Math.random() * 2}s infinite ${i * 0.05}s`
                }} 
               />
             ))}
           </div>
           <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                 <div className="text-[8px] text-gray-500 uppercase">Phobos T</div>
                 <div className="text-xs text-cyan-400 font-mono">{formatOrbitalPeriod(CELESTIAL_BODIES[0].orbitalPeriodHours)}</div>
              </div>
              <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                 <div className="text-[8px] text-gray-500 uppercase">Io T</div>
                 <div className="text-xs text-purple-400 font-mono">{formatOrbitalPeriod(CELESTIAL_BODIES[2].orbitalPeriodHours)}</div>
              </div>
           </div>
        </div>
      </div>

      {/* FOOTER - SYSTEM ANCHOR */}
      <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-6 backdrop-blur-xl border px-8 py-3 rounded-full shadow-2xl ${isDark ? 'bg-black/80 border-white/10' : 'bg-white/80 border-gray-200'}`}>
         <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]" />
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.3em]">NASA JPL Orbital Sync Active</span>
         </div>
         <div className="h-5 w-[1px] bg-white/10" />
         <div className="flex gap-4">
           <div className="flex flex-col items-center">
             <span className="text-[8px] text-gray-600 uppercase">X_Coordinate</span>
             <span className="text-[10px] text-cyan-400/60 font-mono">{Math.round(mousePos.x)}</span>
           </div>
           <div className="flex flex-col items-center">
             <span className="text-[8px] text-gray-600 uppercase">Y_Coordinate</span>
             <span className="text-[10px] text-cyan-400/60 font-mono">{Math.round(mousePos.y)}</span>
           </div>
         </div>
      </div>
    </div>
  );
};

export default App;
