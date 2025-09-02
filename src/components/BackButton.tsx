import Link from "next/link";

type BackButtonProps = {
  searchQuery?: string;
  startIndex?: string;
};

// Codifica también ! ' ( ) *
function encodeRFC3986(str: string) {
  return encodeURIComponent(str).replace(/[!'()*]/g, (c) =>
    "%" + c.charCodeAt(0).toString(16).toUpperCase()
  );
}

export default function BackButton({ searchQuery, startIndex }: BackButtonProps) {
  const q = typeof searchQuery === "string" ? encodeRFC3986(searchQuery) : "";

  const href = searchQuery
    ? `/search?q=${q}${startIndex ? `&start=${startIndex}` : ""}`
    : "/";

  return (
    <Link
      href={href}
      className="rounded-xl bg-indigo-600 px-4 py-2 text-sm md:text-base font-bold text-white shadow hover:bg-indigo-500 transition"
    >
      Volver
    </Link>
  );
}
