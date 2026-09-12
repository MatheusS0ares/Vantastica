import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Padrão é 1MB — baixo demais pra foto de celular. Como o
      // client comprime a imagem antes de enviar, isso aqui é só uma
      // margem de segurança pra quando a compressão não rolar.
      bodySizeLimit: "4mb",
    },
  },
};

export default nextConfig;
