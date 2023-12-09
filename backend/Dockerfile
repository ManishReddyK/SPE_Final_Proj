FROM openjdk:17
EXPOSE 9090
ADD target/delivery-0.0.1-SNAPSHOT.jar springboot.jar
ENTRYPOINT [ "java", "-jar", "/springboot.jar" ]