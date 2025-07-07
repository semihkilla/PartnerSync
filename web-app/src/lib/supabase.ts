import { createClient } from "@supabase/supabase-js";

const supabaseUrl      = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
export const supabase  = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Lädt ein neues Profilbild hoch und löscht das alte aus dem Storage (falls vorhanden).
 * @param file     Neues Bild (File)
 * @param uid      User-ID
 * @param oldUrl   Bisherige Avatar-URL (optional)
 * @returns        Die neue öffentliche URL
 */
export async function updateProfileImage(
  file: File,
  uid:  string,
  oldUrl?: string,
): Promise<string | null> {
  if (oldUrl) await deleteProfileImage(oldUrl); // Altes Bild entfernen

  const ext      = file.name.split(".").pop();
  const filePath = `avatars/${uid}-${Date.now()}.${ext}`;

  const { error } = await supabase
    .storage.from("profile-photos")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
      contentType: file.type || undefined,
    });

  if (error) {
    console.error("Upload error:", error);
    alert("Upload fehlgeschlagen");
    return null;
  }
  return supabase.storage.from("profile-photos").getPublicUrl(filePath).data.publicUrl;
}

/** Löscht ein Bild anhand der public URL (macht nichts, falls leer oder Standardavatar) */
export async function deleteProfileImage(publicUrl?: string) {
  if (!publicUrl) return;
  try {
    const marker = "/profile-photos/";
    const { pathname } = new URL(publicUrl);
    const pos = pathname.indexOf(marker);
    if (pos === -1) return;

    let filePath = pathname.slice(pos + marker.length);
    if (filePath.startsWith("/")) filePath = filePath.slice(1);

    const { error } = await supabase
      .storage.from("profile-photos")
      .remove([filePath]);

    if (error) throw error;
  } catch (e) {
    console.warn("deleteProfileImage failed:", publicUrl, e);
  }
}
