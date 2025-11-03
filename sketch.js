// Translated to p5.js fork: oggy  https://openprocessing.org/sketch/555063


const numb = 55;
const step = 8;
const dist = 50;
const distortion = 15;
let dots = [];


// 新增 overlay 變數與要顯示的 URL
let overlayBackdrop = null;
let overlayModal = null;
let overlayIframe = null;
let overlayCloseBtn = null;
const iframeURL = 'https://11132115-beep.github.io/2025.10.20/';
// 新增：第一單元講義 URL（HackMD）
const iframeURL2 = 'https://hackmd.io/@IPa9_G7tTe268b5mtxTumQ/BkSmvX0ogg';


// 新增：選單相關狀態
let menuWidth = 200;
let menuX = -menuWidth;        // 畫面外
let menuTargetX = -menuWidth;  // 目標位置（滑入/滑出）
let currentPage = 0;           // 0 = 主畫面, 1/2/3 = 頁面一/二/三


// 新增：右上文字粒子效果相關（改為兩行置中、字體變小）
const labelLines = ['教育科技1B', '楊美恩 414730043'];
let labelParticles = [];
const labelMargin = 20;
const labelFontSize = 24; // 小一點
const lineGap = 6;
let labelTotalWidth = 0;  // 寬度以最長一行計
let labelTotalHeight = 0; // 兩行總高度


// 新增 quiz DOM 與題庫變數
let quizBackdrop = null;
let quizModal = null;
let quizQuestions = [
  // 範例題庫：可自行增減，每題包含 id, 題目, 選項陣列, 正確選項索引, 回饋
  { id: 'Q1', q: '何者為 p5.js 用來建立向量的函式？', choices: ['createVector()', 'new Vector()', 'Vector()'], answer: 0, feedback: 'createVector() 會回傳一個 p5.Vector 物件。' },
  { id: 'Q2', q: 'mouseX 在何時有效？', choices: ['setup()', 'draw() 與事件中', '只有 mousePressed()'], answer: 1, feedback: 'mouseX 在 draw 與滑鼠事件中會更新。' },
  { id: 'Q3', q: '要在畫布上畫點使用哪個函式？', choices: ['dot()', 'point()', 'pixel()'], answer: 1, feedback: 'point(x,y) 可在畫布上繪製單一像素或小點。' },
  { id: 'Q4', q: 'p5.js 中用來緩動的常見函式是？', choices: ['lerp()', 'smooth()', 'fade()'], answer: 0, feedback: 'lerp() 可做線性插值，常用於緩動。' },
  { id: 'Q5', q: '若要改變畫布大小，應使用？', choices: ['resizeCanvas()', 'setSize()', 'changeCanvas()'], answer: 0, feedback: 'resizeCanvas(width,height) 可調整畫布大小。' }
];
let currentQuizQuestions = []; // 本次抽出的三題


function setup() {
  // 全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  background(200);
  stroke(256);
  const dx = (width - numb * step) / 2;
  const dy = (height - numb * step) / 2;
  for (let i = 0; i < numb; i++) {
    dots[i] = [];
    for (let j = 0; j < numb; j++) {
      dots[i][j] = new Dot(i * step + dx, j * step + dy);
    }
  }


  // 建立 overlay DOM（預設隱藏）
  createOverlay();

  // 建立 quiz modal DOM（預設隱藏）
  createQuizModal();

  // 建立右側顯示相片的白色按鈕（預設）
  createPhotoButton();

  // 初始化右上文字粒子（根據目前畫面）
  initLabelParticles();
}


function draw() {
  // 背景
  fill(0);
  rect(0, 0, width, height);
  const m = createVector(mouseX, mouseY);
  for (let i = 0; i < numb; i++) {
    for (let j = 0; j < numb; j++) {
      dots[i][j].update(m);
    }
  }


  // 選單邏輯：當滑鼠 X 小於 100 時滑出
  if (mouseX < 100) menuTargetX = 0;
  else menuTargetX = -menuWidth;
  // 平滑動畫
  menuX += (menuTargetX - menuX) * 0.2;


  // 繪製滑出選單（在最上層）
  push();
  translate(menuX, 0);
  noStroke();
  fill(30, 30, 30, 230);
  rect(0, 0, menuWidth, height);


  // 按鈕設定（改為 4 個按鈕）
  const btnW = menuWidth - 30;
  const btnH = 48;
  const startY = 80;
  const gap = 12;


  textAlign(LEFT, CENTER);
  textSize(20);
  fill(220);
  text("選單", 20, 40);


  // 新標籤陣列
  const labels = [
    "1. 第一單元作品",
    "2. 第一單元講義",
    "3. 測驗系統",
    "4. 回到首頁"
  ];


  // 四個按鈕：1~4
  for (let i = 0; i < labels.length; i++) {
    const bx = 15;
    const by = startY + i * (btnH + gap);
    // 按鈕背景（當滑鼠位於按鈕上時改變顏色）
    if (mouseX - menuX >= bx && mouseX - menuX <= bx + btnW &&
        mouseY >= by - btnH/2 && mouseY <= by + btnH/2) {
      fill(100);
    } else {
      fill(60);
    }
    rect(bx, by - btnH/2, btnW, btnH, 6);


    // 按鈕文字
    fill(240);
    textAlign(LEFT, CENTER);
    // 留一些左邊距
    text(labels[i], bx + 12, by);
  }
  pop();


  // 若已切換頁面，繪製頁面指示（示範內容）
  if (currentPage !== 0) {
    push();
    fill(0, 200);
    rect(0, 0, width, height);
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(48);
    text(`頁面 ${currentPage}`, width / 2, height / 2);
    pop();
  }


  // 置中兩行文字：用粒子陣列繪製或靜態繪製
  push();
  textSize(labelFontSize);
  textAlign(CENTER, CENTER);
  noStroke();
  let anyActive = labelParticles.some(p => p.state !== 'idle');


  const isMouseRight = mouseX > width / 2; // 保留原本滑鼠在右半邊才閃光的規則
  const centerX = width / 2;
  const topY = labelMargin;


  if (!anyActive) {
    // 沒活動時畫一般兩行文字（保留閃光）
    if (isMouseRight) {
      const glow = 8 + 6 * sin(frameCount * 0.2);
      drawingContext.shadowBlur = glow;
      drawingContext.shadowColor = 'rgba(255,255,255,0.95)';
      fill(255);
    } else {
      drawingContext.shadowBlur = 0;
      fill(255, 220);
    }


    // 第一行
    const y1 = topY + labelFontSize / 2;
    textAlign(CENTER, TOP);
    text(labelLines[0], centerX, y1 - labelFontSize / 2);


    // 第二行（較小一點視覺可再減半透明）
    const y2 = y1 + labelFontSize + lineGap;
    textAlign(CENTER, TOP);
    text(labelLines[1], centerX, y2 - labelFontSize / 2);


    drawingContext.shadowBlur = 0;
  } else {
    // 若有活動，用每個 particle 繪製各字符
    for (let p of labelParticles) {
      p.update();
      p.draw(isMouseRight);
    }
    drawingContext.shadowBlur = 0;
  }
  pop();
}


// 新增：建立 overlay DOM（背板 + modal + iframe + 關閉按鈕）
function createOverlay() {
  if (overlayBackdrop) return;


  overlayBackdrop = document.createElement('div');
  Object.assign(overlayBackdrop.style, {
    position: 'fixed',
    left: '0',
    top: '0',
    width: '100%',
    height: '100%',
    background: 'rgba(0,0,0,0.6)',
    display: 'none',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    overflow: 'auto'
  });
  document.body.appendChild(overlayBackdrop);


  overlayModal = document.createElement('div');
  Object.assign(overlayModal.style, {
    position: 'relative',
    width: '70vw',    // 70% 寬
    height: '85vh',   // 85% 高
    background: '#fff',
    borderRadius: '8px',
    boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
    overflow: 'hidden'
  });
  overlayBackdrop.appendChild(overlayModal);


  overlayIframe = document.createElement('iframe');
  overlayIframe.setAttribute('src', '');
  overlayIframe.setAttribute('frameborder', '0');
  Object.assign(overlayIframe.style, {
    width: '100%',
    height: '100%',
    border: '0',
    display: 'block'
  });
  overlayModal.appendChild(overlayIframe);


  overlayCloseBtn = document.createElement('button');
  overlayCloseBtn.innerText = '✕';
  Object.assign(overlayCloseBtn.style, {
    position: 'absolute',
    right: '8px',
    top: '8px',
    zIndex: 10001,
    background: 'rgba(0,0,0,0.6)',
    color: '#fff',
    border: 'none',
    padding: '6px 10px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px'
  });
  overlayModal.appendChild(overlayCloseBtn);


  // 點擊 backdrop（背景）會關閉 overlay
  overlayBackdrop.addEventListener('click', (e) => {
    if (e.target === overlayBackdrop) hideOverlay();
  });


  // 關閉按鈕
  overlayCloseBtn.addEventListener('click', hideOverlay);


  // Esc 鍵關閉
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hideOverlay();
  });
}


function showOverlay(url, pageNum = 1) {
  if (!overlayBackdrop) createOverlay();
  overlayIframe.src = url;
  overlayBackdrop.style.display = 'flex';
  currentPage = pageNum;
}


function hideOverlay() {
  if (!overlayBackdrop) return;
  overlayBackdrop.style.display = 'none';
  overlayIframe.src = 'about:blank';
  currentPage = 0;
}


// 新增：建立 quiz DOM（背板 + modal + 內容）
function createQuizModal() {
  if (quizBackdrop) return;

  quizBackdrop = document.createElement('div');
  Object.assign(quizBackdrop.style, {
    position: 'fixed',
    left: '0',
    top: '0',
    width: '100%',
    height: '100%',
    background: 'rgba(0,0,0,0.6)',
    display: 'none',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10002,
    overflow: 'auto'
  });
  document.body.appendChild(quizBackdrop);

  quizModal = document.createElement('div');
  Object.assign(quizModal.style, {
    position: 'relative',
    width: '720px',
    maxWidth: '90vw',
    height: 'auto',
    background: '#0b0b0b',
    color: '#fff',
    borderRadius: '8px',
    boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
    padding: '18px',
    fontFamily: 'sans-serif'
  });
  quizBackdrop.appendChild(quizModal);

  // 標題
  const title = document.createElement('h2');
  title.innerText = '測驗系統';
  Object.assign(title.style, { margin: '6px 0 12px 0', color: '#fff' });
  quizModal.appendChild(title);

  // 內容容器
  const content = document.createElement('div');
  content.id = 'quizContent';
  quizModal.appendChild(content);

  // 按鈕列
  const btnRow = document.createElement('div');
  Object.assign(btnRow.style, { display: 'flex', gap: '8px', marginTop: '12px' });

  const submitBtn = document.createElement('button');
  submitBtn.innerText = '交卷並產生 CSV';
  Object.assign(submitBtn.style, { padding: '8px 12px', cursor: 'pointer' });
  submitBtn.addEventListener('click', submitQuiz);
  btnRow.appendChild(submitBtn);

  const closeBtn = document.createElement('button');
  closeBtn.innerText = '關閉';
  Object.assign(closeBtn.style, { padding: '8px 12px', cursor: 'pointer' });
  closeBtn.addEventListener('click', hideQuizModal);
  btnRow.appendChild(closeBtn);

  quizModal.appendChild(btnRow);

  // 點 backdrop 可關閉
  quizBackdrop.addEventListener('click', (e) => {
    if (e.target === quizBackdrop) hideQuizModal();
  });
}


// 選出 n 題（不重複）
function pickRandomQuestions(n = 3) {
  const pool = [...quizQuestions];
  const picked = [];
  for (let i = 0; i < n && pool.length > 0; i++) {
    const idx = floor(random(pool.length));
    picked.push(pool.splice(idx, 1)[0]);
  }
  return picked;
}


function showQuizModal() {
  if (!quizBackdrop) createQuizModal();
  currentQuizQuestions = pickRandomQuestions(3);
  renderQuizContent();
  quizBackdrop.style.display = 'flex';
  currentPage = 3;
}


function hideQuizModal() {
  if (!quizBackdrop) return;
  quizBackdrop.style.display = 'none';
  currentPage = 0;
}


// 將抽到的題目渲染到 DOM
function renderQuizContent() {
  const content = document.getElementById('quizContent');
  content.innerHTML = ''; // 清空
  currentQuizQuestions.forEach((q, qi) => {
    const qDiv = document.createElement('div');
    Object.assign(qDiv.style, { marginBottom: '10px', padding: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' });

    const qTitle = document.createElement('div');
    qTitle.innerText = `${qi + 1}. ${q.q}`;
    Object.assign(qTitle.style, { marginBottom: '6px' });
    qDiv.appendChild(qTitle);

    q.choices.forEach((c, ci) => {
      const id = `q_${qi}_c_${ci}`;
      const label = document.createElement('label');
      Object.assign(label.style, { display: 'block', cursor: 'pointer' });

      const input = document.createElement('input');
      input.type = 'radio';
      input.name = `q_${qi}`;
      input.value = ci;
      input.id = id;
      Object.assign(input.style, { marginRight: '8px' });

      label.appendChild(input);
      label.appendChild(document.createTextNode(c));
      qDiv.appendChild(label);
    });

    content.appendChild(qDiv);
  });

  // 結果區塊
  let resultDiv = document.getElementById('quizResult');
  if (!resultDiv) {
    resultDiv = document.createElement('div');
    resultDiv.id = 'quizResult';
    Object.assign(resultDiv.style, { marginTop: '12px' });
    quizModal.appendChild(resultDiv);
  }
  resultDiv.innerHTML = '';
}


// 提交，計分並產生 CSV 下載
function submitQuiz() {
  const results = [];
  let score = 0;
  currentQuizQuestions.forEach((q, qi) => {
    const radios = document.getElementsByName(`q_${qi}`);
    let selected = null;
    for (let r of radios) {
      if (r.checked) {
        selected = int(r.value);
        break;
      }
    }
    const correct = q.answer;
    const isCorrect = selected === correct;
    if (isCorrect) score++;
    results.push({
      id: q.id,
      question: q.q,
      selected: selected !== null ? q.choices[selected] : '',
      correct: q.choices[correct],
      isCorrect: isCorrect ? '1' : '0',
      feedback: isCorrect ? ('答對！' + (q.feedback || '')) : ('答錯。' + (q.feedback || ''))
    });
  });

  // 產生回饋文字
  const percent = round((score / currentQuizQuestions.length) * 100);
  let remark = '';
  if (percent === 100) remark = '太棒了！全部答對。';
  else if (percent >= 66) remark = '表現良好，仍可再進步。';
  else remark = '需要加強，多練習會更好。';

  // 顯示結果與回饋
  const resultDiv = document.getElementById('quizResult');
  resultDiv.innerHTML = `<div style="padding:10px;background:rgba(255,255,255,0.03);border-radius:6px;">
    <strong>成績：${score} / ${currentQuizQuestions.length} (${percent}%)</strong>
    <div style="margin-top:6px;">回饋：${remark}</div>
  </div>`;

  // 將每題細節列出
  const detail = document.createElement('div');
  detail.style.marginTop = '8px';
  detail.innerHTML = results.map((r, i) => `<div style="margin-top:6px;padding:6px;background:rgba(255,255,255,0.02);border-radius:4px;">
    <div><strong>${i+1}. ${r.id}</strong> — ${r.question}</div>
    <div>你的答案：${r.selected || '未作答'} / 正確：${r.correct} — ${r.isCorrect === '1' ? '✓' : '✗'}</div>
    <div style="color:#ddd;margin-top:4px;">${r.feedback}</div>
  </div>`).join('');
  resultDiv.appendChild(detail);

  // 產生 CSV 並提供下載
  const csvHeader = ['id', 'question', 'selected', 'correct', 'isCorrect', 'feedback'];
  const csvRows = [csvHeader.join(',')].concat(results.map(r =>
    [r.id, `"${r.question.replace(/"/g,'""')}"`, `"${r.selected.replace(/"/g,'""')}"`, `"${r.correct.replace(/"/g,'""')}"`, r.isCorrect, `"${r.feedback.replace(/"/g,'""')}"`].join(',')
  ));
  const csvContent = csvRows.join('\n');
  downloadTextFile(csvContent, 'quiz_result.csv', 'text/csv;charset=utf-8;');

  // 簡單互動視覺：暫時改變畫布 background 色並觸發右上文字粒子散開
  for (let p of labelParticles) if (p.state === 'idle') p.scatter();

  // 依分數觸發 modal 內效果（碎花、氣球、全域閃光），並傳入每題結果以對應題目位置
  triggerEffectsByScore(score, results);

  // 仍保留在 modal，不自動關閉
}


// 下載文字檔 helper
function downloadTextFile(text, filename, mime = 'text/plain') {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}


// 新增：當視窗改變大小時重新配置 label 的位置
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  const dx = (width - numb * step) / 2;
  const dy = (height - numb * step) / 2;
  for (let i = 0; i < numb; i++) {
    for (let j = 0; j < numb; j++) {
      const x = i * step + dx;
      const y = j * step + dy;
      dots[i][j].origin = createVector(x, y);
      dots[i][j].pos = dots[i][j].origin.copy();
      dots[i][j].speed.set(0, 0);
    }
  }
  // 重新初始化 label particles（以符合新畫面）
  initLabelParticles();
}


class Dot {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.origin = this.pos.copy();
    this.speed = createVector(0, 0);
  }
 
  update(m) {
    let tmp = this.origin.copy();
    tmp.sub(m);
    const d = tmp.mag();
    const c = map(d, 0, dist, 0, PI);
    tmp.normalize();
    tmp.mult(distortion * sin(c));
   
    let strokeWidth;
    if (d < dist) strokeWidth = 1 + 10 * abs(cos(c / 2));
    else strokeWidth = map(min(d, width), 0, width, 5, 0.1);
   
    const target = createVector(this.origin.x + tmp.x, this.origin.y + tmp.y);
    tmp = this.pos.copy();
    tmp.sub(target);
    tmp.mult(-map(m.dist(this.pos), 0, 2 * width, 0.1, 0.01));
    this.speed.add(tmp);
    this.speed.mult(0.87);
    this.pos.add(this.speed);


    strokeWeight(strokeWidth);
    point(this.pos.x, this.pos.y);
  }
}


// 新增：初始化 label 的粒子（支援兩行置中）
function initLabelParticles() {
  labelParticles = [];
  textSize(labelFontSize);


  // 計算每行寬度，取最長作為總寬
  const lineWidths = labelLines.map(line => textWidth(line));
  labelTotalWidth = max(...lineWidths);
  labelTotalHeight = labelFontSize * labelLines.length + lineGap * (labelLines.length - 1);


  const centerX = width / 2;
  // 每行起始 X（左起點）
  const startXs = lineWidths.map(w => centerX - w / 2);


  // Y 位置
  const y1 = labelMargin + labelFontSize / 2;
  for (let li = 0; li < labelLines.length; li++) {
    const line = labelLines[li];
    let x = startXs[li];
    const y = y1 + li * (labelFontSize + lineGap);
    for (let i = 0; i < line.length; i++) {
      const ch = line.charAt(i);
      const w = textWidth(ch);
      const cx = x + w / 2;
      const origin = createVector(cx, y);
      labelParticles.push(new CharParticle(ch, origin));
      x += w;
    }
  }
}


// 修改 CharParticle 的 floor 位置（使用全域 height）
// 字元粒子類別
class CharParticle {
  constructor(ch, origin) {
    this.ch = ch;
    this.origin = origin.copy();
    this.pos = origin.copy();
    this.vel = createVector(0, 0);
    this.state = 'idle'; // idle, scattering, landed, returning
    this.landedAt = 0;
    this.floorY = height - (labelFontSize / 2); // 著陸 y
  }


  scatter() {
    const angle = random(-PI * 0.9, PI * 0.9);
    const speed = random(4, 10);
    this.vel = p5.Vector.fromAngle(angle).mult(speed);
    this.vel.y -= random(0, 3);
    this.state = 'scattering';
  }


  update() {
    if (this.state === 'idle') return;


    if (this.state === 'scattering') {
      this.vel.y += 0.6;
      this.pos.add(this.vel);
      const floor = height - labelFontSize / 2;
      if (this.pos.y >= floor) {
        this.pos.y = floor;
        this.vel.set(0, 0);
        this.state = 'landed';
        this.landedAt = millis();
      }
    } else if (this.state === 'landed') {
      if (millis() - this.landedAt >= 5000) {
        this.state = 'returning';
      }
    } else if (this.state === 'returning') {
      this.pos.x = lerp(this.pos.x, this.origin.x, 0.12);
      this.pos.y = lerp(this.pos.y, this.origin.y, 0.12);
      if (p5.Vector.dist(this.pos, this.origin) < 1.0) {
        this.pos = this.origin.copy();
        this.vel.set(0, 0);
        this.state = 'idle';
      }
    }
  }


  draw(isMouseRight) {
    if (this.ch === ' ') return;
    push();
    textSize(labelFontSize);
    textAlign(CENTER, CENTER);
    if (isMouseRight) {
      const glow = 8 + 6 * sin(frameCount * 0.2);
      drawingContext.shadowBlur = glow;
      drawingContext.shadowColor = 'rgba(255,255,255,0.95)';
      fill(255);
    } else {
      drawingContext.shadowBlur = 0;
      fill(255, 220);
    }
    text(this.ch, this.pos.x, this.pos.y - labelFontSize / 4);
    drawingContext.shadowBlur = 0;
    pop();
  }
}


// 修改 mousePressed：點擊範圍改為置中兩行區域
function mousePressed() {
  // 先檢查是否點擊置中兩行文字區域
  textSize(labelFontSize);
  const centerX = width / 2;
  const left = centerX - labelTotalWidth / 2;
  const right = centerX + labelTotalWidth / 2;
  const top = labelMargin;
  const bottom = labelMargin + labelTotalHeight;
  if (mouseX >= left && mouseX <= right && mouseY >= top && mouseY <= bottom) {
    let anyActive = labelParticles.some(p => p.state !== 'idle');
    if (!anyActive) {
      for (let p of labelParticles) p.scatter();
    }
    return; // 點擊文字後不再處理選單點擊
  }


  // 如果選單可見或滑出的範圍包含滑鼠，檢查按鈕點擊
  const localX = mouseX - menuX;
  if (localX >= 0 && localX <= menuWidth) {
    const btnW = menuWidth - 30;
    const btnH = 48;
    const startY = 80;
    const gap = 12;
    const btnCount = 4;
    for (let i = 0; i < btnCount; i++) {
      const bx = 15;
      const by = startY + i * (btnH + gap);
      if (localX >= bx && localX <= bx + btnW &&
          mouseY >= by - btnH/2 && mouseY <= by + btnH/2) {
        const idx = i + 1;
        if (idx === 1) {
          // 使用 iframe overlay 顯示指定 URL（置中、70% 寬、85% 高）
          showOverlay(iframeURL, 1);
        } else if (idx === 2) {
          // 用 iframe overlay 顯示第一單元講義（HackMD）
          showOverlay(iframeURL2, 2);
        } else if (idx === 3) {
          // 打開 測驗系統 modal（抽三題、互動、CSV）
          showQuizModal();
        } else if (idx === 4) {
          // 回到「黑色底白點點」主畫面（隱藏所有 overlay 並回到 currentPage = 0）
          hideOverlay();
          hideQuizModal();
          currentPage = 0;
        }
        // 點擊後收起選單
        menuTargetX = -menuWidth;
        break;
      }
    }
  }
}

// ---------- 以下為新增效果：碎花星星、氣球、閃光 ----------
let effectStyleInjected = false;

// 在頁面加入必要的 CSS（一次注入）
function ensureEffectsStyles() {
  if (effectStyleInjected) return;
  effectStyleInjected = true;
  const css = `
  .quiz-effect-star {
    position: absolute;
    width: 12px;
    height: 12px;
    pointer-events: none;
    transform-origin: center;
    will-change: transform, top, left, opacity;
    font-size: 12px;
    line-height: 12px;
    text-align: center;
  }
  .quiz-effect-balloon {
    position: absolute;
    width: 28px;
    height: 40px;
    border-radius: 14px 14px 12px 12px;
    pointer-events: none;
    will-change: transform, top, left, opacity;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
  }
  .quiz-flash {
    animation: quizFlashAnim 0.35s ease-in-out infinite alternate;
  }
  @keyframes quizFlashAnim {
    from { filter: brightness(1); text-shadow: 0 0 6px rgba(255,255,255,0.0); }
    to   { filter: brightness(1.6); text-shadow: 0 0 18px rgba(255,255,255,0.95); }
  }
  `;
  const style = document.createElement('style');
  style.innerText = css;
  document.head.appendChild(style);
}

// 藉由題目索引在對應題目區域產生多顆碎花星星（往下掉）
function spawnStarsAtQuestion(qIndex, count = 10) {
  ensureEffectsStyles();
  const content = document.getElementById('quizContent');
  if (!content) return;
  const qDiv = content.children[qIndex];
  if (!qDiv || !quizModal) return;
  const modalRect = quizModal.getBoundingClientRect();
  const rect = qDiv.getBoundingClientRect();

  for (let i = 0; i < count; i++) {
    const star = document.createElement('div');
    star.className = 'quiz-effect-star';
    // 用 emoji 當花朵星星（可替換為 SVG）
    star.innerText = ['✿','✦','✶','✸'][Math.floor(Math.random()*4)];
    const startX = rect.left - modalRect.left + (Math.random() * rect.width);
    const startY = rect.top - modalRect.top - 10 + (Math.random() * 8);
    star.style.left = `${startX}px`;
    star.style.top = `${startY}px`;
    star.style.opacity = '1';
    star.style.transform = `rotate(${Math.random()*360}deg) scale(${0.8 + Math.random()*0.8})`;
    quizModal.appendChild(star);

    // 動畫參數
    const vx = (Math.random() - 0.5) * 1.4;
    let vy = 1 + Math.random() * 2.5;
    let rot = (Math.random() - 0.5) * 0.4;
    const gravity = 0.08 + Math.random() * 0.06;
    let life = 0;
    const maxLife = 180 + Math.random()*80;

    const raf = () => {
      life++;
      const curTop = parseFloat(star.style.top);
      const curLeft = parseFloat(star.style.left);
      vy += gravity;
      const nx = curLeft + vx;
      const ny = curTop + vy;
      star.style.left = nx + 'px';
      star.style.top = ny + 'px';
      rot += 0.02;
      star.style.transform = `rotate(${rot}rad) scale(${0.9 - life/maxLife*0.5})`;
      star.style.opacity = `${1 - life/maxLife}`;
      if (life < maxLife && ny < quizModal.clientHeight + 40) {
        requestAnimationFrame(raf);
      } else {
        star.remove();
      }
    };
    requestAnimationFrame(raf);
  }
}

// 對於多題正確，於那些題目位置產生上升的氣球
function spawnBalloonsAtQuestion(qIndex, count = 3) {
  ensureEffectsStyles();
  const content = document.getElementById('quizContent');
  if (!content) return;
  const qDiv = content.children[qIndex];
  if (!qDiv || !quizModal) return;
  const modalRect = quizModal.getBoundingClientRect();
  const rect = qDiv.getBoundingClientRect();

  for (let i = 0; i < count; i++) {
    const b = document.createElement('div');
    b.className = 'quiz-effect-balloon';

    // 改為純白、較大、無背景矩形的 SVG 氣球（透明背景）
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="92" viewBox="0 0 64 92">
        <defs>
          <radialGradient id="g" cx="35%" cy="25%" r="80%">
            <stop offset="0" stop-color="#ffffff" stop-opacity="1"/>
            <stop offset="1" stop-color="#f2f2f2" stop-opacity="1"/>
          </radialGradient>
        </defs>
        <ellipse cx="32" cy="32" rx="26" ry="30" fill="url(#g)" />
        <path d="M32 66c0 0 0 8-6 10h12c-6-2-6-10-6-10z" fill="#ffffff"/>
        <!-- 純白氣球，SVG 背景透明 -->
      </svg>
    `;
    b.innerHTML = svg;

    // 視覺樣式：覆蓋預設，確保無矩形背景且較大
    b.style.background = 'transparent';
    b.style.width = '64px';
    b.style.height = '92px';
    b.style.padding = '0';
    b.style.borderRadius = '0';
    b.style.boxShadow = 'none';
    b.style.pointerEvents = 'none';
    b.style.display = 'block';
    b.style.opacity = '1';

    // 初始位置：在題目區域上方偏移
    const startX = rect.left - modalRect.left + rect.width * (0.5 + (Math.random()-0.5)*0.3);
    const startY = rect.top - modalRect.top + rect.height * 0.4 + (Math.random()*6);
    b.style.left = `${startX}px`;
    b.style.top = `${startY}px`;
    quizModal.appendChild(b);

    // 動畫：向上飄並漸隱
    const driftX = (Math.random()-0.5) * 0.6;
    let vy = - (1.6 + Math.random()*1.8); // 調整為較緩和往上速度
    const vyAcc = -0.008 - Math.random()*0.008; // 微加速往上
    let life = 0;
    const maxLife = 300 + Math.random()*120;

    const raf = () => {
      life++;
      const curTop = parseFloat(b.style.top);
      const curLeft = parseFloat(b.style.left);
      vy += vyAcc;
      const nx = curLeft + driftX;
      const ny = curTop + vy;
      b.style.left = nx + 'px';
      b.style.top = ny + 'px';
      b.style.opacity = `${Math.max(0, 1 - life / maxLife)}`;
      if (life < maxLife && ny + 100 > -120) {
        requestAnimationFrame(raf);
      } else {
        b.remove();
      }
    };
    requestAnimationFrame(raf);
  }
}

// 依分數啟動所有效果：碎花（單題）、氣球（兩題）、全部閃光（3題）
function triggerEffectsByScore(score, perQuestionResults) {
  ensureEffectsStyles();
  if (!quizModal) return;

  // 找出答對題目的索引
  const correctIndices = [];
  if (Array.isArray(perQuestionResults)) {
    perQuestionResults.forEach((r, i) => {
      if (r.isCorrect === '1' || r.isCorrect === 1 || r.isCorrect === true) correctIndices.push(i);
    });
  }

  // 一題以上：在每個答對題目旁掉落碎花（每題較少）
  if (score >= 1) {
    correctIndices.forEach(idx => spawnStarsAtQuestion(idx, 12));
  }

  // 兩題以上：在答對的題目上方飄氣球（每題數量少）
  if (score >= 2) {
    correctIndices.forEach(idx => spawnBalloonsAtQuestion(idx, 3));
  }

  // 三題：全域閃光效果（加上前兩項）
  if (score === 3) {
    // 在 modal 加上 .quiz-flash，3秒後移除
    quizModal.classList.add('quiz-flash');
    setTimeout(() => quizModal.classList.remove('quiz-flash'), 3000);

    // 同時再多產一些碎花與氣球（全域慶祝）
    for (let i = 0; i < 5; i++) {
      // 從所有題目中隨機挑位置
      const pick = Math.floor(Math.random() * currentQuizQuestions.length);
      spawnStarsAtQuestion(pick, 8);
      spawnBalloonsAtQuestion(pick, 2);
    }
  }
}

// ---------- end of effects ----------

// 新增：右側白色按鈕與照片面板
let photoBtn = null;
let photoPanel = null;
let photoImg = null;
let photoVisible = false;

// 建立按鈕（在頁面右側固定位置）與照片面板
function createPhotoButton() {
  if (photoBtn) return;

  // 按鈕
  photoBtn = document.createElement('button');
  photoBtn.innerText = '照片';
  Object.assign(photoBtn.style, {
    position: 'fixed',
    right: '24px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '56px',
    height: '56px',
    borderRadius: '28px',
    background: '#ffffff',
    color: '#111',
    border: 'none',
    cursor: 'pointer',
    zIndex: 10005,
    boxShadow: '0 6px 20px rgba(0,0,0,0.35)',
    fontSize: '14px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0'
  });
  document.body.appendChild(photoBtn);
  photoBtn.addEventListener('click', togglePhotoPanel);

  // 照片面板（預設隱藏）
  photoPanel = document.createElement('div');
  Object.assign(photoPanel.style, {
    position: 'fixed',
    right: '96px',             // 按鈕右側留空間
    top: '50%',
    transform: 'translateY(-50%)',
    width: '320px',
    maxWidth: '40vw',
    height: 'auto',
    zIndex: 10004,
    display: 'none',
    pointerEvents: 'auto'
  });
  document.body.appendChild(photoPanel);

  // 裝載圖片（請將你的相片放在專案資料夾並修改 src）
  photoImg = document.createElement('img');
  photoImg.src = 'photo.jpg'; // ← 如需改路徑，請修改此處（ex: './assets/me.png'）
  photoImg.alt = '我的照片';
  Object.assign(photoImg.style, {
    width: '100%',
    height: 'auto',
    display: 'block',
    borderRadius: '10px',
    background: 'transparent', // 確保沒有背景色
    boxShadow: '0 10px 30px rgba(0,0,0,0.6)'
  });
  photoPanel.appendChild(photoImg);

  // 小關閉按鈕（在圖片右上角）
  const closeBtn = document.createElement('button');
  closeBtn.innerText = '✕';
  Object.assign(closeBtn.style, {
    position: 'absolute',
    right: '6px',
    top: '6px',
    background: 'rgba(255,255,255,0.9)',
    border: 'none',
    borderRadius: '6px',
    padding: '4px 6px',
    cursor: 'pointer',
    zIndex: 10006,
    fontSize: '12px'
  });
  closeBtn.addEventListener('click', hidePhotoPanel);
  photoPanel.appendChild(closeBtn);
}

// 切換顯示/隱藏照片面板
function togglePhotoPanel() {
  // 確保是在主畫面，如果不在則切回主畫面
  if (currentPage !== 0) {
    hideOverlay();
    hideQuizModal();
    currentPage = 0;
  }
  if (!photoVisible) showPhotoPanel();
  else hidePhotoPanel();
}

function showPhotoPanel() {
  if (!photoPanel || !photoBtn) return;
  photoPanel.style.display = 'block';
  photoVisible = true;
  // 可選：按鈕變成半透明表示已打開
  photoBtn.style.opacity = '0.8';
}

function hidePhotoPanel() {
  if (!photoPanel || !photoBtn) return;
  photoPanel.style.display = 'none';
  photoVisible = false;
  photoBtn.style.opacity = '1';
}



