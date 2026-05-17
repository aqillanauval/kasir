// =============================================
// KATEANS - PROFIL (profile.js)
// =============================================

// =============================================
// 1. DATA PROFIL
// Dibaca dari localStorage jika sudah tersimpan,
// jika belum pakai data default
// =============================================
var dataProfil = {
  nama    : 'Aqilla Nauval',
  email   : 'aqilla@student.ub.ac.id',
  telepon : '08123456789',
  toko    : 'Kateans',
  foto    : ''
};

// Baca data profil dari localStorage jika ada
var profilTersimpan = localStorage.getItem('dataProfil');
if (profilTersimpan) {
  dataProfil = JSON.parse(profilTersimpan);
}

// Baca pengaturan dari localStorage
var pengaturan = {
  notif : true,
  suara : false,
  print : false
};

var pengaturanTersimpan = localStorage.getItem('pengaturanAkun');
if (pengaturanTersimpan) {
  pengaturan = JSON.parse(pengaturanTersimpan);
}

// =============================================
// 2. INISIALISASI — isi semua elemen saat halaman dibuka
// =============================================
function inisialisasi() {
  // Isi form informasi pribadi
  document.getElementById('inputNama').value    = dataProfil.nama;
  document.getElementById('inputEmail').value   = dataProfil.email;
  document.getElementById('inputTelepon').value = dataProfil.telepon;
  document.getElementById('inputToko').value    = dataProfil.toko;

  // Isi nama di topbar dan sidebar avatar
  document.getElementById('topbarNama').textContent = dataProfil.nama;
  document.getElementById('profilNama').textContent = dataProfil.nama;

  // Hitung inisial dari nama (contoh: "Aqilla Nauval" → "AN")
  var inisial = hitungInisial(dataProfil.nama);
  document.getElementById('fotoInisial').textContent = inisial;
  document.getElementById('topbarAvatar').textContent = inisial[0];

  // Tampilkan foto jika ada
  if (dataProfil.foto && dataProfil.foto !== '') {
    document.getElementById('fotoImg').src           = dataProfil.foto;
    document.getElementById('fotoImg').style.display  = 'block';
    document.getElementById('fotoInisial').style.display = 'none';
  }

  // Isi pengaturan toggle
  document.getElementById('toggleNotif').checked = pengaturan.notif;
  document.getElementById('toggleSuara').checked = pengaturan.suara;
  document.getElementById('togglePrint').checked = pengaturan.print;

  // Hitung statistik dari localStorage
  hitungStatistik();
}

// =============================================
// 3. HITUNG INISIAL NAMA
// Contoh: "Aqilla Nauval" → "AN"
// =============================================
function hitungInisial(nama) {
  var kata = nama.trim().split(' ');
  if (kata.length === 1) {
    return kata[0][0].toUpperCase();
  }
  return (kata[0][0] + kata[1][0]).toUpperCase();
}

// =============================================
// 4. HITUNG STATISTIK DARI DATA YANG ADA
// Baca dari localStorage pesanan dan menu
// =============================================
function hitungStatistik() {
  // Hitung total pesanan
  var dataPesanan = localStorage.getItem('dataPesanan');
  var pesanan = dataPesanan ? JSON.parse(dataPesanan) : [];
  document.getElementById('statPesanan').textContent = pesanan.length;

  // Hitung pesanan selesai
  var selesai = 0;
  for (var i = 0; i < pesanan.length; i++) {
    if (pesanan[i].status === 'selesai') selesai++;
  }
  document.getElementById('statSelesai').textContent = selesai;

  // Hitung jumlah menu
  var dataMenu = localStorage.getItem('dataMenu');
  var menu = dataMenu ? JSON.parse(dataMenu) : [];
  document.getElementById('statMenu').textContent = menu.length;
}

// =============================================
// 5. MODE EDIT PROFIL
// Toggle antara mode baca dan mode edit
// =============================================
var sedangEdit = false;

// Simpan nilai asli sebelum diedit (untuk tombol Batal)
var nilaiAsli = {};

function toggleEdit() {
  if (!sedangEdit) {
    // Masuk mode edit
    sedangEdit = true;

    // Simpan nilai asli dulu
    nilaiAsli.nama    = document.getElementById('inputNama').value;
    nilaiAsli.email   = document.getElementById('inputEmail').value;
    nilaiAsli.telepon = document.getElementById('inputTelepon').value;
    nilaiAsli.toko    = document.getElementById('inputToko').value;

    // Aktifkan semua input
    document.getElementById('inputNama').disabled    = false;
    document.getElementById('inputEmail').disabled   = false;
    document.getElementById('inputTelepon').disabled = false;
    document.getElementById('inputToko').disabled    = false;

    // Fokus ke input nama
    document.getElementById('inputNama').focus();

    // Ubah tombol edit
    var tombolEdit = document.getElementById('tombolEdit');
    tombolEdit.innerHTML = '<i class="fa-solid fa-pen"></i> Sedang Edit...';
    tombolEdit.classList.add('aktif');

    // Tampilkan tombol Simpan & Batal
    document.getElementById('tombolSimpanWrapper').style.display = 'flex';

  }
}

// =============================================
// 6. BATAL EDIT
// Kembalikan nilai asli dan keluar mode edit
// =============================================
function batalEdit() {
  // Kembalikan nilai asli
  document.getElementById('inputNama').value    = nilaiAsli.nama;
  document.getElementById('inputEmail').value   = nilaiAsli.email;
  document.getElementById('inputTelepon').value = nilaiAsli.telepon;
  document.getElementById('inputToko').value    = nilaiAsli.toko;

  keluarModeEdit();
  tampilkanToast('<i class="fa-solid fa-xmark"></i> Perubahan dibatalkan.');
}

// Helper: nonaktifkan input dan reset tombol
function keluarModeEdit() {
  sedangEdit = false;

  document.getElementById('inputNama').disabled    = true;
  document.getElementById('inputEmail').disabled   = true;
  document.getElementById('inputTelepon').disabled = true;
  document.getElementById('inputToko').disabled    = true;

  var tombolEdit = document.getElementById('tombolEdit');
  tombolEdit.innerHTML = '<i class="fa-regular fa-pen-to-square"></i> Edit';
  tombolEdit.classList.remove('aktif');

  document.getElementById('tombolSimpanWrapper').style.display = 'none';
}

// =============================================
// 7. SIMPAN PROFIL
// Validasi lalu simpan ke localStorage
// =============================================
function simpanProfil() {
  var nama    = document.getElementById('inputNama').value.trim();
  var email   = document.getElementById('inputEmail').value.trim();
  var telepon = document.getElementById('inputTelepon').value.trim();
  var toko    = document.getElementById('inputToko').value.trim();

  // Validasi sederhana
  if (nama === '') {
    tampilkanToast('<i class="fa-solid fa-triangle-exclamation" style="color:rgb(255,212,59);"></i> Nama tidak boleh kosong!');
    document.getElementById('inputNama').focus();
    return;
  }

  if (email === '' || !email.includes('@') || !email.includes('.')) {
    tampilkanToast('<i class="fa-solid fa-triangle-exclamation" style="color:rgb(255,212,59);"></i> Format email tidak valid!');
    document.getElementById('inputEmail').focus();
    return;
  }

  if (telepon === '') {
    tampilkanToast('<i class="fa-solid fa-triangle-exclamation" style="color:rgb(255,212,59);"></i> Nomor telepon tidak boleh kosong!');
    document.getElementById('inputTelepon').focus();
    return;
  }

  // Simpan ke objek dan localStorage
  dataProfil.nama    = nama;
  dataProfil.email   = email;
  dataProfil.telepon = telepon;
  dataProfil.toko    = toko || 'Kateans';

  localStorage.setItem('dataProfil', JSON.stringify(dataProfil));

  // Perbarui tampilan nama di halaman
  document.getElementById('profilNama').textContent = nama;
  document.getElementById('topbarNama').textContent = nama;

  // Perbarui inisial
  var inisial = hitungInisial(nama);
  document.getElementById('fotoInisial').textContent  = inisial;
  document.getElementById('topbarAvatar').textContent = inisial[0];

  keluarModeEdit();
  tampilkanToast('<i class="fa-regular fa-circle-check" style="color:rgb(99,230,190);"></i> Profil berhasil disimpan!');
}

// =============================================
// 8. GANTI FOTO PROFIL
// =============================================
function gantiFoto(input) {
  var file = input.files[0];
  if (!file) return;

  // Validasi hanya gambar
  if (!file.type.startsWith('image/')) {
    tampilkanToast('<i class="fa-solid fa-triangle-exclamation" style="color:rgb(255,212,59);"></i> File harus berupa gambar!');
    return;
  }

  // Validasi ukuran file (maks 2MB)
  if (file.size > 2 * 1024 * 1024) {
    tampilkanToast('<i class="fa-solid fa-triangle-exclamation" style="color:rgb(255,212,59);"></i> Ukuran foto maksimal 2MB!');
    return;
  }

  var reader = new FileReader();
  reader.onload = function (e) {
    // Tampilkan foto
    var fotoImg    = document.getElementById('fotoImg');
    var fotoInisial = document.getElementById('fotoInisial');

    fotoImg.src           = e.target.result;
    fotoImg.style.display = 'block';
    fotoInisial.style.display = 'none';

    // Simpan ke localStorage
    dataProfil.foto = e.target.result;
    localStorage.setItem('dataProfil', JSON.stringify(dataProfil));

    tampilkanToast('<i class="fa-regular fa-circle-check" style="color:rgb(99,230,190);"></i> Foto profil berhasil diperbarui!');
  };
  reader.readAsDataURL(file);
}

// =============================================
// 9. GANTI PASSWORD
// =============================================
function gantiPassword() {
  var passLama    = document.getElementById('inputPassLama').value;
  var passBaru    = document.getElementById('inputPassBaru').value;
  var passKonfirm = document.getElementById('inputPassKonfirm').value;

  // Reset pesan error dulu
  sembunyikanError('errPassLama');
  sembunyikanError('errPassBaru');
  sembunyikanError('errPassKonfirm');

  var valid = true;

  // Validasi password lama (simulasi: minimal harus diisi)
  if (passLama === '') {
    tampilkanError('errPassLama', 'Kata sandi lama tidak boleh kosong.');
    valid = false;
  }

  // Validasi password baru minimal 6 karakter
  if (passBaru === '') {
    tampilkanError('errPassBaru', 'Kata sandi baru tidak boleh kosong.');
    valid = false;
  } else if (passBaru.length < 6) {
    tampilkanError('errPassBaru', 'Kata sandi baru minimal 6 karakter.');
    valid = false;
  }

  // Validasi konfirmasi harus sama
  if (passKonfirm === '') {
    tampilkanError('errPassKonfirm', 'Konfirmasi kata sandi tidak boleh kosong.');
    valid = false;
  } else if (passKonfirm !== passBaru) {
    tampilkanError('errPassKonfirm', 'Kata sandi tidak cocok.');
    valid = false;
  }

  if (!valid) return;

  // Kosongkan semua input password setelah berhasil
  document.getElementById('inputPassLama').value    = '';
  document.getElementById('inputPassBaru').value    = '';
  document.getElementById('inputPassKonfirm').value = '';

  tampilkanToast('<i class="fa-regular fa-circle-check" style="color:rgb(99,230,190);"></i> Kata sandi berhasil diperbarui!');
}

// =============================================
// 10. TOGGLE LIHAT / SEMBUNYIKAN PASSWORD
// =============================================
function lihatSandi(idInput, tombol) {
  var input = document.getElementById(idInput);
  var sedangSembunyi = input.type === 'password';

  input.type = sedangSembunyi ? 'text' : 'password';
  tombol.innerHTML = sedangSembunyi
    ? '<i class="fa-regular fa-eye-slash"></i>'
    : '<i class="fa-regular fa-eye"></i>';
}

// =============================================
// 11. SIMPAN PENGATURAN
// Dipanggil setiap kali toggle berubah
// =============================================
function simpanPengaturan() {
  pengaturan.notif = document.getElementById('toggleNotif').checked;
  pengaturan.suara = document.getElementById('toggleSuara').checked;
  pengaturan.print = document.getElementById('togglePrint').checked;

  localStorage.setItem('pengaturanAkun', JSON.stringify(pengaturan));

  // Tampilkan pesan sesuai toggle yang berubah
  var pesan = '<i class="fa-regular fa-circle-check" style="color:rgb(99,230,190);"></i> Pengaturan disimpan.';
  tampilkanToast(pesan);
}

// =============================================
// 12. KELUAR AKUN
// =============================================
function keluarAkun() {
  var yakin = confirm('Yakin ingin keluar dari akun?');
  if (!yakin) return;

  tampilkanToast('<i class="fa-solid fa-right-from-bracket"></i> Sampai jumpa!');

  // Arahkan ke halaman login setelah 1.5 detik
  setTimeout(function () {
    window.location.href = 'index.html';
  }, 1500);
}

// =============================================
// 13. FUNGSI PEMBANTU
// =============================================

// Tampilkan pesan error di bawah input
function tampilkanError(idElemen, pesan) {
  var el = document.getElementById(idElemen);
  if (!el) return;
  el.textContent   = pesan;
  el.style.display = 'block';
}

// Sembunyikan pesan error
function sembunyikanError(idElemen) {
  var el = document.getElementById(idElemen);
  if (!el) return;
  el.style.display = 'none';
}

// Tampilkan toast notifikasi
function tampilkanToast(pesan) {
  var toast = document.getElementById('toast');
  toast.innerHTML = pesan;
  toast.classList.add('show');

  setTimeout(function () {
    toast.classList.remove('show');
  }, 2500);
}

// =============================================
// 14. JALANKAN INISIALISASI SAAT HALAMAN DIBUKA
// =============================================
inisialisasi();