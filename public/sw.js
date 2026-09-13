const CACHE_NAME = "vantastica-shell-v2";
const APP_SHELL = ["/", "/motorista", "/responsavel"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      ),
  );
  self.clients.claim();
});

// Network-first para navegações (sempre tenta buscar a versão mais nova;
// cai pro cache quando a van está sem sinal), cache-first pro resto —
// menos as requisições internas do Next.js (troca de página pelo <Link>,
// prefetch, Server Actions), que carregam dados dinâmicos do usuário e
// nunca podem vir do cache: se caírem no cache-first, o motorista navega
// pela barra inferior e continua vendo a Rota de Hoje de antes de
// cadastrar um turno, mesmo já tendo salvo o horário novo no banco.
self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match(request).then((r) => r || caches.match("/"))),
    );
    return;
  }

  const isNextInternal =
    request.headers.get("RSC") === "1" ||
    request.headers.has("Next-Action") ||
    request.url.includes("_rsc=");

  if (isNextInternal || request.method !== "GET") {
    event.respondWith(fetch(request));
    return;
  }

  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        }),
    ),
  );
});
