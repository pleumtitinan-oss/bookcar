# ระบบจองรถราชการ - GitHub Pages

ชุดไฟล์นี้พร้อมอัปโหลดขึ้น GitHub Pages ได้ทันที

## ไฟล์ที่ต้องอัปโหลด

- `index.html`
- `styles.css`
- `app.js`
- `assets/nso-logo.jpg`
- `.nojekyll`

## การใช้งาน

1. สร้าง repository บน GitHub
2. อัปโหลดไฟล์ทั้งหมดในโฟลเดอร์นี้ไปไว้ที่ root ของ repository
3. ไปที่ `Settings` > `Pages`
4. เลือก `Deploy from a branch`
5. เลือก branch `main` และ folder `/root`

## API ที่เชื่อมต่ออยู่

Frontend เชื่อมกับ Google Apps Script API นี้:

```txt
https://script.google.com/macros/s/AKfycbzqDKTRZFJZTGNtDR-JpcKGHoxaM16IGuLk95VWxoa93j3r9bb9qkakZ-VjK3WRvLhz/exec
```

ถ้า deploy Apps Script ใหม่ ให้แก้ค่า `API_BASE_URL` ใน `app.js`

## บัญชีทดสอบ

- `admin` / `Scout@2026`
- `user` / `Scout@2026`
- `approver` / `Scout@2026`

ควรเปลี่ยนรหัสจริงในชีต `Users` หลังทดสอบเสร็จ
