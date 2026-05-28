/** The fousa.be wordmark with the coral period. Single source of truth so it can't drift. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={className}>
      fousa<span className="text-accent">.</span>be
    </span>
  );
}
