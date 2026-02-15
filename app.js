const API =
    "https://brsapi.ir/Api/Market/Gold_Currency.php?key=BAfyT5VWlAcb4IpQ2KiTeMJpiNlN84L1";

const weights = [50, 100, 150, 200, 250, 300, 350, 400, 500];

// دیتای ذخیره شده
let inv = JSON.parse(localStorage.getItem("gold_db")) || {};
weights.forEach(w => { if (!inv[w]) inv[w] = 0; });

let dollars = Number(localStorage.getItem("usd_db")) || 0;

// قیمت‌ها
let gold = 0;
let usd = 0;


// DOM
const priceGrid = document.getElementById("priceGrid");
const grandTotal = document.getElementById("grandTotal");
const modal = document.getElementById("modal");
const invList = document.getElementById("invList");
const openBtn = document.getElementById("openBtn");
const saveBtn = document.getElementById("saveBtn");
const updateTime = document.getElementById("updateTime");


// گرفتن دیتا
async function loadData() {

    try {

        const r = await fetch(API);
        const d = await r.json();

        gold = Number(d.gold.find(x => x.symbol == "IR_GOLD_18K").price);
        usd = Number(d.currency.find(x => x.symbol == "USD").price);

        render();
        calc();

        updateTime.innerText =
            "آخرین بروزرسانی: " +
            new Date().toLocaleTimeString("fa-IR");

    } catch (e) {

        updateTime.innerText = "خطا در دریافت اطلاعات";
        console.error(e);

    }
}


// رندر کارت‌ها
function render() {

    priceGrid.innerHTML = "";

    // طلا
    priceGrid.innerHTML += `
  <div class="mini-item">
    <div class="mini-label">طلای ۱۸</div>
    <div class="mini-price">${gold.toLocaleString()}</div>
  </div>`;

    // دلار
    priceGrid.innerHTML += `
  <div class="mini-item">
    <div class="mini-label">دلار</div>
    <div class="mini-price">${usd.toLocaleString()}</div>
  </div>`;

    // سکه‌ها
    weights.forEach(w => {

        const p = (gold * (w / 1000)) + 140000;

        priceGrid.innerHTML += `
    <div class="mini-item">
      <div class="mini-label">${w} سوت</div>
      <div class="mini-price">${Math.round(p).toLocaleString()}</div>
    </div>`;
    });
}


// محاسبه کل
function calc() {

    let sum = 0;

    weights.forEach(w => {
        const p = (gold * (w / 1000)) + 140000;
        sum += p * (inv[w] || 0);
    });

    sum += dollars * usd;

    grandTotal.innerText =
        Math.round(sum).toLocaleString();
}


// باز/بسته مودال
function toggleModal(show) {

    modal.style.display = show ? "flex" : "none";

    if (show) {

        invList.innerHTML = "";

        // سکه
        weights.forEach(w => {

            invList.innerHTML += `
      <div class="inv-row">
        <span>${w} سوت</span>
        <input type="number"
          value="${inv[w]}"
          oninput="saveInv(${w},this.value)">
      </div>`;
        });

        // دلار
        invList.innerHTML += `
    <div class="inv-row">
      <span>دلار</span>
      <input type="number"
        value="${dollars}"
        oninput="saveUsd(this.value)">
    </div>`;

    } else {

        // بسته شد → فوری حساب کن
        calc();

    }
}


// ذخیره
window.saveInv = function (w, v) {
    inv[w] = parseInt(v) || 0;
    localStorage.setItem("gold_db", JSON.stringify(inv));
}

window.saveUsd = function (v) {
    dollars = parseFloat(v) || 0;
    localStorage.setItem("usd_db", dollars);
}


// رویدادها
openBtn.addEventListener("click", () => toggleModal(true));
saveBtn.addEventListener("click", () => toggleModal(false));


// اجرا
window.addEventListener("load", () => {
    loadData();
    setInterval(loadData, 180000);
});
