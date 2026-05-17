// =============================================
// KATEANS - LAPORAN PENJUALAN (report.js)
// =============================================

// =============================================
// 1. AMBIL DATA DARI localStorage
// =============================================
var semuaPesanan = [];
var dataTersimpan = localStorage.getItem('dataPesanan');
if (dataTersimpan) {
  semuaPesanan = JSON.parse(dataTersimpan);
}

// Ambil hanya pesanan yang sudah SELESAI
var dataLaporan = [];
for (var i = 0; i < semuaPesanan.length; i++) {
  var p = semuaPesanan[i];
  if (p.status === 'selesai') {
    dataLaporan.push({
      id     : p.id,
      tanggal: p.tanggal || formatTanggal(new Date()),
      items  : p.items,
      tipe   : p.tipe    || 'Dine In',
      metode : p.metode  || 'Cash',
      waktu  : p.waktu   || '00:00'
    });
  }
}
// Data yang sedang ditampilkan (setelah filter)
var dataAktif = dataLaporan.slice();

// Simpan referensi hasil pencarian terakhir
// (agar modal selalu membuka data yang benar)
var dataModal = dataAktif.slice();

// =============================================
// 2. FUNGSI FORMAT TANGGAL
// Ubah objek Date menjadi string "D Bulan YYYY"
// =============================================
function formatTanggal(date) {
  var namaBulan = [
    'Jan','Feb','Mar','Apr','Mei','Jun',
    'Jul','Agu','Sep','Okt','Nov','Des'
  ];
  return date.getDate() + ' ' + namaBulan[date.getMonth()] + ' ' + date.getFullYear();
}

// =============================================
// 3. HITUNG TOTAL HARGA SATU PESANAN
// =============================================
function hitungTotal(items) {
  var total = 0;
  for (var i = 0; i < items.length; i++) {
    total += items[i].jumlah * items[i].harga;
  }
  return total;
}

// =============================================
// 4. FORMAT ANGKA RIBUAN — 12000 → "12.000"
// =============================================
function formatRupiah(angka) {
  return angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// =============================================
// 5. RENDER TABEL DETAIL PENJUALAN
// Menyimpan data yang sedang ditampilkan ke dataModal
// agar bukaModal() selalu dapat data yang tepat
// =============================================
function renderTabel(data) {
  var tbody      = document.getElementById('tabelBody');
  var emptyState = document.getElementById('emptyState');
  tbody.innerHTML = '';

  // Simpan data yang ditampilkan untuk keperluan modal
  dataModal = data.slice();

  if (data.length === 0) {
    emptyState.style.display = 'block';
    return;
  }

  emptyState.style.display = 'none';

  for (var i = 0; i < data.length; i++) {
    var laporan = data[i];
    var total   = hitungTotal(laporan.items);

    // Gabungkan nama item
    var namaItems = '';
    for (var j = 0; j < laporan.items.length; j++) {
      namaItems += laporan.items[j].jumlah + 'x ' + laporan.items[j].nama;
      if (j < laporan.items.length - 1) namaItems += '<br>';
    }

    // PERBAIKAN: gunakan i (index di array yang dirender)
    // agar bukaModal() selalu dapat baris yang benar
    var tr = document.createElement('tr');
    tr.innerHTML =
      '<td>' + laporan.tanggal + '</td>' +
      '<td>' + namaItems + '</td>' +
      '<td class="col-jumlah">Rp. ' + formatRupiah(total) + '</td>' +
      '<td>' + laporan.metode + '</td>' +
      '<td>' +
        '<button class="btn-detail" onclick="bukaModal(' + i + ')" title="Lihat Detail">' +
          '<i class="fa-regular fa-eye"></i>' +
        '</button>' +
      '</td>';

    tbody.appendChild(tr);
  }
}

// =============================================
// 6. HITUNG & TAMPILKAN STATISTIK
// =============================================
function renderStatistik(data) {
  var totalPenjualan = 0;
  var totalItem      = 0;

  for (var i = 0; i < data.length; i++) {
    totalPenjualan += hitungTotal(data[i].items);
    for (var j = 0; j < data[i].items.length; j++) {
      totalItem += data[i].items[j].jumlah;
    }
  }

  var totalTransaksi = data.length;
  var rataRata       = totalTransaksi > 0
    ? Math.round(totalPenjualan / totalTransaksi)
    : 0;

  document.getElementById('statTotalPenjualan').textContent = 'Rp. ' + formatRupiah(totalPenjualan);
  document.getElementById('statTotalTransaksi').textContent = totalTransaksi;
  document.getElementById('statRataRata').textContent       = 'Rp. ' + formatRupiah(rataRata);
  document.getElementById('statItemTerjual').textContent    = totalItem;
}

// =============================================
// 7. GRAFIK BATANG PENJUALAN PER BULAN
// =============================================
var instanceGrafik = null;

function renderGrafik(data) {
  var labelBulan  = ['Des 2025', 'Jan 2026', 'Feb 2026', 'Mar 2026', 'Apr 2026', 'Mei 2026'];
  var nilaiStatis = [10000000, 14600000, 7200000, 17000000, 15000000, 18500000];

  // Hitung total dari data aktif untuk bulan terakhir
  var totalAktif = 0;
  for (var i = 0; i < data.length; i++) {
    totalAktif += hitungTotal(data[i].items);
  }
  if (totalAktif > 0) nilaiStatis[5] = totalAktif;

  var canvas = document.getElementById('grafikPenjualan');
  if (!canvas) return; // Jaga jika elemen belum ada

  var ctx = canvas.getContext('2d');

  if (instanceGrafik) {
    instanceGrafik.destroy();
  }

  instanceGrafik = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labelBulan,
      datasets: [{
        label          : 'Penjualan (Rp)',
        data           : nilaiStatis,
        backgroundColor: '#059669',
        borderRadius   : 8,
        borderSkipped  : false
      }]
    },
    options: {
      responsive         : true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            font        : { family: 'Nunito', size: 12, weight: '700' },
            color       : '#6b7280',
            boxWidth    : 14,
            boxHeight   : 14,
            borderRadius: 4
          }
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return ' Rp. ' + formatRupiah(context.parsed.y);
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
              return formatRupiah(value);
            },
            font : { family: 'Nunito', size: 11 },
            color: '#9ca3af'
          },
          grid: { color: '#f3f4f6' }
        },
        x: {
          ticks: {
            font : { family: 'Nunito', size: 11 },
            color: '#9ca3af'
          },
          grid: { display: false }
        }
      }
    }
  });
}

// =============================================
// 8. TERAPKAN FILTER
// =============================================
function terapkanFilter() {
  var metode = document.getElementById('filterMetode').value;

  var hasil = [];
  for (var i = 0; i < dataLaporan.length; i++) {
    var cocok = true;

    if (metode !== 'semua' && dataLaporan[i].metode !== metode) {
      cocok = false;
    }

    if (cocok) hasil.push(dataLaporan[i]);
  }

  dataAktif = hasil;

  // Reset kotak pencarian agar tidak konflik dengan filter
  var searchEl = document.getElementById('searchInput');
  if (searchEl) searchEl.value = '';

  renderTabel(dataAktif);
  renderStatistik(dataAktif);
  renderGrafik(dataAktif);

  tampilkanToast('<i class="fa-solid fa-magnifying-glass"></i> Filter diterapkan. ' + dataAktif.length + ' transaksi ditemukan.');
}

// =============================================
// 9. RESET FILTER
// =============================================
function resetFilter() {
  var periodeEl  = document.getElementById('filterPeriode');
  var kategoriEl = document.getElementById('filterKategori');
  var metodeEl   = document.getElementById('filterMetode');
  var searchEl   = document.getElementById('searchInput');

  if (periodeEl)  periodeEl.value  = '2026-05';
  if (kategoriEl) kategoriEl.value = 'semua';
  if (metodeEl)   metodeEl.value   = 'semua';
  if (searchEl)   searchEl.value   = '';

  dataAktif = dataLaporan.slice();
  renderTabel(dataAktif);
  renderStatistik(dataAktif);
  renderGrafik(dataAktif);

  tampilkanToast('<i class="fa-solid fa-rotate-left"></i> Filter direset.');
}

// =============================================
// 10. PENCARIAN REAL-TIME
// Mencari di data yang sudah difilter (dataAktif)
// =============================================
var searchEl = document.getElementById('searchInput');
if (searchEl) {
  searchEl.addEventListener('input', function () {
    var keyword = this.value.toLowerCase().trim();

    if (keyword === '') {
      // Jika search dikosongkan, tampilkan semua dataAktif
      renderTabel(dataAktif);
      return;
    }

    var hasil = [];
    for (var i = 0; i < dataAktif.length; i++) {
      var teks = dataAktif[i].tanggal + ' ' + dataAktif[i].metode + ' ' + dataAktif[i].tipe;
      for (var j = 0; j < dataAktif[i].items.length; j++) {
        teks += ' ' + dataAktif[i].items[j].nama;
      }
      teks += ' ' + dataAktif[i].id;

      if (teks.toLowerCase().includes(keyword)) {
        hasil.push(dataAktif[i]);
      }
    }

    renderTabel(hasil);
  });
}

// =============================================
// 11. MODAL DETAIL TRANSAKSI
// PERBAIKAN: gunakan dataModal (hasil render terakhir)
// bukan dataAktif, agar index selalu sesuai
// =============================================
function bukaModal(index) {
  var laporan = dataModal[index];
  if (!laporan) return;

  var total   = hitungTotal(laporan.items);
  var isiHTML = '';

  // Info umum
  isiHTML +=
    '<div class="modal-row"><span>No. Pesanan</span><span>#' + laporan.id + '</span></div>' +
    '<div class="modal-row"><span>Tanggal</span><span>' + laporan.tanggal + '</span></div>' +
    '<div class="modal-row"><span>Waktu</span><span>' + laporan.waktu + '</span></div>' +
    '<div class="modal-row"><span>Tipe</span><span>' + laporan.tipe + '</span></div>' +
    '<div class="modal-row"><span>Metode Bayar</span><span>' + laporan.metode + '</span></div>';

  // Detail item
  for (var k = 0; k < laporan.items.length; k++) {
    var item      = laporan.items[k];
    var totalItem = item.jumlah * item.harga;
    isiHTML +=
      '<div class="modal-row">' +
        '<span>' + item.jumlah + 'x ' + item.nama + '</span>' +
        '<span>Rp. ' + formatRupiah(totalItem) + '</span>' +
      '</div>';
  }

  // Total
  isiHTML +=
    '<div class="modal-total">' +
      '<span>Total</span>' +
      '<span>Rp. ' + formatRupiah(total) + '</span>' +
    '</div>';

  document.getElementById('modalBody').innerHTML   = isiHTML;
  document.getElementById('modalJudul').textContent = 'Detail Pesanan #' + laporan.id;

  document.getElementById('modalOverlay').classList.add('aktif');
  document.getElementById('modal').classList.add('aktif');
}

function tutupModal() {
  document.getElementById('modalOverlay').classList.remove('aktif');
  document.getElementById('modal').classList.remove('aktif');
}

// =============================================
// 12. EXPORT LAPORAN (download CSV)
// Menggunakan dataModal agar sesuai tampilan tabel saat ini
// =============================================
function exportLaporan() {
  if (dataModal.length === 0) {
    tampilkanToast('<i class="fa-solid fa-exclamation-triangle"></i> Tidak ada data untuk diekspor.');
    return;
  }

  var isiCSV = 'No. Pesanan,Tanggal,Waktu,Item,Total,Metode,Tipe\n';

  for (var i = 0; i < dataModal.length; i++) {
    var lap   = dataModal[i];
    var total = hitungTotal(lap.items);

    var namaItem = '';
    for (var j = 0; j < lap.items.length; j++) {
      namaItem += lap.items[j].jumlah + 'x ' + lap.items[j].nama;
      if (j < lap.items.length - 1) namaItem += ' | ';
    }

    isiCSV +=
      lap.id + ',' +
      lap.tanggal + ',' +
      lap.waktu + ',' +
      '"' + namaItem + '",' +
      'Rp. ' + formatRupiah(total) + ',' +
      lap.metode + ',' +
      lap.tipe + '\n';
  }

  var blob = new Blob([isiCSV], { type: 'text/csv;charset=utf-8;' });
  var url  = URL.createObjectURL(blob);
  var link = document.createElement('a');
  link.href     = url;
  link.download = 'laporan-kateans.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  tampilkanToast('<i class="fa-solid fa-download"></i> Laporan berhasil diunduh!');
}

// =============================================
// 13. FUNGSI TOAST
// =============================================
function tampilkanToast(pesan) {
  var toast = document.getElementById('toast');
  toast.innerHTML = pesan;
  toast.classList.add('show');

  setTimeout(function () {
    toast.classList.remove('show');
  }, 2500);
}

// =============================================
// 14. INISIALISASI — jalankan saat halaman dibuka
// =============================================
renderTabel(dataAktif);
renderStatistik(dataAktif);
renderGrafik(dataAktif);