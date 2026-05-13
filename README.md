# ACR / ACA Smoke App

Lightweight two-container application for testing Azure Container Registry and Azure Container Apps.

- `frontend`: Next.js, React, TypeScript, Tailwind CSS, shadcn-style components, TanStack Query.
- `backend`: Node.js 22, Express, TypeScript.

## Run Locally

Install dependencies from the workspace root:

```powershell
npm install
```

Run the backend in one terminal:

```powershell
npm run dev:backend
```

Run the frontend in another terminal:

```powershell
$env:BACKEND_URL="http://localhost:8080"
npm run dev:frontend
```

Open `http://localhost:3000`.

## Build Docker Images

```powershell
docker build -t acr-aca-backend:local ./backend
docker build -t acr-aca-frontend:local ./frontend
```

Run locally with Docker:

```powershell
docker network create acr-aca-net
docker run --rm -d --name acr-aca-backend --network acr-aca-net -p 8080:8080 acr-aca-backend:local
docker run --rm -d --name acr-aca-frontend --network acr-aca-net -p 3000:3000 -e BACKEND_URL=http://acr-aca-backend:8080 acr-aca-frontend:local
```

## Azure Notes

Push each image to ACR with separate tags, then create two Azure Container Apps. Give the backend external or internal ingress on port `8080`. Give the frontend external ingress on port `3000` and set `BACKEND_URL` to the backend app URL, for example:

```text
BACKEND_URL=https://<backend-app>.<region>.azurecontainerapps.io
```

Useful endpoints:

- Frontend UI: `/`
- Frontend health: `/api/health`
- Backend health: `/health`
- Backend metadata: `/api/info`
- Backend echo: `/api/echo`

