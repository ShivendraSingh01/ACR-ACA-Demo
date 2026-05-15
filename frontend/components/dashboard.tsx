"use client";

import { useQuery } from "@tanstack/react-query";
import { Activity, Boxes, CheckCircle2, Cloud, RefreshCw, Server, ShieldCheck, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type BackendInfoResponse = {
  connected: boolean;
  backendUrl: string;
  data?: {
    service: string;
    message: string;
    runtime: {
      node: string;
      platform: string;
      architecture: string;
    };
    azure: {
      revision: string;
      region: string;
      hostname: string;
    };
    startedAt: string;
  };
  error?: string;
};

async function fetchBackendInfo(): Promise<BackendInfoResponse> {
  const response = await fetch("/api/backend/info", { cache: "no-store" });
  const body = (await response.json()) as BackendInfoResponse;

  if (!response.ok) {
    return body;
  }

  return body;
}

export function Dashboard() {
  const query = useQuery({
    queryKey: ["backend-info"],
    queryFn: fetchBackendInfo
  });

  const backend = query.data;
  const isConnected = Boolean(backend?.connected);
  const checkedAt = new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }).format(new Date());

  return (
    <main className="min-h-screen">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-8 sm:px-8 lg:py-12">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-md border bg-white px-3 py-1 text-sm font-medium text-muted-foreground">
              <Boxes className="h-4 w-4 text-primary" />
              Two-image ACR and ACA smoke test
            </div>
            <h1 className="text-4xl font-semibold tracking-normal text-foreground sm:text-5xl">
              Frontend and backend are ready to ship separately.
            </h1>
            <p className="text-base leading-7 text-muted-foreground sm:text-lg">
              Use this app to validate image builds, registry pushes, ACA ingress, environment variables,
              and service-to-service connectivity.
            </p>
          </div>
          <Button onClick={() => query.refetch()} disabled={query.isFetching}>
            <RefreshCw className={query.isFetching ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
            Refresh
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <StatusCard
            icon={<Cloud className="h-5 w-5" />}
            label="Frontend"
            value="Next.js on Node 22"
            tone="ready"
          />
          <StatusCard
            icon={<Server className="h-5 w-5" />}
            label="Backend"
            value={isConnected ? "Express API connected" : "Waiting for API"}
            tone={isConnected ? "ready" : "error"}
          />
          <StatusCard
            icon={<ShieldCheck className="h-5 w-5" />}
            label="ACA Signal"
            value={backend?.data?.azure.revision ?? "local revision"}
            tone="neutral"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {isConnected ? (
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                ) : (
                  <XCircle className="h-5 w-5 text-destructive" />
                )}
                Backend Connectivity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-md bg-muted p-4">
                <div className="text-sm font-medium text-muted-foreground">Backend URL</div>
                <code className="mt-1 block break-all text-sm text-foreground">
                  {backend?.backendUrl ?? "http://localhost:8000"}
                </code>
              </div>

              {isConnected ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <Detail label="Service" value={backend?.data?.service} />
                  <Detail label="Node Runtime" value={backend?.data?.runtime.node} />
                  <Detail label="Platform" value={`${backend?.data?.runtime.platform}/${backend?.data?.runtime.architecture}`} />
                  <Detail label="Region" value={backend?.data?.azure.region} />
                  <Detail label="Hostname" value={backend?.data?.azure.hostname} />
                  <Detail label="Started" value={backend?.data?.startedAt} />
                </div>
              ) : (
                <div className="rounded-md border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
                  {backend?.error ?? "The frontend has not received a backend response yet."}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Container Checklist
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  "Build backend image from ./backend",
                  "Build frontend image from ./frontend",
                  "Push both images to Azure Container Registry",
                  "Set frontend BACKEND_URL to the backend ACA URL",
                  "Check /health and /api/info after each revision"
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-md border bg-background p-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="text-sm text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 text-xs text-muted-foreground">Last UI refresh: {checkedAt}</div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}

function StatusCard({
  icon,
  label,
  value,
  tone
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone: "ready" | "error" | "neutral";
}) {
  const toneClass =
    tone === "ready" ? "text-primary" : tone === "error" ? "text-destructive" : "text-accent-foreground";

  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-muted ${toneClass}`}>
          {icon}
        </div>
        <div className="min-w-0">
          <div className="text-sm text-muted-foreground">{label}</div>
          <div className="truncate font-semibold">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function Detail({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-md border bg-background p-3">
      <div className="text-xs font-medium uppercase text-muted-foreground">{label}</div>
      <div className="mt-1 break-words text-sm font-medium">{value ?? "Unavailable"}</div>
    </div>
  );
}
