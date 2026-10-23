Act as a Senior Solution Architect, Principal Java Engineer, DevOps Engineer, and Docker Expert.

Analyze the complete source code located at:

D:\Subbiah\FDE

Perform the following activities step-by-step and generate all required files, commands, and configurations.

Phase 1: Application Analysis

1. Scan the entire project structure.
2. Identify:
   - Framework used (Spring Boot/Spring MVC/etc.)
   - Java version required
   - Maven or Gradle build tool
   - Database dependencies
   - External integrations
   - Application ports
   - Environment variables
   - Profiles used
   - Missing configuration

3. Generate a summary report including:
   - Project architecture
   - Layered design
   - API endpoints
   - Database dependencies
   - Third-party dependencies

Phase 2: Build Verification

1. Verify the application can be built successfully.
2. Identify compilation issues.
3. Suggest fixes for:
   - Dependency resolution
   - Version conflicts
   - Missing libraries
   - Bean creation errors
   - Configuration issues

Generate all commands required to build locally.

Phase 3: Database Configuration

If database configuration exists:

1. Detect database type automatically.
2. Generate setup script.
3. Generate schema creation scripts.
4. Generate sample seed data.

If MySQL is required:

Generate:
- CREATE DATABASE script
- CREATE USER script
- GRANT statements
- Sample test data

Assume:

Database Name : pocdb
Username      : pocuser
Password      : Password@123

Phase 4: Dockerization

Generate production-grade Docker artifacts:

1. Dockerfile
2. .dockerignore
3. Environment variable configuration
4. Volume configuration
5. Logging configuration
6. Health checks

Requirements:

- Use Eclipse Temurin JDK 21
- Multi-stage build
- Small image size
- Production-ready configuration
- Run as non-root user

Phase 5: Docker Compose

Generate complete docker-compose.yml containing:

- Spring Boot application
- MySQL 8.x
- Adminer or phpMyAdmin
- Network configuration
- Volume persistence

Use:

MYSQL_DATABASE=pocdb
MYSQL_USER=pocuser
MYSQL_PASSWORD=Password@123
MYSQL_ROOT_PASSWORD=root@123

Map ports:

Application : 8080
MySQL       : 3306
Adminer     : 8081

Phase 6: Configuration Updates

Generate:

application.properties or application.yml

Docker-compatible settings:

spring.datasource.url=jdbc:mysql://mysql:3306/pocdb
spring.datasource.username=pocuser
spring.datasource.password=Password@123

Enable:
- SQL logging
- Health endpoint
- Metrics endpoint

Phase 7: Container Deployment

Generate exact commands for:

1. Maven build
2. Docker image build
3. Docker Compose deployment
4. Container verification
5. Log inspection
6. Restart procedures
7. Cleanup procedures

Include both CMD and PowerShell commands.

Phase 8: Validation

Generate commands to:

- Verify database connectivity
- Verify API health
- Verify application startup
- Verify container health
- Verify network communication

Phase 9: Troubleshooting Guide

Generate fixes for:

- Port already in use
- MySQL connection failures
- Docker networking issues
- Container startup failures
- Spring Boot startup failures
- Volume mount failures

Phase 10: Architecture Review

Review the implementation and identify:

- Security concerns
- Production readiness concerns
- Performance bottlenecks
- Microservice design improvements
- Scalability recommendations

Provide concrete improvements and updated code where applicable.

Output all generated files completely with no placeholders and provide step-by-step execution instructions for deployment on Windows Docker Desktop.