import { createClient } from "@supabase/supabase-js";

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabaseStorageBucket = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || "site-assets";

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export const getSupabaseConfigStatus = () => ({
  anonKeyConfigured: Boolean(supabaseAnonKey),
  lookupTables: import.meta.env.VITE_LOGIN_LOOKUP_TABLES || "",
  storageBucket: supabaseStorageBucket,
  urlConfigured: Boolean(supabaseUrl)
});

export const ensureSupabase = () => {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
    );
  }

  return supabase;
};

export const uploadStorageAsset = async (file, folder = "uploads") => {
  const client = ensureSupabase();

  if (!file) {
    throw new Error("No file selected.");
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const extension = safeName.includes(".") ? safeName.split(".").pop() : "bin";
  const basename = safeName.replace(/\.[^.]+$/, "");
  const filePath = `${folder}/${Date.now()}-${basename}.${extension}`;

  const { error: uploadError } = await client.storage
    .from(supabaseStorageBucket)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false
    });

  if (uploadError) {
    throw uploadError;
  }

  const {
    data: { publicUrl }
  } = client.storage.from(supabaseStorageBucket).getPublicUrl(filePath);

  return {
    filePath,
    publicUrl
  };
};
