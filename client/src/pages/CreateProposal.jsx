import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, Sparkles, Wand2, Music, Calendar, Clock, MapPin, 
  ArrowRight, Eye, CheckCircle2, AlertCircle, RefreshCw, Layers, Edit3, MessageCircle 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { neonApi } from '../services/neonApi';
import { useAuthStore } from '../store/authStore';

const PRESET_QUESTIONS = [
  { id: 'val', text: "Will you be my Valentine? 💖", icon: "💖" },
  { id: 'date', text: "Will you go on a date with me? 🌹", icon: "🌹" },
  { id: 'gf', text: "Will you be my girlfriend? 💌", icon: "💌" },
  { id: 'bf', text: "Will you be my boyfriend? ✨", icon: "✨" },
  { id: 'marry', text: "Will you marry me? 💍", icon: "💍" },
  { id: 'coffee', text: "Can I take you out for coffee? ☕", icon: "☕" },
];

const PRESET_GIFS = [
  {
    name: "Cute Bear Love",
    url: "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3ZhcXlzc2N1ejZ3ajN6bjA0OGY0MnpsamFpYWZmdXJ6c3F6enFqdiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/c76IJLufpNwSULPk77/giphy.gif"
  },
  {
    name: "Hugging Cats",
    url: "https://media.giphy.com/media/MDJ9IbxxvDUQM/giphy.gif"
  },
  {
    name: "Peach & Goma Kiss",
    url: "https://media.giphy.com/media/LHZyixOnHwDDy/giphy.gif"
  },
  {
    name: "Puppy Eyes",
    url: "https://media.giphy.com/media/uw0KqTWZPAhuU/giphy.gif"
  },
  {
    name: "Anime Love Confession",
    url: "https://media.giphy.com/media/26FLdmIp6wJr91JAI/giphy.gif"
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
  const [question, setQuestion] = useState(PRESET_QUESTIONS[0].text);
  const [isCustomQuestion, setIsCustomQuestion] = useState(false);
  const [customQuestionText, setCustomQuestionText] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [icon, setIcon] = useState('💖');
  const [gifUrl, setGifUrl] = useState(PRESET_GIFS[0].url);
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [buttonAnimation, setButtonAnimation] = useState('evader');

  // Follow-up After "YES" Configuration
  const [followUpType, setFollowUpType] = useState('date_plan'); // 'date_plan' | 'two_options' | 'letter_only'
  const [loveNote, setLoveNote] = useState('');
  const [option1, setOption1] = useState('Coffee & Boba ☕🧋');
  const [option2, setOption2] = useState('Dinner & Movie 🍕🎬');
  const [twoOptionsPrompt, setTwoOptionsPrompt] = useState('What should we do on our first date?');

  // Preview interactive state
  const [previewStep, setPreviewStep] = useState('proposal'); // 'proposal' | 'follow_up' | 'celebration'
  const [previewNoPos, setPreviewNoPos] = useState({ x: 0, y: 0 });
  const [previewNoCount, setPreviewNoCount] = useState(0);

  // Preview date form state
  const [previewDate, setPreviewDate] = useState('');
  const [previewTime, setPreviewTime] = useState('Dinner (7:00 PM) 🍷');
  const [previewActivity, setPreviewActivity] = useState('Romantic Dinner 🍝');

  const currentQuestionText = isCustomQuestion ? customQuestionText : question;

  const handleEvadePreview = () => {
    // Evade within preview container
    const x = (Math.random() - 0.5) * 220;
    const y = (Math.random() - 0.5) * 140;
    setPreviewNoPos({ x, y });
    setPreviewNoCount((c) => c + 1);
  };

  const handleSelectQuestion = (qText) => {
    setIsCustomQuestion(false);
    setQuestion(qText);
  };

  const handleCustomQuestionClick = () => {
    setIsCustomQuestion(true);
    if (!customQuestionText) {
      setCustomQuestionText(question);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const finalQuestion = isCustomQuestion ? customQuestionText.trim() : question.trim();

    if (!recipientName.trim()) {
      setError('Please enter the recipient name.');
      return;
    }
    if (!finalQuestion) {
      setError('Please select or enter a proposal question.');
      return;
    }
    if (!user?.id) {
      setError('Please sign in to create a proposal.');
      return;
    }

    // Build follow-up payload
    const followUpData = {
      type: followUpType,
      note: loveNote.trim(),
      option1: option1.trim(),
      option2: option2.trim(),
      twoOptionsPrompt: twoOptionsPrompt.trim(),
    };

    setLoading(true);
    try {
      const payload = {
        recipientName: recipientName.trim(),
        question: finalQuestion,
        slug: customSlug.trim() || undefined,
        icon,
        gifUrl,
        spotifyUrl: spotifyUrl.trim() || undefined,
        loveNote: JSON.stringify(followUpData),
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
          Customize questions, full-page button evasion physics, post-YES date planning, and live preview!
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
            {/* Step 1: Who is this for & Question Selector */}
            <div className="glass-card rounded-3xl p-6 sm:p-7 border border-white">
              <div className="flex items-center space-x-2.5 mb-4 text-rose-600 font-bold">
                <Heart className="w-5 h-5 fill-rose-500" />
                <h3 className="text-lg font-heading text-gray-900">1. Recipient & Proposal Question</h3>
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
                  <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wider">
                    Choose Proposal Question *
                  </label>
                  
                  {/* Preset Question Buttons Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3">
                    {PRESET_QUESTIONS.map((q) => {
                      const isSelected = !isCustomQuestion && question === q.text;
                      return (
                        <button
                          type="button"
                          key={q.id}
                          onClick={() => handleSelectQuestion(q.text)}
                          className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between text-xs sm:text-sm font-medium ${
                            isSelected
                              ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white border-transparent shadow-md shadow-rose-500/25 scale-[1.02]'
                              : 'bg-white/90 text-gray-700 border-rose-100 hover:border-rose-300 hover:bg-rose-50/50'
                          }`}
                        >
                          <span className="flex-1 pr-2">{q.text}</span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-white shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Question Button / Field */}
                  <div>
                    <button
                      type="button"
                      onClick={handleCustomQuestionClick}
                      className={`w-full p-3 rounded-2xl border text-xs sm:text-sm font-medium transition-all flex items-center justify-between ${
                        isCustomQuestion
                          ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-xs'
                          : 'bg-white/80 border-rose-100 text-gray-600 hover:bg-rose-50/40'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Edit3 className="w-4 h-4 text-rose-500" />
                        <span>✨ Or Write Your Own Custom Question</span>
                      </div>
                      {isCustomQuestion && <span className="text-[11px] font-bold text-rose-600 uppercase">Active</span>}
                    </button>

                    {isCustomQuestion && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-2.5"
                      >
                        <input
                          type="text"
                          value={customQuestionText}
                          onChange={(e) => setCustomQuestionText(e.target.value)}
                          placeholder="e.g. Can we go on a trip together to Paris? ✈️"
                          required
                          className="w-full px-4 py-3 rounded-xl bg-white border-2 border-rose-400 focus:border-rose-600 focus:ring-2 focus:ring-rose-200 outline-none text-sm font-medium text-gray-900"
                        />
                      </motion.div>
                    )}
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
                <h3 className="text-lg font-heading text-gray-900">3. "No" Button Evasion Mode</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    id: 'evader',
                    title: 'Full-Screen Runaway (Recommended)',
                    desc: 'No button flees everywhere across the whole page!',
                  },
                  {
                    id: 'shrink',
                    title: 'Shrinking No',
                    desc: 'No button shrinks smaller on each hover attempt.',
                  },
                  {
                    id: 'grow',
                    title: 'Growing Yes',
                    desc: 'Yes button gets bigger each time No is touched.',
                  },
                  {
                    id: 'teleport',
                    title: 'Screen Teleportation',
                    desc: 'No button jumps to random corners of the screen.',
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

            {/* Step 4: After "YES" Follow-Up & Planning Card */}
            <div className="glass-card rounded-3xl p-6 sm:p-7 border border-white space-y-5">
              <div className="flex items-center space-x-2.5 text-rose-600 font-bold">
                <Calendar className="w-5 h-5" />
                <h3 className="text-lg font-heading text-gray-900">4. After "YES" Next Step & Planning</h3>
              </div>

              <p className="text-xs text-gray-500 -mt-2">
                Choose what happens immediately after your partner clicks "YES! 💖":
              </p>

              {/* Follow-up Type Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: 'date_plan',
                    icon: '📅',
                    title: 'Plan Our Date',
                    desc: 'Ask Date, Time slot, Food & Location preference',
                  },
                  {
                    id: 'two_options',
                    icon: '🎁',
                    title: 'Two Choices',
                    desc: 'Give 2 options to pick from (e.g. Coffee vs Dinner)',
                  },
                  {
                    id: 'letter_only',
                    icon: '💌',
                    title: 'Love Letter Only',
                    desc: 'Reveal secret handwritten love letter',
                  },
                ].map((type) => (
                  <div
                    key={type.id}
                    onClick={() => setFollowUpType(type.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all text-center ${
                      followUpType === type.id
                        ? 'bg-rose-50 border-rose-500 shadow-xs ring-2 ring-rose-200'
                        : 'bg-white/80 border-rose-100 hover:bg-rose-50/40'
                    }`}
                  >
                    <span className="text-2xl block mb-1">{type.icon}</span>
                    <h4 className="text-xs sm:text-sm font-bold text-gray-900">{type.title}</h4>
                    <p className="text-[11px] text-gray-500 mt-1 leading-snug">{type.desc}</p>
                  </div>
                ))}
              </div>

              {/* Dynamic Follow-Up Inputs */}
              {followUpType === 'date_plan' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-3 pt-3 border-t border-rose-100"
                >
                  <div className="p-3.5 rounded-2xl bg-rose-50/80 border border-rose-200/80 text-xs text-rose-800">
                    ✨ <strong>Interactive Date Planner:</strong> After clicking YES, the recipient will be asked to pick a <strong>Date 📅</strong>, <strong>Time slot ⏰</strong>, <strong>Food/Activity preference 🍝</strong>, and <strong>Location/Special note 📍</strong>!
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                      Optional Sweet Note / Message with the date planner
                    </label>
                    <textarea
                      rows={3}
                      value={loveNote}
                      onChange={(e) => setLoveNote(e.target.value)}
                      placeholder="I can't wait to spend this special day with you! Pick when you're free ❤️"
                      className="w-full px-4 py-3 rounded-xl bg-white/90 border border-rose-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none text-sm font-handwriting text-lg"
                    />
                  </div>
                </motion.div>
              )}

              {followUpType === 'two_options' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-3 pt-3 border-t border-rose-100"
                >
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                      Question / Choice Prompt
                    </label>
                    <input
                      type="text"
                      value={twoOptionsPrompt}
                      onChange={(e) => setTwoOptionsPrompt(e.target.value)}
                      placeholder="What should we do on our date?"
                      className="w-full px-4 py-2.5 rounded-xl bg-white/90 border border-rose-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none text-xs font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                        Option 1 🎁
                      </label>
                      <input
                        type="text"
                        value={option1}
                        onChange={(e) => setOption1(e.target.value)}
                        placeholder="Coffee & Bookstore ☕📚"
                        className="w-full px-4 py-2.5 rounded-xl bg-white/90 border border-rose-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                        Option 2 🌹
                      </label>
                      <input
                        type="text"
                        value={option2}
                        onChange={(e) => setOption2(e.target.value)}
                        placeholder="Romantic Dinner & Stargazing 🍷✨"
                        className="w-full px-4 py-2.5 rounded-xl bg-white/90 border border-rose-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none text-xs font-medium"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {followUpType === 'letter_only' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-3 pt-3 border-t border-rose-100"
                >
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                    Secret Love Letter (Revealed on YES)
                  </label>
                  <textarea
                    rows={4}
                    value={loveNote}
                    onChange={(e) => setLoveNote(e.target.value)}
                    placeholder="You make every single day magical. Thank you for always being my sunshine... ❤️"
                    className="w-full px-4 py-3 rounded-xl bg-white/90 border border-rose-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none text-sm font-handwriting text-lg"
                  />
                </motion.div>
              )}

              {/* Extras: Spotify and Custom Slug */}
              <div className="pt-3 border-t border-rose-100 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                    Spotify Track / Playlist Link (Optional)
                  </label>
                  <input
                    type="url"
                    value={spotifyUrl}
                    onChange={(e) => setSpotifyUrl(e.target.value)}
                    placeholder="https://open.spotify.com/track/..."
                    className="w-full px-4 py-2.5 rounded-xl bg-white/90 border border-rose-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                    Custom URL Slug (Optional)
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
                  setPreviewStep('proposal');
                  setPreviewNoPos({ x: 0, y: 0 });
                  setPreviewNoCount(0);
                }}
                className="text-[11px] text-gray-500 hover:text-rose-600 flex items-center space-x-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            <div className="p-4 bg-gradient-to-b from-white to-rose-50/50 rounded-2xl border border-rose-100/80 text-center min-h-[400px] flex flex-col justify-center">
              {previewStep === 'proposal' ? (
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
                    {currentQuestionText || 'Will you be my Valentine? 💖'}
                  </p>

                  <div className="flex items-center justify-center gap-3 relative min-h-[60px]">
                    <button
                      type="button"
                      onClick={() => setPreviewStep(followUpType === 'letter_only' ? 'celebration' : 'follow_up')}
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
                  <p className="text-[11px] text-gray-400 mt-3 italic">
                    💡 Try hovering over the No button!
                  </p>
                </div>
              ) : previewStep === 'follow_up' ? (
                <div className="py-2 text-left animate-fadeIn">
                  <div className="text-center mb-3">
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      Step 2: After YES 🎉
                    </span>
                  </div>

                  {followUpType === 'date_plan' ? (
                    <div className="space-y-3 bg-white p-4 rounded-2xl border border-rose-100 shadow-sm text-xs">
                      <h4 className="font-bold text-gray-800 text-sm text-center">
                        📅 Plan Our Special Date!
                      </h4>

                      <div>
                        <label className="block font-semibold text-gray-700 mb-1">Pick Date</label>
                        <input
                          type="date"
                          value={previewDate}
                          onChange={(e) => setPreviewDate(e.target.value)}
                          className="w-full p-2 rounded-lg border border-rose-200 bg-rose-50/50"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-gray-700 mb-1">Preferred Time</label>
                        <div className="grid grid-cols-2 gap-1.5">
                          {['Morning Coffee ☕', 'Lunch 🥗', 'Sunset Walk 🌅', 'Dinner 🍷'].map((t) => (
                            <button
                              type="button"
                              key={t}
                              onClick={() => setPreviewTime(t)}
                              className={`p-1.5 rounded-lg border text-[11px] ${
                                previewTime === t ? 'bg-rose-500 text-white font-bold' : 'bg-gray-50 text-gray-700'
                              }`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setPreviewStep('celebration')}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-xs shadow-md mt-2"
                      >
                        Confirm Our Date! 💖
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3 bg-white p-4 rounded-2xl border border-rose-100 shadow-sm text-center">
                      <h4 className="font-bold text-gray-800 text-sm">
                        {twoOptionsPrompt || 'Choose what we do!'}
                      </h4>
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={() => setPreviewStep('celebration')}
                          className="w-full p-3 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs"
                        >
                          {option1 || 'Option 1'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewStep('celebration')}
                          className="w-full p-3 rounded-xl border border-pink-200 bg-pink-50 hover:bg-pink-100 text-pink-700 font-bold text-xs"
                        >
                          {option2 || 'Option 2'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-6 animate-fadeIn">
                  <div className="text-4xl mb-2 animate-bounce">🎉</div>
                  <h4 className="text-xl font-bold text-rose-600 font-heading">
                    YAY! Response Saved! 💍
                  </h4>
                  <p className="text-xs text-gray-600 mt-1">
                    Your partner's choices are recorded directly to your dashboard!
                  </p>
                </div>
              )}
            </div>

            <p className="text-[11px] text-gray-400 text-center mt-3">
              This preview matches what your recipient sees!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProposal;
