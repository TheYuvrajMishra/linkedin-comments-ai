import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { BackgroundBeams } from '../components/ui/background-beams';
import { GlowingEffect } from '../components/ui/glowing-effect';
import { Boxes } from '../components/ui/background-boxes';
import SideMarginPatterns from '../components/ui/side-margin-patterns';

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
  useEffect(() => {
    document.title = "Quick Comment AI - LinkedIn AI Comment Generator & Chrome Extension";
  }, []);
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
            {/* Hero Section with Aceternity Background Boxes */}
            <div className="relative w-full border-b border-white/10 overflow-hidden">
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
                      <Link
                        to="/extension"
                        className="group rounded-[calc(2.2rem-0.25rem)] px-8 py-4 bg-white text-black font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-between gap-4 hover:bg-neutral-200 active:scale-[0.98] transition-all duration-300"
                      >
                        <span>Launch Extension Portal (/extension)</span>
                        <div className="w-7 h-7 rounded-full bg-black/10 flex items-center justify-center group-hover:translate-x-1 transition-transform duration-300">
                          <svg className="w-4 h-4 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <path d="M5 12h14M12 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round" />
                          </svg>
                        </div>
                      </Link>
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

            {/* CTA Banner Section */}
            <GridSection>
              <div className="bg-[#090909] border border-white/10 p-2 rounded-[2.5rem]">
                <div className="bg-black border border-white/5 rounded-[calc(2.5rem-0.5rem)] p-8 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div>
                    <h3 className="relative z-10 text-2xl md:text-3xl font-sans font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-100 to-neutral-400 mb-2">Ready to Start?</h3>
                    <p className="text-xs font-mono text-neutral-400 max-w-lg">
                      Access your session center, view daily quota usage, and manage your plan subscriptions.
                    </p>
                  </div>
                  <Link
                    to="/extension"
                    className="group rounded-full px-8 py-4 bg-white text-black font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-3 hover:bg-neutral-200 active:scale-[0.98] transition-all shrink-0"
                  >
                    <span>Go to /extension Portal</span>
                    <div className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                      <svg className="w-3.5 h-3.5 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <path d="M5 12h14M12 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                    </div>
                  </Link>
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
              <Link to="/extension" className="text-neutral-400 hover:text-white transition-colors">
                /extension Portal &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
