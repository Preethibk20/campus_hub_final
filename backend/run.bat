@echo off
setlocal

:: Try to find Java 21 if JAVA_HOME is not set
if "%JAVA_HOME%"=="" (
    echo [INFO] JAVA_HOME is not set. Looking for java in PATH...
    java -version 2>&1 | findstr /i "21." > nul
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] Java 21 was not found in your PATH or JAVA_HOME.
        echo Please install JDK 21 and set your JAVA_HOME environment variable.
        pause
        exit /b 1
    )
) else (
    echo [INFO] Using JAVA_HOME: %JAVA_HOME%
    "%JAVA_HOME%\bin\java.exe" -version
)

echo.
echo Starting Campus Hub Backend...
call mvnw.cmd spring-boot:run
pause