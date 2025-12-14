# Deployment Guide

Guide for deploying applications built with the Default Starter Template.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Build for Production](#build-for-production)
- [Deployment Options](#deployment-options)
- [Environment Configuration](#environment-configuration)
- [Health Checks](#health-checks)
- [Monitoring](#monitoring)

## Prerequisites

Before deploying:

- [ ] All tests pass
- [ ] Security audit completed
- [ ] Environment variables configured
- [ ] Build succeeds
- [ ] Documentation updated

## Build for Production

### 1. Install Dependencies

```bash
# Use production-only dependencies
pnpm install --prod --frozen-lockfile
```

### 2. Build Application

```bash
# Clean previous build
pnpm run clean

# Build TypeScript to JavaScript
pnpm run build

# Verify build
ls -la dist/
```

### 3. Test Production Build

```bash
# Run built code
node dist/index.js

# Or use start script
pnpm run start
```

## Deployment Options

### Option 1: Node.js Server

**Simple deployment on VPS or cloud VM**

```bash
# SSH to server
ssh user@your-server.com

# Clone repository
git clone https://github.com/your-username/your-repo.git
cd your-repo

# Install dependencies
pnpm install --prod

# Build
pnpm run build

# Start with PM2 (recommended)
pm2 start dist/index.js --name my-app

# Or use systemd service
sudo systemctl start my-app
```

### Option 2: Docker

**Containerized deployment**

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

FROM node:20-alpine
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./

EXPOSE 3000
CMD ["node", "dist/index.js"]
```

```bash
# Build image
docker build -t my-app:latest .

# Run container
docker run -d \
  --name my-app \
  -p 3000:3000 \
  --env-file .env \
  my-app:latest
```

### Option 3: Serverless (AWS Lambda)

**Serverless deployment**

```typescript
// src/lambda.ts
export const handler = async (event: any) => {
  // Your application logic
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Success' }),
  };
};
```

```bash
# Deploy with Serverless Framework
serverless deploy

# Or AWS SAM
sam build
sam deploy --guided
```

### Option 4: Platform as a Service

**Vercel, Netlify, Heroku, Railway**

```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "dist/index.js"
    }
  ]
}
```

## Environment Configuration

### Environment Variables

```bash
# .env.production
NODE_ENV=production
DEBUG=false
LOG_LEVEL=info

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# API Keys
API_KEY=your_production_api_key

# Security
JWT_SECRET=your_super_secret_key_here
SESSION_SECRET=another_secret_here
```

### Secrets Management

**AWS Secrets Manager:**

```bash
aws secretsmanager create-secret \
  --name MyAppSecrets \
  --secret-string file://.env.production
```

**HashiCorp Vault:**

```bash
vault kv put secret/myapp @.env.production
```

## Health Checks

### Basic Health Check

```typescript
// src/health.ts
export function healthCheck() {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  };
}
```

### Kubernetes Readiness/Liveness

```yaml
# k8s/deployment.yaml
apiVersion: v1
kind: Pod
spec:
  containers:
    - name: my-app
      image: my-app:latest
      livenessProbe:
        httpGet:
          path: /health
          port: 3000
        initialDelaySeconds: 30
        periodSeconds: 10
      readinessProbe:
        httpGet:
          path: /ready
          port: 3000
        initialDelaySeconds: 5
        periodSeconds: 5
```

## Monitoring

### Logging

```typescript
// Production logging
logger.info('Application started', {
  version: process.env.APP_VERSION,
  env: process.env.NODE_ENV,
  pid: process.pid,
});
```

### Error Tracking

**Sentry Integration:**

```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### Performance Monitoring

**Application Metrics:**

```typescript
// Track response times, error rates, etc.
metrics.timing('api.request', duration);
metrics.increment('api.requests');
metrics.gauge('api.active_connections', count);
```

## CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Build
        run: pnpm run build

      - name: Deploy to Production
        run: |
          # Your deployment commands
          echo "Deploying..."
```

## Rollback Strategy

### Quick Rollback

```bash
# With PM2
pm2 reload my-app --update-env

# With Docker
docker pull my-app:previous-version
docker stop my-app
docker rm my-app
docker run -d --name my-app my-app:previous-version

# With Kubernetes
kubectl rollout undo deployment/my-app
```

## Performance Optimization

### Production Checklist

- [ ] Enable compression
- [ ] Set up CDN for static assets
- [ ] Configure caching headers
- [ ] Enable HTTP/2
- [ ] Implement rate limiting
- [ ] Set up load balancing
- [ ] Configure auto-scaling

## Security Checklist

- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] Secrets stored securely
- [ ] Rate limiting in place
- [ ] CORS configured properly
- [ ] SQL injection protected
- [ ] XSS protection enabled
- [ ] CSRF protection enabled

## Troubleshooting

### Common Issues

**Build Fails:**

```bash
# Clear cache and rebuild
pnpm run clean
rm -rf node_modules
pnpm install
pnpm run build
```

**Application Won't Start:**

```bash
# Check logs
pm2 logs my-app

# Check environment
printenv | grep NODE_ENV

# Verify port availability
lsof -i :3000
```

## Resources

- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [AWS Lambda Guide](https://docs.aws.amazon.com/lambda/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)

---

**Last Updated**: December 2024
