import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      className={cn('h-8 w-auto', className)}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g>
        <path
          d="M50 5C74.8528 5 95 25.1472 95 50C95 74.8528 74.8528 95 50 95C25.1472 95 5 74.8528 5 50"
          stroke="hsl(var(--primary))"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d="M50 50L75 25"
          stroke="hsl(var(--accent))"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d="M50 50L50 85"
          stroke="hsl(var(--primary))"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <circle
          cx="50"
          cy="50"
          r="10"
          fill="hsl(var(--accent))"
        />
      </g>
    </svg>
  );
}
