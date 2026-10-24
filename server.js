
"use strict";

const express = require("express");
const Database = require("better-sqlite3");
const path = require("node:path");

const app = express();
const PORT = process.env.PORT || 3000;

// Keep the database outside public static files.
const db = new Database(
  path.join(__dirname, "ankhora.db")
);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

app.disable("x-powered-by");
app.use(express.json({ limit: "10kb" }));

// =====================================
// 1. Create database tables
// =====================================

db.exec(`
  CREATE TABLE IF NOT EXISTS artifacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    period TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    visitor_name TEXT NOT NULL,
    visit_date TEXT NOT NULL,
    ticket_type TEXT NOT NULL,
    ticket_count INTEGER NOT NULL,
    total_price INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

// =====================================
// 2. Add sample artifacts only once
// =====================================

const insertArtifact = db.prepare(`
  INSERT OR IGNORE INTO artifacts
    (slug, name, period, description, image_url)
  VALUES (?, ?, ?, ?, ?)
`);

const sampleArtifacts = [
  [
    "tut",
    "قناع توت عنخ آمون",
    "المملكة الحديثة",
    "قناع جنائزي ذهبي شهير من مقبرة توت عنخ آمون.",
    "https://commons.wikimedia.org/wiki/Special:FilePath/Mask%20of%20Tutankhamun.jpg"
  ],
  [
    "narmer",
    "لوحة الملك نعرمر",
    "بدايات الأسرات",
    "لوحة أثرية مهمة لدراسة الفن والرموز الملكية المصرية.",
    "https://commons.wikimedia.org/wiki/Special:FilePath/Narmer%20Palette.jpg"
  ],
  [
    "rosetta",
    "حجر رشيد",
    "العصر البطلمي",
    "حجر يحمل نصوصًا بثلاثة أنظمة كتابية وأسهم في فك الهيروغليفية.",
    "https://commons.wikimedia.org/wiki/Special:FilePath/Rosetta%20Stone.JPG"
  ]
];

const seedArtifacts = db.transaction(() => {
  for (const artifact of sampleArtifacts) {
    insertArtifact.run(...artifact);
  }
});

seedArtifacts();

// =====================================
// 3. API: list artifacts
// =====================================

app.get("/api/artifacts", (req, res) => {
  const artifacts = db.prepare(`
    SELECT id, slug, name, period, description, image_url
    FROM artifacts
    ORDER BY id
  `).all();

  res.json({ success: true, artifacts });
});

// =====================================
// 4. API: get one artifact
// =====================================

app.get("/api/artifacts/:slug", (req, res) => {
  const artifact = db.prepare(`
    SELECT id, slug, name, period, description, image_url
    FROM artifacts
    WHERE slug = ?
  `).get(req.params.slug);

  if (!artifact) {
    return res.status(404).json({
      success: false,
      message: "القطعة الأثرية غير موجودة."
    });
  }

  res.json({ success: true, artifact });
});

// =====================================
// 5. API: create a booking
// =====================================

// Demo prices only; not official museum ticket prices.
const ticketPrices = {
  regular: 200,
  student: 100
};

const insertBooking = db.prepare(`
  INSERT INTO bookings (
    visitor_name,
    visit_date,
    ticket_type,
    ticket_count,
    total_price
  )
  VALUES (?, ?, ?, ?, ?)
`);

app.post("/api/bookings", (req, res) => {
  const body = req.body || {};

  const name =
    typeof body.fullName === "string"
      ? body.fullName.trim()
      : "";

  const date =
    typeof body.visitDate === "string"
      ? body.visitDate
      : "";

  const ticketType = body.ticketType;
  const count = body.ticketCount;

  if (
    name.length < 2 ||
    name.length > 100 ||
    /[\u0000-\u001f\u007f]/.test(name)
  ) {
    return res.status(400).json({
      success: false,
      message: "الاسم يجب أن يكون بين حرفين و100 حرف."
    });
  }

  // Validate a real calendar date in YYYY-MM-DD format.
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);

  if (!dateMatch) {
    return res.status(400).json({
      success: false,
      message: "تاريخ الزيارة غير صحيح."
    });
  }

  const year = Number(dateMatch[1]);
  const month = Number(dateMatch[2]);
  const day = Number(dateMatch[3]);
  const parsedDate = new Date(Date.UTC(year, month - 1, day));

  if (
    parsedDate.getUTCFullYear() !== year ||
    parsedDate.getUTCMonth() !== month - 1 ||
    parsedDate.getUTCDate() !== day
  ) {
    return res.status(400).json({
      success: false,
      message: "تاريخ الزيارة غير موجود في التقويم."
    });
  }

  const now = new Date();
  const today = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0")
  ].join("-");

  if (date < today) {
    return res.status(400).json({
      success: false,
      message: "اختاري تاريخًا اليوم أو بعده."
    });
  }

  if (
    !Object.hasOwn(ticketPrices, ticketType) ||
    !Number.isInteger(count) ||
    count < 1 ||
    count > 10
  ) {
    return res.status(400).json({
      success: false,
      message: "نوع التذكرة أو عدد التذاكر غير صحيح."
    });
  }

  // Calculate the price on the server, not from the browser.
  const totalPrice = ticketPrices[ticketType] * count;

  try {
    const result = insertBooking.run(
      name,
      date,
      ticketType,
      count,
      totalPrice
    );

    return res.status(201).json({
      success: true,
      message: "تم حفظ الحجز التجريبي بنجاح.",
      booking: {
        id: result.lastInsertRowid,
        fullName: name,
        visitDate: date,
        ticketType,
        ticketCount: count,
        totalPrice,
        currency: "EGP",
        status: "demo"
      }
    });
  } catch (error) {
    console.error("Booking save failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "تعذر حفظ الحجز. حاولي مرة أخرى."
    });
  }
});

// =====================================
// 6. Serve the frontend
// =====================================

app.use(express.static(__dirname, {
  index: "index.html"
}));

app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    message: "مسار API غير موجود."
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`ANKHORA is running on port ${PORT}`);
});
