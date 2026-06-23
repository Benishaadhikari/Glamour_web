import Link from "next/link";

export function GlamourHeader() {
  return (
    <header className="header">
      <button className="close-btn" aria-label="Close">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
      </button>
      <Link href="/" className="brand-logo">
        Glamour
      </Link>
    </header>
  );
}
