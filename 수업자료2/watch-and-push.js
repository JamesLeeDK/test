const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

console.log('📁 파일 변경 감지 시작...');
console.log('🔍 Code.js 파일을 모니터링 중입니다.');

// Code.js 파일 경로
const filePath = path.join(__dirname, 'Code.js');

// 파일 변경 감지
fs.watchFile(filePath, (curr, prev) => {
  console.log('🔄 Code.js 파일이 변경되었습니다!');
  console.log('📤 Google Apps Script로 업로드 중...');
  
  // clasp push 실행
  exec('clasp push', { cwd: __dirname }, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ clasp push 실패:', error);
      return;
    }
    
    if (stderr) {
      console.error('⚠️ 경고:', stderr);
    }
    
    console.log('✅ clasp push 성공!');
    console.log(stdout);
  });
});

console.log('✨ 파일 감시가 시작되었습니다. Ctrl+C로 종료하세요.');