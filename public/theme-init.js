try {
  // 只有在使用者「手動」切到夜間模式時才套用 dark。
  // 不跟隨作業系統的深色模式，避免手機在系統深色模式下自動變得太暗。
  var t = localStorage.getItem('ws-theme');
  if (t === 'dark') {
    document.documentElement.classList.add('dark');
  }
} catch (e) {}
