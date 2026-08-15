/* ============================================================
   COUNTDOWN & SUNFLOWER RAIN ENGINE
   ============================================================ */

// ১৭ আগস্ট ২০২৬, ১২:০০ AM (রাত ১২টা)
const targetDate = new Date('August 17, 2026 00:00:00').getTime();

function updateCountdown() {
  const now = new Date().getTime();
  const diff = targetDate - now;

  if (diff <= 0) {
    window.location.href = './birthday.html';
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  document.getElementById('d').textContent = String(days).padStart(2, '0');
  document.getElementById('h').textContent = String(hours).padStart(2, '0');
  document.getElementById('m').textContent = String(minutes).padStart(2, '0');
  document.getElementById('s').textContent = String(seconds).padStart(2, '0');
}

setInterval(updateCountdown, 1000);
updateCountdown();

/* --- ক্যানভাসে সূর্যমুখী ফুল ও পাপড়ি ঝরে পড়ার অ্যানিমেশন --- */
const canvas = document.getElementById('rainCanvas');
const ctx = canvas.getContext('2d');

let W, H;
function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// ফুল স্প্রাইট তৈরি
const flowerCanvas = document.createElement('canvas');
flowerCanvas.width = flowerCanvas.height = 40;
const fc = flowerCanvas.getContext('2d');
fc.translate(20, 20);
fc.fillStyle = '#ffb300';
for (let i = 0; i < 8; i++) {
  fc.beginPath();
  fc.ellipse(0, -12, 4, 8, 0, 0, Math.PI * 2);
  fc.fill();
  fc.rotate(Math.PI / 4);
}
fc.beginPath();
fc.arc(0, 0, 6, 0, Math.PI * 2);
fc.fillStyle = '#5d4037';
fc.fill();

const items = [];
const itemCount = 35;

for (let i = 0; i < itemCount; i++) {
  items.push({
    x: Math.random() * W,
    y: Math.random() * H - H,
    vy: 1.2 + Math.random() * 2.2,
    vx: (Math.random() - 0.5) * 1.2,
    size: 16 + Math.random() * 22,
    rot: Math.random() * 6.28,
    vrot: (Math.random() - 0.5) * 0.05,
    sway: Math.random() * 5,
    swaySpeed: 0.02 + Math.random() * 0.02
  });
}

function loop() {
  ctx.clearRect(0, 0, W, H);

  for (const item of items) {
    item.y += item.vy;
    item.x += Math.sin(item.sway) * 0.8 + item.vx;
    item.sway += item.swaySpeed;
    item.rot += item.vrot;

    if (item.y > H + 40) {
      item.y = -40;
      item.x = Math.random() * W;
    }

    ctx.save();
    ctx.translate(item.x, item.y);
    ctx.rotate(item.rot);
    ctx.drawImage(flowerCanvas, -item.size / 2, -item.size / 2, item.size, item.size);
    ctx.restore();
  }

  requestAnimationFrame(loop);
}
loop();