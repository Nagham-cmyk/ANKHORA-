
"use strict";

// ================================
// 1. Mobile Navigation
// ================================

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

menuToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});


// ================================
// 2. Artifact Information
// ================================

const artifacts = {
  tut: {
    title: "قناع توت عنخ آمون",
    text:
      "عُثر على القناع ضمن محتويات مقبرة توت عنخ آمون " +
      "في وادي الملوك سنة 1922. وهو من أشهر القطع الجنائزية " +
      "المصرية القديمة، ويُظهر براعة الصياغة والفن في عصر الدولة الحديثة."
  },

  narmer: {
    title: "لوحة الملك نعرمر",
    text:
      "لوحة حجرية من بدايات الأسرات المصرية، تُظهر الملك " +
      "نعرمر في مشاهد ملكية رمزية. وهي مصدر مهم لدراسة " +
      "الفن والسلطة والرموز السياسية في مصر القديمة."
  },

  rosetta: {
    title: "حجر رشيد",
    text:
      "عُثر على حجر رشيد سنة 1799. ويحمل نصًا مكتوبًا " +
      "بالهيروغليفية والديموطيقية واليونانية القديمة. " +
      "ساعدت مقارنة النصوص على فك رموز الهيروغليفية."
  }
};

const artifactDialog = document.getElementById("artifactDialog");
const dialogTitle = document.getElementById("dialogTitle");
const dialogText = document.getElementById("dialogText");

document.querySelectorAll("[data-artifact]").forEach((button) => {
  button.addEventListener("click", () => {
    const artifact = artifacts[button.dataset.artifact];

    if (!artifact) return;

    dialogTitle.textContent = artifact.title;
    dialogText.textContent = artifact.text;
    artifactDialog.showModal();
  });
});

document.getElementById("closeDialog").addEventListener("click", () => {
  artifactDialog.close();
});


// ================================
// 3. Hieroglyphic Name Game
// ================================

// This is a playful visual mapping, NOT an authentic
// ancient Egyptian alphabet or scholarly transliteration.

const signMap = {
  A: "𓄿",
  B: "𓃀",
  C: "𓎡",
  D: "𓂧",
  E: "𓇋",
  F: "𓆑",
  G: "𓎼",
  H: "𓉔",
  I: "𓇋",
  J: "𓆓",
  K: "𓎡",
  L: "𓃭",
  M: "𓅓",
  N: "𓈖",
  O: "𓅱",
  P: "𓊪",
  Q: "𓎡",
  R: "𓂋",
  S: "𓋴",
  T: "𓏏",
  U: "𓅱",
  V: "𓆑",
  W: "𓅱",
  X: "𓎡𓋴",
  Y: "𓇋",
  Z: "𓊃"
};

const nameForm = document.getElementById("nameForm");
const visitorName = document.getElementById("visitorName");
const nameResult = document.getElementById("nameResult");
const cartouche = document.getElementById("cartouche");
const nameExplanation = document.getElementById("nameExplanation");
const downloadName = document.getElementById("downloadName");

let currentName = "";
let currentSigns = [];

nameForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = visitorName.value.trim().toUpperCase();

  if (!name) {
    visitorName.focus();
    return;
  }

  if (!/^[A-Z ]+$/.test(name)) {
    nameExplanation.textContent =
      "اكتبي الاسم بحروف إنجليزية فقط في هذه النسخة التجريبية.";
    nameResult.hidden = false;
    cartouche.textContent = "";
    return;
  }

  currentName = name;

  // Convert each letter to a decorative sign.
  currentSigns = name
    .replace(/\s+/g, "")
    .split("")
    .map((letter) => signMap[letter] || "𓂀");

  cartouche.textContent = currentSigns.join(" ");

  nameExplanation.textContent =
    "هذا تصميم رمزي ترفيهي. الرموز لا تمثل بالضرورة " +
    "النطق التاريخي الدقيق لاسمك.";

  nameResult.hidden = false;
});


// Download the decorative result as an SVG image.
downloadName.addEventListener("click", () => {
  if (!currentName || currentSigns.length === 0) return;

  const safeSigns = currentSigns
    .map((sign) => sign)
    .join(" ");

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg"
      width="900" height="400" viewBox="0 0 900 400">
      <rect width="900" height="400" fill="#10110f"/>
      <rect x="35" y="35" width="830" height="330"
        rx="150" fill="none" stroke="#d4af37" stroke-width="8"/>
      <text x="450" y="105" text-anchor="middle"
        font-family="sans-serif" font-size="25"
        fill="#d4af37">ANKHORA</text>
      <text x="450" y="165" text-anchor="middle"
        font-family="sans-serif" font-size="22"
        fill="#e8dec6">${currentName}</text>
      <text x="450" y="260" text-anchor="middle"
        font-family="serif" font-size="54"
        fill="#f0d989">${safeSigns}</text>
      <text x="450" y="320" text-anchor="middle"
        font-family="sans-serif" font-size="16"
        fill="#a9b18b">Decorative educational design</text>
    </svg>`;

  const blob = new Blob([svg], {
    type: "image/svg+xml;charset=utf-8"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "ANKHORA-name.svg";

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
});


// ================================
// 4. Experimental Ticket Booking
// ================================

const bookingForm = document.getElementById("bookingForm");
const visitDate = document.getElementById("visitDate");
const ticketType = document.getElementById("ticketType");
const ticketCount = document.getElementById("ticketCount");
const totalPrice = document.getElementById("totalPrice");
const bookingResult = document.getElementById("bookingResult");

// Set the minimum date to today's local date.
const today = new Date();
const localToday =
  today.getFullYear() + "-" +
  String(today.getMonth() + 1).padStart(2, "0") + "-" +
  String(today.getDate()).padStart(2, "0");

visitDate.min = localToday;

function calculatePrice() {
  const prices = {
    regular: 200,
    student: 100
  };

  const count = Number(ticketCount.value);
  const validCount = Number.isInteger(count) && count >= 1 && count <= 10;

  if (!validCount) {
    totalPrice.textContent = "أدخلي عددًا من 1 إلى 10";
    return;
  }

  const price = prices[ticketType.value] * count;
  totalPrice.textContent = price + " جنيه";
}

ticketType.addEventListener("change", calculatePrice);
ticketCount.addEventListener("input", calculatePrice);

bookingForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const fullName = document.getElementById("fullName").value.trim();
  const selectedDate = visitDate.value;
  const count = Number(ticketCount.value);

  if (!fullName || !selectedDate) {
    bookingResult.hidden = false;
    bookingResult.textContent = "من فضلك املئي جميع البيانات.";
    return;
  }

  if (selectedDate < localToday) {
    bookingResult.hidden = false;
    bookingResult.textContent = "اختاري تاريخًا اليوم أو بعده.";
    visitDate.focus();
    return;
  }

  if (!Number.isInteger(count) || count < 1 || count > 10) {
    bookingResult.hidden = false;
    bookingResult.textContent = "عدد التذاكر يجب أن يكون من 1 إلى 10.";
    ticketCount.focus();
    return;
  }

  const prices = {
    regular: 200,
    student: 100
  };

  const price = prices[ticketType.value] * count;

  // Demo only: this does not create a real reservation.
  bookingResult.hidden = false;
  bookingResult.replaceChildren();

  const heading = document.createElement("h3");
  heading.textContent = "تم إنشاء معاينة الحجز التجريبي";

  const nameLine = document.createElement("p");
  nameLine.textContent = "الاسم: " + fullName;

  const dateLine = document.createElement("p");
  dateLine.textContent = "تاريخ الزيارة: " + selectedDate;

  const countLine = document.createElement("p");
  countLine.textContent = "عدد التذاكر: " + count;

  const priceLine = document.createElement("p");
  priceLine.textContent = "الإجمالي التجريبي: " + price + " جنيه";

  const note = document.createElement("p");
  note.textContent =
    "هذه معاينة فقط. لم يتم حفظ الحجز على خادم أو إصدار تذكرة رسمية.";

  bookingResult.append(
    heading,
    nameLine,
    dateLine,
    countLine,
    priceLine,
    note
  );

  bookingResult.scrollIntoView({
    behavior: "smooth",
    block: "nearest"
  });
});

calculatePrice();
