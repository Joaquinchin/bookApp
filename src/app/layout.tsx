import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "My Book App - Descubre Libros Increíbles",
  description: "Plataforma para descubrir, explorar y reseñar libros usando la API de Google Books",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className="min-h-screen bg-neutral-950 text-neutral-100 font-inter">
        <main className="mx-auto max-w-8xl px-2 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}