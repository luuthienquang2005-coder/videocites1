import React, { useState, useEffect } from "react";
import { Sun, Moon, Sparkles, ShieldCheck, Mail, MapPin, Globe } from "lucide-react";

interface MegaFooterProps {
  onNavigate?: (view: string) => void;
  theme: "dark" | "light";
  onToggleTheme: () => void;
}

export default function MegaFooter({ onNavigate, theme, onToggleTheme }: MegaFooterProps) {
  const isLight = theme === "light";

  const navLinks = (view: string) => {
    if (onNavigate) {
      onNavigate(view);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className={`w-full border-t font-sans transition-all duration-300 ${
      isLight 
        ? "bg-slate-50 border-slate-200 text-slate-800 shadow-inner" 
        : "bg-neutral-900 border-neutral-800 text-neutral-400 dark:bg-[#080808] dark:border-neutral-900"
    }`}>
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Top visual accent */}
        <div className={`flex flex-col md:flex-row items-start md:items-center justify-between pb-12 mb-12 border-b transition-colors duration-300 ${
          isLight ? "border-slate-200" : "border-neutral-800 dark:border-neutral-900/80"
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-white font-bold text-lg shadow-xl tracking-tight">
              V
            </div>
            <div>
              <span className={`text-xl font-bold tracking-wider transition-colors duration-300 ${
                isLight ? "text-slate-900" : "text-white dark:text-white"
              }`}>
                Videocites<span className="text-amber-500">.</span>
              </span>
              <p className={`text-xs mt-0.5 font-mono ${isLight ? "text-slate-600" : "text-neutral-500"}`}>ENTERPRISE COPYRIGHT STREAMING</p>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-6 md:mt-0">
            <span className={`text-xs font-mono ${isLight ? "text-slate-600" : "text-neutral-500"}`}>THEME ENGINE</span>
            <button
              onClick={onToggleTheme}
              className={`relative inline-flex h-9 w-20 items-center justify-between rounded-full p-1 cursor-pointer transition-colors border ${
                isLight 
                  ? "bg-slate-200 border-slate-300/60" 
                  : "bg-neutral-800 dark:bg-neutral-900/60 border-neutral-700 dark:border-neutral-800/80"
              }`}
              aria-label="Toggle theme"
            >
              <div 
                className={`absolute h-7 w-7 rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center ${
                  isLight 
                    ? "bg-white translate-x-0" 
                    : "bg-neutral-800 dark:bg-neutral-700 translate-x-11"
                }`}
              >
                {isLight ? (
                  <Sun className="w-4 h-4 text-amber-500" />
                ) : (
                  <Moon className="w-4 h-4 text-amber-400" />
                )}
              </div>
              <Sun className="w-3.5 h-3.5 text-slate-400 ml-2 pointer-events-none" />
              <Moon className="w-3.5 h-3.5 text-neutral-500 mr-2 pointer-events-none" />
            </button>
          </div>
        </div>

        {/* 4 Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Col 1: Brand Narrative */}
          <div className="space-y-4">
            <h4 className={`text-xs font-semibold tracking-wider uppercase font-mono transition-colors ${
              isLight ? "text-slate-800" : "text-white dark:text-white"
            }`}>
              About Platform
            </h4>
            <p className={`text-xs leading-relaxed transition-colors duration-300 ${
              isLight ? "text-slate-700" : "text-neutral-400 dark:text-neutral-500"
            }`}>
              Videocites is an ultra-high definition (UHD/4K) copyrighted video distribution, hosting, and streaming platform. Developed with maximum security architecture, it helps motion picture producers securely control and trace digital broadcast streams.
            </p>
            <div className={`flex items-center gap-2 text-xs border px-3 py-1.5 rounded-lg w-fit ${
              isLight ? "text-blue-600 bg-blue-50 border-blue-100" : "text-blue-500 bg-blue-500/10 border-blue-500/20"
            }`}>
              <ShieldCheck className="w-4 h-4" />
              <span>Pristine DRMS Enabled</span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-4">
            <h4 className={`text-xs font-semibold tracking-wider uppercase font-mono transition-colors ${
              isLight ? "text-slate-800" : "text-white dark:text-white"
            }`}>
              Explore
            </h4>
            <ul className="space-y-2.5 text-xs font-sans">
              <li>
                <button onClick={() => navLinks("home")} className={`hover:text-blue-500 transition-colors cursor-pointer text-left ${isLight ? "text-slate-700 hover:text-blue-600" : "text-neutral-400 dark:text-neutral-500"}`}>
                  Copyrighted Video Library
                </button>
              </li>
              <li>
                <button onClick={() => navLinks("home")} className={`hover:text-blue-500 transition-colors cursor-pointer text-left ${isLight ? "text-slate-700 hover:text-blue-600" : "text-neutral-400 dark:text-neutral-500"}`}>
                  Latest Releases
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Legal & Regulatory */}
          <div className="space-y-4">
            <h4 className={`text-xs font-semibold tracking-wider uppercase font-mono transition-colors ${
              isLight ? "text-slate-800" : "text-white dark:text-white"
            }`}>
              Legal & Contracts
            </h4>
            <ul className="space-y-2.5 text-xs font-sans">
              <li>
                <button onClick={() => navLinks("legal")} className={`hover:text-blue-500 transition-colors cursor-pointer text-left ${isLight ? "text-slate-700 hover:text-blue-600" : "text-neutral-400 dark:text-neutral-500"}`}>
                  DMCA Takedown Notice
                </button>
              </li>
              <li>
                <button onClick={() => navLinks("legal")} className={`hover:text-blue-500 transition-colors cursor-pointer text-left ${isLight ? "text-slate-700 hover:text-blue-600" : "text-neutral-400 dark:text-neutral-500"}`}>
                  Data Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => navLinks("legal")} className={`hover:text-blue-500 transition-colors cursor-pointer text-left ${isLight ? "text-slate-700 hover:text-blue-600" : "text-neutral-400 dark:text-neutral-500"}`}>
                  Enterprise Terms of Service
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Corporate Headquarter */}
          <div className="space-y-4">
            <h4 className={`text-xs font-semibold tracking-wider uppercase font-mono transition-colors ${
              isLight ? "text-slate-800" : "text-white dark:text-white"
            }`}>
              Contact & Headquarters
            </h4>
            <ul className="space-y-3 text-xs">
              <li className={`flex items-start gap-2.5 ${isLight ? "text-slate-700" : "text-neutral-400 dark:text-neutral-400"}`}>
                <MapPin className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <span>
                  728 Silicon Valley, High-Tech Complex, San Jose City, California, USA.
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                <a href="mailto:support@videocites.com" className={`hover:text-blue-500 transition-colors ${isLight ? "text-slate-700 hover:text-blue-600" : "text-neutral-400 dark:text-neutral-400"}`}>
                  support@videocites.com
                </a>
              </li>
              <li className={`flex items-center gap-2.5 ${isLight ? "text-slate-700" : "text-neutral-400 dark:text-neutral-400"}`}>
                <Globe className="w-4 h-4 text-blue-500 shrink-0" />
                <span>Global DRMS Network</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Line */}
        <div className={`mt-16 pt-8 border-t text-xs flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors duration-300 ${
          isLight ? "border-slate-200" : "border-neutral-800 dark:border-neutral-900/60"
        }`}>
          <div className={`font-sans text-center sm:text-left ${isLight ? "text-slate-600" : "text-neutral-500 dark:text-neutral-600"}`}>
            <span>© 2026 Videocites ID LTD. All rights reserved.</span>
          </div>
          <div className={`flex gap-6 font-mono text-[11px] ${isLight ? "text-slate-600" : "text-neutral-500 dark:text-neutral-600"}`}>
            <span>SECURE MD5 CERTIFIED</span>
            <span>UHD STREAM V2.4</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
