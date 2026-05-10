@REM ----------------------------------------------------------------------------
@REM Licensed to the Apache Software Foundation (ASF) under one
@REM or more contributor license agreements.  See the NOTICE file
@REM distributed with this work for additional information
@REM regarding copyright ownership.  The ASF licenses this file
@REM to you under the Apache License, Version 2.0 (the
@REM "License"); you may not use this file except in compliance
@REM with the License.  You may obtain a copy of the License at
@REM
@REM    http://www.apache.org/licenses/LICENSE-2.0
@REM
@REM Unless required by applicable law or agreed to in writing,
@REM software distributed under the License is distributed on an
@REM "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
@REM KIND, either express or implied.  See the License for the
@REM specific language governing permissions and limitations
@REM under the License.
@REM ----------------------------------------------------------------------------

@REM ----------------------------------------------------------------------------
@REM Apache Maven Wrapper startup batch script, version 3.2.0
@REM ----------------------------------------------------------------------------

@IF "%__MVNW_ARG0_NAME__%"=="" (SET __MVNW_ARG0_NAME__=%~nx0)
@SET __MVNW_CMD__=
@SET __MVNW_ERROR__=
@SET __MVNW_USING_CMD_FILE__=
@SET __MVNW_SAVE_ERRORLEVEL__=
@SET __MVNW_SAVE_CMD__=
@setlocal

@REM ===========================================================================
@REM Validate the Java binary
@REM ===========================================================================
@IF "%JAVA_HOME%"=="" (
  @SET JAVACMD=java.exe
) ELSE (
  @SET JAVACMD=%JAVA_HOME%\bin\java.exe
)

@IF NOT EXIST "%JAVACMD%" (
  @ECHO Cannot find java executable, check JAVA_HOME or PATH
  @EXIT /B 1
)

@REM ===========================================================================
@REM Wrapper JAR + Maven distribution
@REM ===========================================================================
@SET WRAPPER_JAR=.mvn\wrapper\maven-wrapper.jar
@SET WRAPPER_PROPERTIES=.mvn\wrapper\maven-wrapper.properties

@IF NOT EXIST "%WRAPPER_JAR%" (
  @ECHO Maven wrapper jar not found, downloading...
  @FOR /F "tokens=2 delims==" %%G IN ('findstr /i wrapperUrl "%WRAPPER_PROPERTIES%"') DO (
    @CALL :download "%%G" "%WRAPPER_JAR%"
  )
)

@SET DOWNLOAD_URL=
@FOR /F "tokens=2 delims==" %%G IN ('findstr /i distributionUrl "%WRAPPER_PROPERTIES%"') DO (
  @SET DISTRIBUTION_URL=%%G
)

@SET MAVEN_PROJECT_BASEDIR=%CD%
@FOR /F "tokens=1* delims==" %%G IN ('"%JAVACMD%" -classpath "%WRAPPER_JAR%" org.apache.maven.wrapper.MavenWrapperMain --print-maven-home "%DISTRIBUTION_URL%"') DO (
  @IF "%%G"=="MVN_HOME" (SET MAVEN_HOME=%%H)
)

@IF NOT DEFINED MAVEN_HOME (
  @ECHO Could not resolve Maven home from wrapper
  @EXIT /B 1
)

@SET EXECUTABLE=%MAVEN_HOME%\bin\mvn.cmd
@IF NOT EXIST "%EXECUTABLE%" SET EXECUTABLE=%MAVEN_HOME%\bin\mvn

@"%EXECUTABLE%" %*
@GOTO :EOF

:download
@echo Downloading from %~1
@powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; (New-Object System.Net.WebClient).DownloadFile('%~1', '%~2')"
@EXIT /B 0
