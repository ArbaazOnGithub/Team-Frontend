import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import * as api from '../../services/api';

const CompanyManagement = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // New Company Form State
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        loadCompanies();
    }, []);

    const loadCompanies = async () => {
        setLoading(true);
        try {
            const data = await api.fetchAllCompanies();
            setCompanies(data);
        } catch (error) {
            toast.error("Failed to load companies");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCompany = async (e) => {
        e.preventDefault();
        if (!name.trim() || !slug.trim()) return toast.error("Please fill all fields");
        
        setCreating(true);
        try {
            await api.createCompany({ name, slug });
            toast.success("Company created successfully!");
            setName("");
            setSlug("");
            loadCompanies();
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to create company");
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteCompany = async (companyId, companyName, companySlug) => {
        if (companySlug === 'n1solution') {
            return toast.error("Cannot delete the root company!");
        }

        const confirmMsg = `WARNING: Are you sure you want to delete ${companyName}?\nThis will permanently delete all users, requests, and chats associated with it.`;
        if (window.confirm(confirmMsg)) {
            try {
                await api.deleteCompany(companyId);
                toast.success(`${companyName} deleted successfully`);
                setCompanies(companies.filter(c => c._id !== companyId));
            } catch (error) {
                toast.error(error.response?.data?.error || "Failed to delete company");
            }
        }
    };

    return (
        <div className="animate-fade-in p-6">
            <h2 className="text-2xl font-black text-white mb-6">Manage Client Companies</h2>
            
            <div className="bg-[#1b2a3a]/40 p-6 rounded-2xl shadow-sm border border-white/10 mb-8">
                <h3 className="text-lg font-bold text-brand-500 mb-4">Onboard New Company</h3>
                <form onSubmit={handleCreateCompany} className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                        <label className="text-xs font-bold text-brand-300 mb-1 block uppercase">Company Name</label>
                        <input 
                            type="text" 
                            className="input-premium w-full" 
                            placeholder="e.g. Acme Corp" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                        />
                    </div>
                    <div className="flex-1 w-full">
                        <label className="text-xs font-bold text-brand-300 mb-1 block uppercase">Company Slug (Login ID)</label>
                        <input 
                            type="text" 
                            className="input-premium w-full uppercase" 
                            placeholder="e.g. acme-corp" 
                            value={slug} 
                            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} 
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={creating}
                        className="btn-premium bg-[#547792] hover:bg-[#749fb0] text-white font-bold p-3 rounded-xl w-full md:w-auto min-w-[150px]"
                    >
                        {creating ? "Creating..." : "+ Create Company"}
                    </button>
                </form>
            </div>

            <div className="glass-card bg-[#1b2a3a]/40 rounded-2xl shadow-sm border border-white/10 overflow-hidden">
                <div className="p-5 border-b border-white/10 bg-white/5 flex justify-between items-center">
                    <h3 className="font-bold text-brand-300">Registered Companies</h3>
                    <span className="bg-white/10 text-brand-500 text-xs font-bold px-3 py-1 rounded-full border border-white/10">
                        {companies.length} Total
                    </span>
                </div>
                
                {loading ? (
                    <div className="p-8 text-center text-slate-500 font-bold animate-pulse">Loading companies...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 border-b border-white/10 text-xs uppercase tracking-wider text-brand-300 font-black">
                                    <th className="p-4 font-bold">Company Name</th>
                                    <th className="p-4 font-bold">Slug (ID)</th>
                                    <th className="p-4 font-bold">Total Users</th>
                                    <th className="p-4 font-bold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {companies.map((company) => (
                                            <tr key={company._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="p-4 font-bold text-white">
                                            {company.name}
                                            {company.slug === 'n1solution' && <span className="ml-2 text-[10px] bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded-full uppercase border border-amber-500/20 font-black">Root Tenant</span>}
                                        </td>
                                        <td className="p-4 font-mono text-sm text-brand-500 font-bold">
                                            {company.slug}
                                        </td>
                                        <td className="p-4 text-white/40 font-black">
                                            {company.userCount || 0}
                                        </td>
                                        <td className="p-4 text-right">
                                            {company.slug !== 'n1solution' && (
                                                <button 
                                                    onClick={() => handleDeleteCompany(company._id, company.name, company.slug)}
                                                    className="text-rose-500 hover:text-white font-bold text-sm bg-rose-500/10 hover:bg-rose-500 px-3 py-1 rounded-lg transition-all"
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {companies.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="p-8 text-center text-slate-500">No companies found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CompanyManagement;
