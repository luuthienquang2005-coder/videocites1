import React from "react";
import { Sparkles, Compass, ShieldAlert, Award, MessageSquare, ShieldCheck, Lock, Unlock, LogOut, Sun, Moon, Film } from "lucide-react";

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  isAdmin: boolean;
  onLogout: () => void;
  theme: "dark" | "light";
  onToggleTheme: () => void;
}

export default function Navbar({ currentView, onNavigate, isAdmin, onLogout, theme, onToggleTheme }: NavbarProps) {
  const isLight = theme === "light";
  
  return (
    <nav className={`sticky top-0 z-50 w-full backdrop-blur-xl border-b font-sans transition-all duration-300 ${
      isLight 
        ? "bg-white/85 border-slate-200/80 text-slate-800 shadow-sm shadow-slate-100" 
        : "bg-black/50 border-white/10 text-[#E5E5E5]"
    }`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Left Brand Area */}
        <div 
          onClick={() => onNavigate("home")}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-extrabold text-sm tracking-tight shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
            V
          </div>
          <div>
            <span className={`text-base font-black tracking-tighter transition-colors ${
              isLight ? "text-slate-900" : "text-white"
            }`}>
              VIDEOCITES<span className="text-blue-500">.</span>
            </span>
            <div className="flex items-center gap-1">
              <span className={`text-[8px] font-mono font-bold uppercase tracking-widest leading-none ${
                isLight ? "text-blue-600" : "text-blue-400"
              }`}>DRMS SECURE FEED</span>
              <ShieldCheck className="w-2.5 h-2.5 text-blue-500 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Center Navigation Links (Premium responsive) */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase font-mono">
          <button
            onClick={() => onNavigate("home")}
            className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              currentView === "home"
                ? isLight ? "text-blue-600 bg-blue-500/10" : "text-blue-400 bg-blue-500/10"
                : isLight ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100" : "text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Explore</span>
          </button>

          <button
            onClick={() => onNavigate("videos")}
            className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              currentView === "videos"
                ? isLight ? "text-blue-600 bg-blue-500/10" : "text-blue-400 bg-blue-500/10"
                : isLight ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100" : "text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Videos</span>
          </button>

          <button
            onClick={() => onNavigate("legal")}
            className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              currentView === "legal"
                ? isLight ? "text-blue-600 bg-blue-500/10" : "text-blue-400 bg-blue-500/10"
                : isLight ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100" : "text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Legal & DMCA</span>
          </button>

          <button
            onClick={() => onNavigate("contact")}
            className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              currentView === "contact"
                ? isLight ? "text-blue-600 bg-blue-500/10" : "text-blue-400 bg-blue-500/10"
                : isLight ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100" : "text-neutral-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Contact</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => onNavigate("admin")}
              className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                currentView === "admin"
                  ? isLight ? "text-blue-600 bg-blue-500/10" : "text-blue-400 bg-blue-500/10"
                  : isLight ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100" : "text-neutral-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Admin Panel</span>
            </button>
          )}
        </div>

        {/* Right Area: Identity marker & Authentication Toggle */}
        <div className="flex items-center gap-3">
          
          {/* Beautiful Sun / Moon Toggle */}
          <button
            onClick={onToggleTheme}
            className={`p-2 rounded-xl transition-all duration-300 cursor-pointer flex items-center justify-center ${
              isLight 
                ? "text-amber-600 bg-amber-500/10 hover:bg-amber-500/20" 
                : "text-amber-400 bg-white/5 hover:bg-white/10"
            }`}
            title={isLight ? "Bật giao diện tối" : "Bật giao diện sáng"}
          >
            {isLight ? <Moon className="w-4 h-4 text-slate-700" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </button>

          {isAdmin ? (
            <div className="flex items-center gap-3">
              <div className="hidden md:flex flex-col items-end text-right">
                <span className="text-[9px] font-mono text-purple-600 dark:text-purple-400 font-bold uppercase tracking-widest leading-none">
                  ADMIN PORTAL
                </span>
                <span className={`text-[10px] font-mono font-bold mt-1 leading-none ${
                  isLight ? "text-blue-600" : "text-blue-400"
                }`}>
                  mnzfrankie@gmail.com
                </span>
              </div>
              <button
                onClick={onLogout}
                className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-mono font-bold"
                title="Exit admin panel"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden lg:inline text-[10px]">EXIT ADMIN</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="hidden md:flex flex-col items-end text-right">
                <span className={`text-[9px] font-mono uppercase tracking-widest leading-none ${
                  isLight ? "text-slate-500" : "text-neutral-400"
                }`}>
                  SECURE GUEST
                </span>
                <span className={`text-[10px] font-mono font-bold mt-1 leading-none ${
                  isLight ? "text-blue-600" : "text-blue-400"
                }`}>
                  mnzfrankie@gmail.com
                </span>
              </div>
              <button
                onClick={() => onNavigate("admin")}
                className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 text-xs font-mono font-bold ${
                  isLight 
                    ? "bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 border-blue-500/20" 
                    : "bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border-blue-500/20"
                }`}
                title="Admin login"
              >
                <Lock className="w-3.5 h-3.5" />
                <span className="hidden lg:inline text-[10px]">LOGIN</span>
              </button>
            </div>
          )}

          <div 
            onClick={() => onNavigate("contact")}
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 border border-white/20 flex items-center justify-center text-white text-xs font-black cursor-pointer hover:scale-105 transition-transform shadow-md"
            title="Secure session"
          >
            M
          </div>
        </div>

      </div>

      {/* Mobile nav drawer banner for small devices */}
      <div className={`sm:hidden flex items-center justify-around border-t py-2.5 text-[9px] font-mono font-bold tracking-wider uppercase transition-colors duration-300 ${
        isLight 
          ? "bg-slate-50 border-slate-200 text-slate-500" 
          : "bg-black/90 border-white/5 text-neutral-400"
      }`}>
        <button onClick={() => onNavigate("home")} className={currentView === "home" ? isLight ? "text-blue-600" : "text-blue-400" : ""}>EXPLORE</button>
        <button onClick={() => onNavigate("videos")} className={currentView === "videos" ? isLight ? "text-blue-600" : "text-blue-400" : ""}>VIDEOS</button>
        <button onClick={() => onNavigate("legal")} className={currentView === "legal" ? isLight ? "text-blue-600" : "text-blue-400" : ""}>LEGAL</button>
        <button onClick={() => onNavigate("contact")} className={currentView === "contact" ? isLight ? "text-blue-600" : "text-blue-400" : ""}>CONTACT</button>
        {isAdmin && (
          <button onClick={() => onNavigate("admin")} className={currentView === "admin" ? isLight ? "text-blue-600" : "text-blue-400" : ""}>ADMIN PANEL</button>
        )}
      </div>
    </nav>
  );
}
