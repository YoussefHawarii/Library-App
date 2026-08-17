import { cn } from "@/lib/utils/cn";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-sm border border-border bg-paper-raised p-5 shadow-[2px_2px_0_0_var(--border)]",
        className
      )}
      {...props}
    />
  );
}
