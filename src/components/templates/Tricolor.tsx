/** A line in the Italian colors (green, white, red) — like the ornaments on an Italian restaurant's menu. */
export default function Tricolor({ className = "" }: { className?: string }) {
  return (
    <span aria-hidden className={`flex gap-1.5 ${className}`}>
      <span className="h-[3px] flex-1 rounded-full bg-[#1f9d55]" />
      <span className="h-[3px] flex-1 rounded-full bg-[#f5f5f3]" />
      <span className="h-[3px] flex-1 rounded-full bg-[#e1262d]" />
    </span>
  );
}
