import Link from "next/link";

type BookCardProps = {
  volume: {
    id: string;
    volumeInfo?: {
      title?: string;
      authors?: string[];
      description?: string;
      publishedDate?: string;
      categories?: string[];
      imageLinks?: {
        thumbnail?: string;
        small?: string;
        smallThumbnail?: string;
      };
    };
  };
  searchQuery: string;
  startIndex: number;
};

function toHttps(url?: string) {
  if (!url) return "";
  try {
    const u = new URL(url);
    if (u.protocol === "http:") u.protocol = "https:";
    return u.toString();
  } catch {
    // fallback simple por si no es una URL válida
    return url.replace(/^http:\/\//, "https://");
  }
}

export default function BookCard({ volume, searchQuery, startIndex }: BookCardProps) {
  const info = volume.volumeInfo ?? {};

  // orden de preferencia: thumbnail -> small -> smallThumbnail
  const raw =
    info.imageLinks?.thumbnail ??
    info.imageLinks?.small ??
    info.imageLinks?.smallThumbnail ??
    "";

  const thumb = toHttps(raw);

  return (
    <li className="rounded-2xl border border-neutral-800 bg-neutral-900/60 hover:bg-neutral-900 transition shadow-sm">
      <Link
        href={`/book/${volume.id}?q=${encodeURIComponent(searchQuery)}&start=${startIndex}`}
        className="flex gap-4 p-4"
      >
        <div
          className="relative w-[88px] shrink-0 rounded-xl border border-neutral-800 bg-neutral-900"
          style={{ aspectRatio: "2 / 3" }}
        >
          {thumb ? (
            <img
              src={thumb}
              alt={info.title ?? ""}
              className="absolute inset-0 h-full w-full object-contain rounded-xl"
              width={88}
              height={132}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-neutral-800 text-[10px] text-neutral-300 px-1 text-center">
              sin portada
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-neutral-100 line-clamp-2">
            {info.title ?? "Sin título"}
          </h3>

          {!!info.authors?.length && (
            <p className="text-sm text-neutral-400 mt-1 line-clamp-1">
              {info.authors.join(", ")}
            </p>
          )}

          {info.description && (
            <p className="mt-2 text-sm text-neutral-300 line-clamp-3">
              {info.description}
            </p>
          )}

          <div className="mt-3 text-xs text-neutral-500">
            {info.publishedDate && <span>{info.publishedDate}</span>}
            {info.categories?.length ? (
              <>
                {" "}· <span>{info.categories[0]}</span>
              </>
            ) : null}
          </div>
        </div>
      </Link>
    </li>
  );
}
