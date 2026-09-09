import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, Music, Mail, CheckCircle, Send } from 'lucide-react';
import { neonApi } from '../services/neonApi';
import ConfettiFx from '../components/ConfettiFx';
import FloatingHearts from '../components/FloatingHearts';

const FUNNY_NO_PHRASES = [
  "No",
  "Are you sure? 🥺",
  "Think again! 😭",
  "I'll buy you food! 🍕",
  "Don't break my heart 💔",
  "Pretty please with sprinkles? 🍒",
  "What if I give you chocolate? 🍫",
  "Error 404: 'No' not found! 😉",
  "You can't escape my love! 💖",
];

const PublicProposal = () => {
  const { slug } = useParams();
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Interaction State
  const [isOpened, setIsOpened] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);
  const [noButtonPos, setNoButtonPos] = useState({ x: 0, y: 0 });
  const [noAttempts, setNoAttempts] = useState(0);
  const [customResponseText, setCustomResponseText] = useState('');
  const [messageSent, setMessageSent] = useState(false);

  // Play audio celebration chime via Web Audio API
  const playCelebrationChime = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 arpeggio
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.15, ctx.currentTime + index * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.12 + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + index * 0.12);
        osc.stop(ctx.currentTime + index * 0.12 + 0.6);
      });
    } catch (e) {
      console.log("Audio not allowed yet");
    }
  };

  useEffect(() => {
    const fetchProposal = async () => {
      try {
        setLoading(true);
        const data = await neonApi.getPublicProposal(slug);
        if (!data) {
          setError('Proposal page not found or made private.');
          return;
        }
        setProposal(data);

        // Record visitor view in background
        neonApi.recordVisit(slug, {
          device: /Mobi|Android/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop',
          userAgent: navigator.userAgent,
        }).catch(() => {});
      } catch (err) {
        setError(err.message || 'Proposal not found or unpublished.');
      } finally {
        setLoading(false);
      }
    };

    fetchProposal();
  }, [slug]);

  // Physics logic for evasive No button
  const handleNoInteraction = () => {
    const nextAttempts = noAttempts + 1;
    setNoAttempts(nextAttempts);

    if (proposal?.buttonAnimation === 'evader' || !proposal?.buttonAnimation) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 120 + 80;
      const randomX = Math.cos(angle) * distance;
      const randomY = Math.sin(angle) * distance;
      setNoButtonPos({ x: randomX, y: randomY });
    } else if (proposal?.buttonAnimation === 'teleport') {
      const corners = [
        { x: -140, y: -100 },
        { x: 140, y: -100 },
        { x: -140, y: 100 },
        { x: 140, y: 100 },
      ];
      setNoButtonPos(corners[nextAttempts % corners.length]);
    }
  };

  // When Recipient Clicks YES
  const handleAccept = async () => {
    setIsAccepted(true);
    playCelebrationChime();

    try {
      await neonApi.submitResponse(slug, "YES! 💖");
    } catch (err) {
      console.error("Failed to record acceptance:", err);
    }
  };

  const handleSendCustomNote = async (e) => {
    e.preventDefault();
    if (!customResponseText.trim()) return;

    try {
      await neonApi.submitResponse(slug, `YES! 💖 Reply: "${customResponseText.trim()}"`);
      setMessageSent(true);
    } catch (err) {
      console.error("Failed to send reply:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-rose-50 px-4">
        <FloatingHearts />
        <div className="w-12 h-12 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-rose-600 font-semibold font-heading animate-pulse">
          Opening a special letter for you... 💌
        </p>
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-rose-50 px-4 text-center">
        <FloatingHearts />
        <div className="glass-card rounded-3xl p-8 max-w-md w-full shadow-2xl border border-white">
          <div className="text-4xl mb-3">💔</div>
          <h2 className="text-2xl font-bold text-gray-900 font-heading">Letter Not Found</h2>
          <p className="text-gray-500 text-sm mt-2 mb-6">
            {error || "This proposal is no longer available or was made private."}
          </p>
          <a
            href="/"
            className="inline-block px-6 py-2.5 rounded-xl bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600"
          >
            Create Your Own Proposal
          </a>
        </div>
      </div>
    );
  }

  // Calculate dynamic scales for grow/shrink button modes
  const yesScale = proposal.buttonAnimation === 'grow' ? 1 + noAttempts * 0.22 : 1;
  const noScale = proposal.buttonAnimation === 'shrink' ? Math.max(0.3, 1 - noAttempts * 0.18) : 1;

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 overflow-hidden bg-gradient-to-b from-rose-100/60 via-pink-50 to-rose-100/80">
      <FloatingHearts />
      <ConfettiFx trigger={isAccepted} duration={8000} />

      <div className="w-full max-w-lg mx-auto relative z-10">
        <AnimatePresence mode="wait">
          {/* STEP 1: Closed Envelope Animation */}
          {!isOpened ? (
            <motion.div
              key="envelope"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0, y: -40 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div
                onClick={() => setIsOpened(true)}
                className="glass-card rounded-3xl p-8 sm:p-12 border-2 border-white shadow-2xl cursor-pointer transform hover:scale-105 transition-all duration-300 group"
              >
                <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-3xl bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center text-white shadow-xl shadow-rose-500/30 mb-6 group-hover:rotate-6 transition-transform">
                  <Mail className="w-12 h-12 sm:w-14 sm:h-14 animate-bounce" />
                </div>

                <span className="text-xs font-bold uppercase tracking-widest text-rose-500 bg-rose-100 px-3 py-1 rounded-full">
                  Special Delivery 💌
                </span>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-heading mt-4">
                  For {proposal.recipientName}
                </h1>

                <p className="text-sm text-gray-500 mt-2">
                  Someone made a personalized interactive card just for you.
                </p>

                <div className="mt-8">
                  <span className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-sm shadow-md shadow-rose-500/25 group-hover:shadow-lg transition-all">
                    <span>Tap to Open Letter</span>
                    <Sparkles className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </motion.div>
          ) : !isAccepted ? (
            /* STEP 2: The Proposal Card with Physics Buttons */
            <motion.div
              key="proposal-card"
              initial={{ scale: 0.85, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.5, type: 'spring' }}
              className="glass-card rounded-3xl p-6 sm:p-10 border border-white shadow-2xl text-center relative overflow-hidden"
            >
              {/* Spotify Embed Player if present */}
              {proposal.spotifyUrl && (
                <div className="mb-4">
                  <iframe
                    style={{ borderRadius: '12px' }}
                    src={
                      proposal.spotifyUrl.includes('spotify.com/embed')
                        ? proposal.spotifyUrl
                        : proposal.spotifyUrl.replace('open.spotify.com/', 'open.spotify.com/embed/')
                    }
                    width="100%"
                    height="80"
                    frameBorder="0"
                    allowFullScreen=""
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    title="Spotify track"
                  />
                </div>
              )}

              {/* Reaction GIF */}
              {proposal.gifUrl && (
                <div className="w-36 h-36 sm:w-44 sm:h-44 mx-auto rounded-3xl overflow-hidden shadow-lg mb-5 bg-rose-50 border-2 border-rose-200">
                  <img
                    src={proposal.gifUrl}
                    alt="Reaction GIF"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="text-3xl mb-1">{proposal.icon || '💖'}</div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-heading mb-2">
                Dear {proposal.recipientName} ❤️
              </h2>

              <p className="text-xl sm:text-2xl font-bold text-rose-600 mb-8 font-heading leading-snug">
                {proposal.question}
              </p>

              {/* Interactive Decision Area */}
              <div className="flex items-center justify-center gap-4 relative min-h-[90px]">
                {/* YES BUTTON */}
                <motion.button
                  onClick={handleAccept}
                  style={{ transform: `scale(${yesScale})` }}
                  whileHover={{ scale: yesScale * 1.08 }}
                  whileTap={{ scale: yesScale * 0.95 }}
                  className="px-8 sm:px-10 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-600 hover:from-emerald-500 hover:to-green-700 text-white font-black text-lg sm:text-xl shadow-xl shadow-emerald-500/35 transition-all z-20"
                >
                  YES! 💖
                </motion.button>

                {/* NO BUTTON (Evader/Physics) */}
                <motion.button
                  onMouseEnter={handleNoInteraction}
                  onTouchStart={handleNoInteraction}
                  onClick={handleNoInteraction}
                  animate={{ x: noButtonPos.x, y: noButtonPos.y, scale: noScale }}
                  transition={{ type: 'spring', stiffness: 450, damping: 20 }}
                  className="px-5 py-3.5 rounded-2xl bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold text-sm sm:text-base shadow-sm cursor-pointer select-none transition-colors z-10"
                >
                  {FUNNY_NO_PHRASES[noAttempts % FUNNY_NO_PHRASES.length]}
                </motion.button>
              </div>

              {noAttempts > 0 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-rose-500 mt-4 font-medium italic"
                >
                  Resistance is futile! The answer can only be YES! 🥰
                </motion.p>
              )}
            </motion.div>
          ) : (
            /* STEP 3: Celebration & Acceptance Screen */
            <motion.div
              key="accepted-screen"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, type: 'spring' }}
              className="glass-card rounded-3xl p-6 sm:p-10 border-2 border-rose-200 shadow-2xl text-center"
            >
              <div className="w-20 h-20 mx-auto rounded-full bg-rose-100 flex items-center justify-center text-4xl mb-4 animate-bounce">
                💍
              </div>

              <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                Response Recorded 🎉
              </span>

              <h2 className="text-3xl sm:text-4xl font-black text-rose-600 font-heading mt-3 mb-2">
                YAAAY! It's a YES! 💕
              </h2>

              <p className="text-sm text-gray-600 mb-6">
                You just made their whole world brighter!
              </p>

              {/* Secret Love Note */}
              {proposal.loveNote && (
                <div className="text-left bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-6 border border-rose-200 shadow-inner mb-6 relative">
                  <div className="flex items-center space-x-2 text-rose-600 font-bold text-xs uppercase tracking-wider mb-2">
                    <Heart className="w-4 h-4 fill-rose-500" />
                    <span>Secret Letter From Your Special One:</span>
                  </div>
                  <p className="font-handwriting text-xl sm:text-2xl text-gray-800 leading-relaxed whitespace-pre-line">
                    "{proposal.loveNote}"
                  </p>
                </div>
              )}

              {/* Optional Quick Reply Box back to creator */}
              {!messageSent ? (
                <form onSubmit={handleSendCustomNote} className="mt-4 pt-4 border-t border-rose-100 text-left">
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Send a sweet reply note back:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customResponseText}
                      onChange={(e) => setCustomResponseText(e.target.value)}
                      placeholder="Can't wait for our date! ❤️"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/90 border border-rose-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none text-xs"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold flex items-center space-x-1 shrink-0 shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="mt-4 p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold flex items-center justify-center space-x-1.5">
                  <CheckCircle className="w-4 h-4" />
                  <span>Your reply has been sent!</span>
                </div>
              )}

              <div className="mt-8 pt-4 border-t border-rose-100 flex items-center justify-center text-xs text-gray-400">
                <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400 mr-1" />
                <span>Powered by Speciallyo</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PublicProposal;
