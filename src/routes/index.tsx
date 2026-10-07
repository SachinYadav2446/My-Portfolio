import { createFileRoute } from '@tanstack/react-router';
import { ArrowDown, ArrowUp, ArrowUpRight, Atom, BookOpen, Bookmark, Check, ChevronLeft, ChevronRight, Compass, Copy, Cpu, Database, Feather, FlaskConical, Keyboard, Layers, Mail, Orbit, ShieldCheck, Sparkles, Terminal } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";


import sachinPortrait from "@/assets/sachin-final-portrait.png";
import signature from "@/assets/signature.png";
import beyondCodePortrait from "@/assets/beyond-code-portrait.jpg";
import voxieShot from "@/assets/project-voxie.webp";
import rexShot from "@/assets/project-rex.webp";
import screenmeshShot from "@/assets/project-screenmesh.webp";
import clinaraShot from "@/assets/project-clinara.webp";
import jaldrishtiShot from "@/assets/project-jaldrishti.jpg";
import javaBasicsShot from "@/assets/project-java-basics.png";
import jsBasicsShot from "@/assets/project-js-basics.png";
import laptop from "@/assets/rabbit-hole/laptop.webp";
import earth from "@/assets/rabbit-hole/earth.webp";
import sparkles from "@/assets/rabbit-hole/sparkles.webp";
import brain from "@/assets/obj3d-brain.webp";
import globe from "@/assets/obj3d-globe.webp";
import code from "@/assets/rabbit-hole/code.webp";
import console_ from "@/assets/rabbit-hole/console.webp";
import { CLIMBED_OUT, takeFlag } from "@/components/rabbit-hole";
import { Button } from "@/components/ui/button";
import { jsonLd, pageMeta, person, SITE_URL } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { SplashScreen } from "@/components/splash-screen";

export const Route = createFileRoute("/")({
  head: () => ({
    ...pageMeta({
      title: "Sachin Yadav (Binary Sphere) — Software Developer & AI/ML Enthusiast",
      description:
        "Sachin Yadav (Binary Sphere) is a Computer Science Engineering student passionate about AI/ML, full-stack development, and building intelligent systems. Projects: Bright Code, Cyclone Pattern Identifier, Demand Forecast, Creatify.",
      path: "/",
    }),
    scripts: [
      jsonLd({
        "@graph": [
          person,
          { "@type": "WebSite", "@id": `${SITE_URL}/#website`, url: SITE_URL, name: "Sachin Yadav", publisher: { "@id": `${SITE_URL}/#person` } },
          { "@type": "ProfilePage", url: SITE_URL, name: "Sachin Yadav (Binary Sphere) — the anatomy of a curious developer", mainEntity: { "@id": `${SITE_URL}/#person` } },
        ],
      }),
    ],
  }),
  component: Portfolio,
});

const EMAIL = "yadavsachin123411@gmail.com";
const LINKS = {
  linkedin: "https://www.linkedin.com/in/sachin-yadav-735444434/",
  github: "https://github.com/SachinYadav2446",
  x: "https://x.com/BINARYSPHERE45",
  leetcode: "https://leetcode.com/u/Binary-Sphere/",
};

// The cursor's comment bubble stays quiet until something has a reason to
// speak: a moment in the story, or hovering something that has a comment.
type CursorComment = { id: string; text: string; fade: boolean; variant?: string | undefined; tag?: string | undefined };
// Only one bubble speaks at a time: "figure-open" tells every other bubble
// (objects, the cutout, the cursor/phone comment) to go quiet.
const quietOthers = (id: number) => window.dispatchEvent(new CustomEvent<number>("figure-open", { detail: id }));
const say = (id: string, text: string, fade = true) => {
  quietOthers(-1);
  window.dispatchEvent(new CustomEvent<CursorComment>("cursor-comment", { detail: { id, text, fade } }));
};


// The story canvas is CANVAS_VW wide and slides CANVAS_TRAVEL_VW across the
// scroll. Everything on it is placed in vw/vh, and the SVG uses a viewBox of
// (CANVAS_VW * 10) x 1000, so one vw is 10 units and one vh is 10 units.
const CANVAS_VW = 400;
const CANVAS_TRAVEL_VW = 300;

// Place something on the canvas by its vw/vh coordinates.
const at = (x: number, y: number) => ({ left: `${x}vw`, top: `${y}vh` });

// A waypoint for the thread, in vw/vh. `loop` ties a little loop-de-loop at
// that point (radius in vh; negative loops downward).
type Waypoint = [x: number, y: number, loop?: number];

// Horizontal units are ~1.8x wider on screen than vertical ones, so loops are
// narrowed to stay round rather than squashed.
const LOOP_ASPECT = 1.8;

// Where the thread finally ends: at the explore identity button at the downside of the screen.
const BUTTON_X = 377;
const BUTTON_Y = 88;

// The thread is a Catmull-Rom curve through the waypoints (plus the extra
// points each loop adds), written out as cubic Béziers in viewBox units.
type Segment = [x0: number, y0: number, c1x: number, c1y: number, c2x: number, c2y: number, x1: number, y1: number];

// `scale` maps waypoint units to path units (vw/vh → viewBox is 10; pixels
// are 1), and `aspect` squeezes loops to stay round on a stretched canvas.
function threadSegments(waypoints: Waypoint[], scale = 10, aspect = LOOP_ASPECT): Segment[] {
  const pts: [number, number][] = [];
  for (const [wx, wy, loop] of waypoints) {
    const x = wx * scale;
    const y = wy * scale;
    pts.push([x, y]);
    if (loop) {
      const r = loop * scale;
      const rx = Math.abs(r) / aspect;
      pts.push([x + rx, y - r], [x, y - 2 * r], [x - rx, y - r], [x + rx * 0.5, y + r * 0.15]);
    }
  }
  const segments: Segment[] = [];
  for (let i = 0; i < pts.length - 1; i += 1) {
    const p0 = pts[i - 1] ?? pts[i]!;
    const p1 = pts[i]!;
    const p2 = pts[i + 1]!;
    const p3 = pts[i + 2] ?? p2;
    segments.push([p1[0], p1[1], p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6, p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1]]);
  }
  return segments;
}

function threadPath(waypoints: Waypoint[]) {
  return segmentsPath(threadSegments(waypoints));
}

function segmentsPath(segments: Segment[]) {
  const f = (n: number) => n.toFixed(1);
  let d = `M${segments[0]?.[0] ?? 0} ${segments[0]?.[1] ?? 0}`;
  for (const [, , c1x, c1y, c2x, c2y, x1, y1] of segments) d += ` C${f(c1x)} ${f(c1y)} ${f(c2x)} ${f(c2y)} ${f(x1)} ${f(y1)}`;
  return d;
}

// Points along the thread, evaluated straight from the Bézier maths, with the
// running arc length at each one. This replaces thousands of browser
// getPointAtLength calls, which froze the page for seconds on load.
type ThreadSamples = { xs: Float32Array; ys: Float32Array; lengths: Float32Array; total: number };

function sampleSegments(segments: Segment[], perSegment = 48): ThreadSamples {
  const n = segments.length * perSegment + 1;
  const xs = new Float32Array(n);
  const ys = new Float32Array(n);
  const lengths = new Float32Array(n);
  let k = 0;
  let total = 0;
  segments.forEach(([x0, y0, c1x, c1y, c2x, c2y, x1, y1], index) => {
    for (let step = index === 0 ? 0 : 1; step <= perSegment; step += 1) {
      const t = step / perSegment;
      const u = 1 - t;
      const x = u * u * u * x0 + 3 * u * u * t * c1x + 3 * u * t * t * c2x + t * t * t * x1;
      const y = u * u * u * y0 + 3 * u * u * t * c1y + 3 * u * t * t * c2y + t * t * t * y1;
      if (k > 0) total += Math.hypot(x - xs[k - 1]!, y - ys[k - 1]!);
      xs[k] = x;
      ys[k] = y;
      lengths[k] = total;
      k += 1;
    }
  });
  return { xs, ys, lengths, total };
}

// The thread leaves the tangle and loops wildly between the rabbit holes,
// smooths out through the few things that have my heart, runs straight along
// the timeline, and simply stops before the work.
const THREAD_WAYPOINTS: Waypoint[] = [
  [62, 49.5], [76, 49.5], [88, 44], [102, 38, 8],
  [114, 46], [124, 52],
  [136, 55.5], [148, 46],
  [160, 43.5], [172, 52],
  [184, 55.5], [196, 46],
  [208, 43.5], [220, 52],
  [232, 55.5], [244, 46],
  [265, 52],
  [290, 55], [318, 48, 6], [348, 65],
  [BUTTON_X, BUTTON_Y],
];
const THREAD = threadPath(THREAD_WAYPOINTS);

// Sampled once, the first time anything needs points along the thread.
let threadSamples: ThreadSamples | null = null;
const getThreadSamples = () => (threadSamples ??= sampleSegments(threadSegments(THREAD_WAYPOINTS)));

type Subscribe = (listen: (progress: number) => void) => () => void;

function ParallaxEnvironment({ subscribe }: { subscribe: Subscribe }) {
  const deepGridRef = useRef<HTMLDivElement>(null);
  const midLayerRef = useRef<HTMLDivElement>(null);
  const dustLayerRef = useRef<HTMLDivElement>(null);
  const warpGlowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return subscribe((progress) => {
      // Parallax speeds:
      // Deep layer moves at ~160vw total
      if (deepGridRef.current) {
        deepGridRef.current.style.transform = `translate3d(-${progress * 160}vw, 0, 0)`;
      }
      // Midground tech elements move at ~300vw total
      if (midLayerRef.current) {
        midLayerRef.current.style.transform = `translate3d(-${progress * 300}vw, 0, 0)`;
      }
      // Dust particles drift forward fast at ~580vw total
      if (dustLayerRef.current) {
        dustLayerRef.current.style.transform = `translate3d(-${progress * 580}vw, 0, 0)`;
      }
      // Warp portal glow fades in as we leave signature and peaks around progress 0.08-0.22
      if (warpGlowRef.current) {
        const factor = Math.max(0, 1 - Math.abs(progress - 0.14) / 0.14);
        warpGlowRef.current.style.opacity = `${factor * 0.9}`;
      }
    });
  }, [subscribe]);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Layer 1: Deep slow-moving cyber grid & ambient cosmic nebulae */}
      <div
        ref={deepGridRef}
        className="absolute inset-y-0 left-0 will-change-transform"
        style={{ width: "300vw" }}
      >
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.035] dark:opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(circle, currentColor 1px, transparent 1px), linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "60px 60px, 120px 120px, 120px 120px",
          }}
        />
        {/* Atmospheric monochrome ambient pools that drift in the background */}
        <div className="absolute left-[70vw] top-[20vh] h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/[0.025] blur-[140px]" />
        <div className="absolute left-[130vw] top-[60vh] h-[550px] w-[550px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/[0.02] blur-[130px]" />
        <div className="absolute left-[200vw] top-[30vh] h-[650px] w-[650px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground/[0.03] blur-[150px]" />
      </div>

      {/* Layer 2: Dimensional Warp Portal (illuminates at the transition between signature & realm) */}
      <div
        ref={warpGlowRef}
        className="absolute inset-y-0 left-[35vw] w-[80vw] will-change-transform opacity-0 transition-opacity duration-300"
      >
        {/* Vertical dimensional energy slit & radial bloom */}
        <div className="absolute left-1/2 top-1/2 h-[90vh] w-[40vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-foreground/[0.03] via-foreground/[0.06] to-foreground/[0.03] blur-[80px]" />
        {/* Speed lines / light rays */}
        <div className="absolute inset-0 flex items-center justify-around opacity-15">
          <div className="h-full w-px bg-gradient-to-b from-transparent via-foreground/30 to-transparent" />
          <div className="h-3/4 w-px bg-gradient-to-b from-transparent via-foreground/20 to-transparent" />
          <div className="h-full w-px bg-gradient-to-b from-transparent via-foreground/30 to-transparent" />
        </div>
      </div>

      {/* Layer 3: Midground tech glyphs & data markers drifting */}
      <div
        ref={midLayerRef}
        className="absolute inset-y-0 left-0 will-change-transform font-mono text-[11px] tracking-widest text-muted-foreground/35 select-none"
        style={{ width: "380vw" }}
      >
        <span className="absolute left-[82vw] top-[24vh]">// SYS_INITIALIZE</span>
        <span className="absolute left-[96vw] top-[74vh]">01000010 01010011</span>
        <span className="absolute left-[118vw] top-[14vh]">✦ [MATRIX_LOADED]</span>
        <span className="absolute left-[142vw] top-[82vh]">&#123; mode: &apos;autonomous&apos; &#125;</span>
        <span className="absolute left-[175vw] top-[26vh]">// NEURAL_LAYER_v2</span>
        <span className="absolute left-[215vw] top-[76vh]">VECTOR_SPACE [DIM: 1536]</span>
        <span className="absolute left-[255vw] top-[18vh]">01100011 01101111</span>
        <span className="absolute left-[310vw] top-[80vh]">// PRODUCTION_READY</span>
      </div>

      {/* Layer 4: Fast-moving star particles */}
      <div
        ref={dustLayerRef}
        className="absolute inset-y-0 left-0 will-change-transform"
        style={{ width: "560vw" }}
      >
        {[
          { x: "75vw", y: "30vh", s: "h-1 w-1 bg-foreground/30" },
          { x: "88vw", y: "65vh", s: "h-1.5 w-1.5 bg-foreground/40" },
          { x: "105vw", y: "20vh", s: "h-1 w-1 bg-foreground/35" },
          { x: "125vw", y: "78vh", s: "h-1.5 w-1.5 bg-foreground/25" },
          { x: "155vw", y: "35vh", s: "h-1 w-1 bg-foreground/35" },
          { x: "190vw", y: "60vh", s: "h-1.5 w-1.5 bg-foreground/30" },
          { x: "230vw", y: "25vh", s: "h-1 w-1 bg-foreground/45" },
          { x: "280vw", y: "70vh", s: "h-1.5 w-1.5 bg-foreground/35" },
          { x: "340vw", y: "40vh", s: "h-1 w-1 bg-foreground/40" },
        ].map((pt, i) => (
          <span
            key={i}
            className={cn("absolute rounded-full shadow-[0_0_6px_currentColor]", pt.s)}
            style={{ left: pt.x, top: pt.y }}
          />
        ))}
      </div>
    </div>
  );
}

function Portfolio() {
  const storyRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const listeners = useRef(new Set<(progress: number) => void>());
  const [showSplash, setShowSplash] = useState(true);
  const [noteRevealed, setNoteRevealed] = useState(false);
  const [scrollReady, setScrollReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  // The header floats over the story, but gets the page colour from the work
  // section on, so the links don't sit on top of project images.
  const [solidHeader, setSolidHeader] = useState(false);
  useEffect(() => {
    const check = () => {
      const work = document.getElementById("work");
      if (work) setSolidHeader(window.scrollY >= work.offsetTop - 80);
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, []);
  // First the mind arrives, then its note, and only then does scrolling take over.
  useEffect(() => {
    const root = document.documentElement;
    // Climbing back out of the rabbit hole lands straight on the identity section, no intro.
    if (takeFlag(CLIMBED_OUT) || window.location.hash === "#work" || window.location.hash === "#identity") {
      setShowSplash(false);
      setNoteRevealed(true);
      setScrollReady(true);
      requestAnimationFrame(() => (document.getElementById("identity") || document.getElementById("work"))?.scrollIntoView({ behavior: "instant" }));
      return;
    }

    // Always show splash on every visit/refresh
    root.style.overflow = "hidden";
    window.scrollTo(0, 0);
  }, []);

  // Handle splash screen completion
  const handleSplashComplete = () => {
    setShowSplash(false);
    
    const root = document.documentElement;
    let greet = 0;
    const unlock = () => {
      root.style.overflow = "";
      setNoteRevealed(true);
      setScrollReady(true);
      window.clearTimeout(greet);
      greet = window.setTimeout(() => say("intro", "hey there, sachin here."), 800);
    };
    
    // Unlock after splash completes
    setTimeout(unlock, 300);
  };

  // Original intro logic - now only runs after splash
  useEffect(() => {
    if (showSplash) return;

    const root = document.documentElement;
    let greet = 0;
    const unlock = () => {
      root.style.overflow = "";
      setNoteRevealed(true);
      setScrollReady(true);
      window.clearTimeout(greet);
      greet = window.setTimeout(() => say("intro", "hey there, sachin here."), 1800);
      window.clearTimeout(noteTimer);
      window.clearTimeout(unlockTimer);
      skipEvents.forEach((name) => window.removeEventListener(name, unlock));
    };
    const noteTimer = window.setTimeout(() => setNoteRevealed(true), 2200);
    const unlockTimer = window.setTimeout(unlock, 2600);
    // Anyone who tries to scroll early skips the rest of the intro.
    const skipEvents = ["wheel", "touchmove", "keydown"] as const;
    skipEvents.forEach((name) => window.addEventListener(name, unlock, { passive: true }));
    return () => {
      window.clearTimeout(greet);
      window.clearTimeout(noteTimer);
      window.clearTimeout(unlockTimer);
      skipEvents.forEach((name) => window.removeEventListener(name, unlock));
      root.style.overflow = "";
    };
  }, [showSplash]);

  // One animation-frame loop runs the whole story. It eases toward the scroll
  // position, so wheel steps become a glide, and then moves the canvas, draws
  // the thread and reveals whatever the thread has reached — all directly on
  // the DOM, without asking React to re-render the page every frame.
  useEffect(() => {
    let frame = 0;
    let current = -1;
    const spoken = new Set<string>();
    const tick = () => {
      const section = storyRef.current;
      const canvas = canvasRef.current;
      if (section) {
        const distance = section.offsetHeight - window.innerHeight;
        const target = Math.min(1, Math.max(0, (window.scrollY - section.offsetTop) / Math.max(distance, 1)));
        const next = current < 0 || Math.abs(target - current) < 0.00005 ? target : current + (target - current) * SCROLL_EASE;
        if (next !== current) {
          current = next;
          if (canvas && window.innerWidth >= 768) {
            canvas.style.transform = `translate3d(-${current * CANVAS_TRAVEL_VW}vw,0,0)`;
            const tip = current * CANVAS_TRAVEL_VW + TIP_SCREEN_ANCHOR * 100;
            const edge = current * CANVAS_TRAVEL_VW + 100 - REVEAL_INSET;
            canvas.querySelectorAll<HTMLElement>("[data-at]").forEach((el) => {
              // Most things reveal as they enter the screen; "thread" ones wait
              // for the thread itself (the loop's steps, the story comments).
              const shown = (el.dataset["mode"] === "thread" ? tip : edge) >= Number(el.dataset["at"]);
              el.toggleAttribute("data-shown", shown);
              // Story comments are said once, the first time the thread arrives.
              const line = el.dataset["say"];
              if (shown && line && !spoken.has(line)) {
                spoken.add(line);
                say(`story:${line}`, line);
              }
            });
          }
          listeners.current.forEach((listen) => listen(current));
        }
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const subscribe = (listen: (progress: number) => void) => {
    listeners.current.add(listen);
    return () => {
      listeners.current.delete(listen);
    };
  };

  const go = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      <main>
      <header className={cn("fixed inset-x-0 top-0 z-50 flex items-center justify-between px-5 py-5 transition-opacity duration-700 sm:px-8 sm:py-7", solidHeader ? "bg-background" : "bg-transparent", scrollReady ? "opacity-100" : "pointer-events-none animate-reveal [animation-delay:2.6s]")}>
        <button aria-label="Back to introduction" onClick={() => go("brain")} className="w-fit bg-transparent font-serif text-3xl font-medium">
          Binary Sphere
        </button>
      </header>

      <section id="brain" ref={storyRef} className="relative md:h-[580vh]">
        <div className="sticky top-0 hidden h-screen overflow-hidden md:block">
          <ParallaxEnvironment subscribe={subscribe} />
          <div ref={canvasRef} className="relative h-full will-change-transform max-md:hidden" style={{ width: `${CANVAS_VW}vw` }}>
            <StringLine subscribe={subscribe} />
            <div className="absolute inset-y-0 left-0 z-10" style={{ width: `${CANVAS_VW}vw` }}>
              <IntroScene contentRevealed={noteRevealed} noteRevealed={noteRevealed} />
              <TinkerScene />
              <TimelineScene />
              <EnoughScene onWork={() => go("work")} />
            </div>
          </div>
        </div>
        <MobileStory ready={noteRevealed} onWork={() => go("work")} />
      </section>

      <WorkSection />
      <TechStackSection />
      <ResearchLogBookSection />
      <OhHi />
      <CuriousCursor visible={scrollReady} />
      <PhoneComment />
    </main>
    </>
  );
}

// While scrolling, the string's tip is anchored to ~55% of the viewport width,
// so the freshly drawn thread always stays on screen instead of lagging behind.
const TIP_SCREEN_ANCHOR = 0.55;
// How quickly the story catches up with the scrollbar each frame (0–1).
const SCROLL_EASE = 0.085;
// Content sharpens in as it enters from the right edge: it's revealed once
// its x is this far (vw) inside the screen, so it's clear by the time you read it.
const REVEAL_INSET = 4;

function StringLine({ subscribe }: { subscribe: Subscribe }) {
  const pathRef = useRef<SVGPathElement>(null);
  const glowPathRef = useRef<SVGPathElement>(null);
  const shimmerPathRef = useRef<SVGPathElement>(null);
  const tipRef = useRef<SVGCircleElement>(null);
  const tipHaloRef = useRef<SVGCircleElement>(null);
  const tipPulseRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const { xs, ys, lengths, total } = getThreadSamples();
    const count = xs.length - 1;

    const draw = (progress: number) => {
      // Where the tip should sit: viewport's left edge (in viewBox units) plus
      // 55% of the visible width (1000 units).
      // Over the last stretch the tip runs ahead of its anchor, so the thread
      // reaches the button at the very end instead of stopping mid-screen.
      const catchUp = Math.max(0, (progress - 0.9) / 0.1) * 150;
      const targetX = progress * CANVAS_TRAVEL_VW * 10 + TIP_SCREEN_ANCHOR * 1000 + catchUp;
      let i = 0;
      while (i < count && (xs[i] ?? 0) < targetX) i += 1;
      const length = lengths[i] ?? total;

      const offset = `${1 - length / total}`;
      if (pathRef.current) pathRef.current.style.strokeDashoffset = offset;
      if (glowPathRef.current) glowPathRef.current.style.strokeDashoffset = offset;
      if (shimmerPathRef.current) shimmerPathRef.current.style.strokeDashoffset = offset;

      const currentX = xs[i] ?? 0;
      const currentY = ys[i] ?? 0;
      const isVisible = length <= 0 || length >= total * 0.999 ? "0" : "1";

      if (tipRef.current) {
        tipRef.current.setAttribute("cx", `${currentX}`);
        tipRef.current.setAttribute("cy", `${currentY}`);
        tipRef.current.style.opacity = isVisible;
      }
      if (tipHaloRef.current) {
        tipHaloRef.current.setAttribute("cx", `${currentX}`);
        tipHaloRef.current.setAttribute("cy", `${currentY}`);
        tipHaloRef.current.style.opacity = isVisible;
      }
      if (tipPulseRef.current) {
        tipPulseRef.current.setAttribute("cx", `${currentX}`);
        tipPulseRef.current.setAttribute("cy", `${currentY}`);
        tipPulseRef.current.style.opacity = isVisible;
      }
    };
    draw(0);
    return subscribe(draw);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" viewBox={`0 0 ${CANVAS_VW * 10} 1000`} preserveAspectRatio="none">
      {/* Black gradient definitions */}
      <defs>
        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.25" />
          <stop offset="12%" stopColor="#18181b" stopOpacity="0.9" />
          <stop offset="28%" stopColor="#000000" stopOpacity="1" />
          <stop offset="48%" stopColor="#27272a" stopOpacity="0.95" />
          <stop offset="68%" stopColor="#09090b" stopOpacity="1" />
          <stop offset="86%" stopColor="#18181b" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id="glowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.03" />
          <stop offset="15%" stopColor="#18181b" stopOpacity="0.15" />
          <stop offset="50%" stopColor="#000000" stopOpacity="0.2" />
          <stop offset="85%" stopColor="#18181b" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.03" />
        </linearGradient>
        {/* Animated gradient for moving shimmer effect */}
        <linearGradient id="shimmerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#27272a" stopOpacity="0.1">
            <animate attributeName="stop-opacity" values="0.1;0.35;0.1" dur="2.4s" repeatCount="indefinite" />
          </stop>
          <stop offset="50%" stopColor="#000000" stopOpacity="0.6">
            <animate attributeName="stop-opacity" values="0.3;0.7;0.3" dur="2.4s" repeatCount="indefinite" />
          </stop>
          <stop offset="100%" stopColor="#27272a" stopOpacity="0.1">
            <animate attributeName="stop-opacity" values="0.1;0.35;0.1" dur="2.4s" repeatCount="indefinite" />
          </stop>
        </linearGradient>
        {/* Soft shadow filter */}
        <filter id="glow">
          <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Wide soft shadow base layer */}
      <path 
        ref={glowPathRef} 
        pathLength="1" 
        style={{ strokeDashoffset: 1 }} 
        d={THREAD} 
        fill="none" 
        stroke="url(#glowGradient)" 
        strokeWidth="9" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeDasharray="1" 
        opacity="0.5" 
        filter="url(#glow)" 
      />
      
      {/* Shimmer layer for subtle dark pulse */}
      <path 
        ref={shimmerPathRef} 
        pathLength="1" 
        style={{ strokeDashoffset: 1 }} 
        d={THREAD} 
        fill="none" 
        stroke="url(#shimmerGradient)" 
        strokeWidth="4" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeDasharray="1" 
        opacity="0.6" 
      />
      
      {/* Main sleek black gradient line */}
      <path 
        ref={pathRef} 
        pathLength="1" 
        style={{ strokeDashoffset: 1 }} 
        d={THREAD} 
        fill="none" 
        stroke="url(#lineGradient)" 
        strokeWidth="2.8" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeDasharray="1" 
      />
      
      {/* Portal entry aura around the entry loop */}
      <g opacity="0.35">
        <circle cx="1020" cy="400" r="54" fill="none" stroke="#18181b" strokeWidth="1" strokeDasharray="4 6" opacity="0.3">
          <animateTransform attributeName="transform" type="rotate" from="0 1020 400" to="360 1020 400" dur="16s" repeatCount="indefinite" />
        </circle>
        <circle cx="1020" cy="400" r="34" fill="none" stroke="#000000" strokeWidth="1.2" opacity="0.35">
          <animate attributeName="r" values="32;36;32" dur="2.8s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.35;0.15;0.35" dur="2.8s" repeatCount="indefinite" />
        </circle>
      </g>
      
      {/* Animated tip following the thread on scroll - sleek monochrome tracer */}
      <circle ref={tipPulseRef} r="14" cx="620" cy="495" style={{ opacity: 0 }} className="fill-none stroke-foreground/35 stroke-[1.2] animate-ping" />
      <circle ref={tipHaloRef} r="8" cx="620" cy="495" style={{ opacity: 0 }} className="fill-foreground/15 stroke-foreground/40 stroke-1 drop-shadow-sm" />
      <circle ref={tipRef} r="4" cx="620" cy="495" style={{ opacity: 0 }} className="fill-foreground drop-shadow-sm" />
    </svg>
  );
}

function IntroScene({ contentRevealed }: { contentRevealed: boolean; noteRevealed?: boolean }) {
  return (
    <div className="absolute left-0 top-0 h-full w-screen">
      {/* Signature in Center */}
      <div
        className={cn(
          "group absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-all duration-700 cursor-pointer",
          contentRevealed ? "opacity-100 scale-100" : "opacity-0 scale-95 animate-reveal [animation-delay:2s]"
        )}
        data-cursor="Sachin Yadav"
        data-cursor-variant="signature"
        data-cursor-tag="Builder"
      >
        <img
          src={signature}
          alt="Sachin Yadav Signature"
          className="w-[340px] sm:w-[480px] md:w-[580px] lg:w-[680px] xl:w-[750px] max-w-[90vw] h-auto object-contain select-none pointer-events-none drop-shadow-sm transition-all duration-500 group-hover:scale-105 group-hover:drop-shadow-[0_10px_25px_rgba(124,58,237,0.18)] dark:invert"
          draggable={false}
        />
      </div>
    </div>
  );
}

// A piece of text pinned to the canvas.
// `at` is the canvas x (in vw) the thread must reach before a `.reveal` note shows.
function Note({ x, y, className, at: revealAt, children }: { x: number; y: number; className?: string; at?: number; children: ReactNode }) {
  return <div className={cn("absolute", className)} style={at(x, y)} data-at={revealAt}>{children}</div>;
}

// i tinker with a lot of stuff — creative tools and passions
function TinkerScene() {
  return (
    <div>
      <span hidden data-mode="thread" data-at={100} data-say="exploring new technologies." />
      {/* Realm Entry Marker */}
      <Note x={88} y={34} className="reveal pointer-events-none select-none" at={86}>
        <div className="flex items-center gap-2 text-[11px] font-mono tracking-widest text-foreground/80 uppercase">
          <span className="h-1.5 w-1.5 rounded-full bg-foreground animate-ping" />
          <span>Engineering &amp; Innovation</span>
          <span className="text-muted-foreground/40">//</span>
        </div>
      </Note>
    </div>
  );
}

// Points on the thread between two x positions, as (x, y) pairs in vw/vh.
function sampleThread(from: number, to: number) {
  const { xs: allX, ys: allY } = getThreadSamples();
  const xs: number[] = [];
  const ys: number[] = [];
  for (let i = 0; i < allX.length; i += 1) {
    const x = allX[i]! / 10;
    if (x >= from - 1 && x <= to + 1) {
      xs.push(x);
      ys.push(allY[i]! / 10);
    }
  }
  return { xs, ys };
}

const timeline = [
  {
    year: "1st Year",
    phase: "Foundation",
    title: "Learning the Fundamentals",
    line: "Programming basics, Java, OOP, DSA, DBMS, SQL, OS, and Networks. Building the core foundation.",
    badgeClass: "bg-foreground/[0.06] text-foreground border-foreground/20",
    dotClass: "bg-foreground",
  },
  {
    year: "1st-2nd Year",
    phase: "Full-Stack",
    title: "Exploring Web Development",
    line: "React, Node.js, Express, MongoDB, APIs, Git/GitHub. Started building real projects instead of just theory.",
    badgeClass: "bg-foreground/[0.06] text-foreground border-foreground/20",
    dotClass: "bg-foreground",
  },
  {
    year: "2nd Year",
    phase: "Product Builder",
    title: "Building Real Products",
    line: "Created Bright Code and Creatify. Learning how ideas transform into working, user-facing applications.",
    badgeClass: "bg-foreground/[0.06] text-foreground border-foreground/20",
    dotClass: "bg-foreground",
  },
  {
    year: "2nd Year",
    phase: "Data Science",
    title: "Discovering AI & ML",
    line: "NumPy, Pandas, Matplotlib, time-series forecasting, ARIMA, SARIMAX. The world of data science opened up.",
    badgeClass: "bg-foreground/[0.06] text-foreground border-foreground/20",
    dotClass: "bg-foreground",
  },
  {
    year: "2nd-3rd Year",
    phase: "Deep Learning",
    title: "Deepening AI & Vision",
    line: "CNNs, ConvNeXt, ConvLSTM, Computer Vision. Built Demand Forecast and Cyclone Pattern Identifier.",
    badgeClass: "bg-foreground/[0.06] text-foreground border-foreground/20",
    dotClass: "bg-foreground",
  },
  {
    year: "3rd Year",
    phase: "Intelligent Systems",
    title: "Complete Intelligent Systems",
    line: "Focus shifted to end-to-end intelligent architectures. Strengthening DSA, system design, and production engineering.",
    badgeClass: "bg-foreground/[0.06] text-foreground border-foreground/20",
    dotClass: "bg-foreground",
  },
];
const TIMELINE_FROM = 124;
const TIMELINE_STEP = 24;
const STEM = 7.5;

// The thread curves gently through the years. Each year hangs off it on a thin
// stem — alternating above and below — and only appears once the thread arrives.
function TimelineScene() {
  const [ys, setYs] = useState<number[] | null>(null);

  useEffect(() => {
    const { xs, ys: samples } = sampleThread(TIMELINE_FROM - 2, TIMELINE_FROM + TIMELINE_STEP * timeline.length + 4);
    setYs(timeline.map((_, index) => {
      const x = TIMELINE_FROM + index * TIMELINE_STEP;
      let k = 0;
      while (k < xs.length - 1 && (xs[k + 1] ?? 0) < x) k += 1;
      return samples[k] ?? 50;
    }));
  }, []);

  return (
    <div>
      <span hidden data-mode="thread" data-at={120} data-say="my journey: continuous growth and building." />
      
      {/* Journey Overview Header */}
      <Note x={80} y={16} className="reveal max-w-xs select-none" at={76}>
        <div className="rounded-2xl border border-border/80 bg-background/95 p-5 shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-foreground/40 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-foreground" />
            </span>
            <span className="text-[11px] font-mono tracking-widest text-muted-foreground uppercase font-semibold">Evolutionary Path</span>
          </div>
          <h2 className="font-serif text-3xl font-medium tracking-tight">The Journey <span className="italic text-muted-foreground">of Growth</span></h2>
          <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
            From algorithmic basics to real-world architectures and intelligent systems.
          </p>
        </div>
      </Note>

      {/* Interactive Milestones */}
      {ys && timeline.map((stop, index) => {
        const x = TIMELINE_FROM + index * TIMELINE_STEP;
        const y = ys[index] ?? 50;
        const up = index % 2 === 1;
        const cardY = up ? y - STEM - 1 : y + STEM + 1;
        return (
          <div key={stop.year + stop.title} className="reveal" data-at={x}>
            {/* Thread Attachment Node */}
            <div
              className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center"
              style={{ left: `${x}vw`, top: `${y}vh` }}
            >
              <span className={cn("h-3 w-3 rounded-full drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] animate-pulse", stop.dotClass)} />
              <span className="absolute h-5 w-5 rounded-full border border-foreground/30 animate-ping opacity-40" />
            </div>

            {/* Fiber Optic Stem */}
            <span
              className="absolute w-0.5 bg-gradient-to-b from-foreground/50 via-foreground/20 to-transparent pointer-events-none"
              style={{
                left: `${x}vw`,
                top: `${up ? y - STEM : y}vh`,
                height: `${STEM}vh`,
                transform: "translateX(-50%)",
              }}
            />

            {/* Milestone Card */}
            <Note
              x={x}
              y={cardY}
              className={cn(
                "w-[20rem] -translate-x-1/2 group",
                up && "-translate-y-full"
              )}
            >
              <div className="rounded-2xl border border-border/80 bg-background/95 p-4 shadow-xl backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:border-foreground/40 hover:shadow-2xl">
                <div className="flex items-center justify-between mb-2">
                  <span className={cn("px-2.5 py-0.5 text-[10px] font-mono font-medium rounded-full border tracking-wide uppercase", stop.badgeClass)}>
                    {stop.year}
                  </span>
                  <span className="text-[11px] font-mono text-muted-foreground/60">0{index + 1} // {stop.phase}</span>
                </div>
                <h3 className="font-serif text-lg font-medium text-foreground tracking-tight">{stop.title}</h3>
                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{stop.line}</p>
              </div>
            </Note>
          </div>
        );
      })}

    </div>
  );
}


// The thread reaches the threshold: the transition into selected works
function EnoughScene({ onWork }: { onWork: () => void }) {
  return (
    <>
      <span hidden data-mode="thread" data-at={BUTTON_X - 16} data-say="go on. explore the projects." />
      
      {/* Final screen stage from 300vw to 400vw with portrait pinned flush against the right edge */}
      <div
        className="reveal absolute top-0 h-screen pointer-events-auto select-none overflow-hidden"
        style={{ left: "300vw", width: "100vw" }}
        data-at={BUTTON_X - 45}
      >
        <div className="absolute top-0 right-0 h-screen flex items-center justify-center">
          <img
            src={beyondCodePortrait}
            alt="Sachin Yadav portrait line art"
            className="h-screen w-auto max-w-none object-contain opacity-100 contrast-125 dark:invert dark:opacity-95 pointer-events-none drop-shadow-2xl transition-transform duration-700 ease-out hover:scale-[1.01]"
          />

          {/* Action button centered at bottom of portrait */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
            <Button variant="ink" onClick={onWork} data-cursor="explore projects ↓">
              explore work <ArrowDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

const figureSizes = { fill: "h-full w-full", sm: "h-36 w-36 lg:h-44 lg:w-44", md: "h-44 w-44 lg:h-56 lg:w-56", lg: "h-52 w-52 lg:h-64 lg:w-64" };

// Each object keeps its own little confession. It types itself out on hover and
// springs back into hiding the moment the cursor leaves. The object tilts toward
// the pointer and floats above a soft ground shadow so it reads as 3D.
function Figure({ src, alt, label, className, delay, size = "md", still = false, hang = false, labelBelow = false, labelStyle }: { src: string; alt: string; label?: string | undefined; className?: string; delay?: string; size?: keyof typeof figureSizes | undefined; still?: boolean; hang?: boolean; labelBelow?: boolean | undefined; labelStyle?: CSSProperties }) {
  const [hovered, setHovered] = useState(false);
  const [typed, setTyped] = useState("");
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  // On phones, objects near an edge open their bubble toward the middle of
  // the screen instead of centred, so the words never run off-screen.
  const [align, setAlign] = useState<"center" | "left" | "right">("center");
  const hideTimer = useRef(0);

  const open = (el: HTMLElement) => {
    quietOthers(id.current);
    setHovered(true);
    if (window.innerWidth >= 768) return;
    const r = el.getBoundingClientRect();
    const middle = r.left + r.width / 2;
    setAlign(middle < 140 ? "left" : middle > window.innerWidth - 140 ? "right" : "center");
  };

  useEffect(() => () => window.clearTimeout(hideTimer.current), []);

  // Only one confession at a time: opening this one closes any other.
  const id = useRef(Math.random());
  useEffect(() => {
    const close = (e: Event) => {
      if ((e as CustomEvent<number>).detail !== id.current) setHovered(false);
    };
    window.addEventListener("figure-open", close);
    return () => window.removeEventListener("figure-open", close);
  }, []);

  // A tap anywhere else closes the confession.
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!hovered) return;
    const away = (e: PointerEvent) => {
      if (e.pointerType === "touch" && !rootRef.current?.contains(e.target as Node)) setHovered(false);
    };
    window.addEventListener("pointerdown", away);
    return () => window.removeEventListener("pointerdown", away);
  }, [hovered]);

  useEffect(() => {
    if (!hovered || !label) {
      setTyped("");
      return;
    }
    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setTyped(label.slice(0, index));
      if (index >= label.length) window.clearInterval(timer);
    }, 26);
    return () => window.clearInterval(timer);
  }, [hovered, label]);

  return (
    <div
      ref={rootRef}
      className={cn("relative shrink-0 [perspective:900px]", figureSizes[size], className)}
      onPointerEnter={(e) => {
        if (e.pointerType !== "touch") open(e.currentTarget);
      }}
      // A tap opens the confession and keeps it up for a moment; a touch
      // "leaves" as soon as the finger lifts, so it can't rely on hover.
      onPointerDown={(e) => {
        if (e.pointerType !== "touch") return;
        open(e.currentTarget);
        window.clearTimeout(hideTimer.current);
        hideTimer.current = window.setTimeout(() => setHovered(false), 2500);
      }}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setTilt({ x: ((e.clientX - r.left) / r.width - 0.5) * 2, y: ((e.clientY - r.top) / r.height - 0.5) * 2 });
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "touch") return;
        setHovered(false);
        setTilt({ x: 0, y: 0 });
      }}
    >
      <div aria-hidden="true" className="absolute bottom-[6%] left-1/2 h-4 w-1/2 rounded-[50%] bg-foreground/20 blur-md transition-all duration-500" style={{ transform: `translateX(-50%) scale(${hovered ? 0.8 : 1})`, opacity: hovered ? 0.6 : 1 }} />
      <div className={cn("h-full w-full", hang ? "animate-hang" : !still && "animate-float-object")} style={{ animationDelay: delay }}>
        <img
          src={src}
          alt={alt}
          decoding="async"
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
          style={{ transform: `rotateY(${tilt.x * 16}deg) rotateX(${-tilt.y * 14}deg) scale(${hovered ? 1.08 : 1}) translateZ(0)`, transitionTimingFunction: "cubic-bezier(.34,1.56,.64,1)" }}
          className="h-full w-full select-none object-contain transition-transform duration-500"
        />
      </div>
      {label && (
        <div
          aria-hidden="true"
          style={{ transitionTimingFunction: "cubic-bezier(.34,1.56,.64,1)", ...labelStyle }}
          className={cn(
            "pointer-events-none absolute z-40 w-max max-w-[min(16rem,calc(100vw-2rem))] whitespace-pre-line",
            align === "left" ? "left-0" : align === "right" ? "right-0" : "left-1/2 -translate-x-1/2",
            labelBelow ? "top-[calc(100%+4px)] rounded-[5px_18px_18px_18px]" : align === "right" ? "bottom-[calc(100%+4px)] rounded-[18px_18px_5px_18px]" : "bottom-[calc(100%+4px)] rounded-[18px_18px_18px_5px]",
            " border border-cursor-border bg-cursor px-4 py-2 text-sm text-cursor-foreground shadow-lg transition-all duration-300",
            hovered ? "translate-y-0 scale-100 opacity-100" : cn(labelBelow ? "-translate-y-3" : "translate-y-3", "scale-90 opacity-0"),
          )}
        >
          {typed}
          <span className="animate-pulse">|</span>
        </div>
      )}
    </div>
  );
}

function Object({ src, alt, label, style, delay, size, labelBelow }: { src: string; alt: string; label?: string | undefined; style: CSSProperties; delay: string; size?: keyof typeof figureSizes; labelBelow?: boolean }) {
  return <div className="absolute" style={style}><Figure src={src} alt={alt} label={label} delay={delay} size={size} labelBelow={labelBelow} /></div>;
}

// ---------------------------------------------------------------------------
// Mobile: the same story told vertically. The thread falls from the tangle and
// weaves down the page between the objects, the years hang off it on little
// stems, and it ties the habit loop before ending at the work button. Anchor
// points are read from the laid-out page, so the thread fits any phone.

// Radius (px) of the habit loop on mobile.
const MOBILE_LOOP = 70;

// An object pinned in a mobile block, with the thread passing through its middle.
function MobileObject({ src, alt, label, style, delay }: { src: string; alt: string; label: string; style: CSSProperties; delay: string }) {
  return (
    <div className="absolute" style={style}>
      <Figure src={src} alt={alt} label={label} size="sm" delay={delay} />
      <span data-anchor className="absolute left-1/2 top-1/2" />
    </div>
  );
}

// An invisible point the thread must pass through, placed within its block.
function Anchor({ x, y, loop }: { x: string; y: number | string; loop?: number }) {
  return <span data-anchor={loop ?? ""} className="absolute" style={{ left: x, top: y }} />;
}

// The climber's stretch of thread on mobile: it runs from left to right
// between these heights (px within the tinker block).
const CLIMB_Y0 = 680;
const CLIMB_Y1 = 720;


function MobileStory({ ready, onWork }: { ready: boolean; onWork: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const tipRef = useRef<SVGCircleElement>(null);
  const samplesRef = useRef<ThreadSamples | null>(null);
  const [geo, setGeo] = useState<{ d: string; w: number; h: number } | null>(null);

  // Trace the thread through every anchor down the mobile page.
  useEffect(() => {
    const measure = () => {
      const root = rootRef.current;
      const hero = heroRef.current;
      if (!root || !hero || root.offsetParent === null) return;
      const r = root.getBoundingClientRect();
      const h = hero.getBoundingClientRect();
      
      // Start thread right below the centered signature in hero
      const startX = r.width * 0.5;
      const startY = h.bottom - r.top - 40;
      const points: Waypoint[] = [[startX, startY]];

      root.querySelectorAll<HTMLElement>("[data-anchor]").forEach((el) => {
        const a = el.getBoundingClientRect();
        const loop = Number(el.dataset["anchor"]);
        points.push(loop ? [a.left - r.left, a.top - r.top, loop] : [a.left - r.left, a.top - r.top]);
      });

      const segments = threadSegments(points, 1, 1);
      samplesRef.current = sampleSegments(segments, 24);
      setGeo({ d: segmentsPath(segments), w: r.width, h: r.height });
    };

    measure();
    void document.fonts?.ready.then(measure);
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Draw the thread as user scrolls
  useEffect(() => {
    if (!geo) return;
    let frame = 0;
    const draw = () => {
      frame = 0;
      const root = rootRef.current;
      const path = pathRef.current;
      const tip = tipRef.current;
      const samples = samplesRef.current;
      if (!root || !path || !tip || !samples) return;
      const { xs, ys, lengths, total } = samples;
      
      const top = root.getBoundingClientRect().top;
      const reach = Math.min(window.innerHeight * 0.75 - top, (ys[0] ?? 0) + Math.max(0, -top) * 1.35);
      let i = 0;
      while (i < xs.length - 1 && (ys[i] ?? 0) < reach) i += 1;
      const length = lengths[i] ?? 0;
      path.style.strokeDashoffset = `${1 - length / total}`;
      tip.setAttribute("cx", `${xs[i]}`);
      tip.setAttribute("cy", `${ys[i]}`);
      tip.style.opacity = length > 0 && length < total * 0.999 ? "1" : "0";
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(draw);
    };
    draw();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, [geo]);

  // Reveal elements on scroll
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.setAttribute("data-shown", "");
        io.unobserve(e.target);
      }),
      { rootMargin: "0px 0px -8% 0px", threshold: 0.15 },
    );
    root.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    
    const talk = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        const line = (e.target as HTMLElement).dataset["say"];
        if (!e.isIntersecting || !line) return;
        say(`story:${line}`, line);
        talk.unobserve(e.target);
      }),
      { rootMargin: "0px 0px -40% 0px" },
    );
    root.querySelectorAll("[data-say]").forEach((el) => talk.observe(el));
    return () => {
      io.disconnect();
      talk.disconnect();
    };
  }, []);

  return (
    <div ref={rootRef} className="relative overflow-hidden md:hidden">
      {geo && (
        <svg aria-hidden="true" className={cn("pointer-events-none absolute left-0 top-0 transition-opacity duration-700", ready ? "opacity-100" : "opacity-0")} width={geo.w} height={geo.h} viewBox={`0 0 ${geo.w} ${geo.h}`}>
          <path ref={pathRef} d={geo.d} pathLength="1" strokeDasharray="1" style={{ strokeDashoffset: 1 }} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          <circle ref={tipRef} r="5" cx="0" cy="0" style={{ opacity: 0 }} className="fill-foreground shadow-sm" />
        </svg>
      )}

      {/* Modern Clean Hero for Mobile */}
      <div ref={heroRef} className="relative min-h-[92svh] flex flex-col justify-between items-center px-5 pt-24 pb-12 text-center select-none overflow-hidden">
        {/* Ambient background grid pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035] dark:opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(circle, currentColor 1px, transparent 1px), linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "40px 40px, 80px 80px, 80px 80px",
          }}
        />

        {/* Top Header Badge */}
        <div className={cn("relative z-10 transition-all duration-700", ready ? "opacity-100 scale-100" : "opacity-0 scale-95 animate-reveal [animation-delay:1.2s]")}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-foreground/15 bg-foreground/[0.04] text-[10px] font-mono tracking-widest text-muted-foreground uppercase shadow-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>BINARY SPHERE // ARCHITECTURE</span>
          </div>
        </div>

        {/* Center Signature & Name */}
        <div className={cn("relative z-10 my-auto py-6 flex flex-col items-center justify-center transition-all duration-700", ready ? "opacity-100 scale-100" : "opacity-0 scale-95 animate-reveal [animation-delay:1.8s]")}>
          <div className="relative group p-2">
            <img
              src={signature}
              alt="Sachin Yadav Signature"
              className="w-[280px] xs:w-[320px] max-w-[85vw] h-auto object-contain select-none pointer-events-none drop-shadow-md dark:invert"
              draggable={false}
            />
          </div>

          <p className="mt-4 font-serif text-2xl font-medium tracking-tight text-foreground">
            Sachin Yadav
          </p>
          <p className="mt-1 text-xs font-mono text-muted-foreground tracking-wide max-w-[280px]">
            Engineering &amp; Innovation • Scalable Systems &amp; Applied AI
          </p>
        </div>

        {/* Bottom Scroll Prompt */}
        <div className={cn("relative z-10 flex flex-col items-center gap-1.5 text-muted-foreground/70 transition-all duration-700", ready ? "opacity-100" : "opacity-0 animate-reveal [animation-delay:2.4s]")}>
          <span className="text-[10px] font-mono tracking-widest uppercase">Scroll to explore journey</span>
          <ArrowDown className="h-3.5 w-3.5 animate-bounce" />
        </div>

        <Anchor x="50%" y="90svh" />
      </div>

      {/* Transition spacer & Realm entry marker */}
      <div className="relative py-10 px-5 text-center">
        <span data-say="exploring new technologies." className="absolute left-0 top-0 h-px w-px" />
        <div className="reveal inline-flex items-center gap-2 text-[10px] font-mono tracking-widest text-foreground/80 uppercase px-3 py-1 rounded-full border border-foreground/15 bg-foreground/[0.03]">
          <span className="h-1.5 w-1.5 rounded-full bg-foreground animate-ping" />
          <span>Engineering &amp; Innovation //</span>
        </div>
        <Anchor x="28%" y={40} />
        <Anchor x="72%" y={100} />
      </div>

      {/* The Journey Timeline on Mobile */}
      <div className="relative mt-4 px-5 pb-16">
        <span data-say="my journey: continuous growth and building." className="absolute left-0 top-20 h-px w-px" />
        <Anchor x="8%" y={-20} />
        
        <div className="reveal mx-auto max-w-[20rem] text-center mb-8">
          <span className="px-2.5 py-0.5 text-[10px] font-mono font-medium rounded-full bg-foreground/[0.06] text-foreground border border-foreground/20 uppercase tracking-wider inline-block mb-1.5">Evolutionary Path</span>
          <h2 className="font-serif text-3xl font-medium leading-tight text-foreground">The Journey <span className="italic text-muted-foreground">of Growth</span></h2>
        </div>

        <ol className="relative pl-5 space-y-5">
          {timeline.map((stop, index) => (
            <li key={stop.year + stop.title} className="reveal relative pl-6 pb-2">
              <span data-anchor className="absolute left-0 top-3" />
              <span className={cn("absolute left-0 top-3 h-3 w-3 rounded-full -translate-x-1/2 drop-shadow-[0_0_6px_rgba(255,255,255,0.4)]", stop.dotClass)} />
              <div className="rounded-2xl border border-border/80 bg-background/95 dark:bg-zinc-950/90 p-4 shadow-md backdrop-blur-md">
                <div className="flex items-center justify-between mb-2">
                  <span className={cn("px-2 py-0.5 text-[9px] font-mono font-medium rounded-full border uppercase tracking-wider", stop.badgeClass)}>
                    {stop.year}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground/60">0{index + 1} // {stop.phase}</span>
                </div>
                <h3 className="font-serif text-base font-medium text-foreground">{stop.title}</h3>
                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{stop.line}</p>
              </div>
            </li>
          ))}
        </ol>
        <Anchor x="8%" y="100%" />
      </div>

      {/* The thread ends at the Portrait & Explore Work */}
      <div className="relative px-4 pb-20 pt-8 text-center flex flex-col items-center justify-center min-h-[90vh]">
        <span data-say="go on. explore the projects." className="absolute left-0 top-10 h-px w-px" />
        <Anchor x="92%" y={30} />
        
        {/* Full-Height Portrait on Mobile */}
        <div className="reveal relative mx-auto w-full h-[75vh] flex items-center justify-center overflow-hidden">
          <img
            src={beyondCodePortrait}
            alt="Sachin Yadav portrait line art"
            className="h-full w-auto max-h-[75vh] object-contain opacity-100 contrast-125 dark:invert dark:opacity-95 select-none pointer-events-none"
            draggable={false}
          />
        </div>

        {/* Clean action button below portrait */}
        <div className="mt-6 z-10">
          <Button variant="ink" onClick={onWork}>
            explore work <ArrowDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function WorkSection() {
  const portfolioProjects = [
    {
      number: "01",
      tag: "FULL-STACK & COLLABORATION",
      title: "Bright Code",
      blurb: "Real-time collaborative coding platform with live sync & interactive workspaces.",
      description:
        "A collaborative coding platform designed to help developers write, practice, and work on code efficiently in an interactive environment. Built with React, Node.js, Express, and MongoDB.",
      stack: ["React", "Node.js", "Express", "MongoDB", "Socket.io", "Monaco Editor"],
      shot: voxieShot,
      object: laptop,
      live: "https://bright-code-ruby.vercel.app/",
      code: "https://github.com/SachinYadav2446/BrightCode",
    },
    {
      number: "02",
      tag: "GEOSPATIAL & TELEMETRY",
      title: "JalDrishti",
      blurb: "Real-time groundwater resource evaluation from DWLR telemetry — Ministry of Jal Shakti.",
      description:
        "Automated telemetric groundwater resource evaluation platform analyzing Digital Water Level Recorder (DWLR) sensors across India-WRIS. Ingests 2.4M+ daily telemetry observations from 3,200+ stations, computing GEC-2015 recharge calculations, sensor health triage, and 90-day predictive aquifer trends.",
      stack: ["Python", "Django REST", "React Native / Expo", "DWLR Telemetry", "India-WRIS", "Geospatial Analytics"],
      shot: jaldrishtiShot,
      object: globe,
      code: "https://github.com/SachinYadav2446/JalDrishti",
    },
    {
      number: "03",
      tag: "AI / COMPUTER VISION",
      title: "Cyclone Pattern Identifier",
      blurb: "Satellite cyclone intensity & pattern analysis with temporal deep learning.",
      description:
        "An AI-based system for detecting and analyzing cyclone patterns from satellite imagery, including cyclone eye localization, intensity estimation, and forecasting up to 48 hours. Built with PyTorch, ConvNeXt, and ConvLSTM.",
      stack: ["PyTorch", "ConvNeXt", "ConvLSTM", "OpenCV", "Satellite Vision", "Deep Learning"],
      shot: rexShot,
      object: earth,
      code: "https://github.com/SachinYadav2446/Cyclone-Pattern-Identifier",
    },
    {
      number: "04",
      tag: "MACHINE LEARNING & TIME-SERIES",
      title: "Demand Forecast",
      blurb: "Spatial-temporal urban taxi demand intelligence and predictive modeling.",
      description:
        "A taxi demand forecasting system that predicts zone-wise future demand using historical NYC taxi trip data and time-series forecasting techniques with ARIMA and SARIMAX models.",
      stack: ["Python", "ARIMA", "SARIMAX", "Pandas", "Scikit-Learn", "Time-Series"],
      shot: screenmeshShot,
      object: brain,
      code: "https://github.com/SachinYadav2446/Taxi-Demand-Forecasting-System-",
    },
    {
      number: "05",
      tag: "CREATIVE WEB PLATFORM",
      title: "Creatify",
      blurb: "Interactive media canvas and dynamic digital content creation engine.",
      description:
        "A creative digital platform focused on helping users create and manage engaging digital content through an intuitive and interactive interface built with React and modern web technologies.",
      stack: ["React", "TypeScript", "Tailwind CSS", "Canvas API", "Vite"],
      shot: clinaraShot,
      object: sparkles,
      code: "https://github.com/SachinYadav2446/Creatify",
    },
    {
      number: "06",
      tag: "JAVA & CORE CS FOUNDATIONS",
      title: "Java Basic Projects",
      blurb: "Modular repository of core Java implementations, OOP patterns, and data structure algorithms.",
      description:
        "A structured collection of 12 progressive Java applications demonstrating object-oriented programming, data structures, and algorithmic patterns — spanning banking systems, sorting/searching algorithms, e-commerce catalogs, and library management.",
      stack: ["Java", "OOP Principles", "Data Structures", "Algorithms", "Banking System", "E-Commerce"],
      shot: javaBasicsShot,
      object: code,
      code: "https://github.com/SachinYadav2446/Java-basic-Projects",
    },
    {
      number: "07",
      tag: "JAVASCRIPT & DOM ENGINEERING",
      title: "JavaScript Basic Projects",
      blurb: "Hands-on suite of vanilla JavaScript web applications and asynchronous utilities.",
      description:
        "A comprehensive practical laboratory of JavaScript projects focusing on core DOM engineering, asynchronous REST API consumers (weather app), financial budgeting tools (bill splitter, expense tracker), and game mechanics.",
      stack: ["JavaScript", "DOM API", "Async/Await", "Fetch API", "Local Storage", "Event Loop"],
      shot: jsBasicsShot,
      object: console_,
      code: "https://github.com/SachinYadav2446/JS-Projects-Basics-",
    },
  ];

  return (
    <section id="work" className="relative min-h-screen border-t border-border/80 bg-background px-5 pb-36 pt-32 sm:px-8 sm:pb-48 lg:px-16 overflow-visible">
      {/* Architectural Background Watermark Backdrop */}
      <div className="pointer-events-none absolute inset-x-0 top-0 overflow-hidden select-none opacity-[0.06] dark:opacity-[0.08]" aria-hidden="true">
        <div className="mx-auto flex max-w-[1300px] items-center justify-between px-5 pt-7 font-mono text-[10px] sm:text-xs uppercase tracking-[0.3em] text-foreground/75">
          <span>// 01 — 07</span>
          <span>DEPLOYED ARCHITECTURES</span>
          <span className="hidden sm:inline">[ AI &amp; CODE ]</span>
        </div>
        <p className="whitespace-nowrap text-center font-serif italic text-[15vw] tracking-tight leading-[0.85] text-transparent [-webkit-text-stroke:1.2px_currentColor] text-foreground select-none">
          Creations
        </p>
      </div>

      <div className="relative mx-auto max-w-[1300px]">
        {/* Editorial Section Header */}
        <div className="max-w-3xl pt-2">
          <h2 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-medium tracking-tight text-foreground leading-[1.08]">
            Architecting software with <br />
            <span className="italic font-normal text-muted-foreground">scalable engineering</span> & applied AI.
          </h2>

          <p className="mt-6 max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
            A curated portfolio of full-stack production platforms, deep learning computer vision systems, and predictive time-series pipelines built for resilience and real-world impact.
          </p>
        </div>

        {/* Stacking Cards Container */}
        <div className="relative mt-16 sm:mt-20 space-y-12 sm:space-y-16">
          {portfolioProjects.map((project, index) => (
            <div
              key={project.title}
              className="sticky transition-all duration-300"
              style={{
                top: `calc(2.5rem + ${index * 0.85}rem)`,
                zIndex: 10 + index,
              }}
            >
              <div className="group relative overflow-hidden rounded-3xl border border-border/80 bg-background/95 dark:bg-zinc-950/95 p-5 sm:p-7 lg:p-8 shadow-2xl shadow-black/10 dark:shadow-black/70 backdrop-blur-xl transition-all duration-300 hover:border-foreground/40">
                {/* Card Top Pill Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4 mb-6">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <span className="rounded-md border border-border/70 bg-foreground/[0.04] px-2.5 py-0.5 font-mono text-xs font-bold text-foreground">
                      {project.number}
                    </span>
                    <span className="font-mono text-xs font-semibold tracking-wider text-muted-foreground/80 uppercase">
                      {project.tag}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {project.live ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-0.5 text-[11px] font-mono font-medium text-emerald-600 dark:text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        LIVE APPLICATION
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-foreground/[0.04] px-3 py-0.5 text-[11px] font-mono text-muted-foreground">
                        OPEN SOURCE ARCHITECTURE
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Content Grid */}
                <div className="grid gap-6 lg:gap-8 lg:grid-cols-12 lg:items-center">
                  {/* Left Column: Project details */}
                  <div className="lg:col-span-7 flex flex-col justify-between">
                    <div>
                      <h3 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-foreground">
                        {project.title}
                      </h3>
                      <p className="mt-2 text-sm sm:text-base font-medium text-foreground/80">
                        {project.blurb}
                      </p>
                      <p className="mt-2.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        {project.description}
                      </p>

                      {/* Tech stack badges */}
                      <div className="mt-5">
                        <span className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-1.5">
                          Core Architecture & Stack
                        </span>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          {project.stack.map((tech) => (
                            <span
                              key={tech}
                              className="rounded-lg border border-border/70 bg-foreground/[0.03] px-2.5 py-0.5 font-mono text-[11px] text-muted-foreground transition-colors group-hover:text-foreground group-hover:border-foreground/30"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Action Links */}
                    <div className="mt-6 flex flex-wrap items-center gap-3 pt-4 border-t border-border/40 relative z-20">
                      {project.live && (
                        <a
                          href={project.live}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl bg-foreground px-4 py-2.5 text-xs font-mono font-medium text-background transition hover:bg-foreground/85 shadow-sm active:scale-95"
                          data-cursor="view live application ↗"
                        >
                          Live Demo <ArrowUpRight className="h-4 w-4" />
                        </a>
                      )}
                      {project.code && (
                        <a
                          href={project.code}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-background/80 px-4 py-2.5 text-xs font-mono font-medium text-foreground transition hover:bg-foreground/5 hover:border-foreground/40 shadow-sm active:scale-95"
                          data-cursor="explore source code ↗"
                        >
                          Source Code <ArrowUpRight className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Visual screenshot preview */}
                  <div className="lg:col-span-5 relative">
                    <div className="group/shot relative overflow-hidden rounded-2xl border border-border/80 bg-zinc-950/40 shadow-lg">
                      <img
                        src={project.shot}
                        alt={`${project.title} screenshot`}
                        className="aspect-[16/10] w-full object-cover object-top transition-transform duration-700 ease-out group-hover/shot:scale-105"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Creative, Classy & Animated Tech Stack Showcase
// ---------------------------------------------------------------------------
const techCategories = [
  {
    number: "01",
    tag: "INTELLIGENCE & MODELS",
    title: "AI / ML & Computer Vision",
    icon: Cpu,
    summary: "Convolutional neural nets, spatial-temporal forecasting, and vision pipelines.",
    skills: [
      { name: "PyTorch", type: "Deep Learning" },
      { name: "OpenCV", type: "Computer Vision" },
      { name: "CNNs & ConvLSTM", type: "Spatial-Temporal" },
      { name: "Time-Series", type: "ARIMA / SARIMAX" },
      { name: "Scikit-Learn", type: "Statistical ML" },
      { name: "Pandas & NumPy", type: "Tensor & Vector" },
    ],
  },
  {
    number: "02",
    tag: "ALGORITHMIC FOUNDATIONS",
    title: "Core Languages & Systems",
    icon: Terminal,
    summary: "High-performance object-oriented code, data structures, and typed paradigms.",
    skills: [
      { name: "Java", type: "OOP & Systems" },
      { name: "Python", type: "AI & Scripting" },
      { name: "C++", type: "Low-level Performance" },
      { name: "TypeScript", type: "Type-Safe Strict" },
      { name: "JavaScript", type: "ESNext / Async" },
      { name: "SQL", type: "Relational Queries" },
    ],
  },
  {
    number: "03",
    tag: "INTERFACES & PLATFORMS",
    title: "Modern Full-Stack Engineering",
    icon: Layers,
    summary: "Responsive reactive client interfaces backed by scalable microservices.",
    skills: [
      { name: "React", type: "Client Framework" },
      { name: "Next.js", type: "SSR & Full-Stack" },
      { name: "Node.js & Express", type: "Server Runtimes" },
      { name: "Tailwind CSS", type: "Design Systems" },
      { name: "TanStack Router", type: "Type-Safe Routing" },
      { name: "RESTful APIs", type: "Contract Endpoints" },
    ],
  },
  {
    number: "04",
    tag: "INFRASTRUCTURE & DATA",
    title: "DevOps & Cloud Environment",
    icon: Database,
    summary: "Containerization, persistent database engines, and continuous workflow tooling.",
    skills: [
      { name: "MongoDB", type: "NoSQL Document" },
      { name: "PostgreSQL", type: "ACID Relational" },
      { name: "Docker", type: "Containerization" },
      { name: "Git & GitHub", type: "Version Control" },
      { name: "Linux / Bash", type: "OS & Shell Scripting" },
      { name: "Postman", type: "API Telemetry" },
    ],
  },
];

const marqueeRow1 = [
  "PYTORCH", "REACT.JS", "JAVA", "OPENCV", "TYPESCRIPT", "DOCKER", "NODE.JS", "MONGODB", "C++", "TIME-SERIES", "NEXT.JS", "FASTAPI",
];

const marqueeRow2 = [
  "COMPUTER VISION", "DEEP LEARNING", "REST APIS", "SYSTEM DESIGN", "TAILWIND CSS", "SCIKIT-LEARN", "POSTGRESQL", "LINUX", "CONVLSTM", "ALGORITHMS",
];

function TechStackSection() {
  return (
    <section id="stack" className="relative border-t border-border/80 bg-background px-5 py-24 sm:px-8 sm:py-32 lg:px-16 overflow-hidden">
      {/* Subtle Background Blueprint Grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035] dark:opacity-[0.055]"
        style={{
          backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-[1300px]">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-12 sm:pb-16 border-b border-border/60">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-foreground/40 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-foreground" />
              </span>
              <span className="text-[11px] font-mono tracking-widest text-muted-foreground uppercase font-semibold">
                Tech Stack &amp; Capabilities
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-foreground leading-[1.08]">
              Tools of the Craft. <br />
              <span className="italic font-normal text-muted-foreground">from raw logic to production.</span>
            </h2>
          </div>
          <p className="max-w-md text-xs sm:text-sm text-muted-foreground leading-relaxed">
            A battle-tested technical matrix across deep learning computer vision, scalable backend services, and interactive web architecture.
          </p>
        </div>

        {/* 4 Interactive Categorized Pods */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:gap-8">
          {techCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.number}
                className="group relative overflow-hidden rounded-2xl border border-border/80 bg-background/80 dark:bg-zinc-950/70 p-6 sm:p-7 shadow-lg backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-foreground/40 hover:shadow-xl"
              >
                {/* Header inside pod */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-border/50">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/80 bg-foreground/[0.04] text-foreground transition-colors group-hover:bg-foreground group-hover:text-background">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="block text-[10px] font-mono tracking-widest text-muted-foreground uppercase">
                        {cat.number} // {cat.tag}
                      </span>
                      <h3 className="font-serif text-lg font-medium text-foreground tracking-tight">
                        {cat.title}
                      </h3>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-muted-foreground/60">0{cat.skills.length}</span>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed mb-5">
                  {cat.summary}
                </p>

                {/* Badges Grid */}
                <div className="flex flex-wrap gap-2">
                  {cat.skills.map((skill) => (
                    <div
                      key={skill.name}
                      className="group/badge inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-foreground/[0.02] px-2.5 py-1 text-xs font-mono text-foreground/80 transition-all duration-200 hover:border-foreground/50 hover:bg-foreground/[0.08] hover:text-foreground hover:scale-[1.03]"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-foreground/40 group-hover/badge:bg-foreground transition-colors" />
                      <span className="font-medium">{skill.name}</span>
                      <span className="text-[9px] text-muted-foreground/70 hidden sm:inline">({skill.type})</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Creative Dual-Direction Animated Marquee Strip */}
        <div className="mt-14 relative overflow-hidden rounded-2xl border border-border/70 bg-foreground/[0.02] p-4 sm:p-5 backdrop-blur-sm">
          {/* Edge Fade Gradients */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-28 bg-gradient-to-r from-background to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-28 bg-gradient-to-l from-background to-transparent z-10" />

          {/* Streamer Row 1 (Drifts Left) */}
          <div className="flex w-max animate-marquee-left gap-4 font-mono text-xs uppercase tracking-widest text-muted-foreground/90 select-none pb-2">
            {[...marqueeRow1, ...marqueeRow1].map((item, i) => (
              <span key={`r1-${item}-${i}`} className="inline-flex items-center gap-3">
                <span className="font-semibold text-foreground/80 hover:text-foreground transition-colors">{item}</span>
                <span className="text-muted-foreground/30">•</span>
              </span>
            ))}
          </div>

          {/* Streamer Row 2 (Drifts Right) */}
          <div className="flex w-max animate-marquee-right gap-4 font-mono text-xs uppercase tracking-widest text-muted-foreground/75 select-none pt-2 border-t border-border/40">
            {[...marqueeRow2, ...marqueeRow2].map((item, i) => (
              <span key={`r2-${item}-${i}`} className="inline-flex items-center gap-3">
                <span className="font-semibold text-foreground/70 hover:text-foreground transition-colors">{item}</span>
                <span className="text-muted-foreground/30">•</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Interactive Research Journal & Weekly Learning Log ("The Research Book")
// ---------------------------------------------------------------------------
interface LogPage {
  id: string;
  chapter: string;
  tabTitle: string;
  title: string;
  category: string;
  dateStamp: string;
  status: string;
  icon: typeof FlaskConical;
  leftPage: {
    badge: string;
    heading: string;
    paragraphs: string[];
    equation?: {
      label: string;
      code: string;
      caption: string;
    };
    keyPoints: string[];
  };
  rightPage: {
    notesHeading: string;
    workingNotes: string[];
    codeBlock?: {
      filename: string;
      lang: string;
      code: string;
    };
    marginScribble: {
      text: string;
      rotate: number;
    };
    actionStatus: string;
  };
}

const researchPages: LogPage[] = [
  {
    id: "index-toc",
    chapter: "VOLUME 01 // DISPATCH INDEX",
    tabTitle: "Table of Contents",
    title: "Table of Contents & Sprint Index",
    category: "LAB INDEX & ACTIVE DIRECTORY",
    dateStamp: "AUTUMN 2026",
    status: "ACTIVE EXPERIMENTAL LOG",
    icon: Bookmark,
    leftPage: {
      badge: "ARCHIVAL FIELD LOG",
      heading: "Table of Contents",
      paragraphs: [
        "A live operational journal documenting spatial-temporal deep learning vision architectures, empirical cyclone intensity derivations, keyboard ergonomics, and foundational research papers.",
      ],
      keyPoints: [
        "01. Spatial-Temporal Vision (ConvNeXt & ConvLSTM) — Page 03",
        "02. Cyclone Dynamics & Dvorak EIR Calibration — Page 05",
        "03. Dvorak Keymap Mechanics & Muscle Memory — Page 07",
        "04. Foundational Papers & System Architecture — Page 09",
      ],
    },
    rightPage: {
      notesHeading: "Research Methodology & Principles",
      workingNotes: [
        "First-principles systems engineering: Grounding deep learning vision pipelines in empirical physical meteorology.",
        "Rapid experimentation loop: Deriving theoretical equations -> Python verification -> real-time telemetry.",
        "Continuous profiling: Benchmarking throughput, memory footprint, and keystroke ergonomics.",
      ],
      codeBlock: {
        filename: "manifest.json",
        lang: "json",
        code: `{
  "author": "Sachin Yadav",
  "domains": ["AI/ML", "Vision", "Meteorology", "Ergonomics"],
  "active_dispatches": 4,
  "status": "Active Prototyping",
  "motto": "Nullius in verba • Build from foundations"
}`,
      },
      marginScribble: {
        text: "True engineering lives at the intersection of deep theory and working implementations.",
        rotate: -2,
      },
      actionStatus: "All 4 research dispatches verified & compiled.",
    },
  },
  {
    id: "convnext-convlstm",
    chapter: "CHAPTER 01 // ARCHITECTURE",
    tabTitle: "ConvNeXt & ConvLSTM",
    title: "Spatial-Temporal Vision Pipelines",
    category: "DEEP LEARNING & COMPUTER VISION",
    dateStamp: "CURRENT SPRINT // ACTIVE RESEARCH",
    status: "PROTOTYPING & BENCHMARKING",
    icon: FlaskConical,
    leftPage: {
      badge: "HYBRID VISION ARCHITECTURE",
      heading: "Fusing ConvNeXt Backbones with Recurrent ConvLSTM Cells",
      paragraphs: [
        "Standard Vision Transformers (ViTs) require massive compute and quadratic attention overhead on long spatial sequences. For temporal cyclone sequence prediction, I am evaluating modern ConvNeXt architectures (using 7×7 depthwise convolutions and inverted bottlenecks) as spatial feature extractors.",
        "Feeding multi-scale ConvNeXt feature maps directly into ConvLSTM recurrent layers preserves spatial topology while learning temporal flow vectors across consecutive satellite frames.",
      ],
      equation: {
        label: "ConvLSTM Hidden State Transition:",
        code: "H[t] = tanh(C[t]) ⊙ σ(W_ho * H[t-1] + W_xo * X[t] + b_o)",
        caption: "Preserves 2D matrix structure through convolution operators inside recurrent gating.",
      },
      keyPoints: [
        "7×7 depthwise kernels capture broad wind band curvature without attention overhead.",
        "Inverted bottleneck design keeps intermediate gradient flow stable over long sequence rollouts.",
        "Benchmarking against pure 3D CNNs to evaluate memory efficiency during 48-hour prediction horizons.",
      ],
    },
    rightPage: {
      notesHeading: "Lab Notes & Weekly Progress",
      workingNotes: [
        "Testing optical flow guidance vs end-to-end recurrent hidden state memory on synthetic sequences.",
        "Downsampling via 2×2 strided convolutions with LayerNorm prevents early spatial feature loss.",
        "Observed faster loss convergence compared to ResNet-50 baseline on temporal radar imagery.",
      ],
      codeBlock: {
        filename: "temporal_block.py",
        lang: "python",
        code: `# ConvNeXt Stage + ConvLSTM Temporal Cell
class TemporalVisionHead(nn.Module):
    def __init__(self, in_channels=128, hidden_dim=64):
        super().__init__()
        self.encoder = ConvNeXtBlock(dim=in_channels)
        self.temporal_gate = ConvLSTM2D(
            in_channels=in_channels, 
            hidden_channels=hidden_dim, 
            kernel_size=(3, 3)
        )
    def forward(self, x_seq): # (B, T, C, H, W)
        feats = [self.encoder(x) for x in x_seq.unbind(1)]
        h_t, c_t = self.temporal_gate(torch.stack(feats, dim=1))
        return h_t # Spatio-temporal representation`,
      },
      marginScribble: {
        text: "ConvNeXt large kernel inductive bias beats standard ViTs for dense temporal frames ✦",
        rotate: -3,
      },
      actionStatus: "Currently evaluating gradient stability on multi-frame INSAT thermal tracks.",
    },
  },
  {
    id: "cyclone-dvorak",
    chapter: "CHAPTER 02 // METEOROLOGY & AI",
    tabTitle: "Cyclone & Dvorak Formulas",
    title: "Empirical Calibration & Intensity Equations",
    category: "PHYSICAL METEOROLOGICAL MODELING",
    dateStamp: "ACTIVE INVESTIGATION",
    status: "MATHEMATICAL CALIBRATION",
    icon: Sparkles,
    leftPage: {
      badge: "DVORAK ENHANCEMENT CALIBRATION",
      heading: "Automating EIR Satellite Intensity Derivations",
      paragraphs: [
        "The Dvorak technique relates enhanced infrared (EIR) satellite cloud patterns (Central Dense Overcast, eye temperature gradients, and curved banding) to the Tropical Cyclone T-Number and maximum sustained wind velocity.",
        "Current work focuses on calculating temperature deltas between the warm cyclone eye center and the coldest surrounding cloud-top ring to calibrate numerical pressure-wind equations.",
      ],
      equation: {
        label: "Atkinson & Holliday Pressure-Wind Relation:",
        code: "V_max = 3.9 × (P_n - P_c)^0.644   [knots]",
        caption: "Where P_n is peripheral ambient pressure (hPa) and P_c is central eye minimum pressure.",
      },
      keyPoints: [
        "Calculating thermal brightness gradients: ΔT = T(cloud_top_min) - T(eye_max).",
        "Curved band analysis: Measuring spiral wrap log-polar arcs to determine early CI (Current Intensity).",
        "Automating cloud pattern segmentation to remove manual human observer bias in operational forecasts.",
      ],
    },
    rightPage: {
      notesHeading: "Current Experiments & Derivations",
      workingNotes: [
        "Constructing calibrated lookup tables cross-referenced with IMD (India Meteorological Department) historical storm logs.",
        "Calibrating BD-curve temperature thresholds (-30°C to -80°C) on INSAT-3D TIR-1 bands.",
        "Developing a differentiable log-polar transform to auto-measure spiral banding angles.",
      ],
      codeBlock: {
        filename: "dvorak_calibration.py",
        lang: "python",
        code: `def calculate_current_intensity(eye_temp_k, cloud_top_k, p_ambient=1010.0):
    # Thermal gradient between warm eye core & cold eyewall
    delta_t = eye_temp_k - cloud_top_k
    
    # Raw T-Number estimation from EIR gradient
    t_number = 1.5 + (0.052 * delta_t)
    
    # Empirical central pressure drop (hPa)
    central_pressure = p_ambient - ((t_number / 0.85) ** 1.55)
    
    # Max sustained surface wind (knots)
    v_max = 3.9 * ((p_ambient - central_pressure) ** 0.644)
    return round(v_max, 1), round(central_pressure, 1)`,
      },
      marginScribble: {
        text: "Calibrating intensity curves with INSAT-3D thermal band records for Bay of Bengal storms.",
        rotate: 2,
      },
      actionStatus: "Testing automated eye-wall boundary detection against noisy low-light IR tracks.",
    },
  },
  {
    id: "dvorak-ergonomics",
    chapter: "CHAPTER 03 // SYSTEMS & ERGONOMICS",
    tabTitle: "Dvorak Layout & Flow",
    title: "Rewiring Muscle Memory & Keystroke Mechanics",
    category: "ERGONOMICS & DEVELOPER WORKFLOW",
    dateStamp: "ONGOING DAILY ROUTINE",
    status: "NEURAL REWIRING (DAILY DRILLS)",
    icon: Keyboard,
    leftPage: {
      badge: "KEYBOARD PARADIGM SHIFT",
      heading: "Transitioning to the Dvorak Simplified Layout",
      paragraphs: [
        "The standard QWERTY layout was engineered in 1873 to prevent mechanical typewriters from jamming, forcing fingers to make erratic leaps across rows. On QWERTY, only ~32% of typing occurs on the home row.",
        "By contrast, the Dvorak Simplified Layout places all most frequent vowels (AOEUI) on the left home row and common consonants (DHTNS) on the right home row, concentrating over 70% of keystrokes directly under home row resting positions.",
      ],
      equation: {
        label: "Home Row Keystroke Distribution Comparison:",
        code: "Dvorak: ~70% on Home Row  |  QWERTY: ~32% on Home Row",
        caption: "Reduces total daily finger travel distance by over 60%, drastically decreasing forearm fatigue.",
      },
      keyPoints: [
        "Vowels clustered on left hand; consonants on right hand creates rhythmic alternating-hand keystroke flow.",
        "Significant reduction in awkward lateral index and pinky finger extensions.",
        "Preserving modal navigation speed by mapping home-row friendly vim keybindings.",
      ],
    },
    rightPage: {
      notesHeading: "Daily Habit & Speed Curve Log",
      workingNotes: [
        "Week 1: Initial disorientation — typing at 18 WPM while brain rewires spatial letter associations.",
        "Week 2: Transitioned to 45 WPM. Hand fatigue reduced significantly during 6+ hour coding marathons.",
        "Adapting custom keymap layers for code symbols ({ }, [ ], ->, =>, ;) on mechanical keyboard.",
      ],
      codeBlock: {
        filename: "dvorak_home_row.txt",
        lang: "text",
        code: `[ DVORAK SIMPLIFIED HOME ROW MATRIX ]
--------------------------------------------------
Left Hand (Vowels)       | Right Hand (Consonants)
--------------------------------------------------
[ A ]  [ O ]  [ E ]  [ U ]  [ I ]  |  [ D ]  [ H ]  [ T ]  [ N ]  [ S ]
  |      |      |      |      |        |      |      |      |      |
Pinky  Ring   Mid   Index  Index   |  Index Index  Mid   Ring  Pinky
--------------------------------------------------
-> Hand Alternation Rate: 67% (Smooth typing rhythm)
-> Total Daily Finger Travel: Reduced by ~62%`,
      },
      marginScribble: {
        text: "Slow initial climb, but the finger strain reduction during deep coding is night & day.",
        rotate: -2,
      },
      actionStatus: "Maintaining daily 20-minute touch typing drills to target 75+ WPM fluid speed.",
    },
  },
  {
    id: "reading-stack",
    chapter: "CHAPTER 04 // ACTIVE LITERATURE",
    tabTitle: "Reading Stack & Papers",
    title: "Whitepapers, Systems & Deep Learning",
    category: "LITERATURE REVIEW & ENGINEERING PRINCIPLES",
    dateStamp: "CURRENTLY READING",
    status: "IN-DEPTH STUDY",
    icon: BookOpen,
    leftPage: {
      badge: "CURATED READING STACK",
      heading: "Core Papers & Foundational System Architecture",
      paragraphs: [
        "True engineering mastery comes from studying foundational research papers and understanding the design tradeoffs made by world-class system architects.",
        "Here is what is currently open on my desk and reading queue this week — spanning deep convolutional networks, spatial-temporal sequence models, distributed systems, and meteorology standards.",
      ],
      keyPoints: [
        "A ConvNet for the 2020s (Liu, Mao, Wu et al. - Meta AI & UC Berkeley)",
        "Convolutional LSTM Network: Machine Learning for Precipitation Nowcasting (Shi et al.)",
        "Designing Data-Intensive Applications (Martin Kleppmann)",
        "Dvorak Tropical Cyclone Intensity Estimation Guide (WMO / NOAA Technical Guidelines)",
      ],
    },
    rightPage: {
      notesHeading: "Key Insights & Architecture Takeaways",
      workingNotes: [
        "Kleppmann (DDIA): 'Reliability means tolerating faults, not preventing them.' Emphasizing idempotency in my backend APIs.",
        "Liu et al. (ConvNeXt): Re-engineering 7×7 depthwise convolutions and inverted 1×1 expansions achieves ViT-level accuracy with traditional CNN efficiency.",
        "Shi et al. (ConvLSTM): Standard fully-connected LSTMs lose spatial correlation; convolution operators inside state transitions are mandatory for vision.",
      ],
      codeBlock: {
        filename: "reading_tracker.json",
        lang: "json",
        code: `{
  "current_deep_dive": "Designing Data-Intensive Applications",
  "topic": "Distributed Consensus & Partition Tolerance",
  "paper_of_the_week": "A ConvNet for the 2020s (arXiv:2201.03545)",
  "focus_areas": [
    "Spatial-temporal forecasting",
    "Asynchronous microservice boundaries",
    "Physical inductive priors in AI"
  ],
  "philosophy": "Always understand the raw principles beneath the framework."
}`,
      },
      marginScribble: {
        text: "Models are only as good as the telemetry and feature pipeline feeding them. Build robust foundations first.",
        rotate: 2,
      },
      actionStatus: "Extracting architectural patterns for distributed real-time prediction microservices.",
    },
  },
];



// Helper component to render an authentic single printed notebook page with paper physics
function BookPageFace({
  page,
  side,
  pageNumber,
  isTurning = false,
  shadowIntensity = 0,
}: {
  page: LogPage;
  side: "left" | "right";
  pageNumber: number;
  isTurning?: boolean;
  shadowIntensity?: number;
}) {
  const isToc = page.id === "index-toc";

  return (
    <div
      className={cn(
        "w-full h-full p-2.5 xs:p-3.5 sm:p-5 md:p-6 flex flex-col justify-between relative text-foreground select-none overflow-hidden",
        "bg-[#faf7f2] dark:bg-[#131215]",
        side === "left"
          ? "border-r border-zinc-300/70 dark:border-zinc-800/80 shadow-[inset_-22px_0_28px_-12px_rgba(0,0,0,0.16)]"
          : "shadow-[inset_22px_0_28px_-12px_rgba(0,0,0,0.16)]"
      )}
    >
      {/* 1. Authentic Paper Grain & Speckle Background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.045] dark:opacity-[0.06]"
        style={{
          backgroundImage: "radial-gradient(circle at 50% 50%, currentColor 0.8px, transparent 0.8px)",
          backgroundSize: "8px 8px",
        }}
      />

      {/* 2. Realistic Notebook Ruling Lines */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035] dark:opacity-[0.04]"
        style={{
          backgroundImage: "linear-gradient(to bottom, currentColor 1px, transparent 1px)",
          backgroundSize: "100% 21px",
        }}
      />

      {/* 3. Red Vertical Notebook Margin on Left Page */}
      {side === "left" && (
        <div className="pointer-events-none absolute top-0 bottom-0 left-4 sm:left-9 w-[1.5px] bg-red-500/25 dark:bg-red-400/20" />
      )}

      {/* 4. Dynamic Lighting Specular Highlight & Page Curl Shadow */}
      {isTurning && shadowIntensity > 0 && (
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-75 z-20"
          style={{
            background:
              side === "right"
                ? `linear-gradient(to right, rgba(0,0,0,${shadowIntensity * 0.45}) 0%, rgba(255,255,255,${shadowIntensity * 0.2}) 40%, rgba(0,0,0,${shadowIntensity * 0.35}) 100%)`
                : `linear-gradient(to left, rgba(0,0,0,${shadowIntensity * 0.45}) 0%, rgba(255,255,255,${shadowIntensity * 0.2}) 40%, rgba(0,0,0,${shadowIntensity * 0.35}) 100%)`,
          }}
        />
      )}

      {/* 5. Left Page Content vs Right Page Content */}
      {side === "left" ? (
        isToc ? (
          /* TABLE OF CONTENTS - LEFT PAGE */
          <div className="relative z-10 space-y-1.5 sm:space-y-2.5">
            <div className="inline-flex items-center gap-1.5 px-1.5 sm:px-2 py-0.5 rounded bg-amber-500/10 border border-amber-600/30 text-[7px] xs:text-[8px] sm:text-[8.5px] font-mono uppercase tracking-wider text-amber-700 dark:text-amber-300 font-semibold shadow-xs">
              <Bookmark className="h-2 w-2 sm:h-2.5 sm:w-2.5 text-amber-600 dark:text-amber-400" />
              <span>{page.leftPage.badge}</span>
            </div>

            <div>
              <h3 className="font-serif text-sm xs:text-base sm:text-xl font-bold tracking-tight text-foreground leading-snug">
                Table of Contents
              </h3>
              <p className="text-[8.5px] xs:text-[9.5px] sm:text-[10.5px] text-muted-foreground mt-0.5 line-clamp-2">
                {page.leftPage.paragraphs[0]}
              </p>
            </div>

            {/* Dotted Leader Index Table */}
            <div className="space-y-1 sm:space-y-1.5 pt-0.5 sm:pt-1 font-mono text-[8px] xs:text-[9px] sm:text-[10.5px]">
              {[
                { num: "01", title: "ConvNeXt & ConvLSTM Cells", page: "P. 03" },
                { num: "02", title: "Cyclone Dynamics & EIR Formulas", page: "P. 05" },
                { num: "03", title: "Dvorak Keymap & Ergonomics", page: "P. 07" },
                { num: "04", title: "Reading Stack & Foundational Papers", page: "P. 09" },
              ].map((item) => (
                <div key={item.num} className="flex items-baseline justify-between gap-1">
                  <span className="text-amber-600 dark:text-amber-400 font-bold text-[7.5px] sm:text-[9px] shrink-0">
                    {item.num}.
                  </span>
                  <span className="text-foreground/90 font-medium truncate">
                    {item.title}
                  </span>
                  <span className="flex-1 border-b border-dotted border-foreground/30 mx-1 mb-0.5" />
                  <span className="text-muted-foreground font-bold text-[7.5px] sm:text-[9px] shrink-0">
                    {item.page}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-1 sm:pt-1.5 border-t border-border/40">
              <Scribble rotate={-2} className="text-foreground/80 text-[0.7rem] sm:text-[0.85rem] leading-tight">
                ✦ All entries actively synced with local experimental branches.
              </Scribble>
            </div>
          </div>
        ) : (
          /* REGULAR DISPATCH - LEFT PAGE */
          <div className="relative z-10 space-y-1.5 sm:space-y-2.5">
            <div className="inline-flex items-center gap-1.5 px-1.5 sm:px-2 py-0.5 rounded bg-foreground/[0.04] border border-border/70 text-[7.5px] sm:text-[8.5px] font-mono uppercase tracking-wider text-muted-foreground shadow-xs">
              <Bookmark className="h-2 w-2 sm:h-2.5 sm:w-2.5 text-foreground/70" />
              <span>{page.leftPage.badge}</span>
            </div>

            <h3 className="font-serif text-sm xs:text-base sm:text-xl font-medium tracking-tight text-foreground leading-snug">
              {page.leftPage.heading}
            </h3>

            <p className="text-[9px] xs:text-[10px] sm:text-[11px] text-muted-foreground leading-relaxed line-clamp-2 sm:line-clamp-3">
              {page.leftPage.paragraphs[0]}
            </p>

            {/* Equation Box with Paper Inset Border */}
            {page.leftPage.equation && (
              <div className="rounded-lg border border-border/80 bg-foreground/[0.025] p-1.5 sm:p-2.5 font-mono shadow-xs">
                <span className="text-[7.5px] sm:text-[8.5px] text-muted-foreground block mb-0.5 uppercase tracking-wider font-semibold">
                  {page.leftPage.equation.label}
                </span>
                <div className="py-0.5 text-[9px] xs:text-[10px] sm:text-[11px] text-foreground font-semibold tracking-wide overflow-x-hidden">
                  {page.leftPage.equation.code}
                </div>
                <p className="text-[7px] sm:text-[8px] text-muted-foreground/80 italic line-clamp-1">
                  {page.leftPage.equation.caption}
                </p>
              </div>
            )}

            {/* Key Bullet Invariants */}
            <div className="space-y-0.5 sm:space-y-1 pt-0.5">
              {page.leftPage.keyPoints.slice(0, 2).map((point, kIdx) => (
                <div key={kIdx} className="flex items-start gap-1 text-[8.5px] xs:text-[9.5px] sm:text-[10.5px] text-foreground/85 leading-snug">
                  <span className="text-foreground/40 font-mono text-[8px] sm:text-[9px] mt-0.5">•</span>
                  <span className="line-clamp-2">{point}</span>
                </div>
              ))}
            </div>
          </div>
        )
      ) : (
        isToc ? (
          /* TABLE OF CONTENTS - RIGHT PAGE (Research Methodology & Telemetry) */
          <div className="relative z-10 space-y-1.5 sm:space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="font-serif text-xs xs:text-sm sm:text-lg font-bold tracking-tight text-foreground">
                {page.rightPage.notesHeading}
              </h4>
              <span className="text-[7px] sm:text-[8.5px] font-mono text-muted-foreground/70 uppercase">MANIFESTO</span>
            </div>

            <ul className="space-y-0.5 sm:space-y-1">
              {page.rightPage.workingNotes.slice(0, 2).map((note, nIdx) => (
                <li key={nIdx} className="flex items-start gap-1 text-[8.5px] xs:text-[9.5px] sm:text-[10.5px] text-muted-foreground leading-snug">
                  <span className="text-amber-500 font-mono text-[8px] sm:text-[9px] mt-0.5">▸</span>
                  <span className="line-clamp-2">{note}</span>
                </li>
              ))}
            </ul>

            {/* Hardware / Telemetry Stack */}
            <div className="rounded-lg border border-border/80 bg-foreground/[0.025] p-1.5 sm:p-2 font-mono text-[7.5px] xs:text-[8px] sm:text-[9px]">
              <span className="text-[7px] sm:text-[8px] text-muted-foreground block mb-0.5 sm:mb-1 uppercase tracking-wider font-semibold">
                ACTIVE LAB TELEMETRY &amp; TOOLCHAIN:
              </span>
              <div className="grid grid-cols-2 gap-0.5 sm:gap-1 text-foreground/90">
                <div className="flex items-center gap-1 truncate">
                  <span className="text-amber-500">▪</span> <span>PyTorch 2.x + CUDA</span>
                </div>
                <div className="flex items-center gap-1 truncate">
                  <span className="text-amber-500">▪</span> <span>INSAT-3D TIR Bands</span>
                </div>
                <div className="flex items-center gap-1 truncate">
                  <span className="text-amber-500">▪</span> <span>Ergonomic Dvorak</span>
                </div>
                <div className="flex items-center gap-1 truncate">
                  <span className="text-amber-500">▪</span> <span>Distributed Microservices</span>
                </div>
              </div>
            </div>

            {/* Handwritten Margin Note */}
            <div className="p-1.5 sm:p-2 rounded-lg border border-dashed border-border/80 bg-foreground/[0.02]">
              <Scribble rotate={page.rightPage.marginScribble.rotate} className="text-foreground/90 text-[0.7rem] sm:text-[0.85rem] font-medium leading-tight">
                ✦ {page.rightPage.marginScribble.text}
              </Scribble>
            </div>
          </div>
        ) : (
          /* REGULAR DISPATCH - RIGHT PAGE */
          <div className="relative z-10 space-y-1.5 sm:space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="font-serif text-xs xs:text-sm sm:text-lg font-medium tracking-tight text-foreground">
                {page.rightPage.notesHeading}
              </h4>
              <span className="text-[7px] sm:text-[8.5px] font-mono text-muted-foreground/70 uppercase">OBSERVATIONS</span>
            </div>

            {/* Working Observations */}
            <ul className="space-y-0.5 sm:space-y-1">
              {page.rightPage.workingNotes.slice(0, 2).map((note, nIdx) => (
                <li key={nIdx} className="flex items-start gap-1 text-[8.5px] xs:text-[9.5px] sm:text-[10.5px] text-muted-foreground leading-snug">
                  <span className="text-foreground/50 font-mono text-[8px] sm:text-[9px] mt-0.5">▸</span>
                  <span className="line-clamp-2">{note}</span>
                </li>
              ))}
            </ul>

            {/* Clean Terminal Snippet */}
            {page.rightPage.codeBlock && (
              <div className="rounded-lg border border-border/80 bg-zinc-950 text-zinc-200 overflow-hidden shadow-sm">
                <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/90 px-2 py-0.5 sm:px-2.5 sm:py-1">
                  <span className="text-[7.5px] sm:text-[8.5px] font-mono text-zinc-400 truncate max-w-[100px] sm:max-w-[120px]">
                    {page.rightPage.codeBlock.filename}
                  </span>
                  <span className="text-[7px] sm:text-[8px] font-mono uppercase tracking-widest text-zinc-500">
                    {page.rightPage.codeBlock.lang}
                  </span>
                </div>
                <pre className="p-1.5 sm:p-2 text-[8px] xs:text-[8.5px] sm:text-[9.5px] font-mono leading-tight overflow-hidden text-zinc-300 max-h-[65px] sm:max-h-[85px]">
                  <code>{page.rightPage.codeBlock.code}</code>
                </pre>
              </div>
            )}

            {/* Handwritten Margin Note with slight rotation */}
            <div className="p-1.5 sm:p-2 rounded-lg border border-dashed border-border/80 bg-foreground/[0.02]">
              <Scribble rotate={page.rightPage.marginScribble.rotate} className="text-foreground/90 text-[0.7rem] sm:text-[0.85rem] font-medium leading-tight">
                ✦ {page.rightPage.marginScribble.text}
              </Scribble>
            </div>
          </div>
        )
      )}

      {/* Page Footer */}
      <div className="pt-1.5 sm:pt-2 border-t border-border/40 flex items-center justify-between text-[7.5px] sm:text-[9px] font-mono text-muted-foreground/60 shrink-0">
        <span className="truncate max-w-[120px] sm:max-w-[170px]">
          {side === "left" ? "SACHIN YADAV // FIELD NOTES" : page.rightPage.actionStatus}
        </span>
        <span>PAGE 0{pageNumber}</span>
      </div>
    </div>
  );
}

// Reusable component for the Front Cover Leather & Gold Foil Artwork
function FrontCoverArtwork({
  glintX,
  glintY,
  roundedClass = "rounded-r-2xl",
}: {
  glintX: number;
  glintY: number;
  roundedClass?: string;
}) {
  return (
    <div className={cn("absolute inset-0 border-2 border-amber-800/60 bg-[#151311] overflow-hidden p-3.5 sm:p-5 md:p-6 flex flex-col justify-between select-none [backface-visibility:hidden] shadow-[inset_0_0_80px_rgba(0,0,0,0.9),0_25px_50px_rgba(0,0,0,0.8)]", roundedClass)}>
      {/* Leather grain & texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.15] mix-blend-overlay"
        style={{
          backgroundImage: "radial-gradient(circle at 50% 50%, #d4af37 1px, transparent 1px)",
          backgroundSize: "6px 6px",
        }}
      />

      {/* Dynamic Specular Sheen moving with mouse */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-150"
        style={{
          background: `radial-gradient(circle 380px at ${glintX}% ${glintY}%, rgba(255,223,130,0.24) 0%, rgba(255,255,255,0.04) 40%, transparent 70%)`,
        }}
      />

      {/* 4 Ornate Brass Filigree Hardware Corners */}
      <div className="absolute top-2 left-2 w-7 h-7 border-t-2 border-l-2 border-amber-400 rounded-tl-sm pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
        <div className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-amber-200/90 shadow-sm" />
        <div className="absolute top-0.5 left-2 w-2 h-[1px] bg-amber-500/60" />
        <div className="absolute top-2 left-0.5 w-[1px] h-2 bg-amber-500/60" />
      </div>
      <div className="absolute top-2 right-2 w-7 h-7 border-t-2 border-r-2 border-amber-400 rounded-tr-sm pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
        <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-200/90 shadow-sm" />
        <div className="absolute top-0.5 right-2 w-2 h-[1px] bg-amber-500/60" />
        <div className="absolute top-2 right-0.5 w-[1px] h-2 bg-amber-500/60" />
      </div>
      <div className="absolute bottom-2 left-2 w-7 h-7 border-b-2 border-l-2 border-amber-400 rounded-bl-sm pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
        <div className="absolute bottom-1 left-1 w-1.5 h-1.5 rounded-full bg-amber-200/90 shadow-sm" />
        <div className="absolute bottom-0.5 left-2 w-2 h-[1px] bg-amber-500/60" />
        <div className="absolute bottom-2 left-0.5 w-[1px] h-2 bg-amber-500/60" />
      </div>
      <div className="absolute bottom-2 right-2 w-7 h-7 border-b-2 border-r-2 border-amber-400 rounded-br-sm pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
        <div className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-200/90 shadow-sm" />
        <div className="absolute bottom-0.5 right-2 w-2 h-[1px] bg-amber-500/60" />
        <div className="absolute bottom-2 right-0.5 w-[1px] h-2 bg-amber-500/60" />
      </div>

      {/* Saddle Stitching Gold Thread Border */}
      <div className="absolute inset-3 rounded-xl border border-dashed border-amber-500/35 pointer-events-none" />
      <div className="absolute inset-4.5 rounded-lg border border-amber-500/20 pointer-events-none" />

      {/* Top Foil Header */}
      <div className="relative z-10 text-center pt-0.5">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-[7.5px] sm:text-[8px] font-mono uppercase tracking-[0.22em] text-amber-300 font-semibold shadow-inner">
          <ShieldCheck className="h-2.5 w-2.5 text-amber-400" />
          <span>ARCHIVAL LAB JOURNAL • NO. 402</span>
        </div>
        <span className="text-[7px] sm:text-[7.5px] font-mono tracking-[0.25em] uppercase text-zinc-400 block mt-1">
          EST. 2026 // NEURAL SYSTEMS &amp; ALGORITHMS
        </span>
      </div>

      {/* Centerpiece Embossed Insignia */}
      <div className="relative z-10 text-center my-auto py-1 sm:py-2">
        {/* Celestial Orbit & Astrolabe Insignia */}
        <div className="relative mx-auto w-16 h-16 sm:w-22 sm:h-22 mb-2 sm:mb-3 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-amber-500/40 animate-[spin_20s_linear_infinite]" />
          <div className="absolute inset-1.5 rounded-full border border-dashed border-amber-400/30 animate-[spin_12s_linear_infinite_reverse]" />
          <div className="absolute inset-3.5 rounded-full border border-amber-500/50 bg-gradient-to-br from-amber-500/20 via-amber-700/10 to-transparent flex items-center justify-center shadow-[inset_0_0_15px_rgba(217,119,6,0.3)]">
            <div className="relative flex items-center justify-center">
              <Compass className="h-6 w-6 sm:h-8 sm:w-8 text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
              <Atom className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-amber-200 absolute -top-1 -right-1 animate-pulse" />
            </div>
          </div>
          {/* Cardinal Point Markers */}
          <span className="absolute -top-1 font-mono text-[7px] text-amber-400/80 font-bold">N</span>
          <span className="absolute -bottom-1 font-mono text-[7px] text-amber-400/80 font-bold">S</span>
          <span className="absolute -left-1 font-mono text-[7px] text-amber-400/80 font-bold">W</span>
          <span className="absolute -right-1 font-mono text-[7px] text-amber-400/80 font-bold">E</span>
        </div>

        <div className="text-[7.5px] sm:text-[8px] font-serif italic tracking-widest uppercase text-amber-400/70 mb-1">
          « Nullius In Verba »
        </div>

        <h3 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-300 to-amber-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] leading-tight">
          The Research Log
        </h3>

        <div className="w-16 sm:w-20 h-[1.5px] bg-gradient-to-r from-transparent via-amber-400/60 to-transparent mx-auto my-1.5 sm:my-2" />

        <p className="text-[7.5px] sm:text-[8.5px] font-mono tracking-wider uppercase text-amber-200/90 font-medium line-clamp-1">
          ConvNeXt • ConvLSTM • Cyclones • Dvorak
        </p>
      </div>

      {/* Bottom Author Seal */}
      <div className="relative z-10 text-center pb-0.5">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded border border-amber-600/40 bg-black/40 shadow-sm">
          <Feather className="h-2.5 w-2.5 text-amber-400" />
          <span className="text-[8px] sm:text-[8.5px] font-mono tracking-[0.2em] uppercase text-amber-200 font-bold">
            SACHIN YADAV
          </span>
        </div>
        <span className="text-[7px] font-mono text-zinc-500 uppercase block mt-1 tracking-wider">
          SCROLL DOWN TO UNLOCK &amp; OPEN JOURNAL ↓
        </span>
      </div>

      {/* Red Silk Bookmark Ribbon with Notch */}
      <div className="absolute -bottom-7 left-8 sm:left-10 w-3.5 sm:w-4 h-12 bg-gradient-to-b from-red-800 to-red-600 shadow-lg rounded-b z-30 flex items-end justify-center pb-1 border-b border-amber-400/40">
        <div className="w-1.5 h-1.5 rotate-45 bg-amber-400/80" />
      </div>
    </div>
  );
}

// Helper component for the authentic Vintage Leather Cover & Marbled Endpaper (rotating leaf)
function BookCover({
  coverAngle,
  glintX,
  glintY,
}: {
  coverAngle: number;
  glintX: number;
  glintY: number;
}) {
  return (
    <div
      className="absolute right-0 top-0 w-1/2 h-full origin-left [transform-style:preserve-3d] z-40 shadow-2xl transition-transform duration-75"
      style={{
        transform: `rotateY(${coverAngle}deg)`,
      }}
    >
      {/* 1. FRONT OF COVER (Visible when closed, rotateY: 0deg to -90deg) */}
      <FrontCoverArtwork glintX={glintX} glintY={glintY} roundedClass="rounded-r-2xl" />

      {/* 2. BACK OF FRONT COVER (Marbled Endpaper + Ex Libris Bookplate landing on Left) */}
      <div className="absolute inset-0 rounded-l-2xl bg-[#1c1917] border-2 border-amber-900/40 p-4 sm:p-5 flex flex-col justify-between select-none shadow-[inset_0_0_60px_rgba(0,0,0,0.85)] [transform:rotateY(180deg)] [backface-visibility:hidden]">
        {/* Marbled Paper Texture Effect */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.22] mix-blend-screen"
          style={{
            backgroundImage:
              "repeating-radial-gradient(circle at 30% 40%, #78350f 0px, #1c1917 12px, #92400e 24px, #0f172a 36px)",
            backgroundSize: "180px 180px",
          }}
        />

        {/* Vintage Ex Libris Archival Bookplate */}
        <div className="relative z-10 m-auto w-full max-w-[260px] sm:max-w-[280px] rounded-lg border-2 border-double border-amber-600/60 bg-[#faf6ee] dark:bg-[#181614] p-3.5 sm:p-4 text-center text-foreground shadow-xl">
          <div className="border border-dashed border-amber-700/40 p-2.5 sm:p-3">
            <span className="font-serif text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-amber-700 dark:text-amber-400 font-bold block">
              EX LIBRIS
            </span>
            <h4 className="font-serif text-base sm:text-lg font-bold tracking-tight text-foreground my-0.5 sm:my-1">
              Sachin Yadav
            </h4>
            <div className="w-12 h-[1px] bg-amber-600/50 mx-auto my-1.5" />
            <p className="text-[8px] sm:text-[8.5px] font-mono text-muted-foreground leading-relaxed line-clamp-3">
              Personal Research &amp; Architectural Field Journal. Dedicated to exploring deep neural vision, distributed mechanics, and elegant computing paradigms.
            </p>
            <div className="mt-2 pt-1.5 border-t border-amber-600/30 flex items-center justify-between text-[7px] sm:text-[7.5px] font-mono text-muted-foreground/80 uppercase">
              <span>VOL. 01 / LAB 2026</span>
              <span>CONFIDENTIAL</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-center text-[7.5px] font-mono text-zinc-500 uppercase tracking-widest">
          FIELD NOTE DISPATCHES • READY
        </div>
      </div>
    </div>
  );
}

function ResearchLogBookSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [scrollP, setScrollP] = useState(0);

  // 3D Gyroscope / Mouse Parallax Tilt State
  const [mouseTilt, setMouseTilt] = useState({ x: 0, y: 0, glintX: 50, glintY: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width;
    const ny = (e.clientY - rect.top) / rect.height;
    setMouseTilt({
      x: (ny - 0.5) * -10, // -5deg to +5deg pitch
      y: (nx - 0.5) * 14,  // -7deg to +7deg yaw
      glintX: nx * 100,
      glintY: ny * 100,
    });
  };

  const handleMouseLeave = () => {
    setMouseTilt({ x: 0, y: 0, glintX: 50, glintY: 50 });
  };

  useEffect(() => {
    let frame = 0;
    const tick = () => {
      frame = 0;
      const node = sectionRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const distance = node.offsetHeight - window.innerHeight;
      const p = Math.min(1, Math.max(0, -rect.top / Math.max(1, distance)));
      setScrollP(p);
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    tick();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Physical Book Animation Flow (5 Spreads):
  // p: 0.00 -> 0.14 : Closed Hardcover Book resting in center (100% SINGLE-SIDED)
  // p: 0.14 -> 0.26 : Cover OPENS in 3D (0deg -> -180deg) into 2-page spread
  // p: 0.26 -> 0.44 : Spread 0 (Table of Contents & Index)
  // p: 0.44 -> 0.62 : Spread 1 (ConvNeXt & ConvLSTM)
  // p: 0.62 -> 0.80 : Spread 2 (Cyclone Dynamics & Dvorak)
  // p: 0.80 -> 0.92 : Spread 3 (Dvorak Layout & Flow)
  // p: 0.92 -> 1.00 : Spread 4 (Reading Stack & Papers)
  // ---------------------------------------------------------------------------

  const isCoverClosed = scrollP < 0.14;
  const isBookFullyOpen = scrollP >= 0.26;

  // Cover opening angle: 0deg when closed, -180deg when fully opened
  const coverT = Math.min(1, Math.max(0, (scrollP - 0.14) / 0.12));
  const coverAngle = coverT * -180;

  // Calculate which spread is active & its internal flip progress across 5 spreads
  const openProgress = Math.min(1, Math.max(0, (scrollP - 0.26) / 0.74));
  const scaledProgress = openProgress * 4; // 0 to 4 range across 5 spreads
  const currentSpreadIdx = Math.min(4, Math.floor(scaledProgress));
  const intraProgress = scaledProgress - currentSpreadIdx;

  // Page turn physics calculations:
  const isTurningLeaf = isBookFullyOpen && currentSpreadIdx < 4 && intraProgress > 0.65;
  const leafTurnT = isTurningLeaf ? (intraProgress - 0.65) / 0.35 : 0;
  const leafAngle = leafTurnT * -180; // 0deg -> -180deg
  
  // Physical Paper Arch & Curl physics:
  const archProgress = Math.sin(leafTurnT * Math.PI);
  const paperSkewY = archProgress * 3.2; // 3.2deg flex
  const paperRotateZ = (leafTurnT - 0.5) * archProgress * -3.5; // realistic corner lift
  const shadowIntensity = archProgress;

  const currentSpread = researchPages[currentSpreadIdx];
  const nextSpread = researchPages[Math.min(4, currentSpreadIdx + 1)];

  // Stack thickness calculations
  const leftStackPx = isBookFullyOpen ? currentSpreadIdx * 2 + 2 : 2;
  const rightStackPx = isBookFullyOpen ? (4 - currentSpreadIdx) * 2 + 2 : 8;

  return (
    <section
      id="research-book"
      ref={sectionRef}
      className="relative h-[420vh] border-t border-border/80 bg-background"
    >
      {/* Sticky Viewport Stage */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-center items-center px-4 sm:px-6 overflow-hidden">
        {/* Header Badges */}
        <div className="text-center mb-2 sm:mb-3 max-w-lg mx-auto select-none flex flex-col items-center z-10">
          <div className="inline-flex items-center gap-2 mb-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-foreground/40 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-foreground" />
            </span>
            <span className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase font-semibold">
              Live Field Journal
            </span>
          </div>

          <h2 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-foreground">
            The Research Book.
          </h2>
          <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
            {isCoverClosed && "Scroll down to unfold journal ↓"}
            {!isCoverClosed && !isBookFullyOpen && "Lifting hardcover & revealing pages..."}
            {isBookFullyOpen && (currentSpreadIdx === 0 ? "Table of Contents & Index // Scroll to turn pages ↓" : `Dispatch 0${currentSpreadIdx} of 04 // ${currentSpread.tabTitle} ↓`)}
          </p>
        </div>

        {/* 3D Physical Book Stage with Gyroscopic Hover Physics */}
        <div
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative w-full max-w-[840px] h-[450px] xs:h-[480px] sm:h-[510px] flex items-center justify-center [perspective:2200px]"
        >
          {/* ============================================================== */}
          {/* CASE 1: CLOSED BOOK (100% SINGLE-SIDED, CENTERED HARDCOVER)     */}
          {/* ============================================================== */}
          {isCoverClosed ? (
            <div
              className="relative w-[300px] xs:w-[350px] sm:w-[410px] h-[440px] xs:h-[480px] sm:h-[510px] rounded-2xl border-2 border-zinc-800/90 bg-[#121110] p-1.5 sm:p-2 shadow-[0_35px_80px_-15px_rgba(0,0,0,0.9),0_10px_30px_rgba(0,0,0,0.5)] transition-transform duration-150 ease-out origin-center [transform-style:preserve-3d]"
              style={{
                transform: `rotateX(${mouseTilt.x}deg) rotateY(${mouseTilt.y}deg)`,
              }}
            >
              {/* Raised Spine Binding Straps on Left Edge */}
              <div className="absolute -left-2 top-10 w-2 h-5 bg-gradient-to-r from-amber-800 to-amber-950 rounded-l shadow-md border-y border-l border-amber-600/40 z-30" />
              <div className="absolute -left-2 top-28 w-2 h-5 bg-gradient-to-r from-amber-800 to-amber-950 rounded-l shadow-md border-y border-l border-amber-600/40 z-30" />
              <div className="absolute -left-2 bottom-28 w-2 h-5 bg-gradient-to-r from-amber-800 to-amber-950 rounded-l shadow-md border-y border-l border-amber-600/40 z-30" />
              <div className="absolute -left-2 bottom-10 w-2 h-5 bg-gradient-to-r from-amber-800 to-amber-950 rounded-l shadow-md border-y border-l border-amber-600/40 z-30" />

              {/* Compressed Page Stack on Right Edge */}
              <div className="absolute -right-2 top-3 bottom-3 w-2.5 rounded-r bg-gradient-to-r from-zinc-400 to-zinc-300 dark:from-zinc-800 dark:to-zinc-700 border-r border-zinc-500/30" />

              {/* Single Front Cover Face */}
              <div className="relative w-full h-full rounded-xl overflow-hidden shadow-inner">
                <FrontCoverArtwork glintX={mouseTilt.glintX} glintY={mouseTilt.glintY} roundedClass="rounded-xl" />
              </div>

              {/* Red Silk Ribbon trailing through bottom center */}
              <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 w-4 h-12 bg-gradient-to-b from-red-800 to-red-600 shadow-md rounded-b z-30 flex items-end justify-center pb-1 border-b border-amber-400/50">
                <div className="w-1.5 h-1.5 rotate-45 bg-amber-400" />
              </div>
            </div>
          ) : (
            /* ============================================================== */
            /* CASE 2: OPENING & OPEN BOOK (TWO-PAGE SPREAD WITH 3D TURNING)   */
            /* ============================================================== */
            <div
              className="relative w-full h-full rounded-2xl border-2 border-zinc-800/90 bg-[#121110] p-2 sm:p-2.5 shadow-[0_35px_80px_-15px_rgba(0,0,0,0.9),0_10px_30px_rgba(0,0,0,0.5)] flex flex-col justify-between transition-transform duration-150 ease-out origin-center [transform-style:preserve-3d]"
              style={{
                transform: `rotateX(${mouseTilt.x}deg) rotateY(${mouseTilt.y}deg)`,
              }}
            >
              {/* 4 Solid Corner Brass Brackets */}
              <div className="absolute top-1.5 left-1.5 w-5 h-5 border-t-2 border-l-2 border-amber-500/80 rounded-tl-sm pointer-events-none z-30" />
              <div className="absolute top-1.5 right-1.5 w-5 h-5 border-t-2 border-r-2 border-amber-500/80 rounded-tr-sm pointer-events-none z-30" />
              <div className="absolute bottom-1.5 left-1.5 w-5 h-5 border-b-2 border-l-2 border-amber-500/80 rounded-bl-sm pointer-events-none z-30" />
              <div className="absolute bottom-1.5 right-1.5 w-5 h-5 border-b-2 border-r-2 border-amber-500/80 rounded-br-sm pointer-events-none z-30" />

              {/* Raised Spine Binding Straps on Left Edge */}
              <div className="absolute -left-2 top-10 w-2 h-5 bg-gradient-to-r from-amber-800 to-amber-950 rounded-l shadow-md border-y border-l border-amber-600/40 z-30 hidden sm:block" />
              <div className="absolute -left-2 top-28 w-2 h-5 bg-gradient-to-r from-amber-800 to-amber-950 rounded-l shadow-md border-y border-l border-amber-600/40 z-30 hidden sm:block" />
              <div className="absolute -left-2 bottom-28 w-2 h-5 bg-gradient-to-r from-amber-800 to-amber-950 rounded-l shadow-md border-y border-l border-amber-600/40 z-30 hidden sm:block" />
              <div className="absolute -left-2 bottom-10 w-2 h-5 bg-gradient-to-r from-amber-800 to-amber-950 rounded-l shadow-md border-y border-l border-amber-600/40 z-30 hidden sm:block" />

              {/* Dynamic Compressed Page Stack Thickness on Sides */}
              <div
                className="absolute -left-1.5 top-3 bottom-3 rounded-l bg-gradient-to-r from-zinc-300 to-zinc-400 dark:from-zinc-700 dark:to-zinc-800 transition-all duration-300 border-l border-zinc-500/30"
                style={{ width: `${leftStackPx}px` }}
              />
              <div
                className="absolute -right-1.5 top-3 bottom-3 rounded-r bg-gradient-to-r from-zinc-400 to-zinc-300 dark:from-zinc-800 dark:to-zinc-700 transition-all duration-300 border-r border-zinc-500/30"
                style={{ width: `${rightStackPx}px` }}
              />

              {/* Physical Colored Paper Index Divider Tabs on Right Edge */}
              {isBookFullyOpen && (
                <div className="absolute -right-3.5 sm:-right-5 top-12 bottom-12 flex flex-col justify-around pointer-events-auto z-40">
                  {[
                    { label: "INDEX", num: "00", color: "bg-amber-600 text-amber-50 border-amber-800", spread: 0 },
                    { label: "VISION", num: "01", color: "bg-emerald-700 text-emerald-50 border-emerald-900", spread: 1 },
                    { label: "CYCLONE", num: "02", color: "bg-sky-700 text-sky-50 border-sky-900", spread: 2 },
                    { label: "DVORAK", num: "03", color: "bg-rose-700 text-rose-50 border-rose-900", spread: 3 },
                    { label: "PAPERS", num: "04", color: "bg-violet-700 text-violet-50 border-violet-900", spread: 4 },
                  ].map((tab) => {
                    const isActive = currentSpreadIdx === tab.spread;
                    return (
                      <button
                        key={tab.label}
                        type="button"
                        onClick={() => {
                          if (sectionRef.current) {
                            const distance = sectionRef.current.offsetHeight - window.innerHeight;
                            const targetP = 0.26 + (tab.spread / 4) * 0.72;
                            window.scrollTo({
                              top: sectionRef.current.offsetTop + targetP * distance,
                              behavior: "smooth",
                            });
                          }
                        }}
                        className={cn(
                          "h-7 sm:h-8 rounded-r-md pl-1.5 pr-2 py-0.5 text-[7.5px] sm:text-[8px] font-mono font-bold tracking-tighter uppercase transition-all duration-200 flex items-center justify-center shadow-md border-y border-r",
                          tab.color,
                          isActive
                            ? "translate-x-2 sm:translate-x-3.5 shadow-lg brightness-110 scale-105"
                            : "opacity-60 hover:opacity-100 hover:translate-x-1"
                        )}
                        title={`Flip to ${tab.label}`}
                      >
                        <span className="hidden sm:inline">{tab.label}</span>
                        <span className="sm:hidden">{tab.num}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Center Spine Stitch Line & Deep Gutter Shadow */}
              <div className="absolute left-1/2 top-2 bottom-2 -translate-x-1/2 w-10 bg-gradient-to-r from-black/55 via-black/15 to-black/55 z-30 pointer-events-none hidden md:block" />
              <div className="absolute left-1/2 top-2 bottom-2 -translate-x-1/2 w-[1.5px] bg-zinc-600/60 z-30 pointer-events-none hidden md:block" />

              {/* Inside 3D Book Stage (Two-Page Base + Flipping Leaf + Opening Cover) */}
              <div className="relative w-full h-full rounded-xl overflow-hidden shadow-inner flex [perspective:2200px] [transform-style:preserve-3d]">
                {/* 1. LEFT PAGE (Base) */}
                <div className="w-1/2 h-full relative">
                  <BookPageFace
                    page={currentSpread}
                    side="left"
                    pageNumber={currentSpreadIdx * 2 + 1}
                  />
                </div>

                {/* 2. RIGHT PAGE (Base - reveals next spread underneath turning leaf) */}
                <div className="w-1/2 h-full relative">
                  <BookPageFace
                    page={isTurningLeaf ? nextSpread : (isBookFullyOpen ? currentSpread : researchPages[0])}
                    side="right"
                    pageNumber={isTurningLeaf ? (currentSpreadIdx + 1) * 2 + 2 : (isBookFullyOpen ? currentSpreadIdx * 2 + 2 : 2)}
                  />

                  {/* Drop shadow cast over right page while cover is lifting */}
                  {!isBookFullyOpen && (
                    <div
                      className="absolute inset-0 pointer-events-none bg-black transition-opacity duration-75 z-10"
                      style={{
                        opacity: Math.max(0, 1 - coverT * 1.5) * 0.7,
                      }}
                    />
                  )}
                </div>

                {/* 3. 3D OPENING COVER (Active when scrollP < 0.26) */}
                {!isBookFullyOpen && (
                  <BookCover
                    coverAngle={coverAngle}
                    glintX={mouseTilt.glintX}
                    glintY={mouseTilt.glintY}
                  />
                )}

                {/* 4. DYNAMIC 3D FLIPPING LEAF (Turns between spreads when book is open) */}
                {isTurningLeaf && (
                  <div
                    className="absolute right-0 top-0 w-1/2 h-full origin-left [transform-style:preserve-3d] z-20 pointer-events-none shadow-2xl transition-transform duration-75"
                    style={{
                      transform: `rotateY(${leafAngle}deg) skewY(${paperSkewY}deg) rotateZ(${paperRotateZ}deg)`,
                    }}
                  >
                    {/* Leaf Front (Current Right Page) */}
                    <div className="absolute inset-0 [backface-visibility:hidden]">
                      <BookPageFace
                        page={currentSpread}
                        side="right"
                        pageNumber={currentSpreadIdx * 2 + 2}
                        isTurning={true}
                        shadowIntensity={shadowIntensity}
                      />
                    </div>

                    {/* Leaf Back (Next Left Page landing on the left) */}
                    <div className="absolute inset-0 [transform:rotateY(180deg)] [backface-visibility:hidden]">
                      <BookPageFace
                        page={nextSpread}
                        side="left"
                        pageNumber={(currentSpreadIdx + 1) * 2 + 1}
                        isTurning={true}
                        shadowIntensity={shadowIntensity}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Red Silk Ribbon trailing through bottom center */}
              <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 w-4 h-12 bg-gradient-to-b from-red-800 to-red-600 shadow-md rounded-b z-30 hidden sm:flex items-end justify-center pb-1 border-b border-amber-400/50">
                <div className="w-1.5 h-1.5 rotate-45 bg-amber-400" />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// A handwritten margin note, like scribbles on the page.
function Scribble({ className, rotate = -10, children }: { className?: string; rotate?: number; children: ReactNode }) {
  return (
    <p className={cn("font-hand text-[1.05rem] leading-[1.3] tracking-[0.08em] text-foreground/75", className)} style={{ rotate: `${rotate}deg` }}>
      {children}
    </p>
  );
}

// A small hand-drawn arrow. `d` is the stroke; the head is drawn at its end.
function ScribbleArrow({ d, head, className, style }: { d: string; head: string; className?: string; style?: CSSProperties }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 60 60" className={cn("absolute h-10 w-10 overflow-visible text-foreground/70", className)} style={style}>
      <path d={d} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d={head} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const pill = "inline-flex items-center justify-between gap-10 rounded-xl px-5 text-[1.05rem] transition-colors";

// The closing section: user arrives to Sachin's portrait front & center.
// On scroll, the section stays pinned while the photo recedes into the background
// and the original open-canvas text ("oh, hi. i'm sachin...") smoothly emerges.
function OhHi() {
  const sectionRef = useRef<HTMLElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const backToTopRef = useRef<HTMLButtonElement>(null);
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    void navigator.clipboard?.writeText(EMAIL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  useEffect(() => {
    let frame = 0;
    const tick = () => {
      frame = 0;
      const node = sectionRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      const distance = node.offsetHeight - window.innerHeight;
      const p = Math.min(1, Math.max(0, -rect.top / Math.max(1, distance)));

      // Moment 1 (Arrival & Focus, p from 0 to 0.35): Photo commands full attention centered front & center.
      // Moment 2 (Intentional Shift, p from 0.35 to 0.68): Photo shifts decisively to the right.
      // Moment 3 (Settled, p > 0.68): Text and social actions are fully active.
      const isDesktop = window.innerWidth >= 768;
      const t = Math.min(1, Math.max(0, (p - 0.35) / 0.33));
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      if (photoRef.current) {
        if (isDesktop) {
          const shiftX = ease * 26; // shifts 26vw to the right
          const scale = 1 - ease * 0.04;
          photoRef.current.style.transform = `translate3d(${shiftX}vw, 0, 0) scale(${scale})`;
          photoRef.current.style.opacity = "1";
          photoRef.current.style.filter = "none";
        } else {
          const translateY = ease * -10;
          const scale = 1 - ease * 0.05;
          photoRef.current.style.transform = `translate3d(0, ${translateY}px, 0) scale(${scale})`;
          photoRef.current.style.opacity = "1";
          photoRef.current.style.filter = "none";
        }
      }

      const textT = Math.min(1, Math.max(0, (p - 0.38) / 0.30));
      const textEase = textT < 0.5 ? 4 * textT * textT * textT : 1 - Math.pow(-2 * textT + 2, 3) / 2;
      const translateY = (1 - textEase) * 26;

      if (textRef.current) {
        textRef.current.style.opacity = `${textEase}`;
        textRef.current.style.transform = `translate3d(0, ${translateY}px, 0)`;
        textRef.current.style.pointerEvents = textT > 0.4 ? "auto" : "none";
      }

      if (backToTopRef.current) {
        backToTopRef.current.style.opacity = `${textEase}`;
        backToTopRef.current.style.pointerEvents = textT > 0.4 ? "auto" : "none";
      }
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    tick();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section
      id="hi"
      ref={sectionRef}
      className="relative h-[250vh] border-t border-border/80 bg-background"
    >
      {/* Sticky Pinned Viewport — stays pinned in place through the entire scroll */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-center px-5 py-6 sm:px-8 md:px-[4.5vw] overflow-hidden">
        {/* Background Photo Stage — Clean transparent portrait without drop-shadows or dark halo */}
        <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center select-none overflow-hidden">
          {/* Sachin's Portrait Layer */}
          <div
            ref={photoRef}
            className="relative max-h-[76vh] h-[72vh] w-auto will-change-transform flex items-center justify-center"
            style={{
              opacity: 1,
              transform: "translate3d(0, 0, 0) scale(1)",
              filter: "none",
            }}
          >
            <img
              src={sachinPortrait}
              alt="Sachin Yadav portrait"
              className="h-full w-auto max-h-[76vh] object-contain select-none pointer-events-none"
              draggable={false}
            />
          </div>
        </div>

        {/* Foreground OG Text Section — Open canvas typography */}
        <div
          ref={textRef}
          className="relative z-10 w-full md:max-w-[56vw] will-change-transform"
          style={{ opacity: 0, transform: "translate3d(0, 26px, 0)", pointerEvents: "none" }}
        >
          <div className="relative w-fit">
            <Scribble className="absolute -left-1 -top-12 hidden md:block" rotate={-10}>
              let&apos;s build together ✦
            </Scribble>
            <ScribbleArrow
              className="-left-8 -top-6 hidden md:block"
              d="M26 4 C12 10 6 22 10 36"
              head="M10 36 L4 27 M10 36 L16 29"
            />
            <h2 className="font-serif text-[clamp(2.2rem,4.2vw,4.4rem)] leading-[0.98] tracking-[-0.01em] text-foreground">
              <span>where logic meets imagination.</span>
              <br />
              i&apos;m <em>sachin yadav</em>.
            </h2>
          </div>

          <p className="mt-3 text-[clamp(0.95rem,1.15vw,1.15rem)] leading-[1.35] text-muted-foreground font-mono">
            software engineer &amp; problem solver.<br />
            building scalable systems &amp; intelligent web applications.<br />
            always curious. always shipping.
          </p>

          <p className="mt-4 font-serif text-[clamp(1.4rem,2.1vw,2.2rem)] leading-[1.15] text-foreground">
            got an ambitious idea or project?<br />
            let&apos;s build something <em>extraordinary</em>.
          </p>

          {/* Action buttons */}
          <div className="relative mt-5 flex w-fit flex-col items-start gap-3">
            {/* Primary Email CTA + Quick Copy */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              <a
                href={`mailto:${EMAIL}`}
                className="group inline-flex items-center gap-2.5 rounded-full bg-foreground px-4 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-medium text-background shadow-md transition-all duration-300 hover:bg-foreground/90 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                data-cursor="drop me an email anytime"
              >
                <Mail className="h-3.5 w-3.5 opacity-80 transition-transform group-hover:scale-110" />
                <span>{EMAIL}</span>
                <ArrowUpRight className="h-3.5 w-3.5 opacity-70 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
              </a>

              <button
                type="button"
                onClick={handleCopyEmail}
                className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-background/80 px-3.5 py-2 sm:py-2.5 text-xs font-mono text-muted-foreground backdrop-blur-md transition-all duration-200 hover:border-foreground/40 hover:text-foreground hover:bg-foreground/5 active:scale-95"
                title="Copy email address"
                data-cursor="copy email to clipboard"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="font-medium text-emerald-500">copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 opacity-70" />
                    <span>copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Social Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={LINKS.linkedin}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/80 px-3.5 py-1.5 sm:py-2 text-xs font-medium text-foreground backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/50 hover:bg-foreground/[0.06] hover:shadow-md active:translate-y-0"
                data-cursor="connect with me on linkedin"
              >
                <svg className="h-3.5 w-3.5 fill-current text-foreground/80 transition-colors group-hover:text-foreground" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.64a1.64 1.64 0 1 0 0 3.28 1.64 1.64 0 0 0 0-3.28z" />
                </svg>
                <span>LinkedIn</span>
                <ArrowUpRight className="h-3 w-3 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
              </a>

              <a
                href={LINKS.github}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/80 px-3.5 py-1.5 sm:py-2 text-xs font-medium text-foreground backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/50 hover:bg-foreground/[0.06] hover:shadow-md active:translate-y-0"
                data-cursor="explore repositories & code"
              >
                <svg className="h-3.5 w-3.5 fill-current text-foreground/80 transition-colors group-hover:text-foreground" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                <span>GitHub</span>
                <ArrowUpRight className="h-3 w-3 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
              </a>

              <a
                href={LINKS.x}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/80 px-3.5 py-1.5 sm:py-2 text-xs font-medium text-foreground backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/50 hover:bg-foreground/[0.06] hover:shadow-md active:translate-y-0"
                data-cursor="thoughts on tech & ideas"
              >
                <svg className="h-3 w-3 fill-current text-foreground/80 transition-colors group-hover:text-foreground" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span>X</span>
                <ArrowUpRight className="h-3 w-3 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
              </a>

              <a
                href={LINKS.leetcode}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/80 px-3.5 py-1.5 sm:py-2 text-xs font-medium text-foreground backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/50 hover:bg-foreground/[0.06] hover:shadow-md active:translate-y-0"
                data-cursor="problem solving & algorithms"
              >
                <svg className="h-3 w-3 fill-current text-foreground/80 transition-colors group-hover:text-foreground" viewBox="0 0 24 24">
                  <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .666-1.794l3.874-4.147 4.887-5.234a1.377 1.377 0 0 0-.02-1.933A1.365 1.365 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z" />
                </svg>
                <span>LeetCode</span>
                <ArrowUpRight className="h-3 w-3 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
              </a>
            </div>
          </div>
        </div>

        {/* Back to top button */}
        <button
          ref={backToTopRef}
          onClick={() => document.getElementById("brain")?.scrollIntoView({ behavior: "smooth" })}
          className="group inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/85 px-4 py-2 text-xs font-mono text-muted-foreground backdrop-blur-md shadow-sm transition-all duration-200 hover:border-foreground/40 hover:text-foreground hover:shadow-md fixed bottom-6 right-6 sm:right-8 z-30 will-change-transform"
          data-cursor="rewind ↑"
          style={{ opacity: 0, pointerEvents: "none" }}
        >
          <span>© 2026 sachin</span>
          <span className="opacity-40">·</span>
          <span className="inline-flex items-center gap-1 group-hover:text-foreground">
            back to top <ArrowUp className="h-3 w-3 transition-transform duration-200 group-hover:-translate-y-0.5" />
          </span>
        </button>
      </div>
    </section>
  );
}

// Phones have no cursor, so the story's comments pop up as a little chat
// bubble in the bottom corner instead — typed out, then gone.
function PhoneComment() {
  const [comment, setComment] = useState<CursorComment | null>(null);
  const [typed, setTyped] = useState("");

  useEffect(() => {
    const onComment = (event: Event) => {
      const next = (event as CustomEvent<CursorComment>).detail;
      if (next.id !== "hover" && window.innerWidth < 768) setComment(next);
    };
    const hush = (e: Event) => {
      if ((e as CustomEvent<number>).detail !== -1) setComment(null);
    };
    window.addEventListener("figure-open", hush);
    window.addEventListener("cursor-comment", onComment);
    return () => window.removeEventListener("figure-open", hush);
      window.removeEventListener("cursor-comment", onComment);
  }, []);

  useEffect(() => {
    setTyped("");
    if (!comment) return;
    let index = 0;
    let fade = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setTyped(comment.text.slice(0, index));
      if (index >= comment.text.length) {
        window.clearInterval(timer);
        fade = window.setTimeout(() => setComment((c) => (c === comment ? null : c)), 3800);
      }
    }, 32);
    return () => {
      window.clearInterval(timer);
      window.clearTimeout(fade);
    };
  }, [comment]);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed bottom-5 left-4 z-[90] md:hidden">
      {comment?.variant === "signature" ? (
        <div
          className={cn(
            "flex items-center gap-2.5 rounded-full border border-border/80 bg-zinc-950/95 px-4 py-2 text-white shadow-2xl backdrop-blur-md transition-[opacity,scale] duration-300",
            comment ? "scale-100 opacity-100" : "scale-75 opacity-0",
          )}
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-zinc-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-zinc-100" />
          </span>
          <span className="font-serif text-[15px] italic tracking-wide text-zinc-100">
            {typed || " "}
          </span>
          {comment.tag && (
            <span className="rounded-full border border-zinc-700/60 bg-zinc-850 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-300">
              {comment.tag}
            </span>
          )}
        </div>
      ) : (
        <div
          className={cn(
            "origin-bottom-left whitespace-nowrap rounded-[24px_24px_24px_2px] border-2 border-cursor-border bg-cursor px-4 py-2 text-sm font-medium text-cursor-foreground transition-[opacity,scale] duration-300 [filter:drop-shadow(4px_4px_5px_rgb(46_144_250/0.16))]",
            comment ? "scale-100 opacity-100" : "scale-75 opacity-0",
          )}
          style={{ transitionTimingFunction: "cubic-bezier(.34,1.56,.64,1)" }}
        >
          {typed || " "}
        </div>
      )}
    </div>
  );
}

// The cursor's comment bubble. It trails the pointer with a touch of easing
// and says nothing by default — it only speaks when the story or the thing
// under the pointer has something to say, types it out, and fades away.
function CuriousCursor({ visible }: { visible: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [comment, setComment] = useState<CursorComment | null>(null);
  const [typed, setTyped] = useState("");
  const [moved, setMoved] = useState(false);
  // Re-places the bubble without the pointer moving (e.g. as text types out).
  const reposition = useRef(() => {});

  useEffect(() => {
    const target = { x: -200, y: -200 };
    const pos = { x: -200, y: -200 };
    let frame = 0;
    const tick = () => {
      pos.x += (target.x - pos.x) * 0.28;
      pos.y += (target.y - pos.y) * 0.28;
      const el = ref.current;
      if (el) {
        // Near the right or bottom edge, the bubble flips to the other side of
        // the pointer so it never runs off screen.
        const bubble = el.firstElementChild as HTMLElement | null;
        const w = bubble?.offsetWidth ?? 0;
        const h = bubble?.offsetHeight ?? 0;
        const left = pos.x + 14 + w > window.innerWidth - 8;
        const up = pos.y + 16 + h > window.innerHeight - 8;
        const x = left ? pos.x - 14 - w : pos.x + 14;
        const y = up ? pos.y - 16 - h : pos.y + 16;
        el.style.transform = `translate3d(${Math.max(8, x)}px, ${Math.max(8, y)}px, 0)`;
        // the sharp corner always points back at the cursor
        if (bubble && !bubble.hasAttribute("data-pill")) {
          const r = ["24px", "24px", "24px", "24px"];
          r[up ? (left ? 2 : 3) : left ? 1 : 0] = "2px";
          bubble.style.borderRadius = r.join(" ");
          bubble.style.transformOrigin = `${up ? "bottom" : "top"} ${left ? "right" : "left"}`;
        }
      }
      frame = Math.abs(target.x - pos.x) + Math.abs(target.y - pos.y) > 0.3 ? requestAnimationFrame(tick) : 0;
    };
    reposition.current = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };
    const move = (event: PointerEvent) => {
      // The first move puts the bubble right at the pointer, no glide in.
      if (target.x === -200) {
        pos.x = event.clientX;
        pos.y = event.clientY;
      }
      target.x = event.clientX;
      target.y = event.clientY;
      setMoved(true);
      if (!frame) frame = requestAnimationFrame(tick);
    };
    // Hovering something with a comment says it; moving off it goes quiet.
    let hoverText = "";
    const over = (event: PointerEvent) => {
      const el = event.target instanceof Element ? event.target.closest<HTMLElement>("[data-cursor]") : null;
      const text = el?.dataset["cursor"] ?? "";
      const variant = el?.dataset["cursorVariant"];
      const tag = el?.dataset["cursorTag"];
      if (text === hoverText) return;
      hoverText = text;
      if (text) setComment({ id: "hover", text, fade: false, variant, tag });
      else setComment((c) => (c?.id === "hover" ? null : c));
    };
    const onComment = (event: Event) => setComment((event as CustomEvent<CursorComment>).detail);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerover", over, { passive: true });
    const hush = (e: Event) => {
      if ((e as CustomEvent<number>).detail !== -1) setComment(null);
    };
    window.addEventListener("figure-open", hush);
    window.addEventListener("cursor-comment", onComment);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
      window.removeEventListener("figure-open", hush);
      window.removeEventListener("cursor-comment", onComment);
    };
  }, []);

  // Type the comment out, then let story comments fade after a few seconds.
  // The bubble grows as it types, so keep checking it still fits on screen.
  useEffect(() => {
    reposition.current();
  }, [typed]);

  useEffect(() => {
    setTyped("");
    if (!comment) return;
    let index = 0;
    let fade = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setTyped(comment.text.slice(0, index));
      if (index >= comment.text.length) {
        window.clearInterval(timer);
        if (comment.fade) fade = window.setTimeout(() => setComment((c) => (c === comment ? null : c)), 4500);
      }
    }, 32);
    return () => {
      window.clearInterval(timer);
      window.clearTimeout(fade);
    };
  }, [comment]);

  const showing = visible && moved && comment !== null;
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[100] hidden will-change-transform motion-reduce:hidden lg:block"
      style={{ transform: "translate3d(-200px, -200px, 0)" }}
    >
      {comment?.variant === "signature" ? (
        <div
          data-pill="true"
          className={cn(
            "flex items-center gap-2.5 rounded-full border border-border/80 bg-zinc-950/95 px-4 py-2 text-white shadow-2xl backdrop-blur-md transition-[opacity,scale] duration-300",
            showing ? "scale-100 opacity-100" : "scale-75 opacity-0",
          )}
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-zinc-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-zinc-100" />
          </span>
          <span className="font-serif text-[15px] italic tracking-wide text-zinc-100">
            {typed || " "}
          </span>
          {comment.tag && (
            <span className="rounded-full border border-zinc-700/60 bg-zinc-850 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-300">
              {comment.tag}
            </span>
          )}
        </div>
      ) : (
        <div
          className={cn(
            "origin-top-left whitespace-nowrap rounded-[2px_24px_24px_24px] border-2 border-cursor-border bg-cursor px-4 py-2 text-sm font-medium text-cursor-foreground transition-[opacity,scale] duration-300 [filter:drop-shadow(4px_4px_5px_rgb(46_144_250/0.16))]",
            showing ? "scale-100 opacity-100" : "scale-75 opacity-0",
          )}
          style={{ transitionTimingFunction: "cubic-bezier(.34,1.56,.64,1)" }}
        >
          {typed || " "}
        </div>
      )}
    </div>
  );
}
