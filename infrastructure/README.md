# Infrastructure & Deployment

Chứa Docker configs, deployment scripts, và cấu trúc hỗ trợ

## Thư mục

- `docker/` - Docker files & compose
- `scripts/` - Deployment & utility scripts

## Quick Deploy

```bash
# Deploy everything
bash scripts/deploy_functions.sh
bash scripts/deploy_firestore.sh
bash scripts/deploy_hosting.sh

# Or use docker-compose for local development
docker-compose -f docker/docker-compose.dev.yml up
```
