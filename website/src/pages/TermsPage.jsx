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

export default function TermsPage() {
  useEffect(() => {
    document.title = "Terms & Conditions - Quick Comment AI";
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
                  Terms & Conditions
                </h1>
              </div>
              <p className="text-xs font-mono text-neutral-400 leading-relaxed">
                Please review these Terms and Conditions governing your access to and use of Quick Comment AI website, pre-launch waitlist, and Chrome Extension.
              </p>
            </GridSection>

            {/* Document Content */}
            <GridSection>
              <div className="space-y-10 text-xs sm:text-sm font-mono text-neutral-300 leading-relaxed">
                
                {/* Section 1 */}
                <div>
                  <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                    <span className="text-neutral-500">01.</span> Acceptance of Terms
                  </h2>
                  <p className="text-neutral-400">
                    By registering for our pre-launch waitlist, signing in via Google Single Sign-On, or installing the Quick Comment AI Chrome Extension, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please refrain from using the service.
                  </p>
                </div>

                {/* Section 2 */}
                <div>
                  <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                    <span className="text-neutral-500">02.</span> Description of Service
                  </h2>
                  <p className="text-neutral-400 mb-3">
                    Quick Comment AI provides an inline AI comment generation companion tool designed for LinkedIn feeds. Key capabilities include:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-neutral-400">
                    <li>Parsing public LinkedIn post text on explicit user action.</li>
                    <li>Generating concise AI replies under 25 words in 5 selectable tones (Insightful, Supportive, Constructive, Funny, Questioning).</li>
                    <li>Managing daily comment generation quotas and account sessions via Google Authentication.</li>
                  </ul>
                </div>

                {/* Section 3 */}
                <div>
                  <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                    <span className="text-neutral-500">03.</span> Account Authentication & Session Integrity
                  </h2>
                  <p className="text-neutral-400 mb-2">
                    Authentication is provided strictly via Google Single Sign-On (Firebase Auth). No separate password is created or stored.
                  </p>
                  <p className="text-neutral-400">
                    Pre-launch waitlist registrants remain automatically logged into their platform session. When Quick Comment AI launches live on the Chrome Web Store, logged-in sessions automatically inherit their active tier entitlement.
                  </p>
                </div>

                {/* Section 4 */}
                <div>
                  <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                    <span className="text-neutral-500">04.</span> Usage Tiers & Daily Quota Entitlements
                  </h2>
                  <div className="bg-[#090909] border border-white/10 p-4 rounded-xl space-y-2 mb-3">
                    <div><strong className="text-white">&bull; Free Tier:</strong> 2 AI comments per day.</div>
                    <div><strong className="text-white">&bull; Pro Tier:</strong> 20 AI comments per day.</div>
                    <div><strong className="text-white">&bull; Ultra Tier:</strong> 50 AI comments per day.</div>
                  </div>
                  <p className="text-neutral-400">
                    Daily quotas reset automatically every 24 hours. Quota enforcement is aggregated across app accounts sharing the same underlying LinkedIn profile identifier to prevent quota abuse.
                  </p>
                </div>

                {/* Section 5 */}
                <div>
                  <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                    <span className="text-neutral-500">05.</span> Payments & Billing
                  </h2>
                  <p className="text-neutral-400">
                    Subscription purchases (Pro Plan & Ultra Plan) are processed securely through Razorpay payment gateway checkout links. All pricing is stated transparently in INR or USD based on location. Subscription checkouts are locked during waitlist mode and unlock upon Chrome Web Store publication.
                  </p>
                </div>

                {/* Section 6 */}
                <div>
                  <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                    <span className="text-neutral-500">06.</span> Responsible Use & User Obligations
                  </h2>
                  <p className="text-neutral-400 mb-2">
                    Quick Comment AI is a manual productivity tool. It operates exclusively when triggered by the user and does NOT auto-post or run background scraping bots on LinkedIn.
                  </p>
                  <p className="text-neutral-400">
                    Users are solely responsible for reviewing, editing, and publishing all AI-generated content to LinkedIn in compliance with LinkedIn's User Agreement.
                  </p>
                </div>

                {/* Section 7 */}
                <div>
                  <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                    <span className="text-neutral-500">07.</span> Disclaimers & Limitation of Liability
                  </h2>
                  <p className="text-neutral-400">
                    Quick Comment AI is provided on an "as is" and "as available" basis without warranties of any kind. We do not guarantee specific LinkedIn engagement metrics, post reach, or uninterrupted availability of third-party AI provider APIs (Groq Cloud).
                  </p>
                </div>

                {/* Section 8 */}
                <div>
                  <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                    <span className="text-neutral-500">08.</span> Contact Information
                  </h2>
                  <p className="text-neutral-400">
                    For inquiries regarding these Terms & Conditions, billing, or technical support, contact platform management directly at <a href="mailto:yuvraj17mishra11@gmail.com" className="text-white underline font-mono">yuvraj17mishra11@gmail.com</a> or visit our <Link to="/extension" className="text-white underline">/extension portal</Link>.
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

              <div>Quick Comment AI &bull; Legal Terms & Conditions</div>
              <div className="flex items-center gap-4 text-neutral-400">
                <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                <Link to="/" className="hover:text-white transition-colors">&larr; Overview</Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
