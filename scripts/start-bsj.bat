@echo off
REM BSJ AI 주식회사 - 로컬 백그라운드 실행
REM 더블클릭하면 숨겨진 창에서 dev 서버 시작
REM 브라우저: http://localhost:3000

cd /d "%~dp0\.."

REM 의존성 자동 설치 (node_modules 없으면)
if not exist node_modules (
  echo Installing dependencies...
  npm install --no-audit --no-fund
)

REM hidden window로 dev 서버 띄우기
start "BSJ AI Corp" /MIN cmd /c "npm run dev > logs\dev.log 2>&1"

REM 로그 폴더 생성
if not exist logs mkdir logs

echo BSJ AI 주식회사 시작 완료.
echo http://localhost:3000
echo (로그: logs\dev.log)
timeout /t 3 >nul
