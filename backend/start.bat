@echo off
set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-21.0.4.7-hotspot"
set "PATH=%JAVA_HOME%\bin;%PATH%"
set "MAVEN_HOME=C:\Users\Preethi\.m2\wrapper\dists\apache-maven-3.9.6-bin\3311e1d4\apache-maven-3.9.6"
echo Using JAVA_HOME=%JAVA_HOME%
echo Using MAVEN_HOME=%MAVEN_HOME%
"%MAVEN_HOME%\bin\mvn.cmd" spring-boot:run -Dspring-boot.run.profiles=local -DskipTests
