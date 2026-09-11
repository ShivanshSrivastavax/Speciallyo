import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, Music, Mail, CheckCircle, Calendar, Clock, MapPin, Utensils, Send, ArrowRight } from 'lucide-react';
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
  "Wait, reconsider! 🌹",
  "Catch me if you can! 🏃💨",
];

const TIME_SLOTS = [
  { id: 'morning', label: 'Morning Coffee ☕ (10:00 AM)' },
  { id: 'lunch', label: 'Lunch Date 🥗 (1:00 PM)' },
  { id: 'sunset', label: 'Sunset & Walk 🌅 (5:30 PM)' },
  { id: 'dinner', label: 'Romantic Dinner 🍷 (7:30 PM)' },
  { id: 'latenight', label: 'Late Night Movie 🍿 (9:30 PM)' },
];

const FOOD_ACTIVITIES = [
  { id: 'italian', label: 'Italian Pasta 🍝' },
  { id: 'sushi', label: 'Japanese Sushi 🍣' },
  { id: 'pizza', label: 'Pizza & Chill 🍕' },
  { id: 'cafe', label: 'Cafe & Dessert 🥐' },
  { id: 'finedining', label: 'Fine Dining 🥩' },
  { id: 'picnic', label: 'Cute Picnic 🧺' },
];

const PublicProposal = () => {
  const { slug } = useParams();
  const [proposal, setProposal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Interaction State
  const [isOpened, setIsOpened] = useState(false);
  const [stage, setStage] = useState('proposal'); // 'proposal' | 'date_planning' | 'two_choices' | 'celebration'
  const [noButtonPos, setNoButtonPos] = useState({ x: 0, y: 0, isFixed: false });
  const [noAttempts, setNoAttempts] = useState(0);

  // Recipient Date Planning Form State
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState(TIME_SLOTS[3].label);
  const [selectedFood, setSelectedFood] = useState(FOOD_ACTIVITIES[0].label);
  const [locationNote, setLocationNote] = useState('');
  const [submittingPlan, setSubmittingPlan] = useState(false);

  // Follow-Up Config extracted from proposal
  const [followUpConfig, setFollowUpConfig] = useState({
    type: 'letter_only',
    note: '',
    option1: '',
    option2: '',
    twoOptionsPrompt: '',
  });

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

        // Parse Follow-Up Settings
        if (data.loveNote) {
          try {
            const parsed = JSON.parse(data.loveNote);
            if (parsed && typeof parsed === 'object') {
              setFollowUpConfig({
                type: parsed.type || 'letter_only',
                note: parsed.note || '',
                option1: parsed.option1 || '',
                option2: parsed.option2 || '',
                twoOptionsPrompt: parsed.twoOptionsPrompt || 'What should we do on our date?',
              });
            } else {
              setFollowUpConfig({
                type: 'letter_only',
                note: data.loveNote,
                option1: '',
                option2: '',
                twoOptionsPrompt: '',
              });
            }
          } catch {
            setFollowUpConfig({
              type: 'letter_only',
              note: data.loveNote,
              option1: '',
              option2: '',
              twoOptionsPrompt: '',
            });
          }
        }

        // Set default date to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setSelectedDate(tomorrow.toISOString().split('T')[0]);

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

  // Screen-Wide Physics Logic for Evasive "No" Button
  const handleNoInteraction = () => {
    const nextAttempts = noAttempts + 1;
    setNoAttempts(nextAttempts);

    // Calculate safe screen-wide coordinates across entire browser window
    const padding = 70;
    const btnWidth = 140;
    const btnHeight = 60;
    const maxX = Math.max(100, window.innerWidth - btnWidth - padding);
    const maxY = Math.max(100, window.innerHeight - btnHeight - padding);

    const randomX = Math.floor(Math.random() * (maxX - padding) + padding);
    const randomY = Math.floor(Math.random() * (maxY - padding) + padding);

    setNoButtonPos({
      x: randomX,
      y: randomY,
      isFixed: true,
    });
  };

  // When Recipient Clicks YES initially
  const handleInitialYes = () => {
    playCelebrationChime();

    if (followUpConfig.type === 'date_plan') {
      setStage('date_planning');
    } else if (followUpConfig.type === 'two_options') {
      setStage('two_choices');
    } else {
      // Standard love letter only
      finishAcceptance("YES! 💖");
    }
  };

  // Submit Date Planning
  const handleConfirmDatePlan = async (e) => {
    e.preventDefault();
    setSubmittingPlan(true);

    const responseString = `YES! 💖 | Date: ${selectedDate || 'Upcoming'} | Time: ${selectedTime} | Activity: ${selectedFood}${
      locationNote.trim() ? ` | Location/Note: "${locationNote.trim()}"` : ''
    }`;

    await finishAcceptance(responseString);
    setSubmittingPlan(false);
  };

  // Submit Two-Option Choice
  const handleSelectOption = async (chosenOption) => {
    const responseString = `YES! 💖 | Chosen Plan: ${chosenOption}`;
    await finishAcceptance(responseString);
  };

  const finishAcceptance = async (responseSummary) => {
    setStage('celebration');
    playCelebrationChime();

    try {
      await neonApi.submitResponse(slug, responseSummary);
    } catch (err) {
      console.error("Failed to record response:", err);
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

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 overflow-hidden bg-gradient-to-b from-rose-100/60 via-pink-50 to-rose-100/80">
      <FloatingHearts />
      <ConfettiFx trigger={stage === 'celebration'} duration={9000} />

      {/* Screen-Wide Evasive No Button (Fixed across entire window) */}
      {isOpened && stage === 'proposal' && noButtonPos.isFixed && (
        <motion.button
          type="button"
          onMouseEnter={handleNoInteraction}
          onTouchStart={handleNoInteraction}
          onClick={handleNoInteraction}
          animate={{
            left: noButtonPos.x,
            top: noButtonPos.y,
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 22 }}
          style={{ position: 'fixed', zIndex: 9999 }}
          className="px-5 py-3 rounded-2xl bg-gray-200/95 hover:bg-gray-300 text-gray-800 font-bold text-sm shadow-xl cursor-pointer select-none backdrop-blur-md border border-white"
        >
          {FUNNY_NO_PHRASES[noAttempts % FUNNY_NO_PHRASES.length]}
        </motion.button>
      )}

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
          ) : stage === 'proposal' ? (
            /* STEP 2: The Proposal Card with Screen-Wide Evasion */
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
              <div className="flex items-center justify-center gap-4 relative min-h-[80px]">
                {/* YES BUTTON */}
                <motion.button
                  onClick={handleInitialYes}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 sm:px-10 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-600 hover:from-emerald-500 hover:to-green-700 text-white font-black text-lg sm:text-xl shadow-xl shadow-emerald-500/35 transition-all z-20"
                >
                  YES! 💖
                </motion.button>

                {/* Initial In-Card NO BUTTON (Transitions to screen-wide upon first hover/touch) */}
                {!noButtonPos.isFixed && (
                  <button
                    type="button"
                    onMouseEnter={handleNoInteraction}
                    onTouchStart={handleNoInteraction}
                    onClick={handleNoInteraction}
                    className="px-5 py-3.5 rounded-2xl bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold text-sm sm:text-base shadow-sm cursor-pointer select-none transition-colors z-10"
                  >
                    No
                  </button>
                )}
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
          ) : stage === 'date_planning' ? (
            /* STEP 3A: Interactive Date Planner Card (After YES) */
            <motion.div
              key="date-planning-card"
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card rounded-3xl p-6 sm:p-8 border-2 border-rose-200 shadow-2xl"
            >
              <div className="text-center mb-6">
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                  You Said YES! 🎉
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-heading mt-2">
                  Let's Plan Our Date! 📅
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Pick your favorite day, time, and activity:
                </p>
              </div>

              {followUpConfig.note && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-100 mb-5 text-rose-700 font-handwriting text-lg leading-snug">
                  "{followUpConfig.note}"
                </div>
              )}

              <form onSubmit={handleConfirmDatePlan} className="space-y-4">
                {/* Pick Date */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center space-x-1.5 uppercase">
                    <Calendar className="w-3.5 h-3.5 text-rose-500" />
                    <span>Select Date 🗓️</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-rose-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none text-sm font-semibold text-gray-800"
                  />
                </div>

                {/* Preferred Time Slot */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center space-x-1.5 uppercase">
                    <Clock className="w-3.5 h-3.5 text-rose-500" />
                    <span>Preferred Time Slot ⏰</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {TIME_SLOTS.map((slot) => {
                      const isSelected = selectedTime === slot.label;
                      return (
                        <button
                          type="button"
                          key={slot.id}
                          onClick={() => setSelectedTime(slot.label)}
                          className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all ${
                            isSelected
                              ? 'bg-rose-500 text-white border-rose-500 shadow-sm'
                              : 'bg-white text-gray-700 border-rose-100 hover:bg-rose-50'
                          }`}
                        >
                          {slot.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Food / Activity Preference */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center space-x-1.5 uppercase">
                    <Utensils className="w-3.5 h-3.5 text-rose-500" />
                    <span>What should we eat / do? 🍝</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {FOOD_ACTIVITIES.map((food) => {
                      const isSelected = selectedFood === food.label;
                      return (
                        <button
                          type="button"
                          key={food.id}
                          onClick={() => setSelectedFood(food.label)}
                          className={`p-2 rounded-xl border text-center text-xs font-medium transition-all ${
                            isSelected
                              ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white border-transparent shadow-xs'
                              : 'bg-white text-gray-700 border-rose-100 hover:bg-rose-50'
                          }`}
                        >
                          {food.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Location Note */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center space-x-1.5 uppercase">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    <span>Location or special wish (Optional) 📍</span>
                  </label>
                  <input
                    type="text"
                    value={locationNote}
                    onChange={(e) => setLocationNote(e.target.value)}
                    placeholder="e.g. That cute Italian cafe downtown!"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-rose-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none text-xs"
                  />
                </div>

                {/* Submit Plan Button */}
                <button
                  type="submit"
                  disabled={submittingPlan}
                  className="w-full mt-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-600 hover:from-emerald-500 hover:to-green-700 text-white font-black text-base shadow-xl shadow-emerald-500/30 transition-all flex items-center justify-center space-x-2"
                >
                  {submittingPlan ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Lock In Our Date! 💖</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          ) : stage === 'two_choices' ? (
            /* STEP 3B: Two Options Choice Card (After YES) */
            <motion.div
              key="two-choices-card"
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card rounded-3xl p-6 sm:p-8 border-2 border-rose-200 shadow-2xl text-center"
            >
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                You Said YES! 🎉
              </span>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-heading mt-3 mb-2">
                {followUpConfig.twoOptionsPrompt || 'Pick what we do next!'}
              </h2>

              <p className="text-xs sm:text-sm text-gray-500 mb-6">
                Tap your favorite option below:
              </p>

              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleSelectOption(followUpConfig.option1 || 'Option 1')}
                  className="w-full p-4 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-base shadow-lg shadow-rose-500/25 flex items-center justify-between"
                >
                  <span>{followUpConfig.option1 || 'Option 1'}</span>
                  <Sparkles className="w-5 h-5" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleSelectOption(followUpConfig.option2 || 'Option 2')}
                  className="w-full p-4 rounded-2xl bg-white border-2 border-rose-300 hover:border-rose-500 text-rose-700 font-bold text-base shadow-md flex items-center justify-between"
                >
                  <span>{followUpConfig.option2 || 'Option 2'}</span>
                  <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
                </motion.button>
              </div>
            </motion.div>
          ) : (
            /* STEP 4: Celebration & Acceptance Confirmation */
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

              {/* Date / Love Note Summary */}
              {followUpConfig.note && (
                <div className="text-left bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-6 border border-rose-200 shadow-inner mb-6 relative">
                  <div className="flex items-center space-x-2 text-rose-600 font-bold text-xs uppercase tracking-wider mb-2">
                    <Heart className="w-4 h-4 fill-rose-500" />
                    <span>Secret Letter From Your Special One:</span>
                  </div>
                  <p className="font-handwriting text-xl sm:text-2xl text-gray-800 leading-relaxed whitespace-pre-line">
                    "{followUpConfig.note}"
                  </p>
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
