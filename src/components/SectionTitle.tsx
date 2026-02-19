import { cn } from '@/lib/cn';

type Props = {
  overline?: string;
  title: string;
  description?: string;
  className?: string;
};

export function SectionTitle({ overline, title, description, className }: Props) {
  return (
    <div className={cn('space-y-2', className)}>
      {overline ? (
        <div className="text-xs font-semibold tracking-[0.18em] opacity-70">{overline}</div>
      ) : null}
      <h2 className="text-2xl font-extrabold leading-tight md:text-3xl">{title}</h2>
      {description ? <p className="max-w-[72ch] opacity-80">{description}</p> : null}
    </div>
  );
}
