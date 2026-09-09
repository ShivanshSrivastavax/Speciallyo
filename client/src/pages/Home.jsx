import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Sparkles, Wand2, Music, Eye, Send, QrCode, ArrowRight, ShieldCheck, Smile } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';

const Home = () => {
  const { isAuthenticated } = useAuthStore();
  
  // Interactive demo state on landing page
  const [demoAnswered, setDemoAnswered] = useState(false);
  const [noPos, setNoPos] = useState({ x: 0, y: 0 });
  const [noCount, setNoCount] = useState(0);

  const funnyNoTexts = [
    "No",
    "Are you sure? 🥺",
    "Really sure? 💔",
    "Think again! 😭",
    "Don't break my heart 💔",
    "Last chance! 🎁",
    "You can't say no! 😉",
  ];

  const handleEvadeNo = () => {
    const randomX = (Math.random() - 0.5) * 220;
    const randomY = (Math.random() - 0.5) * 160;
    setNoPos({ x: randomX, y: randomY });
    setNoCount((prev) => prev + 1);
  };

  return (
    <div className="relative overflow-hidden pb-20">
      {/* Hero Section */}
      <section className="pt-12 md:pt-20 px-4 max-w-6xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-rose-100 text-rose-700 text-xs sm:text-sm font-semibold mb-6 border border-rose-200/80 shadow-xs"
        >
          <Sparkles className="w-4 h-4 text-rose-500 animate-spin" style={{ animationDuration: '6s' }} />
          <span>The #1 Interactive Proposal & Valentine Builder</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-gray-900 tracking-tight font-heading leading-tight max-w-4xl mx-auto"
        >
          Make them smile, laugh, and say{' '}
          <span className="bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 bg-clip-text text-transparent underline decoration-rose-300 decoration-wavy decoration-2">
            YES!
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto font-light leading-relaxed"
        >
          Create gorgeous, interactive proposal pages with playful physics (a "No" button that playfully runs away!), cute GIFs, Spotify music, secret love letters, and instant response tracking.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            to={isAuthenticated ? "/create" : "/register"}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 text-white font-bold text-lg shadow-lg shadow-rose-500/30 hover:shadow-xl hover:shadow-rose-500/45 transform hover:-translate-y-1 transition-all flex items-center justify-center space-x-3 group"
          >
            <span>Create Your Proposal</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>

          <a
            href="#live-demo"
            className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white/80 backdrop-blur-md text-gray-700 font-semibold text-lg border border-rose-200 hover:bg-rose-50 hover:text-rose-600 transition-all shadow-xs flex items-center justify-center space-x-2"
          >
            <Smile className="w-5 h-5 text-rose-500" />
            <span>Try Interactive Demo</span>
          </a>
        </motion.div>

        {/* Live Interactive Proposal Demo Card */}
        <motion.div
          id="live-demo"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-14 max-w-md mx-auto"
        >
          <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-2xl border border-white relative overflow-hidden text-center">
            <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-600 text-[10px] font-bold uppercase tracking-wider">
              Live Preview
            </div>

            {!demoAnswered ? (
              <>
                <div className="w-28 h-28 mx-auto rounded-2xl overflow-hidden shadow-md mb-4 bg-rose-50 border-2 border-rose-200 flex items-center justify-center">
                  <img
                    src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3ZhcXlzc2N1ejZ3ajN6bjA0OGY0MnpsamFpYWZmdXJ6c3F6enFqdiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/c76IJLufpNwSULPk77/giphy.gif"
                    alt="Cute proposal reaction"
                    className="w-full h-full object-cover"
                  />
                </div>

                <h3 className="text-2xl font-bold text-gray-800 font-heading mb-1">
                  Dear Sweetheart ❤️
                </h3>
                <p className="text-lg text-rose-600 font-semibold mb-6">
                  Will you be my Valentine? 💌
                </p>

                {/* Interactive Buttons */}
                <div className="flex items-center justify-center gap-4 relative min-h-[70px]">
                  <button
                    onClick={() => setDemoAnswered(true)}
                    className="px-7 py-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-green-500 hover:from-emerald-500 hover:to-green-600 text-white font-bold text-lg shadow-lg shadow-emerald-500/30 transform hover:scale-110 active:scale-95 transition-all"
                  >
                    YES! 💖
                  </button>

                  <motion.button
                    onMouseEnter={handleEvadeNo}
                    onTouchStart={handleEvadeNo}
                    animate={{ x: noPos.x, y: noPos.y }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    className="px-5 py-3 rounded-2xl bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium text-sm transition-colors cursor-pointer select-none"
                  >
                    {funnyNoTexts[noCount % funnyNoTexts.length]}
                  </motion.button>
                </div>
                <p className="text-xs text-gray-400 mt-4 italic">
                  💡 Hint: Try hovering over the "No" button!
                </p>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-4"
              >
                <div className="w-24 h-24 mx-auto rounded-full bg-rose-100 flex items-center justify-center text-4xl mb-3 animate-bounce">
                  🎉
                </div>
                <h4 className="text-2xl font-bold text-rose-600 font-heading">
                  YAY! Best Decision Ever! 💍
                </h4>
                <p className="text-sm text-gray-600 mt-2">
                  When your special someone clicks YES, they get secret love notes, confetti celebration, and your custom memory gallery!
                </p>
                <button
                  onClick={() => {
                    setDemoAnswered(false);
                    setNoPos({ x: 0, y: 0 });
                    setNoCount(0);
                  }}
                  className="mt-5 text-xs font-semibold text-rose-500 hover:underline"
                >
                  Try demo again
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="mt-28 px-4 max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 font-heading">
            Everything you need for an unforgettable moment
          </h2>
          <p className="text-gray-600 mt-3 max-w-xl mx-auto">
            Packed with romantic touches, modern physics, and delightful micro-interactions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="glass-card rounded-3xl p-8 border border-white/80 hover:-translate-y-1.5 transition-transform duration-300">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-6">
              <Wand2 className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 font-heading mb-2">
              Playful Button Physics
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Choose from hilarious button modes like "Evader" (runs away on cursor hover), "Shrinking No", or "Growing Yes" that guarantee a YES!
            </p>
          </div>

          {/* Feature 2 */}
          <div className="glass-card rounded-3xl p-8 border border-white/80 hover:-translate-y-1.5 transition-transform duration-300">
            <div className="w-14 h-14 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center mb-6">
              <Music className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 font-heading mb-2">
              Spotify & Love Letters
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Attach your favorite couple song via Spotify embed and write a heartfelt secret letter revealed with a sweet typewriter animation.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="glass-card rounded-3xl p-8 border border-white/80 hover:-translate-y-1.5 transition-transform duration-300">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-6">
              <QrCode className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 font-heading mb-2">
              Custom Links & QR Codes
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Generate memorable custom slugs like <code>/p/sarah-valentine</code> and download high-res QR codes ready to print on cards or gifts.
            </p>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="mt-28 px-4 max-w-5xl mx-auto text-center relative z-10">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 font-heading mb-14">
          How it works in 3 easy steps
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 border border-rose-100 shadow-sm text-left">
            <div className="w-10 h-10 rounded-full bg-rose-500 text-white font-bold flex items-center justify-center mb-4">
              1
            </div>
            <h4 className="text-lg font-bold text-gray-800 mb-1">Customize Your Page</h4>
            <p className="text-gray-600 text-sm">
              Enter their name, write your custom question, choose a cute reaction GIF, and pick button animations.
            </p>
          </div>

          <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 border border-rose-100 shadow-sm text-left">
            <div className="w-10 h-10 rounded-full bg-pink-500 text-white font-bold flex items-center justify-center mb-4">
              2
            </div>
            <h4 className="text-lg font-bold text-gray-800 mb-1">Share the Magic Link</h4>
            <p className="text-gray-600 text-sm">
              Send the private link via WhatsApp, Instagram, or print a romantic QR code on a card.
            </p>
          </div>

          <div className="bg-white/70 backdrop-blur-md rounded-3xl p-6 border border-rose-100 shadow-sm text-left">
            <div className="w-10 h-10 rounded-full bg-rose-600 text-white font-bold flex items-center justify-center mb-4">
              3
            </div>
            <h4 className="text-lg font-bold text-gray-800 mb-1">Get Instant Joy</h4>
            <p className="text-gray-600 text-sm">
              Watch them light up, celebrate with confetti, and track the exact timestamp they said YES!
            </p>
          </div>
        </div>

        {/* Bottom CTA Banner */}
        <div className="mt-20 glass-card rounded-3xl p-8 sm:p-12 text-center border border-white shadow-xl relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-rose-300/30 rounded-full blur-2xl pointer-events-none" />
          <h3 className="text-2xl sm:text-4xl font-bold text-gray-900 font-heading mb-4">
            Ready to make their day unforgettable?
          </h3>
          <p className="text-gray-600 max-w-xl mx-auto mb-8 text-sm sm:text-base">
            Join thousands of happy couples and create your proposal in less than 2 minutes. Free forever.
          </p>
          <Link
            to={isAuthenticated ? "/create" : "/register"}
            className="inline-flex items-center space-x-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-lg shadow-lg shadow-rose-500/30 hover:shadow-xl hover:shadow-rose-500/45 transition-all transform hover:-translate-y-1"
          >
            <Sparkles className="w-5 h-5" />
            <span>Create Proposal Now</span>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
