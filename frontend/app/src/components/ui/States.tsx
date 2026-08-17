import { AlertTriangle, Inbox } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-ink-soft">
      <Spinner />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-sm border border-dashed border-border py-16 text-center text-ink-soft">
      <Inbox className="h-6 w-6" />
      <p className="font-medium text-ink">{title}</p>
      {description && <p className="max-w-sm text-sm">{description}</p>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-sm border border-burgundy-soft bg-burgundy-soft/40 py-12 text-center">
      <AlertTriangle className="h-6 w-6 text-burgundy" />
      <p className="max-w-md text-sm text-burgundy">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="text-sm font-medium text-forest underline underline-offset-2">
          Try again
        </button>
      )}
    </div>
  );
}

export function InlineBanner({ tone = "danger", children }: { tone?: "danger" | "warning" | "success"; children: React.ReactNode }) {
  const styles = {
    danger: "border-burgundy-soft bg-burgundy-soft/50 text-burgundy",
    warning: "border-gold-soft bg-gold-soft/60 text-ink",
    success: "border-forest-soft bg-forest-soft/60 text-forest-dark",
  }[tone];
  return (
    <div role="alert" className={`rounded-sm border px-3 py-2 text-sm ${styles}`}>
      {children}
    </div>
  );
}
