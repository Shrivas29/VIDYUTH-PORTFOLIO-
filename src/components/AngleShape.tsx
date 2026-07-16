export function AngleShape({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`bg-green ${className}`}
      style={{ clipPath: "polygon(8% 0, 100% 0, 92% 100%, 0 100%)" }}
    />
  );
}
