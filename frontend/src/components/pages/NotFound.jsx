// src/components/NotFound.tsx
import React from "react";

export default function NotFound({
  title = "Page not found",
  message = "Sorry, we couldn’t find the page you’re looking for.",
  homeHref = "/",
  homeLabel = "Go home",
}) {
  return (
    <main
      role="main"
      className="min-h-screen bg-white text-gray-800 grid place-items-center px-6 py-14"
      aria-labelledby="notfound-title"
      data-testid="not-found"
    >
      <div className="w-full max-w-xl text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1 text-xs font-medium">
          <span className="size-2 rounded-full bg-rose-500 animate-pulse" />
          404 error
        </div>

        {/* Big 404 */}
        <h1
          id="notfound-title"
          className="mt-6 text-7xl font-black tracking-tight sm:text-8xl bg-gradient-to-br from-gray-900 to-gray-400 bg-clip-text text-transparent"
        >
          404
        </h1>

        {/* Title + message */}
        <h2 className="mt-4 text-2xl font-semibold">{title}</h2>
        <p className="mt-2 text-sm text-gray-600">{message}</p>

        {/* Actions */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <a
            href={homeHref}
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-400"
          >
            {homeLabel}
          </a>
        </div>
      </div>
    </main>
  );
}