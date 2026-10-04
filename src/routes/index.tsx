import { createFileRoute } from '@tanstack/react-router';
import { ArrowDown, ArrowUp, ArrowUpRight, Check, Copy, Mail } from "lucide-react";
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

      {/* transition section */}
      <div className="relative h-[180px]">
        <span data-say="exploring new technologies." className="absolute left-0 top-0 h-px w-px" />
        <Anchor x="25%" y={40} />
        <Anchor x="75%" y={120} />
      </div>

      {/* my journey — the years hang off the thread */}
      <div className="relative mt-12 px-5">
        <span data-say="my journey: continuous growth and building." className="absolute left-0 top-20 h-px w-px" />
        <Anchor x="6%" y={-20} />
        <div className="reveal mx-auto max-w-[20rem] text-center mb-6">
          <span className="px-2.5 py-0.5 text-[10px] font-mono font-medium rounded-full bg-foreground/[0.06] text-foreground border border-foreground/20 uppercase tracking-wider inline-block mb-1.5">Evolutionary Path</span>
          <h2 className="font-serif text-3xl font-medium leading-tight">The Journey <span className="italic text-muted-foreground">of Growth</span></h2>
        </div>
        <ol className="relative pl-4 space-y-4">
          {timeline.map((stop, index) => (
            <li key={stop.year + stop.title} className="reveal relative pl-6 pb-2">
              <span data-anchor className="absolute left-0 top-3" />
              <span className={cn("absolute left-0 top-2.5 h-2.5 w-2.5 rounded-full -translate-x-1/2 drop-shadow-[0_0_6px_rgba(255,255,255,0.4)]", stop.dotClass)} />
              <div className="rounded-xl border border-border/80 bg-background/90 p-3.5 shadow-md backdrop-blur-sm">
                <div className="flex items-center justify-between mb-1.5">
                  <span className={cn("px-2 py-0.5 text-[9px] font-mono font-medium rounded-full border uppercase tracking-wider", stop.badgeClass)}>
                    {stop.year}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground/60">0{index + 1} // {stop.phase}</span>
                </div>
                <h3 className="font-serif text-base font-medium">{stop.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{stop.line}</p>
              </div>
            </li>
          ))}
        </ol>
        <Anchor x="6%" y="100%" />
      </div>


      {/* the thread ends at the work transition */}
      <div className="relative px-4 pb-20 pt-10 text-center flex flex-col items-center justify-center min-h-[90vh]">
        <span data-say="go on. explore the projects." className="absolute left-0 top-10 h-px w-px" />
        <Anchor x="94%" y={40} />
        {/* FULL-HEIGHT PORTRAIT ON MOBILE - NO TEXT OVERLAY */}
        <div className="reveal relative mx-auto w-full h-[78vh] flex items-center justify-center overflow-hidden">
          <img
            src={beyondCodePortrait}
            alt="Sachin Yadav portrait line art"
            className="h-full w-auto max-h-[78vh] object-contain opacity-100 contrast-125 dark:invert dark:opacity-95"
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

    // ── Scroll-trap ──────────────────────────────────────────────────────────
    // Intercept wheel & touch events while this section is in play so a fast
    // scroll can't skip past the portrait animation entirely.
    let touchStartY = 0;

    const onWheel = (e: WheelEvent) => {
      const node = sectionRef.current;
      if (!node) return;

      const sectionTop = node.offsetTop;
      const sectionHeight = node.offsetHeight;
      const vh = window.innerHeight;
      const scrollTop = window.scrollY;

      const sectionScrollEnd = sectionTop + sectionHeight - vh;

      const insideSection = scrollTop >= sectionTop && scrollTop <= sectionScrollEnd;
      const justAbove = scrollTop < sectionTop && scrollTop > sectionTop - vh && e.deltaY > 0;
      const justBelow = scrollTop > sectionScrollEnd && scrollTop < sectionScrollEnd + vh && e.deltaY < 0;

      if (insideSection || justAbove || justBelow) {
        e.preventDefault();
        const delta = e.deltaY * 0.9;
        const target = Math.min(sectionScrollEnd, Math.max(sectionTop, scrollTop + delta));
        window.scrollTo({ top: target, behavior: "instant" });
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0]?.clientY ?? 0;
    };

    const onTouchMove = (e: TouchEvent) => {
      const node = sectionRef.current;
      if (!node) return;

      const touchY = e.touches[0]?.clientY ?? 0;
      const deltaY = (touchStartY - touchY) * 2;
      touchStartY = touchY;

      const sectionTop = node.offsetTop;
      const sectionHeight = node.offsetHeight;
      const vh = window.innerHeight;
      const scrollTop = window.scrollY;
      const sectionScrollEnd = sectionTop + sectionHeight - vh;
      const insideSection = scrollTop >= sectionTop && scrollTop <= sectionScrollEnd;

      if (insideSection) {
        e.preventDefault();
        const target = Math.min(sectionScrollEnd, Math.max(sectionTop, scrollTop + deltaY));
        window.scrollTo({ top: target, behavior: "instant" });
      }
    };

    tick();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
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
