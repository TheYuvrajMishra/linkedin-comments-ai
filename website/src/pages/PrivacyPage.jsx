import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { BackgroundBeams } from '../components/ui/background-beams';
import SideMarginPatterns from '../components/ui/side-margin-patterns';

function GridSection({ children, className = "", id }) {
  return (
    <div id={id} className={`relative w-full border-b border-white/10 ${className}`}>
      <div className="max-w-4xl mx-auto px-6 sm:px-12 relative py-12 md:py-16">
        <div className="absolute -top-4 -bottom-4 left-0 w-[1px] bg-white/10 pointer-events-none z-10" />
        <div className="absolute -top-4 -bottom-4 right-0 w-[1px] bg-white/10 pointer-events-none z-10" />
        {children}
      </div>
    </div>
  );
}

export default function PrivacyPage() {
  useEffect(() => {
    document.title = "Privacy Policy - Quick Comment AI";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="relative min-h-[100dvh] bg-black text-white flex flex-col justify-between selection:bg-white selection:text-black overflow-hidden font-sans">
      <SideMarginPatterns />
      <BackgroundBeams className="pointer-events-none opacity-30 z-0" />

      <div className="relative z-10 flex flex-col justify-between min-h-[100dvh]">
        <div className="w-full relative">
          
          {/* Header */}
          <div className="relative w-full border-b border-white/10 bg-black/90 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-6 sm:px-12 relative py-4">
              <div className="absolute -top-4 -bottom-4 left-0 w-[1px] bg-white/10 pointer-events-none z-10" />
              <div className="absolute -top-4 -bottom-4 right-0 w-[1px] bg-white/10 pointer-events-none z-10" />
              <Navbar />
            </div>
          </div>

          <main>
            {/* Title */}
            <GridSection>
              <div className="mb-4">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-500 block mb-2">
                  Legal Documentation &bull; Effective August 2026
                </span>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-sans font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-neutral-100 to-neutral-400">
                  Privacy Policy
                </h1>
              </div>
              <p className="text-xs font-mono text-neutral-400 leading-relaxed">
                This Privacy Policy outlines how Quick Comment AI collects, handles, processes, and protects your data across our website, Chrome Extension, and pre-launch waitlist database.
              </p>
            </GridSection>

            {/* Document Content */}
            <GridSection>
              <div className="space-y-10 text-xs sm:text-sm font-mono text-neutral-300 leading-relaxed">
                
                {/* Section 1 */}
                <div>
                  <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                    <span className="text-neutral-500">01.</span> Information We Collect
                  </h2>
                  <p className="text-neutral-400 mb-3">
                    We collect minimal data necessary to provide authentication, waitlist tracking, and daily AI comment generation:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-neutral-400">
                    <li>
                      <strong className="text-white">Google Identity Information:</strong> When you sign in via Google OAuth (Firebase Auth), we receive your Google Email Address, Display Name, and Google UID.
                    </li>
                    <li>
                      <strong className="text-white">LinkedIn Post Context:</strong> When you click the inline comment generator on a LinkedIn post, the extension parses the public post text to construct a contextual AI prompt. This post content is processed transiently and is NOT stored in our permanent database.
                    </li>
                    <li>
                      <strong className="text-white">Usage & Quota Data:</strong> We track daily comment counts generated today and your current subscription tier (Free, Pro, Ultra) to enforce rate limits.
                    </li>
                  </ul>
                </div>

                {/* Section 2 */}
                <div>
                  <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                    <span className="text-neutral-500">02.</span> How We Use Your Data
                  </h2>
                  <ul className="list-disc pl-5 space-y-1.5 text-neutral-400">
                    <li>To authenticate your session between this companion site and your Chrome Extension.</li>
                    <li>To maintain your position on the pre-launch waitlist database.</li>
                    <li>To enforce daily comment limits according to your active subscription plan.</li>
                    <li>To prevent system abuse and duplicate account creation.</li>
                  </ul>
                </div>

                {/* Section 3 */}
                <div>
                  <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                    <span className="text-neutral-500">03.</span> Third-Party Service Providers
                  </h2>
                  <p className="text-neutral-400 mb-3">
                    We rely on trusted third-party infrastructure to power Quick Comment AI:
                  </p>
                  <div className="bg-[#090909] border border-white/10 p-4 rounded-xl space-y-2 text-neutral-400">
                    <div><strong className="text-white">&bull; Google Firebase Auth:</strong> Secure Google OAuth single sign-on authentication.</div>
                    <div><strong className="text-white">&bull; Groq API Cloud:</strong> High-speed AI inference model execution for generating comment suggestions.</div>
                    <div><strong className="text-white">&bull; MongoDB Atlas Cloud:</strong> Secure database storage for user profiles and waitlist entries.</div>
                    <div><strong className="text-white">&bull; Razorpay:</strong> Payment gateway handling subscription billing (we do NOT store credit card details).</div>
                  </div>
                </div>

                {/* Section 4 */}
                <div>
                  <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                    <span className="text-neutral-500">04.</span> Data Security & No Data Selling
                  </h2>
                  <p className="text-neutral-400 mb-2">
                    We adhere to strict data privacy principles:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-neutral-400">
                    <li>We do NOT sell, rent, or trade your personal information or email address to third parties or advertisers.</li>
                    <li>We do NOT access, scrape, or store your private LinkedIn messages, passwords, or personal account credentials.</li>
                    <li>All data transmitted between the website, backend API, and Chrome extension is encrypted via Standard TLS/HTTPS protocols.</li>
                  </ul>
                </div>

                {/* Section 5 */}
                <div>
                  <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                    <span className="text-neutral-500">05.</span> Local Storage & Chrome Extension Sync
                  </h2>
                  <p className="text-neutral-400">
                    To maintain real-time session synchronization between this site and your browser extension, authentication tokens are saved in browser <code className="text-white bg-white/10 px-1.5 py-0.5 rounded">localStorage</code>. You can clear this data at any time by clicking "Sign Out" or clearing your browser cache.
                  </p>
                </div>

                {/* Section 6 */}
                <div>
                  <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                    <span className="text-neutral-500">06.</span> Your Data Rights & Deletion Requests
                  </h2>
                  <p className="text-neutral-400">
                    You have the right to request deletion of your account record or pre-launch waitlist entry at any time. Simply sign out or contact our support team to have your waitlist record permanently purged from our database.
                  </p>
                </div>

                {/* Section 7 */}
                <div>
                  <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                    <span className="text-neutral-500">07.</span> Changes to This Privacy Policy
                  </h2>
                  <p className="text-neutral-400">
                    We may update this Privacy Policy periodically to reflect service updates or regulatory compliance. Any changes will be posted directly on this page with an updated effective date.
                  </p>
                </div>

                {/* Section 8 */}
                <div>
                  <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                    <span className="text-neutral-500">08.</span> Data Privacy Contact & Support
                  </h2>
                  <p className="text-neutral-400">
                    If you have questions regarding your data privacy rights, data removal requests, or account data purges, email us directly at <a href="mailto:yuvraj17mishra11@gmail.com" className="text-white underline font-mono">yuvraj17mishra11@gmail.com</a>.
                  </p>
                </div>


              </div>
            </GridSection>
          </main>

          {/* Footer */}
          <div className="relative w-full border-b border-white/10">
            <div className="max-w-7xl mx-auto px-6 sm:px-12 relative py-8 text-xs font-mono text-neutral-600 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="absolute -top-4 -bottom-4 left-0 w-[1px] bg-white/10 pointer-events-none z-10" />
              <div className="absolute -top-4 -bottom-4 right-0 w-[1px] bg-white/10 pointer-events-none z-10" />

              <div>Quick Comment AI &bull; Privacy Policy & Data Protection</div>
              <div className="flex items-center gap-4 text-neutral-400">
                <Link to="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link>
                <Link to="/" className="hover:text-white transition-colors">&larr; Overview</Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
