import { cn } from "@/lib/utils/cn";

type Tone = "neutral" | "success" | "warning" | "danger";

const tones: Record<Tone, string> = {
  neutral: "bg-paper-sunken text-ink-soft",
  success: "bg-forest-soft text-forest-dark",
  warning: "bg-gold-soft text-ink",
  danger: "bg-burgundy-soft text-burgundy",
};

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        tones[tone]
      )}
    >
      {children}
    </span>
  );
}
