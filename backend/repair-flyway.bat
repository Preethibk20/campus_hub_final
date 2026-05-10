@echo off
echo Running Flyway Repair...
call mvnw.cmd flyway:repair -Dspring-boot.run.profiles=local
pause
