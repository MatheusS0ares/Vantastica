"use client";

/**
 * Redimensiona e recomprime a foto no navegador antes do upload — uma
 * foto de celular vem com vários MB, mas aqui ela só é usada como
 * avatar/thumbnail, então não faz sentido carregar isso tudo numa rede
 * 4G fraca nem pagar armazenamento por resolução que nunca é exibida.
 * Se algo falhar (formato não suportado, API ausente), devolve o
 * arquivo original sem quebrar o fluxo.
 */
export async function compressImageFile(
  file: File,
  { maxDimension = 1280, quality = 0.82 } = {},
): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(
      1,
      maxDimension / Math.max(bitmap.width, bitmap.height),
    );
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    ctx.drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality),
    );
    if (!blob) return file;

    const newName = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], newName, { type: "image/jpeg" });
  } catch {
    return file;
  }
}

/**
 * Comprime o primeiro arquivo de um <input type="file"> e o substitui
 * no próprio input (via DataTransfer), pra quem for ler o FormData
 * depois pegar a versão já reduzida.
 */
export async function compressFileInput(input: HTMLInputElement) {
  const file = input.files?.[0];
  if (!file) return;

  const compressed = await compressImageFile(file);
  const dataTransfer = new DataTransfer();
  dataTransfer.items.add(compressed);
  input.files = dataTransfer.files;
}
