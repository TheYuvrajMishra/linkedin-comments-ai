import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { BackgroundBeams } from '../components/ui/background-beams';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from '../firebase';

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";

const PAYMENT_LINKS = {
  inr: {
    pro: process.env.RAZORPAY_PRO_LINK_INR || "https://rzp.io/rzp/YJ677Vl",
    ultra: process.env.RAZORPAY_ULTRA_LINK_INR || "https://rzp.io/rzp/Oyz6stR"
  },
  usd: {
    pro: process.env.RAZORPAY_PRO_LINK_USD || "https://rzp.io/rzp/twQPHug",
    ultra: process.env.RAZORPAY_ULTRA_LINK_USD || "https://rzp.io/rzp/7d2rZJB"
  }
};

export default function ExtensionPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [authError, setAuthError] = useState('');

  const [currency, setCurrency] = useState('inr'); // 'inr' | 'usd'
  const [userProfile, setUserProfile] = useState(null);
  const [gateNotice, setGateNotice] = useState('');

  // Auto-detect timezone currency
  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz !== "Asia/Kolkata" && tz !== "Asia/Calcutta") {
        setCurrency('usd');
      }
    } catch (e) {}
  }, []);

  // Sync auth state & broadcast to Chrome extension
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      if (currentUser) {
        try {
          const idToken = await currentUser.getIdToken();
          const authData = {
            uid: currentUser.uid,
            email: currentUser.email,
            idToken: idToken
          };

          // Save to local storage for extension bridge
          localStorage.setItem('eloquix_auth', JSON.stringify(authData));

          // Post message to window for content script / bridge
          window.postMessage({ type: 'ELOQUIX_AUTH_STATE', userAuth: authData }, '*');

          setUser(currentUser);
          setAuthError('');

          // Verify with backend
          fetch(`${BACKEND_URL}/api/v1/auth/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(authData)
          }).catch(err => console.warn('Backend verify offline:', err));

          // Load profile
          fetchProfile(currentUser.uid, idToken);
        } catch (e) {
          console.error("Error setting up user auth token:", e);
        }
      } else {
        localStorage.removeItem('eloquix_auth');
        window.postMessage({ type: 'ELOQUIX_AUTH_STATE', userAuth: null }, '*');
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const fetchProfile = async (uid, idToken) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/user/profile?uid=${encodeURIComponent(uid)}`, {
        headers: { Authorization: idToken ? `Bearer ${idToken}` : '' }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.profile) {
          setUserProfile(data.profile);
        }
      }
    } catch (e) {
      console.warn("Could not fetch user profile:", e);
    }
  };

  const handleGoogleAuth = async () => {
    setAuthSubmitting(true);
    setAuthError('');
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error("Google Auth error:", err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setAuthError(err.message || 'Google sign-in failed.');
      }
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleSubscriptionClick = (plan) => {
    if (!user) {
      setGateNotice('Subscription purchase requires Google authentication. Please sign in above to continue.');
      const authSection = document.getElementById('auth-section');
      if (authSection) {
        authSection.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    const link = PAYMENT_LINKS[currency][plan];
    if (link) {
      window.open(link, '_blank');
    }
  };

  return (
    <div className="relative min-h-[100dvh] bg-[#050505] text-white flex flex-col justify-between selection:bg-white selection:text-black overflow-hidden">
      {/* Aceternity Background Beams */}
      <BackgroundBeams className="pointer-events-none opacity-40 z-0" />

      <div className="relative z-10 flex flex-col justify-between min-h-[100dvh]">
        <div>
          {/* Shared Consistent Floating Navbar */}
          <Navbar />

          {/* Main Consistent Container */}
          <main className="max-w-5xl mx-auto px-4 py-8 md:py-16">
            {/* Header Title Section */}
            <section className="mb-12">
              <h1 className="relative z-10 text-3xl md:text-5xl font-sans font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-neutral-100 via-neutral-200 to-neutral-500 mb-3 leading-tight">
                Extension Session & Account Center
              </h1>
              <p className="text-sm font-mono text-zinc-400 max-w-xl leading-relaxed">
                Single source of truth for Eloquix Chrome Extension authentication. Logging in here automatically authenticates your browser extension in real time.
              </p>
            </section>

            {/* Gating Notice Banner */}
            {gateNotice && !user && (
              <div className="mb-8 p-4 bg-zinc-950 border border-white/15 rounded-2xl text-xs font-mono text-zinc-200 flex justify-between items-center">
                <span>{gateNotice}</span>
                <button onClick={() => setGateNotice('')} className="text-zinc-500 hover:text-white uppercase tracking-wider ml-4">
                  Dismiss
                </button>
              </div>
            )}

            {/* Double-Bezel Auth Card Container */}
            <section id="auth-section" className="mb-16">
              <div className="bg-white/[0.03] border border-white/10 p-2 rounded-[2.2rem] backdrop-blur-sm">
                <div className="bg-zinc-950/90 border border-white/5 rounded-[calc(2.2rem-0.5rem)] p-6 md:p-10">
                  {loading ? (
                    <div className="py-8 text-center text-xs font-mono text-zinc-500 uppercase tracking-widest">
                      Checking active session...
                    </div>
                  ) : user ? (
                    /* LOGGED-IN DASHBOARD */
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-white/10 gap-4">
                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500 block mb-1">
                            Authenticated Account
                          </span>
                          <span className="text-xl font-bold text-white font-mono">{user.email}</span>
                        </div>
                        <span className="self-start sm:self-auto px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-300">
                          {(userProfile?.plan || 'free').toUpperCase()} PLAN
                        </span>
                      </div>

                      <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl mb-8">
                        <span className="text-[10px] font-mono text-zinc-500 block mb-1 uppercase tracking-widest">
                          Daily Generation Quota
                        </span>
                        <span className="text-base font-mono text-white font-bold">
                          {userProfile?.commentsGeneratedToday ?? 0} / {userProfile?.dailyLimit ?? 2} comments used today
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                          <span>Extension Synced & Active</span>
                        </div>
                        <button
                          onClick={handleLogout}
                          className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs font-mono text-white tracking-wider uppercase transition-colors"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* LOGGED-OUT STATE - GOOGLE AUTH ONLY */
                    <div>
                      <div className="mb-8">
                        <h3 className="relative z-10 text-xl font-sans font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-100 to-neutral-400 mb-2">Google Single Sign-On</h3>
                        <p className="text-xs text-zinc-400 font-mono leading-relaxed max-w-md">
                          Sign in using your Google Account to authorize your extension session and activate daily AI comment quotas.
                        </p>
                      </div>

                      {authError && (
                        <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded-xl text-xs font-mono text-zinc-300">
                          {authError}
                        </div>
                      )}

                      {/* Double-Bezel Button-in-Button Google Auth Pill */}
                      <div className="p-1 rounded-[2.2rem] bg-white/10 border border-white/15 max-w-md">
                        <button
                          onClick={handleGoogleAuth}
                          disabled={authSubmitting}
                          className="group w-full rounded-[calc(2.2rem-0.25rem)] px-7 py-4 bg-white text-black font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-between gap-4 hover:bg-zinc-200 active:scale-[0.98] transition-all duration-300 disabled:opacity-50"
                        >
                          <div className="flex items-center gap-3">
                            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                              <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032 s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2 C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.761H12.545z"/>
                            </svg>
                            <span>{authSubmitting ? 'Authenticating...' : 'Continue with Google'}</span>
                          </div>
                          <div className="w-7 h-7 rounded-full bg-black/10 flex items-center justify-center group-hover:translate-x-1 transition-transform duration-300">
                            <svg className="w-4 h-4 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                              <path d="M5 12h14M12 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Subscription Section */}
            <section className="mb-16">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                  <h3 className="relative z-10 text-2xl font-sans font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-neutral-100 to-neutral-400">Subscription Tier Selection</h3>
                  <p className="text-xs font-mono text-zinc-400 mt-1">
                    Gated purchase &bull; Authentication required before upgrading.
                  </p>
                </div>

                {/* Currency Selector Pill */}
                <div className="flex items-center gap-1 bg-white/5 p-1 border border-white/10 rounded-full self-start sm:self-auto">
                  <button
                    onClick={() => setCurrency('inr')}
                    className={`px-4 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-wider transition-colors ${
                      currency === 'inr' ? 'bg-white text-black font-bold' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    INR (₹)
                  </button>
                  <button
                    onClick={() => setCurrency('usd')}
                    className={`px-4 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-wider transition-colors ${
                      currency === 'usd' ? 'bg-white text-black font-bold' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    USD ($)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pro Plan - Double Bezel */}
                <div className="bg-white/[0.03] border border-white/10 p-2 rounded-[2.2rem] backdrop-blur-sm">
                  <div className="bg-zinc-950/90 border border-white/5 rounded-[calc(2.2rem-0.5rem)] p-8 h-full flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-xl font-bold text-white">Pro Plan</h4>
                        <span className="text-[10px] font-mono text-zinc-400 border border-white/10 px-2.5 py-1 rounded-full bg-white/5">
                          20 COMMENTS/DAY
                        </span>
                      </div>
                      <div className="text-3xl font-bold text-white font-mono mb-6">
                        {currency === 'inr' ? '₹49' : '$4.99'} <span className="text-xs font-normal text-zinc-500">/ month</span>
                      </div>
                      <ul className="space-y-3 mb-8 text-xs text-zinc-300 font-mono">
                        <li className="flex items-center gap-2">
                          <span className="text-zinc-500">—</span> 20 AI comments per day
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-zinc-500">—</span> All 5 comment tones
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-zinc-500">—</span> Custom writing style persona
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-zinc-500">—</span> Priority Groq API speed
                        </li>
                      </ul>
                    </div>

                    <div>
                      {!user ? (
                        <button
                          onClick={() => handleSubscriptionClick('pro')}
                          className="w-full rounded-full py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white font-mono text-xs uppercase tracking-wider transition-colors"
                        >
                          Log In to Subscribe
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSubscriptionClick('pro')}
                          className="group w-full rounded-full py-3.5 px-6 bg-white text-black font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-between hover:bg-zinc-200 active:scale-[0.98] transition-all"
                        >
                          <span>Upgrade Pro ({currency === 'inr' ? '₹49/mo' : '$4.99/mo'})</span>
                          <div className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                            <svg className="w-3.5 h-3.5 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                              <path d="M5 12h14M12 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                          </div>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Ultra Plan - Double Bezel */}
                <div className="bg-white/[0.03] border border-white/10 p-2 rounded-[2.2rem] backdrop-blur-sm">
                  <div className="bg-zinc-950/90 border border-white/5 rounded-[calc(2.2rem-0.5rem)] p-8 h-full flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-xl font-bold text-white">Ultra Plan</h4>
                        <span className="text-[10px] font-mono text-zinc-400 border border-white/10 px-2.5 py-1 rounded-full bg-white/5">
                          50 COMMENTS/DAY
                        </span>
                      </div>
                      <div className="text-3xl font-bold text-white font-mono mb-6">
                        {currency === 'inr' ? '₹99' : '$7.99'} <span className="text-xs font-normal text-zinc-500">/ month</span>
                      </div>
                      <ul className="space-y-3 mb-8 text-xs text-zinc-300 font-mono">
                        <li className="flex items-center gap-2">
                          <span className="text-zinc-500">—</span> 50 AI comments per day
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-zinc-500">—</span> Priority server queueing
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-zinc-500">—</span> Unlimited comment regenerations
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="text-zinc-500">—</span> Dedicated support access
                        </li>
                      </ul>
                    </div>

                    <div>
                      {!user ? (
                        <button
                          onClick={() => handleSubscriptionClick('ultra')}
                          className="w-full rounded-full py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white font-mono text-xs uppercase tracking-wider transition-colors"
                        >
                          Log In to Subscribe
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSubscriptionClick('ultra')}
                          className="group w-full rounded-full py-3.5 px-6 bg-white text-black font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-between hover:bg-zinc-200 active:scale-[0.98] transition-all"
                        >
                          <span>Upgrade Ultra ({currency === 'inr' ? '₹99/mo' : '$7.99/mo'})</span>
                          <div className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                            <svg className="w-3.5 h-3.5 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                              <path d="M5 12h14M12 5l7 7-7 7" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                          </div>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </main>
        </div>

        {/* Consistent Footer */}
        <footer className="max-w-5xl mx-auto w-full px-4 py-8 border-t border-white/10 text-xs font-mono text-zinc-600 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>Eloquix Portal (/extension) &bull; Google Auth Edition</div>
          <Link to="/" className="text-zinc-400 hover:text-white transition-colors">
            &larr; Back to Overview
          </Link>
        </footer>
      </div>
    </div>
  );
}
