import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { logger } from "@utilities/logger.js";
import { v1Router } from "@routes/v1/index.js";

export const app = express();

// Http logging
app.use(morgan("dev"));
// Body and Cookie parser
app.use(express.json());
app.use(express.urlencoded());
app.use(cookieParser());
// V1 routes
app.use("/api",v1Router);
// Health check route
app.get("/healthcheck",(_,res) => {
      logger.info("Api Health Check: health");
      res.json({ state: "health" });
})

