import React from 'react';

export const ForgotPassword = ({ email, setEmail, loading, handleForgotPassword, setView }) => {
    return (
        <div>
            <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} className="input-premium mb-6" />
            <button
                onClick={handleForgotPassword}
                disabled={loading}
                className="w-full p-4 bg-[#2E6F40] text-white rounded-xl font-bold btn-premium hover:bg-[#253D2C]"
            >
                {loading ? "Sending..." : "Send OTP"}
            </button>
            <p className="text-center mt-6">
                <span onClick={() => setView("login")} className="text-[#2E6F40] cursor-pointer font-bold underline">Back to Login</span>
            </p>
        </div>
    );
};

export const ResetPassword = ({ email, otp, setOtp, newPassword, setNewPassword, loading, handleResetPassword, mobile }) => {
    return (
        <div>
            <p className="text-center text-xs text-[#253D2C]/60 mb-6 font-bold uppercase tracking-widest border-b border-[#68BA7F]/20 pb-2">
                Resetting for: {email}
                {mobile && <span className="block mt-1 text-[#2E6F40]">Configured Mobile: {mobile}</span>}
            </p>
            <input type="text" placeholder="6-Digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} className="input-premium mb-3" maxLength={6} />
            <input type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="input-premium mb-8" />
            <button
                onClick={handleResetPassword}
                disabled={loading}
                className="w-full p-4 bg-[#2E6F40] text-white rounded-xl font-bold btn-premium hover:bg-[#253D2C]"
            >
                {loading ? "Resetting..." : "Update Password"}
            </button>
        </div>
    );
};
