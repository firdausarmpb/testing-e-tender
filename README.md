# 🏛️ BID NEXT — Media Prima eTender Intelligence Platform

[![Live Demo](https://img.shields.io/badge/Akses_Terus-etendermediaprima.ai.studio-0037B0?style=for-the-badge&logo=googlechrome&logoColor=white)](https://etendermediaprima.ai.studio/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38B2D8?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Audit Compliance](https://img.shields.io/badge/Standard-ISO_27001_Compliant-006C4A)](https://www.iso.org/isoiec-27001-information-security.html)

> 🚀 **Cuba Aplikasi Ini Secara Langsung (Live Demo)**:  
> **[https://etendermediaprima.ai.studio/](https://etendermediaprima.ai.studio/)**  
> *(Boleh diakses terus di pelayar web tanpa perlu install apa-apa)*

---

## 📌 Apa Itu BID NEXT?

**BID NEXT** adalah sistem perolehan digital (*eTender & Procurement*) gred perusahaan yang direka khas untuk **Media Prima Berhad**. 

Sistem ini memastikan setiap proses perolehan tender dilaksanakan secara **telus, patuh audit (audit-compliant), dan bebas daripada kebocoran maklumat harga**.

### 💡 Masalah Yang Diselesaikan
* **Isu Tender Tradisional**: Kebocoran harga bidaan sebelum penilaian teknikal selesai, borang tender manual yang lambat dikira, dan ketiadaan jejak audit (*audit trail*) yang boleh disahkan integritinya.
* **Penyelesaian BID NEXT**: 
  1. **Protokol 2 Sampul (Two-Envelope Sealed Bidding)** — Harga pembida dikunci ketat secara kriptografi dan hanya boleh dibuka selepas Audit Dalaman mengesahkan dokumen teknikal.
  2. **Audit Kriptografi SHA-256** — Setiap penyerahan tender menjana cap jari digital (*hash*) yang mustahil diubah suai.
  3. **Penilaian Automatik 70:30** — Sistem mengira perbezaan bajet Capex, SST 6%, dan markah gabungan (70% Teknikal : 30% Komersial) secara automatik dalam masa nyata!

---

## 👥 4 Peranan Utama & Fungsi Dalam Aplikasi

Aplikasi ini dilengkapi dengan **Role Switcher** di menu atas supaya anda boleh menguji sistem melalui 4 perspektif berbeza:

| Peranan (*Role*) | Siapa Pengguna? | Fungsi Utama Dalam Sistem |
|---|---|---|
| 🏢 **Vendor / Pembida** | Syarikat pembida (contoh: *Syarikat ABC Sdn Bhd*) | • Menandatangani **Digital NDA** secara sah sebelum melihat dokumen RFP.<br>• Memuat turun spesifikasi teknikal & lukisan reka bentuk.<br>• Mengisi **Bill of Quantities (BOQ)** dengan kiraan SST 6% automatik.<br>• Menghantar **Sampul A (Teknikal)** & **Sampul B (Komersial)**. |
| 🛡️ **Tadbir Urus & Audit** | Bahagian Audit Dalaman (*Group Internal Audit*) | • Membuka dan mengesahkan dokumen teknikal (SSM & CIDB) dalam **Sampul A**.<br>• Memeriksa integriti cap jari SHA-256 bagi memastikan dokumen tidak diusik.<br>• Mengesahkan pelepasan (*Audit Clearance*) untuk **menyahkunci Sampul B (Harga)**. |
| 📋 **Procurement Admin** | Jabatan Perolehan Kumpulan (*Media Prima Procurement*) | • Menerbitkan tender baru & menjemput vendor yang layak.<br>• Membuka **Commercial Matrix** untuk membandingkan semua tawaran harga.<br>• Melihat analisis varians bajet Capex dan cadangan pemenang (Rank 1).<br>• Menjana laporan mesyuarat lembaga tender (*Tender Board Dossier*) & eksport Excel (CSV). |
| 💼 **Pemohon Dalaman (Requester)** | Jabatan Pemohon (cth: *Kejuruteraan / Operasi Siaran*) | • Menghantar Borang Permohonan Tender (*Tender Requisition Form - TRF*).<br>• Menjawab soalan teknikal daripada pembida di **Clarification Desk**. |

---

## 🔄 Aliran Proses Tender (Langkah Demi Langkah)

```
[1. Terbit Tender] ──> [2. Vendor Tandatangan NDA] ──> [3. Buka Dokumen RFP]
                                                              │
                                                              ▼
[6. Nyahkunci Sampul B] <── [5. Audit Semak Sampul A] <── [4. Hantar 2 Sampul]
         │
         ▼
[7. Matriks Penilaian 70:30] ──> [8. Cadangan Pemenang Lembaga Tender]
```

1. **Penerbitan Tender**: Pasukan Procurement menerbitkan tender lengkap dengan bajet Capex yang diluluskan dan senarai item BOQ.
2. **Pintu Masuk NDA Digital**: Vendor tidak dibenarkan melihat atau memuat turun dokumen rahsia sehingga melengkapkan tandatangan digital NDA (merekodkan Nama, No. KP/Passport, Tarikh & Alamat IP).
3. **Meja Penjelasan (Clarification Desk)**: Pembida boleh mengemukakan soalan teknikal atau komersial. Jawapan rasmi diedarkan kepada semua pembida secara serentak untuk memastikan keadilan.
4. **Penyerahan 2 Sampul Tertutup (Two-Envelope Submission)**:
   - **Sampul A (Teknikal & Berkanun)**: Pendaftaran SSM, Gred CIDB (G1-G7), sijil MOF, dan cadangan teknikal.
   - **Sampul B (Komersial)**: Pecahan harga BOQ berserta pengiraan automatik Cukai Jualan & Perkhidmatan (SST 6%).
5. **Pemeriksaan & Pengesahan Audit**: Pegawai Audit Dalaman menyemak kelayakan Sampul A dan mengesahkan kod keselamatan hash SHA-256.
6. **Pembukaan Sampul Komersial**: Hanya vendor yang lulus saringan audit teknikal sahaja akan dibuka sampul harganya.
7. **Matriks Komersial & Formula Skor 70:30**:
   - **Skor Teknikal (70%)**: Dinilai berasaskan spesifikasi, rekod lampau, dan tahap SLA.
   - **Skor Komersial (30%)**: Dikira secara algoritma penanda aras harga terendah patuh spesifikasi.
8. **Eksport Laporan Rasmi**: Eksport terus data ke format Microsoft Excel (CSV) dan cetak fail rumusan perakuan (*Tender Board Dossier*) untuk mesyuarat pengurusan.

---

## ✨ Ciri-Ciri Utama Sistem

* 🔒 **Two-Envelope Blind Bidding**: Menghalang sebarang cubaan melihat harga pembida sebelum penilaian teknikal ditutup secara rasmi.
* 🛡️ **Cryptographic Tamper-Evident SHA-256**: Mengesan serta-merta jika terdapat percubaan mengubah fail tender selepas tarikh tutup.
* ✍️ **Digital NDA Gatekeeping**: Perlindungan undang-undang terhadap blueprint arkitek dan spesifikasi hak cipta Media Prima.
* 📊 **Smart BOQ & SST 6% Engine**: Tiada lagi kesilapan manual kiraan matematik atau cukai.
* 📈 **Titan Commercial Matrix**: Paparan perbandingan sebelah-menyebelah (*side-by-side*) antara vendor dengan peratusan varians bajet Capex.
* 📄 **Laporan Sedia Cetak & CSV**: Format rasmi lengkap dengan ruangan tandatangan Jawatankuasa Penilaian.

---

## 🛠️ Teknologi Yang Digunakan

* **Frontend**: React 19, TypeScript, Vite 8
* **Styling**: Tailwind CSS v4 & Media Prima Design System
* **Ikon & Tipografi**: Lucide React, Phosphor Icons, Inter & JetBrains Mono
* **Animasi**: Motion (Framer Motion v12)
* **Penyimpanan & Backend**: Firebase Firestore & Express / Node.js
* **Keselamatan Kriptografi**: Web Crypto API (SHA-256 Hashing)

---

## 💻 Panduan Menjalankan Projek di Komputer Sendiri (Local Setup)

Jika anda ingin menjalankan projek ini di komputer anda:

### 1. Keperluan Sistem
* **Node.js**: Versi 18 ke atas (Node 20+ disyorkan)
* **npm** atau pengurus pakej pilihan anda

### 2. Muat Turun & Pasang Pakej
```bash
# Clone repositori
git clone https://github.com/firdausarmpb/testing-e-tender.git

# Masuk ke direktori projek
cd testing-e-tender

# Pasang semua dependencies
npm install
```

### 3. Konfigurasi Environment
Salin fail konfigurasi:
```bash
cp .env.example .env
```

### 4. Jalankan Aplikasi
```bash
npm run dev
```
Buka pelayar web anda di: **`http://localhost:3000`**

### 5. Semakan Kod & Build Pengeluaran
```bash
# Semakan jenis TypeScript
npm run lint

# Build fail pengeluaran
npm run build
```

---

## 🌐 Pautan Pantas

* 🔗 **Aplikasi Live**: [https://etendermediaprima.ai.studio/](https://etendermediaprima.ai.studio/)
* 🏢 **Organisasi**: Media Prima Berhad — Bahagian Perolehan & Audit Dalaman
* 📜 **Pematuhan**: Akta Syarikat (SSM), CIDB Malaysia, SST Kastam Diraja Malaysia, ISO 27001
