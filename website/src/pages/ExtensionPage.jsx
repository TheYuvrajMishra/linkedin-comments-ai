import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { BackgroundBeams } from '../components/ui/background-beams';
import { GlowingEffect } from '../components/ui/glowing-effect';
import SideMarginPatterns from '../components/ui/side-margin-patterns';
import { WAITLIST_MODE, WAITLIST_TARGET } from '../config';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signOut,
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

export default function ExtensionPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [authError, setAuthError] = useState('');

  const [currency, setCurrency] = useState('inr'); // 'inr' | 'usd'
  const [userProfile, setUserProfile] = useState(null);
  const [gateNotice, setGateNotice] = useState('');

  // Waitlist System States
  const [isWaitlistMode, setIsWaitlistMode] = useState(WAITLIST_MODE);
  const [waitlistCount, setWaitlistCount] = useState(0);
  const [alreadyWaitlisted, setAlreadyWaitlisted] = useState(false);
  const [waitlistSuccessMsg, setWaitlistSuccessMsg] = useState('');

  // Auto-detect timezone currency
  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz !== "Asia/Kolkata" && tz !== "Asia/Calcutta") {
        setCurrency('usd');
      }
    } catch (e) {}
  }, []);

  // Fetch live waitlist count & backend mode
  useEffect(() => {
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

  // Sync auth state & broadcast to Chrome extension
  useEffect(() => {
    document.title = isWaitlistMode
      ? "Chrome Extension Pre-Launch Waitlist - Quick Comment AI"
      : "Extension Session & Account Hub - Quick Comment AI";

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
          localStorage.setItem('quick_comment_ai_auth', JSON.stringify(authData));

          // Post message to window for content script / bridge
          window.postMessage({ type: 'QUICK_COMMENT_AI_AUTH_STATE', userAuth: authData }, '*');

          setUser(currentUser);
          setAuthError('');

          // Verify with backend
          fetch(`${BACKEND_URL}/api/v1/auth/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(authData)
          }).catch(err => console.warn('Backend verify offline:', err));

          // Load user profile
          fetchProfile(currentUser.uid, idToken);

          // Register / sync in waitlist DB if waitlist mode is active
          registerWaitlistUser(currentUser, idToken);
        } catch (e) {
          console.error("Error setting up user auth token:", e);
        }
      } else {
        localStorage.removeItem('quick_comment_ai_auth');
        window.postMessage({ type: 'QUICK_COMMENT_AI_AUTH_STATE', userAuth: null }, '*');
        setUser(null);
        setUserProfile(null);
        setAlreadyWaitlisted(false);
        setWaitlistSuccessMsg('');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isWaitlistMode]);

  const registerWaitlistUser = async (currentUser, idToken) => {
    if (!currentUser || !currentUser.email) return;
    try {
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
      if (data.success) {
        if (data.count !== undefined) {
          setWaitlistCount(data.count);
        }
        setAlreadyWaitlisted(data.alreadyJoined);
        setWaitlistSuccessMsg(data.message || 'Waitlist spot confirmed!');
      }
    } catch (e) {
      console.warn("Could not sync waitlist record:", e);
    }
  };

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
      const result = await signInWithPopup(auth, googleProvider);
      if (result?.user && isWaitlistMode) {
        const idToken = await result.user.getIdToken();
        await registerWaitlistUser(result.user, idToken);
      }
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

  const handleSubscriptionClick = async (plan) => {
    if (isWaitlistMode) {
      alert('Subscription purchases are currently locked during pre-launch. Secure your spot on the waitlist above to receive early access when we go live!');
      return;
    }

    if (!user) {
      setGateNotice('Subscription purchase requires Google authentication. Please sign in above to continue.');
      const authSection = document.getElementById('auth-section');
      if (authSection) {
        authSection.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/v1/payments/create-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, currency: currency.toUpperCase() })
      });
      const data = await res.json();
      if (data.success && data.checkoutUrl) {
        window.open(data.checkoutUrl, '_blank');
      } else {
        alert('Could not retrieve payment checkout URL. Please try again.');
      }
    } catch (e) {
      console.error('Error fetching checkout URL from backend:', e);
      alert('Unable to connect to payment gateway server.');
    }
  };

  const progressPercent = Math.min(100, Math.round(((waitlistCount || 0) / WAITLIST_TARGET) * 100));

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
            {/* Header Title Section */}
            <GridSection>
              <h1 className="relative z-10 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-sans font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-neutral-100 via-neutral-200 to-neutral-500 mb-4 leading-tight">
                {isWaitlistMode ? 'Chrome Extension Pre-Launch Waitlist' : 'Extension Session & Account Center'}
              </h1>
              <p className="text-sm sm:text-base font-mono text-neutral-400 max-w-2xl leading-relaxed">
                {isWaitlistMode
                  ? 'Quick Comment AI is holding off on Chrome Web Store publishing fees during pre-launch. Join the early access waitlist to reserve priority access when we go live.'
                  : 'Single source of truth for Quick Comment AI Chrome Extension authentication. Logging in here automatically authenticates your browser extension in real time.'}
              </p>
            </GridSection>

            {/* Gating Notice Banner (Live Mode Only) */}
            {!isWaitlistMode && gateNotice && !user && (
              <div className="w-full border-b border-white/10">
                <div className="max-w-7xl mx-auto px-6 sm:px-12 py-4">
                  <div className="p-4 bg-black border border-white/15 rounded-2xl text-xs font-mono text-neutral-200 flex justify-between items-center">
                    <span>{gateNotice}</span>
                    <button onClick={() => setGateNotice('')} className="text-neutral-500 hover:text-white uppercase tracking-wider ml-4">
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 1. AUTH / GOOGLE SIGN-IN CARD (FIRST) */}
            <GridSection id="auth-section">
              <div className="bg-[#090909] border border-white/10 p-2 rounded-[2.2rem] backdrop-blur-sm">
                <div className="bg-black border border-white/5 rounded-[calc(2.2rem-0.5rem)] p-6 md:p-10">
                  {loading ? (
                    <div className="py-8 text-center text-xs font-mono text-neutral-500 uppercase tracking-widest">
                      Checking session status...
                    </div>
                  ) : user ? (
                    /* LOGGED-IN STATE */
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-white/10 gap-4">
                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-500 block mb-1">
                            {isWaitlistMode ? 'Waitlist Entry Reserved & Authenticated' : 'Authenticated Account'}
                          </span>
                          <span className="text-xl font-bold text-white font-mono">{user.email}</span>
                        </div>
                        <span className="self-start sm:self-auto px-3 py-1 bg-white/10 border border-white/20 rounded-full text-[10px] font-mono uppercase tracking-[0.2em] text-white font-bold">
                          {isWaitlistMode
                            ? `RESERVED SPOT #${(userProfile?.waitlistPosition || waitlistCount) || 1}`
                            : `${(userProfile?.plan || 'free').toUpperCase()} PLAN`}
                        </span>
                      </div>

                      {isWaitlistMode ? (
                        <div className="p-6 bg-[#050505] border border-white/5 rounded-2xl mb-8 font-mono text-xs text-neutral-300 space-y-3">
                          <div className="flex items-center gap-2 text-white font-bold">
                            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            <span>{alreadyWaitlisted ? "Waitlist Membership Confirmed" : (waitlistSuccessMsg || "Successfully Registered on Pre-Launch Waitlist!")}</span>
                          </div>
                          <p className="text-neutral-400 leading-relaxed">
                            Your Google account <strong className="text-neutral-200">{user.email}</strong> is recorded on our backend waitlist database and actively logged into the platform session.
                          </p>
                          <p className="text-neutral-500 leading-relaxed">
                            When Quick Comment AI launches live on the Chrome Web Store, your session is already authenticated — you will not need to sign in again to access your daily AI comment quota.
                          </p>
                        </div>
                      ) : (
                        <div className="p-6 bg-[#050505] border border-white/5 rounded-2xl mb-8">
                          <span className="text-[10px] font-mono text-neutral-500 block mb-1 uppercase tracking-widest">
                            Daily Generation Quota
                          </span>
                          <span className="text-base font-mono text-white font-bold">
                            {userProfile?.commentsGeneratedToday ?? 0} / {userProfile?.dailyLimit ?? 2} comments used today
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
                          <span className="w-2 h-2 rounded-full bg-white"></span>
                          <span>Session Active & Authenticated</span>
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
                        <h3 className="relative z-10 text-xl font-sans font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-100 to-neutral-400 mb-2">
                          {isWaitlistMode ? 'Join Pre-Launch Waitlist with Google' : 'Google Single Sign-On'}
                        </h3>
                        <p className="text-xs text-neutral-400 font-mono leading-relaxed max-w-md">
                          {isWaitlistMode
                            ? 'Sign in with your Google Account to capture your waitlist entry. This creates your authenticated account session now so you remain logged in seamlessly when live access opens.'
                            : 'Sign in using your Google Account to authorize your extension session and activate daily AI comment quotas.'}
                        </p>
                      </div>

                      {authError && (
                        <div className="mb-6 p-4 bg-white/5 border border-white/10 rounded-xl text-xs font-mono text-neutral-300">
                          {authError}
                        </div>
                      )}

                      {/* Double-Bezel Button-in-Button Google Auth Pill */}
                      <div className="p-1 rounded-[2.2rem] bg-neutral-900 border border-white/15 max-w-md">
                        <button
                          onClick={handleGoogleAuth}
                          disabled={authSubmitting}
                          className="group w-full rounded-[calc(2.2rem-0.25rem)] px-7 py-4 bg-white text-black font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-between gap-4 hover:bg-neutral-200 active:scale-[0.98] transition-all duration-300 disabled:opacity-50"
                        >
                          <div className="flex items-center gap-3">
                            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                              <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032 s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2 C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.761H12.545z"/>
                            </svg>
                            <span>{authSubmitting ? 'Authenticating...' : 'Continue with Google'}</span>
                          </div>
                          <div className="w-7 h-7 rounded-full bg-black/10 flex items-center justify-center group-hover:translate-x-1 transition-transform duration-300">
                            <svg className="w-4 h-4 text-black" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" stroke="currentColor">
                              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </GridSection>

            {/* 2. WAITLIST MODE: LIVE COUNTER CARD (NOW BELOW THE GOOGLE LOGIN BUTTON CARD) */}
            {isWaitlistMode && (
              <GridSection id="waitlist-counter-section">
                <div className="bg-[#090909] border border-white/10 p-2 rounded-[2.2rem] backdrop-blur-sm">
                  <div className="bg-black border border-white/5 rounded-[calc(2.2rem-0.5rem)] p-6 md:p-10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-white/10 gap-4">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-500 block mb-1">
                          Live Pre-Launch Signups
                        </span>
                        <div className="flex items-baseline gap-3">
                          <span className="text-4xl sm:text-5xl font-bold text-white font-mono tracking-tight">
                            {String(waitlistCount).padStart(3, '0')}
                          </span>
                          <span className="text-sm font-mono text-neutral-500">
                            / {WAITLIST_TARGET} TARGET SLOTS
                          </span>
                        </div>
                      </div>

                      <div className="self-start sm:self-auto flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        <span>REAL-TIME COUNT</span>
                      </div>
                    </div>

                    {/* Monochrome Progress Bar */}
                    <div>
                      <div className="flex justify-between items-center text-xs font-mono text-neutral-400 mb-2">
                        <span>Waitlist Capacity</span>
                        <span>{progressPercent}% Filled</span>
                      </div>
                      <div className="w-full h-2 bg-neutral-900 border border-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-white transition-all duration-700 ease-out"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </GridSection>
            )}

            {/* 3. SUBSCRIPTION TIER SELECTION (PERFECTLY VISIBLE IN BOTH MODES, BUTTONS LOCKED IN WAITLIST MODE) */}
            <GridSection id="pricing-section">
              <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="relative z-10 text-2xl font-sans font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-neutral-100 to-neutral-400">
                      Subscription Tier Selection
                    </h3>
                    {isWaitlistMode && (
                      <span className="px-3 py-1 bg-white/5 border border-white/15 rounded-full text-[10px] font-mono text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                        <svg className="w-3 h-3 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        <span>Purchases Locked Pre-Launch</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-mono text-neutral-400 mt-1">
                    {isWaitlistMode
                      ? 'Transparent fixed pricing &bull; Subscription checkout is locked during waitlist mode and unlocks at Web Store launch.'
                      : 'Gated purchase &bull; Authentication required before upgrading.'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Pro Plan */}
                <div className="relative bg-[#090909] border border-white/15 p-2 rounded-[2.2rem] backdrop-blur-md hover:border-white/30 transition-colors group">
                  <GlowingEffect
                    spread={40}
                    glow={true}
                    disabled={false}
                    proximity={64}
                    inactiveZone={0.01}
                    borderWidth={1.5}
                  />
                  <div className="relative z-10 bg-black border border-white/5 rounded-[calc(2.2rem-0.5rem)] p-8 md:p-10 h-full flex flex-col justify-between overflow-hidden">
                    <div 
                      className="absolute inset-0 z-0 opacity-15 pointer-events-none"
                      style={{
                        backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.25) 1px, transparent 1px)`,
                        backgroundSize: '12px 12px'
                      }}
                    />

                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-xl font-bold text-white">Pro Plan</h4>
                        <span className="text-[10px] font-mono text-neutral-300 border border-white/15 px-3 py-1 rounded-full bg-white/5 backdrop-blur-md">
                          20 COMMENTS/DAY
                        </span>
                      </div>
                      <div className="text-3xl font-bold text-white font-mono mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white via-neutral-100 to-neutral-400">
                        {currency === 'inr' ? '₹49' : '₹500 / $5.99'} <span className="text-xs font-normal text-neutral-500">/ month</span>
                      </div>
                      <ul className="space-y-3 mb-8 text-xs text-neutral-300 font-mono">
                        <li className="flex items-center gap-2.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 shrink-0" /> 20 AI comments per day
                        </li>
                        <li className="flex items-center gap-2.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 shrink-0" /> All 5 comment tones
                        </li>
                        <li className="flex items-center gap-2.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 shrink-0" /> Custom writing style persona
                        </li>
                        <li className="flex items-center gap-2.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 shrink-0" /> Priority Groq API speed
                        </li>
                      </ul>
                    </div>

                    <div className="relative z-10">
                      {isWaitlistMode ? (
                        /* LOCKED BUTTON IN WAITLIST MODE */
                        <button
                          disabled
                          onClick={() => handleSubscriptionClick('pro')}
                          className="w-full rounded-full py-3.5 px-6 bg-white/5 border border-white/15 text-neutral-500 font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-not-allowed opacity-80"
                        >
                          <svg className="w-3.5 h-3.5 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                          </svg>
                          <span>Locked &bull; Unlocks at Launch</span>
                        </button>
                      ) : !user ? (
                        <button
                          onClick={() => handleSubscriptionClick('pro')}
                          className="w-full rounded-full py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-400 hover:text-white font-mono text-xs uppercase tracking-wider transition-colors"
                        >
                          Log In to Subscribe
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSubscriptionClick('pro')}
                          className="group/btn w-full rounded-full py-3.5 px-6 bg-white text-black font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-between hover:bg-neutral-200 active:scale-[0.98] transition-all shadow-lg"
                        >
                          <span>Upgrade Pro ({currency === 'inr' ? '₹49/mo' : '₹500/mo'})</span>
                          <div className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center group-hover/btn:translate-x-1 transition-transform">
                            <svg className="w-3.5 h-3.5 text-black" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" stroke="currentColor">
                              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Ultra Plan */}
                <div className="relative group">
                  <div className="absolute -inset-1 rounded-[2.3rem] bg-gradient-to-r from-white/20 via-neutral-300/30 to-white/20 blur-lg opacity-40 group-hover:opacity-80 transition-opacity duration-700 pointer-events-none" />

                  <div className="relative bg-[#090909] border border-white/25 p-2 rounded-[2.2rem] backdrop-blur-md hover:border-white/40 transition-colors h-full">
                    <GlowingEffect
                      spread={50}
                      glow={true}
                      disabled={false}
                      proximity={64}
                      inactiveZone={0.01}
                      borderWidth={1.5}
                    />
                    <div className="relative z-10 bg-black border border-white/10 rounded-[calc(2.2rem-0.5rem)] p-8 md:p-10 h-full flex flex-col justify-between overflow-hidden">
                      <div 
                        className="absolute inset-0 z-0 opacity-20 pointer-events-none"
                        style={{
                          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.3) 1px, transparent 1px)`,
                          backgroundSize: '12px 12px'
                        }}
                      />

                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-xl font-bold text-white flex items-center gap-2">
                            <span>Ultra Plan</span>
                          </h4>
                          <span className="text-[10px] font-mono font-bold text-black bg-white border border-white px-3 py-1 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.4)]">
                            50 COMMENTS/DAY
                          </span>
                        </div>
                        <div className="text-3xl font-bold text-white font-mono mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white via-neutral-100 to-neutral-400">
                          {currency === 'inr' ? '₹99' : '₹900 / $9.99'} <span className="text-xs font-normal text-neutral-500">/ month</span>
                        </div>
                        <ul className="space-y-3 mb-8 text-xs text-neutral-300 font-mono">
                          <li className="flex items-center gap-2.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] shrink-0" /> 50 AI comments per day
                          </li>
                          <li className="flex items-center gap-2.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] shrink-0" /> Priority server queueing
                          </li>
                          <li className="flex items-center gap-2.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] shrink-0" /> Unlimited comment regenerations
                          </li>
                          <li className="flex items-center gap-2.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] shrink-0" /> Dedicated support access
                          </li>
                        </ul>
                      </div>

                      <div className="relative z-10">
                        {isWaitlistMode ? (
                          /* LOCKED BUTTON IN WAITLIST MODE */
                          <button
                            disabled
                            onClick={() => handleSubscriptionClick('ultra')}
                            className="w-full rounded-full py-3.5 px-6 bg-white/5 border border-white/15 text-neutral-500 font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-not-allowed opacity-80"
                          >
                            <svg className="w-3.5 h-3.5 text-neutral-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                            <span>Locked &bull; Unlocks at Launch</span>
                          </button>
                        ) : !user ? (
                          <button
                            onClick={() => handleSubscriptionClick('ultra')}
                            className="w-full rounded-full py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-400 hover:text-white font-mono text-xs uppercase tracking-wider transition-colors"
                          >
                            Log In to Subscribe
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSubscriptionClick('ultra')}
                            className="group/btn w-full rounded-full py-3.5 px-6 bg-white text-black font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-between hover:bg-neutral-200 active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                          >
                            <span>Upgrade Ultra ({currency === 'inr' ? '₹99/mo' : '₹900/mo'})</span>
                            <div className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center group-hover/btn:translate-x-1 transition-transform">
                              <svg className="w-3.5 h-3.5 text-black" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" stroke="currentColor">
                                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </div>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </GridSection>

            {/* PRE-LAUNCH TEASER GRID (WAITLIST MODE ONLY) */}
            {isWaitlistMode && (
              <GridSection>
                <div className="mb-10">
                  <h3 className="relative z-10 text-2xl font-sans font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-neutral-100 to-neutral-400">
                    What Unlocks at Chrome Web Store Launch
                  </h3>
                  <p className="text-xs font-mono text-neutral-400 mt-1">
                    Pre-launch preview &bull; Instant activation for waitlisted Google accounts.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-[#090909] border border-white/10 p-6 rounded-2xl">
                    <div className="text-xs font-mono text-neutral-500 uppercase tracking-widest mb-2">01 &bull; Seamless Integration</div>
                    <h4 className="text-base font-bold text-white mb-2">LinkedIn Feed Injection</h4>
                    <p className="text-xs font-mono text-neutral-400 leading-relaxed">
                      One-click comment generation button embedded right inside your LinkedIn post response boxes.
                    </p>
                  </div>

                  <div className="bg-[#090909] border border-white/10 p-6 rounded-2xl">
                    <div className="text-xs font-mono text-neutral-500 uppercase tracking-widest mb-2">02 &bull; 5 Persona Tones</div>
                    <h4 className="text-base font-bold text-white mb-2">Contextual AI Engine</h4>
                    <p className="text-xs font-mono text-neutral-400 leading-relaxed">
                      Generate insightful, supportive, constructive, funny, or questioning replies under 25 words.
                    </p>
                  </div>

                  <div className="bg-[#090909] border border-white/10 p-6 rounded-2xl">
                    <div className="text-xs font-mono text-neutral-500 uppercase tracking-widest mb-2">03 &bull; Automatic Access</div>
                    <h4 className="text-base font-bold text-white mb-2">Instant Quota Activation</h4>
                    <p className="text-xs font-mono text-neutral-400 leading-relaxed">
                      Your waitlisted Google session is preserved — zero additional sign-ins required when live.
                    </p>
                  </div>
                </div>
              </GridSection>
            )}
          </main>

          {/* Footer Section */}
          <div className="relative w-full border-b border-white/10">
            <div className="max-w-7xl mx-auto px-6 sm:px-12 relative py-8 text-xs font-mono text-neutral-600 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="absolute -top-4 -bottom-4 left-0 w-[1px] bg-white/10 pointer-events-none z-10" />
              <div className="absolute -top-4 -bottom-4 right-0 w-[1px] bg-white/10 pointer-events-none z-10" />

              <div>Quick Comment AI Portal (/extension) &bull; Pre-Launch Waitlist Architecture</div>
              <Link to="/" className="text-neutral-400 hover:text-white transition-colors">
                &larr; Back to Overview
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
