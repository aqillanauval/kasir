// =============================================
// KATEANS SELLER - seller.js
// =============================================

// =============================================
// DATA MENU AWAL
// Setiap menu punya: id, nama, harga, stock,
// kategori, dan gambar (url / base64)
// =============================================
var dataMenu = [
  { id: 1, nama: 'Nasi Goreng',      harga: 17000, stock: 20, kategori: 'makanan',  gambar: 'nasgor.png'  },
  { id: 2, nama: 'Nasi Ayam Geprek', harga: 13000, stock: 10, kategori: 'makanan',  gambar: 'geprek.png'  },
  { id: 3, nama: 'Kentang Goreng',   harga: 10000, stock: 0,  kategori: 'snack',    gambar: 'kentang.png' },
  { id: 4, nama: 'Es Teh',           harga: 5000,  stock: 3,  kategori: 'minuman',  gambar: 'teh.png'     },
  { id: 5, nama: 'Es Krim',          harga: 8000,  stock: 0,  kategori: 'dessert',  gambar: 'es.png'      },
  { id: 6, nama: 'Kopi Susu',        harga: 8000,  stock: 0,  kategori: 'minuman',  gambar: 'kopi.png'    }
];

// PERBAIKAN: idBerikutnya dihitung dari ID terbesar yang sudah ada
// agar tidak pernah duplikat meski data diubah
function hitungIdBerikutnya() {
  var maxId = 0;
  for (var i = 0; i < dataMenu.length; i++) {
    if (dataMenu[i].id > maxId) maxId = dataMenu[i].id;
  }
  return maxId + 1;
}
var idBerikutnya = hitungIdBerikutnya();

// Menyimpan ID menu yang sedang diedit (null = mode tambah baru)
var idSedangDiedit = null;

// Filter kategori aktif
var filterAktif = 'semua';

// =============================================
// 1. RENDER TABEL
// =============================================
function renderTabel() {
  var tbody      = document.getElementById('tabelBody');
  var emptyState = document.getElementById('emptyState');

  tbody.innerHTML = '';

  // Filter data sesuai kategori aktif
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

    // Badge status berdasarkan stock
    var badgeHTML = menu.stock > 0
      ? '<span class="badge badge-tersedia"><i class="fa-solid fa-circle" style="font-size:0.5rem"></i> Tersedia</span>'
      : '<span class="badge badge-habis"><i class="fa-solid fa-circle" style="font-size:0.5rem"></i> Habis</span>';

    // Gambar: gunakan placeholder jika kosong
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
// 2. BUKA MODAL TAMBAH MENU BARU
// =============================================
function bukaModalTambah() {
  idSedangDiedit = null;

  document.getElementById('modalJudul').textContent = 'Tambah Menu';
  document.getElementById('btnSimpan').textContent  = 'Simpan';

  // Reset preview gambar
  var previewEl      = document.getElementById('previewGambar');
  var placeholderEl  = document.getElementById('uploadPlaceholder');
  var inputGambarEl  = document.getElementById('inputGambar');

  if (previewEl)     { previewEl.src = ''; previewEl.style.display = 'none'; }
  if (placeholderEl) { placeholderEl.style.display = 'flex'; }
  if (inputGambarEl) { inputGambarEl.value = ''; }

  // Kosongkan semua input
  document.getElementById('inputNama').value     = '';
  document.getElementById('inputHarga').value    = '';
  document.getElementById('inputStock').value    = '';
  document.getElementById('inputKategori').value = 'makanan';

  sembunyikanSemuaError();
  bukaModal();
}

// =============================================
// 3. BUKA MODAL EDIT MENU
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

  // Tampilkan preview gambar jika ada
  var previewEl     = document.getElementById('previewGambar');
  var placeholderEl = document.getElementById('uploadPlaceholder');
  var inputGambarEl = document.getElementById('inputGambar');

  if (menu.gambar && menu.gambar !== '') {
    if (previewEl) {
      previewEl.src           = menu.gambar;
      previewEl.style.display = 'block';
    }
    if (placeholderEl) placeholderEl.style.display = 'none';
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

  // Ambil gambar dari preview (base64 dari upload) atau string kosong
  var previewEl = document.getElementById('previewGambar');
  var gambar    = (previewEl && previewEl.style.display !== 'none' && previewEl.src)
                  ? previewEl.src
                  : '';

  // --- Validasi ---
  var valid = true;

  if (nama === '') {
    tampilkanError('errNama', 'Nama menu tidak boleh kosong.');
    valid = false;
  } else {
    sembunyikanError('errNama');
  }

  if (harga === '' || isNaN(Number(harga)) || Number(harga) < 0) {
    tampilkanError('errHarga', 'Masukkan harga yang valid (angka ≥ 0).');
    valid = false;
  } else {
    sembunyikanError('errHarga');
  }

  if (stock === '' || isNaN(Number(stock)) || Number(stock) < 0) {
    tampilkanError('errStock', 'Masukkan stok yang valid (angka ≥ 0).');
    valid = false;
  } else {
    sembunyikanError('errStock');
  }

  if (!valid) return;

  // --- Proses simpan ---
  if (idSedangDiedit === null) {
    // MODE TAMBAH
    dataMenu.push({
      id      : idBerikutnya,
      nama    : nama,
      harga   : Number(harga),
      stock   : Number(stock),
      kategori: kategori,
      gambar  : gambar
    });
    idBerikutnya = idBerikutnya + 1;
    tampilkanToast('<i class="fa-regular fa-circle-check" style="color: rgb(99, 230, 190);"></i> Menu "' + nama + '" berhasil ditambahkan!');

  } else {
    // MODE EDIT
    for (var i = 0; i < dataMenu.length; i++) {
      if (dataMenu[i].id === idSedangDiedit) {
        dataMenu[i].nama     = nama;
        dataMenu[i].harga    = Number(harga);
        dataMenu[i].stock    = Number(stock);
        dataMenu[i].kategori = kategori;
        // Hanya perbarui gambar jika ada upload baru (bukan placeholder)
        if (gambar !== '') dataMenu[i].gambar = gambar;
        break;
      }
    }
    tampilkanToast('<i class="fa-regular fa-circle-check" style="color: rgb(99, 230, 190);"></i> Menu "' + nama + '" berhasil diperbarui!');
  }

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

  tampilkanToast('<i class="fa-regular fa-circle-check" style="color: rgb(99, 230, 190);"></i> Menu "' + menu.nama + '" berhasil dihapus.');
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
// 7. PENCARIAN MENU
// =============================================
var searchInputEl = document.getElementById('searchInput');
if (searchInputEl) {
  searchInputEl.addEventListener('input', function () {
    var keyword    = this.value.toLowerCase().trim();
    var semuaBaris = document.querySelectorAll('#tabelBody tr');

    for (var i = 0; i < semuaBaris.length; i++) {
      var namaCel = semuaBaris[i].cells[1];
      if (!namaCel) continue;

      var nama = namaCel.textContent.toLowerCase();
      semuaBaris[i].style.display = nama.includes(keyword) ? '' : 'none';
    }
  });
}

// =============================================
// 8. BUKA & TUTUP MODAL
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
// 9. PREVIEW GAMBAR DARI UPLOAD
// PERBAIKAN: simpan gambar dari reader.result ke previewGambar.src
// sehingga simpanMenu() dapat mengambilnya dengan benar
// =============================================
function previewUpload(input) {
  var file = input.files[0];
  if (!file) return;

  // Validasi tipe file (hanya gambar)
  if (!file.type.startsWith('image/')) {
    tampilkanToast('<i class="fa-solid fa-triangle-exclamation" style="color: rgb(255, 212, 59);"></i> File harus berupa gambar.');
    return;
  }

  var reader = new FileReader();
  reader.onload = function (e) {
    var preview     = document.getElementById('previewGambar');
    var placeholder = document.getElementById('uploadPlaceholder');

    if (preview) {
      preview.src           = e.target.result; // simpan base64
      preview.style.display = 'block';
    }
    if (placeholder) {
      placeholder.style.display = 'none';
    }
  };
  reader.readAsDataURL(file);
}

// =============================================
// 10. FUNGSI PEMBANTU
// =============================================

// Cari menu berdasarkan id
function cariMenuById(id) {
  for (var i = 0; i < dataMenu.length; i++) {
    if (dataMenu[i].id === id) return dataMenu[i];
  }
  return null;
}

// Format angka jadi ribuan: 12000 → "12.000"
function formatRupiah(angka) {
  return angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// Tampilkan pesan error
function tampilkanError(idElemen, pesan) {
  var el = document.getElementById(idElemen);
  if (!el) return;
  el.textContent   = pesan;
  el.style.display = 'block';
}

// Sembunyikan satu pesan error
function sembunyikanError(idElemen) {
  var el = document.getElementById(idElemen);
  if (!el) return;
  el.style.display = 'none';
}

// Sembunyikan semua pesan error di modal
function sembunyikanSemuaError() {
  sembunyikanError('errNama');
  sembunyikanError('errHarga');
  sembunyikanError('errStock');
}

// PERBAIKAN: gunakan innerHTML agar ikon FontAwesome tampil
function tampilkanToast(pesan) {
  var toast = document.getElementById('toast');
  if (!toast) return;
  toast.innerHTML = pesan;
  toast.classList.add('show');

  setTimeout(function () {
    toast.classList.remove('show');
  }, 2500);
}

// =============================================
// 11. INISIALISASI
// =============================================
renderTabel();