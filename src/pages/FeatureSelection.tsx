import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Play, Scissors, Sparkles, Video } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// ─── Glow Card Border ─────────────────────────────────────────────────────────

function GlowCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [angle, setAngle] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const deg = Math.atan2(y, x) * (180 / Math.PI) - 70;
    setAngle(deg);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={`relative rounded-2xl ${className}`}
      style={{
        padding: "2px",
        background: isHovering
          ? `conic-gradient(from ${angle}deg, hsl(var(--border)) 0deg, hsl(var(--border)) 100deg, hsl(var(--primary) / 0.275) 160deg, hsl(var(--border)) 220deg, hsl(var(--border)) 360deg)`
          : "hsl(var(--border))",
        transition: "background 0.1s ease",
      }}
    >
      {children}
    </div>
  );
}

// ─── Card 1: Long Video → Viral Shorts Animation ───────────────────────────

function TopicPillsAnimation() {
  const pills = [
    { icon: "✨", text: "AI detects the most engaging moments automatically", bg: "bg-blue-50 dark:bg-blue-950/40", textColor: "text-blue-600 dark:text-blue-400" },
    { icon: "📝", text: "Smart subtitles generated and synced to speech", bg: "bg-violet-50 dark:bg-violet-950/40", textColor: "text-violet-600 dark:text-violet-400" },
    { icon: "🎯", text: "Face tracking + auto layout keeps every clip perfectly framed", bg: "bg-pink-50 dark:bg-pink-950/40", textColor: "text-pink-600 dark:text-pink-400" },
  ];

  return (
    <div className="flex flex-col items-center gap-2 px-2 select-none">
      <div className="w-full space-y-2">
        {pills.map((pill, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.12 + 0.2, duration: 0.4, type: "spring", stiffness: 200 }}
            className={`flex items-center gap-2 px-3 py-2 rounded-full ${pill.bg} border border-border/60`}
          >
            <span className="text-xs shrink-0">{pill.icon}</span>
            <span className={`text-[10px] font-medium ${pill.textColor} truncate`}>
              {pill.text}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Card 2: macOS Terminal Typewriter ─────────────────────────────────────

const LINES = [
  "Did you know AI can now write your videos?",
  "Just paste a script — and watch it come alive.",
  "Voice. Visuals. Subtitles. All automatic.",
];

const CHAR_SPEED = 38;   // ms per character
const LINE_PAUSE = 1000; // ms between lines
const END_PAUSE  = 2200; // ms before reset

function TextToVideoAnimation() {
  const [displayedLines, setDisplayedLines] = useState<string[]>([""]);
  const [cursorLine, setCursorLine] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const runCycle = async () => {
      // Reset
      setDisplayedLines([""]);
      setCursorLine(0);

      for (let li = 0; li < LINES.length; li++) {
        const full = LINES[li];
        // Type character by character
        for (let ci = 1; ci <= full.length; ci++) {
          if (cancelled) return;
          await new Promise(r => setTimeout(r, CHAR_SPEED));
          setDisplayedLines(prev => {
            const next = [...prev];
            next[li] = full.slice(0, ci);
            return next;
          });
        }
        if (cancelled) return;
        // Pause after line finishes
        await new Promise(r => setTimeout(r, LINE_PAUSE));
        if (cancelled) return;
        // Add blank slot for next line (if not last)
        if (li < LINES.length - 1) {
          setDisplayedLines(prev => [...prev, ""]);
          setCursorLine(li + 1);
        }
      }
      // Hold at end then restart
      await new Promise(r => setTimeout(r, END_PAUSE));
      if (!cancelled) runCycle();
    };

    runCycle();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="select-none rounded-xl overflow-hidden border border-border shadow-lg bg-muted/60 dark:bg-[#1e1e20]">
      {/* Title bar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-muted dark:bg-[#2a2a2d] border-b border-border">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        </div>
        <span className="ml-2 text-[9px] font-mono font-semibold text-muted-foreground uppercase tracking-widest">
          script.txt
        </span>
      </div>

      {/* Editor body */}
      <div className="px-3 py-3 font-mono text-[10px] leading-5 space-y-0.5 min-h-[88px]">
        {LINES.map((_, li) => {
          const text = displayedLines[li] ?? "";
          const isActive = li === cursorLine;

          return (
            <div key={li} className="flex items-start gap-3">
              {/* Line number */}
              <span className="shrink-0 w-3 text-right text-muted-foreground/40 select-none tabular-nums mt-[5px]">
                {li + 1}
              </span>
              {/* Line text — all same color/weight */}
              <span className="text-foreground/75 whitespace-pre-wrap break-words py-[2px]">
                {text}
                {isActive && (
                  <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.85, repeat: Infinity, ease: "linear" }}
                    className="inline-block w-[2px] h-[11px] bg-primary align-middle ml-[1px] rounded-sm"
                  />
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function FeatureSelection() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout showFooter={false}>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-14"
          >
            <p className="text-sm text-primary uppercase tracking-widest font-semibold mb-3">
              Choose your tool
            </p>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
              What are you creating
              <span
                className="bg-clip-text text-transparent animate-gradient-shift"
                style={{
                  backgroundImage: "linear-gradient(135deg, #60a5fa, #3b82f6, #1d4ed8, #1e3a8a, #3b82f6, #60a5fa)",
                  backgroundSize: "300% 300%",
                }}
              >
                {" "}today?
              </span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Two powerful AI engines. Pick the one that fits your workflow.
            </p>
          </motion.div>

          {/* Cards */}
          <div className="grid md:grid-cols-2 gap-6 items-stretch">
            {/* Card 1 — YT Shorts Converter */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="group h-full"
            >
              <button
                onClick={() => navigate("/video-management")}
                className="w-full h-full text-left"
              >
                <GlowCard className="h-full">
                <div className="relative h-full rounded-2xl bg-card transition-all duration-300 hover:shadow-xl hover:shadow-gray-500/5 overflow-hidden flex flex-col p-8 group-hover:-translate-y-1">
                  {/* Subtle background glow */}
                  <div className="absolute -top-20 -left-20 w-60 h-60 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors duration-500 pointer-events-none" />

                  {/* Badge */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-blue-500/10 text-blue-500">
                      <Video className="w-3 h-3" />
                      Video Processing
                    </span>
                    <motion.div
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="text-muted-foreground group-hover:text-primary transition-colors"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </motion.div>
                  </div>

                  {/* Animation area */}
                  <div className="mb-5">
                    <TopicPillsAnimation />
                  </div>

                  {/* Inline Pipeline */}
                  <div className="mb-6">
                    <InlinePipeline variant="video-to-shorts" />
                  </div>

                  {/* Label */}
                  <div className="mt-auto">
                    <div className="flex items-end justify-between mb-2">
                      <h2 className="text-2xl font-bold leading-tight">
                        Long Videos to<br />
                        <span className="text-primary">Viral Shorts</span>
                      </h2>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Automatically detect highlights, generate captions, and create ready-to-publish short-form videos.
                    </p>

                    {/* Button aligned to right */}
                    <div className="mt-6 flex justify-end">
                      <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-secondary/50 text-foreground text-sm font-medium border border-border/50 hover:bg-secondary hover:shadow-sm transition-all">
                        Get Started
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
                </GlowCard>
              </button>
            </motion.div>

            {/* Card 2 — Text to Video */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="group h-full"
            >
              <button
                onClick={() => navigate("/text-to-video")}
                className="w-full h-full text-left"
              >
                <GlowCard className="h-full">
                <div className="relative h-full rounded-2xl bg-card transition-all duration-300 hover:shadow-xl hover:shadow-gray-500/5 overflow-hidden flex flex-col p-8 group-hover:-translate-y-1">
                  {/* Subtle background glow */}
                  <div className="absolute -top-20 -right-20 w-60 h-60 bg-violet-500/5 rounded-full blur-3xl group-hover:bg-violet-500/10 transition-colors duration-500 pointer-events-none" />

                  {/* Badge */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-violet-500/10 text-violet-500">
                      <Sparkles className="w-3 h-3" />
                      AI Generation
                    </span>
                    <motion.div
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                      className="text-muted-foreground group-hover:text-primary transition-colors"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </motion.div>
                  </div>

                  {/* Animation area */}
                  <div className="mb-5">
                    <TextToVideoAnimation />
                  </div>

                  {/* Inline Pipeline */}
                  <div className="mb-6">
                    <InlinePipeline />
                  </div>

                  {/* Label */}
                  <div className="mt-auto">
                    <div className="flex items-end justify-between mb-2">
                      <h2 className="text-2xl font-bold leading-tight">
                        Text Scripts to<br />
                        <span className="text-primary">Short Videos</span>
                      </h2>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Schedule a prompt or script — AutoCast writes, voices, and renders a video on the day you choose.
                    </p>

                    {/* Button aligned to right */}
                    <div className="mt-6 flex justify-end">
                      <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-secondary/50 text-foreground text-sm font-medium border border-border/50 hover:bg-secondary hover:shadow-sm transition-all">
                        Get Started
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
                </GlowCard>
              </button>
            </motion.div>
          </div>


        </div>
      </div>
    </Layout>
  );
}

// ─── Inline Pipeline (inside Card 2) ─────────────────────────────────────────

const PIPE_STEPS = ["Voiceover", "Subtitles", "Template"];

const INLINE_SCRIPT_LINES = [
  "Did you know AI can",
  "now write your videos?",
  "Just paste a script...",
];

function InlinePipeline({ variant = "text-to-video" }: { variant?: "text-to-video" | "video-to-shorts" }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [displayedScript, setDisplayedScript] = useState<string[]>([""]);

  useEffect(() => {
    const id = setInterval(() => setActiveIdx(i => (i + 1) % PIPE_STEPS.length), 2500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const runCycle = async () => {
      for (let li = 0; li < INLINE_SCRIPT_LINES.length; li++) {
        const full = INLINE_SCRIPT_LINES[li];
        // Type the line character by character
        for (let ci = 1; ci <= full.length; ci++) {
          if (cancelled) return;
          await new Promise(r => setTimeout(r, 40));
          setDisplayedScript([full.slice(0, ci)]);
        }
        if (cancelled) return;
        // Pause after typing completes
        await new Promise(r => setTimeout(r, 1200));
        if (cancelled) return;
        // Clear the line
        setDisplayedScript([""]);
        await new Promise(r => setTimeout(r, 400));
        if (cancelled) return;
      }
      // Pause before restarting cycle
      await new Promise(r => setTimeout(r, 1000));
      if (!cancelled) runCycle();
    };
    runCycle();
    return () => { cancelled = true; };
  }, []);

  const stepColors = [
    "text-blue-400 bg-blue-500/10 border-blue-500/30",
    "text-violet-400 bg-violet-500/10 border-violet-500/30",
    "text-pink-400 bg-pink-500/10 border-pink-500/30",
  ];

  return (
    <div className="rounded-xl border border-border bg-card/50 backdrop-blur-sm overflow-hidden shadow-lg">
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/30">
        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Transformation</span>
        <div className="flex items-center gap-1.5">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1 h-1 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.5)]"
          />
          <span className="text-[9px] font-medium text-muted-foreground">Live</span>
        </div>
      </div>

      {/* Pipeline content */}
      {variant === "text-to-video" ? (
        <div className="flex items-center justify-between gap-4 px-3 py-3">

          {/* Left: Script Box */}
          <div className="shrink-0">
            <div className="flex flex-col items-center gap-2 p-2 rounded-lg bg-muted/50 border border-border w-[120px] h-24">
              {/* Icon + heading row */}
              <div className="flex items-center gap-2 w-full">
                {/* Icon box */}
                <div className="shrink-0 w-8 h-8 rounded-lg bg-card flex items-center justify-center shadow-sm border border-border">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <line x1="10" y1="9" x2="8" y2="9" />
                  </svg>
                </div>
                {/* Script heading */}
                <p className="text-[8px] font-mono font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">Script</p>
              </div>

              {/* Lines content below */}
              <div className="font-mono text-[9px] text-foreground leading-tight">
                <div className="flex items-center justify-center relative py-0">
                  <span className="whitespace-pre-wrap break-words">{displayedScript[0] ?? ""}</span>
                  <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="inline-block w-[1px] h-[8px] bg-primary ml-[0.5px] shrink-0"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Middle: Spinning gear + active step label */}
          <div className="flex flex-col items-center gap-1 shrink-0">
            <div className="relative w-9 h-9">
              {/* Dashed spinning ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border border-dashed border-primary/30"
              />
              {/* Inner solid ring */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
                className="absolute inset-1 rounded-full border border-primary/20"
              />
              {/* Center icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-5 h-5 rounded-full bg-muted border border-border flex items-center justify-center">
                  <Sparkles className="w-2.5 h-2.5 text-primary" />
                </div>
              </div>
            </div>

            {/* Static Subtitles badge */}
            <span className="text-[8px] font-semibold px-1.5 py-0.5 rounded-full border text-violet-400 bg-violet-500/10 border-violet-500/30">
              Subtitles
            </span>
          </div>

          {/* Right: Phone output */}
          <div className="shrink-0">
            <div className="relative w-10 h-16 rounded-lg border border-border bg-card overflow-hidden shadow-sm flex flex-col">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-1 bg-border rounded-b-full z-10" />
              <div className="flex-1 bg-gradient-to-b from-primary/20 via-primary/10 to-primary/5 relative overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  animate={{ opacity: [0, 1, 1, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, times: [0, 0.2, 0.8, 1] }}
                  className="absolute bottom-2 inset-x-0.5 bg-black/70 rounded px-0.5 py-0.5 text-[4px] text-white font-bold text-center leading-tight"
                >
                  READY
                </motion.div>
                <div className="absolute top-1 left-0.5 flex items-center gap-0.5 bg-green-500/90 rounded px-0.5 py-0">
                  <div className="w-0.5 h-0.5 rounded-full bg-white animate-pulse" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                    className="w-3 h-3 rounded-full bg-primary flex items-center justify-center"
                  >
                    <Play className="w-1.5 h-1.5 text-white fill-white ml-0.5" />
                  </motion.div>
                </div>
              </div>
              <div className="h-2 bg-muted flex items-center justify-center">
                <div className="w-2 h-0.5 rounded-full bg-white/20" />
              </div>
            </div>
          </div>

        </div>
      ) : (
        <div className="flex items-center justify-between gap-4 px-3 py-3">

          {/* Left: Landscape video thumbnail */}
          <div className="shrink-0">
            <div className="relative w-[120px] h-[68px] rounded-xl overflow-hidden shadow-lg border border-border">
              {/* Sunset / forest gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-600 via-orange-500 to-emerald-900" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              {/* Silhouette trees line */}
              <div className="absolute bottom-0 inset-x-0 h-4 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                  className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center"
                >
                  <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                </motion.div>
              </div>
              {/* Shimmer */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
              />
            </div>
          </div>

          {/* Middle: AI Animation orb */}
          <div className="flex flex-col items-center gap-1 shrink-0">
            <div className="relative w-14 h-14 rounded-full overflow-hidden border border-border shadow-md bg-muted">
              <video
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
                src="/AIAnimation.mp4"
              />
            </div>
            <span className="text-[8px] font-semibold px-1.5 py-0.5 rounded-full border text-blue-400 bg-blue-500/10 border-blue-500/30">
              AI Process
            </span>
          </div>

          {/* Right: Stacked short clips */}
          <div className="shrink-0">
            <div className="flex items-center gap-1">
              {[
                { offset: "0px", opacity: 1, scale: 1, z: 30, bg: "bg-gray-400" },
                { offset: "-8px", opacity: 0.85, scale: 0.95, z: 20, bg: "bg-gray-300" },
                { offset: "-16px", opacity: 0.7, scale: 0.9, z: 10, bg: "bg-gray-200" },
              ].map((card, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: card.opacity, y: 0 }}
                  transition={{ delay: i * 0.15 + 0.3, duration: 0.4 }}
                  className={`relative w-8 h-14 rounded-lg ${card.bg} border border-border/50 shadow-sm`}
                  style={{ marginLeft: i > 0 ? card.offset : "0px", zIndex: card.z }}
                />
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Footer label */}
      <div className="px-3 pb-1.5 text-[8px] text-muted-foreground text-right font-mono">FINAL · MP4</div>
    </div>
  );
}

// ─── Pipeline Arrow ──────────────────────────────────────────────────────────


function PipelineArrow() {
  return (
    <motion.div
      animate={{ x: [0, 5, 0] }}
      transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      className="flex flex-col items-center gap-1"
    >
      <div className="h-[2px] w-8 bg-gradient-to-r from-border via-primary/50 to-border rounded-full" />
      <ArrowRight className="w-4 h-4 text-primary/60" />
    </motion.div>
  );
}

// ─── Panel 1: Script Input ────────────────────────────────────────────────────

const SCRIPT_LINES = [
  "Enter your script here...",
  "Or let AI write one for you.",
  "Just drop in a prompt — done.",
];
const SCRIPT_CHAR_SPEED = 42;
const SCRIPT_LINE_PAUSE = 1100;
const SCRIPT_END_PAUSE  = 2000;

function ScriptInputPanel() {
  const [displayedLines, setDisplayedLines] = useState<string[]>([""]);
  const [cursorLine, setCursorLine] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const runCycle = async () => {
      setDisplayedLines([""]);
      setCursorLine(0);
      for (let li = 0; li < SCRIPT_LINES.length; li++) {
        const full = SCRIPT_LINES[li];
        for (let ci = 1; ci <= full.length; ci++) {
          if (cancelled) return;
          await new Promise(r => setTimeout(r, SCRIPT_CHAR_SPEED));
          setDisplayedLines(prev => { const n = [...prev]; n[li] = full.slice(0, ci); return n; });
        }
        if (cancelled) return;
        await new Promise(r => setTimeout(r, SCRIPT_LINE_PAUSE));
        if (cancelled) return;
        if (li < SCRIPT_LINES.length - 1) { setDisplayedLines(prev => [...prev, ""]); setCursorLine(li + 1); }
      }
      await new Promise(r => setTimeout(r, SCRIPT_END_PAUSE));
      if (!cancelled) runCycle();
    };
    runCycle();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="flex-1 flex flex-col">
      {/* Mini macOS window */}
      <div className="rounded-xl overflow-hidden border border-border bg-muted/50 dark:bg-[#1e1e20] flex-1">
        <div className="flex items-center gap-1.5 px-3 py-2 bg-muted dark:bg-[#2a2a2d] border-b border-border">
          <div className="w-2 h-2 rounded-full bg-[#ff5f57]" />
          <div className="w-2 h-2 rounded-full bg-[#febc2e]" />
          <div className="w-2 h-2 rounded-full bg-[#28c840]" />
          <span className="ml-2 text-[9px] font-mono font-semibold text-muted-foreground uppercase tracking-widest">script.txt</span>
        </div>
        <div className="px-3 py-3 space-y-0.5 font-mono text-[10px] leading-5 min-h-[88px]">
          {SCRIPT_LINES.map((_, li) => {
            const text = displayedLines[li] ?? "";
            const isActive = li === cursorLine;
            return (
              <div key={li} className="flex items-start gap-2">
                <span className="shrink-0 w-3 text-right text-muted-foreground/40 tabular-nums mt-[5px]">{li + 1}</span>
                <span className="text-foreground/75 whitespace-pre-wrap break-words py-[2px]">
                  {text}
                  {isActive && (
                    <motion.span
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 0.85, repeat: Infinity, ease: "linear" }}
                      className="inline-block w-[2px] h-[10px] bg-primary align-middle ml-[1px] rounded-sm"
                    />
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground mt-2 text-center leading-relaxed">
        Paste a script or describe what you want
      </p>
    </div>
  );
}

// ─── Panel 2: Processing Steps ───────────────────────────────────────────────

const PROCESSING_STEPS = [
  {
    id: "voiceover",
    label: "Voiceover",
    icon: "🎙️",
    color: "bg-blue-500/10 border-blue-500/30 text-blue-500",
    desc: "AI selects the best voice and reads your script with natural tone.",
    bars: [0.4, 0.7, 0.5, 0.9, 0.6, 0.8, 0.4, 0.65, 0.75, 0.5],
  },
  {
    id: "subtitles",
    label: "Subtitles",
    icon: "💬",
    color: "bg-violet-500/10 border-violet-500/30 text-violet-500",
    desc: "Word-level captions generated and synced automatically.",
    bars: null,
  },
  {
    id: "template",
    label: "Video Template",
    icon: "🎬",
    color: "bg-pink-500/10 border-pink-500/30 text-pink-500",
    desc: "Pick a visual style — scenes, transitions and b-roll handled by AI.",
    bars: null,
  },
];

function ProcessingPanel() {
  const [activeStep, setActiveStep] = useState(0);

  // Auto-cycle tabs
  useEffect(() => {
    const id = setInterval(() => setActiveStep(s => (s + 1) % PROCESSING_STEPS.length), 2800);
    return () => clearInterval(id);
  }, []);

  const step = PROCESSING_STEPS[activeStep];

  return (
    <div className="flex-1 flex flex-col gap-3">
      {/* Tab pills */}
      <div className="flex gap-1.5 flex-wrap">
        {PROCESSING_STEPS.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setActiveStep(i)}
            className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border transition-all duration-300 ${
              i === activeStep ? s.color : "border-border text-muted-foreground hover:border-primary/30"
            }`}
          >
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      {/* Step content */}
      <div className="flex-1 relative overflow-hidden min-h-[100px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex flex-col gap-3"
          >
            {/* Voiceover waveform */}
            {activeStep === 0 && (
              <div className="flex items-end gap-[3px] h-12 px-1">
                {step.bars!.map((h, i) => (
                  <motion.div
                    key={i}
                    className="flex-1 rounded-full bg-blue-400"
                    animate={{ scaleY: [h, h * 0.5 + 0.2, h, h * 0.7 + 0.1, h] }}
                    transition={{ duration: 1.2 + i * 0.07, repeat: Infinity, ease: "easeInOut" }}
                    style={{ originY: 1, height: "100%" }}
                  />
                ))}
              </div>
            )}

            {/* Subtitles demo */}
            {activeStep === 1 && (
              <div className="space-y-1.5 px-1">
                {["Just", "paste a script", "and watch it", "come alive."].map((word, i) => (
                  <motion.div
                    key={word}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.18 }}
                    className="flex items-center gap-2"
                  >
                    <div className="text-[9px] tabular-nums text-muted-foreground/50 w-8 shrink-0">0:{String(i * 12).padStart(2, "0")}</div>
                    <div className={`px-2 py-0.5 rounded text-[10px] font-medium ${i % 2 === 0 ? "bg-violet-500/15 text-violet-500" : "bg-muted text-foreground/70"}`}>
                      {word}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Template picker */}
            {activeStep === 2 && (
              <div className="flex gap-2 items-center">
                {["🌆", "🎭", "🌿"].map((emoji, i) => (
                  <motion.div
                    key={emoji}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: i === 1 ? 1.08 : 1 }}
                    transition={{ delay: i * 0.1 }}
                    className={`flex-1 h-16 rounded-xl flex flex-col items-center justify-center gap-1 border-2 transition-all ${
                      i === 1 ? "border-pink-500 bg-pink-500/10" : "border-border bg-muted/40"
                    }`}
                  >
                    <span className="text-xl">{emoji}</span>
                    {i === 1 && (
                      <div className="w-3 h-3 rounded-full bg-pink-500 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" className="w-2 h-2 text-white" fill="none">
                          <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}

            <p className="text-[10px] text-muted-foreground leading-relaxed mt-auto">{step.desc}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Panel 3: Output Video ────────────────────────────────────────────────────

function OutputVideoPanel() {
  return (
    <div className="flex-1 flex flex-col items-center gap-3">
      {/* Phone frame */}
      <div className="relative mx-auto w-[90px] h-[160px] rounded-2xl border-[3px] border-border bg-black overflow-hidden shadow-xl flex flex-col">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-2 bg-border/80 rounded-b-full z-10" />
        {/* Video bg gradient */}
        <div className="flex-1 bg-gradient-to-b from-[#1a1a2e] via-[#16213e] to-[#0f3460] relative overflow-hidden">
          {/* Animated shimmer sweep */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
          {/* Fake caption bar */}
          <motion.div
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{ duration: 3, repeat: Infinity, times: [0, 0.2, 0.8, 1] }}
            className="absolute bottom-6 inset-x-2 bg-black/70 rounded px-1.5 py-0.5 text-[7px] text-white font-bold text-center"
          >
            Watch it come alive.
          </motion.div>
          {/* Ready badge */}
          <div className="absolute top-4 left-1.5 flex items-center gap-0.5 bg-green-500/90 rounded px-1 py-0.5">
            <div className="w-1 h-1 rounded-full bg-white animate-pulse" />
            <span className="text-[6px] text-white font-bold uppercase">Ready</span>
          </div>
          {/* Play button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.12, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-8 h-8 rounded-full bg-primary/90 flex items-center justify-center shadow-lg shadow-primary/40"
            >
              <Play className="w-3.5 h-3.5 text-white fill-white ml-0.5" />
            </motion.div>
          </div>
        </div>
        {/* Bottom bar */}
        <div className="h-5 bg-[#111] flex items-center justify-center">
          <div className="w-8 h-1 rounded-full bg-white/20" />
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
        Ready-to-publish short.<br />Download or schedule instantly.
      </p>
    </div>
  );
}

