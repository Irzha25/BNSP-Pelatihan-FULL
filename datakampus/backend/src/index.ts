import "dotenv/config";
import cors from "cors";
import express from "express";
import { pool } from "./db";
import { errorHandler, notFound } from "./middleware/errorHandler";
import activityRoutes from "./routes/activity.routes";
import mahasiswaRoutes from "./routes/mahasiswa.routes";
import usersRoutes from "./routes/users.routes";

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(cors());
app.use(express.json({ limit: "100kb" }));

// Health check: menguji API sekaligus koneksi PostgreSQL.
app.get("/health", async (_req, res) => {
  await pool.query("SELECT 1");
  res.json({ status: "OK", message: "API dan PostgreSQL terhubung" });
});

app.use("/api/v1/mahasiswa", mahasiswaRoutes);
app.use("/api/v1/users", usersRoutes);
app.use("/api/v1/activity-logs", activityRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`API berjalan di http://localhost:${PORT}`);
});
