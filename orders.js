// =============================================
// KATEANS - KELOLA PESANAN (orders.js)
// =============================================

// Tab yang sedang aktif: 'aktif' atau 'selesai'
var tabAktif = 'aktif';

// =============================================
// HELPER: Baca data pesanan terbaru dari localStorage
// Selalu baca ulang agar sinkron dengan dashboard
// =============================================
function bacaDataPesanan() {
  var dataTersimpan = localStorage.getItem('dataPesanan');
  return dataTersimpan ? JSON.parse(dataTersimpan) : [];
}

// =============================================
// PERBAIKAN DATA KORUP: Fix ID duplikat
// Dipanggil sekali saat halaman orders dibuka.
// Jika ada pesanan dengan ID sama, assign ulang
// ID unik secara berurutan dan simpan ke localStorage.
// Juga sinkronkan nomorOrder agar dashboard tidak
// menghasilkan ID duplikat lagi.
// =============================================
function perbaikiIdDuplikat() {
  var data = bacaDataPesanan();
  if (data.length === 0) return;

  // Cek apakah ada ID duplikat
  var idSet = {};
  var adaDuplikat = false;
  for (var i = 0; i < data.length; i++) {
    if (idSet[data[i].id]) { adaDuplikat = true; break; }
    idSet[data[i].id] = true;
  }

  if (adaDuplikat) {
    // Assign ulang ID: 1, 2, 3, ...
    for (var j = 0; j < data.length; j++) {
      data[j].id = j + 1;
    }
    localStorage.setItem('dataPesanan', JSON.stringify(data));
    tampilkanToast('<i class="fa-solid fa-wrench"></i> Data pesanan diperbaiki secara otomatis.');
  }

  // Pastikan nomorOrder di localStorage selalu > ID terbesar
  var maxId = 0;
  for (var k = 0; k < data.length; k++) {
    if (data[k].id > maxId) maxId = data[k].id;
  }
  var nomorTersimpan = parseInt(localStorage.getItem('nomorOrder') || '1', 10);
  if (nomorTersimpan <= maxId) {
    localStorage.setItem('nomorOrder', maxId + 1);
  }
}

// =============================================
// 1. RENDER KARTU PESANAN
// Menampilkan kartu sesuai tab dan pencarian
// =============================================
function renderPesanan(keyword) {
  var dataPesanan = bacaDataPesanan(); // selalu baca data terbaru

  var grid       = document.getElementById('orderGrid');
  var emptyState = document.getElementById('emptyState');
  var emptyText  = document.getElementById('emptyText');

  grid.innerHTML = '';

  if (!keyword) keyword = '';
  keyword = keyword.toLowerCase().trim();

  // Filter data sesuai tab dan pencarian
  var dataFiltered = [];
  for (var i = 0; i < dataPesanan.length; i++) {
    var p = dataPesanan[i];

    var cocokTab = false;
    if (tabAktif === 'aktif' && p.status !== 'selesai') cocokTab = true;
    if (tabAktif === 'selesai' && p.status === 'selesai') cocokTab = true;

    // Pencarian berdasarkan nomor pesanan ATAU nama item
    var cocokCari = String(p.id).includes(keyword);
    if (!cocokCari) {
      for (var x = 0; x < p.items.length; x++) {
        if (p.items[x].nama.toLowerCase().includes(keyword)) {
          cocokCari = true;
          break;
        }
      }
    }

    if (cocokTab && cocokCari) dataFiltered.push(p);
  }

  // Perbarui badge jumlah di tab
  hitungJumlahTab(dataPesanan);

  if (dataFiltered.length === 0) {
    emptyState.style.display = 'block';
    grid.style.display       = 'none';
    emptyText.textContent    = tabAktif === 'aktif'
      ? 'Tidak ada pesanan aktif saat ini.'
      : 'Belum ada pesanan selesai.';
    return;
  }

  emptyState.style.display = 'none';
  grid.style.display       = '';

  for (var j = 0; j < dataFiltered.length; j++) {
    grid.appendChild(buatKartu(dataFiltered[j]));
  }
}

// =============================================
// 2. BUAT ELEMEN KARTU PESANAN
// =============================================
function buatKartu(pesanan) {
  var div = document.createElement('div');
  div.className = 'order-card';

  // Hitung total harga pesanan
  var total = 0;
  for (var i = 0; i < pesanan.items.length; i++) {
    total += pesanan.items[i].jumlah * pesanan.items[i].harga;
  }

  // Badge status
  var badgeKelas, badgeTeks;
  if (pesanan.status === 'menunggu') {
    badgeKelas = 'badge badge-menunggu'; badgeTeks = 'Menunggu';
  } else if (pesanan.status === 'diproses') {
    badgeKelas = 'badge badge-diproses'; badgeTeks = 'Diproses';
  } else if (pesanan.status === 'siap') {
    badgeKelas = 'badge badge-siap'; badgeTeks = 'Siap';
  } else {
    badgeKelas = 'badge badge-selesai'; badgeTeks = 'Selesai';
  }

  // Baris item pesanan
  var itemsHTML = '';
  for (var k = 0; k < pesanan.items.length; k++) {
    var item       = pesanan.items[k];
    var totalItem  = item.jumlah * item.harga;
    itemsHTML +=
      '<div class="card-item-row">' +
        '<span class="card-item-nama">' + item.jumlah + 'x ' + item.nama + '</span>' +
        '<span class="card-item-harga">Rp. ' + formatRupiah(totalItem) + '</span>' +
      '</div>';
  }

  // Tombol aksi sesuai status
  var tombolHTML = '';
  if (pesanan.status === 'menunggu') {
    tombolHTML =
      '<button class="btn-aksi btn-proses" onclick="ubahStatus(' + pesanan.id + ', \'diproses\')">' +
        '<i class="fa-solid fa-play"></i> Proses' +
      '</button>';
  } else if (pesanan.status === 'diproses') {
    tombolHTML =
      '<button class="btn-aksi btn-siap" onclick="ubahStatus(' + pesanan.id + ', \'siap\')">' +
        '<i class="fa-solid fa-bell"></i> Siap Diambil' +
      '</button>';
  } else if (pesanan.status === 'siap') {
    tombolHTML =
      '<button class="btn-aksi btn-selesai" onclick="ubahStatus(' + pesanan.id + ', \'selesai\')">' +
        '<i class="fa-regular fa-circle-check" style="color: rgb(99, 230, 190);"></i> Selesai' +
      '</button>';
  } else {
    tombolHTML =
      '<button class="btn-aksi btn-selesai" disabled>' +
        '<i class="fa-regular fa-circle-check" style="color: rgb(99, 230, 190);"></i> Pesanan Selesai' +
      '</button>';
  }

  // Tampilkan metode bayar jika tersimpan
  var metodeHTML = pesanan.metode
    ? '<span><i class="fa-solid fa-money-bill"></i> ' + pesanan.metode + '</span>'
    : '';

  div.innerHTML =
    '<div class="card-header">' +
      '<span class="card-nomor">Pesanan #' + pesanan.id + '</span>' +
      '<span class="' + badgeKelas + '">' + badgeTeks + '</span>' +
    '</div>' +

    '<div class="card-items">' + itemsHTML + '</div>' +

    '<hr class="card-divider" />' +

    '<div class="card-total">Rp. ' + formatRupiah(total) + '</div>' +

    '<div class="card-meta">' +
      '<span><i class="fa-regular fa-clock"></i> ' + (pesanan.waktu || '-') + '</span>' +
      '<span><i class="fa-solid fa-utensils"></i> ' + (pesanan.tipe || '-') + '</span>' +
      metodeHTML +
    '</div>' +

    tombolHTML;

  return div;
}

// =============================================
// 3. UBAH STATUS PESANAN
// =============================================
function ubahStatus(id, statusBaru) {
  var dataPesanan = bacaDataPesanan();

  for (var i = 0; i < dataPesanan.length; i++) {
    if (dataPesanan[i].id === id) {
      dataPesanan[i].status = statusBaru;
      break;
    }
  }

  localStorage.setItem('dataPesanan', JSON.stringify(dataPesanan));

  var pesan = '';
  if (statusBaru === 'diproses') {
    pesan = '<i class="fa-solid fa-fire-burner"></i> Pesanan #' + id + ' sedang diproses!';
  } else if (statusBaru === 'siap') {
    pesan = '<i class="fa-solid fa-bell"></i> Pesanan #' + id + ' siap diambil!';
  } else if (statusBaru === 'selesai') {
    pesan = '<i class="fa-regular fa-circle-check" style="color: rgb(99, 230, 190);"></i> Pesanan #' + id + ' selesai!';
  }

  tampilkanToast(pesan);

  var searchVal = document.getElementById('searchInput');
  renderPesanan(searchVal ? searchVal.value : '');
}

// =============================================
// 4. GANTI TAB AKTIF / SELESAI
// =============================================
function gantiTab(tab) {
  tabAktif = tab;

  var btnAktif   = document.getElementById('tabAktif');
  var btnSelesai = document.getElementById('tabSelesai');

  if (tab === 'aktif') {
    btnAktif.classList.add('active');
    btnSelesai.classList.remove('active');
  } else {
    btnSelesai.classList.add('active');
    btnAktif.classList.remove('active');
  }

  document.getElementById('searchInput').value = '';
  renderPesanan('');
}

// =============================================
// 5. HITUNG JUMLAH BADGE TAB
// =============================================
function hitungJumlahTab(dataPesanan) {
  var jumlahAktif   = 0;
  var jumlahSelesai = 0;

  for (var i = 0; i < dataPesanan.length; i++) {
    if (dataPesanan[i].status === 'selesai') {
      jumlahSelesai++;
    } else {
      jumlahAktif++;
    }
  }

  document.getElementById('jumlahAktif').textContent   = jumlahAktif;
  document.getElementById('jumlahSelesai').textContent = jumlahSelesai;
}

// =============================================
// 6. PENCARIAN
// =============================================
document.getElementById('searchInput').addEventListener('input', function () {
  renderPesanan(this.value);
});

// =============================================
// 7. AUTO-REFRESH setiap 10 detik
// Agar pesanan baru dari dashboard langsung muncul
// =============================================
setInterval(function () {
  var searchVal = document.getElementById('searchInput');
  renderPesanan(searchVal ? searchVal.value : '');
}, 10000);

// =============================================
// 8. FUNGSI PEMBANTU
// =============================================

// Format angka jadi ribuan: 12000 → "12.000"
function formatRupiah(angka) {
  return angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// Tampilkan toast notifikasi (mendukung HTML untuk ikon)
function tampilkanToast(pesan) {
  var toast = document.getElementById('toast');
  toast.innerHTML = pesan;
  toast.classList.add('show');

  setTimeout(function () {
    toast.classList.remove('show');
  }, 2500);
}

// =============================================
// 9. RESET SEMUA PESANAN
// Dipanggil dari tombol Reset di UI
// =============================================
function resetSemuaPesanan() {
  var konfirmasi = confirm(
    'Yakin ingin menghapus SEMUA data pesanan?' + 'Tindakan ini tidak bisa dibatalkan.' +
    'Nomor order juga akan direset ke #1.'
  );
  if (!konfirmasi) return;

  localStorage.removeItem('dataPesanan');
  localStorage.removeItem('nomorOrder');

  tampilkanToast('<i class="fa-solid fa-trash" style="color:rgb(255,99,99);"></i> Semua pesanan dihapus. Nomor order direset ke #1.');
  renderPesanan('');
}

// =============================================
// 10. INISIALISASI — jalankan saat halaman dibuka
// =============================================
perbaikiIdDuplikat();
renderPesanan('');