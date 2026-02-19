import { cn } from '@/lib/cn';

type Props = {
  className?: string;
  children: React.ReactNode;
};

export function Container({ className, children }: Props) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-[1440px] px-4 md:px-8 lg:px-14",
        className
      )}
    >
      {children}
    </div>
  );
}
