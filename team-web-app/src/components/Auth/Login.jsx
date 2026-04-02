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
        <div>
            <input
                type="text"
                placeholder="Company ID"
                value={companySlug}
                onChange={(e) => setCompanySlug(e.target.value)}
                className="input-premium mb-4 uppercase"
            />
            <input
                type="tel"
                placeholder="Mobile Number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="input-premium mb-4"
                maxLength={10}
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin(e)}
                className="input-premium mb-6"
            />

            {isBiometricSupported && (
                <div className="flex items-center gap-2 mb-6 ml-1">
                    <input
                        type="checkbox"
                        id="useBiometric"
                        checked={useBiometric}
                        onChange={(e) => setUseBiometric(e.target.checked)}
                        className="w-4 h-4 accent-[#2E6F40]"
                    />
                    <label htmlFor="useBiometric" className="text-xs font-bold text-[#253D2C]/70">
                        Enable Biometric Login
                    </label>
                </div>
            )}

            <div className="flex gap-3">
                <button
                    onClick={handleLogin}
                    disabled={loading}
                    className="flex-1 p-4 bg-[#2E6F40] text-white rounded-xl font-bold btn-premium hover:bg-[#253D2C] hover:shadow-lg hover:shadow-[#2E6F40]/20"
                >
                    {loading ? "Logging in..." : "Login"}
                </button>

                {isBiometricSupported && hasSavedCredentials && (
                    <button
                        onClick={handleBiometricLogin}
                        disabled={loading}
                        className="p-4 bg-white/50 border border-[#68BA7F]/30 rounded-xl hover:bg-white transition-all shadow-sm flex items-center justify-center text-xl"
                        title="Login with Biometrics"
                    >
                        <span>☝️</span>
                    </button>
                )}
            </div>

            <div className="flex justify-between mt-8 text-xs font-black uppercase tracking-widest">
                <span onClick={() => { setView("register"); resetForms(); }} className="text-[#2E6F40] cursor-pointer hover:underline underline-offset-4 transition-all">Register</span>
                <span onClick={() => { setView("forgot-password"); resetForms(); }} className="text-[#253D2C]/60 cursor-pointer hover:text-[#2E6F40] transition-all">Forgot Password?</span>
            </div>
        </div>
    );
};

export default Login;
