import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, Sparkles, Wand2, Music, Image as ImageIcon, 
  FileText, Link2, ArrowRight, Eye, CheckCircle2, AlertCircle, RefreshCw 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { neonApi } from '../services/neonApi';
import { useAuthStore } from '../store/authStore';

const PRESET_QUESTIONS = [
  "Will you be my Valentine? 💖",
  "Will you go on a date with me? 🌹",
  "Will you be my girlfriend? 💌",
  "Will you be my boyfriend? ✨",
  "Will you marry me? 💍",
  "Can I take you out for coffee? ☕",
];

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

const CreateProposal = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [recipientName, setRecipientName] = useState('');
  const [question, setQuestion] = useState('Will you be my Valentine? 💖');
  const [customSlug, setCustomSlug] = useState('');
  const [icon, setIcon] = useState('💖');
  const [gifUrl, setGifUrl] = useState(PRESET_GIFS[0].url);
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [loveNote, setLoveNote] = useState('');
  const [buttonAnimation, setButtonAnimation] = useState('evader');

  // Preview interactive state
  const [previewAnswered, setPreviewAnswered] = useState(false);
  const [previewNoPos, setPreviewNoPos] = useState({ x: 0, y: 0 });
  const [previewNoCount, setPreviewNoCount] = useState(0);

  const handleEvadePreview = () => {
    const x = (Math.random() - 0.5) * 180;
    const y = (Math.random() - 0.5) * 120;
    setPreviewNoPos({ x, y });
    setPreviewNoCount((c) => c + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!recipientName.trim()) {
      setError('Please enter the recipient name.');
      return;
    }
    if (!question.trim()) {
      setError('Please enter a proposal question.');
      return;
    }
    if (!user?.id) {
      setError('Please sign in to create a proposal.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        recipientName: recipientName.trim(),
        question: question.trim(),
        slug: customSlug.trim() || undefined,
        icon,
        gifUrl,
        spotifyUrl: spotifyUrl.trim() || undefined,
        loveNote: loveNote.trim() || undefined,
        buttonAnimation,
        published: true,
      };

      await neonApi.createProposal(user.id, payload);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to create proposal. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 font-heading">
          Create an Interactive Proposal ✨
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Customize the message, physics, reaction GIFs, and secret note with real-time live preview!
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Builder Form (Left 7 Cols) */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Who is this for? */}
            <div className="glass-card rounded-3xl p-6 sm:p-7 border border-white">
              <div className="flex items-center space-x-2.5 mb-4 text-rose-600 font-bold">
                <Heart className="w-5 h-5 fill-rose-500" />
                <h3 className="text-lg font-heading text-gray-900">1. Recipient & Question</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                    Recipient's Name / Nickname *
                  </label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="e.g. Sarah, My Princess, Bubba"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/90 border border-rose-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none text-sm font-medium"
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
                    placeholder="Will you be my Valentine?"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/90 border border-rose-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none text-sm font-medium"
                  />

                  {/* Preset quick chips */}
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {PRESET_QUESTIONS.map((q) => (
                      <button
                        type="button"
                        key={q}
                        onClick={() => setQuestion(q)}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                          question === q
                            ? 'bg-rose-500 text-white border-rose-500 font-medium'
                            : 'bg-rose-50/60 text-gray-600 border-rose-100 hover:bg-rose-100'
                        }`}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
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
            </div>

            {/* Step 2: Cute Reaction GIF */}
            <div className="glass-card rounded-3xl p-6 sm:p-7 border border-white">
              <div className="flex items-center space-x-2.5 mb-4 text-rose-600 font-bold">
                <Sparkles className="w-5 h-5" />
                <h3 className="text-lg font-heading text-gray-900">2. Cute Reaction GIF</h3>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5 mb-4">
                {PRESET_GIFS.map((g) => (
                  <button
                    type="button"
                    key={g.name}
                    onClick={() => setGifUrl(g.url)}
                    className={`rounded-2xl overflow-hidden aspect-square border-2 transition-all relative ${
                      gifUrl === g.url
                        ? 'border-rose-500 ring-2 ring-rose-300 scale-105 shadow-md'
                        : 'border-transparent hover:opacity-80'
                    }`}
                  >
                    <img src={g.url} alt={g.name} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                  Or paste custom GIF / Image URL
                </label>
                <input
                  type="url"
                  value={gifUrl}
                  onChange={(e) => setGifUrl(e.target.value)}
                  placeholder="https://media.giphy.com/.../giphy.gif"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/90 border border-rose-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none text-xs"
                />
              </div>
            </div>

            {/* Step 3: Button Physics Animation */}
            <div className="glass-card rounded-3xl p-6 sm:p-7 border border-white">
              <div className="flex items-center space-x-2.5 mb-4 text-rose-600 font-bold">
                <Wand2 className="w-5 h-5" />
                <h3 className="text-lg font-heading text-gray-900">3. Interactive "No" Button Behavior</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    id: 'evader',
                    title: 'The Evader (Recommended)',
                    desc: 'No button actively flees the cursor & touch in panic!',
                  },
                  {
                    id: 'shrink',
                    title: 'Shrinking No',
                    desc: 'No button shrinks smaller on each click attempt.',
                  },
                  {
                    id: 'grow',
                    title: 'Growing Yes',
                    desc: 'Yes button gets bigger each time No is touched.',
                  },
                  {
                    id: 'teleport',
                    title: 'Teleportation',
                    desc: 'No button jumps to random corners when approached.',
                  },
                ].map((mode) => (
                  <div
                    key={mode.id}
                    onClick={() => setButtonAnimation(mode.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      buttonAnimation === mode.id
                        ? 'bg-rose-50 border-rose-500 shadow-xs'
                        : 'bg-white/80 border-rose-100 hover:bg-rose-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-gray-900">{mode.title}</h4>
                      {buttonAnimation === mode.id && (
                        <CheckCircle2 className="w-4 h-4 text-rose-600" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{mode.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 4: Romantic Extras */}
            <div className="glass-card rounded-3xl p-6 sm:p-7 border border-white space-y-4">
              <div className="flex items-center space-x-2.5 mb-2 text-rose-600 font-bold">
                <Music className="w-5 h-5" />
                <h3 className="text-lg font-heading text-gray-900">4. Romantic Extras (Optional)</h3>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider flex items-center justify-between">
                  <span>Secret Love Letter (Revealed on YES)</span>
                </label>
                <textarea
                  rows={4}
                  value={loveNote}
                  onChange={(e) => setLoveNote(e.target.value)}
                  placeholder="You make every single day magical. Thank you for always being my sunshine... ❤️"
                  className="w-full px-4 py-3 rounded-xl bg-white/90 border border-rose-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none text-sm font-handwriting text-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                  Spotify Track / Playlist Link
                </label>
                <input
                  type="url"
                  value={spotifyUrl}
                  onChange={(e) => setSpotifyUrl(e.target.value)}
                  placeholder="https://open.spotify.com/track/..."
                  className="w-full px-4 py-2.5 rounded-xl bg-white/90 border border-rose-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none text-xs"
                />
              </div>

              {/* Custom Slug URL */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                  Custom URL Slug
                </label>
                <div className="flex items-center">
                  <span className="text-xs text-gray-400 bg-rose-50 px-3 py-2.5 rounded-l-xl border border-r-0 border-rose-200 font-mono">
                    speciallyo.web.app/p/
                  </span>
                  <input
                    type="text"
                    value={customSlug}
                    onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder={recipientName ? recipientName.toLowerCase().replace(/\s+/g, '-') : 'sarah-love'}
                    className="w-full px-3 py-2.5 rounded-r-xl bg-white/90 border border-rose-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-base shadow-xl shadow-rose-500/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Publish & Generate Proposal Page</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Live Preview Sidebar (Right 5 Cols) */}
        <div className="lg:col-span-5 sticky top-24">
          <div className="glass-card rounded-3xl p-6 border border-white/90 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-rose-100">
              <span className="text-xs font-bold text-rose-600 uppercase tracking-wider flex items-center space-x-1.5">
                <Eye className="w-4 h-4" />
                <span>Live Interactive Preview</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setPreviewAnswered(false);
                  setPreviewNoPos({ x: 0, y: 0 });
                  setPreviewNoCount(0);
                }}
                className="text-[11px] text-gray-500 hover:text-rose-600 flex items-center space-x-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            <div className="p-4 bg-gradient-to-b from-white to-rose-50/50 rounded-2xl border border-rose-100/80 text-center min-h-[380px] flex flex-col justify-center">
              {!previewAnswered ? (
                <div>
                  <div className="w-28 h-28 mx-auto rounded-2xl overflow-hidden shadow-md mb-4 bg-rose-50 border-2 border-rose-200">
                    <img
                      src={gifUrl || PRESET_GIFS[0].url}
                      alt="Reaction GIF"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <span className="text-2xl mb-1 block">{icon}</span>

                  <h3 className="text-xl font-bold text-gray-900 font-heading mb-1">
                    Dear {recipientName || 'Your Name'} ❤️
                  </h3>

                  <p className="text-base font-semibold text-rose-600 mb-6">
                    {question || 'Will you be my Valentine? 💖'}
                  </p>

                  <div className="flex items-center justify-center gap-3 relative min-h-[60px]">
                    <button
                      type="button"
                      onClick={() => setPreviewAnswered(true)}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-green-500 text-white font-bold text-sm shadow-md shadow-emerald-500/25 hover:scale-105 transition-all"
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
                      {previewNoCount > 0 ? "Can't click me! 😜" : "No"}
                    </motion.button>
                  </div>
                </div>
              ) : (
                <div className="py-6 animate-fadeIn">
                  <div className="text-4xl mb-2 animate-bounce">🎉</div>
                  <h4 className="text-xl font-bold text-rose-600 font-heading">
                    YAY! Acceptance Preview! 💍
                  </h4>
                  {loveNote && (
                    <div className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-left font-handwriting text-base text-gray-800">
                      <p className="font-bold text-rose-600 mb-1">Secret Note:</p>
                      <p className="italic">{loveNote}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <p className="text-[11px] text-gray-400 text-center mt-3">
              This preview matches exactly what your recipient will see!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProposal;
