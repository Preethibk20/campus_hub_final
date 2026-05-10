@REM ----------------------------------------------------------------------------
@REM Simplified Maven Wrapper for Windows
@REM ----------------------------------------------------------------------------
@ECHO OFF
SETLOCAL

SET "MAVEN_PROJECT_BASEDIR=%CD%"

@REM Validate Java
IF "%JAVA_HOME%"=="" (
  SET "JAVACMD=java"
) ELSE (
  SET "JAVACMD=%JAVA_HOME%\bin\java.exe"
)

@REM Check if JAR exists
IF NOT EXIST ".mvn\wrapper\maven-wrapper.jar" (
  ECHO Maven wrapper jar not found. Please ensure .mvn\wrapper\maven-wrapper.jar exists.
  EXIT /B 1
)

@REM Run Maven via Wrapper JAR
"%JAVACMD%" -Dmaven.multiModuleProjectDirectory="%MAVEN_PROJECT_BASEDIR%" -classpath ".mvn\wrapper\maven-wrapper.jar" org.apache.maven.wrapper.MavenWrapperMain %*

IF ERRORLEVEL 1 EXIT /B 1
