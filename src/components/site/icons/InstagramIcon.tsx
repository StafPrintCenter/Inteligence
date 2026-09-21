export function InstagramIcon({ size = 16, className = "", }: { size?: number; className?: string; }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M4 8a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8" />
      <path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0-6 0" />
      <path d="M16.5 7.5v.01" />
    </svg>
  );
}