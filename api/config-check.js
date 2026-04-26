export default function handler(_req, res) {
  res.status(200).json({
    supabaseConfigured:
      Boolean(process.env.SUPABASE_URL) || Boolean(process.env.VITE_SUPABASE_URL)
  });
}
