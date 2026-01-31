# Docker Dev Environment — Examples and Templates

Common templates aligned with official Docker best practices. See [reference.md](reference.md) for links to Docker and Compose docs.

## Minimal Dockerfile (Single Service)

```Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]
```

## Minimal Compose (App + DB)

```yaml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - .:/app
    env_file:
      - .env
    depends_on:
      - db
  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: example
    volumes:
      - db_data:/var/lib/postgresql/data

volumes:
  db_data:
```

## Local Override (Gitignored)

```yaml
services:
  app:
    environment:
      LOG_LEVEL: debug
    ports:
      - "3001:3000"
```

## GitHub Actions Smoke Test (Cost-Optimized)

```yaml
name: docker-smoke
on:
  pull_request:
    paths:
      - "Dockerfile"
      - "compose.yaml"
      - "docker-compose.yml"
      - ".github/workflows/docker-smoke.yml"
jobs:
  smoke:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - uses: actions/cache@v4
        with:
          path: /tmp/.buildx-cache
          key: ${{ runner.os }}-buildx-${{ github.sha }}
          restore-keys: ${{ runner.os }}-buildx-
      - run: docker buildx build --cache-from=type=local,src=/tmp/.buildx-cache --cache-to=type=local,dest=/tmp/.buildx-cache -t app-dev .
      - run: docker run --rm app-dev sh -c "echo ok"
```

## GitHub Actions .NET Tests (Containerized)

```yaml
name: dotnet-container-tests
on:
  pull_request:
    paths:
      - "**/*.cs"
      - "**/*.csproj"
      - "Dockerfile"
      - "compose.yaml"
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - uses: actions/cache@v4
        with:
          path: /tmp/.buildx-cache
          key: ${{ runner.os }}-buildx-${{ github.sha }}
          restore-keys: ${{ runner.os }}-buildx-
      - run: docker buildx build --cache-from=type=local,src=/tmp/.buildx-cache --cache-to=type=local,dest=/tmp/.buildx-cache -t app-test .
      - run: docker run --rm app-test dotnet test --configuration Release
```

## GitHub Actions Cloudflare Workers Tests (Containerized)

```yaml
name: workers-container-tests
on:
  pull_request:
    paths:
      - "worker/**"
      - "package.json"
      - "Dockerfile"
      - "compose.yaml"
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - uses: actions/cache@v4
        with:
          path: /tmp/.buildx-cache
          key: ${{ runner.os }}-buildx-${{ github.sha }}
          restore-keys: ${{ runner.os }}-buildx-
      - run: docker buildx build --cache-from=type=local,src=/tmp/.buildx-cache --cache-to=type=local,dest=/tmp/.buildx-cache -t worker-test .
      - run: docker run --rm worker-test npm test
```
