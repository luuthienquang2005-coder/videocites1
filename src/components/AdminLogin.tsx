import React, { useState } from "react";
import { Lock, Unlock, Fingerprint, ScanFace, KeyRound, ShieldAlert, Activity, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState("");
  const [scanComplete, setScanComplete] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Default passcode: cuong123
    if (passcode === "cuong123") {
      onLoginSuccess();
    } else {
      setError("Incorrect security passcode. Please try again!");
      setPasscode("");
      setTimeout(() => setError(""), 4000);
    }
  };

  const handleBiometricSimulate = () => {
    if (isScanning) return;
    setIsScanning(true);
    setError("");
    
    const steps = [
      "Initializing DRMS handshake protocol...",
      "Scanning biometric facial features...",
      "Matching 3D security fingerprint...",
      "Verifying secure cryptographic signatures...",
      "Decrypting secure session credentials..."
    ];

    let current = 0;
    setScanStep(steps[0]);

    const interval = setInterval(() => {
      current++;
      if (current < steps.length) {
        setScanStep(steps[current]);
      } else {
        clearInterval(interval);
        setScanComplete(true);
        setTimeout(() => {
          onLoginSuccess();
        }, 800);
      }
    }, 600);
  };

  return (
    <div className="w-full py-16 px-6 font-sans select-none min-h-[80vh] flex items-center justify-center transition-colors duration-300">
      <div className="max-w-md w-full">
        
        {/* Core Auth Panel */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-zinc-900/30 border border-slate-200 dark:border-white/5 p-8 rounded-3xl relative overflow-hidden backdrop-blur-xl shadow-2xl shadow-slate-200/50 dark:shadow-none transition-colors duration-300"
        >
          {/* Cyan/Blue glow effect */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/5 blur-3xl pointer-events-none rounded-full" />
          <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-purple-500/5 blur-3xl pointer-events-none rounded-full" />
          
          <div className="text-center space-y-3 mb-8">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 dark:text-blue-400">
              {scanComplete ? (
                <Unlock className="w-6 h-6 animate-bounce" />
              ) : (
                <Lock className="w-6 h-6" />
              )}
            </div>
            
            <div>
              <span className="text-[10px] font-mono tracking-widest text-blue-500 uppercase font-bold">
                ADMINISTRATOR AUTHENTICATION
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">DRM ADMINISTRATION PANEL</h2>
              <p className="text-xs text-slate-800 dark:text-neutral-400 mt-1.5 leading-relaxed">
                Secure content publishing and film stream management area reserved for Videocites Team. Please verify your identity to unlock the console.
              </p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {!isScanning ? (
              <motion.form 
                key="login-form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit} 
                className="space-y-5"
              >
                {/* Error alert */}
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-500 dark:text-rose-400 rounded-xl text-xs font-mono flex items-start gap-2.5"
                  >
                    <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </motion.div>
                )}

                {/* Passcode Input Field */}
                <div className="space-y-2">
                  <label className="text-[10px] font-mono font-bold tracking-wider text-slate-700 dark:text-neutral-400 uppercase block">
                    SECURITY PASSCODE
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 dark:bg-[#050505] border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-center font-mono text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-neutral-600 focus:outline-none focus:border-blue-500 transition-colors"
                      required
                    />
                    <KeyRound className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500 dark:text-neutral-500" />
                  </div>
                </div>

                {/* Action Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-extrabold text-xs tracking-wider uppercase py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg shadow-blue-500/10"
                >
                  <Unlock className="w-4 h-4" />
                  Login
                </button>

                {/* Simulated Biometric Shortcut */}
                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-slate-200 dark:border-white/5"></div>
                  <span className="flex-shrink mx-4 text-[9px] font-mono text-slate-600 dark:text-neutral-500 uppercase tracking-widest">
                    Or use quick biometric scan
                  </span>
                  <div className="flex-grow border-t border-slate-200 dark:border-white/5"></div>
                </div>

                <button
                  type="button"
                  onClick={handleBiometricSimulate}
                  className="w-full bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-neutral-300 font-bold text-xs py-3 px-6 rounded-xl flex items-center justify-center gap-2.5 transition-all cursor-pointer"
                >
                  <Fingerprint className="w-4 h-4 text-blue-500 dark:text-blue-400 animate-pulse" />
                  Scan Fingerprint / FaceID (Simulated)
                </button>
              </motion.form>
            ) : (
              <motion.div 
                key="biometric-scan"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-6 flex flex-col items-center justify-center text-center space-y-6"
              >
                {/* Fingerprint Scanning animation */}
                <div className="relative w-24 h-24 flex items-center justify-center">
                  {/* Glowing pulses */}
                  <div className="absolute inset-0 rounded-full border border-blue-500/30 animate-ping" />
                  <div className="absolute inset-2 rounded-full border-2 border-dashed border-blue-400/50 animate-spin" />
                  
                  <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 dark:text-blue-400 z-10">
                    {scanComplete ? (
                      <CheckCircle2 className="w-8 h-8 text-emerald-500 dark:text-emerald-400 animate-bounce" />
                    ) : (
                      <ScanFace className="w-8 h-8 animate-pulse text-blue-500 dark:text-blue-400" />
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 text-xs text-blue-600 dark:text-blue-400 font-mono">
                    <Activity className="w-3.5 h-3.5 animate-pulse" />
                    <span>BIOMETRIC SCAN IN PROGRESS...</span>
                  </div>
                  
                  <p className="text-xs text-slate-700 dark:text-neutral-300 font-mono bg-slate-50 dark:bg-[#050505] border border-slate-200 dark:border-white/5 px-4 py-2.5 rounded-xl inline-block max-w-xs truncate">
                    {scanStep}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Guest Security Status Notice */}
        <div className="mt-6 text-center text-[10px] font-mono text-slate-400 dark:text-neutral-500 uppercase tracking-wider">
          <span>Session ID: VIDEOCITES-TLS-SESSION-M</span>
        </div>

      </div>
    </div>
  );
}
