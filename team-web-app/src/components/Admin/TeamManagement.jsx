import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import * as api from '../../services/api';

const TeamManagement = () => {
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState("");
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(false);
    const [teamName, setTeamName] = useState("");
    const [editingTeam, setEditingTeam] = useState(null);

    useEffect(() => {
        loadCompanies();
    }, []);

    useEffect(() => {
        if (selectedCompany) {
            loadTeams();
        } else {
            setTeams([]);
        }
    }, [selectedCompany]);

    const loadCompanies = async () => {
        try {
            const data = await api.fetchAllCompanies();
            setCompanies(data);
            if (data.length > 0 && !selectedCompany) {
                setSelectedCompany(data[0]._id);
            }
        } catch (error) {
            toast.error("Failed to load companies");
        }
    };

    const loadTeams = async () => {
        setLoading(true);
        try {
            const data = await api.fetchTeamsByCompany(selectedCompany);
            setTeams(data);
        } catch (error) {
            toast.error("Failed to load teams");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOrUpdateTeam = async (e) => {
        e.preventDefault();
        if (!teamName.trim()) return toast.error("Team name is required");

        try {
            if (editingTeam) {
                await api.updateTeam(editingTeam._id, teamName);
                toast.success("Team updated successfully");
            } else {
                await api.createTeam(teamName, selectedCompany);
                toast.success("Team created successfully");
            }
            setTeamName("");
            setEditingTeam(null);
            loadTeams();
        } catch (error) {
            toast.error(error.response?.data?.error || "Action failed");
        }
    };

    const handleDeleteTeam = async (teamId, name) => {
        if (window.confirm(`Are you sure you want to delete team "${name}"?`)) {
            try {
                await api.deleteTeam(teamId);
                toast.success("Team deleted successfully");
                loadTeams();
            } catch (error) {
                toast.error(error.response?.data?.error || "Failed to delete team");
            }
        }
    };

    return (
        <div className="animate-fade-in p-6">
            <h2 className="text-2xl font-black text-white mb-6">Manage Teams (SuperAdmin)</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Company Selection */}
                <div className="bg-[#1b2a3a]/40 p-6 rounded-2xl shadow-sm border border-white/10">
                    <label className="text-xs font-bold text-brand-300 mb-2 block uppercase tracking-widest">Select Company</label>
                    <select 
                        className="input-premium w-full bg-black/20"
                        value={selectedCompany}
                        onChange={(e) => setSelectedCompany(e.target.value)}
                    >
                        {companies.map(c => (
                            <option key={c._id} value={c._id} className="bg-slate-900">{c.name} ({c.slug})</option>
                        ))}
                    </select>
                </div>

                {/* Team Form */}
                <div className="bg-[#1b2a3a]/40 p-6 rounded-2xl shadow-sm border border-white/10">
                    <label className="text-xs font-bold text-brand-300 mb-2 block uppercase tracking-widest">
                        {editingTeam ? "Edit Team Name" : "Add New Team"}
                    </label>
                    <form onSubmit={handleCreateOrUpdateTeam} className="flex gap-2">
                        <input 
                            type="text" 
                            className="input-premium flex-1"
                            placeholder="e.g. Burger King, HR, IT"
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                        />
                        <button 
                            type="submit" 
                            className="btn-premium bg-[#547792] px-6 py-2 rounded-xl text-white font-black uppercase text-[10px]"
                        >
                            {editingTeam ? "Update" : "Add"}
                        </button>
                        {editingTeam && (
                            <button 
                                type="button" 
                                onClick={() => { setEditingTeam(null); setTeamName(""); }}
                                className="bg-slate-700 px-4 py-2 rounded-xl text-white font-black uppercase text-[10px]"
                            >
                                Cancel
                            </button>
                        )}
                    </form>
                </div>
            </div>

            {/* Teams List */}
            <div className="glass-card bg-[#1b2a3a]/40 rounded-2xl shadow-sm border border-white/10 overflow-hidden">
                <div className="p-5 border-b border-white/10 bg-white/5 flex justify-between items-center">
                    <h3 className="font-bold text-brand-300">Teams in {companies.find(c => c._id === selectedCompany)?.name}</h3>
                    <span className="bg-white/10 text-brand-500 text-xs font-bold px-3 py-1 rounded-full border border-white/10">
                        {teams.length} Teams
                    </span>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-slate-500 font-bold animate-pulse">Loading teams...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 border-b border-white/10 text-xs uppercase tracking-wider text-brand-300 font-black">
                                    <th className="p-4">Team Name</th>
                                    <th className="p-4">Created At</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {teams.map((team) => (
                                    <tr key={team._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="p-4 font-bold text-white">{team.name}</td>
                                        <td className="p-4 text-white/40 text-sm">
                                            {new Date(team.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-4 text-right flex justify-end gap-2">
                                            <button 
                                                onClick={() => { setEditingTeam(team); setTeamName(team.name); }}
                                                className="text-cyan-500 hover:text-white font-bold text-sm bg-cyan-500/10 hover:bg-cyan-500 px-3 py-1 rounded-lg transition-all"
                                            >
                                                Edit
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteTeam(team._id, team.name)}
                                                className="text-rose-500 hover:text-white font-bold text-sm bg-rose-500/10 hover:bg-rose-500 px-3 py-1 rounded-lg transition-all"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {teams.length === 0 && (
                                    <tr>
                                        <td colSpan="3" className="p-8 text-center text-slate-500">No teams registered for this company.</td>
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

export default TeamManagement;
