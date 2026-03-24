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
            <h2 className="text-2xl font-black text-slate-800 mb-6">Manage Client Companies</h2>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
                <h3 className="text-lg font-bold text-[#2E6F40] mb-4">Onboard New Company</h3>
                <form onSubmit={handleCreateCompany} className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                        <label className="text-xs font-bold text-slate-500 mb-1 block uppercase">Company Name</label>
                        <input 
                            type="text" 
                            className="input-premium w-full" 
                            placeholder="e.g. Acme Corp" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                        />
                    </div>
                    <div className="flex-1 w-full">
                        <label className="text-xs font-bold text-slate-500 mb-1 block uppercase">Company Slug (Login ID)</label>
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
                        className="btn-premium bg-[#2E6F40] text-white font-bold p-3 rounded-xl hover:bg-[#253D2C] w-full md:w-auto min-w-[150px]"
                    >
                        {creating ? "Creating..." : "+ Create Company"}
                    </button>
                </form>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-700">Registered Companies</h3>
                    <span className="bg-[#2E6F40] text-white text-xs font-bold px-3 py-1 rounded-full">
                        {companies.length} Total
                    </span>
                </div>
                
                {loading ? (
                    <div className="p-8 text-center text-slate-500 font-bold animate-pulse">Loading companies...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400">
                                    <th className="p-4 font-bold">Company Name</th>
                                    <th className="p-4 font-bold">Slug (ID)</th>
                                    <th className="p-4 font-bold">Total Users</th>
                                    <th className="p-4 font-bold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {companies.map((company) => (
                                    <tr key={company._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <td className="p-4 font-bold text-slate-700">
                                            {company.name}
                                            {company.slug === 'n1solution' && <span className="ml-2 text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full uppercase">Root Tenant</span>}
                                        </td>
                                        <td className="p-4 font-mono text-sm text-[#2E6F40] font-bold">
                                            {company.slug}
                                        </td>
                                        <td className="p-4 text-slate-600 font-medium">
                                            {company.userCount || 0}
                                        </td>
                                        <td className="p-4 text-right">
                                            {company.slug !== 'n1solution' && (
                                                <button 
                                                    onClick={() => handleDeleteCompany(company._id, company.name, company.slug)}
                                                    className="text-red-500 hover:text-red-700 font-bold text-sm bg-red-50 hover:bg-red-100 px-3 py-1 rounded-lg transition-colors"
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
