import { cn } from "@/lib/cn";

type Props = { className?: string; children: React.ReactNode };

export function Container({ className, children }: Props) {
  return (
    <div
      className={cn("mx-auto w-full max-w-[1440px] px-4 md:px-6 lg:px-8", className)}
    >
      {children}
    </div>
  );
}
