import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, PlusCircle, ExternalLink, Copy, Check, QrCode, 
  Trash2, Edit3, MessageCircleHeart, Eye, Sparkles, AlertCircle 
} from 'lucide-react';
import { neonApi } from '../services/neonApi';
import { useAuthStore } from '../store/authStore';
import QRCodeModal from '../components/QRCodeModal';

const Dashboard = () => {
  const { user } = useAuthStore();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  // QR Modal state
  const [selectedProposalForQR, setSelectedProposalForQR] = useState(null);

  const fetchProposals = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const data = await neonApi.getUserProposals(user.id);
      setProposals(data || []);
    } catch (err) {
      setError('Failed to load your proposals from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, [user?.id]);

  const handleCopyLink = (proposal) => {
    const fullUrl = `${window.location.origin}/p/${proposal.slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(proposal.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleDeleteProposal = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete the proposal for "${name}"?`)) {
      return;
    }
    try {
      await neonApi.deleteProposal(id, user.id);
      setProposals((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert('Failed to delete proposal.');
    }
  };

  // Metrics
  const totalProposals = proposals.length;
  const totalResponses = proposals.reduce((acc, p) => acc + (p._count?.responses || 0), 0);
  const totalViews = proposals.reduce((acc, p) => acc + (p._count?.visitors || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 font-heading">
            Hello, {user?.name || 'Creator'} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage your interactive proposals and track live responses!
          </p>
        </div>

        <Link
          to="/create"
          className="inline-flex items-center space-x-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-semibold shadow-lg shadow-rose-500/25 transition-all transform hover:-translate-y-0.5"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Create New Proposal</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <div className="glass-card rounded-2xl p-5 border border-white/80 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
            <Heart className="w-6 h-6 fill-rose-500" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Proposals</p>
            <p className="text-2xl font-black text-gray-900 font-heading">{totalProposals}</p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-white/80 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center">
            <MessageCircleHeart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">"YES" Received</p>
            <p className="text-2xl font-black text-rose-600 font-heading">{totalResponses}</p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-white/80 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Views</p>
            <p className="text-2xl font-black text-gray-900 font-heading">{totalViews}</p>
          </div>
        </div>
      </div>

      {/* Proposals List */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 font-heading mb-4">
          Your Proposals ({proposals.length})
        </h2>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-gray-500 font-medium">Loading your proposals...</p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-2xl bg-rose-50 text-rose-700 text-sm flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-rose-500" />
            <span>{error}</span>
          </div>
        ) : proposals.length === 0 ? (
          <div className="glass-card rounded-3xl p-12 text-center border border-white max-w-lg mx-auto mt-6">
            <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-500 mx-auto flex items-center justify-center mb-4 animate-bounce">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 font-heading">
              No Proposals Created Yet
            </h3>
            <p className="text-gray-500 text-sm mt-2 mb-6">
              Create your first interactive proposal and surprise that special someone today!
            </p>
            <Link
              to="/create"
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-semibold shadow-md shadow-rose-500/25 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Your First Proposal</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {proposals.map((proposal) => {
              const hasResponse = (proposal._count?.responses || 0) > 0;

              return (
                <div
                  key={proposal.id}
                  className="glass-card rounded-3xl p-6 border border-white/80 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{proposal.icon || '💖'}</span>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 font-heading leading-tight">
                            {proposal.recipientName}
                          </h3>
                          <span className="text-[11px] text-gray-400 font-medium">
                            {new Date(proposal.createdAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>

                      {hasResponse && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 animate-pulse">
                          🎉 Said YES!
                        </span>
                      )}
                    </div>

                    {/* Question */}
                    <p className="text-sm font-medium text-rose-700 bg-rose-50/80 p-3 rounded-xl border border-rose-100/80 mb-4 line-clamp-2">
                      "{proposal.question}"
                    </p>

                    {/* Badges / Stats */}
                    <div className="flex items-center space-x-4 text-xs text-gray-500 mb-5">
                      <span className="flex items-center space-x-1">
                        <Eye className="w-3.5 h-3.5 text-gray-400" />
                        <span>{proposal._count?.visitors || 0} views</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <MessageCircleHeart className="w-3.5 h-3.5 text-rose-500" />
                        <span className="font-semibold text-rose-600">
                          {proposal._count?.responses || 0} response(s)
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-rose-100/80 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <a
                        href={`/p/${proposal.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>View Page</span>
                      </a>

                      <button
                        onClick={() => handleCopyLink(proposal)}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors ${
                          copiedId === proposal.id
                            ? 'bg-emerald-500 text-white'
                            : 'bg-rose-50 hover:bg-rose-100 text-rose-700'
                        }`}
                      >
                        {copiedId === proposal.id ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Link</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => setSelectedProposalForQR(proposal)}
                          className="p-2 rounded-lg text-gray-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Share QR Code"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                        <Link
                          to={`/responses/${proposal.id}`}
                          className="p-2 rounded-lg text-gray-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="View Responses & Analytics"
                        >
                          <MessageCircleHeart className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/edit/${proposal.id}`}
                          className="p-2 rounded-lg text-gray-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Edit Proposal"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                      </div>

                      <button
                        onClick={() => handleDeleteProposal(proposal.id, proposal.recipientName)}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete Proposal"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {selectedProposalForQR && (
        <QRCodeModal
          isOpen={!!selectedProposalForQR}
          onClose={() => setSelectedProposalForQR(null)}
          proposalUrl={`${window.location.origin}/p/${selectedProposalForQR.slug}`}
          recipientName={selectedProposalForQR.recipientName}
        />
      )}
    </div>
  );
};

export default Dashboard;
