# ระบบจองรถราชการ Frontend

โฟลเดอร์นี้เป็นหน้าเว็บ static สำหรับอัปโหลดขึ้น GitHub Pages ของสำนักงานลูกเสือแห่งชาติ

## ไฟล์ที่ใช้สำหรับ GitHub Pages

- `index.html` โครงสร้างหน้าเว็บ
- `styles.css` หน้าตาและ responsive layout
- `app.js` การเรียก Apps Script API, login จากชีต Users, SVG icons และ logic ของระบบ

## การตั้งค่า API

ใน `app.js` มีตัวแปร:

```js
const API_BASE_URL = 'https://script.google.com/macros/s/AKfycbzqDKTRZFJZTGNtDR-JpcKGHoxaM16IGuLk95VWxoa93j3r9bb9qkakZ-VjK3WRvLhz/exec';
```

ถ้า deploy Apps Script ใหม่ด้วย URL ใหม่ ให้แก้ค่านี้เป็น URL `/exec` ล่าสุด

## API ที่ frontend ใช้

- `getDashboardData`
- `createBooking`
- `getBookingByContact`

หน้าเว็บใช้ JSONP เพื่อให้ทำงานจาก GitHub Pages ได้โดยไม่ติด CORS ของ Google Apps Script

## หน้าที่มีในระบบ

- Login ผู้ใช้งาน / ผู้ดูแลระบบ
- Dashboard
- จองรถ
- รายการจองของฉัน
- ปฏิทินการใช้รถ
- รายการรถ
- อนุมัติการจอง
- รายงาน
- ตั้งค่าระบบ

## สิทธิ์การใช้งาน

- ผู้ใช้งานทั่วไป: login ด้วยบัญชีในชีต `Users`, ดู dashboard, จองรถ, ติดตามรายการจอง, ดูปฏิทิน และดูรายการรถ
- ผู้ดูแลระบบ: login ด้วยบัญชี role `admin` ในชีต `Users`, ใช้เมนูอนุมัติ รายงาน ตั้งค่าระบบ เพิ่ม/แก้ไข/ลบข้อมูลรถ และเพิ่ม/แก้ไข/ลบผู้ใช้

บัญชีผู้ใช้งานทั้งหมดจัดการในชีต `Users`

รหัสผู้ดูแลระบบสำรองอ้างอิงจากค่า `AdminPassword` ใน Google Sheets ผ่าน Apps Script API

บัญชีทดสอบหลังเรียก API `resetTestPasswords`:

- `admin` / `Scout@2026`
- `user` / `Scout@2026`
- `approver` / `Scout@2026`

ใช้เฉพาะช่วงทดสอบระบบ แล้วเปลี่ยนรหัสจริงในหน้า `ตั้งค่าระบบ` หรือชีต `Users`

## การทดสอบล่าสุด

- โหลดข้อมูลจาก Apps Script API ได้
- ส่งคำขอจองรถทดสอบได้สำเร็จ
- รายการจองใหม่ขึ้นสถานะ `รออนุมัติ`
- หน้า desktop แสดง sidebar และ dashboard ตามแนว UI สำนักงานลูกเสือแห่งชาติ
- หน้า login แสดงก่อนใช้งาน
- ผู้ใช้งานทั่วไป login แล้วเมนู admin ถูกซ่อน
- Apps Script API ยืนยัน `userLogin`, `adminLogin`, `getUsers`, `getSettings`, และ admin actions ได้
- ไอคอน SVG โหลดจาก `app.js` โดยไม่ต้องพึ่ง FontAwesome อย่างเดียว
- ระบบใช้ SweetAlert/SweetAlert fallback สำหรับ popup, ยืนยัน, แจ้งเตือน และ validation
- รูปรถในชีต `Vehicles.ImageUrl` ต้องเป็น URL ที่เปิด public ได้จริง ถ้า URL ถูกบล็อกเช่นบางโดเมนที่คืน 403 ระบบจะไม่โหลดรูปและแสดงไอคอนรถแทน
