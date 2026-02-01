import React from 'react';

const Register = ({ name, setName, email, setEmail, mobile, setMobile, password, setPassword, imagePreview, handleImageChange, loading, handleRegister, setView, resetForms }) => {
    return (
        <div>
            <div className="relative group w-24 h-24 mx-auto mb-6">
                <img src={imagePreview || "https://via.placeholder.com/150"} className="w-full h-full rounded-full object-cover border-4 border-[#2E6F40] shadow-md" alt="Preview" />
                <label htmlFor="file-upload" className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <span className="text-white text-xs font-bold uppercase">Upload</span>
                </label>
                <input id="file-upload" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </div>
            <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} className="input-premium mb-3" />
            <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} className="input-premium mb-3" />
            <input type="tel" placeholder="Mobile Number" value={mobile} onChange={(e) => setMobile(e.target.value)} className="input-premium mb-3" maxLength={10} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-premium mb-6" />
            <button
                onClick={handleRegister}
                disabled={loading}
                className="w-full p-4 bg-[#2E6F40] text-white rounded-xl font-bold btn-premium hover:bg-[#253D2C] hover:shadow-lg"
            >
                {loading ? "Creating Account..." : "Register"}
            </button>
            <p className="text-center mt-5 text-sm text-[#253D2C]/80">
                Already have an account? <span onClick={() => { setView("login"); resetForms(); }} className="text-[#2E6F40] cursor-pointer font-bold underline">Login</span>
            </p>
        </div>
    );
};

export default Register;
