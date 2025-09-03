@echo off
echo 🔄 코드 변경 감지됨. Google Apps Script로 업로드 중...
clasp push
if %errorlevel% == 0 (
    echo ✅ clasp push 성공!
) else (
    echo ❌ clasp push 실패!
)
pause