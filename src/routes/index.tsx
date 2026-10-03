import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";

import astronaut from "@/assets/obj3d-astronaut.webp";
import brain from "@/assets/obj3d-brain.webp";
import climber from "@/assets/obj3d-climber.webp";
import globe from "@/assets/obj3d-globe.webp";
import headphones from "@/assets/obj3d-headphones.webp";
import keys from "@/assets/obj3d-keys.webp";
import me from "@/assets/me.webp";
import laptop from "@/assets/obj3d-laptop.webp";
import rexImage from "@/assets/project-rex.webp";
import screenmeshImage from "@/assets/project-screenmesh.webp";
import voxieImage from "@/assets/project-voxie.webp";
import signature from "@/assets/signature.png";
import { CLIMBED_OUT, RabbitHoleButton, takeFlag } from "@/components/rabbit-hole";
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

// The image opens the live site; the arrow opens the code.
const projects = [
  { number: "01", title: "Bright Code", image: voxieImage, tags: ["Full-stack", "Collaboration"], blurb: "a collaborative coding platform for developers to write, practice, and work on code efficiently in an interactive environment.", live: "https://bright-code-ruby.vercel.app/", code: "https://github.com/SachinYadav2446/BrightCode" },
  { number: "02", title: "Cyclone Pattern Identifier", image: rexImage, tags: ["AI", "Computer Vision"], blurb: "AI-based system for detecting and analyzing cyclone patterns from satellite imagery, with eye localization and intensity estimation.", live: "", code: "https://github.com/SachinYadav2446/Cyclone-Pattern-Identifier" },
  { number: "03", title: "Demand Forecast", image: screenmeshImage, tags: ["ML", "Forecasting"], blurb: "taxi demand forecasting system predicting zone-wise future demand using NYC data and time-series forecasting techniques.", live: "", code: "https://github.com/SachinYadav2446/Taxi-Demand-Forecasting-System-" },
  { number: "04", title: "Creatify", image: voxieImage, tags: ["Web", "Creative"], blurb: "creative digital platform helping users create and manage engaging digital content through an intuitive interface.", live: "", code: "https://github.com/SachinYadav2446/Creatify" },
];

// The story canvas is CANVAS_VW wide and slides CANVAS_TRAVEL_VW across the
// scroll. Everything on it is placed in vw/vh, and the SVG uses a viewBox of
// (CANVAS_VW * 10) x 1000, so one vw is 10 units and one vh is 10 units.
const CANVAS_VW = 570;
const CANVAS_TRAVEL_VW = 470;

// Place something on the canvas by its vw/vh coordinates.
const at = (x: number, y: number) => ({ left: `${x}vw`, top: `${y}vh` });

// A waypoint for the thread, in vw/vh. `loop` ties a little loop-de-loop at
// that point (radius in vh; negative loops downward).
type Waypoint = [x: number, y: number, loop?: number];

// Horizontal units are ~1.8x wider on screen than vertical ones, so loops are
// narrowed to stay round rather than squashed.
const LOOP_ASPECT = 1.8;

// Where the thread finally ends: at the "see the work" button.
const BUTTON_X = 537;
const BUTTON_Y = 59;

// The big loop the habit is tied around, near the end of the story.
const LOOP_X = 474;
const LOOP_Y = 70;
const LOOP_R = 17;

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
  [62, 49.5], [76, 49.5], [90, 47], [102, 40, 9], [116, 56], [132, 57], [146, 48],
  [156, 40], [164, 29], [171, 33], [174.5, 35.6], [181, 42], [186, 62], [198, 68],
  [205, 68], [216, 50], [229, 34], [233, 50], [250, 58], [262, 70], [272, 88], [292, 54],
  [304, 48], [322, 51], [340, 52], [358, 50], [376, 46], [394, 43], [410, 46],
  [422, 60], [440, 70], [458, 71], [LOOP_X, LOOP_Y, LOOP_R], [496, 76], [514, 78], [528, 70], [BUTTON_X, BUTTON_Y],
];
const THREAD = threadPath(THREAD_WAYPOINTS);

// Sampled once, the first time anything needs points along the thread.
let threadSamples: ThreadSamples | null = null;
const getThreadSamples = () => (threadSamples ??= sampleSegments(threadSegments(THREAD_WAYPOINTS)));

// A deliberately messy scribble ball — "an almost accurate map of everything on
// my mind." It draws itself once on load before the rest of the page appears.
const TANGLE = "M412 441 C515 397 634 254 612 324 C514 323 496 516 405 384 C462 554 503 411 563 536 C550 451 352 221 429 252 C463 251 542 590 592 462 C722 444 518 320 633 498 C733 324 559 351 502 325 C451 436 535 231 665 369 C653 189 542 154 453 252 C356 135 579 427 545 447 C580 505 551 553 468 379 C518 265 542 377 549 499 C417 489 679 300 622 421 C560 362 446 473 393 465 C424 562 372 482 401 372 C511 215 515 477 398 393 C299 375 474 580 439 424 C406 450 754 502 668 389 C754 375 628 135 588 240 C647 360 527 578 489 496 C412 647 637 651 506 469 C517 579 481 408 530 253 C626 196 462 257 574 279 C588 381 649 162 652 341 C736 176 676 270 595 393 C551 502 511 179 608 312 C612 397 708 447 616 375 C736 373 748 312 627 469 C552 479 478 362 535 275 C572 284 689 483 596 461 C546 415 740 502 646 350 C568 483 705 479 578 470 C598 357 572 439 563 438 C591 259 667 301 541 295 C514 408 442 336 425 339 C477 175 577 532 566 565 C690 668 539 510 601 520 C501 495 679 640 594 488 C588 419 456 553 539 509 C654 369 727 177 651 357 C569 254 524 516 473 584 C434 629 437 615 543 528 C442 532 526 141 593 255 C601 231 606 485 639 519 C647 390 459 557 538 507 C576 518 628 307 533 264 C629 164 569 587 504 469 C613 399 567 642 617 482 C541 668 630 423 525 561 C455 646 384 347 449 499 C539 470 700 212 622 354 C596 424 286 189 397 302 C446 458 674 337 547 482 C549 579 634 356 633 287 C549 135 414 322 520 498 C534 503 529 135 511 184 C425 135 660 668 568 590 C683 437 488 449 606 279 C596 379 420 421 467 434 C471 407 689 259 661 443 C716 574 443 556 529 573 C594 538 432 461 514 588 C517 405 556 436 450 322 C505 459 612 520 577 556 C604 558 721 555 590 440 C525 596 458 425 392 320 C477 284 564 456 457 313 C510 414 656 303 584 339 C645 177 559 393 602 405 C470 350 507 466 470 418 C398 587 607 453 562 514 C605 541 471 310 462 352 C597 406 484 646 429 547 C559 367 672 461 640 371 C574 334 357 135 479 238 C445 135 484 601 551 447 C565 450 754 442 661 416 C754 468 560 135 476 191 C502 289 516 578 638 416 C547 405 304 412 394 413 C423 246 578 558 458 588 C465 625 583 385 619 466 C661 489 450 271 508 189 C453 135 441 135 510 212 C417 308 529 344 558 194 C625 135 578 668 446 536 C331 668 614 267 632 276 C754 178 412 653 405 488 C465 476 724 388 594 268 C622 135 486 278 453 295 C373 135 426 166 418 308 C403 372 613 387 625 476 C647 446 734 396 660 384 C754 555 570 156 507 255 C403 404 586 275 509 227 C471 141 443 489 393 465 C418 515 700 369 632 486 C564 668 746 567 634 424 C510 258 381 378 443 406 C476 256 497 135 486 246 C374 313 426 307 413 257 C379 248 440 397 518 456 C584 584 366 418 481 562 C565 608 613 381 540 489 C520 398 704 245 621 295 C662 479 342 484 389 465 C455 624 444 499 463 549 C354 668 438 372 552 530 C569 524 619 135 569 199";

type Subscribe = (listen: (progress: number) => void) => () => void;

function ParallaxEnvironment({ subscribe }: { subscribe: Subscribe }) {
  const deepGridRef = useRef<HTMLDivElement>(null);
  const midLayerRef = useRef<HTMLDivElement>(null);
  const dustLayerRef = useRef<HTMLDivElement>(null);
  const warpGlowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return subscribe((progress) => {
      // Parallax speeds:
      // Deep layer moves at ~150vw total (much slower than canvas 470vw)
      if (deepGridRef.current) {
        deepGridRef.current.style.transform = `translate3d(-${progress * 150}vw, 0, 0)`;
      }
      // Midground tech elements move at ~280vw total
      if (midLayerRef.current) {
        midLayerRef.current.style.transform = `translate3d(-${progress * 280}vw, 0, 0)`;
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
        style={{ width: "260vw" }}
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
        {/* Atmospheric nebula light pools that drift in the background */}
        <div className="absolute left-[70vw] top-[20vh] h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/10 blur-[130px]" />
        <div className="absolute left-[130vw] top-[60vh] h-[550px] w-[550px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute left-[200vw] top-[30vh] h-[650px] w-[650px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-500/10 blur-[140px]" />
      </div>

      {/* Layer 2: Dimensional Warp Portal (illuminates at the transition between signature & realm) */}
      <div
        ref={warpGlowRef}
        className="absolute inset-y-0 left-[35vw] w-[80vw] will-change-transform opacity-0 transition-opacity duration-300"
      >
        {/* Vertical dimensional energy slit & radial bloom */}
        <div className="absolute left-1/2 top-1/2 h-[90vh] w-[40vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-violet-600/15 via-purple-500/20 to-indigo-600/15 blur-[80px]" />
        {/* Speed lines / light rays */}
        <div className="absolute inset-0 flex items-center justify-around opacity-20">
          <div className="h-full w-px bg-gradient-to-b from-transparent via-violet-400 to-transparent" />
          <div className="h-3/4 w-px bg-gradient-to-b from-transparent via-indigo-400 to-transparent" />
          <div className="h-full w-px bg-gradient-to-b from-transparent via-cyan-400 to-transparent" />
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
        style={{ width: "540vw" }}
      >
        {[
          { x: "75vw", y: "30vh", s: "h-1 w-1 bg-violet-400/60" },
          { x: "88vw", y: "65vh", s: "h-1.5 w-1.5 bg-indigo-400/70" },
          { x: "105vw", y: "20vh", s: "h-1 w-1 bg-cyan-400/60" },
          { x: "125vw", y: "78vh", s: "h-1.5 w-1.5 bg-violet-400/50" },
          { x: "155vw", y: "35vh", s: "h-1 w-1 bg-purple-400/60" },
          { x: "190vw", y: "60vh", s: "h-1.5 w-1.5 bg-sky-400/50" },
          { x: "230vw", y: "25vh", s: "h-1 w-1 bg-violet-400/70" },
          { x: "280vw", y: "70vh", s: "h-1.5 w-1.5 bg-indigo-400/60" },
          { x: "340vw", y: "40vh", s: "h-1 w-1 bg-cyan-400/70" },
          { x: "410vw", y: "55vh", s: "h-1.5 w-1.5 bg-violet-400/60" },
        ].map((pt, i) => (
          <span
            key={i}
            className={cn("absolute rounded-full shadow-[0_0_8px_currentColor]", pt.s)}
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
  const [filter, setFilter] = useState("All");

  // First the mind arrives, then its note, and only then does scrolling take over.
  useEffect(() => {
    const root = document.documentElement;
    // Climbing back out of the rabbit hole lands straight on the work, no intro.
    if (takeFlag(CLIMBED_OUT) || window.location.hash === "#work") {
      setShowSplash(false);
      setNoteRevealed(true);
      setScrollReady(true);
      requestAnimationFrame(() => document.getElementById("work")?.scrollIntoView({ behavior: "instant" }));
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

      <section id="brain" ref={storyRef} className="relative md:h-[720vh]">
        <div className="sticky top-0 hidden h-screen overflow-hidden md:block">
          <ParallaxEnvironment subscribe={subscribe} />
          <div ref={canvasRef} className="relative h-full will-change-transform max-md:hidden" style={{ width: `${CANVAS_VW}vw` }}>
            <StringLine subscribe={subscribe} />
            <div className="absolute inset-0 z-10">
              <IntroScene contentRevealed={noteRevealed} noteRevealed={noteRevealed} />
              <TinkerScene />
              <HeartScene />
              <TimelineScene />
              <ApparentlyScene />
              <EnoughScene onWork={() => go("work")} />
            </div>
          </div>
        </div>
        <MobileStory ready={noteRevealed} onWork={() => go("work")} />
      </section>

      <Works filter={filter} setFilter={setFilter} />
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
  const tipRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const path = pathRef.current;
    const tip = tipRef.current;
    if (!path || !tip) return;
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

    path.style.strokeDashoffset = `${1 - length / total}`;
    tip.setAttribute("cx", `${xs[i]}`);
    tip.setAttribute("cy", `${ys[i]}`);
    tip.style.opacity = length <= 0 || length >= total * 0.999 ? "0" : "1";
    };
    draw(0);
    return subscribe(draw);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" viewBox={`0 0 ${CANVAS_VW * 10} 1000`} preserveAspectRatio="none">
      {/* Modern gradient definitions */}
      <defs>
        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
          <stop offset="8%" stopColor="currentColor" stopOpacity="0.6" />
          <stop offset="14%" stopColor="#8b5cf6" stopOpacity="0.95" />
          <stop offset="24%" stopColor="#6366f1" stopOpacity="0.9" />
          <stop offset="42%" stopColor="#38bdf8" stopOpacity="0.85" />
          <stop offset="68%" stopColor="#8b5cf6" stopOpacity="0.85" />
          <stop offset="88%" stopColor="#6366f1" stopOpacity="0.75" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id="glowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.05" />
          <stop offset="12%" stopColor="#8b5cf6" stopOpacity="0.4" />
          <stop offset="24%" stopColor="#6366f1" stopOpacity="0.45" />
          <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.35" />
          <stop offset="75%" stopColor="#8b5cf6" stopOpacity="0.4" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.05" />
        </linearGradient>
        {/* Animated gradient for moving shimmer effect */}
        <linearGradient id="shimmerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.1">
            <animate attributeName="stop-opacity" values="0.1;0.5;0.1" dur="3s" repeatCount="indefinite" />
          </stop>
          <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.7">
            <animate attributeName="stop-opacity" values="0.4;0.9;0.4" dur="3s" repeatCount="indefinite" />
          </stop>
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.1">
            <animate attributeName="stop-opacity" values="0.1;0.5;0.1" dur="3s" repeatCount="indefinite" />
          </stop>
        </linearGradient>
        {/* Enhanced glow filter */}
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Wide glow base layer */}
      <path 
        ref={pathRef} 
        pathLength="1" 
        style={{ strokeDashoffset: 1 }} 
        d={THREAD} 
        fill="none" 
        stroke="url(#glowGradient)" 
        strokeWidth="8" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeDasharray="1" 
        opacity="0.5" 
        filter="url(#glow)" 
      />
      
      {/* Shimmer layer for subtle animation */}
      <path 
        ref={pathRef} 
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
      
      {/* Main sleek line - more prominent */}
      <path 
        ref={pathRef} 
        pathLength="1" 
        style={{ strokeDashoffset: 1 }} 
        d={THREAD} 
        fill="none" 
        stroke="url(#lineGradient)" 
        strokeWidth="3" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeDasharray="1" 
      />
      
      {/* Portal entry aura around the entry loop */}
      <g opacity="0.45">
        <circle cx="1020" cy="400" r="52" fill="none" stroke="#8b5cf6" strokeWidth="1" strokeDasharray="4 6" opacity="0.35">
          <animateTransform attributeName="transform" type="rotate" from="0 1020 400" to="360 1020 400" dur="18s" repeatCount="indefinite" />
        </circle>
        <circle cx="1020" cy="400" r="32" fill="none" stroke="#6366f1" strokeWidth="1.5" opacity="0.45">
          <animate attributeName="r" values="30;36;30" dur="3s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.45;0.2;0.45" dur="3s" repeatCount="indefinite" />
        </circle>
      </g>
      
      {/* Animated tip following the thread on scroll */}
      <circle ref={tipRef} r="6" cx="620" cy="495" style={{ opacity: 0 }} className="fill-violet-500 drop-shadow-[0_0_12px_rgba(139,92,246,0.95)]" />
    </svg>
  );
}

function IntroScene({ contentRevealed, noteRevealed }: { contentRevealed: boolean; noteRevealed: boolean }) {
  return (
    <div className="absolute left-0 top-0 h-full w-screen">
      <div className={cn("absolute bottom-10 left-8 transition-all duration-700 sm:bottom-8", contentRevealed ? "opacity-100" : "animate-reveal [animation-delay:2.2s]")}>
        <p className="text-4xl font-semibold leading-[0.95] sm:text-5xl">
          <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            The Journey of
          </span>
          <br />
          <span className="font-serif text-5xl italic sm:text-6xl">a curious builder.</span>
        </p>
      </div>
      
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
          className="w-[280px] sm:w-[380px] md:w-[460px] lg:w-[520px] max-w-[85vw] h-auto object-contain select-none pointer-events-none drop-shadow-sm transition-all duration-500 group-hover:scale-105 group-hover:drop-shadow-[0_10px_25px_rgba(124,58,237,0.18)] dark:invert"
          draggable={false}
        />
      </div>
      
      {/* Modern info card instead of arrow */}
      <div className={cn("absolute left-[62%] top-28 max-w-64 rounded-2xl border border-border/40 bg-background/80 p-4 text-sm text-muted-foreground shadow-lg backdrop-blur-sm transition-all duration-500", noteRevealed ? "opacity-100" : "animate-reveal [animation-delay:2.2s]")}>
        <div className="mb-2 flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-foreground/60" />
          <span className="text-xs font-medium uppercase tracking-wider">About this portfolio</span>
        </div>
        <p className="leading-relaxed">A visual journey through my projects, experiences, and the technologies I explore.</p>
      </div>
    </div>
  );
}

// A piece of text pinned to the canvas.
// `at` is the canvas x (in vw) the thread must reach before a `.reveal` note shows.
function Note({ x, y, className, at: revealAt, children }: { x: number; y: number; className?: string; at?: number; children: ReactNode }) {
  return <div className={cn("absolute", className)} style={at(x, y)} data-at={revealAt}>{children}</div>;
}

// i tinker with a lot of stuff — a modern section with clean typography
function TinkerScene() {
  return (
    <div>
      <span hidden data-mode="thread" data-at={100} data-say="exploring new technologies." />
      {/* Realm Entry Marker */}
      <Note x={88} y={34} className="reveal pointer-events-none select-none" at={86}>
        <div className="flex items-center gap-2 text-[11px] font-mono tracking-widest text-violet-500/80 uppercase">
          <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-ping" />
          <span>Entering Digital Realm</span>
          <span className="text-muted-foreground/40">//</span>
        </div>
      </Note>
      <Note x={120} y={42} className="reveal w-[38vw] text-center" at={120}>
        <div className="rounded-2xl border border-border/30 bg-background/95 p-6 shadow-xl backdrop-blur-sm">
          <p className="mb-2 text-sm font-medium uppercase tracking-wider text-muted-foreground">What I Do</p>
          <h2 className="mb-2 font-serif text-5xl font-medium leading-tight">Full-Stack Developer</h2>
          <p className="text-base text-muted-foreground">Building intelligent systems with modern technologies</p>
        </div>
      </Note>
      <Object src={laptop} alt="a laptop covered in stickers" label="Where ideas come to life" style={at(106, 19)} size="sm" delay="0s" />
      <Object src={keys} alt="a set of keycaps" label="Crafting digital experiences" style={at(136, 18)} size="sm" delay=".3s" />
      <Climber />
    </div>
  );
}

// The stretch of thread the climber can travel along, in vw.
const CLIMB_FROM = 157;
// Down the slope past the heading, all the way to the web3 globe.
const CLIMB_TO = 197;
// How close (vh) the pointer must be to the thread for her to follow it.
const CLIMB_REACH = 14;
const CLIMB_START = 174.5;
// Where her hands are inside the image, as a fraction of its box.
const GRIP_X = 0.57;
const GRIP_Y = 0.2;
const CLIMBER_W = 9;
const CLIMBER_H = 18;

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

// The climber hangs from the thread itself and swings gently from her grip.
// Move the pointer along the thread and she climbs after it, hand over hand —
// tilting with the slope — as far as the web3 globe. It listens to the whole
// window rather than a hit box, so it never blocks the heading or the globe.
function Climber() {
  const originRef = useRef<HTMLDivElement>(null);
  const samples = useRef<{ xs: number[]; ys: number[] } | null>(null);
  const target = useRef(CLIMB_START);
  const current = useRef(CLIMB_START);
  const frame = useRef(0);
  const [pose, setPose] = useState({ x: CLIMB_START, y: 35.6, angle: 0, reach: 0 });

  const yAt = (x: number) => {
    const s = samples.current;
    if (!s || s.xs.length === 0) return 35.6;
    let i = 0;
    while (i < s.xs.length - 1 && (s.xs[i + 1] ?? 0) < x) i += 1;
    return s.ys[i] ?? 35.6;
  };

  const place = (x: number, reach: number) => {
    const y = yAt(x);
    // Slope in screen pixels, so the tilt matches what you see.
    const dy = (yAt(x + 0.5) - yAt(x - 0.5)) * window.innerHeight;
    const dx = window.innerWidth;
    // Follow the slope, but not so far she's lying flat on the steep drop.
    const angle = Math.max(-28, Math.min(28, ((Math.atan2(dy, dx) * 180) / Math.PI) * 0.6));
    setPose({ x, y, angle, reach });
  };

  useEffect(() => {
    samples.current = sampleThread(CLIMB_FROM, CLIMB_TO);
    place(CLIMB_START, 0);
    // The origin div sits at CLIMB_FROM on the canvas, so its left edge maps
    // the pointer into canvas vw; the canvas is viewport-tall, so y is just vh.
    const follow = (event: PointerEvent) => {
      const origin = originRef.current;
      if (!origin) return;
      const x = CLIMB_FROM + ((event.clientX - origin.getBoundingClientRect().left) / window.innerWidth) * 100;
      const y = (event.clientY / window.innerHeight) * 100;
      if (x < CLIMB_FROM - 2 || x > CLIMB_TO + 2 || Math.abs(y - yAt(Math.min(CLIMB_TO, Math.max(CLIMB_FROM, x)))) > CLIMB_REACH) return;
      target.current = Math.min(CLIMB_TO, Math.max(CLIMB_FROM, x));
      if (!frame.current) frame.current = requestAnimationFrame(climb);
    };
    window.addEventListener("pointermove", follow, { passive: true });
    return () => {
      window.removeEventListener("pointermove", follow);
      cancelAnimationFrame(frame.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Move a little each frame, like pulling along the thread, not teleporting.
  const climb = () => {
    const gap = target.current - current.current;
    if (Math.abs(gap) < 0.05) {
      place(current.current, 0);
      frame.current = 0;
      return;
    }
    current.current += Math.sign(gap) * Math.min(Math.abs(gap), 0.12);
    place(current.current, Math.sin(current.current * 3));
    frame.current = requestAnimationFrame(climb);
  };

  return (
    <div ref={originRef} className="pointer-events-none absolute" style={at(CLIMB_FROM, 22)}>
      <div
        className="pointer-events-auto absolute"
        style={{
          left: `${pose.x - CLIMB_FROM - GRIP_X * CLIMBER_W}vw`,
          top: `${pose.y - 22 - GRIP_Y * CLIMBER_H}vh`,
          width: `${CLIMBER_W}vw`,
          height: `${CLIMBER_H}vh`,
          transformOrigin: `${GRIP_X * 100}% ${GRIP_Y * 100}%`,
          // While climbing she rocks side to side with each hand-over-hand pull.
          transform: `rotate(${pose.angle + pose.reach * 7}deg) translateY(${Math.abs(pose.reach) * -0.6}vh)`,
        }}
      >
        <div className={cn("h-full w-full", pose.reach === 0 && "animate-hang")}>
          <Figure src={climber} alt="someone hanging from the thread" label="apparently i like climbing things." size="fill" still labelStyle={{ rotate: `${-(pose.angle + pose.reach * 7)}deg` }} />
        </div>
      </div>
    </div>
  );
}

const heart = [
  { src: globe, alt: "a globe wrapped in orbits", x: 200, y: 56, title: "web3 came first.", body: "got curious about systems that don't need one person in charge.", label: "yes, i'm still here." },
  { src: headphones, alt: "a pair of headphones", x: 224, y: 22, title: "turns out, i like people too.", body: "explaining things is pretty fun too.", label: "docs, talks, demos, communities." },
  { src: brain, alt: "a brain", x: 260, y: 60, title: "and now, AI.", body: "half engineer. half “what if?”", label: "still trying to understand this thing." },
];

// but few things have my heart — each one an object with a big line and a
// quiet one beside it, and the thread running calmly between the objects.
function HeartScene() {
  return (
    <div>
      <span hidden data-mode="thread" data-at={184} data-say="okay, the soft part." />
      <Note x={181} y={18} className="reveal w-[22rem]" at={182}><h2 className="font-serif text-6xl leading-none">but few things have my heart.</h2></Note>
      {heart.map((h, index) => (
        <Note key={h.title} x={h.x} y={h.y} className="reveal flex items-center gap-5" at={h.x + 2}>
          <Figure src={h.src} alt={h.alt} label={h.label} delay={`${index * 0.5}s`} />
          <div className="w-64">
            <p className="font-serif text-4xl leading-tight">{h.title}</p>
            <p className="mt-2 text-muted-foreground">{h.body}</p>
          </div>
        </Note>
      ))}
    </div>
  );
}

// One beat per year, told like a story: a short line that moves it forward,
// and the detail underneath for anyone who wants it.
const timeline = [
  { year: "1st Year", title: "learning the fundamentals.", line: "Programming basics, Java, OOP, DSA, DBMS, SQL, OS, and Networks. Building the foundation." },
  { year: "1st-2nd Year", title: "exploring web development.", line: "React, Node.js, Express, MongoDB, APIs, Git/GitHub. Started building real projects instead of just learning theory." },
  { year: "2nd Year", title: "building actual products.", line: "Created Bright Code and Creatify. Learning how ideas transform into working applications." },
  { year: "2nd Year", title: "discovered AI/ML.", line: "NumPy, Pandas, Matplotlib, time-series forecasting, ARIMA, SARIMAX. The world of data science opened up." },
  { year: "2nd-3rd Year", title: "going deeper into AI.", line: "CNNs, ConvNeXt, ConvLSTM, Computer Vision. Built Demand Forecast and Cyclone Pattern Identifier." },
  { year: "3rd Year", title: "building complete systems.", line: "Focus shifted from learning languages to building intelligent systems. Strengthening DSA, system design, and production-ready solutions." },
];
const TIMELINE_FROM = 304;
const TIMELINE_STEP = 18;
const STEM = 11;

// The thread curves gently through the years. Each year hangs off it on a thin
// stem — alternating above and below — and only appears once the thread
// arrives. Underneath, what all of it keeps adding up to.
function TimelineScene() {
  const [ys, setYs] = useState<number[] | null>(null);

  // Hang each stem from exactly where the thread passes.
  useEffect(() => {
    const { xs, ys: samples } = sampleThread(TIMELINE_FROM - 2, TIMELINE_FROM + TIMELINE_STEP * timeline.length);
    setYs(timeline.map((_, index) => {
      const x = TIMELINE_FROM + index * TIMELINE_STEP;
      let k = 0;
      while (k < xs.length - 1 && (xs[k + 1] ?? 0) < x) k += 1;
      return samples[k] ?? 50;
    }));
  }, []);

  return (
    <div>
      <span hidden data-mode="thread" data-at={306} data-say="the short version. very short." />
      {ys && timeline.map((stop, index) => {
        const x = TIMELINE_FROM + index * TIMELINE_STEP;
        const y = ys[index] ?? 50;
        const up = index % 2 === 1;
        return (
          <div key={stop.year + stop.title} className="reveal" data-at={x}>
            <span className="absolute w-px bg-muted-foreground/60" style={{ left: `${x}vw`, top: `${up ? y - STEM : y}vh`, height: `${STEM}vh` }} />
            <span className="absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-muted-foreground" style={{ left: `calc(${x}vw + 0.5px)`, top: `${up ? y - STEM : y + STEM}vh` }} />
            <Note x={x} y={up ? y - STEM - 2 : y + STEM + 2} className={cn("w-64 -translate-x-1/2 text-center leading-snug", up && "-translate-y-full")}>
              <p className="text-lg">{stop.title}</p>
              <p className="text-muted-foreground">{stop.line}</p>
              <p className="mt-1 text-sm text-muted-foreground/80">{stop.year}</p>
            </Note>
          </div>
        );
      })}
      {/* Each phrase fades in as the thread passes over it, like the years. */}
      <Note x={302} y={84} className="reveal" at={302}><p className="whitespace-nowrap font-serif text-5xl">my journey, <span className="text-muted-foreground">it's been about...</span></p></Note>
      <Note x={346} y={84} className="reveal" at={346}><p className="whitespace-nowrap font-serif text-5xl"><span className="text-muted-foreground">constant</span> evolution.</p></Note>
      <Note x={380} y={83} className="reveal w-[25rem] text-lg leading-snug" at={380}>
        <p>started by learning how to code.</p>
        <p>then learned how different technologies work.</p>
        <p className="text-muted-foreground">now focused on building meaningful products.</p>
      </Note>
    </div>
  );
}

// The habit that keeps repeating, told as a cycle: the thread ties one big
// loop beside the line, and the four steps sit around it in the order the
// thread draws them — bottom, right, top, left — with "repeat." in the middle.
const LOOP_RX = LOOP_R / LOOP_ASPECT;
const habit = [
  { step: "learn it.", x: LOOP_X, y: LOOP_Y, place: "below" },
  { step: "understand it.", x: LOOP_X + LOOP_RX, y: LOOP_Y - LOOP_R, place: "right" },
  { step: "build it.", x: LOOP_X, y: LOOP_Y - 2 * LOOP_R, place: "above" },
  { step: "improve it.", x: LOOP_X - LOOP_RX, y: LOOP_Y - LOOP_R, place: "left" },
] as const;

const habitLabel = {
  below: "-translate-x-1/2 translate-y-4",
  right: "translate-x-5 -translate-y-1/2",
  above: "-translate-x-1/2 -translate-y-[calc(100%+1rem)]",
  left: "-translate-x-[calc(100%+1.25rem)] -translate-y-1/2",
};

function ApparentlyScene() {
  // The loop is drawn in one go once the thread reaches it, so its steps
  // arrive one after another, in drawing order.
  const looped = LOOP_X + LOOP_RX + 1;
  return (
    <div>
      <span hidden data-mode="thread" data-at={looped} data-say="yes, it's a loop. i'm aware." />
      <Note x={428} y={22} className="reveal w-[32rem]" at={428}>
        <p className="font-serif text-6xl leading-[1.05]">apparently, <span className="text-muted-foreground">i don't know how to leave things alone.</span></p>
      </Note>
      {habit.map(({ step, x, y, place }, index) => (
        <div key={step} className="reveal" data-mode="thread" data-at={looped} style={{ "--reveal-delay": `${index * 0.25}s` } as CSSProperties}>
          <span className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground" style={at(x, y)} />
          <p className={cn("absolute whitespace-nowrap text-lg", habitLabel[place])} style={at(x, y)}>{step}</p>
        </div>
      ))}
      <p className="reveal absolute -translate-x-1/2 -translate-y-1/2 font-serif text-4xl italic" data-mode="thread" data-at={looped} style={{ ...at(LOOP_X, LOOP_Y - LOOP_R), "--reveal-delay": "1s" } as CSSProperties}>repeat.</p>
    </div>
  );
}

// The thread stops. Whitespace. Then the turn into the work.
function EnoughScene({ onWork }: { onWork: () => void }) {
  // The button is pinned to the thread's end point (its left edge, halfway
  // down), so the thread meets it on every screen size; the words sit above.
  return (
    <>
      <span hidden data-mode="thread" data-at={BUTTON_X - 8} data-say="go on. it's the good part." />
      <Note x={BUTTON_X + 4.6} y={BUTTON_Y - 6} className="reveal w-[46vw] -translate-x-1/2 -translate-y-full text-center" at={BUTTON_X - 14}>
        <p className="text-lg text-muted-foreground">enough autobiography.</p>
        <h2 className="mt-3 font-serif text-6xl">let's look at what came out of it.</h2>
      </Note>
      <div className="absolute -translate-y-1/2" style={at(BUTTON_X, BUTTON_Y)}>
        <Button variant="ink" onClick={onWork} data-cursor="show me the work ↓">see the work <ArrowDown className="ml-2 h-4 w-4" /></Button>
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
// The mobile thread's points (in story coordinates), shared with the climber.
let mobileThread: ThreadSamples | null = null;

// On phones, hold the climber and drag her along her stretch of thread.
// Only she captures the finger, so the rest of the page still scrolls.
function MobileClimber() {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(0.55);
  const [grip, setGrip] = useState<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  // Put her hands on the drawn thread, at the point nearest the finger
  // along her stretch.
  const move = (clientX: number) => {
    const block = ref.current?.parentElement;
    const root = block?.parentElement;
    if (!block || !root || !mobileThread) return;
    const r = block.getBoundingClientRect();
    const x = Math.min(r.width * 0.84, Math.max(r.width * 0.2, clientX - r.left));
    const { xs, ys } = mobileThread;
    const top = block.offsetTop;
    let best = -1;
    for (let i = 0; i < xs.length; i += 1) {
      const y = (ys[i] ?? 0) - top;
      const px = xs[i] ?? 0;
      if (y < CLIMB_Y0 - 90 || y > CLIMB_Y1 + 90 || px < r.width * 0.2 || px > r.width * 0.84) continue;
      if (best < 0 || Math.abs((xs[i] ?? 0) - x) < Math.abs((xs[best] ?? 0) - x)) best = i;
    }
    if (best < 0) return;
    setPos((xs[best] ?? 0) / r.width);
    setGrip({ x: xs[best] ?? 0, y: (ys[best] ?? 0) - top });
  };
  const y = grip ? grip.y : CLIMB_Y0 + (CLIMB_Y1 - CLIMB_Y0) * pos + Math.sin(pos * Math.PI) * 14;
  return (
    <div
      ref={ref}
      className="absolute h-[156px] w-24 touch-none"
      style={{ left: grip ? grip.x : `${pos * 100}%`, top: y, translate: `-${GRIP_X * 100}% -${GRIP_Y * 100}%`, transition: dragging ? "none" : "left .4s, top .4s" }}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        setDragging(true);
      }}
      onPointerMove={(e) => dragging && move(e.clientX)}
      onPointerUp={() => setDragging(false)}
      onPointerCancel={() => setDragging(false)}
    >
      <Figure
        src={climber}
        alt="someone hanging from the thread"
        label="apparently i like climbing things."
        size="fill"
        hang={!dragging}
        still={dragging}
        // wherever she's climbed to, keep her bubble on screen
        labelStyle={pos < 0.35 ? { left: 0, translate: "none" } : pos > 0.65 ? { left: "auto", right: 0, translate: "none" } : {}}
      />
    </div>
  );
}

function MobileStory({ ready, onWork }: { ready: boolean; onWork: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const tangleRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const tipRef = useRef<SVGCircleElement>(null);
  const samplesRef = useRef<ThreadSamples | null>(null);
  const [geo, setGeo] = useState<{ d: string; w: number; h: number } | null>(null);

  // Trace the thread through every anchor, starting at the tangle's loose end.
  useEffect(() => {
    const measure = () => {
      const root = rootRef.current;
      const svg = tangleRef.current;
      if (!root || !svg || root.offsetParent === null) return;
      const r = root.getBoundingClientRect();
      const t = svg.getBoundingClientRect();
      // The tangle's viewBox is 550×600 from (250,100), scaled to fit and
      // centred; its loose end is at (569,199).
      const k = Math.min(t.width / 550, t.height / 600);
      const points: Waypoint[] = [[t.left - r.left + (t.width - 550 * k) / 2 + 319 * k, t.top - r.top + (t.height - 600 * k) / 2 + 99 * k]];
      root.querySelectorAll<HTMLElement>("[data-anchor]").forEach((el) => {
        const a = el.getBoundingClientRect();
        const loop = Number(el.dataset["anchor"]);
        points.push(loop ? [a.left - r.left, a.top - r.top, loop] : [a.left - r.left, a.top - r.top]);
      });
      const segments = threadSegments(points, 1, 1);
      samplesRef.current = sampleSegments(segments, 24);
      mobileThread = samplesRef.current;
      setGeo({ d: segmentsPath(segments), w: r.width, h: r.height });
    };
    measure();
    void document.fonts?.ready.then(measure);
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Draw the thread down to ~70% of the screen as you scroll, like a pen
  // following your thumb; scrolling back up rewinds it.
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
      // Nothing leaves the tangle until you scroll; then the thread grows with
      // the scroll until it catches up with ~70% down the screen.
      const top = root.getBoundingClientRect().top;
      const reach = Math.min(window.innerHeight * 0.7 - top, (ys[0] ?? 0) + Math.max(0, -top) * 1.4);
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

  // Things sharpen in as they scroll into view.
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
    // Story comments, said once each as their moment scrolls up the screen.
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
          <path ref={pathRef} d={geo.d} pathLength="1" strokeDasharray="1" style={{ strokeDashoffset: 1 }} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <circle ref={tipRef} r="4.5" cx="0" cy="0" style={{ opacity: 0 }} className="fill-foreground" />
        </svg>
      )}

      {/* the anatomy of a curious developer */}
      <div className="relative h-[132svh]">
        <svg ref={tangleRef} aria-hidden="true" viewBox="250 100 550 600" className="absolute inset-x-0 top-[27svh] h-[50svh] w-full overflow-visible">
          <path className="animate-draw-string" style={{ animationDuration: "2.6s" }} pathLength="1" strokeDasharray="1" d={TANGLE} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
        <div className={cn("absolute right-5 top-[17svh] flex w-44 items-start gap-1.5 text-[0.8rem] leading-snug text-muted-foreground", ready ? "opacity-100" : "animate-reveal [animation-delay:2.2s]")}>
          <svg aria-hidden="true" viewBox="0 0 40 30" className="mt-4 h-5 w-7 shrink-0"><path d="M38 4 C24 6 12 14 4 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /><path d="M4 24 L13 22 M4 24 L7 15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
          <span>an almost accurate map of everything on my mind.</span>
        </div>
        <p className={cn("absolute left-5 top-[90svh] text-[2.6rem] font-semibold leading-[0.95]", ready ? "opacity-100" : "animate-reveal [animation-delay:2.2s]")}>the<br />anatomy of a<br /><span className="font-serif italic">curious developer.</span></p>
        <Anchor x="86%" y="66svh" />
        <Anchor x="93%" y="122svh" />
      </div>

      {/* i tinker with a lot of stuff — objects spread out on alternating sides */}
      <div className="relative h-[880px]">
        <span data-say="careful. rabbit holes ahead." className="absolute left-0 top-0 h-px w-px" />
        <MobileObject src={laptop} alt="a laptop covered in stickers" label="this is where most things begin." style={{ left: "3%", top: 20 }} delay="0s" />
        <MobileObject src={keys} alt="a set of keycaps" label="one more idea. just one." style={{ right: "5%", top: 190 }} delay=".4s" />
        <Anchor x="95%" y={400} />
        <div className="reveal absolute inset-x-0 top-[420px] mx-auto max-w-[17rem] text-center">
          <p className="text-muted-foreground">i tinker with a lot of stuff.</p>
          <h2 className="mt-1 whitespace-nowrap font-serif text-[2.1rem] leading-tight">a jack of all trades</h2>
          <p className="mt-1 text-sm text-muted-foreground">what a cool way to say i fall down rabbit holes.</p>
        </div>
        <Anchor x="95%" y={590} />
        {/* the climber gets her own stretch of thread to be dragged along */}
        <Anchor x="4%" y={CLIMB_Y0} />
        <MobileClimber />
        <Anchor x="96%" y={CLIMB_Y1} />
      </div>

      {/* but few things have my heart — object above its words, alternating sides */}
      <div className="relative px-5 pt-6">
        <span data-say="okay, the soft part." className="absolute left-0 top-0 h-px w-px" />
        <Anchor x="5%" y={0} />
        <Anchor x="5%" y={110} />
        <h2 className="reveal text-center font-serif text-[2.4rem] leading-none">but few things<br />have my heart.</h2>
        {heart.map((h, index) => {
          const right = index % 2 === 1;
          return (
            <div key={h.title} className={cn("reveal relative mt-10 w-[66%]", right && "ml-auto text-right")}>
              <div className={cn("relative w-fit", right && "ml-auto")}>
                <Figure src={h.src} alt={h.alt} label={h.label} size="sm" delay={`${index * 0.5}s`} />
                <span data-anchor className="absolute left-1/2 top-1/2" />
              </div>
              <p className="font-serif text-2xl leading-tight">{h.title}</p>
              <p className="mt-1 text-sm leading-snug text-muted-foreground">{h.body}</p>
              {/* leave along the outer edge, below the words */}
              <Anchor x={right ? "calc(100% + 0.25rem)" : "-0.25rem"} y="calc(100% + 0.75rem)" />
            </div>
          );
        })}
      </div>

      {/* somehow, i keep ending up... — the years hang off the thread */}
      <div className="relative mt-20 px-5">
        <span data-say="the short version. very short." className="absolute left-0 top-20 h-px w-px" />
        <Anchor x="6%" y={-20} />
        <p className="reveal mx-auto max-w-[18rem] text-center font-serif text-[2rem] leading-tight">somehow,<br /><span className="text-muted-foreground">i keep ending up...</span></p>
        <ol className="relative mt-10 pl-9">
          {timeline.map((stop) => (
            <li key={stop.year + stop.title} className="reveal relative pb-7">
              <span data-anchor className="absolute -left-[1.1rem] top-[0.7rem]" />
              <span aria-hidden="true" className="absolute -left-[1.1rem] top-[0.7rem] h-px w-3 bg-muted-foreground/60" />
              <span aria-hidden="true" className="absolute left-[-0.4rem] top-[0.55rem] h-1.5 w-1.5 rounded-full bg-muted-foreground" />
              <p>{stop.title}</p>
              <p className="text-sm leading-snug text-muted-foreground">{stop.line}</p>
              <p className="mt-0.5 text-xs text-muted-foreground/80">{stop.year}</p>
            </li>
          ))}
        </ol>
        <Anchor x="6%" y="100%" />
      </div>
      <div className="relative px-5 pt-4">
        <p className="reveal text-center font-serif text-[2rem]"><span className="text-muted-foreground">...taking</span> ownership.</p>
        <div className="reveal mx-auto mt-3 max-w-[19rem] text-center text-sm leading-snug">
          <p>most things i got curious about, i ended up building.</p>
          <p className="text-muted-foreground">most things i built, i ended up looking after.</p>
        </div>
        <Anchor x="5%" y="calc(100% + 1rem)" />
      </div>

      {/* apparently, i don't know how to leave things alone — tied in a loop */}
      <div className="relative mt-16 px-5">
        <Anchor x="89%" y={-24} />
        <Anchor x="90%" y={150} />
        <p className="reveal font-serif text-[2.3rem] leading-[1.05]">apparently, <span className="text-muted-foreground">i don't know how to leave things alone.</span></p>
        <div className="reveal relative mt-4 h-[270px]">
          <span data-say="yes, it's a loop. i'm aware." className="absolute left-0 top-1/2 h-px w-px" />
          <Anchor x="86%" y={205} />
          <Anchor x="50%" y={230} loop={MOBILE_LOOP} />
          <span className="absolute -translate-x-1/2 translate-y-3 whitespace-nowrap text-sm" style={{ left: "50%", top: 230 }}>notice it.</span>
          <span className="absolute -translate-y-1/2 whitespace-nowrap text-sm" style={{ left: `calc(50% + ${MOBILE_LOOP + 10}px)`, top: 230 - MOBILE_LOOP }}>understand it.</span>
          <span className="absolute -translate-x-1/2 -translate-y-[calc(100%+0.6rem)] whitespace-nowrap text-sm" style={{ left: "50%", top: 230 - 2 * MOBILE_LOOP }}>build it.</span>
          <span className="absolute -translate-x-[calc(100%+0.6rem)] -translate-y-1/2 whitespace-nowrap text-sm" style={{ left: `calc(50% - ${MOBILE_LOOP}px)`, top: 230 - MOBILE_LOOP }}>hand it over.</span>
          <span className="absolute -translate-x-1/2 -translate-y-1/2 font-serif text-2xl italic" style={{ left: "50%", top: 230 - MOBILE_LOOP }}>repeat.</span>
        </div>
      </div>

      {/* enough autobiography — the thread ends at the button */}
      <div className="relative px-5 pb-24 pt-14 text-center">
        <span data-say="go on. it's the good part." className="absolute left-0 top-10 h-px w-px" />
        <Anchor x="94%" y={40} />
        <p className="reveal text-sm text-muted-foreground">enough autobiography.</p>
        <h2 className="reveal mt-2 font-serif text-[2.3rem] leading-tight">let's look at what<br />came out of it.</h2>
        <div className="relative mt-7 inline-block">
          <span data-anchor className="absolute left-[calc(100%+2.75rem)] top-[-0.25rem]" />
          <span data-anchor className="absolute left-full top-1/2" />
          <Button variant="ink" onClick={onWork}>see the work <ArrowDown className="ml-2 h-4 w-4" /></Button>
        </div>
      </div>
    </div>
  );
}

function Works({ filter, setFilter }: { filter: string; setFilter: (filter: string) => void }) {
  const filtered = filter === "All" ? projects : projects.filter((project) => project.tags.includes(filter));
  return (
    <section id="work" className="relative min-h-screen border-t border-foreground bg-background px-5 pb-24 pt-28 sm:px-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 overflow-hidden" aria-hidden="true"><p className="translate-y-[-38%] whitespace-nowrap text-[26vw] font-semibold leading-none text-muted">WORKS</p></div>
      <div className="relative mx-auto grid max-w-[1500px] gap-16 pt-[18vw] lg:grid-cols-[minmax(280px,0.65fr)_minmax(0,1.35fr)]">
        <aside className="h-fit lg:sticky lg:top-28">
          <p className="text-sm text-muted-foreground">selected work / 2022—now</p>
          <h2 className="mt-4 max-w-md font-serif text-5xl leading-none sm:text-6xl">a few things,<br /><em>chosen on purpose.</em></h2>
          <p className="mt-8 max-w-sm text-muted-foreground">AI, privacy, and open source, built end to end.</p>
          <p className="mb-3 mt-10 text-sm">show me</p>
          <div className="flex flex-wrap gap-2">
            {["All", "AI", "Privacy", "Open source"].map((item) => <Button key={item} variant="filter" data-active={filter === item} onClick={() => setFilter(item)} data-cursor={`filter: ${item.toLowerCase()}`}>{item}</Button>)}
          </div>
        </aside>
        <div className="grid gap-20">
          {filtered.map((project) => (
            <article key={project.title} className="group">
              <a href={project.live} target="_blank" rel="noreferrer" className="block overflow-hidden border border-border bg-muted" data-cursor="see it live ↗">
                <img src={project.image} alt={`${project.title} website`} loading="lazy" width={1200} height={912} className="aspect-[4/3] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025]" />
              </a>
              <div className="mt-5 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-5">
                <div className="min-w-0"><p className="text-xs text-muted-foreground">{project.number} / {project.tags.join(" · ")}</p><h3 className="mt-1 font-serif text-4xl">{project.title}</h3><p className="mt-2 max-w-xl text-muted-foreground">{project.blurb}</p></div>
                <Button asChild variant="paper" size="icon"><a href={project.code} target="_blank" rel="noreferrer" aria-label={`${project.title} on GitHub`} data-cursor="read the code ↗"><ArrowUpRight className="h-5 w-5" /></a></Button>
              </div>
            </article>
          ))}
          {filtered.length === 0 && <p className="py-24 text-muted-foreground">That shelf is being rearranged. Try another filter.</p>}
          {/* the way down to everything else */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-border pt-10">
            <p className="font-serif text-3xl">interested? <span className="text-muted-foreground">there's more.</span></p>
            <RabbitHoleButton />
          </div>
        </div>
      </div>
    </section>
  );
}

// Where the closing thread ends — her raised hand — in vw/vh of the section's
// first screen. The photo is pinned so that hand lands exactly on this point.
const HAND_X = 78;
const HAND_Y = 20;

// What I say as people keep playing with the cutout — one line per stretch,
// getting less patient, until it's time to just talk.
const meLines = [
  "oh, hi. you found me.",
  "hey, careful.",
  "okay, that tickles.",
  "you're enjoying this, aren't you?",
  "i'm a developer, not a rubber band.",
  `okay, enough. let's connect? ↓ ${EMAIL}`,
];

// My cutout, pinned by the raised hand. Hover and it pops forward and says
// hi; grab and drag to stretch it like rubber from that hand, and it springs
// back on release. Every stretch gets a new (less patient) line.
function MeCutout({ visible, phone = false, imgRef }: { visible: boolean; phone?: boolean; imgRef?: RefObject<HTMLImageElement | null> }) {
  const start = useRef<{ x: number; y: number } | null>(null);
  const [pull, setPull] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [stretches, setStretches] = useState(0);
  const [typed, setTyped] = useState("");

  // Stretch along the pull, squeezing the other way so it feels like rubber.
  const stretch = Math.min(1.8, Math.max(0.6, 1 + pull.y / 400));
  const squeeze = 1 / Math.sqrt(stretch);
  const lean = Math.max(-25, Math.min(25, pull.x / 12));

  const pulledHard = dragging && (stretch > 1.5 || stretch < 0.7 || Math.abs(lean) > 20);
  const line = pulledHard ? "ow. that's not how bodies work." : meLines[Math.min(stretches, meLines.length - 1)]!;
  const talking = hovered || dragging;
  useEffect(() => {
    if (talking) quietOthers(-2);
  }, [talking]);

  // Type each new line out, like the other objects' confessions.
  useEffect(() => {
    if (!talking) {
      setTyped("");
      return;
    }
    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setTyped(line.slice(0, index));
      if (index >= line.length) window.clearInterval(timer);
    }, 26);
    return () => window.clearInterval(timer);
  }, [talking, line]);

  const letGo = () => {
    if (start.current && (Math.abs(pull.x) > 20 || Math.abs(pull.y) > 20)) setStretches((n) => n + 1);
    start.current = null;
    setDragging(false);
    setPull({ x: 0, y: 0 });
  };

  return (
    <>
      <div
        aria-live="polite"
        style={phone ? { left: "-0.5rem", top: "22%", transitionTimingFunction: "cubic-bezier(.34,1.56,.64,1)" } : { left: `${HAND_X - 4}vw`, top: `${HAND_Y + 16}vh`, transitionTimingFunction: "cubic-bezier(.34,1.56,.64,1)" }}
        className={cn(
          "absolute z-10 w-max max-w-[16rem] -translate-x-full whitespace-pre-line rounded-[18px_18px_5px_18px] border border-cursor-border bg-cursor px-4 py-2 text-sm text-cursor-foreground shadow-lg transition-[opacity,scale] duration-300",
          phone && "max-w-[calc(42vw-1.5rem)]",
          talking ? "scale-100 opacity-100" : "scale-90 opacity-0",
        )}
      >
        {typed}
        <span className="animate-pulse">|</span>
      </div>
      <img
        ref={imgRef}
        src={me}
        alt="nidhi, one hand up in a peace sign, holding the end of the thread"
        draggable={false}
        onContextMenu={(e) => e.preventDefault()}
        data-cursor=""
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          start.current = { x: e.clientX, y: e.clientY };
          setDragging(true);
        }}
        onPointerMove={(e) => {
          if (!start.current) return;
          setPull({ x: e.clientX - start.current.x, y: e.clientY - start.current.y });
        }}
        onPointerUp={letGo}
        onPointerCancel={letGo}
        className={cn(
          phone ? "relative block h-auto w-full touch-none select-none" : "pointer-events-auto absolute h-[76vh] w-auto max-w-none touch-none select-none",
          dragging ? "cursor-grabbing" : "cursor-grab",
          visible ? "opacity-100" : "opacity-0",
        )}
        style={{
          ...(phone ? {} : { left: `${HAND_X}vw`, top: `${HAND_Y}vh`, translate: "-41% -2%" }),
          transformOrigin: "41% 2%",
          transform: `skewX(${-lean}deg) scale(${(hovered && !dragging ? 1.04 : 1) * squeeze}, ${(hovered && !dragging ? 1.04 : 1) * stretch})`,
          filter: talking ? "drop-shadow(0 24px 30px rgb(0 0 0 / 0.22))" : "drop-shadow(0 6px 10px rgb(0 0 0 / 0.08))",
          // Follow the finger instantly while dragging; wobble back when let go.
          transition: dragging ? "filter .3s" : "transform .9s cubic-bezier(.2,2.2,.4,.8), filter .3s, opacity .4s",
        }}
      />
    </>
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

// 10 — the end. "oh, hi. i'm nidhi." — and the thread leaves the "hi." and
// waves its way across into my raised hand. Margin notes scribbled around it.
function OhHi() {
  const ref = useRef<HTMLElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const hiRef = useRef<HTMLSpanElement>(null);
  // Only the two moments that change the layout go through React: the words
  // arriving, and the thread reaching my hand.
  const [stage, setStage] = useState({ seen: false, reached: false });
  const [thread, setThread] = useState("");
  const seen = stage.seen;
  // Phones: the thread runs down the page from "oh, hi." into my raised hand.
  const phoneImgRef = useRef<HTMLImageElement>(null);
  const phonePathRef = useRef<SVGPathElement>(null);
  const [phoneThread, setPhoneThread] = useState<{ d: string; y0: number; y1: number; w: number; h: number } | null>(null);
  const [phoneReached, setPhoneReached] = useState(false);

  // The thread starts right after "oh, hi." — wherever the type lands on this
  // screen — so measure it, then wave through to the hand.
  useEffect(() => {
    const measure = () => {
      const hi = hiRef.current;
      const section = ref.current;
      if (!hi || !section) return;
      const r = hi.getBoundingClientRect();
      const q = section.getBoundingClientRect();
      const sx = ((r.right - q.left) / window.innerWidth) * 100 + 0.8;
      const sy = ((r.top - q.top + r.height * 0.55) / window.innerHeight) * 100;
      // On phones, trace it in pixels: out of the "hi.", down the right edge,
      // and hook into the hand (41% across, 2% down the cutout).
      const img = phoneImgRef.current;
      if (window.innerWidth < 768 && img) {
        const m = img.getBoundingClientRect();
        const w = q.width;
        const start: Waypoint = [r.right - q.left + 6, r.top - q.top + r.height * 0.55];
        const hand: Waypoint = [m.left - q.left + m.width * 0.41, m.top - q.top + m.height * 0.02];
        const d = segmentsPath(threadSegments([start, [w * 0.9, start[1] + 36], [w * 0.95, (start[1] + hand[1]) / 2], [hand[0] + 44, hand[1] - 80], hand], 1, 1));
        setPhoneThread({ d, y0: start[1], y1: hand[1], w, h: q.height });
      }
      const crest = Math.max(sx + 6, 31);
      setThread(threadPath([[sx, sy], [crest, sy - 4], [crest + 14, 36], [59, 51.5], [68, 38], [72.5, HAND_Y + 3], [HAND_X - 2.5, HAND_Y + 0.2], [HAND_X, HAND_Y]]));
    };
    measure();
    void document.fonts?.ready.then(measure);
    // The cutout has no height until it loads, so trace again once it has.
    const photo = phoneImgRef.current;
    photo?.addEventListener("load", measure);
    window.addEventListener("resize", measure);
    return () => {
      photo?.removeEventListener("load", measure);
      window.removeEventListener("resize", measure);
    };
  }, []);

  useEffect(() => {
    if (!phoneThread) return;
    let frame = 0;
    const draw = () => {
      frame = 0;
      const node = ref.current;
      const path = phonePathRef.current;
      if (!node || !path) return;
      const top = node.getBoundingClientRect().top;
      const p = Math.min(1, Math.max(0, (window.innerHeight * 0.72 - (top + phoneThread.y0)) / Math.max(1, phoneThread.y1 - phoneThread.y0)));
      path.style.strokeDashoffset = `${1 - p}`;
      setPhoneReached(p >= 0.98);
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
  }, [phoneThread]);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    // Arrive and the thread travels toward my hand; scroll back up and it
    // retraces its way out. It animates on its own rather than sticking to
    // the scrollbar, easing toward wherever it should be.
    let frame = 0;
    let current = 0;
    let greeted = false;
    const tick = () => {
      const { top } = node.getBoundingClientRect();
      const target = top < window.innerHeight * 0.45 ? 1 : 0;
      const gap = target - current;
      current = Math.abs(gap) < 0.002 ? target : current + gap * 0.045 + Math.sign(gap) * 0.004;
      current = Math.min(1, Math.max(0, current));
      if (pathRef.current) pathRef.current.style.strokeDashoffset = `${1 - current}`;
      const next = { seen: current > 0.3, reached: current >= 0.98 };
      if (next.reached && !greeted) {
        greeted = true;
        say("hi", "you made it all the way here? hi.");
      }
      setStage((s) => (s.seen === next.seen && s.reached === next.reached ? s : next));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  // Fade and sharpen something in, merged with its own classes and style.
  const arrive = (on: boolean, delay: string, className: string, style?: CSSProperties) => ({
    className: cn(className, "transition-all duration-700", on ? "translate-y-0 opacity-100 blur-0" : "translate-y-3 opacity-0 blur-sm"),
    style: { ...style, transitionDelay: on ? delay : "0s" },
  });

  return (
    <section id="hi" ref={ref} className="relative min-h-screen overflow-hidden border-t border-border px-5 pb-10 pt-28 sm:px-8 md:h-screen md:min-h-[720px] md:px-[4.5vw] md:pb-0 md:pt-[23vh]">
      {phoneThread && (
        <svg aria-hidden="true" className="pointer-events-none absolute left-0 top-0 md:hidden" width={phoneThread.w} height={phoneThread.h} viewBox={`0 0 ${phoneThread.w} ${phoneThread.h}`}>
          <path ref={phonePathRef} d={phoneThread.d} pathLength="1" strokeDasharray="1" style={{ strokeDashoffset: 1 }} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      )}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-10 hidden h-screen md:block">
        <svg viewBox="0 0 1000 1000" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
          <path ref={pathRef} pathLength="1" strokeDasharray="1" style={{ strokeDashoffset: 1 }} d={thread} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
        {/* little sparks where the thread meets the peace sign */}
        <svg viewBox="0 0 40 40" className={cn("absolute h-14 w-14 transition-all duration-500", stage.reached ? "scale-100 opacity-100" : "scale-50 opacity-0")} style={{ left: `calc(${HAND_X}vw + 0.4rem)`, top: `calc(${HAND_Y}vh - 3.4rem)` }}>
          <path d="M9 4 L11 15 M23 7 L18 17 M33 17 L23 21" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <MeCutout visible={stage.reached} />
        <div {...arrive(stage.reached, ".3s", "absolute", { left: `${HAND_X + 9.5}vw`, top: "32vh" })}>
          <Scribble className="w-36" rotate={-14}>same girl...<br />just more<br />ideas now.</Scribble>
          <ScribbleArrow className="-left-2 top-24" d="M30 4 C32 20 22 32 6 36" head="M6 36 L16 29 M6 36 L15 42" />
        </div>
        <div {...arrive(stage.reached, ".6s", "absolute", { left: `${HAND_X + 9.5}vw`, top: "65vh" })}>
          <Scribble className="w-36" rotate={-14}>still figuring<br />this out...<br />and probably<br />always will.</Scribble>
          <ScribbleArrow className="-left-12 top-10" d="M40 18 C30 30 18 32 6 30" head="M6 30 L15 24 M6 30 L14 37" />
        </div>
      </div>

      <div {...arrive(seen, "0s", "relative md:max-w-[58vw]")}>
        <div className="relative w-fit">
          <Scribble className="absolute -left-1 -top-14 hidden md:block" rotate={-12}>who made this?</Scribble>
          <ScribbleArrow className="-left-8 -top-7 hidden md:block" d="M26 4 C12 10 6 22 10 36" head="M10 36 L4 27 M10 36 L16 29" />
          <h2 className="font-serif text-[clamp(3.5rem,6.6vw,7.5rem)] leading-[0.9] tracking-[-0.01em]">
            <span ref={hiRef}>oh, hi.</span>
            <br />
            i'm <em>sachin</em>.
          </h2>
        </div>
        <p className="mt-4 text-[clamp(1.05rem,1.25vw,1.35rem)] leading-[1.2] text-muted-foreground">still curious.<br />still building.<br />still learning.</p>
        <p className="mt-7 font-serif text-[clamp(1.75rem,2.75vw,3rem)] leading-[1.08]">let's build something<br />the world <em>hasn't seen yet</em>.</p>
        <div className="relative mt-7 flex w-fit flex-col items-start gap-3">
          <a href={`mailto:${EMAIL}`} className={cn(pill, "min-w-64 bg-foreground py-3 text-background hover:bg-foreground/85")} data-cursor="send the interesting idea.">{EMAIL} <ArrowUpRight className="h-4 w-4" /></a>
          <div className="flex flex-wrap gap-3">
            <a href={LINKS.linkedin} target="_blank" rel="noreferrer" className={cn(pill, "border border-foreground/50 py-2.5 hover:bg-foreground/5 max-md:bg-background")} data-cursor="the professional version.">linkedin <ArrowUpRight className="h-4 w-4" /></a>
            <a href={LINKS.github} target="_blank" rel="noreferrer" className={cn(pill, "border border-foreground/50 py-2.5 hover:bg-foreground/5 max-md:bg-background")} data-cursor="where the ideas come alive.">github <ArrowUpRight className="h-4 w-4" /></a>
            <a href={LINKS.x} target="_blank" rel="noreferrer" className={cn(pill, "border border-foreground/50 py-2.5 hover:bg-foreground/5 max-md:bg-background")} data-cursor="thoughts and musings.">x <ArrowUpRight className="h-4 w-4" /></a>
            <a href={LINKS.leetcode} target="_blank" rel="noreferrer" className={cn(pill, "border border-foreground/50 py-2.5 hover:bg-foreground/5 max-md:bg-background")} data-cursor="problem solving journey.">leetcode <ArrowUpRight className="h-4 w-4" /></a>
          </div>
          {/* the astronaut sits just past the buttons, its fun fact scribbled beside it */}
          <div className="absolute bottom-[-1.75rem] left-[calc(100%+5vw)] hidden items-end gap-1 md:flex">
            <div className="relative mb-24">
              <Scribble className="w-36" rotate={-10}>fun fact:<br />i love solving<br />complex problems.</Scribble>
              <ScribbleArrow className="-right-8 top-[4.5rem]" d="M4 8 C8 22 18 30 34 30" head="M34 30 L25 24 M34 30 L26 37" />
            </div>
            <Figure src={astronaut} alt="a small astronaut holding a star" label="still aiming for the stars. just with code." size="sm" />
          </div>
        </div>
        <div className="relative ml-auto mt-16 w-[58%] md:hidden">
          <MeCutout phone visible={phoneReached} imgRef={phoneImgRef} />
          {/* the astronaut, standing by my legs, with its fun fact above it */}
          <div className="absolute bottom-[1%] right-[66%] flex w-40 flex-col items-center">
            <Scribble className="mb-1 w-36 text-center" rotate={-8}>fun fact:<br />i love solving<br />complex problems.</Scribble>
            <Figure src={astronaut} alt="a small astronaut holding a star" label="reaching for the stars through code." size="sm" />
          </div>
        </div>
      </div>

      <button onClick={() => document.getElementById("brain")?.scrollIntoView({ behavior: "smooth" })} className="story-link mt-10 block bg-transparent text-xs text-muted-foreground/70 md:absolute md:bottom-5 md:right-8 md:mt-0" data-cursor="rewind ↑">© 2026 sachin · back to top ↑</button>
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
            "flex items-center gap-2.5 rounded-full border border-violet-500/40 bg-zinc-950/90 px-4 py-2 text-white shadow-[0_8px_30px_rgba(124,58,237,0.35)] backdrop-blur-md transition-[opacity,scale] duration-300",
            comment ? "scale-100 opacity-100" : "scale-75 opacity-0",
          )}
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-500" />
          </span>
          <span className="font-serif text-[15px] italic tracking-wide text-zinc-100">
            {typed || " "}
          </span>
          {comment.tag && (
            <span className="rounded-full border border-violet-500/40 bg-violet-500/20 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-violet-200">
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
            "flex items-center gap-2.5 rounded-full border border-violet-500/40 bg-zinc-950/90 px-4 py-2 text-white shadow-[0_8px_30px_rgba(124,58,237,0.35)] backdrop-blur-md transition-[opacity,scale] duration-300",
            showing ? "scale-100 opacity-100" : "scale-75 opacity-0",
          )}
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-500" />
          </span>
          <span className="font-serif text-[15px] italic tracking-wide text-zinc-100">
            {typed || " "}
          </span>
          {comment.tag && (
            <span className="rounded-full border border-violet-500/40 bg-violet-500/20 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-violet-200">
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
