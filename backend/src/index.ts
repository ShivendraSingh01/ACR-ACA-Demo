import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

const app = express();
const port = Number(process.env.PORT ?? 8080);
const serviceName = process.env.SERVICE_NAME ?? "acr-aca-backend";
const revision = process.env.CONTAINER_APP_REVISION ?? process.env.REVISION ?? "local";
const region = process.env.AZURE_REGION ?? process.env.REGION ?? "local";
const startedAt = new Date();

app.disable("x-powered-by");
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN ?? true }));
app.use(express.json({ limit: "64kb" }));
app.use(morgan("tiny"));

app.get("/health", (_request, response) => {
  response.json({
    status: "ok",
    service: serviceName,
    revision,
    uptimeSeconds: Math.round(process.uptime()),
    checkedAt: new Date().toISOString()
  });
});

app.get("/api/info", (_request, response) => {
  response.json({
    service: serviceName,
    message: "Hello from the backend running in Azure Container Apps.",
    runtime: {
      node: process.version,
      platform: process.platform,
      architecture: process.arch
    },
    azure: {
      revision,
      region,
      hostname: process.env.HOSTNAME ?? "localhost"
    },
    startedAt: startedAt.toISOString()
  });
});

app.post("/api/echo", (request, response) => {
  response.json({
    service: serviceName,
    receivedAt: new Date().toISOString(),
    payload: request.body
  });
});

app.use((_request, response) => {
  response.status(404).json({
    error: "Not found",
    availableRoutes: ["/health", "/api/info", "/api/echo"]
  });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`${serviceName} listening on port ${port}`);
});

