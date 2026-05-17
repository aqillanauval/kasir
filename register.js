// =============================================
// KATEANS REGISTER - register.js
// =============================================

// Ambil semua elemen dari HTML
var form            = document.getElementById('registerForm');
var namaInput       = document.getElementById('nama');
var emailInput      = document.getElementById('email');
var passInput       = document.getElementById('password');
var confirmInput    = document.getElementById('confirmPassword');
var termsCheckbox   = document.getElementById('terms');
var togglePass      = document.getElementById('togglePass');
var toggleConfirm   = document.getElementById('toggleConfirm');
var namaError       = document.getElementById('namaError');
var emailError      = document.getElementById('emailError');
var passError       = document.getElementById('passError');
var confirmError    = document.getElementById('confirmError');
var termsError      = document.getElementById('termsError');
var toast           = document.getElementById('toast');

// =============================================
// 1. TOGGLE TAMPILKAN / SEMBUNYIKAN PASSWORD
// =============================================

// Toggle untuk input Kata Sandi
togglePass.addEventListener('click', function () {
  var sedangSembunyi = passInput.type === 'password';
  passInput.type = sedangSembunyi ? 'text' : 'password';
  togglePass.innerHTML = sedangSembunyi
    ? '<i class="fa-regular fa-eye-slash" style="color: rgb(177, 151, 252);"></i>'
    : '<i class="fa-regular fa-eye" style="color: rgb(177, 151, 252);"></i>';
});

// Toggle untuk input Konfirmasi Kata Sandi
toggleConfirm.addEventListener('click', function () {
  var sedangSembunyi = confirmInput.type === 'password';
  confirmInput.type = sedangSembunyi ? 'text' : 'password';
  toggleConfirm.innerHTML = sedangSembunyi
    ? '<i class="fa-regular fa-eye-slash" style="color: rgb(177, 151, 252);"></i>'
    : '<i class="fa-regular fa-eye" style="color: rgb(177, 151, 252);"></i>';
});

// =============================================
// 2. HAPUS ERROR SAAT USER MENGETIK
// =============================================

namaInput.addEventListener('input', function () {
  sembunyikanError(namaInput, namaError);
});

emailInput.addEventListener('input', function () {
  sembunyikanError(emailInput, emailError);
});

passInput.addEventListener('input', function () {
  sembunyikanError(passInput, passError);
});

confirmInput.addEventListener('input', function () {
  sembunyikanError(confirmInput, confirmError);
});

termsCheckbox.addEventListener('change', function () {
  termsError.style.display = 'none';
});

// =============================================
// 3. VALIDASI FORM SAAT SUBMIT
// =============================================

form.addEventListener('submit', function (e) {
  e.preventDefault(); // Cegah halaman reload

  var valid = true;

  // --- Validasi Nama Lengkap ---
  var namaVal = namaInput.value.trim();
  if (namaVal === '') {
    tampilkanError(namaInput, namaError, 'Nama lengkap tidak boleh kosong.');
    valid = false;
  } else if (namaVal.length < 3) {
    tampilkanError(namaInput, namaError, 'Nama minimal 3 karakter.');
    valid = false;
  } else {
    sembunyikanError(namaInput, namaError);
  }

  // --- Validasi Email ---
  var emailVal = emailInput.value.trim();
  if (emailVal === '') {
    tampilkanError(emailInput, emailError, 'Alamat email tidak boleh kosong.');
    valid = false;
  } else if (!emailVal.includes('@') || !emailVal.includes('.')) {
    tampilkanError(emailInput, emailError, 'Format email tidak valid.');
    valid = false;
  } else {
    sembunyikanError(emailInput, emailError);
  }

  // --- Validasi Kata Sandi ---
  var passVal = passInput.value;
  if (passVal === '') {
    tampilkanError(passInput, passError, 'Kata sandi tidak boleh kosong.');
    valid = false;
  } else if (passVal.length < 6) {
    tampilkanError(passInput, passError, 'Kata sandi minimal 6 karakter.');
    valid = false;
  } else {
    sembunyikanError(passInput, passError);
  }

  // --- Validasi Konfirmasi Kata Sandi ---
  var confirmVal = confirmInput.value;
  if (confirmVal === '') {
    tampilkanError(confirmInput, confirmError, 'Konfirmasi kata sandi tidak boleh kosong.');
    valid = false;
  } else if (confirmVal !== passVal) {
    tampilkanError(confirmInput, confirmError, 'Kata sandi tidak cocok.');
    valid = false;
  } else {
    sembunyikanError(confirmInput, confirmError);
  }

  // --- Validasi Checkbox Syarat & Ketentuan ---
  if (!termsCheckbox.checked) {
    termsError.textContent = 'Kamu harus menyetujui syarat & ketentuan.';
    termsError.style.display = 'block';
    valid = false;
  } else {
    termsError.style.display = 'none';
  }

  // --- Jika semua valid ---
  if (valid) {
    tampilkanToast('<i class="fa-regular fa-circle-check" style="color: rgb(99, 230, 190);"></i> Pendaftaran berhasil! Selamat datang di Kateans.');
    form.reset();

    // Reset ikon toggle password
    passInput.type = 'password';
    confirmInput.type = 'password';
    togglePass.innerHTML = '<i class="fa-regular fa-eye"></i>';
    toggleConfirm.innerHTML = '<i class="fa-regular fa-eye"></i>';
  }
});

// =============================================
// 4. FUNGSI PEMBANTU
// =============================================

// Tampilkan pesan error
function tampilkanError(inputEl, errorEl, pesan) {
  errorEl.textContent = pesan;
  errorEl.style.display = 'block';
  inputEl.style.borderColor = '#dc2626';
}

// Sembunyikan pesan error
function sembunyikanError(inputEl, errorEl) {
  errorEl.style.display = 'none';
  inputEl.style.borderColor = '';
}

// Tampilkan notifikasi toast
function tampilkanToast(pesan) {
  toast.innerHTML = pesan;
  toast.classList.add('show');

  setTimeout(function () {
    toast.classList.remove('show');
  }, 3000);
}