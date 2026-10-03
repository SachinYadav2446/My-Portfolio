import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [stage, setStage] = useState<"initial" | "dropElements" | "fadeOut" | "complete">("initial");

  useEffect(() => {
    // Stage 1: Show name in center (3 seconds)
    const stage1Timer = setTimeout(() => {
      setStage("dropElements");
    }, 3000);

    // Stage 2: Elements drop in (2.5 seconds for all elements)
    const stage2Timer = setTimeout(() => {
      setStage("fadeOut");
    }, 5500);

    // Stage 3: Fade out everything together
    const completeTimer = setTimeout(() => {
      setStage("complete");
      onComplete();
    }, 7000);

    return () => {
      clearTimeout(stage1Timer);
      clearTimeout(stage2Timer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  if (stage === "complete") return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[200] flex items-center justify-center bg-gradient-to-br from-background via-background to-background/95 transition-opacity duration-[1000ms]",
        stage === "fadeOut" ? "opacity-0" : "opacity-100"
      )}
    >
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Main name container - stays in center, then fades out */}
      <div
        className={cn(
          "relative z-10 transition-all duration-700",
          stage === "initial" && "scale-100 opacity-100",
          stage === "dropElements" && "scale-100 opacity-100",
          stage === "fadeOut" && "scale-95 opacity-0"
        )}
      >
        <div className="text-center">
          {/* Main brand name */}
          <h1
            className={cn(
              "relative mb-4 font-serif text-6xl font-medium tracking-tight sm:text-7xl md:text-8xl"
            )}
          >
            <span className={cn(
              "inline-block animate-fade-in bg-gradient-to-r from-foreground via-foreground/90 to-foreground bg-clip-text text-transparent",
              "[animation-delay:300ms] [animation-duration:1200ms]"
            )}>
              Binary
            </span>
            {" "}
            <span className={cn(
              "inline-block animate-fade-in bg-gradient-to-r from-foreground/90 via-foreground to-foreground/90 bg-clip-text text-transparent",
              "[animation-delay:800ms] [animation-duration:1200ms]"
            )}>
              Sphere
            </span>
          </h1>

          {/* Subtitle with name */}
          <p
            className={cn(
              "animate-fade-in text-xl font-light text-muted-foreground sm:text-2xl md:text-3xl",
              "[animation-delay:1400ms] [animation-duration:1200ms]"
            )}
          >
            aka Sachin Yadav
          </p>

          {/* Decorative line */}
          <div className={cn(
            "mx-auto mt-6 h-[2px] w-24 animate-fade-in rounded-full bg-gradient-to-r from-transparent via-foreground/40 to-transparent",
            "[animation-delay:1800ms] [animation-duration:1000ms]"
          )} />

          {/* Tagline */}
          <p className={cn(
            "mt-6 animate-fade-in text-sm text-muted-foreground/60",
            "[animation-delay:2200ms] [animation-duration:1000ms]"
          )}>
            Building intelligent systems
          </p>
        </div>
      </div>

      {/* Elements ONLY appear AFTER name is settled in corner */}
      {stage === "dropElements" && (
        <div className="fixed inset-0 z-10 overflow-hidden">
          {/* Code brackets - top left */}
          <div
            className="absolute left-[8%] top-[12%] animate-drop-in opacity-0 md:left-[12%] md:top-[15%]"
            style={{ animationDelay: "200ms", animationDuration: "900ms", animationFillMode: "forwards" }}
          >
            <div className="font-mono text-5xl font-bold text-foreground/10 md:text-6xl">
              {"</>"}
            </div>
          </div>

          {/* AI Chip - top right */}
          <div
            className="absolute right-[10%] top-[18%] animate-drop-in opacity-0 md:right-[15%] md:top-[20%]"
            style={{ animationDelay: "450ms", animationDuration: "900ms", animationFillMode: "forwards" }}
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 shadow-lg backdrop-blur-sm md:h-20 md:w-20">
              <span className="text-xl font-bold text-foreground/40 md:text-2xl">AI</span>
            </div>
          </div>

          {/* Binary sphere - middle left */}
          <div
            className="absolute bottom-[35%] left-[15%] animate-drop-in opacity-0 md:bottom-[40%] md:left-[20%]"
            style={{ animationDelay: "700ms", animationDuration: "900ms", animationFillMode: "forwards" }}
          >
            <div className="relative h-24 w-24 md:h-32 md:w-32">
              <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-br from-teal-500/10 to-green-500/10 blur-xl" />
              <div className="absolute inset-2 flex items-center justify-center rounded-full border-2 border-foreground/10">
                <span className="font-mono text-xs text-foreground/20">01010</span>
              </div>
            </div>
          </div>

          {/* Data visualization - bottom right */}
          <div
            className="absolute bottom-[28%] right-[12%] animate-drop-in opacity-0 md:bottom-[30%] md:right-[18%]"
            style={{ animationDelay: "950ms", animationDuration: "900ms", animationFillMode: "forwards" }}
          >
            <div className="flex gap-1">
              <div className="h-12 w-2 rounded-full bg-foreground/10" />
              <div className="h-16 w-2 rounded-full bg-foreground/15" />
              <div className="h-10 w-2 rounded-full bg-foreground/10" />
              <div className="h-14 w-2 rounded-full bg-foreground/12" />
            </div>
          </div>

          {/* Floating dots pattern - right side */}
          <div
            className="absolute right-[25%] top-[45%] animate-drop-in opacity-0 md:right-[30%]"
            style={{ animationDelay: "1200ms", animationDuration: "900ms", animationFillMode: "forwards" }}
          >
            <div className="grid grid-cols-3 gap-2">
              <div className="h-2 w-2 rounded-full bg-foreground/10" />
              <div className="h-2 w-2 rounded-full bg-foreground/15" />
              <div className="h-2 w-2 rounded-full bg-foreground/10" />
              <div className="h-2 w-2 rounded-full bg-foreground/15" />
              <div className="h-2 w-2 rounded-full bg-foreground/20" />
              <div className="h-2 w-2 rounded-full bg-foreground/15" />
              <div className="h-2 w-2 rounded-full bg-foreground/10" />
              <div className="h-2 w-2 rounded-full bg-foreground/15" />
              <div className="h-2 w-2 rounded-full bg-foreground/10" />
            </div>
          </div>

          {/* Geometric shape - bottom left */}
          <div
            className="absolute bottom-[20%] left-[25%] animate-drop-in opacity-0 md:bottom-[22%] md:left-[28%]"
            style={{ animationDelay: "1450ms", animationDuration: "900ms", animationFillMode: "forwards" }}
          >
            <div className="h-12 w-12 rotate-45 border-2 border-foreground/10 md:h-16 md:w-16" />
          </div>
        </div>
      )}

      {/* Loading indicator - only show initially */}
      {stage === "initial" && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2">
          <div className="flex gap-2">
            <div className="h-2 w-2 animate-bounce rounded-full bg-foreground/50 [animation-delay:0ms]" />
            <div className="h-2 w-2 animate-bounce rounded-full bg-foreground/50 [animation-delay:150ms]" />
            <div className="h-2 w-2 animate-bounce rounded-full bg-foreground/50 [animation-delay:300ms]" />
          </div>
        </div>
      )}
    </div>
  );
}
