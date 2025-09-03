// 학원 실시간 수업 현황 대시보드
// Google Apps Script 웹앱 서버 코드

// HTML 파일을 제공하는 메인 함수
function doGet() {
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
}

// HTML 파일에 CSS, JS 파일을 포함시키는 함수
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// 구글 시트에서 학생 데이터를 가져오는 함수
function getStudentData() {
  try {
    const SHEET_ID = '1s_65uNKNHC5QELDzabu3ZQhKMr05Hk35g6iwhJ8SaH8';
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('시트1');
    
    // 데이터 범위 가져오기 (헤더 포함)
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    
    // 첫 번째 행(헤더)를 제외한 데이터 반환
    const studentData = values.slice(1).map(row => {
      return {
        name: row[1],        // B열: 학생명
        totalHours: row[2],  // C열: 총시간
        monday: row[3],      // D열: 월요일
        tuesday: row[4],     // E열: 화요일
        wednesday: row[5],   // F열: 수요일
        thursday: row[6],    // G열: 목요일
        friday: row[7],      // H열: 금요일
        saturday: row[8]     // I열: 토요일
      };
    }).filter(student => student.name && student.name.trim() !== '');
    
    return {
      success: true,
      data: studentData,
      timestamp: new Date().getTime()
    };
    
  } catch (error) {
    console.error('데이터 로드 오류:', error);
    return {
      success: false,
      error: error.toString(),
      timestamp: new Date().getTime()
    };
  }
}

// 현재 한국 시간 반환
function getCurrentKST() {
  const now = new Date();
  const kstTime = new Date(now.getTime() + (9 * 60 * 60 * 1000));
  return {
    hours: kstTime.getHours(),
    minutes: kstTime.getMinutes(),
    day: kstTime.getDay(), // 0=일요일, 1=월요일, ..., 6=토요일
    formatted: Utilities.formatDate(kstTime, 'Asia/Seoul', 'HH:mm')
  };
}

// 웹앱 테스트를 위한 함수
function testWebApp() {
  const data = getStudentData();
  const time = getCurrentKST();
  
  console.log('학생 데이터:', data);
  console.log('현재 시간:', time);
  
  return {
    studentData: data,
    currentTime: time
  };
}