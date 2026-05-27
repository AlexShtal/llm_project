# LLM Project

A modern monorepo with multi-provider LLM support, Redis caching, and MinIO file storage.

## Features

- **Multi-Provider Support**: OpenAI-compatible, Yandex GPT, Ollama, Local LLM
- **Redis Caching**: Fast model and configuration caching
- **MinIO File Storage**: Scalable avatar and file uploads
- **Professional UI**: Component-based React with modern styling
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT-based with bcrypt password hashing

## Project Structure

```
llm_project/
├── backend/              # NestJS API
│   ├── src/
│   │   ├── providers/   # LLM provider implementations
│   │   ├── cache/       # Redis caching service
│   │   ├── storage/     # MinIO file storage service
│   │   ├── neural_network/  # Chat generation logic
│   │   ├── auth/        # Authentication
│   │   └── user/        # User management
│   ├── prisma/          # Database schema and migrations
│   └── .env             # Environment variables
├── frontend/            # React + TypeScript application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── context/     # State management contexts
│   │   └── styles/      # CSS styling
│   └── .env.local       # Frontend environment variables
└── docker-compose.yml   # PostgreSQL, Redis, MinIO setup
```

## Quick Start

### 1. Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose (optional, for local services)

### 2. Setup with Docker Compose (Recommended)

```bash
# Start all services (PostgreSQL, Redis, MinIO)
docker-compose up -d

# The services will be available at:
# - PostgreSQL: localhost:5432
# - Redis: localhost:6379
# - MinIO: localhost:9000 (API) and localhost:9001 (Console)
```

### 3. Backend Setup

```bash
# Install dependencies
cd backend
npm install

# Set up environment variables
cp .env.example .env  # Edit with your API keys

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Start development server
npm run start:dev
# Backend will be available at http://localhost:3000
```

### 4. Frontend Setup

```bash
# Install dependencies
cd frontend
npm install

# Create environment file
echo "VITE_API_URL=http://localhost:3000" > .env.local

# Start development server
npm run dev
# Frontend will be available at http://localhost:5173
```

## Environment Variables

### Backend (.env)

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/llm_project"

# JWT
JWT_SECRET="your-secret-key-change-in-production"
JWT_EXPIRES_IN="24h"

# LLM Providers
OPENAI_API_KEY="your-openai-key"
LLM_API_KEY=""

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# MinIO
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=llm-project
```

### Frontend (.env.local)

```env
VITE_API_URL=http://localhost:3000
```

## LLM Provider Configuration

### OpenAI-Compatible

```
Endpoint: https://api.openai.com/v1
Model: gpt-4-turbo or any other model
API Key: Your OpenAI API key
```

### Yandex GPT

```
Endpoint: https://ai.api.cloud.yandex.net/v1
Model: gpt://<folder-id>/aliceai-llm
API Key: Your Yandex API key
Folder ID: Your Yandex Cloud folder ID
```

### Ollama

```
Endpoint: http://localhost:11434 (or remote)
Model: llama2, mistral, neural-chat, etc.
No API key needed
```

### Local LLM

```
Endpoint: http://localhost:8000 (or your local server)
Model: Your model name
```

## API Endpoints

### Authentication

```
POST /auth/register
POST /auth/login
GET  /user (requires JWT)
POST /user/logout
```

### Chat Management

```
GET    /ai/chats              # List all chats
POST   /ai/chats              # Create new chat
GET    /ai/chats/:id          # Get specific chat
PATCH  /ai/chats/:id          # Update chat title
DELETE /ai/chats/:id          # Delete chat
POST   /ai/generate            # Generate response
```

### Model Management

```
GET    /user/my-models         # List user's models
POST   /user/add-model         # Add new model with provider
DELETE /user/delete-model/:id  # Delete model
POST   /user/set-current-model # Set current active model
```

## Development Commands

```bash
# Backend
npm run backend:dev     # Start backend development server
npm run backend:build   # Build backend
npm run backend:test    # Run tests

# Frontend
npm run frontend:dev    # Start frontend development server
npm run frontend:build  # Build frontend

# All
npm run install:all    # Install all dependencies
npm run build          # Build both projects
```

## MinIO Console

After starting docker-compose, access MinIO Console at:

- URL: http://localhost:9001
- Username: minioadmin
- Password: minioadmin

Create a bucket named `llm-project` for storing avatars and files.

## Redis CLI

Connect to Redis:

```bash
docker exec -it llm-project-redis redis-cli

# Check cache:
# > KEYS *
# > GET cache-key
```

## Database Migrations

```bash
# Create new migration
cd backend
npx prisma migrate dev --name migration_name

# View database
npx prisma studio
```

## Troubleshooting

### Port Already in Use

If ports are already in use, modify in `docker-compose.yml`:

```yaml
ports:
  - "5433:5432" # PostgreSQL on different port
  - "6380:6379" # Redis on different port
```

### Connection Refused

Ensure docker-compose services are running:

```bash
docker-compose ps
docker-compose logs postgres redis minio
```

### CORS Issues

If frontend can't reach backend, check backend CORS configuration and that both are on the correct ports.

## Performance Tips

1. **Caching**: Model configurations are cached in Redis for 5 minutes
2. **Database Indexing**: Chat history is indexed by userId and createdAt
3. **File Storage**: Use MinIO for scalable file storage instead of local filesystem
4. **Streaming**: For large responses, consider implementing response streaming in future versions

## Security Considerations

1. Change `JWT_SECRET` in production
2. Use HTTPS for production deployments
3. Set secure MINIO credentials
4. Store API keys in secure vaults (not in git)
5. Enable CORS only for trusted domains

## Production Deployment

1. Use environment-specific `.env` files
2. Set `NODE_ENV=production`
3. Enable SSL/HTTPS
4. Use managed database (RDS, etc.)
5. Use managed Redis (ElastiCache, etc.)
6. Deploy MinIO to S3 or similar object storage
7. Use CDN for frontend assets

## License

UNLICENSED

## Support

For issues or questions, please check the documentation in `Api_docs/` folder or create an issue.
