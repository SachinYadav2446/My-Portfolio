import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [stage, setStage] = useState<"initial" | "fadeOut" | "complete">("initial");

  useEffect(() => {
    // Show name in center, then fade out cleanly
    const fadeTimer = setTimeout(() => {
      setStage("fadeOut");
    }, 2000);

    const completeTimer = setTimeout(() => {
      setStage("complete");
      onComplete();
    }, 2900);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  if (stage === "complete") return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[200] flex items-center justify-center bg-gradient-to-br from-background via-background to-background/95 transition-opacity duration-[900ms]",
        stage === "fadeOut" ? "opacity-0" : "opacity-100"
      )}
    >
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-[0.035]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Main name container - stays in center, then fades out */}
      <div
        className={cn(
          "relative z-10 transition-all duration-700",
          stage === "initial" && "scale-100 opacity-100",
          stage === "fadeOut" && "scale-95 opacity-0"
        )}
      >
        <div className="text-center">
          {/* Main brand name */}
          <h1 className="relative mb-4 font-serif text-6xl font-medium tracking-tight sm:text-7xl md:text-8xl">
            <span
              className={cn(
                "inline-block animate-fade-in bg-gradient-to-r from-foreground via-foreground/90 to-foreground bg-clip-text text-transparent",
                "[animation-delay:200ms] [animation-duration:1000ms]"
              )}
            >
              Binary
            </span>{" "}
            <span
              className={cn(
                "inline-block animate-fade-in bg-gradient-to-r from-foreground/90 via-foreground to-foreground/90 bg-clip-text text-transparent",
                "[animation-delay:600ms] [animation-duration:1000ms]"
              )}
            >
              Sphere
            </span>
          </h1>

          {/* Subtitle with name */}
          <p
            className={cn(
              "animate-fade-in text-xl font-light text-muted-foreground sm:text-2xl md:text-3xl",
              "[animation-delay:1000ms] [animation-duration:1000ms]"
            )}
          >
            aka Sachin Yadav
          </p>

          {/* Decorative line */}
          <div
            className={cn(
              "mx-auto mt-6 h-[2px] w-24 animate-fade-in rounded-full bg-gradient-to-r from-transparent via-foreground/40 to-transparent",
              "[animation-delay:1300ms] [animation-duration:800ms]"
            )}
          />

          {/* Tagline */}
          <p
            className={cn(
              "mt-6 animate-fade-in text-sm text-muted-foreground/60",
              "[animation-delay:1600ms] [animation-duration:800ms]"
            )}
          >
            Building intelligent systems
          </p>
        </div>
      </div>
    </div>
  );
}
