import React, { useState } from "react";
import { Shield, BookOpen, UserCheck, Scale } from "lucide-react";

export default function LegalPage() {
  const [activeTab, setActiveTab] = useState<"dmca" | "privacy" | "terms">("dmca");

  return (
    <div className="w-full py-12 px-6 font-sans select-none min-h-screen transition-colors duration-300">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="border-b border-slate-200 dark:border-white/10 pb-8 mb-10">
          <div className="flex items-center gap-2 text-blue-500 font-mono text-xs tracking-widest uppercase mb-1">
            <Scale className="w-4 h-4" />
            <span>Videocites Law & Compliance</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Legal Framework & Intellectual Property</h1>
          <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">Last Updated: July 1, 2026. Nationally and internationally applicable to the Videocites DRMS platform.</p>
        </div>

        {/* Layout with Sidebar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 items-start">
          
          {/* Sidebar */}
          <div className="md:col-span-1 space-y-2">
            <button
              onClick={() => setActiveTab("dmca")}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold tracking-wide transition-all flex items-center gap-2.5 cursor-pointer border ${
                activeTab === "dmca"
                  ? "bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/10 font-black"
                  : "bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-600 dark:text-neutral-400 hover:bg-slate-200/70 dark:hover:bg-white/10 hover:text-slate-800 dark:hover:text-white"
              }`}
            >
              <Shield className="w-4 h-4" />
              DMCA Policy
            </button>

            <button
              onClick={() => setActiveTab("privacy")}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold tracking-wide transition-all flex items-center gap-2.5 cursor-pointer border ${
                activeTab === "privacy"
                  ? "bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/10 font-black"
                  : "bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-600 dark:text-neutral-400 hover:bg-slate-200/70 dark:hover:bg-white/10 hover:text-slate-800 dark:hover:text-white"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Privacy Policy
            </button>

            <button
              onClick={() => setActiveTab("terms")}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold tracking-wide transition-all flex items-center gap-2.5 cursor-pointer border ${
                activeTab === "terms"
                  ? "bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/10 font-black"
                  : "bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-600 dark:text-neutral-400 hover:bg-slate-200/70 dark:hover:bg-white/10 hover:text-slate-800 dark:hover:text-white"
              }`}
            >
              <UserCheck className="w-4 h-4" />
              Terms of Service
            </button>
          </div>

          {/* Legal document details */}
          <div className="md:col-span-3 bg-white dark:bg-zinc-900/30 border border-slate-200 dark:border-white/5 p-8 rounded-2xl min-h-[400px] shadow-xl shadow-slate-100 dark:shadow-none transition-all">
            {activeTab === "dmca" && (
              <div className="space-y-6 text-xs leading-relaxed text-slate-600 dark:text-neutral-400 font-sans">
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white border-b border-slate-100 dark:border-white/10 pb-3">
                  DMCA Copyright Infringement Notice
                </h2>
                
                <p>
                  Videocites Ltd. (“Videocites”) respects the intellectual property rights of others. In accordance with the Digital Millennium Copyright Act (DMCA), we respond promptly to notices of alleged copyright infringement that are reported to our designated Copyright Agent.
                </p>

                <div className="pl-4 border-l-2 border-blue-500 space-y-4">
                  <h3 className="font-bold text-slate-800 dark:text-white uppercase text-[10px] tracking-wider font-mono">
                    1. TAKEDOWN NOTICE SUBMISSION PROCESS
                  </h3>
                  <p>
                    To submit a request to remove infringing content on Videocites's CDN servers, the copyright owner or their authorized agent must provide a digitally signed written notification containing the following legal documents:
                  </p>
                  <ul className="list-decimal pl-5 space-y-2">
                    <li>Accurate identification of the copyrighted work claimed to have been infringed.</li>
                    <li>Identification of the specific URL containing the infringing material for immediate server scrubbing.</li>
                    <li>Detailed contact information (email, mailing address, legal representative phone number).</li>
                    <li>A statement made in good faith that use of the material is not authorized by the copyright owner.</li>
                  </ul>
                </div>

                <div className="pl-4 border-l-2 border-slate-200 dark:border-white/10 space-y-2">
                  <h3 className="font-bold text-slate-800 dark:text-white uppercase text-[10px] tracking-wider font-mono">
                    2. DESIGNATED LEGAL AGENT FOR COMPLAINTS
                  </h3>
                  <p>All formal legal communications should be directed to our designated agent:</p>
                  <p className="font-mono text-slate-700 dark:text-neutral-300">
                    Designated Agent: Videocites Legal Department (Lead IP Counsel)<br />
                    Videocites Corporate, Silicon Valley, CA, USA.<br />
                    Email: support@videocites.com
                  </p>
                </div>
              </div>
            )}

            {activeTab === "privacy" && (
              <div className="space-y-6 text-xs leading-relaxed text-slate-600 dark:text-neutral-400 font-sans">
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white border-b border-slate-100 dark:border-white/10 pb-3">
                  Privacy Policy & Stream Security
                </h2>

                <p>
                  Videocites Ltd. is committed to protecting the privacy of our users and distributors. This policy outlines how we collect and store digital identifiers to prevent unauthorized content duplication.
                </p>

                <div className="pl-4 border-l-2 border-blue-500 space-y-4">
                  <h3 className="font-bold text-slate-800 dark:text-white uppercase text-[10px] tracking-wider font-mono">
                    1. DYNAMIC ON-SCREEN VIDEO WATERMARKING
                  </h3>
                  <p>
                    To prevent illegal screen recording, Videocites automatically overlays a subtle dynamic watermark containing the viewer's digital signature (<span className="text-blue-500 font-mono">mnzfrankie@gmail.com</span>) and current session IP address.
                  </p>
                  <p>
                    This identifier shifts locations randomly and continuously changes opacity frequencies to bypass standard decryption software.
                  </p>
                </div>

                <div className="pl-4 border-l-2 border-slate-200 dark:border-white/10 space-y-2">
                  <h3 className="font-bold text-slate-800 dark:text-white uppercase text-[10px] tracking-wider font-mono">
                    2. USER AUTHENTICATION & ENCRYPTION
                  </h3>
                  <p>
                    All API requests and transmissions are secured using high-grade SSL/TLS AES-256 encryption. We never store raw passwords and do not disclose user records to third parties unless required by legal authorities regarding intellectual property disputes.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "terms" && (
              <div className="space-y-6 text-xs leading-relaxed text-slate-600 dark:text-neutral-400 font-sans">
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white border-b border-slate-100 dark:border-white/10 pb-3">
                  Videocites Platform Terms of Use
                </h2>

                <p>
                  By accessing or using any services provided by Videocites, you unconditionally agree to be bound by the following strict terms and conditions:
                </p>

                <div className="pl-4 border-l-2 border-blue-500 space-y-4">
                  <h3 className="font-bold text-slate-800 dark:text-white uppercase text-[10px] tracking-wider font-mono">
                    1. PROHIBITION OF DOWNLOADING & DECOMPILATION
                  </h3>
                  <p>
                    Users are strictly prohibited from utilizing any tool, script, or browser extension to intercept, download, or decrypt .mp4 streams from Videocites CDN. Deep interception of the network stream will result in permanent account termination and civil liability.
                  </p>
                </div>

                <div className="pl-4 border-l-2 border-slate-200 dark:border-white/10 space-y-2">
                  <h3 className="font-bold text-slate-800 dark:text-white uppercase text-[10px] tracking-wider font-mono">
                    2. ACCESS LICENSE LIMITATIONS
                  </h3>
                  <p>
                    Each user account is granted an individual viewing license. Sharing credentials across multiple concurrent IP addresses will trigger automatic session suspension to protect against streaming link distribution.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
