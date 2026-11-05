import { supabase } from './supabase';

export interface StorageUploadResult {
  url?: string;
  error?: string;
}

/**
 * Upload a file directly to a Supabase Storage bucket.
 * Throws or returns explicit error on failure (no silent base64 fallback).
 */
export async function uploadMedia(bucketName: string, path: string, file: File): Promise<string> {
  const result = await uploadMediaResult(bucketName, path, file);
  if (result.error || !result.url) {
    throw new Error(result.error || 'Falha ao fazer upload da mídia no Supabase Storage.');
  }
  return result.url;
}

export async function uploadMediaResult(bucketName: string, path: string, file: File): Promise<StorageUploadResult> {
  try {
    const fileExt = file.name.split('.').pop() || 'png';
    const cleanPath = `${path.replace(/^\/+/, '')}_${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(cleanPath, file, { upsert: true, cacheControl: '3600' });

    if (error) {
      console.error(`[Storage Error] Upload para bucket '${bucketName}' falhou:`, error.message);
      return { error: `Erro no Supabase Storage (${bucketName}): ${error.message}` };
    }

    if (data) {
      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(cleanPath);

      if (publicUrlData?.publicUrl) {
        return { url: publicUrlData.publicUrl };
      }
    }

    return { error: 'Não foi possível obter a URL pública do arquivo enviado.' };
  } catch (err: any) {
    console.error(`[Storage Exception] Exceção durante upload para '${bucketName}':`, err);
    return { error: err?.message || 'Erro inesperado ao conectar ao Supabase Storage.' };
  }
}
