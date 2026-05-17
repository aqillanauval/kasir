// =============================================
// KATEANS LOGIN - script.js
// =============================================

// Ambil elemen dari HTML
const form        = document.getElementById('loginForm');
const emailInput  = document.getElementById('email');
const passInput   = document.getElementById('password');
const toggleBtn   = document.getElementById('togglePass');
const emailError  = document.getElementById('emailError');
const passError   = document.getElementById('passError');
const toast       = document.getElementById('toast');

// =============================================
// 1. TOGGLE TAMPILKAN / SEMBUNYIKAN PASSWORD
// =============================================
toggleBtn.addEventListener('click', function () {
  const sedangSembunyi = passInput.type === 'password';

  // Ganti tipe input
  passInput.type = sedangSembunyi ? 'text' : 'password';

  // Ganti ikon tombol
  toggleBtn.innerHTML = sedangSembunyi ? '<i class="fa-regular fa-eye-slash" style="color: rgb(177, 151, 252);"></i>' : '<i class="fa-regular fa-eye" style="color: rgb(177, 151, 252);"></i>';
});

// =============================================
// 2. HAPUS PESAN ERROR SAAT USER MENGETIK
// =============================================
emailInput.addEventListener('input', function () {
  emailError.style.display = 'none';
  emailInput.style.borderColor = '';
});

passInput.addEventListener('input', function () {
  passError.style.display = 'none';
  passInput.style.borderColor = '';
});

// =============================================
// 3. VALIDASI FORM SAAT SUBMIT
// =============================================
form.addEventListener('submit', function (e) {
  // Cegah halaman reload
  e.preventDefault();

  var formValid = true;

  // --- Validasi Email ---
  var emailVal = emailInput.value.trim();

  if (emailVal === '') {
    tampilkanError(emailInput, emailError, 'Email tidak boleh kosong.');
    formValid = false;
  } else if (!emailVal.includes('@') || !emailVal.includes('.')) {
    tampilkanError(emailInput, emailError, 'Format email tidak valid.');
    formValid = false;
  } else {
    sembunyikanError(emailInput, emailError);
  }

  // --- Validasi Kata Sandi ---
  var passVal = passInput.value;

  if (passVal === '') {
    tampilkanError(passInput, passError, 'Kata sandi tidak boleh kosong.');
    formValid = false;
  } else if (passVal.length < 6) {
    tampilkanError(passInput, passError, 'Kata sandi minimal 6 karakter.');
    formValid = false;
  } else {
    sembunyikanError(passInput, passError);
  }

  // --- Jika semua valid ---
  if (formValid) {
    tampilkanToast('<i class="fa-regular fa-circle-check" style="color: rgb(99, 230, 190);"></i> Login berhasil! Selamat datang di Kateans.');
    form.reset();

    // Tunggu 1.5 detik supaya toast terlihat, lalu pindah ke dashboard
    setTimeout(function () {
      window.location.href = 'dashboard.html';
    }, 1500);

    // Kembalikan ikon password ke sembunyikan
    passInput.type = 'password';
    toggleBtn.innerHTML = '<i class="fa-regular fa-eye" style="color: rgb(177, 151, 252);"></i>';
  }
});

// =============================================
// 4. FUNGSI PEMBANTU
// =============================================

// Tampilkan pesan error pada input tertentu
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

// Tampilkan notifikasi toast di bawah layar
function tampilkanToast(pesan) {
  toast.innerHTML = pesan;
  toast.classList.add('show');

  // Sembunyikan otomatis setelah 3 detik
  setTimeout(function () {
    toast.classList.remove('show');
  }, 3000);
}