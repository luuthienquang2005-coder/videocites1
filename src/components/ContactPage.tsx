import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, HelpCircle, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function ContactPage() {
  const [department, setDepartment] = useState("support");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    
    // Simulate API submission
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setName("");
      setEmail("");
      setMessage("");
    }, 5000);
  };

  return (
    <div className="w-full py-16 px-6 font-sans select-none min-h-screen transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column: Greeting & Info */}
          <div className="space-y-6">
            <span className="text-xs font-mono tracking-widest text-blue-500 uppercase font-bold">
              CONNECT WITH VIDEOCITES
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight leading-none text-slate-900 dark:text-white">
              We are always here to support you.
            </h1>
            <p className="text-sm leading-relaxed text-slate-800 dark:text-neutral-400">
              Have questions about copyright, licensing inquiries, or technical support? Send your message directly to the corresponding department for a prompt response from the Videocites team.
            </p>

            {/* Support grid details */}
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-white/10">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold uppercase font-mono text-slate-900 dark:text-white">Corporate Headquarters</h4>
                  <p className="text-xs text-slate-700 dark:text-neutral-400 mt-1">1583 Old Tenterfield Road, Six Mile Swamp NSW 2469, Australia</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold uppercase font-mono text-slate-900 dark:text-white">Support Mailbox</h4>
                  <p className="text-xs text-slate-700 dark:text-neutral-400 mt-1">support@videocites.com.au</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold uppercase font-mono text-slate-800 dark:text-white">Emergency DMCA Takedown Channel</h4>
                  <p className="text-xs text-rose-500 dark:text-rose-400 mt-1">Processed within 4 working hours of receipt.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact form */}
          <div className="bg-white dark:bg-zinc-900/30 border border-slate-200/80 dark:border-white/5 p-8 rounded-2xl relative overflow-hidden backdrop-blur-md shadow-xl shadow-slate-100 dark:shadow-none">
            
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div 
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col items-center justify-center text-center py-10 space-y-4"
                >
                  <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 dark:text-emerald-400 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Inquiry Submitted Successfully!</h3>
                    <p className="text-xs text-slate-700 dark:text-neutral-400 mt-1 max-w-sm">
                      Thank you, {name}. Your request has been forwarded to the **{department.toUpperCase()}** department. Our specialist will reach out to you at **{email}** within 24 business hours.
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.form 
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Send a Message Online</h3>
                  
                  {/* Name input */}
                  <div>
                    <label className="block text-[10px] font-mono text-slate-700 dark:text-neutral-400 uppercase tracking-widest mb-1.5">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full bg-slate-50/50 dark:bg-[#050505] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>

                  {/* Email input */}
                  <div>
                    <label className="block text-[10px] font-mono text-slate-700 dark:text-neutral-400 uppercase tracking-widest mb-1.5">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@domain.com"
                      className="w-full bg-slate-50/50 dark:bg-[#050505] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>

                  {/* Department select */}
                  <div>
                    <label className="block text-[10px] font-mono text-slate-700 dark:text-neutral-400 uppercase tracking-widest mb-1.5">Select Department</label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full bg-slate-50/50 dark:bg-[#050505] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer text-slate-700 dark:text-neutral-300"
                    >
                      <option value="sales" className="bg-white dark:bg-[#050505] text-slate-800 dark:text-white">Sales & Film Licensing (Sales)</option>
                      <option value="support" className="bg-white dark:bg-[#050505] text-slate-800 dark:text-white">Technical Support (Tech)</option>
                      <option value="legal" className="bg-white dark:bg-[#050505] text-slate-800 dark:text-white">Videocites Legal & DMCA (Legal)</option>
                    </select>
                  </div>

                  {/* Message input */}
                  <div>
                    <label className="block text-[10px] font-mono text-slate-700 dark:text-neutral-400 uppercase tracking-widest mb-1.5">Detailed Inquiry</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message here..."
                      rows={4}
                      className="w-full bg-slate-50/50 dark:bg-[#050505] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs tracking-wider uppercase py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg shadow-blue-500/10"
                  >
                    <Send className="w-4 h-4" />
                    Send Inquiry
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

          </div>
        </div>

      </div>
    </div>
  );
}
