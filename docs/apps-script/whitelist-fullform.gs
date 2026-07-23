/**
 * Google Apps Script — Tentaklik Whitelist Full Form (Mendukung Upload Foto KTP)
 *
 * SETUP:
 * 1. Buka Google Drive, buat sebuah folder khusus untuk menyimpan foto KTP.
 * 2. Buka folder tersebut, salin ID folder dari URL-nya.
 *    (Contoh URL: https://drive.google.com/drive/folders/1aBcDeFgHiJ... -> ID-nya adalah "1aBcDeFgHiJ...")
 * 3. Buka Google Sheets untuk menyimpan data form.
 * 4. Buka menu Extensions > Apps Script.
 * 5. Hapus kode bawaan, lalu paste seluruh kode ini.
 * 6. Ubah "ISI_DENGAN_ID_FOLDER_DRIVE_ANDA" dengan ID Folder dari langkah 2.
 * 7. Deploy -> New deployment -> Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 *    - Klik Deploy, setujui akses (Google Sheet & Google Drive), lalu Copy URL.
 * 8. Ganti nilai SHORTFORM_URL di src/components/sections/lp/WhitelistFullForm.astro
 *    menggunakan URL yang baru saja dicopy.
 */

var FOLDER_ID_META = "1vEjrKj7XUokPpaQXLLpDm4hRSAzM5ee1"; 
var FOLDER_ID_GOOGLE = "14f9-CpspfJ3NKolLHg0Bes3xRyBCMt22"; // Folder KTP Google

function doPost(e) {
  try {
    // 1. Parsing data JSON yang dikirim dari Astro
    var data = JSON.parse(e.postData.contents);
    var platform = data.platform || 'meta';
    
    // 2. Tentukan nama tab sheet berdasarkan platform (sesuai nama tab Anda yang huruf kapital)
    var sheetName = platform === 'google' ? 'GOOGLE WHITELIST' : 'META WHITELIST';
    // Buka spreadsheet tempat script ini berada
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(sheetName);
    
    // Jika tab sheet belum ada, buat otomatis
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }

    // Jika sheet kosong (belum ada header), buat header dan rapikan tabel
    if (sheet.getLastRow() === 0) {
      var isGoogle = platform === 'google';
      var headers = isGoogle 
        ? ['No', 'Tanggal', 'Email', 'Website', 'Sosial Media', 'Link KTP', 'URL Asal']
        : ['No', 'Tanggal', 'Website', 'Sosial Media', 'Link KTP', 'URL Asal'];
        
      sheet.appendRow(headers);
      
      // Styling umum untuk header
      var headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight('bold')
                 .setBackground('#FF6B1A')
                 .setFontColor('#FFFFFF')
                 .setHorizontalAlignment('center');
      
      // Lebar kolom umum (No, Tanggal)
      sheet.setColumnWidth(1, 50);  
      sheet.setColumnWidth(2, 160); 
      
      // Lebar kolom spesifik
      if (isGoogle) {
        sheet.setColumnWidth(3, 200); // Email
        sheet.setColumnWidth(4, 180); // Website
        sheet.setColumnWidth(5, 150); // Sosmed
        sheet.setColumnWidth(6, 300); // Link KTP
        sheet.setColumnWidth(7, 200); // URL Asal
      } else {
        sheet.setColumnWidth(3, 180); // Website
        sheet.setColumnWidth(4, 150); // Sosmed
        sheet.setColumnWidth(5, 300); // Link KTP
        sheet.setColumnWidth(6, 200); // URL Asal
      }
      
      sheet.setFrozenRows(1);
    }

    // 3. Simpan foto KTP ke Google Drive
    var fileUrl = "-";
    if (data.fileData && data.fileName && data.mimeType) {
      try {
        var targetFolderId = platform === 'google' ? FOLDER_ID_GOOGLE : FOLDER_ID_META;
        var folder = DriveApp.getFolderById(targetFolderId);
        var decoded = Utilities.base64Decode(data.fileData);
        var blob = Utilities.newBlob(decoded, data.mimeType, data.fileName);
        var file = folder.createFile(blob);
        
        // file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); // dinonaktifkan karena ditolak oleh aturan keamanan Drive
        fileUrl = file.getUrl();
      } catch (driveErr) {
        // Jika Folder ID salah atau tidak ada akses, tetap simpan data teksnya!
        fileUrl = "ERROR DRIVE: " + driveErr.message;
      }
    }
    
    // Hitung nomor urut
    var no = sheet.getLastRow(); // Karena baris 1 adalah header, baris terakhir = nomor urut yang baru

    // 4. Masukkan data ke dalam Spreadsheet sesuai platform
    var rowData = [];
    if (platform === 'google') {
      rowData = [
        no,
        new Date(),
        data.email || '-',
        data.website || '-',
        data.sosmed || '-',
        fileUrl,
        data.source || '-'
      ];
    } else {
      rowData = [
        no,
        new Date(),
        data.website || '-',
        data.sosmed || '-',
        fileUrl,
        data.source || '-'
      ];
    }
    sheet.appendRow(rowData);
    
    // Paksa format kolom A (Nomor) menjadi angka biasa dan kolom B (Tanggal) menjadi format tanggal
    var newRow = sheet.getLastRow();
    sheet.getRange(newRow, 1).setNumberFormat('0');
    sheet.getRange(newRow, 2).setNumberFormat('yyyy-MM-dd HH:mm:ss');
    
    // Kembalikan respons berhasil
    return ContentService
      .createTextOutput(JSON.stringify({ ok: true, sheet: sheetName, fileUrl: fileUrl }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    // Tangkap error jika terjadi masalah
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'Endpoint WhitelistFullForm aktif.' }))
    .setMimeType(ContentService.MimeType.JSON);
}
