import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, MessageCircleHeart, Eye, Clock, 
  Smartphone, Monitor, Globe, Sparkles, AlertCircle, Share2, ExternalLink 
} from 'lucide-react';
import { neonApi } from '../services/neonApi';
import { useAuthStore } from '../store/authStore';
import QRCodeModal from '../components/QRCodeModal';

const ProposalResponses = () => {
  const { id } = useParams();
  const { user } = useAuthStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    const fetchResponses = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        const res = await neonApi.getProposalResponses(id, user.id);
        setData(res);
      } catch (err) {
        setError('Failed to load response logs for this proposal.');
      } finally {
        setLoading(false);
      }
    };

    fetchResponses();
  }, [id, user?.id]);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-gray-500">Loading response activity...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="p-4 rounded-2xl bg-rose-50 text-rose-700 text-sm flex items-center justify-center space-x-2">
          <AlertCircle className="w-5 h-5 text-rose-500" />
          <span>{error || 'Data not found'}</span>
        </div>
        <Link to="/dashboard" className="mt-4 inline-block text-rose-600 font-semibold text-sm hover:underline">
          &larr; Back to Dashboard
        </Link>
      </div>
    );
  }

  const { proposalInfo, responses, visitors } = data;
  const proposalUrl = `${window.location.origin}/p/${proposalInfo.slug}`;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10">
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/dashboard"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 mb-3 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 font-heading">
              Responses for {proposalInfo.recipientName}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              "{proposalInfo.question}"
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowQR(true)}
              className="px-4 py-2 rounded-xl bg-white border border-rose-200 text-rose-600 text-xs font-semibold hover:bg-rose-50 transition-colors flex items-center space-x-1.5 shadow-xs"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Link / QR</span>
            </button>
            <a
              href={`/p/${proposalInfo.slug}`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl bg-rose-500 text-white text-xs font-semibold hover:bg-rose-600 transition-colors flex items-center space-x-1.5 shadow-xs shadow-rose-500/20"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Open Page</span>
            </a>
          </div>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="glass-card rounded-2xl p-5 border border-white/80 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <MessageCircleHeart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Responses Received</p>
            <p className="text-2xl font-black text-gray-900 font-heading">{(responses || []).length}</p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-white/80 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Views</p>
            <p className="text-2xl font-black text-gray-900 font-heading">{(visitors || []).length}</p>
          </div>
        </div>
      </div>

      {/* Responses Log */}
      <div className="mb-10">
        <h2 className="text-xl font-bold text-gray-800 font-heading mb-4 flex items-center space-x-2">
          <span>Answers & Love Notes</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-rose-100 text-rose-600 font-bold">
            {(responses || []).length}
          </span>
        </h2>

        {(!responses || responses.length === 0) ? (
          <div className="glass-card rounded-2xl p-8 text-center border border-white">
            <div className="text-3xl mb-2">⏳</div>
            <h3 className="font-bold text-gray-700">Waiting for {proposalInfo.recipientName}'s answer!</h3>
            <p className="text-xs text-gray-400 mt-1">
              Once they open your proposal link and click YES, the exact timestamp will show up here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {responses.map((resp) => (
              <div
                key={resp.id}
                className="glass-card rounded-2xl p-5 border border-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-gray-900">
                      {resp.response}
                    </p>
                    <p className="text-xs text-emerald-700 font-medium mt-0.5">
                      Accepted proposal! 🎉
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 text-xs text-gray-400 shrink-0">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    {new Date(resp.createdAt).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Visitor Log Table */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 font-heading mb-4">
          Visitor Activity ({(visitors || []).length})
        </h2>

        {(!visitors || visitors.length === 0) ? (
          <div className="glass-card rounded-2xl p-6 text-center border border-white">
            <p className="text-xs text-gray-400">No visitors recorded yet.</p>
          </div>
        ) : (
          <div className="glass-card rounded-2xl border border-white overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-rose-50/70 border-b border-rose-100 text-gray-600 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Device</th>
                    <th className="py-3 px-4">Browser Info</th>
                    <th className="py-3 px-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rose-50 text-gray-700">
                  {visitors.map((v) => (
                    <tr key={v.id} className="hover:bg-rose-50/30 transition-colors">
                      <td className="py-3 px-4 font-medium flex items-center space-x-1.5">
                        {v.device?.toLowerCase().includes('mobile') ? (
                          <Smartphone className="w-4 h-4 text-rose-500" />
                        ) : (
                          <Monitor className="w-4 h-4 text-gray-500" />
                        )}
                        <span>{v.device || 'Desktop'}</span>
                      </td>
                      <td className="py-3 px-4 text-gray-500 max-w-xs truncate">
                        {v.userAgent || 'Standard Browser'}
                      </td>
                      <td className="py-3 px-4 text-gray-400">
                        {new Date(v.createdAt).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* QR Modal */}
      {showQR && (
        <QRCodeModal
          isOpen={showQR}
          onClose={() => setShowQR(false)}
          proposalUrl={proposalUrl}
          recipientName={proposalInfo.recipientName}
        />
      )}
    </div>
  );
};

export default ProposalResponses;
