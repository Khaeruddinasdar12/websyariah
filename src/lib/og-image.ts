/** Shared OG image compression for WhatsApp / Open Graph. */

export const OG_MAX_BYTES = 200_000;
export const OG_SIZE_STEPS: Array<[number, number]> = [
  [1200, 630],
  [1000, 525],
  [800, 420],
  [640, 336],
];

export async function optimizeOgJpeg(input: Buffer): Promise<Buffer | null> {
  try {
    const sharp = (await import('sharp')).default;
    let best: Buffer | null = null;

    for (const [width, height] of OG_SIZE_STEPS) {
      for (let quality = 68; quality >= 28; quality -= 8) {
        const output = await sharp(input)
          .rotate()
          .resize(width, height, {
            fit: 'cover',
            position: 'centre',
            withoutEnlargement: false,
          })
          .jpeg({
            quality,
            mozjpeg: true,
            // Baseline JPEG — progressive often fails on WhatsApp previews.
            progressive: false,
            chromaSubsampling: '4:2:0',
          })
          .toBuffer();

        if (!best || output.length < best.length) {
          best = output;
        }

        if (output.length <= OG_MAX_BYTES) {
          return output;
        }
      }
    }

    const tiny = await sharp(input)
      .rotate()
      .resize(480, 252, { fit: 'cover', position: 'centre' })
      .jpeg({ quality: 24, mozjpeg: true, progressive: false })
      .toBuffer();

    return tiny.length <= (best?.length ?? Infinity) ? tiny : best;
  } catch (err) {
    console.error('OG image sharp error:', err);
    return null;
  }
}

export function jpegResponse(body: Buffer | Uint8Array, maxAge = 86400) {
  const bytes = new Uint8Array(body);
  return new Response(bytes, {
    headers: {
      'Content-Type': 'image/jpeg',
      'Content-Length': String(bytes.byteLength),
      'Content-Disposition': 'inline; filename="og.jpg"',
      'Cache-Control': `public, max-age=${maxAge}, s-maxage=${maxAge}, stale-while-revalidate=604800`,
    },
  });
}
