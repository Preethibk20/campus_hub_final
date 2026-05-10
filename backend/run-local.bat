@echo off
echo Starting Campus Hub (Local Profile)...
call mvnw.cmd clean spring-boot:run -Dspring-boot.run.profiles=local
pause
