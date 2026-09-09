import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Heart, Sparkles, Wand2, Music, ArrowRight, Eye, 
  CheckCircle2, AlertCircle, RefreshCw, Save 
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';

const PRESET_GIFS = [
  {
    name: "Cute Bear Love",
    url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3ZhcXlzc2N1ejZ3ajN6bjA0OGY0MnpsamFpYWZmdXJ6c3F6enFqdiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/c76IJLufpNwSULPk77/giphy.gif"
  },
  {
    name: "Hugging Cats",
    url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbTQ1bDJtM2xnbXdtNGl3bzZ4Znp6aDNpdnhodms1d2V0Y3JscTNqOCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/MDJ9IbxxvDUQM/giphy.gif"
  },
  {
    name: "Love Confession",
    url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMnI4cnkzaDdvMmc2MG05c21yZml0d25nZm54M2lsaXRhbzBsdGgyNyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/26FLdmIp6wJr91JAI/giphy.gif"
  },
  {
    name: "Puppy Eyes",
    url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExNnBzajI5ZnJrbjJqM2p0cTN3Y282N2pjc2NraTVscHZ0MWh2YjQ2aCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/uw0KqTWZPAhuU/giphy.gif"
  },
  {
    name: "Peach & Goma",
    url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbnhmdWh1amg2aW8yY21oc2o2Mm9vaHl3dW8zNG1mbnpscG02c2M3eiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/LHZyixOnHwDDy/giphy.gif"
  }
];

const ICONS = ["💖", "🌹", "💌", "💍", "🧸", "✨", "🥰", "🍓", "🍫", "🎀"];

const EditProposal = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [recipientName, setRecipientName] = useState('');
  const [question, setQuestion] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [icon, setIcon] = useState('💖');
  const [gifUrl, setGifUrl] = useState('');
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [loveNote, setLoveNote] = useState('');
  const [buttonAnimation, setButtonAnimation] = useState('evader');
  const [published, setPublished] = useState(true);

  // Preview interactive state
  const [previewAnswered, setPreviewAnswered] = useState(false);
  const [previewNoPos, setPreviewNoPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const fetchProposal = async () => {
      try {
        setFetching(true);
        const res = await api.get(`/api/proposals/${id}`);
        const p = res.data.proposal;
        setRecipientName(p.recipientName || '');
        setQuestion(p.question || '');
        setCustomSlug(p.slug || '');
        setIcon(p.icon || '💖');
        setGifUrl(p.gifUrl || PRESET_GIFS[0].url);
        setSpotifyUrl(p.spotifyUrl || '');
        setLoveNote(p.loveNote || '');
        setButtonAnimation(p.buttonAnimation || 'evader');
        setPublished(p.published !== false);
      } catch (err) {
        setError('Failed to load proposal details.');
      } finally {
        setFetching(false);
      }
    };

    fetchProposal();
  }, [id]);

  const handleEvadePreview = () => {
    const x = (Math.random() - 0.5) * 180;
    const y = (Math.random() - 0.5) * 120;
    setPreviewNoPos({ x, y });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!recipientName.trim() || !question.trim()) {
      setError('Please fill in the required fields.');
      return;
    }

    setLoading(true);
    try {
      await api.put(`/api/proposals/${id}`, {
        recipientName: recipientName.trim(),
        question: question.trim(),
        slug: customSlug.trim() || undefined,
        icon,
        gifUrl,
        spotifyUrl: spotifyUrl.trim() || undefined,
        loveNote: loveNote.trim() || undefined,
        buttonAnimation,
        published,
      });

      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update proposal.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="py-24 text-center">
        <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-gray-500">Loading proposal data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 font-heading">
          Edit Proposal ✨
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Update the question, button behavior, or secret love letter.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="glass-card rounded-3xl p-6 sm:p-7 border border-white space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                  Recipient Name *
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/90 border border-rose-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                  Proposal Question *
                </label>
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/90 border border-rose-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                  Choose Icon
                </label>
                <div className="flex flex-wrap gap-2">
                  {ICONS.map((ic) => (
                    <button
                      type="button"
                      key={ic}
                      onClick={() => setIcon(ic)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all border ${
                        icon === ic
                          ? 'bg-rose-100 border-rose-400 scale-110 shadow-xs'
                          : 'bg-white border-rose-100 hover:bg-rose-50'
                      }`}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Reaction GIF */}
            <div className="glass-card rounded-3xl p-6 sm:p-7 border border-white">
              <label className="block text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wider">
                Reaction GIF
              </label>
              <div className="grid grid-cols-5 gap-2.5 mb-3">
                {PRESET_GIFS.map((g) => (
                  <button
                    type="button"
                    key={g.name}
                    onClick={() => setGifUrl(g.url)}
                    className={`rounded-2xl overflow-hidden aspect-square border-2 transition-all ${
                      gifUrl === g.url
                        ? 'border-rose-500 ring-2 ring-rose-300 scale-105'
                        : 'border-transparent opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img src={g.url} alt={g.name} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
              <input
                type="url"
                value={gifUrl}
                onChange={(e) => setGifUrl(e.target.value)}
                placeholder="https://media.giphy.com/.../giphy.gif"
                className="w-full px-4 py-2.5 rounded-xl bg-white/90 border border-rose-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none text-xs"
              />
            </div>

            {/* Button Animation */}
            <div className="glass-card rounded-3xl p-6 sm:p-7 border border-white">
              <label className="block text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wider">
                Interactive "No" Button Behavior
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'evader', title: 'The Evader' },
                  { id: 'shrink', title: 'Shrinking No' },
                  { id: 'grow', title: 'Growing Yes' },
                  { id: 'teleport', title: 'Teleportation' },
                ].map((mode) => (
                  <div
                    key={mode.id}
                    onClick={() => setButtonAnimation(mode.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      buttonAnimation === mode.id
                        ? 'bg-rose-50 border-rose-500'
                        : 'bg-white/80 border-rose-100 hover:bg-rose-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-gray-900">{mode.title}</span>
                      {buttonAnimation === mode.id && (
                        <CheckCircle2 className="w-4 h-4 text-rose-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Secret Love Note */}
            <div className="glass-card rounded-3xl p-6 sm:p-7 border border-white space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                  Secret Love Letter (Revealed on YES)
                </label>
                <textarea
                  rows={4}
                  value={loveNote}
                  onChange={(e) => setLoveNote(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/90 border border-rose-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none font-handwriting text-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                  Spotify Link
                </label>
                <input
                  type="url"
                  value={spotifyUrl}
                  onChange={(e) => setSpotifyUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/90 border border-rose-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                  Custom Slug
                </label>
                <input
                  type="text"
                  value={customSlug}
                  onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/90 border border-rose-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none text-xs font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white font-bold text-base shadow-xl shadow-rose-500/30 hover:shadow-rose-500/40 transition-all flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Live Preview */}
        <div className="lg:col-span-5 sticky top-24">
          <div className="glass-card rounded-3xl p-6 border border-white/90 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-rose-100">
              <span className="text-xs font-bold text-rose-600 uppercase tracking-wider flex items-center space-x-1.5">
                <Eye className="w-4 h-4" />
                <span>Live Preview</span>
              </span>
            </div>

            <div className="p-4 bg-white/90 rounded-2xl border border-rose-100 text-center min-h-[350px] flex flex-col justify-center">
              <div className="w-24 h-24 mx-auto rounded-2xl overflow-hidden shadow-md mb-3 bg-rose-50 border-2 border-rose-200">
                <img
                  src={gifUrl || PRESET_GIFS[0].url}
                  alt="Reaction GIF"
                  className="w-full h-full object-cover"
                />
              </div>

              <span className="text-2xl mb-1 block">{icon}</span>
              <h3 className="text-xl font-bold text-gray-900 font-heading mb-1">
                Dear {recipientName || 'Name'} ❤️
              </h3>
              <p className="text-base font-semibold text-rose-600 mb-6">
                {question || 'Proposal question'}
              </p>

              <div className="flex items-center justify-center gap-3 relative min-h-[50px]">
                <button
                  type="button"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-green-500 text-white font-bold text-sm shadow-md"
                >
                  YES! 💖
                </button>
                <motion.button
                  type="button"
                  onMouseEnter={handleEvadePreview}
                  onTouchStart={handleEvadePreview}
                  animate={{ x: previewNoPos.x, y: previewNoPos.y }}
                  transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                  className="px-4 py-2.5 rounded-xl bg-gray-200 text-gray-700 text-xs font-medium cursor-pointer"
                >
                  No
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProposal;
