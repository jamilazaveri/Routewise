# ==============================================================================
# Routewise Java Spring Boot Service - Multi-Stage Low-Memory Dockerfile
# ==============================================================================

# Stage 1: Build executable JAR using Maven & JDK 17
FROM maven:3.9.6-eclipse-temurin-17-alpine AS builder

WORKDIR /build

# Pre-fetch dependencies to maximize Docker layer cache hits
COPY pom.xml .
RUN mvn dependency:go-offline -B || true

# Copy source code and package JAR (skipping unit tests during image build)
COPY src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Minimal, secure Alpine JRE 17 runtime (Free Tier 512MB RAM optimized)
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Run as an unprivileged application user
RUN addgroup -S routewise && adduser -S routewise -G routewise
USER routewise

# Copy executable jar from builder stage
COPY --from=builder --chown=routewise:routewise /build/target/routewise-backend-*.jar app.jar

# Low-memory JVM tuning for Render 512MB Free Tier instances
ENV PORT=8080 \
    JAVA_OPTS="-Xmx300m -Xms128m -XX:+UseSerialGC -XX:MaxMetaspaceSize=128m -XX:+ExitOnOutOfMemoryError"

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=45s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT}/health || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
