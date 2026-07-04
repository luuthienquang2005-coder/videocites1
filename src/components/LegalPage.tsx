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
          <p className="text-xs text-slate-700 dark:text-neutral-400 mt-1">Last Updated: July 1, 2026. Nationally and internationally applicable to the Videocites DRMS platform.</p>
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
                  : "bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-800 dark:text-neutral-400 hover:bg-slate-200/70 dark:hover:bg-white/10 hover:text-slate-950 dark:hover:text-white"
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
                  : "bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-800 dark:text-neutral-400 hover:bg-slate-200/70 dark:hover:bg-white/10 hover:text-slate-950 dark:hover:text-white"
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
                  : "bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-800 dark:text-neutral-400 hover:bg-slate-200/70 dark:hover:bg-white/10 hover:text-slate-950 dark:hover:text-white"
              }`}
            >
              <UserCheck className="w-4 h-4" />
              Terms of Service
            </button>
          </div>

          {/* Legal document details */}
          <div className="md:col-span-3 bg-white dark:bg-zinc-900/30 border border-slate-200 dark:border-white/5 p-8 rounded-2xl min-h-[400px] shadow-xl shadow-slate-100 dark:shadow-none transition-all">
            {activeTab === "dmca" && (
              <div className="space-y-8 text-xs leading-relaxed text-slate-800 dark:text-neutral-400 font-sans">
                <div className="border-b border-slate-100 dark:border-white/10 pb-4">
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                    Digital Millennium Copyright Act (DMCA) Compliance Policy
                  </h2>
                  <p className="text-[11px] text-slate-600 dark:text-neutral-500 mt-1">Videocites ID LTD Intellectual Property Protection Standard</p>
                </div>
                
                <p>
                  Videocites ID LTD (“Videocites”, “Company”, “we”, “our”, or “us”) respects the intellectual property rights of creators, broadcasters, and rights holders worldwide. In accordance with the Digital Millennium Copyright Act (17 U.S.C. § 512, hereinafter the “DMCA”), we have established rigorous procedures to address notices of alleged copyright infringement and process appropriate counter-notifications.
                </p>

                <p>
                  As an advanced Digital Rights Management (DRM) streaming platform, we act as a service provider transmitting user-submitted content and hosting media files on secure CDN infrastructures. We maintain a zero-tolerance policy towards unauthorized piracy, screen recording, cam-recording, and unlicensed redistribution of copyrighted works.
                </p>

                <div className="pl-4 border-l-2 border-blue-500 space-y-4">
                  <h3 className="font-bold text-slate-800 dark:text-white uppercase text-[10px] tracking-wider font-mono">
                    1. FORMAL DMCA TAKEDOWN NOTIFICATION REQUIREMENTS
                  </h3>
                  <p>
                    If you are a copyright owner or an authorized legal agent acting on their behalf, and you believe that any media hosted on our servers infringes your copyright, you may submit a formal written notice under the DMCA. To be legally sufficient, the notification must include substantially all of the following elements:
                  </p>
                  <ul className="list-decimal pl-5 space-y-3">
                    <li>
                      <span className="font-bold text-slate-900 dark:text-neutral-300">Physical or Electronic Signature:</span> A physical or electronic signature of a person authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.
                    </li>
                    <li>
                      <span className="font-bold text-slate-900 dark:text-neutral-300">Identification of Copyrighted Work:</span> Clear and comprehensive identification of the copyrighted work claimed to have been infringed, or, if multiple copyrighted works are covered by a single notification, a representative list of such works.
                    </li>
                    <li>
                      <span className="font-bold text-slate-900 dark:text-neutral-300">Identification of Infringing Material (URLs):</span> Identification of the material that is claimed to be infringing or to be the subject of infringing activity and that is to be removed or access to which is to be disabled, along with <span className="font-semibold text-blue-500">exact URLs or Video IDs</span> (e.g. <code className="font-mono bg-slate-100 dark:bg-white/5 px-1 py-0.5 rounded">/?v=video-id</code>) to enable our technical team to locate and permanently scrub the media file from our edge CDN caches.
                    </li>
                    <li>
                      <span className="font-bold text-slate-900 dark:text-neutral-300">Contact Information:</span> Information reasonably sufficient to permit Videocites to contact you, such as your legal company name, mailing address, telephone number, and, if available, an active email address.
                    </li>
                    <li>
                      <span className="font-bold text-slate-900 dark:text-neutral-300">Good Faith Statement:</span> A statement that you have a good faith belief that use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law (e.g., "I hereby state that I have a good faith belief that use of the copyrighted material is not authorized by the copyright owner, its agent, or the law").
                    </li>
                    <li>
                      <span className="font-bold text-slate-900 dark:text-neutral-300">Accuracy & Perjury Statement:</span> A statement that the information in the notification is accurate, and under penalty of perjury, that the complaining party is authorized to act on behalf of the owner of an exclusive right that is allegedly infringed.
                    </li>
                  </ul>
                </div>

                <div className="pl-4 border-l-2 border-slate-200 dark:border-white/10 space-y-4">
                  <h3 className="font-bold text-slate-800 dark:text-white uppercase text-[10px] tracking-wider font-mono">
                    2. COUNTER-NOTIFICATION PROCEDURE (RESTORATION OF CONTENT)
                  </h3>
                  <p>
                    If your content was removed or disabled as a result of a DMCA takedown notice, and you believe that this occurred due to a mistake, misidentification, or that you possess the necessary licensing/distribution rights, you may file a formal Counter-Notification. Under 17 U.S.C. § 512(g)(3), the Counter-Notice must contain:
                  </p>
                  <ul className="list-decimal pl-5 space-y-2">
                    <li>Your physical or electronic signature.</li>
                    <li>Identification of the material that has been removed or to which access has been disabled, along with its original Video ID/URL prior to removal.</li>
                    <li>A statement under penalty of perjury that you have a good faith belief that the material was removed or disabled as a result of mistake or misidentification of the material to be removed or disabled.</li>
                    <li>Your full legal name, physical address, telephone number, and email.</li>
                    <li>A statement that you consent to the jurisdiction of the Federal District Court for the judicial district in which your address is located, or if your address is outside the United States, for any judicial district in which Videocites may be found, and that you will accept service of process from the person who provided the original infringement notification or an agent of such person.</li>
                  </ul>
                  <p className="text-slate-700 italic mt-2">
                    Upon receipt of a valid Counter-Notice, Videocites will promptly forward it to the original complaining party. If the copyright owner does not file a lawsuit seeking a court order within 10 to 14 business days, we are legally required to restore access to the disabled material.
                  </p>
                </div>

                <div className="pl-4 border-l-2 border-slate-200 dark:border-white/10 space-y-3">
                  <h3 className="font-bold text-slate-800 dark:text-white uppercase text-[10px] tracking-wider font-mono">
                    3. REPEAT INFRINGER TERMINATION POLICY
                  </h3>
                  <p>
                    Videocites ID LTD enforces a strict repeat infringer policy in accordance with Section 512(i) of the DMCA. Any user, publisher, or system administrator who uploads unauthorized copyrighted material or repeatedly triggers verified legal notices will have their access privileges permanently revoked.
                  </p>
                  <p>
                    This policy includes the automatic ban of associated emails, terminal IP ranges, and device signatures. We reserve the right to coordinate with Internet Service Providers (ISPs) and legal authorities to support criminal investigation against systematic digital piracy syndicates.
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/5 rounded-2xl p-5 space-y-3">
                  <h3 className="font-bold text-slate-900 dark:text-white uppercase text-[10px] tracking-wider font-mono">
                    Official Designated DMCA Copyright Agent Contact
                  </h3>
                  <p>
                    All legal DMCA notifications, counter-notices, and formal licensing disputes must be electronically transmitted or physically mailed to our Lead IP Counsel at:
                  </p>
                  <div className="font-mono text-slate-700 dark:text-neutral-300 text-[11px] bg-white dark:bg-black/40 p-4 rounded-xl border border-slate-200/50 dark:border-white/5 space-y-1">
                    <p className="font-bold">Videocites ID LTD — Legal & Regulatory Compliance Department</p>
                    <p>Attn: DMCA Copyright Agent (Lead IP Counsel)</p>
                    <p>Corporate Office: Videocites Headquarters, Silicon Valley, CA, USA</p>
                    <p>Email: <span className="text-blue-500">legal@videocites.com</span></p>
                    <p>Alternate Liaison Email: <span className="text-blue-400">compliance@videocites.com</span></p>
                  </div>
                  <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold italic">
                    Disclaimer: Under Section 512(f) of the DMCA, any person who knowingly and materially misrepresents that material or activity is infringing, or was removed by mistake or misidentification, may be subject to severe civil damages and liability for attorney's fees.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "privacy" && (
              <div className="space-y-8 text-xs leading-relaxed text-slate-800 dark:text-neutral-400 font-sans">
                <div className="border-b border-slate-100 dark:border-white/10 pb-4">
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                    Privacy Policy & Secure DRM Stream Auditing
                  </h2>
                  <p className="text-[11px] text-slate-600 dark:text-neutral-500 mt-1">Global Data Compliance, Steganographic Watermarking, & Security Standards</p>
                </div>

                <p>
                  At Videocites ID LTD, user privacy and stream security are core components of our operational paradigm. This Privacy Policy outlines how we manage user identifiers, authenticate viewers, and deploy state-of-the-art forensic watermarking to secure high-value intellectual property from unauthorized leakage.
                </p>

                <p>
                  Our services comply with international data privacy regulations including the General Data Protection Regulation (GDPR - EU), California Consumer Privacy Act (CCPA - USA), and other regional data security mandates.
                </p>

                <div className="pl-4 border-l-2 border-blue-500 space-y-4">
                  <h3 className="font-bold text-slate-800 dark:text-white uppercase text-[10px] tracking-wider font-mono">
                    1. FORENSIC STEGANOGRAPHY & DYNAMIC WATERMARKING
                  </h3>
                  <p>
                    To defend copyright holders against screen capturing, cam-tracking, and external hardware interceptors, Videocites implements real-time dynamic digital forensic watermarking.
                  </p>
                  <p>
                    When playing secure streams on our DRM platform, a subtle, semi-transparent watermark containing the authenticated viewer's email (e.g., <span className="text-blue-500 font-semibold font-mono">mnzfrankie@gmail.com</span>), system IP, and a high-resolution session timestamp is dynamically overlaid on top of the rendering canvas.
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-slate-700 dark:text-neutral-400">
                    <li>The watermark shifts horizontal and vertical coordinates randomly at micro-intervals to prevent computer vision croppers.</li>
                    <li>It oscillates opacity dynamically to block artificial intelligence-based frame reconstruction filters.</li>
                    <li>The watermark's invisible cryptographic payload is embedded steganographically within the video frames, rendering it detectable even if the screen is captured via analog devices (cam-tracing).</li>
                  </ul>
                </div>

                <div className="pl-4 border-l-2 border-slate-200 dark:border-white/10 space-y-4">
                  <h3 className="font-bold text-slate-800 dark:text-white uppercase text-[10px] tracking-wider font-mono">
                    2. COLLECTED TELEMETRY & SYSTEM IDENTIFIERS
                  </h3>
                  <p>
                    To ensure secure token distribution and detect anomalous account behavior, we collect the following network and browser metadata:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200/50 dark:border-white/5">
                    <div className="space-y-1">
                      <p className="font-bold text-slate-800 dark:text-white">Active Session Telemetry</p>
                      <p className="text-slate-700 dark:text-neutral-400">Browser User-Agents, operating system metadata, hardware device profiles, viewport resolution changes, and dynamic frame decoding rates to audit stream stability.</p>
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-slate-800 dark:text-white">Network Audit Logs</p>
                      <p className="text-slate-700 dark:text-neutral-400">Public IP addresses, geolocation coordinates (country/city accuracy level), CDN edge routing parameters, and API access tokens.</p>
                    </div>
                  </div>
                </div>

                <div className="pl-4 border-l-2 border-slate-200 dark:border-white/10 space-y-3">
                  <h3 className="font-bold text-slate-800 dark:text-white uppercase text-[10px] tracking-wider font-mono">
                    3. DATA RETENTION, DISCLOSURE, & AUDIT RIGHTS
                  </h3>
                  <p>
                    Session tokens and activity logs are stored on highly secure, encrypted database clusters and are automatically rotated or purged every 30 days. We do not sell or lease user personal information to marketing brokers.
                  </p>
                  <p>
                    In the event of a documented stream leakage or digital rights violation, forensic watermark logs will be analyzed by our compliance team. We reserve the absolute right to disclose session metadata to copyright holders and judicial bodies to support litigation against illegal distribution networks.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "terms" && (
              <div className="space-y-8 text-xs leading-relaxed text-slate-800 dark:text-neutral-400 font-sans">
                <div className="border-b border-slate-100 dark:border-white/10 pb-4">
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                    Videocites Platform Terms of Service
                  </h2>
                  <p className="text-[11px] text-slate-600 dark:text-neutral-500 mt-1">Rules, Regulations, & Civil Liability for DRM Stream Infringement</p>
                </div>

                <p>
                  Welcome to Videocites. By accessing our streaming servers, using our DRM software, registering a viewer account, or uploading media, you unconditionally and legally agree to be bound by the following Terms of Service ("TOS"). If you do not agree to these terms, you are forbidden from utilizing our services.
                </p>

                <div className="pl-4 border-l-2 border-blue-500 space-y-4">
                  <h3 className="font-bold text-slate-800 dark:text-white uppercase text-[10px] tracking-wider font-mono">
                    1. ABSOLUTE PROHIBITION OF STREAM REVERSE ENGINEERING
                  </h3>
                  <p>
                    The media files and streaming packets delivered by Videocites ID LTD are encrypted. You are strictly and legally prohibited from performing any of the following activities:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-slate-700 dark:text-neutral-400">
                    <li>Utilizing browser development extensions, stream downloaders, packet sniffers, or custom proxies to intercept raw HLS/DASH media manifest segments.</li>
                    <li>Deploying screen recorder software, hardware video capture cards (HDMI capture bypass), optical recorders (cam-tracing), or virtual drivers to record or extract secure output.</li>
                    <li>Attempting to bypass, reverse engineer, strip, or modify the dynamic on-screen steganographic watermark overlay under penalty of law.</li>
                  </ul>
                  <p className="text-rose-500 font-bold">
                    Any breach of Section 1 will trigger immediate IP suspension, server-side blocklisting, and a referral to our Legal Department for DMCA Section 1201 anti-circumvention violations, civil lawsuits, and financial damages.
                  </p>
                </div>

                <div className="pl-4 border-l-2 border-slate-200 dark:border-white/10 space-y-4">
                  <h3 className="font-bold text-slate-800 dark:text-white uppercase text-[10px] tracking-wider font-mono">
                    2. ACCOUNT LICENSE LIMITS & CRITICAL SECURITY
                  </h3>
                  <p>
                    Videocites grants users a limited, non-exclusive, revocable, and non-transferable license to view copyrighted streams for individual educational or recreational purposes.
                  </p>
                  <p>
                    You are solely responsible for protecting your account credentials. Sharing access keys, session tokens, or active accounts is strictly prohibited. If our security system detects concurrent stream playback across disparate geographical IPs, your session will be instantly terminated, and your token will be invalidated.
                  </p>
                </div>

                <div className="pl-4 border-l-2 border-slate-200 dark:border-white/10 space-y-3">
                  <h3 className="font-bold text-slate-800 dark:text-white uppercase text-[10px] tracking-wider font-mono">
                    3. WARRANTY DISCLAIMER & LIMITATION OF LIABILITY
                  </h3>
                  <p>
                    THE PLATFORM AND ALL SECURE STREAMS ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT ANY EXPRESS OR IMPLIED WARRANTIES. VIDEOCITES ID LTD DISCLAIMS ALL WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND SYSTEM CONTINUITY.
                  </p>
                  <p>
                    IN NO EVENT SHALL VIDEOCITES ID LTD, ITS DIRECTORS, OR ITS CDN PARTNERS BE LIABLE FOR ANY INDIRECT, CONSEQUENTIAL, EXEMPLARY, OR SPECIAL DAMAGES ARISING FROM SYSTEM DOWNTIME, MEDIA REMOVALS, OR COPYRIGHT DISPUTES. OUR TOTAL LIABILITY IS CAPPED AT THE MINIMUM EXTENT ALLOWABLE BY LAW.
                  </p>
                </div>

                <div className="pl-4 border-l-2 border-slate-200 dark:border-white/10 space-y-3">
                  <h3 className="font-bold text-slate-800 dark:text-white uppercase text-[10px] tracking-wider font-mono">
                    4. GOVERNING LAW & JURISDICTION
                  </h3>
                  <p>
                    These terms are governed by and construed in accordance with the laws of the State of California, USA, without regard to conflict of law principles. Any legal action or lawsuit arising out of or relating to Videocites' security infrastructure or stream decryption must be resolved exclusively in the state or federal courts located in Santa Clara County, California.
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
