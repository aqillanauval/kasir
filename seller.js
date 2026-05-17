// =============================================
// KATEANS SELLER - seller.js
// =============================================

// DATA MENU AWAL — hanya dipakai jika localStorage kosong (pertama kali)
var DATA_AWAL = [
  { id: 1, nama: 'Nasi Goreng',      harga: 17000, stock: 20, kategori: 'makanan',  gambar: 'nasgor.png'  },
  { id: 2, nama: 'Nasi Ayam Geprek', harga: 13000, stock: 10, kategori: 'makanan',  gambar: 'geprek.png'  },
  { id: 3, nama: 'Kentang Goreng',   harga: 10000, stock: 15, kategori: 'snack',    gambar: 'kentang.png' },
  { id: 4, nama: 'Es Teh',           harga: 5000,  stock: 30, kategori: 'minuman',  gambar: 'teh.png'     },
  { id: 5, nama: 'Es Krim',          harga: 8000,  stock: 12, kategori: 'dessert',  gambar: 'es.png'      },
  { id: 6, nama: 'Kopi Susu',        harga: 8000,  stock: 20, kategori: 'minuman',  gambar: 'kopi.png'    }
];

// Baca dari localStorage; jika belum ada, pakai data awal lalu simpan
function memuatDataMenu() {
  var tersimpan = localStorage.getItem('dataMenu');
  if (tersimpan) {
    return JSON.parse(tersimpan);
  }
  // Pertama kali: simpan data awal ke localStorage
  localStorage.setItem('dataMenu', JSON.stringify(DATA_AWAL));
  return DATA_AWAL.map(function(m) { return Object.assign({}, m); });
}

var dataMenu = memuatDataMenu();

// Hitung ID berikutnya dari ID terbesar yang ada
function hitungIdBerikutnya() {
  var maxId = 0;
  for (var i = 0; i < dataMenu.length; i++) {
    if (dataMenu[i].id > maxId) maxId = dataMenu[i].id;
  }
  return maxId + 1;
}
var idBerikutnya = hitungIdBerikutnya();

var idSedangDiedit = null;
var filterAktif    = 'semua';

// =============================================
// SIMPAN KE localStorage (dipanggil tiap ada perubahan)
// =============================================
function simpanKeStorage() {
  localStorage.setItem('dataMenu', JSON.stringify(dataMenu));
}

// =============================================
// 1. RENDER TABEL
// =============================================
function renderTabel() {
  var tbody      = document.getElementById('tabelBody');
  var emptyState = document.getElementById('emptyState');

  tbody.innerHTML = '';

  var dataFiltered = [];
  for (var i = 0; i < dataMenu.length; i++) {
    if (filterAktif === 'semua' || dataMenu[i].kategori === filterAktif) {
      dataFiltered.push(dataMenu[i]);
    }
  }

  if (dataFiltered.length === 0) {
    emptyState.style.display = 'block';
    return;
  }
  emptyState.style.display = 'none';

  for (var j = 0; j < dataFiltered.length; j++) {
    var menu = dataFiltered[j];

    var badgeHTML = menu.stock > 0
      ? '<span class="badge badge-tersedia"><i class="fa-solid fa-circle" style="font-size:0.5rem"></i> Tersedia</span>'
      : '<span class="badge badge-habis"><i class="fa-solid fa-circle" style="font-size:0.5rem"></i> Habis</span>';

    var gambarSrc = menu.gambar ? menu.gambar : 'https://via.placeholder.com/60x60?text=Menu';

    var tr = document.createElement('tr');
    tr.innerHTML =
      '<td class="col-gambar">' +
        '<img src="' + gambarSrc + '" alt="' + menu.nama + '" onerror="this.src=\'https://via.placeholder.com/60x60?text=Menu\'" />' +
      '</td>' +
      '<td class="col-nama">' + menu.nama + '</td>' +
      '<td class="col-harga">Rp. ' + formatRupiah(menu.harga) + '</td>' +
      '<td class="col-stock">' + menu.stock + '</td>' +
      '<td>' + badgeHTML + '</td>' +
      '<td>' +
        '<div class="col-aksi">' +
          '<button class="btn-edit" onclick="bukaModalEdit(' + menu.id + ')" title="Edit">' +
            '<i class="fa-regular fa-pen-to-square"></i>' +
          '</button>' +
          '<button class="btn-hapus" onclick="hapusMenu(' + menu.id + ')" title="Hapus">' +
            '<i class="fa-regular fa-trash-can"></i>' +
          '</button>' +
        '</div>' +
      '</td>';

    tbody.appendChild(tr);
  }
}

// =============================================
// 2. BUKA MODAL TAMBAH
// =============================================
function bukaModalTambah() {
  idSedangDiedit = null;

  document.getElementById('modalJudul').textContent = 'Tambah Menu';
  document.getElementById('btnSimpan').textContent  = 'Simpan';

  var previewEl     = document.getElementById('previewGambar');
  var placeholderEl = document.getElementById('uploadPlaceholder');
  var inputGambarEl = document.getElementById('inputGambar');

  if (previewEl)     { previewEl.src = ''; previewEl.style.display = 'none'; }
  if (placeholderEl) { placeholderEl.style.display = 'flex'; }
  if (inputGambarEl) { inputGambarEl.value = ''; }

  document.getElementById('inputNama').value     = '';
  document.getElementById('inputHarga').value    = '';
  document.getElementById('inputStock').value    = '';
  document.getElementById('inputKategori').value = 'makanan';

  sembunyikanSemuaError();
  bukaModal();
}

// =============================================
// 3. BUKA MODAL EDIT
// =============================================
function bukaModalEdit(id) {
  var menu = cariMenuById(id);
  if (!menu) return;

  idSedangDiedit = id;

  document.getElementById('modalJudul').textContent = 'Edit Menu';
  document.getElementById('btnSimpan').textContent  = 'Perbarui';

  document.getElementById('inputNama').value     = menu.nama;
  document.getElementById('inputHarga').value    = menu.harga;
  document.getElementById('inputStock').value    = menu.stock;
  document.getElementById('inputKategori').value = menu.kategori;

  var previewEl     = document.getElementById('previewGambar');
  var placeholderEl = document.getElementById('uploadPlaceholder');
  var inputGambarEl = document.getElementById('inputGambar');

  if (menu.gambar && menu.gambar !== '') {
    if (previewEl) { previewEl.src = menu.gambar; previewEl.style.display = 'block'; }
    if (placeholderEl) { placeholderEl.style.display = 'none'; }
  } else {
    if (previewEl)     { previewEl.src = ''; previewEl.style.display = 'none'; }
    if (placeholderEl) { placeholderEl.style.display = 'flex'; }
  }

  if (inputGambarEl) inputGambarEl.value = '';

  sembunyikanSemuaError();
  bukaModal();
}

// =============================================
// 4. SIMPAN MENU (TAMBAH atau EDIT)
// =============================================
function simpanMenu() {
  var nama     = document.getElementById('inputNama').value.trim();
  var harga    = document.getElementById('inputHarga').value.trim();
  var stock    = document.getElementById('inputStock').value.trim();
  var kategori = document.getElementById('inputKategori').value;

  var previewEl = document.getElementById('previewGambar');
  var gambar    = (previewEl && previewEl.style.display !== 'none' && previewEl.src)
                  ? previewEl.src : '';

  var valid = true;

  if (nama === '') {
    tampilkanError('errNama', 'Nama menu tidak boleh kosong.');
    valid = false;
  } else { sembunyikanError('errNama'); }

  if (harga === '' || isNaN(Number(harga)) || Number(harga) < 0) {
    tampilkanError('errHarga', 'Masukkan harga yang valid (angka ≥ 0).');
    valid = false;
  } else { sembunyikanError('errHarga'); }

  if (stock === '' || isNaN(Number(stock)) || Number(stock) < 0) {
    tampilkanError('errStock', 'Masukkan stok yang valid (angka ≥ 0).');
    valid = false;
  } else { sembunyikanError('errStock'); }

  if (!valid) return;

  if (idSedangDiedit === null) {
    dataMenu.push({
      id      : idBerikutnya,
      nama    : nama,
      harga   : Number(harga),
      stock   : Number(stock),
      kategori: kategori,
      gambar  : gambar
    });
    idBerikutnya++;
    tampilkanToast('<i class="fa-regular fa-circle-check" style="color:rgb(99,230,190)"></i> Menu "' + nama + '" berhasil ditambahkan!');
  } else {
    for (var i = 0; i < dataMenu.length; i++) {
      if (dataMenu[i].id === idSedangDiedit) {
        dataMenu[i].nama     = nama;
        dataMenu[i].harga    = Number(harga);
        dataMenu[i].stock    = Number(stock);
        dataMenu[i].kategori = kategori;
        if (gambar !== '') dataMenu[i].gambar = gambar;
        break;
      }
    }
    tampilkanToast('<i class="fa-regular fa-circle-check" style="color:rgb(99,230,190)"></i> Menu "' + nama + '" berhasil diperbarui!');
  }

  simpanKeStorage(); // ← simpan ke localStorage
  tutupModal();
  renderTabel();
}

// =============================================
// 5. HAPUS MENU
// =============================================
function hapusMenu(id) {
  var menu = cariMenuById(id);
  if (!menu) return;

  var yakin = confirm('Hapus menu "' + menu.nama + '"?');
  if (!yakin) return;

  var dataBaru = [];
  for (var i = 0; i < dataMenu.length; i++) {
    if (dataMenu[i].id !== id) dataBaru.push(dataMenu[i]);
  }
  dataMenu = dataBaru;

  simpanKeStorage(); // ← simpan ke localStorage
  tampilkanToast('<i class="fa-regular fa-circle-check" style="color:rgb(99,230,190)"></i> Menu "' + menu.nama + '" berhasil dihapus.');
  renderTabel();
}

// =============================================
// 6. FILTER KATEGORI
// =============================================
var filterBtns = document.querySelectorAll('.filter-btn');

for (var f = 0; f < filterBtns.length; f++) {
  filterBtns[f].addEventListener('click', function () {
    for (var j = 0; j < filterBtns.length; j++) {
      filterBtns[j].classList.remove('active');
    }
    this.classList.add('active');
    filterAktif = this.getAttribute('data-kategori');
    renderTabel();
  });
}

// =============================================
// 7. PENCARIAN
// =============================================
var searchInputEl = document.getElementById('searchInput');
if (searchInputEl) {
  searchInputEl.addEventListener('input', function () {
    var keyword    = this.value.toLowerCase().trim();
    var semuaBaris = document.querySelectorAll('#tabelBody tr');
    for (var i = 0; i < semuaBaris.length; i++) {
      var namaCel = semuaBaris[i].cells[1];
      if (!namaCel) continue;
      semuaBaris[i].style.display = namaCel.textContent.toLowerCase().includes(keyword) ? '' : 'none';
    }
  });
}

// =============================================
// 8. MODAL
// =============================================
function bukaModal() {
  document.getElementById('modalOverlay').classList.add('aktif');
  document.getElementById('modal').classList.add('aktif');
}

function tutupModal() {
  document.getElementById('modalOverlay').classList.remove('aktif');
  document.getElementById('modal').classList.remove('aktif');
}

// =============================================
// 9. PREVIEW GAMBAR
// =============================================
function previewUpload(input) {
  var file = input.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    tampilkanToast('<i class="fa-solid fa-triangle-exclamation" style="color:rgb(255,212,59)"></i> File harus berupa gambar.');
    return;
  }

  var reader = new FileReader();
  reader.onload = function (e) {
    var preview     = document.getElementById('previewGambar');
    var placeholder = document.getElementById('uploadPlaceholder');
    if (preview)     { preview.src = e.target.result; preview.style.display = 'block'; }
    if (placeholder) { placeholder.style.display = 'none'; }
  };
  reader.readAsDataURL(file);
}

// =============================================
// 10. FUNGSI PEMBANTU
// =============================================
function cariMenuById(id) {
  for (var i = 0; i < dataMenu.length; i++) {
    if (dataMenu[i].id === id) return dataMenu[i];
  }
  return null;
}

function formatRupiah(angka) {
  return angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function tampilkanError(idElemen, pesan) {
  var el = document.getElementById(idElemen);
  if (!el) return;
  el.textContent   = pesan;
  el.style.display = 'block';
}

function sembunyikanError(idElemen) {
  var el = document.getElementById(idElemen);
  if (!el) return;
  el.style.display = 'none';
}

function sembunyikanSemuaError() {
  sembunyikanError('errNama');
  sembunyikanError('errHarga');
  sembunyikanError('errStock');
}

function tampilkanToast(pesan) {
  var toast = document.getElementById('toast');
  if (!toast) return;
  toast.innerHTML = pesan;
  toast.classList.add('show');
  setTimeout(function () { toast.classList.remove('show'); }, 2500);
}

// Sync jika dashboard mengubah stok di tab lain
window.addEventListener('storage', function (e) {
  if (e.key === 'dataMenu') {
    dataMenu = JSON.parse(e.newValue);
    renderTabel();
  }
});

// =============================================
// 11. INISIALISASI
// =============================================
renderTabel();