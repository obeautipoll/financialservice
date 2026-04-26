import { supabase } from "../lib/supabase";

const normalizePayload = (payload) => ({
  year: Number(payload.year),
  single: Number(payload.single),
  married: Number(payload.married),
  widower: Number(payload.widower),
  separated: Number(payload.separated),
  divorced: Number(payload.divorced),
  notReported: Number(payload.notReported)
});

export const getEmigrants = async () => {
  if (!supabase) {
    throw new Error("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }

  const { data, error } = await supabase
    .from("emigrants")
    .select("*")
    .order("year", { ascending: true });

  if (error) {
    throw error;
  }

  return data;
};

export const createEmigrant = async (payload) => {
  if (!supabase) {
    throw new Error("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }

  const { error } = await supabase.from("emigrants").insert([normalizePayload(payload)]);

  if (error) {
    throw error;
  }
};

export const updateEmigrant = async (id, payload) => {
  if (!supabase) {
    throw new Error("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }

  const { error } = await supabase
    .from("emigrants")
    .update(normalizePayload(payload))
    .eq("id", id);

  if (error) {
    throw error;
  }
};

export const deleteEmigrant = async (id) => {
  if (!supabase) {
    throw new Error("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }

  const { error } = await supabase.from("emigrants").delete().eq("id", id);

  if (error) {
    throw error;
  }
};
