// 전역 변수
const SHEET_ID = '1s_65uNKNHC5QELDzabu3ZQhKMr05Hk35g6iwhJ8SaH8';
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=시트1`;

let studentsData = [];
let updateInterval;

// 요일 매핑 (월요일=0, 일요일=6)
const WEEKDAY_COLUMNS = {
    1: 'D', // 월요일
    2: 'E', // 화요일  
    3: 'F', // 수요일
    4: 'G', // 목요일
    5: 'H', // 금요일
    6: 'I'  // 토요일
};

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// 앱 초기화
function initializeApp() {
    updateCurrentTime();
    loadStudentData();
    
    // 1분마다 시간 업데이트
    setInterval(updateCurrentTime, 60000);
    
    // 30초마다 학생 상태 업데이트
    updateInterval = setInterval(updateStudentStatus, 30000);
}

// 현재 시간 업데이트 (한국 표준시)
function updateCurrentTime() {
    const now = new Date();
    // 한국 시간으로 정확히 변환
    const kstTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Seoul"}));
    const hours = kstTime.getHours().toString().padStart(2, '0');
    const minutes = kstTime.getMinutes().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}`;
    
    document.getElementById('current-time').textContent = timeString;
}

// 구글 시트에서 학생 데이터 로드
async function loadStudentData() {
    try {
        // 로컬 환경에서는 샘플 데이터 사용
        if (window.location.protocol === 'file:') {
            console.log('로컬 환경 감지 - 샘플 데이터 사용');
            loadSampleData();
            return;
        }
        
        const response = await fetch(SHEET_URL);
        const text = await response.text();
        
        // Google Sheets API 응답 파싱
        const jsonString = text.substring(47).slice(0, -2);
        const data = JSON.parse(jsonString);
        
        parseStudentData(data);
        updateStudentStatus();
        
    } catch (error) {
        console.error('데이터 로드 실패:', error);
        console.log('샘플 데이터로 전환합니다.');
        loadSampleData();
    }
}

// 로컬 테스트용 샘플 데이터 로드
function loadSampleData() {
    const sampleData = {
        table: {
            rows: [
                // 헤더 행 (건너뜀)
                { c: [null, { v: '학생명' }, { v: '총시간' }, { v: '월' }, { v: '화' }, { v: '수' }, { v: '목' }, { v: '금' }, { v: '토' }] },
                // 샘플 학생 데이터
                { c: [null, { v: '홍길동' }, { v: 2 }, { v: '15:00' }, { v: '16:00' }, { v: '14:00' }, { v: '15:30' }, { v: '13:00' }, { v: '10:00' }] },
                { c: [null, { v: '김영희' }, { v: 1.5 }, { v: '14:00' }, { v: '15:30' }, { v: '16:00' }, { v: '14:30' }, { v: '15:00' }, { v: '11:00' }] },
                { c: [null, { v: '이철수' }, { v: 2 }, { v: '17:00' }, { v: '18:00' }, { v: '17:30' }, { v: '16:00' }, { v: '17:00' }, { v: '14:00' }] },
                { c: [null, { v: '박민수' }, { v: 3 }, { v: '13:00' }, { v: '14:00' }, { v: '15:00' }, { v: '13:30' }, { v: '14:00' }, { v: '09:00' }] },
                { c: [null, { v: '정수연' }, { v: 1 }, { v: '16:00' }, { v: '17:00' }, { v: '18:00' }, { v: '16:30' }, { v: '16:00' }, { v: '12:00' }] }
            ]
        }
    };
    
    console.log('샘플 데이터 로드 완료');
    parseStudentData(sampleData);
    updateStudentStatus();
}

// 학생 데이터 파싱
function parseStudentData(data) {
    studentsData = [];
    
    if (!data.table || !data.table.rows) {
        console.error('잘못된 데이터 형식');
        return;
    }
    
    // 첫 번째 행은 헤더이므로 건너뜀
    const rows = data.table.rows.slice(1);
    
    rows.forEach((row, index) => {
        if (!row.c || !row.c[1] || !row.c[1].v) return; // 학생명이 없으면 건너뜀
        
        const student = {
            name: row.c[1].v, // B열: 학생명
            totalHours: row.c[2] ? parseFloat(row.c[2].v) || 0 : 0, // C열: 총시간
            startTimes: {} // D~I열: 요일별 시작시간
        };
        
        // 요일별 시작시간 파싱 (D~I열)
        for (let day = 1; day <= 6; day++) {
            const columnIndex = day + 2; // D열=3, E열=4, ... I열=8
            if (row.c[columnIndex] && row.c[columnIndex].v) {
                student.startTimes[day] = parseTime(row.c[columnIndex].v);
            }
        }
        
        studentsData.push(student);
    });
    
    console.log('파싱된 학생 데이터:', studentsData);
}

// 시간 문자열을 분으로 변환 (예: "15:30" -> 930)
function parseTime(timeString) {
    if (!timeString) return null;
    
    const timeStr = timeString.toString();
    const [hours, minutes] = timeStr.split(':').map(Number);
    
    if (isNaN(hours) || isNaN(minutes)) return null;
    
    return hours * 60 + minutes;
}

// 분을 시간 문자열로 변환 (예: 930 -> "15:30")
function formatTime(minutes) {
    if (minutes === null || minutes === undefined) return '--:--';
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

// 현재 시간을 분으로 반환
function getCurrentTimeInMinutes() {
    const now = new Date();
    const kstTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Seoul"}));
    
    return kstTime.getHours() * 60 + kstTime.getMinutes();
}

// 현재 요일 반환 (월요일=1, 일요일=0)
function getCurrentWeekday() {
    const now = new Date();
    const kstTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Seoul"}));
    let day = kstTime.getDay();
    
    // 일요일(0)을 7로 변경, 월요일(1)~토요일(6) 유지
    return day === 0 ? 7 : day;
}

// 학생 상태 업데이트
function updateStudentStatus() {
    const currentTime = getCurrentTimeInMinutes();
    const currentWeekday = getCurrentWeekday();
    
    const activeStudents = [];
    const waitingStudents = [];
    
    studentsData.forEach(student => {
        const startTime = student.startTimes[currentWeekday];
        
        if (!startTime || !student.totalHours) return;
        
        const endTime = startTime + (student.totalHours * 60);
        
        if (currentTime >= startTime && currentTime < endTime) {
            // 진행 중인 학생
            const progress = ((currentTime - startTime) / (student.totalHours * 60)) * 100;
            activeStudents.push({
                ...student,
                startTime,
                endTime,
                progress: Math.min(progress, 100)
            });
        } else if (currentTime < startTime) {
            // 대기 중인 학생
            waitingStudents.push({
                ...student,
                startTime,
                endTime,
                progress: 0
            });
        }
    });
    
    renderStudents(activeStudents, waitingStudents);
}

// 학생 목록 렌더링
function renderStudents(activeStudents, waitingStudents) {
    renderStudentList('active-students', activeStudents, true);
    renderStudentList('waiting-students', waitingStudents, false);
}

// 개별 학생 목록 렌더링
function renderStudentList(containerId, students, showProgress) {
    const container = document.getElementById(containerId);
    
    if (students.length === 0) {
        container.innerHTML = '<div class="empty-message">현재 해당하는 학생이 없습니다.</div>';
        return;
    }
    
    container.innerHTML = students.map(student => 
        createStudentCard(student, showProgress)
    ).join('');
}

// 학생 카드 HTML 생성
function createStudentCard(student, showProgress) {
    const cardClass = showProgress ? 'active' : 'waiting';
    const progressHtml = showProgress ? createProgressBar(student) : '';
    
    return `
        <div class="student-card ${cardClass}">
            <div class="student-info">
                <div class="student-name">${student.name}</div>
                <div class="time-info">
                    <span class="time-slot">시작: ${formatTime(student.startTime)}</span>
                    <span class="time-slot">종료: ${formatTime(student.endTime)}</span>
                    <span class="time-slot">총시간: ${student.totalHours}시간</span>
                </div>
            </div>
            ${progressHtml}
        </div>
    `;
}

// 진행률 바 HTML 생성
function createProgressBar(student) {
    const progressPercent = Math.round(student.progress);
    
    return `
        <div class="progress-container">
            <div class="progress-label">진행률: ${progressPercent}%</div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progressPercent}%">
                    <div class="progress-text">${progressPercent}%</div>
                </div>
            </div>
        </div>
    `;
}

// 에러 메시지 표시
function showErrorMessage(message) {
    const container = document.querySelector('.container');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = `
        background: #e74c3c;
        color: white;
        padding: 15px;
        margin: 20px 0;
        border-radius: 5px;
        text-align: center;
    `;
    errorDiv.textContent = message;
    
    container.insertBefore(errorDiv, container.firstChild);
    
    // 5초 후 에러 메시지 제거
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.parentNode.removeChild(errorDiv);
        }
    }, 5000);
}

// 페이지 언로드 시 정리
window.addEventListener('beforeunload', function() {
    if (updateInterval) {
        clearInterval(updateInterval);
    }
});