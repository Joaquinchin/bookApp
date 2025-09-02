import Link from "next/link";

type PaginationProps = {
  searchQuery: string;
  startIndex: number;
  count: number;         
  totalItems?: number;
};

function encodeRFC3986(str: string) {
  return encodeURIComponent(str).replace(/[!'()*]/g, (c) =>
    "%" + c.charCodeAt(0).toString(16).toUpperCase()
  );
}

export default function Pagination({
  searchQuery,
  startIndex,
  count,
  totalItems,
}: PaginationProps) {
  const pageSize = Math.max(1, count || 20);

  const isFirstPage = startIndex === 0;
  const isLastPage = !!(totalItems && startIndex + count >= totalItems);

  const q = encodeRFC3986(searchQuery);
  const prevStart = Math.max(0, startIndex - pageSize);
  const nextStart = startIndex + pageSize;

  return (
    <nav className="flex items-center justify-between pt-8">
      <Link
        aria-disabled={isFirstPage}
        className={`rounded-xl px-4 py-2 text-sm font-semibold border transition ${
          isFirstPage
            ? "border-neutral-800 bg-neutral-900/40 text-neutral-600 cursor-not-allowed pointer-events-none"
            : "border-neutral-700 hover:bg-neutral-900 text-neutral-200"
        }`}
        href={`/search?q=${q}&start=${prevStart}`}
      >
        ← Anterior
      </Link>

      <Link
        aria-disabled={isLastPage}
        className={`rounded-xl px-4 py-2 text-sm font-semibold border transition ${
          isLastPage
            ? "border-neutral-800 bg-neutral-900/40 text-neutral-600 cursor-not-allowed pointer-events-none"
            : "border-neutral-700 hover:bg-neutral-900 text-neutral-200"
        }`}
        href={`/search?q=${q}&start=${nextStart}`}
      >
        Siguiente →
      </Link>
    </nav>
  );
}