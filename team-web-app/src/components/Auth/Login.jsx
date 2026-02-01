import React from 'react';

const Login = ({ mobile, setMobile, password, setPassword, loading, handleLogin, setView, resetForms }) => {
    return (
        <div>
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
            <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full p-4 bg-[#2E6F40] text-white rounded-xl font-bold btn-premium hover:bg-[#253D2C] hover:shadow-lg hover:shadow-[#2E6F40]/20"
            >
                {loading ? "Logging in..." : "Login"}
            </button>
            <div className="flex justify-between mt-5 text-sm">
                <span onClick={() => { setView("register"); resetForms(); }} className="text-[#2E6F40] cursor-pointer font-bold underline">Register</span>
                <span onClick={() => { setView("forgot-password"); resetForms(); }} className="text-[#253D2C]/80 cursor-pointer hover:text-[#253D2C]">Forgot Password?</span>
            </div>
        </div>
    );
};

export default Login;
