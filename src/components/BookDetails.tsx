import { pickCover } from "@/lib/cover";

interface ImageLinks {
  smallThumbnail?: string;
  thumbnail?: string;
  small?: string;
  medium?: string;
  large?: string;
  extraLarge?: string;
}

interface IndustryIdentifier {
  type?: string;
  identifier: string;
}

type BookDetailsProps = {
  volume: {
    volumeInfo?: {
      title?: string;
      authors?: string[];
      publisher?: string;
      publishedDate?: string;
      pageCount?: number;
      categories?: string[];
      description?: string;
      imageLinks?: ImageLinks;
      industryIdentifiers?: IndustryIdentifier[];
    };
  };
};

export default function BookDetails({ volume }: BookDetailsProps) {
  const info = volume.volumeInfo ?? {};
  const cover = pickCover(info.imageLinks);
  const isbn = (info.industryIdentifiers ?? []).find((x) => x.type?.includes("ISBN"));

  return (
    <article className="grid gap-10 md:grid-cols-2 items-start">
      <div className="flex md:justify-start justify-center">
        <div
          className="relative w-[360px] max-w-full rounded-2xl border border-neutral-800 bg-neutral-900 shadow-inner"
          style={{ aspectRatio: "2 / 3" }}
        >
          {cover ? (
            <img
              src={cover}
              alt={info.title ?? ""}
              className="absolute inset-0 h-full w-full object-contain rounded-2xl"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-neutral-800 text-sm text-neutral-300">
              sin portada
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {info.authors?.length ? (
          <p className="text-neutral-300 text-lg">
            {(info.authors ?? []).join(", ")}
          </p>
        ) : null}

        <div className="text-sm text-neutral-400 leading-relaxed">
          {info.publisher && <span className="block"><span className="text-neutral-300">Editorial:</span> {info.publisher}</span>}
          {info.publishedDate && <span className="block"><span className="text-neutral-300">Fecha:</span> {info.publishedDate}</span>}
          {info.pageCount && <span className="block"><span className="text-neutral-300">Páginas:</span> {info.pageCount}</span>}
          {isbn && <span className="block"><span className="text-neutral-300">ISBN:</span> {isbn.identifier}</span>}
          {info.categories && (
            <span className="block">
              <span className="text-neutral-300">Categorías:</span>{" "}
              <span className="text-neutral-200">{info.categories.join(", ")}</span>
            </span>
          )}
        </div>

        {info.description && (
          <div className="prose prose-invert max-w-none">
            <h3 className="mt-6 font-semibold text-indigo-300">Descripción</h3>
            <div
              className="leading-relaxed text-neutral-200"
              dangerouslySetInnerHTML={{ __html: info.description }}
            />
          </div>
        )}
      </div>
    </article>
  );
}