export default function SearchForm() {
  return (
    <form
      action="/search"
      aria-label="Búsqueda de libros"
      className="flex gap-4"
    >
      <label htmlFor="q" className="sr-only">
        Término de búsqueda
      </label>
      <input
        id="q"
        name="q"
        placeholder="Buscar por título, autor o ISBN..."
        className="flex-1 rounded-xl border bg-neutral-900 px-4 py-4 text-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition border-neutral-700"
        required
      />
      <button className="rounded-xl bg-indigo-600 px-8 py-4 text-xl font-bold text-white shadow hover:bg-indigo-500 transition">
        Buscar
      </button>
    </form>
  );
}