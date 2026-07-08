type DosenImageSource = {
  gambar?: string | null;
  foto?: string | null;
};

export function resolveDosenImageUrl(item: DosenImageSource): string | undefined {
  for (const value of [item.gambar, item.foto]) {
    if (typeof value !== 'string') continue;

    const trimmed = value.trim();
    if (!trimmed || trimmed === '-') continue;

    return trimmed;
  }

  return undefined;
}
