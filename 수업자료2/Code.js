function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('📌 사용자 도구')
    .addItem('✅ 1일~31일 A2:S 지우기', 'clearDailySheets')
    .addToUi();
}

function clearDailySheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const successList = [];
  const failList = [];

  for (let day = 1; day <= 31; day++) {
    const sheetName = day + "일";
    try {
      const sheet = ss.getSheetByName(sheetName);
      if (!sheet) {
        failList.push(sheetName + " (시트 없음)");
        continue;
      }
      const lastRow = sheet.getLastRow();
      if (lastRow >= 2) {
        sheet.getRange(2, 1, lastRow - 1, 19).clearContent();
      }
      successList.push(sheetName);
    } catch (e) {
      failList.push(sheetName + " (오류: " + e.message + ")");
    }
  }

  let message = `✅ ${successList.length}개 시트 성공적으로 정리됨.\n`;
  if (failList.length > 0) {
    message += `⚠️ 다음 시트는 오류로 실패:\n- ` + failList.join('\n- ');
  } else {
    message += `🎉 모든 시트 정리 완료!`;
  }

  SpreadsheetApp.getUi().alert(message);
}
