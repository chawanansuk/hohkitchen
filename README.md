# House of Happiness Kitchen

เว็บสั่งอาหารแบบจัดสำรับเอง (build-your-own curry rice)
พร้อมหมวด **ของที่ระลึก** (ยาดม / ยาหม่อง สไตล์โป๊ยเซียน)

เว็บไซต์เป็นไฟล์เดียวจบ (`index.html`) ไม่มีขั้นตอน build — เปิดไฟล์หรือโฮสต์ได้เลย

## ฟีเจอร์ / Features

- **จัดสำรับ 4 ขั้นตอน** — เลือกแกง → ผัก → ข้าว → ปรับความเผ็ด & ของเพิ่ม
- **หมวดของที่ระลึก** — ยาดมโป๊ยเซียน มาร์คทู, ยาดมน้ำ 2-in-1, ยาหม่องน้ำ, ยาหม่องตลับกลม, เซ็ตของฝาก
  (ภาพประกอบสินค้าวาดด้วย SVG ทั้งหมด)
- **ตะกร้ารวม** ทั้งมื้ออาหารและของที่ระลึก พร้อมปรับจำนวน / แก้ไข / ลบ
- **สองภาษา** ไทย / English สลับได้ทันที
- **ชำระเงินพร้อมเพย์** — สร้าง QR PromptPay ตามยอดอัตโนมัติ (มาตรฐาน EMVCo + CRC-16)
- **ส่งออเดอร์** ผ่าน WhatsApp / LINE / คัดลอกข้อความ
- ดีไซน์ luxury เขียวมรกต–ทอง, แบรนด์ House of Happiness Kitchen (โลโก้ศาลาไทย),
  ฟอนต์ Cinzel + Pinyon Script + Trirong + Noto Sans Thai
- **ติดตั้งเป็นแอป (PWA)** + ใช้งานออฟไลน์ได้ (service worker) + ไอคอนลงจอโฮม
- **จำตะกร้าอัตโนมัติ** (ไม่หายเมื่อรีเฟรช/ปิดแอป) + เลือกภาษาตามเบราว์เซอร์ครั้งแรก
- **หน้า "ส่งออเดอร์สำเร็จ"** พร้อมเลขอ้างอิง + ปุ่มเริ่มออเดอร์ใหม่
- **เลย์เอาต์เดสก์ท็อป** (เรลกลางจอแบบพรีเมียม) + รูป responsive (srcset) + การ์ดแชร์ (og:image)
- **SEO** structured data (schema.org Restaurant) + sitemap/robots
- เข้าถึงง่าย (a11y: aria-live, จัดโฟกัส, focus-visible) และเคารพ `prefers-reduced-motion`

## ตั้งค่าร้าน / Configuration

แก้ค่าได้ในออบเจ็กต์ `CONFIG` ที่ต้นสคริปต์ใน `index.html`:

| คีย์ | ความหมาย |
|------|----------|
| `promptpayId`   | เบอร์พร้อมเพย์ / เลขบัตรประชาชนของร้าน |
| `whatsappPhone` | เบอร์ WhatsApp (รหัสประเทศ ไม่มี +) เช่น `66812345678` |
| `lineId`        | LINE official id (แสดงในส่วนท้าย) |
| `defaultLang`   | ภาษาเริ่มต้น `th` หรือ `en` |
| `hoursTh` / `hoursEn` | เวลาเปิด–ปิด |
| `souvenirSource` | ดึงสินค้า "ของที่ระลึก" จากร้าน Shopify (ค่าเริ่มต้น `mowaan.com`) มาแสดงสด — โหลดฝั่งเบราว์เซอร์ลูกค้าผ่าน `products.json` ถ้าร้านบล็อก cross-origin จะใช้ภาพวาดในตัวแทนอัตโนมัติ · ตั้ง `null` เพื่อปิด |
| `orderWebhook` | (ตัวเลือก) URL สำหรับเก็บออเดอร์อัตโนมัติ เช่น Google Apps Script / Formspree / serverless — เว้นว่าง = ปิด |
| `plausibleDomain` | (ตัวเลือก) โดเมน analytics แบบเคารพความเป็นส่วนตัว (Plausible) — เว้นว่าง = ปิด |

ไฟล์ประกอบ: `manifest.webmanifest`, `sw.js` (service worker), `qrcode.min.js`, `icon-192/512.png`, `og.png`, `sitemap.xml`, `robots.txt` — ต้องอยู่โฟลเดอร์เดียวกับ `index.html`

เมนู / ราคา / ของที่ระลึก แก้ได้ที่ array `STEPS`, `EXTRAS`, `SOUVENIRS`

> รูปของที่ระลึกดึงสดจากร้าน Mowaan เป็น "ตัวอย่าง" หากนำไปขายจริงควรใช้รูป/สินค้า
> ของร้านเอง หรือได้รับอนุญาตจากเจ้าของแบรนด์ก่อน

## การใช้งาน / Run & deploy

เปิด `index.html` ในเบราว์เซอร์ได้เลย หรือโฮสต์ผ่าน GitHub Pages:
ไปที่ **Settings → Pages → Deploy from branch** แล้วเลือก branch + `/ (root)`

> หมายเหตุ: ภาพถ่ายอาหารโหลดจาก Wix CDN ของร้าน หากภาพใดโหลดไม่ได้
> ระบบจะแสดงภาพประกอบ SVG ที่วาดไว้แทนโดยอัตโนมัติ

## เก็บออเดอร์เข้า Google Sheet อัตโนมัติ (ฟรี ไม่ต้องมีเซิร์ฟเวอร์)

เมื่อลูกค้ากดส่งออเดอร์ (WhatsApp / LINE / คัดลอก) เว็บจะส่งข้อมูลไปลงชีตให้อัตโนมัติ
พร้อม "เลขอ้างอิง" เดียวกับที่อยู่ในข้อความออเดอร์ (ส่งซ้ำหลายช่องทาง = อัปเดตแถวเดิม ไม่ซ้ำ)

1. สร้าง Google Sheet ใหม่ (พิมพ์ `sheets.new`)
2. เมนู **Extensions → Apps Script** → ลบโค้ดตัวอย่าง → วางไฟล์ [`tools/orders.gs`](tools/orders.gs) → Save
3. **Deploy → New deployment → Web app**
   - Execute as: **Me**
   - Who has access: **Anyone** → Deploy → กด Authorize อนุญาตสิทธิ์
4. คัดลอก **Web app URL** (ลงท้าย `/exec`)
5. ใน `index.html` ตั้งค่า `CONFIG.orderWebhook = 'วาง URL /exec ที่นี่'` แล้ว commit/push

ทดสอบ: เปิด URL `/exec` ในเบราว์เซอร์ ต้องขึ้น `{"ok":true,...}` — จากนั้นลองสั่งจริง 1 ออเดอร์ แถวจะเด้งเข้าชีตทันที
คอลัมน์: เวลา · เลขอ้างอิง · ช่องทาง · ชื่อ · ห้อง/โต๊ะ · เวลารับ · ยอดรวม · หมายเหตุ · รายการ · ภาษา

> ทางเลือกอื่นแทน Apps Script: Formspree / SheetDB / serverless ใดก็ได้ที่รับ POST (JSON ใน body) —
> ใส่ URL ที่ `CONFIG.orderWebhook` ได้เหมือนกัน · เว้นว่าง = ปิดระบบนี้
