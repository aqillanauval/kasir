// =============================================
// KATEANS - DASHBOARD / KASIR (dashboard.js)
// =============================================

var keranjang   = [];
var nomorOrder  = parseInt(localStorage.getItem('nomorOrder') || '1', 10);
var BIAYA_ADMIN = 500;
var tabAktif    = 'dine';

// =============================================
// 0. RENDER MENU DARI localStorage
// =============================================
function renderMenuDashboard() {
  var grid         = document.getElementById('menuGrid');
  var dataTersimpan = localStorage.getItem('dataMenu');
  var daftarMenu   = dataTersimpan ? JSON.parse(dataTersimpan) : [];

  grid.innerHTML = '';

  // Filter sesuai kategori aktif (baca dari tombol filter yang aktif)
  var filterAktif = 'semua';
  var tombolAktif = document.querySelector('.filter-btn.active');
  if (tombolAktif) filterAktif = tombolAktif.getAttribute('data-kategori');

  // Filter sesuai keyword pencarian
  var keyword = '';
  var searchEl = document.getElementById('searchInput');
  if (searchEl) keyword = searchEl.value.toLowerCase().trim();

  var adaMenu = false;

  for (var i = 0; i < daftarMenu.length; i++) {
    var m = daftarMenu[i];

    // Sembunyikan stok habis
    if (m.stock <= 0) continue;

    // Filter kategori
    if (filterAktif !== 'semua' && m.kategori !== filterAktif) continue;

    // Filter pencarian
    if (keyword && m.nama.toLowerCase().indexOf(keyword) === -1) continue;

    adaMenu = true;

    var gambar = m.gambar ? m.gambar : 'https://via.placeholder.com/150x150?text=Menu';

    // Gunakan data-index untuk onclick agar aman dari karakter khusus di nama
    var card = document.createElement('div');
    card.className = 'menu-card';
    card.setAttribute('data-kategori', m.kategori);
    card.setAttribute('data-nama', m.nama);
    card.setAttribute('data-harga', m.harga);

    card.innerHTML =
      '<div class="menu-img">' +
        '<img src="' + gambar + '" alt="' + escapeHtml(m.nama) + '" ' +
          'onerror="this.src=\'https://via.placeholder.com/150x150?text=Menu\'" />' +
      '</div>' +
      '<div class="menu-info">' +
        '<div class="menu-header">' +
          '<span class="menu-name">' + escapeHtml(m.nama) + '</span>' +
          '<span class="menu-price">Rp. ' + formatRupiah(m.harga) + '</span>' +
        '</div>' +
        '<p class="menu-desc">Stok: ' + m.stock + ' tersedia</p>' +
        '<div class="menu-footer">' +
          '<span class="menu-rating">' +
            '<i class="fa-solid fa-star" style="color:rgb(255,212,59)"></i> 5.0' +
          '</span>' +
          // Tombol menggunakan data attribute, bukan inline string nama
          '<button class="btn-keranjang btn-add-cart">' +
            '<i class="fa-solid fa-plus"></i> Keranjang' +
          '</button>' +
        '</div>' +
      '</div>';

    grid.appendChild(card);
  }

  if (!adaMenu) {
    grid.innerHTML =
      '<p style="color:var(--teks-abu);text-align:center;padding:40px;grid-column:1/-1;">' +
      'Tidak ada menu yang tersedia.</p>';
  }

  // Pasang event listener ke semua tombol keranjang yang baru dibuat
  // (cara ini aman dari masalah apostrof/kutip di nama menu)
  var tombolKeranjang = grid.querySelectorAll('.btn-add-cart');
  for (var j = 0; j < tombolKeranjang.length; j++) {
    tombolKeranjang[j].addEventListener('click', function () {
      var card  = this.closest('.menu-card');
      var nama  = card.getAttribute('data-nama');
      var harga = parseInt(card.getAttribute('data-harga'), 10);
      tambahKeranjang(nama, harga);
    });
  }
}

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
  tampilkanToast(
    '<i class="fa-regular fa-circle-check" style="color:rgb(99,230,190)"></i> ' +
    escapeHtml(nama) + ' ditambahkan!'
  );
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
        '<div class="order-item-name">' + escapeHtml(item.nama) + '</div>' +
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
// 3. TAMBAH JUMLAH ITEM
// =============================================
function tambahItem(index) {
  keranjang[index].jumlah = keranjang[index].jumlah + 1;
  renderKeranjang();
}

// =============================================
// 4. KURANGI JUMLAH ITEM
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
    subtotal += keranjang[i].harga * keranjang[i].jumlah;
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
    tampilkanToast(
      '<i class="fa-solid fa-triangle-exclamation" style="color:rgb(255,212,59)"></i> ' +
      'Keranjang sudah kosong.'
    );
    return;
  }
  keranjang = [];
  renderKeranjang();
  tampilkanToast(
    '<i class="fa-solid fa-trash" style="color:rgb(255,99,99)"></i> Semua pesanan dihapus.'
  );
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
    tampilkanToast(
      '<i class="fa-solid fa-triangle-exclamation" style="color:rgb(255,212,59)"></i> ' +
      'Tambahkan menu terlebih dahulu!'
    );
    return;
  }

  var metodeBayarEl = document.querySelector('.pay-btn.active');
  var namaMetode    = metodeBayarEl ? metodeBayarEl.textContent.trim() : 'Cash';

  var pesananLama  = localStorage.getItem('dataPesanan');
  var semuaPesanan = pesananLama ? JSON.parse(pesananLama) : [];

  var maxIdAda = 0;
  for (var m = 0; m < semuaPesanan.length; m++) {
    if (semuaPesanan[m].id > maxIdAda) maxIdAda = semuaPesanan[m].id;
  }
  if (nomorOrder <= maxIdAda) {
    nomorOrder = maxIdAda + 1;
    localStorage.setItem('nomorOrder', nomorOrder);
  }

  var sekarang   = new Date();
  var namaBulan  = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
  var tanggalStr = sekarang.getDate() + ' ' + namaBulan[sekarang.getMonth()] + ' ' + sekarang.getFullYear();
  var jamStr     = sekarang.getHours() + ':' + String(sekarang.getMinutes()).padStart(2, '0');

  var pesananBaru = {
    id     : nomorOrder,
    status : 'menunggu',
    tipe   : tabAktif === 'dine' ? 'Dine In' : 'Take Away',
    waktu  : jamStr,
    tanggal: tanggalStr,
    metode : namaMetode,
    items  : []
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

  // ← KURANGI STOK di localStorage untuk setiap item yang dipesan
  var dataTersimpan = localStorage.getItem('dataMenu');
  if (dataTersimpan) {
    var daftarMenu = JSON.parse(dataTersimpan);
    for (var k = 0; k < keranjang.length; k++) {
      for (var n = 0; n < daftarMenu.length; n++) {
        if (daftarMenu[n].nama === keranjang[k].nama) {
          daftarMenu[n].stock = Math.max(0, daftarMenu[n].stock - keranjang[k].jumlah);
          break;
        }
      }
    }
    localStorage.setItem('dataMenu', JSON.stringify(daftarMenu));
  }

  nomorOrder++;
  localStorage.setItem('nomorOrder', nomorOrder);

  tampilkanToast(
    '<i class="fa-regular fa-circle-check" style="color:rgb(99,230,190)"></i> ' +
    'Pesanan #' + pesananBaru.id + ' berhasil! Bayar via ' + namaMetode + '.'
  );

  keranjang = [];
  document.getElementById('orderNumber').textContent = nomorOrder;
  renderKeranjang();
  renderMenuDashboard(); // ← refresh kartu menu (hilangkan yang stok jadi 0)
}

// =============================================
// 10. FILTER KATEGORI — re-render menu setelah filter
// =============================================
var filterBtns = document.querySelectorAll('.filter-btn');

for (var f = 0; f < filterBtns.length; f++) {
  filterBtns[f].addEventListener('click', function () {
    for (var j = 0; j < filterBtns.length; j++) {
      filterBtns[j].classList.remove('active');
    }
    this.classList.add('active');
    renderMenuDashboard(); // render ulang dengan filter baru
  });
}

// =============================================
// 11. PENCARIAN MENU — re-render menu setelah ketik
// =============================================
var searchInput = document.getElementById('searchInput');
searchInput.addEventListener('input', function () {
  renderMenuDashboard(); // render ulang dengan keyword baru
});

// =============================================
// 12. FUNGSI PEMBANTU
// =============================================
function formatRupiah(angka) {
  return angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function escapeHtml(teks) {
  return teks
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function tampilkanToast(pesan) {
  var toast = document.getElementById('toast');
  toast.innerHTML = pesan;
  toast.classList.add('show');
  setTimeout(function () {
    toast.classList.remove('show');
  }, 2500);
}

// Sync real-time jika seller mengubah menu di tab lain
window.addEventListener('storage', function (e) {
  if (e.key === 'dataMenu') {
    renderMenuDashboard();
  }
});

// =============================================
// 13. INISIALISASI
// =============================================
document.getElementById('orderNumber').textContent = nomorOrder;
renderMenuDashboard();
renderKeranjang();