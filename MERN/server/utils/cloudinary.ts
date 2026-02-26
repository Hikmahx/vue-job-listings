import crypto from 'crypto';

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

/**
 * Extract public_id from a Cloudinary image URL.
 * URL format: https://res.cloudinary.com/{cloud}/image/upload/v123/{public_id}.ext
 * or: https://res.cloudinary.com/{cloud}/image/upload/{public_id}.ext
 */
export function getPublicIdFromUrl(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  try {
    const match = url.match(
      /^https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/(?:v\d+\/)?(.+)$/
    );
    if (!match) return null;
    // Remove file extension (e.g. .jpg, .png, .webp)
    const withExt = match[1];
    const lastDot = withExt.lastIndexOf('.');
    const publicId = lastDot > 0 ? withExt.slice(0, lastDot) : withExt;
    return publicId || null;
  } catch {
    return null;
  }
}

export function isCloudinaryUrl(url: string): boolean {
  return (
    typeof url === 'string' &&
    url.startsWith('https://res.cloudinary.com/')
  );
}

/**
 * Delete an image from Cloudinary by URL (e.g. company logo).
 * Requires CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in env.
 * No-op if URL is not Cloudinary or env is not set.
 *
 * Note: Images uploaded but never saved (user abandoned form) are not auto-deleted.
 * To clean those up you could add a scheduled job that lists Cloudinary assets and
 * deletes ones whose URL is not in any company.logo.
 */
export async function deleteImageByUrl(url: string): Promise<void> {
  if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
    return;
  }
  if (!isCloudinaryUrl(url)) {
    return;
  }
  const publicId = getPublicIdFromUrl(url);
  if (!publicId) return;

  const timestamp = Math.floor(Date.now() / 1000);
  const params: Record<string, string> = {
    public_id: publicId,
    timestamp: String(timestamp),
  };
  const sortedKeys = Object.keys(params).sort();
  const toSign = sortedKeys.map((k) => `${k}=${params[k]}`).join('&');
  const signature = crypto.createHash('sha1').update(toSign + API_SECRET).digest('hex');

  const formData = new URLSearchParams();
  formData.append('public_id', publicId);
  formData.append('timestamp', String(timestamp));
  formData.append('signature', signature);
  formData.append('api_key', API_KEY);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/destroy`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    console.error('Cloudinary delete failed:', response.status, err);
  }
}
