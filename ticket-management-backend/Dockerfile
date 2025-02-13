FROM openjdk:17-jdk-slim
LABEL authors="moham"

WORKDIR /app

COPY target/*.jar app.jar

# Expose the application port
EXPOSE 8080

# Run the application
CMD ["java", "-jar", "app.jar"]