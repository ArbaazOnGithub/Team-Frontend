import React from 'react';

const Login = ({ 
    companySlug, setCompanySlug, 
    mobile, setMobile, 
    password, setPassword, 
    loading, handleLogin, 
    setView, resetForms,
    isBiometricSupported,
    hasSavedCredentials,
    handleBiometricLogin,
    useBiometric,
    setUseBiometric
}) => {
    return (
        <div className="space-y-4">
            <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg opacity-40 group-focus-within:opacity-100 transition-opacity">🏢</span>
                <input
                    type="text"
                    placeholder="Company ID"
                    value={companySlug}
                    onChange={(e) => setCompanySlug(e.target.value)}
                    className="input-premium pl-12 uppercase font-black tracking-widest text-[10px]"
                />
            </div>

            <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg opacity-40 group-focus-within:opacity-100 transition-opacity">📱</span>
                <input
                    type="tel"
                    placeholder="Mobile Number"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="input-premium pl-12 font-bold"
                    maxLength={10}
                />
            </div>

            <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg opacity-40 group-focus-within:opacity-100 transition-opacity">🔑</span>
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin(e)}
                    className="input-premium pl-12"
                />
            </div>

            {isBiometricSupported && (
                <div className="flex items-center gap-3 py-2 px-1">
                    <div className="relative">
                        <input
                            type="checkbox"
                            id="useBiometric"
                            checked={useBiometric}
                            onChange={(e) => setUseBiometric(e.target.checked)}
                            className="peer sr-only"
                        />
                        <div className="w-10 h-6 bg-slate-200 rounded-full peer-checked:bg-brand-500 transition-colors"></div>
                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4"></div>
                    </div>
                    <label htmlFor="useBiometric" className="text-[10px] font-black uppercase tracking-widest text-brand-600/60 cursor-pointer">
                        Enable Biometrics
                    </label>
                </div>
            )}

            <div className="flex gap-3 pt-4">
                <button
                    onClick={handleLogin}
                    disabled={loading}
                    className="flex-1 py-4 bg-brand-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs btn-premium shadow-xl shadow-brand-500/30"
                >
                    {loading ? "Authenticating..." : "Login Now"}
                </button>

                {isBiometricSupported && hasSavedCredentials && (
                    <button
                        onClick={handleBiometricLogin}
                        disabled={loading}
                        className="w-16 h-16 bg-white border border-brand-100 rounded-2xl hover:bg-brand-50 transition-all shadow-lg flex items-center justify-center text-2xl group active:scale-90"
                        title="Login with Biometrics"
                    >
                        <span className="group-hover:scale-125 transition-transform">☝️</span>
                    </button>
                )}
            </div>

            <div className="flex justify-between pt-8 px-2">
                <button 
                    onClick={() => { setView("register"); resetForms(); }} 
                    className="text-[10px] font-black uppercase tracking-widest text-brand-500 hover:text-brand-600 transition-colors"
               >
                    Create Account
                </button>
                <button 
                    onClick={() => { setView("forgot-password"); resetForms(); }} 
                    className="text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-brand-500 transition-colors"
                >
                    Lost Password?
                </button>
            </div>
        </div>
    );
};

export default Login;
