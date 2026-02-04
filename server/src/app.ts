import express from "express";

export const app = express();


// Health check route
app.get("/healthcheck",(_,res) => {
      res.json({ state: "health" });
})

