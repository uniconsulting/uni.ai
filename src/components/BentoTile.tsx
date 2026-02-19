import { cn } from '@/lib/cn';

type Props = {
  className?: string;
  children: React.ReactNode;
};

export function BentoTile({ className, children }: Props) {
  return <div className={cn('bento-tile p-6', className)}>{children}</div>;
}
