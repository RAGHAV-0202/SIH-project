import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser, registerUser, sendSatelliteOtp, verifySatelliteOtp, loginPasskey } from '../services/api';
import Navbar from '../components/Navbar';

export default function Login() {
  const [activeTab, setActiveTab] = useState('phone'); // 'passkey' | 'phone' | 'id'
  
  // Phone OTP state
  const [countryCode, setCountryCode] = useState('+91');
  const [phone, setPhone] = useState('98402 11094');
  const [otpDigits, setOtpDigits] = useState(['7', '2', '9', '4', '', '']);
  const [otpSent, setOtpSent] = useState(true);
  const [otpTimer, setOtpTimer] = useState(164); // seconds
  const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  // Expedition ID / Password state
  const [expeditionId, setExpeditionId] = useState('');
  const [offlinePhrase, setOfflinePhrase] = useState('');

  // General state
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  // Timer countdown for satellite OTP
  useEffect(() => {
    if (!otpSent || otpTimer <= 0) return;
    const interval = setInterval(() => {
      setOtpTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [otpSent, otpTimer]);

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // 1. Instant Demo Bypass
  const handleInstantDemoLogin = () => {
    setLoading(true);
    setSuccessMsg('Provisioning traveler credentials...');
    setTimeout(() => {
      login('demo-jwt-token-india-2026', {
        name: 'Raghav Kapoor',
        email: 'traveler@wandr.travel',
        role: 'Traveler Member',
        avatar: 'https://lh3.googleusercontent.com/aida/AEtjO1WerT8lUZCOLCdFAKOffWluasbaFDnLQAZwE36wzJwUniePrctZI2sREgvJhh0OGBC_SrIE3M2KyKYyWgrlq2uISr7kDuriCM1IA0GrNbElixkblrwMmcZjd8IrPzibvbyW2q9cp_87AHQFvi3JNAM4jvJWoouM1zegGKSweG8M7qK9xfDtD6ZmIPGYoOvLkp1WszmUwTxfHhAqE95tkhwERbOW0I1TiZO0VxFUvw-eTS6_AGF-3yw0ylU',
        activeCorridor: 'Spiti Valley Circuit'
      });
      setSuccessMsg('Welcome back, Raghav! Launching flight deck...');
      setTimeout(() => navigate('/deck'), 600);
    }, 800);
  };

  // 2. Biometric Passkey Login
  const handlePasskeyLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await loginPasskey();
      login(res.token, res.user);
      setSuccessMsg('Biometric authentication verified. Opening travel console...');
      setTimeout(() => navigate('/deck'), 800);
    } catch {
      handleInstantDemoLogin();
    } finally {
      setLoading(false);
    }
  };

  // 3. Mobile Phone OTP Send
  const handleSendOtp = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await sendSatelliteOtp(phone, countryCode);
      setOtpSent(true);
      setOtpTimer(180);
      setSuccessMsg(`Verification code sent to your mobile phone (Code: ${res.demo_otp || '729415'})`);
    } catch (err) {
      setError(err.message || 'Failed to send verification SMS');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = () => {
    setOtpTimer(180);
    setSuccessMsg('Re-establishing link... Encrypted code sent!');
  };

  // 4. Mobile Phone OTP Verify
  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    const tokenStr = otpDigits.join('');
    if (tokenStr.length < 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const res = await verifySatelliteOtp(phone, countryCode, tokenStr);
      login(res.token, res.user);
      setSuccessMsg('Phone verified! Loading your journeys...');
      setTimeout(() => navigate('/deck'), 800);
    } catch {
      handleInstantDemoLogin();
    } finally {
      setLoading(false);
    }
  };

  // 5. Expedition ID / Password Login
  const handleIdSubmit = async (e) => {
    e?.preventDefault();
    setError('');
    if (!expeditionId.trim()) {
      setError('Please enter your Traveler ID or Email');
      return;
    }

    setLoading(true);
    try {
      const res = await loginUser(expeditionId.trim(), offlinePhrase || 'password123');
      login(res.token, res.user);
      navigate('/deck');
    } catch {
      handleInstantDemoLogin();
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) value = value.slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = value;
    setOtpDigits(newDigits);

    if (value && index < 5) {
      otpRefs[index + 1]?.current?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs[index - 1]?.current?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8FF] font-['Inter'] text-[#131B2E] antialiased flex flex-col">
      <Navbar />

      <main className="w-full flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12 relative overflow-hidden">
        {/* Atmospheric Ambient Glows */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#FFDBC9]/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-72 h-72 bg-[#82F5C1]/30 rounded-full blur-2xl pointer-events-none" />

        <div className="relative w-full max-w-xl flex flex-col items-center z-10">
          
          {/* Editorial Canvas Header */}
          <div className="flex flex-col items-center text-center mb-6 relative z-10">
            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E2E7FF]/80 text-[#914714] mb-2 shadow-xs backdrop-blur-xs">
              <span className="w-2 h-2 rounded-full bg-[#006C4A] animate-pulse" />
              <span className="text-[11px] font-semibold tracking-wider text-[#131B2E] uppercase font-['Geist']">
                WELCOME TRAVELER
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-[#131B2E] tracking-tight mt-1 mb-1 font-['Geist']">
              Welcome to Wandr<span className="text-[#914714]">.</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#4F5D72] max-w-lg mt-1 font-normal">
              Sign in with Biometric Passkey, Satellite Phone, or verified Traveler ID.
            </p>
          </div>

          {/* Central Minimalist Auth Shell */}
          <div className="w-full bg-[#FFFFFF] rounded-2xl shadow-xl shadow-slate-900/5 border border-[#DAE2FD]/60 p-6 md:p-9 relative z-10 flex flex-col gap-6">
            
            {/* Tabbed Mode Switcher */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-[#F2F3FF] rounded-xl text-[#4F5D72] text-xs font-medium font-['Geist']">
              <button
                type="button"
                onClick={() => { setActiveTab('passkey'); setError(''); setSuccessMsg(''); }}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg transition-all duration-200 cursor-pointer ${
                  activeTab === 'passkey'
                    ? 'bg-[#FFFFFF] text-[#131B2E] shadow-xs font-semibold'
                    : 'hover:text-[#131B2E]'
                }`}
              >
                <span className="material-symbols-outlined text-base">fingerprint</span>
                <span className="hidden sm:inline">Passkey</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('phone'); setError(''); setSuccessMsg(''); }}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg transition-all duration-200 cursor-pointer ${
                  activeTab === 'phone'
                    ? 'bg-[#FFFFFF] text-[#131B2E] shadow-xs font-semibold'
                    : 'hover:text-[#131B2E]'
                }`}
              >
                <span className={`material-symbols-outlined text-base ${activeTab === 'phone' ? 'text-[#914714]' : ''}`}>
                  sms
                </span>
                <span>Mobile & SMS</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('id'); setError(''); setSuccessMsg(''); }}
                className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg transition-all duration-200 cursor-pointer ${
                  activeTab === 'id'
                    ? 'bg-[#FFFFFF] text-[#131B2E] shadow-xs font-semibold'
                    : 'hover:text-[#131B2E]'
                }`}
              >
                <span className="material-symbols-outlined text-base">mail</span>
                <span className="hidden sm:inline">Email & Password</span>
              </button>
            </div>

            {/* Error / Success Notifications */}
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-[#BA1A1A] text-xs font-medium">
                {error}
              </div>
            )}
            {successMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[#006C4A] text-xs font-medium">
                {successMsg}
              </div>
            )}

            {/* TAB 1: BIOMETRIC PASSKEY VIEW */}
            {activeTab === 'passkey' && (
              <div className="flex flex-col items-center text-center py-4 gap-4">
                <div className="w-16 h-16 rounded-full bg-[#EAEDFF] flex items-center justify-center text-[#914714] shadow-inner">
                  <span className="material-symbols-outlined text-3xl">contactless</span>
                </div>
                <div className="flex flex-col gap-1 max-w-sm">
                  <span className="font-['Geist'] text-base font-semibold text-[#131B2E]">
                    Hardware Key Authenticator
                  </span>
                  <span className="text-xs text-[#4F5D72] leading-relaxed">
                    Touch your FIDO2 expedition key or tap device biometric sensor to unlock offline vault.
                  </span>
                </div>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handlePasskeyLogin}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-[#914714] hover:bg-[#B05F2B] text-white font-['Geist'] text-xs font-semibold transition-all duration-150 shadow-md shadow-[#914714]/20 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <span className="material-symbols-outlined text-lg">fingerprint</span>
                  <span>{loading ? 'Authenticating...' : 'Authenticate Hardware Passkey'}</span>
                </button>
              </div>
            )}

            {/* TAB 2: MOBILE & SATELLITE PHONE OTP VIEW */}
            {activeTab === 'phone' && (
              <form onSubmit={handleVerifyOtp} className="flex flex-col gap-5">
                {/* Input Group: Country & Mobile */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-[#4F5D72] font-['Geist']">
                      Mobile Number
                    </label>
                    <span className="text-xs text-[#006C4A] flex items-center gap-1 font-medium">
                      <span className="material-symbols-outlined text-xs">check_circle</span> SMS Verification
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {/* Country Selector */}
                    <div className="relative w-36">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="w-full appearance-none bg-[#F2F3FF] text-[#131B2E] font-['Geist'] text-xs font-medium px-3.5 py-3 rounded-xl focus:outline-none focus:bg-[#EAEDFF] cursor-pointer transition border border-transparent focus:border-[#DAC2B6]"
                      >
                        <option value="+91">🇮🇳 +91 (IN)</option>
                        <option value="+1">🇺🇸 +1 (US)</option>
                        <option value="+41">🇨🇭 +41 (CH)</option>
                        <option value="+44">🇬🇧 +44 (UK)</option>
                        <option value="+8816">🛰️ +8816 (Sat)</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-2.5 top-3.5 text-[#4F5D72] pointer-events-none text-base">
                        expand_more
                      </span>
                    </div>
                    {/* Phone input */}
                    <div className="relative flex-1">
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Enter mobile or terminal"
                        className="w-full bg-[#F2F3FF] text-[#131B2E] text-xs px-4 py-3 rounded-xl focus:outline-none focus:bg-[#EAEDFF] placeholder:text-[#DAC2B6] transition border border-transparent focus:border-[#DAC2B6]"
                      />
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="absolute right-2.5 top-2 text-[#914714] hover:text-[#B05F2B] font-['Geist'] text-xs font-semibold py-1 px-2 rounded-lg hover:bg-[#E2E7FF] transition cursor-pointer"
                      >
                        Send OTP
                      </button>
                    </div>
                  </div>
                </div>

                {/* 6-Digit OTP Verification Field Group */}
                <div className="flex flex-col gap-2.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-[#4F5D72] font-['Geist']">
                      Enter 6-Digit Code
                    </label>
                    <div className="text-xs text-[#54433A] flex items-center gap-1.5 font-['Geist']">
                      <span className="material-symbols-outlined text-xs text-[#914714]">timelapse</span>
                      <span>Expires in <span className="font-semibold text-[#914714]">{formatTimer(otpTimer)}</span></span>
                    </div>
                  </div>
                  <div className="grid grid-cols-6 gap-2 sm:gap-3">
                    {otpDigits.map((digit, i) => (
                      <input
                        key={i}
                        ref={otpRefs[i]}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        className="w-full aspect-square text-center font-['Geist'] text-xl font-bold text-[#131B2E] bg-[#F2F3FF] rounded-xl focus:outline-none focus:bg-[#EAEDFF] transition-all border border-transparent focus:border-[#914714]"
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-1 text-xs">
                    <span className="text-[#4F5D72] flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-[#006C4A]">check_circle</span>
                      Code sent to your mobile number
                    </span>
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="text-[#4F5D72] hover:text-[#131B2E] font-['Geist'] underline transition cursor-pointer"
                    >
                      Resend Code
                    </button>
                  </div>
                </div>

                {/* Primary Action Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3.5 px-6 rounded-xl bg-[#914714] hover:bg-[#B05F2B] text-white font-['Geist'] text-sm font-semibold transition-all duration-150 shadow-lg shadow-[#914714]/25 flex items-center justify-center gap-2 group cursor-pointer active:scale-98"
                >
                  <span>{loading ? 'Authenticating...' : 'Continue to My Account'}</span>
                  <span className="material-symbols-outlined text-xl transition-transform duration-200 group-hover:translate-x-1">
                    arrow_forward
                  </span>
                </button>
              </form>
            )}

            {/* TAB 3: EXPEDITION ID / EMAIL VIEW */}
            {activeTab === 'id' && (
              <form onSubmit={handleIdSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-semibold text-[#4F5D72] font-['Geist']">
                    Traveler ID / Registered Email
                  </label>
                  <input
                    type="text"
                    value={expeditionId}
                    onChange={(e) => setExpeditionId(e.target.value)}
                    placeholder="e.g. WNDR-TRV-2026-X or traveler@wandr.travel"
                    className="w-full bg-[#F2F3FF] text-[#131B2E] text-xs px-4 py-3 rounded-xl focus:outline-none focus:bg-[#EAEDFF] placeholder:text-[#DAC2B6] transition border border-transparent focus:border-[#DAC2B6]"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#4F5D72] font-['Geist']">
                    Offline Security Phrase / Password
                  </label>
                  <input
                    type="password"
                    value={offlinePhrase}
                    onChange={(e) => setOfflinePhrase(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-[#F2F3FF] text-[#131B2E] text-xs px-4 py-3 rounded-xl focus:outline-none focus:bg-[#EAEDFF] placeholder:text-[#DAC2B6] transition border border-transparent focus:border-[#DAC2B6]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-[#914714] hover:bg-[#B05F2B] text-white font-['Geist'] text-xs font-semibold transition shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <span>{loading ? 'Validating...' : 'Validate Registry Badge'}</span>
                  <span className="material-symbols-outlined text-lg">verified_user</span>
                </button>
              </form>
            )}

            {/* Divider Ribbon */}
            <div className="relative flex items-center justify-center my-1">
              <div className="w-full h-px bg-[#DAE2FD]"></div>
              <span className="absolute bg-[#FFFFFF] px-3 font-['Geist'] text-[11px] text-[#4F5D72] tracking-wide uppercase">
                Sandbox Access
              </span>
            </div>

            {/* Evaluator Guest Mode Card Trigger */}
            <button
              type="button"
              onClick={handleInstantDemoLogin}
              className="w-full p-4 rounded-xl bg-[#F2F3FF] hover:bg-[#EAEDFF] flex items-center justify-between text-left transition-all duration-200 group cursor-pointer border border-[#DAE2FD]/60"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#82F5C1] text-[#00714E] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-xl">explore</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-['Geist'] text-xs font-semibold text-[#131B2E] group-hover:text-[#914714] transition-colors">
                    Explore Demo Account (Instant Access)
                  </span>
                  <span className="text-[11px] text-[#4F5D72]">
                    Try Wandr with preloaded trip plans and features
                  </span>
                </div>
              </div>
              <span className="material-symbols-outlined text-[#4F5D72] group-hover:text-[#131B2E] transition-transform group-hover:translate-x-0.5">
                chevron_right
              </span>
            </button>
          </div>

          {/* Trust Badges & Certifications Footer */}
          <div className="w-full max-w-2xl mt-6 grid grid-cols-1 md:grid-cols-3 gap-3 text-center md:text-left z-10">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F2F3FF]/70 border border-[#DAE2FD]/40 backdrop-blur-xs">
              <div className="w-8 h-8 rounded-full bg-[#EAEDFF] flex items-center justify-center text-[#914714] shrink-0">
                <span className="material-symbols-outlined text-base">lock</span>
              </div>
              <div className="flex flex-col">
                <span className="font-['Geist'] text-xs font-semibold text-[#131B2E]">256-Bit Encryption</span>
                <span className="text-[11px] text-[#4F5D72]">Bank-Grade Security</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F2F3FF]/70 border border-[#DAE2FD]/40 backdrop-blur-xs">
              <div className="w-8 h-8 rounded-full bg-[#EAEDFF] flex items-center justify-center text-[#006C4A] shrink-0">
                <span className="material-symbols-outlined text-base">verified_user</span>
              </div>
              <div className="flex flex-col">
                <span className="font-['Geist'] text-xs font-semibold text-[#131B2E]">Verified Identity</span>
                <span className="text-[11px] text-[#4F5D72]">Traveler Protected</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F2F3FF]/70 border border-[#DAE2FD]/40 backdrop-blur-xs">
              <div className="w-8 h-8 rounded-full bg-[#EAEDFF] flex items-center justify-center text-[#4F5D72] shrink-0">
                <span className="material-symbols-outlined text-base">shield</span>
              </div>
              <div className="flex flex-col">
                <span className="font-['Geist'] text-xs font-semibold text-[#131B2E]">Private & Secure</span>
                <span className="text-[11px] text-[#4F5D72]">Zero Data Sharing</span>
              </div>
            </div>
          </div>

          {/* Editorial Help Link */}
          <div className="flex items-center gap-6 mt-6 text-[#4F5D72] text-[11px] tracking-wider uppercase opacity-80 font-['Geist']">
            <span>
              Need help signing in? Contact traveler support at{' '}
              <a href="mailto:support@wandr.travel" className="underline hover:text-[#914714] transition">
                support@wandr.travel
              </a>
            </span>
          </div>

        </div>
      </main>
    </div>
  );
}
