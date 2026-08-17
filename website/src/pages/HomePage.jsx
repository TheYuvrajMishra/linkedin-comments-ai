import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { BackgroundBeams } from '../components/ui/background-beams';
import { GlowingEffect } from '../components/ui/glowing-effect';
import { Boxes } from '../components/ui/background-boxes';
import SideMarginPatterns from '../components/ui/side-margin-patterns';
import { WAITLIST_MODE, WAITLIST_TARGET } from '../config';
import {
  auth,
  googleProvider,
  signInWithPopup,
  onAuthStateChanged
} from '../firebase';

const BACKEND_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_BACKEND_URL) || process.env.BACKEND_URL || "http://localhost:5000";

function GridSection({ children, className = "", id }) {
  return (
    <div id={id} className={`relative w-full border-b border-white/10 ${className}`}>
      <div className="max-w-7xl mx-auto px-6 sm:px-12 relative py-16 md:py-24">
        {/* Vertical Guide Rails slicing through horizontal section borders */}
        <div className="absolute -top-4 -bottom-4 left-0 w-[1px] bg-white/10 pointer-events-none z-10" />
        <div className="absolute -top-4 -bottom-4 right-0 w-[1px] bg-white/10 pointer-events-none z-10" />

        {children}
      </div>
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const [waitlistCount, setWaitlistCount] = useState(0);
  const [isWaitlistMode, setIsWaitlistMode] = useState(WAITLIST_MODE);
  const [user, setUser] = useState(null);
  const [authSubmitting, setAuthSubmitting] = useState(false);

  useEffect(() => {
    document.title = "Quick Comment AI - LinkedIn AI Comment Generator & Chrome Extension";

    fetch(`${BACKEND_URL}/api/v1/waitlist/count`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setWaitlistCount(data.count || 0);
          if (typeof data.waitlistMode === 'boolean') {
            setIsWaitlistMode(data.waitlistMode);
          }
        }
      })
      .catch(err => console.warn('Waitlist count fetch offline:', err));
  }, []);

  // Listen for user auth & sync with waitlist backend
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser && isWaitlistMode) {
        try {
          const idToken = await currentUser.getIdToken();
          const res = await fetch(`${BACKEND_URL}/api/v1/waitlist/join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              idToken: idToken,
              email: currentUser.email,
              name: currentUser.displayName || '',
              uid: currentUser.uid
            })
          });
          const data = await res.json();
          if (data.success && data.count !== undefined) {
            setWaitlistCount(data.count);
          }
        } catch (e) {
          console.warn("Could not sync waitlist from homepage:", e);
        }
      }
    });

    return () => unsubscribe();
  }, [isWaitlistMode]);

  const handleWaitlistAuth = async () => {
    if (user) {
      navigate('/extension');
      return;
    }

    setAuthSubmitting(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result?.user) {
        const idToken = await result.user.getIdToken();
        const res = await fetch(`${BACKEND_URL}/api/v1/waitlist/join`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            idToken: idToken,
            email: result.user.email,
            name: result.user.displayName || '',
            uid: result.user.uid
          })
        });
        const data = await res.json();
        if (data.success && data.count !== undefined) {
          setWaitlistCount(data.count);
        }
      }
    } catch (err) {
      console.error("Homepage Google auth error:", err);
    } finally {
      setAuthSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-[100dvh] bg-black text-white flex flex-col justify-between selection:bg-white selection:text-black overflow-hidden font-sans">
      {/* Structural Side Margin Line Patterns (Both Sides) */}
      <SideMarginPatterns />

      {/* Aceternity Background Beams */}
      <BackgroundBeams className="pointer-events-none opacity-30 z-0" />

      <div className="relative z-10 flex flex-col justify-between min-h-[100dvh]">
        {/* Full-width Structural Grid Architecture */}
        <div className="w-full relative">
          
          {/* Header Section */}
          <div className="relative w-full border-b border-white/10 bg-black/90 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-6 sm:px-12 relative py-4">
              <div className="absolute -top-4 -bottom-4 left-0 w-[1px] bg-white/10 pointer-events-none z-10" />
              <div className="absolute -top-4 -bottom-4 right-0 w-[1px] bg-white/10 pointer-events-none z-10" />
              <Navbar />
            </div>
          </div>

          {/* Main Content Sections */}
          <main>
            {/* Hero Section with Aceternity Background Boxes & Big Watermark Count */}
            <div className="relative w-full border-b border-white/10 overflow-hidden min-h-[500px]">
              {/* Giant Subtle Background Watermark Waitlist Count */}
              <div className="absolute right-4 bottom-2 md:right-12 md:bottom-4 z-0 select-none pointer-events-none text-right">
                <div className="text-[11rem] sm:text-[16rem] md:text-[22rem] lg:text-[26rem] font-mono font-extrabold text-white/[0.035] leading-none tracking-tighter">
                  {String(waitlistCount).padStart(3, '0')}
                </div>
                <div className="text-[9px] sm:text-[11px] font-mono text-neutral-600 tracking-[0.3em] uppercase -mt-4 md:-mt-10 pr-2">
                  WAITLIST SIGNUPS &bull; TARGET {WAITLIST_TARGET}
                </div>
              </div>

              <div className="max-w-7xl mx-auto px-6 sm:px-12 relative py-16 md:py-24">
                {/* Vertical Guide Rails */}
                <div className="absolute -top-4 -bottom-4 left-0 w-[1px] bg-white/10 pointer-events-none z-10" />
                <div className="absolute -top-4 -bottom-4 right-0 w-[1px] bg-white/10 pointer-events-none z-10" />

                {/* Aceternity Background Boxes interactive layer */}
                <div className="absolute inset-0 w-full h-full z-0 opacity-20 overflow-hidden pointer-events-auto">
                  <Boxes />
                </div>

                {/* Hero Foreground Content */}
                <div className="relative z-10 pointer-events-none">
                  <h1 className="relative z-10 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-sans font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-neutral-100 via-neutral-200 to-neutral-500 mb-8 leading-[1.06] max-w-4xl">
                    Elevate LinkedIn Engagement with Context-Aware AI Comments
                  </h1>

                  <p className="text-base sm:text-lg text-neutral-400 max-w-3xl leading-relaxed mb-12 font-sans font-normal">
                    Quick Comment AI integrates directly into your LinkedIn feed. Generate sharp, high-value, non-robotic comments tailored to your personal writing style — zero fluff, zero generic praise.
                  </p>

                  {/* Double-Bezel Nested CTA Pill */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pointer-events-auto">
                    <div className="p-1 rounded-[2.2rem] bg-neutral-900 border border-white/15">
                      {isWaitlistMode ? (
                        <button
                          onClick={handleWaitlistAuth}
                          disabled={authSubmitting}
                          className="group w-full sm:w-auto rounded-[calc(2.2rem-0.25rem)] px-8 py-4 bg-white text-black font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-between gap-4 hover:bg-neutral-200 active:scale-[0.98] transition-all duration-300 disabled:opacity-50"
                        >
                          <div className="flex items-center gap-3">
                            {!user && (
                              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                                <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032 s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2 C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.761H12.545z"/>
                              </svg>
                            )}
                            <span>
                              {authSubmitting
                                ? 'Connecting to Google...'
                                : user
                                ? `Waitlist Spot Reserved • View Account`
                                : 'Join Waitlist with Google'}
                            </span>
                          </div>
                          <div className="w-7 h-7 rounded-full bg-black/10 flex items-center justify-center group-hover:translate-x-1 transition-transform duration-300">
                            <svg className="w-4 h-4 text-black" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" stroke="currentColor">
                              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        </button>
                      ) : (
                        <Link
                          to="/extension"
                          className="group rounded-[calc(2.2rem-0.25rem)] px-8 py-4 bg-white text-black font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-between gap-4 hover:bg-neutral-200 active:scale-[0.98] transition-all duration-300"
                        >
                          <span>Launch Extension Portal (/extension)</span>
                          <div className="w-7 h-7 rounded-full bg-black/10 flex items-center justify-center group-hover:translate-x-1 transition-transform duration-300">
                            <svg className="w-4 h-4 text-black" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" stroke="currentColor">
                              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        </Link>
                      )}
                    </div>

                    <a
                      href="#features"
                      className="rounded-full px-7 py-4 bg-black border border-white/10 text-neutral-300 font-mono text-xs uppercase tracking-wider text-center hover:bg-neutral-900 hover:text-white transition-colors"
                    >
                      Explore Capabilities
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Asymmetrical Bento Grid Section */}
            <GridSection id="features">
              <div className="mb-12">
                <h2 className="relative z-10 text-2xl sm:text-3xl md:text-4xl font-sans font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-neutral-100 to-neutral-400">
                  Engineered for High-Signal Networking
                </h2>
              </div>

              {/* Asymmetrical Bento Masonry */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Card 1 - Large Span (col-span-2) */}
                <div className="relative md:col-span-2 bg-[#090909] border border-white/10 p-2 rounded-[2.2rem] hover:border-white/20 transition-colors backdrop-blur-sm group">
                  <GlowingEffect
                    spread={40}
                    glow={true}
                    disabled={false}
                    proximity={64}
                    inactiveZone={0.01}
                    borderWidth={1.5}
                  />
                  <div className="relative z-10 bg-black border border-white/5 rounded-[calc(2.2rem-0.5rem)] p-8 md:p-10 h-full flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-neutral-500 block mb-4 uppercase tracking-widest">
                        01 &bull; Context Intelligence
                      </span>
                      <h3 className="text-2xl font-bold text-white mb-3">Direct Feed Parsing</h3>
                      <p className="text-sm text-neutral-400 font-mono leading-relaxed max-w-xl">
                        Reads the original post content directly inside LinkedIn's DOM. Cuts out hollow clichés ("Great post!", "So true!") and constructs grounded, specific commentary.
                      </p>
                    </div>
                    <div className="mt-10 pt-6 border-t border-white/5 flex items-center justify-between text-xs font-mono text-neutral-500">
                      <span>Zero Generic Praise</span>
                      <span>DOM Shadow Isolation</span>
                    </div>
                  </div>
                </div>

                {/* Card 2 - Normal Span */}
                <div className="relative bg-[#090909] border border-white/10 p-2 rounded-[2.2rem] hover:border-white/20 transition-colors backdrop-blur-sm group">
                  <GlowingEffect
                    spread={40}
                    glow={true}
                    disabled={false}
                    proximity={64}
                    inactiveZone={0.01}
                    borderWidth={1.5}
                  />
                  <div className="relative z-10 bg-black border border-white/5 rounded-[calc(2.2rem-0.5rem)] p-8 md:p-10 h-full flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-neutral-500 block mb-4 uppercase tracking-widest">
                        02 &bull; Tonal Range
                      </span>
                      <h3 className="text-2xl font-bold text-white mb-3">5 Distinct Tones</h3>
                      <p className="text-sm text-neutral-400 font-mono leading-relaxed">
                        Select between Insightful, Supportive, Constructive, Funny, or Questioning tones on the fly.
                      </p>
                    </div>
                    <div className="mt-10 pt-6 border-t border-white/5 text-xs font-mono text-neutral-500">
                      <span>💡 🤝 🛠️ 😄 ❓</span>
                    </div>
                  </div>
                </div>

                {/* Card 3 - Normal Span */}
                <div className="relative bg-[#090909] border border-white/10 p-2 rounded-[2.2rem] hover:border-white/20 transition-colors backdrop-blur-sm group">
                  <GlowingEffect
                    spread={40}
                    glow={true}
                    disabled={false}
                    proximity={64}
                    inactiveZone={0.01}
                    borderWidth={1.5}
                  />
                  <div className="relative z-10 bg-black border border-white/5 rounded-[calc(2.2rem-0.5rem)] p-8 md:p-10 h-full flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-neutral-500 block mb-4 uppercase tracking-widest">
                        03 &bull; Persona Tuning
                      </span>
                      <h3 className="text-2xl font-bold text-white mb-3">Writing Style Persona</h3>
                      <p className="text-sm text-neutral-400 font-mono leading-relaxed">
                        Provide custom instructions (e.g. "Software Engineer focused on performance and AI infrastructure") to align outputs with your voice.
                      </p>
                    </div>
                    <div className="mt-10 pt-6 border-t border-white/5 text-xs font-mono text-neutral-500">
                      <span>Custom System Prompts</span>
                    </div>
                  </div>
                </div>

                {/* Card 4 - Large Span (col-span-2) */}
                <div className="relative md:col-span-2 bg-[#090909] border border-white/10 p-2 rounded-[2.2rem] hover:border-white/20 transition-colors backdrop-blur-sm group">
                  <GlowingEffect
                    spread={40}
                    glow={true}
                    disabled={false}
                    proximity={64}
                    inactiveZone={0.01}
                    borderWidth={1.5}
                  />
                  <div className="relative z-10 bg-black border border-white/5 rounded-[calc(2.2rem-0.5rem)] p-8 md:p-10 h-full flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-neutral-500 block mb-4 uppercase tracking-widest">
                        04 &bull; Single-Source Sync
                      </span>
                      <h3 className="text-2xl font-bold text-white mb-3">Automatic Auth Detection</h3>
                      <p className="text-sm text-neutral-400 font-mono leading-relaxed max-w-xl">
                        Log in once on this companion site using Google. The Chrome Extension automatically detects your session in real time — no separate login needed.
                      </p>
                    </div>
                    <div className="mt-10 pt-6 border-t border-white/5 flex items-center justify-between text-xs font-mono text-neutral-500">
                      <span>Google Auth Only</span>
                      <span>Real-time Bridge</span>
                    </div>
                  </div>
                </div>
              </div>
            </GridSection>

            {/* Live LinkedIn Post Embed Section */}
            <GridSection>
              <div className="mb-10">
                <h2 className="relative z-10 text-2xl sm:text-3xl md:text-4xl font-sans font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-neutral-100 to-neutral-400 mb-2">
                  Live In-Feed Demonstration
                </h2>
                <p className="text-xs text-neutral-400 font-mono">
                  Quick Comment AI attaches directly to LinkedIn comment triggers across all post formats.
                </p>
              </div>

              <div className="flex justify-center items-center">
                <iframe
                  src="https://www.linkedin.com/embed/feed/update/urn:li:ugcPost:7474708439219331073?collapsed=1"
                  height="541"
                  width="100%"
                  style={{ maxWidth: '504px', border: 'none' }}
                  allowFullScreen={true}
                  title="Embedded LinkedIn post"
                  className="w-full rounded-xl shadow-2xl"
                ></iframe>
              </div>
            </GridSection>

            {/* Workflow Sequence */}
            <GridSection>
              <h2 className="relative z-10 text-2xl sm:text-3xl md:text-4xl font-sans font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-neutral-100 to-neutral-400 mb-12">
                How Quick Comment AI Works
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#090909] border border-white/10 p-2 rounded-[2.2rem]">
                  <div className="bg-black border border-white/5 rounded-[calc(2.2rem-0.5rem)] p-8">
                    <span className="text-xs font-mono font-bold text-white block mb-2">01. Authenticate</span>
                    <p className="text-xs text-neutral-400 font-mono leading-relaxed">
                      Open the <Link to="/extension" className="text-white underline">/extension portal</Link> and sign in with Google once.
                    </p>
                  </div>
                </div>

                <div className="bg-[#090909] border border-white/10 p-2 rounded-[2.2rem]">
                  <div className="bg-black border border-white/5 rounded-[calc(2.2rem-0.5rem)] p-8">
                    <span className="text-xs font-mono font-bold text-white block mb-2">02. Trigger In-Feed</span>
                    <p className="text-xs text-neutral-400 font-mono leading-relaxed">
                      Browse LinkedIn. Click the inline Quick Comment AI action button beside any comment box.
                    </p>
                  </div>
                </div>

                <div className="bg-[#090909] border border-white/10 p-2 rounded-[2.2rem]">
                  <div className="bg-black border border-white/5 rounded-[calc(2.2rem-0.5rem)] p-8">
                    <span className="text-xs font-mono font-bold text-white block mb-2">03. Review & Post</span>
                    <p className="text-xs text-neutral-400 font-mono leading-relaxed">
                      The AI comment autofills instantly into your draft. Review, tweak if desired, and post.
                    </p>
                  </div>
                </div>
              </div>
            </GridSection>

            {/* CTA Banner Section - Premium Architectural Glow & Double-Bezel */}
            <GridSection>
              <div className="relative group">
                {/* Ambient Glow Backdrop Aura */}
                <div className="absolute -inset-1 rounded-[2.6rem] bg-gradient-to-r from-white/10 via-neutral-500/20 to-white/10 blur-xl opacity-40 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                {/* Main Container with Aceternity GlowingEffect */}
                <div className="relative bg-[#090909] border border-white/15 p-2 rounded-[2.5rem] overflow-hidden backdrop-blur-md">
                  <GlowingEffect
                    spread={60}
                    glow={true}
                    disabled={false}
                    proximity={80}
                    inactiveZone={0.01}
                    borderWidth={1.5}
                  />
                  <div className="relative z-10 bg-black border border-white/10 rounded-[calc(2.5rem-0.5rem)] p-8 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden">
                    {/* Subtle Architectural Micro-Dot Grid */}
                    <div 
                      className="absolute inset-0 z-0 opacity-20 pointer-events-none"
                      style={{
                        backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.3) 1px, transparent 1px)`,
                        backgroundSize: '16px 16px',
                        maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 85%)',
                        WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 85%)'
                      }}
                    />

                    <div className="relative z-10">
                      <h3 className="relative z-10 text-2xl md:text-3xl lg:text-4xl font-sans font-bold bg-clip-text text-transparent bg-gradient-to-b from-white via-neutral-100 to-neutral-400 mb-2 tracking-tight">
                        {isWaitlistMode ? 'Reserve Your Pre-Launch Waitlist Spot' : 'Ready to Start?'}
                      </h3>
                      <p className="text-xs sm:text-sm font-mono text-neutral-400 max-w-lg leading-relaxed">
                        {isWaitlistMode
                          ? `Join ${waitlistCount} other members on the pre-launch waitlist before we publish to the Chrome Web Store.`
                          : 'Access your session center, view daily quota usage, and manage your plan subscriptions.'}
                      </p>
                    </div>

                    {/* Double-Bezel High-Shine CTA Pill */}
                    <div className="relative z-10 p-1 rounded-full bg-neutral-900 border border-white/20 shadow-2xl hover:border-white/40 transition-colors shrink-0">
                      {isWaitlistMode ? (
                        <button
                          onClick={handleWaitlistAuth}
                          disabled={authSubmitting}
                          className="group/btn relative rounded-full px-8 py-4 bg-white text-black font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-3 hover:bg-neutral-100 active:scale-[0.98] transition-all overflow-hidden disabled:opacity-50"
                        >
                          <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent transition-transform duration-1000 ease-in-out pointer-events-none" />
                          <span className="relative z-10">
                            {user ? 'Waitlist Spot Reserved • View Portal' : 'Join Waitlist with Google'}
                          </span>
                          <div className="relative z-10 w-6 h-6 rounded-full bg-black/10 flex items-center justify-center group-hover/btn:translate-x-1 group-hover/btn:bg-black group-hover/btn:text-white transition-all duration-300">
                            <svg className="w-3.5 h-3.5 text-current" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        </button>
                      ) : (
                        <Link
                          to="/extension"
                          className="group/btn relative rounded-full px-8 py-4 bg-white text-black font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-3 hover:bg-neutral-100 active:scale-[0.98] transition-all overflow-hidden"
                        >
                          <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent transition-transform duration-1000 ease-in-out pointer-events-none" />
                          <span className="relative z-10">Go to /extension Portal</span>
                          <div className="relative z-10 w-6 h-6 rounded-full bg-black/10 flex items-center justify-center group-hover/btn:translate-x-1 group-hover/btn:bg-black group-hover/btn:text-white transition-all duration-300">
                            <svg className="w-3.5 h-3.5 text-current" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </GridSection>
          </main>

          {/* Footer Section */}
          <div className="relative w-full border-b border-white/10">
            <div className="max-w-7xl mx-auto px-6 sm:px-12 relative py-8 text-xs font-mono text-neutral-600 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="absolute -top-4 -bottom-4 left-0 w-[1px] bg-white/10 pointer-events-none z-10" />
              <div className="absolute -top-4 -bottom-4 right-0 w-[1px] bg-white/10 pointer-events-none z-10" />

              <div>Quick Comment AI &bull; Full-Bleed Structural Intersection Architecture</div>
              <div className="flex items-center gap-5 text-neutral-400">
                <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
                <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                <Link to="/extension" className="hover:text-white transition-colors">/extension Portal &rarr;</Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
