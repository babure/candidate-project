# Build context is the repository root (see docker-compose.yml).
# Layer order + BuildKit caches keep rebuilds fast when only app code changes.

FROM node:20-alpine AS frontend
WORKDIR /frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --prefer-offline --no-audit --no-fund
COPY frontend/ ./
RUN npm run build

FROM maven:3.9.8-eclipse-temurin-17 AS build
WORKDIR /app
COPY backend/pom.xml .
# Warm the local Maven repo before copying sources so dependency layers stay cached.
RUN --mount=type=cache,target=/root/.m2 \
    mvn -q -DskipTests dependency:go-offline
COPY backend/src ./src
COPY --from=frontend /frontend/dist/ ./src/main/resources/static/
RUN --mount=type=cache,target=/root/.m2 \
    mvn -q -DskipTests package

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/backend-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 18081
ENTRYPOINT ["java", "-jar", "app.jar"]
