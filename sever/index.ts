import express from "express";
import cors from "cors";
import { registerRoutes } from "./routes";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
registerRoutes(app).then((server) => {
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 FastFeast server running on port ${PORT}`);
  });
});
