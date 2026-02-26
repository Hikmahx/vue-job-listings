/**
 * Upload an image file to Cloudinary (unsigned upload).
 * Supports multiple presets/folders via preset type (e.g. company logos vs user avatars).
 *
 * .env:
 *   VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
 *   VITE_CLOUDINARY_UPLOAD_PRESET_COMPANY_LOGO=joblist_company_logos
 *   VITE_CLOUDINARY_UPLOAD_PRESET_USER_AVATAR=joblist_user_avatars
 */
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME

const PRESETS: Record<string, string> = {
  company_logos: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET_COMPANY_LOGO ?? '',
  user_avatars: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET_USER_AVATAR ?? '',
}

export type CloudinaryUploadPreset = keyof typeof PRESETS

export async function uploadImage(
  file: File,
  presetKey: CloudinaryUploadPreset = 'company_logos'
): Promise<string> {
  const uploadPreset =
    PRESETS[presetKey] || (presetKey === 'company_logos' ? import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET : '')

  if (!CLOUD_NAME || !uploadPreset) {
    const envKey =
      presetKey === 'company_logos'
        ? 'VITE_CLOUDINARY_UPLOAD_PRESET_COMPANY_LOGO or VITE_CLOUDINARY_UPLOAD_PRESET'
        : 'VITE_CLOUDINARY_UPLOAD_PRESET_USER_AVATAR'
    throw new Error(
      `Cloudinary not configured for "${presetKey}". Add VITE_CLOUDINARY_CLOUD_NAME and ${envKey} to .env`
    )
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', uploadPreset)

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  )

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error?.message || `Upload failed: ${response.statusText}`)
  }

  const data = await response.json()
  return data.secure_url
}
