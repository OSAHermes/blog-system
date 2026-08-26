# Vue Blog System - Deployment Guide

## Quick Deploy (Non-Standard Ports)

```bash
cd /opt/data/blog-system
cp .env.example .env
docker-compose up -d
```

## Access URLs

```
Frontend: http://localhost:7777
Admin:    http://localhost:7777/admin
API:      http://localhost:9876
MySQL:    127.0.0.1:3456
```

Default credentials: admin / admin123

## Docker Port Mapping Issue

This host has a known issue where Docker published ports are NOT accessible from localhost despite showing in `docker ps`. Solution: use non-standard host ports.

| Service | Host Port | Container Port |
|---------|-----------|----------------|
| MySQL   | 3456      | 3306           |
| API     | 9876      | 3000           |
| Web     | 7777      | 80             |

## Common Fixes

### MySQL Connection Refused
```sql
GRANT ALL PRIVILEGES ON blog.* TO 'blog'@'%';
FLUSH PRIVILEGES;
```

### Articles Query 500 Error
The `query()` function returns rows directly (not wrapped in array):
```javascript
// Wrong
const [total] = await query('SELECT COUNT(*)...');
const count = total[0].count; // ERROR

// Correct
const result = await query('SELECT COUNT(*) as total...');
const count = result[0]?.total || 0;
```

### Docker Build npm Failure
Use `npm install` instead of `npm ci`:
```dockerfile
RUN npm install --omit=dev
```

## GitHub
https://github.com/OSAHermes/blog-system
