
import { z } from 'npm:zod@3';

export const MAX_SCAN_BYTES = 5 * 1024 * 1024;
export const recognitionSchema = z.object({
  objects: z.array(z.object({
    name: z.string().min(1).max(120), category: z.string().min(1).max(80),
    brand: z.string().max(80).nullable(), confidence: z.number().min(0).max(1),
    details: z.array(z.string().max(160)).max(8),
    visibleText: z.string().max(500), searchTerms: z.array(z.string().min(2).max(60)).min(1).max(5),
  })).max(5),
});
export type Recognition = z.infer<typeof recognitionSchema>;
export class ScanError extends Error { constructor(message: string, public status = 400) { super(message); } }
export function imageMime(bytes: Uint8Array): string | null {
  if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return 'image/jpeg';
  if ([137,80,78,71,13,10,26,10].every((n,i) => bytes[i] === n)) return 'image/png';
  if (new TextDecoder().decode(bytes.slice(0,4)) === 'RIFF' && new TextDecoder().decode(bytes.slice(8,12)) === 'WEBP') return 'image/webp';
  return null;
}
export async function scanImage(req: Request) {
  if (!req.headers.get('content-type')?.toLowerCase().includes('multipart/form-data')) throw new ScanError('Upload the image as a multipart form.');
  if (Number(req.headers.get('content-length') || 0) > MAX_SCAN_BYTES + 65536) throw new ScanError('Choose an image under 5 MB.', 413);
  const form = await req.formData(); const file = form.get('image');
  if (!(file instanceof File) || !file.size || file.size > MAX_SCAN_BYTES) throw new ScanError('Choose a JPG, PNG or WebP image under 5 MB.', 413);
  const bytes = new Uint8Array(await file.arrayBuffer()); const mime = imageMime(bytes);
  if (!mime || mime !== file.type) throw new ScanError('The image format is invalid. Use JPG, PNG or WebP.');
  let binary = ''; for (let i=0;i<bytes.length;i+=8192) binary += String.fromCharCode(...bytes.subarray(i,i+8192));
  const hash = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),n=>n.toString(16).padStart(2,'0')).join('');
  return { form, hash, image: `data:${mime};base64,${btoa(binary)}` };
}
