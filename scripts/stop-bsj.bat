@echo off
REM BSJ AI 주식회사 - 정리 (dev 서버 종료)

REM 3000 포트 사용 중인 프로세스 찾아서 종료
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
  echo Killing PID %%a
  taskkill /F /PID %%a >nul 2>&1
)

echo BSJ AI 주식회사 종료 완료.
timeout /t 2 >nul
