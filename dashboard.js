// =============================================
// KATEANS - DASHBOARD / KASIR (dashboard.js)
// =============================================

// Data keranjang: menyimpan semua item yang dipesan
// Format: { nama: "Nasi Goreng", harga: 12000, jumlah: 1 }
var keranjang = [];

// Nomor order — baca dari localStorage agar tidak reset tiap reload
var nomorOrder = parseInt(localStorage.getItem('nomorOrder') || '1', 10);

// Biaya admin tetap
var BIAYA_ADMIN = 500;

// Tab aktif: 'dine' atau 'take'
var tabAktif = 'dine';

// =============================================
// 1. TAMBAH ITEM KE KERANJANG
// =============================================
function tambahKeranjang(nama, harga) {
  var itemAda = false;

  for (var i = 0; i < keranjang.length; i++) {
    if (keranjang[i].nama === nama) {
      keranjang[i].jumlah = keranjang[i].jumlah + 1;
      itemAda = true;
      break;
    }
  }

  if (!itemAda) {
    keranjang.push({ nama: nama, harga: harga, jumlah: 1 });
  }

  renderKeranjang();
  tampilkanToast('<i class="fa-regular fa-circle-check" style="color: rgb(99, 230, 190);"></i> ' + nama + ' ditambahkan!');
}

// =============================================
// 2. TAMPILKAN ISI KERANJANG
// =============================================
function renderKeranjang() {
  var orderList = document.getElementById('orderList');
  orderList.innerHTML = '';

  if (keranjang.length === 0) {
    var pesan = document.createElement('p');
    pesan.className = 'empty-msg';
    pesan.textContent = 'Belum ada pesanan.';
    orderList.appendChild(pesan);
    hitungTotal();
    return;
  }

  for (var i = 0; i < keranjang.length; i++) {
    var item = keranjang[i];
    var div  = document.createElement('div');
    div.className = 'order-item';

    div.innerHTML =
      '<div class="order-item-img"><i class="fa-solid fa-utensils"></i></div>' +
      '<div class="order-item-detail">' +
        '<div class="order-item-name">' + item.nama + '</div>' +
        '<div class="order-item-price">Rp. ' + formatRupiah(item.harga) + '</div>' +
      '</div>' +
      '<div class="order-item-qty">' +
        '<button class="qty-btn" onclick="kurangiItem(' + i + ')">&#8722;</button>' +
        '<span class="qty-number">' + item.jumlah + '</span>' +
        '<button class="qty-btn" onclick="tambahItem(' + i + ')">+</button>' +
      '</div>';

    orderList.appendChild(div);
  }

  hitungTotal();
}

// =============================================
// 3. TAMBAH JUMLAH ITEM (tombol + di keranjang)
// =============================================
function tambahItem(index) {
  keranjang[index].jumlah = keranjang[index].jumlah + 1;
  renderKeranjang();
}

// =============================================
// 4. KURANGI JUMLAH ITEM (tombol − di keranjang)
// =============================================
function kurangiItem(index) {
  keranjang[index].jumlah = keranjang[index].jumlah - 1;

  if (keranjang[index].jumlah <= 0) {
    keranjang.splice(index, 1);
  }

  renderKeranjang();
}

// =============================================
// 5. HITUNG TOTAL HARGA
// =============================================
function hitungTotal() {
  var subtotal = 0;

  for (var i = 0; i < keranjang.length; i++) {
    subtotal = subtotal + (keranjang[i].harga * keranjang[i].jumlah);
  }

  var total = keranjang.length > 0 ? subtotal + BIAYA_ADMIN : 0;

  document.getElementById('subtotal').textContent = 'Rp. ' + formatRupiah(subtotal);
  document.getElementById('total').textContent    = 'Rp. ' + formatRupiah(total);
}

// =============================================
// 6. HAPUS SEMUA PESANAN
// =============================================
function hapusSemua() {
  if (keranjang.length === 0) {
    tampilkanToast('<i class="fa-solid fa-triangle-exclamation" style="color: rgb(255, 212, 59);"></i> Keranjang sudah kosong.');
    return;
  }

  keranjang = [];
  renderKeranjang();
  tampilkanToast('<i class="fa-solid fa-trash" style="color: rgb(255, 99, 99);"></i> Semua pesanan dihapus.');
}

// =============================================
// 7. GANTI TAB DINE IN / TAKE AWAY
// =============================================
function gantiTab(jenis) {
  tabAktif = jenis;

  var tabDine = document.getElementById('tabDine');
  var tabTake = document.getElementById('tabTake');

  if (jenis === 'dine') {
    tabDine.classList.add('active');
    tabTake.classList.remove('active');
  } else {
    tabTake.classList.add('active');
    tabDine.classList.remove('active');
  }
}

// =============================================
// 8. PILIH METODE PEMBAYARAN
// =============================================
function pilihBayar(tombol) {
  var semuaTombol = document.querySelectorAll('.pay-btn');
  for (var i = 0; i < semuaTombol.length; i++) {
    semuaTombol[i].classList.remove('active');
  }
  tombol.classList.add('active');
}

// =============================================
// 9. CHECKOUT
// =============================================
function checkout() {
  if (keranjang.length === 0) {
    tampilkanToast('<i class="fa-solid fa-triangle-exclamation" style="color: rgb(255, 212, 59);"></i> Tambahkan menu terlebih dahulu!');
    return;
  }

  // Ambil metode bayar yang aktif
  var metodeBayarEl = document.querySelector('.pay-btn.active');
  var namaMetode    = metodeBayarEl ? metodeBayarEl.textContent.trim() : 'Cash';

  // Baca pesanan lama dari localStorage
  var pesananLama  = localStorage.getItem('dataPesanan');
  var semuaPesanan = pesananLama ? JSON.parse(pesananLama) : [];

  // PERBAIKAN: Sinkronkan nomorOrder dengan ID terbesar yang ada di localStorage
  // agar tidak pernah menghasilkan ID duplikat walau localStorage diubah dari luar
  var maxIdAda = 0;
  for (var m = 0; m < semuaPesanan.length; m++) {
    if (semuaPesanan[m].id > maxIdAda) maxIdAda = semuaPesanan[m].id;
  }
  if (nomorOrder <= maxIdAda) {
    nomorOrder = maxIdAda + 1;
    localStorage.setItem('nomorOrder', nomorOrder);
  }

  // Buat tanggal sekarang
  var sekarang    = new Date();
  var namaBulan   = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
  var tanggalStr  = sekarang.getDate() + ' ' + namaBulan[sekarang.getMonth()] + ' ' + sekarang.getFullYear();
  var jamStr      = sekarang.getHours() + ':' + String(sekarang.getMinutes()).padStart(2, '0');

  // Buat pesanan baru
  var pesananBaru = {
    id    : nomorOrder,
    status: 'menunggu',
    tipe  : tabAktif === 'dine' ? 'Dine In' : 'Take Away',
    waktu : jamStr,
    tanggal: tanggalStr,
    metode: namaMetode,
    items : []
  };

  for (var i = 0; i < keranjang.length; i++) {
    pesananBaru.items.push({
      nama  : keranjang[i].nama,
      jumlah: keranjang[i].jumlah,
      harga : keranjang[i].harga
    });
  }

  semuaPesanan.push(pesananBaru);
  localStorage.setItem('dataPesanan', JSON.stringify(semuaPesanan));

  // Naikkan nomor order dan simpan ke localStorage
  nomorOrder = nomorOrder + 1;
  localStorage.setItem('nomorOrder', nomorOrder);

  tampilkanToast('<i class="fa-regular fa-circle-check" style="color: rgb(99, 230, 190);"></i> Pesanan #' + pesananBaru.id + ' berhasil! Bayar via ' + namaMetode + '.');

  // Reset keranjang
  keranjang = [];
  document.getElementById('orderNumber').textContent = nomorOrder;
  renderKeranjang();
}

// =============================================
// 10. FILTER KATEGORI MENU
// =============================================
var filterBtns = document.querySelectorAll('.filter-btn');

for (var f = 0; f < filterBtns.length; f++) {
  filterBtns[f].addEventListener('click', function () {
    for (var j = 0; j < filterBtns.length; j++) {
      filterBtns[j].classList.remove('active');
    }
    this.classList.add('active');

    var kategori   = this.getAttribute('data-kategori');
    var semuaCard  = document.querySelectorAll('.menu-card');

    for (var k = 0; k < semuaCard.length; k++) {
      var cardKategori = semuaCard[k].getAttribute('data-kategori');
      if (kategori === 'semua' || cardKategori === kategori) {
        semuaCard[k].classList.remove('tersembunyi');
      } else {
        semuaCard[k].classList.add('tersembunyi');
      }
    }
  });
}

// =============================================
// 11. PENCARIAN MENU
// =============================================
var searchInput = document.getElementById('searchInput');

searchInput.addEventListener('input', function () {
  var keyword   = this.value.toLowerCase().trim();
  var semuaCard = document.querySelectorAll('.menu-card');

  for (var i = 0; i < semuaCard.length; i++) {
    var namaMenu = semuaCard[i].querySelector('.menu-name').textContent.toLowerCase();
    if (namaMenu.includes(keyword)) {
      semuaCard[i].classList.remove('tersembunyi');
    } else {
      semuaCard[i].classList.add('tersembunyi');
    }
  }
});

// =============================================
// 12. FUNGSI PEMBANTU
// =============================================

// Format angka jadi format rupiah: 12000 → "12.000"
function formatRupiah(angka) {
  return angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// Tampilkan notifikasi toast (mendukung HTML untuk ikon)
function tampilkanToast(pesan) {
  var toast = document.getElementById('toast');
  toast.innerHTML = pesan;
  toast.classList.add('show');

  setTimeout(function () {
    toast.classList.remove('show');
  }, 2500);
}

// =============================================
// 13. INISIALISASI AWAL
// =============================================
// Tampilkan nomor order yang tersimpan
document.getElementById('orderNumber').textContent = nomorOrder;

// Render keranjang kosong saat halaman pertama dibuka
renderKeranjang();