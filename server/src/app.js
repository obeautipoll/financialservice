import cors from "cors";
import express from "express";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173"
  })
);
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "filipino-emigrants-server"
  });
});

app.get("/api/config-check", (_req, res) => {
  res.json({
    supabaseConfigured: Boolean(process.env.SUPABASE_URL)
  });
});

export default app;
