import React, { useState, useEffect } from 'react';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from './firebase';

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

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);

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

  // Sync auth state & broadcast to extension
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

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setAuthError('Please fill in both email and password.');
      return;
    }
    setAuthSubmitting(true);
    setAuthError('');
    try {
      if (authMode === 'signup') {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      console.error("Auth error:", err);
      let msg = err.message || 'Authentication failed.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = 'Invalid email or password.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'An account with this email already exists. Please sign in.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password should be at least 6 characters.';
      }
      setAuthError(msg);
    } finally {
      setAuthSubmitting(false);
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
      setEmail('');
      setPassword('');
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleSubscriptionClick = (plan) => {
    if (!user) {
      setGateNotice('Subscription purchase requires authentication. Please log in or create an account above to continue.');
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
    <div className="min-h-screen bg-black text-white px-4 py-8 md:py-12 max-w-4xl mx-auto flex flex-col justify-between">
      <div>
        {/* Header Bar */}
        <header className="flex items-center justify-between pb-6 mb-8 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3c.132 0 .263 0 .393.007a7.5 7.5 0 0 0 7.92 7.92c.11.002.22.003.33.003a.75.75 0 0 1 0 1.5c-.11 0-.22 0-.33.003a7.5 7.5 0 0 0-7.92 7.92c-.007.13-.007.261-.007.391a.75.75 0 0 1-1.5 0c0-.13 0-.261-.007-.391a7.5 7.5 0 0 0-7.92-7.92C2.86 12.44 2.75 12.43 2.64 12.43a.75.75 0 0 1 0-1.5c.11 0 .22-.001.33-.003a7.5 7.5 0 0 0 7.92-7.92C10.9 3.004 11.03 3 11.16 3a.75.75 0 0 1 .84 0Z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white leading-none">Eloquix</h1>
              <p className="text-xs text-zinc-500 font-mono mt-1">LinkedIn AI Comment Companion</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-zinc-400"></span>
            <span className="text-xs font-mono text-zinc-400">
              {loading ? 'Checking...' : user ? user.email : 'Logged Out'}
            </span>
          </div>
        </header>

        {/* Hero Section */}
        <section className="mb-10">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-2">
            Companion Account Center
          </h2>
          <p className="text-sm text-zinc-400 max-w-xl leading-relaxed">
            Single source of truth for Eloquix authentication. Once signed in here, your session automatically syncs with the Chrome extension.
          </p>
        </section>

        {/* Gating Notice Banner if triggered */}
        {gateNotice && !user && (
          <div className="mb-6 p-4 bg-zinc-900 border border-zinc-700 text-sm text-zinc-200 flex justify-between items-center">
            <span>{gateNotice}</span>
            <button onClick={() => setGateNotice('')} className="text-xs font-mono text-zinc-400 hover:text-white ml-4">
              Dismiss
            </button>
          </div>
        )}

        {/* Auth Section */}
        <section id="auth-section" className="mb-12">
          <div className="bg-zinc-950 border border-zinc-800 p-6 md:p-8">
            {loading ? (
              <div className="py-8 text-center text-sm font-mono text-zinc-500">
                Checking authentication session...
              </div>
            ) : user ? (
              /* LOGGED-IN STATE */
              <div>
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-zinc-800">
                  <div>
                    <span className="text-xs font-mono uppercase tracking-wider text-zinc-500 block mb-1">
                      Authenticated Account
                    </span>
                    <span className="text-lg font-semibold text-white font-mono">{user.email}</span>
                  </div>
                  <span className="px-3 py-1 bg-zinc-900 border border-zinc-700 text-xs font-mono uppercase tracking-wider text-zinc-300">
                    {(userProfile?.plan || 'free').toUpperCase()} PLAN
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-zinc-900 border border-zinc-800">
                    <span className="text-xs font-mono text-zinc-500 block mb-1">User Identifier</span>
                    <span className="text-xs font-mono text-zinc-300 block truncate">{user.uid}</span>
                  </div>
                  <div className="p-4 bg-zinc-900 border border-zinc-800">
                    <span className="text-xs font-mono text-zinc-500 block mb-1">Daily Usage Quota</span>
                    <span className="text-sm font-mono text-white">
                      {userProfile?.commentsGeneratedToday ?? 0} / {userProfile?.dailyLimit ?? 2} used today
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs text-zinc-500">
                    Extension status: <span className="text-zinc-300 font-mono">Active & Synced</span>
                  </p>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-mono text-white tracking-wider uppercase transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              /* LOGGED-OUT STATE */
              <div>
                <div className="flex border-b border-zinc-800 mb-6">
                  <button
                    onClick={() => { setAuthMode('login'); setAuthError(''); }}
                    className={`pb-3 pr-6 text-sm font-mono tracking-wider uppercase border-b-2 transition-colors ${
                      authMode === 'login'
                        ? 'border-white text-white font-bold'
                        : 'border-transparent text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => { setAuthMode('signup'); setAuthError(''); }}
                    className={`pb-3 px-6 text-sm font-mono tracking-wider uppercase border-b-2 transition-colors ${
                      authMode === 'signup'
                        ? 'border-white text-white font-bold'
                        : 'border-transparent text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    Create Account
                  </button>
                </div>

                {authError && (
                  <div className="mb-4 p-3 bg-zinc-900 border border-zinc-700 text-xs font-mono text-zinc-300">
                    {authError}
                  </div>
                )}

                <form onSubmit={handleEmailAuth} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono text-zinc-400 mb-1 uppercase tracking-wider">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full bg-black border border-zinc-800 focus:border-zinc-500 text-white px-3 py-2 text-sm font-mono outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-zinc-400 mb-1 uppercase tracking-wider">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-black border border-zinc-800 focus:border-zinc-500 text-white px-3 py-2 text-sm font-mono outline-none transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={authSubmitting}
                    className="w-full bg-white hover:bg-zinc-200 text-black font-mono font-bold text-xs tracking-wider uppercase py-3 transition-colors disabled:opacity-50"
                  >
                    {authSubmitting
                      ? 'Processing...'
                      : authMode === 'signup'
                      ? 'Register Account'
                      : 'Sign In with Email'}
                  </button>
                </form>

                <div className="my-6 flex items-center gap-3">
                  <div className="flex-1 h-px bg-zinc-800"></div>
                  <span className="text-xs font-mono text-zinc-600 uppercase">OR</span>
                  <div className="flex-1 h-px bg-zinc-800"></div>
                </div>

                <button
                  onClick={handleGoogleAuth}
                  disabled={authSubmitting}
                  className="w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-mono text-xs tracking-wider uppercase py-3 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                    <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032 s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2 C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.761H12.545z"/>
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Subscription / Upgrade Section */}
        <section className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-xl font-bold tracking-tight text-white">Subscription Plans</h3>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                Gated purchase — authentication required prior to selection.
              </p>
            </div>

            {/* Currency selector */}
            <div className="flex items-center gap-1 bg-zinc-950 p-1 border border-zinc-800 self-start sm:self-auto">
              <button
                onClick={() => setCurrency('inr')}
                className={`px-3 py-1 text-xs font-mono uppercase tracking-wider transition-colors ${
                  currency === 'inr' ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                INR (₹)
              </button>
              <button
                onClick={() => setCurrency('usd')}
                className={`px-3 py-1 text-xs font-mono uppercase tracking-wider transition-colors ${
                  currency === 'usd' ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                USD ($)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pro Plan */}
            <div className="bg-zinc-950 border border-zinc-800 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-bold text-white">Pro Plan</h4>
                  <span className="text-xs font-mono text-zinc-400">20 COMMENTS/DAY</span>
                </div>
                <div className="text-2xl font-bold text-white font-mono mb-4">
                  {currency === 'inr' ? '₹49' : '$4.99'} <span className="text-xs font-normal text-zinc-500">/ month</span>
                </div>
                <ul className="space-y-2 mb-6 text-xs text-zinc-300 font-mono">
                  <li className="flex items-center gap-2">
                    <span className="text-zinc-500">—</span> 20 AI comments per day
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-zinc-500">—</span> All 5 comment tones
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-zinc-500">—</span> Custom persona instructions
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-zinc-500">—</span> Fast API response speed
                  </li>
                </ul>
              </div>

              <div>
                {!user ? (
                  <button
                    onClick={() => handleSubscriptionClick('pro')}
                    className="w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white font-mono text-xs uppercase tracking-wider py-3 transition-colors"
                  >
                    Log In to Subscribe
                  </button>
                ) : (
                  <button
                    onClick={() => handleSubscriptionClick('pro')}
                    className="w-full bg-white hover:bg-zinc-200 text-black font-mono font-bold text-xs uppercase tracking-wider py-3 transition-colors"
                  >
                    Upgrade to Pro ({currency === 'inr' ? '₹49/mo' : '$4.99/mo'})
                  </button>
                )}
              </div>
            </div>

            {/* Ultra Plan */}
            <div className="bg-zinc-950 border border-zinc-800 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-bold text-white">Ultra Plan</h4>
                  <span className="text-xs font-mono text-zinc-400">50 COMMENTS/DAY</span>
                </div>
                <div className="text-2xl font-bold text-white font-mono mb-4">
                  {currency === 'inr' ? '₹99' : '$7.99'} <span className="text-xs font-normal text-zinc-500">/ month</span>
                </div>
                <ul className="space-y-2 mb-6 text-xs text-zinc-300 font-mono">
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
                    <span className="text-zinc-500">—</span> Premium support access
                  </li>
                </ul>
              </div>

              <div>
                {!user ? (
                  <button
                    onClick={() => handleSubscriptionClick('ultra')}
                    className="w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white font-mono text-xs uppercase tracking-wider py-3 transition-colors"
                  >
                    Log In to Subscribe
                  </button>
                ) : (
                  <button
                    onClick={() => handleSubscriptionClick('ultra')}
                    className="w-full bg-white hover:bg-zinc-200 text-black font-mono font-bold text-xs uppercase tracking-wider py-3 transition-colors"
                  >
                    Upgrade to Ultra ({currency === 'inr' ? '₹99/mo' : '$7.99/mo'})
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="pt-8 border-t border-zinc-800 text-xs font-mono text-zinc-600 flex flex-col md:flex-row items-center justify-between gap-2">
        <div>Eloquix Companion Auth Center &bull; Monotone Minimalist Edition</div>
        <div>Session Status: {user ? 'Authenticated' : 'Logged Out'}</div>
      </footer>
    </div>
  );
}
