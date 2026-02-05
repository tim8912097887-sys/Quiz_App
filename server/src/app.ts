import express from "express";
import morgan from "morgan";
import { logger } from "@utilities/logger.js";

export const app = express();

// Http logging
app.use(morgan("dev"));

// Health check route
app.get("/healthcheck",(_,res) => {
      logger.info("Api Health Check: health");
      res.json({ state: "health" });
})

