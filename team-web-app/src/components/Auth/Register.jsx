import React from 'react';

const Register = ({ companySlug, setCompanySlug, name, setName, email, setEmail, mobile, setMobile, password, setPassword, imagePreview, handleImageChange, loading, handleRegister, setView, resetForms }) => {
    return (
        <div>
            <div className="relative group w-24 h-24 mx-auto mb-6">
                <img src={imagePreview || "https://ui-avatars.com/api/?name=User&background=68BA7F&color=fff&size=150"} onError={(e) => e.target.src = "https://ui-avatars.com/api/?name=User&background=68BA7F&color=fff"} className="w-full h-full rounded-full object-cover border-4 border-[#213448] shadow-md" alt="Preview" />
                <label htmlFor="file-upload" className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <span className="text-white text-xs font-bold uppercase">Upload</span>
                </label>
                <input id="file-upload" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </div>
            <input type="text" placeholder="Company ID" value={companySlug} onChange={(e) => setCompanySlug(e.target.value)} className="input-premium mb-3 uppercase" />
            <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} className="input-premium mb-3" />
            <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} className="input-premium mb-3" />
            <input type="tel" placeholder="Mobile Number" value={mobile} onChange={(e) => setMobile(e.target.value)} className="input-premium mb-3" maxLength={10} />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-premium mb-6" />
            <button
                onClick={handleRegister}
                disabled={loading}
                className="w-full p-4 bg-[#213448] text-white rounded-xl font-bold btn-premium hover:bg-[#213448] hover:shadow-lg"
            >
                {loading ? "Creating Account..." : "Register"}
            </button>
            <p className="text-center mt-5 text-sm text-[#213448]/60 font-black">
                Already have an account? <span onClick={() => { setView("login"); resetForms(); }} className="text-[#213448] cursor-pointer underline underline-offset-4 hover:text-[#213448] transition-colors">Login</span>
            </p>
        </div>
    );
};

export default Register;
