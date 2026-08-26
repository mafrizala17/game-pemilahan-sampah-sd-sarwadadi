import { TrashCategoryInfo, TrashItem, LevelConfig, LevelQuiz, WasteCategory, LeaderboardEntry } from '../types';

export const CATEGORIES: Record<WasteCategory, TrashCategoryInfo> = {
  Organik: {
    kategori_id: 'Organik',
    nama_kategori: 'Sampah Organik',
    deskripsi: 'Sampah alami yang mudah membusuk & terurai, bisa diolah jadi pupuk kompos atau pakan maggot.',
    warna: '#2ed573',
    icon: '🍃',
    koin: 100,
    contoh: ['Kulit Pisang', 'Sisa Apel', 'Daun Kering', 'Sisa Nasi / Makanan', 'Ranting Pohon', 'Tulang Ikan']
  },
  Anorganik: {
    kategori_id: 'Anorganik',
    nama_kategori: 'Sampah Anorganik',
    deskripsi: 'Sampah sulit membusuk buatan manusia. Bisa didaur ulang (Recycle) atau dipakai ulang (Reuse) melalui Bank Sampah!',
    warna: '#ffa502',
    icon: '📦',
    koin: 250,
    contoh: ['Botol Plastik PET', 'Kaleng Minuman', 'Kardus & Kertas', 'Kantong Kresek', 'Gelas Plastik', 'Botol Kaca']
  },
  B3: {
    kategori_id: 'B3',
    nama_kategori: 'Sampah B3 (Bahan Berbahaya & Beracun)',
    deskripsi: 'Sampah mengandung zat kimia berbahaya, mudah meledak/terbakar, beracun bagi manusia & tanah!',
    warna: '#ff4757',
    icon: '☣️',
    koin: 500,
    contoh: ['Baterai Bekas', 'Lampu Neon / Bohlam', 'Botol Obat Kadaluarsa', 'Kaleng Semprot Nyamuk', 'Aki Bekas', 'Termometer Merkuri']
  }
};

export const TRASH_ITEMS: TrashItem[] = [
  // ORGANIK (Common / Uncommon, 100 koin)
  {
    trash_item_id: 1,
    kategori_id: 'Organik',
    nama_sampah: 'Kulit Pisang',
    deskripsi: 'Sisa buah pisang yang kaya kalium, cocok diolah jadi pupuk organik cair.',
    nilai_koin: 100,
    rarity: 'Common',
    icon: '🍌',
    pixelSprite: 'banana'
  },
  {
    trash_item_id: 2,
    kategori_id: 'Organik',
    nama_sampah: 'Sisa Apel Busuk',
    deskripsi: 'Potongan buah apel yang mulai membusuk, cepat terurai dalam tanah.',
    nilai_koin: 100,
    rarity: 'Common',
    icon: '🍎',
    pixelSprite: 'apple'
  },
  {
    trash_item_id: 3,
    kategori_id: 'Organik',
    nama_sampah: 'Daun Kering Rontok',
    deskripsi: 'Guguran daun dari pepohonan sekolah Sarwadadi, bahan dasar pupuk kompos.',
    nilai_koin: 100,
    rarity: 'Common',
    icon: '🍂',
    pixelSprite: 'leaves'
  },
  {
    trash_item_id: 4,
    kategori_id: 'Organik',
    nama_sampah: 'Sisa Nasi & Sayur',
    deskripsi: 'Sisa bekal makan siang siswa, bisa diolah jadi pakan ternak atau kompos.',
    nilai_koin: 100,
    rarity: 'Common',
    icon: '🍚',
    pixelSprite: 'food_waste'
  },
  {
    trash_item_id: 5,
    kategori_id: 'Organik',
    nama_sampah: 'Ranting Kayu Kering',
    deskripsi: 'Ranting pohon lapuk yang patah, bisa dijadikan mulsa atau arang organik.',
    nilai_koin: 100,
    rarity: 'Uncommon',
    icon: '🪵',
    pixelSprite: 'wood_twig'
  },
  {
    trash_item_id: 6,
    kategori_id: 'Organik',
    nama_sampah: 'Tulang Ikan',
    deskripsi: 'Sisa makanan hewani kaya kalsium untuk nutrisi tanah kompos.',
    nilai_koin: 100,
    rarity: 'Uncommon',
    icon: '🐟',
    pixelSprite: 'fish_bone'
  },

  // ANORGANIK (Common / Uncommon, 250 koin)
  {
    trash_item_id: 7,
    kategori_id: 'Anorganik',
    nama_sampah: 'Botol Plastik Mineral',
    deskripsi: 'Botol PET bening yang bernilai ekonomis tinggi jika disetor ke Bank Sampah.',
    nilai_koin: 250,
    rarity: 'Common',
    icon: '🧴',
    pixelSprite: 'plastic_bottle'
  },
  {
    trash_item_id: 8,
    kategori_id: 'Anorganik',
    nama_sampah: 'Kaleng Minuman Soda',
    deskripsi: 'Kaleng aluminium ringan yang 100% dapat dilebur dan didaur ulang terus-menerus.',
    nilai_koin: 250,
    rarity: 'Common',
    icon: '🥫',
    pixelSprite: 'soda_can'
  },
  {
    trash_item_id: 9,
    kategori_id: 'Anorganik',
    nama_sampah: 'Kardus Bekas Makanan',
    deskripsi: 'Kardus kemasan cokelat berbahan serat kayu olahan, bisa dipres dan didaur ulang.',
    nilai_koin: 250,
    rarity: 'Common',
    icon: '📦',
    pixelSprite: 'cardboard'
  },
  {
    trash_item_id: 10,
    kategori_id: 'Anorganik',
    nama_sampah: 'Kantong Kresek Plastik',
    deskripsi: 'Kantong plastik sekali pakai, butuh waktu hingga ratusan tahun untuk terurai.',
    nilai_koin: 250,
    rarity: 'Common',
    icon: '🛍️',
    pixelSprite: 'plastic_bag'
  },
  {
    trash_item_id: 11,
    kategori_id: 'Anorganik',
    nama_sampah: 'Gelas Plastik Minuman Es',
    deskripsi: 'Gelas cup plastik PP, wajib dipilah dan dibersihkan sebelum didaur ulang.',
    nilai_koin: 250,
    rarity: 'Uncommon',
    icon: '🥤',
    pixelSprite: 'plastic_cup'
  },
  {
    trash_item_id: 12,
    kategori_id: 'Anorganik',
    nama_sampah: 'Botol Kaca Sirup',
    deskripsi: 'Botol kaca tebal yang dapat dicuci ulang (Reuse) atau dilebur menjadi produk baru.',
    nilai_koin: 250,
    rarity: 'Uncommon',
    icon: '🍾',
    pixelSprite: 'glass_bottle'
  },

  // B3 - Bahan Berbahaya & Beracun (Rare, 500 koin)
  {
    trash_item_id: 13,
    kategori_id: 'B3',
    nama_sampah: 'Baterai Bekas AA/AAA',
    deskripsi: 'Mengandung logam berat timbal dan merkuri, jangan dibuang sembarangan!',
    nilai_koin: 500,
    rarity: 'Rare',
    icon: '🔋',
    pixelSprite: 'battery'
  },
  {
    trash_item_id: 14,
    kategori_id: 'B3',
    nama_sampah: 'Lampu Bohlam Pecah',
    deskripsi: 'Lampu bekas mengandung gas merkuri dan serpihan kaca tajam berbahaya.',
    nilai_koin: 500,
    rarity: 'Rare',
    icon: '💡',
    pixelSprite: 'lightbulb'
  },
  {
    trash_item_id: 15,
    kategori_id: 'B3',
    nama_sampah: 'Botol Obat Kadaluarsa',
    deskripsi: 'Zat kimia obat yang telah lewat masa berlaku, dapat meracuni ekosistem air.',
    nilai_koin: 500,
    rarity: 'Rare',
    icon: '💊',
    pixelSprite: 'medicine_bottle'
  },
  {
    trash_item_id: 16,
    kategori_id: 'B3',
    nama_sampah: 'Kaleng Semprot Nyamuk',
    deskripsi: 'Kaleng aerosol bertekanan tinggi berisi racun insektisida kimia mudah meledak.',
    nilai_koin: 500,
    rarity: 'Rare',
    icon: '🪲',
    pixelSprite: 'spray_can'
  }
];

export const LEVELS: LevelConfig[] = [
  {
    level_id: 1,
    nama_level: 'Level 1: Pengenalan & Belajar',
    nama_lokasi: 'SD Negeri Sarwadadi + Sekitarnya',
    tipe_lokasi: 'SD',
    waktu_detik: 30,
    deskripsi: 'Bantu murid-murid SD Negeri Sarwadadi memungut sampah organik & anorganik di halaman sekolah dan setor ke TPS 3R!',
    target_sampah: 5,
    allowed_categories: ['Organik', 'Anorganik'],
    mapTheme: 'sd',
    min_quiz_score: 2 // 2 of 3
  },
  {
    level_id: 2,
    nama_level: 'Level 2: Tantangan Balai Desa',
    nama_lokasi: 'Balai Desa Sarwadadi & Sekitarnya',
    tipe_lokasi: 'Balai Desa',
    waktu_detik: 25,
    deskripsi: 'Warga desa sedang berkumpul! Waspadai sampah B3 (baterai & lampu) yang mulai muncul bersama sampah lainnya.',
    target_sampah: 6,
    allowed_categories: ['Organik', 'Anorganik', 'B3'],
    mapTheme: 'balai_desa',
    min_quiz_score: 2
  },
  {
    level_id: 3,
    nama_level: 'Level 3: Final Challenge',
    nama_lokasi: 'Lapangan Bola Desa Sarwadadi (Semua Area)',
    tipe_lokasi: 'Lapangan Bola',
    waktu_detik: 15,
    deskripsi: 'Turnamen sepak bola desa baru saja usai! Waktu hanya 15 detik! Kumpulkan semua jenis sampah langka dan selamatkan lingkungan Sarwadadi!',
    target_sampah: 6,
    allowed_categories: ['Organik', 'Anorganik', 'B3'],
    mapTheme: 'lapangan',
    min_quiz_score: 2
  }
];

export const QUIZZES: Record<number, LevelQuiz> = {
  1: {
    quiz_id: 1,
    level_id: 1,
    judul: 'Kuis Checkpoint Level 1: Dasar Pemilahan 3R',
    materi: 'Jenis Sampah',
    deskripsi: 'Jawab minimal 2 dari 3 pertanyaan dengan benar untuk membuka tantangan Balai Desa Sarwadadi!',
    pertanyaan: [
      {
        question_id: 101,
        pertanyaan: 'Manakah di bawah ini yang termasuk contoh sampah Organik yang bisa diolah jadi pupuk kompos?',
        opsi_a: 'Kulit pisang dan daun kering',
        opsi_b: 'Botol plastik dan kaleng soda',
        opsi_c: 'Baterai bekas dan lampu bohlam',
        opsi_d: 'Kantong kresek dan styrofoam',
        jawaban_benar: 'a',
        penjelasan: 'Kulit pisang dan daun gugur adalah sampah organik alami yang mudah membusuk dan terurai menjadi unsur hara tanah.'
      },
      {
        question_id: 102,
        pertanyaan: 'Mengapa sampah botol plastik dimasukkan ke tempat sampah warna Kuning/Orange (Anorganik)?',
        opsi_a: 'Karena cepat membusuk dalam 2 hari',
        opsi_b: 'Karena tidak mudah terurai dan dapat didaur ulang (Recycle)',
        opsi_c: 'Karena mengandung racun berbahaya meledak',
        opsi_d: 'Karena bisa langsung dimakan oleh hewan ternak',
        jawaban_benar: 'b',
        penjelasan: 'Plastik adalah anorganik sintetis yang butuh ratusan tahun terurai, sehingga harus dipilah untuk didaur ulang kembali.'
      },
      {
        question_id: 103,
        pertanyaan: 'Apa kepanjangan dari konsep "3R" dalam pengelolaan lingkungan hidup?',
        opsi_a: 'Read, Run, Rest',
        opsi_b: 'Reduce, Reuse, Recycle',
        opsi_c: 'Remove, Replace, Repair',
        opsi_d: 'Refill, Reload, Restart',
        jawaban_benar: 'b',
        penjelasan: '3R adalah singkatan dari Reduce (Mengurangi sampah), Reuse (Menggunakan kembali), dan Recycle (Mendaur ulang).'
      }
    ]
  },
  2: {
    quiz_id: 2,
    level_id: 2,
    judul: 'Kuis Checkpoint Level 2: Bahaya Sampah B3 & TPS 3R',
    materi: '3R',
    deskripsi: 'Jawab minimal 2 dari 3 pertanyaan dengan benar untuk melaju ke Final Challenge Lapangan Desa Sarwadadi!',
    pertanyaan: [
      {
        question_id: 201,
        pertanyaan: 'Apa kepanjangan dari singkatan sampah kategori B3?',
        opsi_a: 'Bahan Bersih, Bagus, dan Bermanfaat',
        opsi_b: 'Barang Bekas Berharga',
        opsi_c: 'Bahan Berbahaya dan Beracun',
        opsi_d: 'Bahan Bekas Berkualitas',
        jawaban_benar: 'c',
        penjelasan: 'B3 merupakan singkatan resmi dari Bahan Berbahaya dan Beracun yang memerlukan penanganan khusus terpisah.'
      },
      {
        question_id: 202,
        pertanyaan: 'Mengapa baterai bekas tidak boleh dicampur bersama sampah sisa makanan (organik)?',
        opsi_a: 'Baterai bisa mencemari tanah dan air dengan logam berat beracun',
        opsi_b: 'Baterai akan menjadi makanan lezat bagi cacing',
        opsi_c: 'Baterai akan membuat sayuran tumbuh lebih cepat',
        opsi_d: 'Baterai bisa langsung larut dalam air hujan',
        jawaban_benar: 'a',
        penjelasan: 'Baterai mengandung zat kimia timbal/merkuri beracun yang meresap ke air tanah jika dibuang sembarangan.'
      },
      {
        question_id: 203,
        pertanyaan: 'Di fasilitas "TPS 3R" Desa Sarwadadi, kegiatan apa yang dilakukan terhadap sampah?',
        opsi_a: 'Hanya membakar semua sampah sekaligus di tempat terbuka',
        opsi_b: 'Memilah, mengomposkan organik, dan menyalurkan anorganik ke pendaur ulang',
        opsi_c: 'Membuang seluruh sampah ke sungai terdekat',
        opsi_d: 'Menimbun semua jenis sampah dalam satu lubang tanah',
        jawaban_benar: 'b',
        penjelasan: 'TPS 3R (Tempat Pengolahan Sampah Reuse-Reduce-Recycle) berfungsi memilah dan mengolah sampah di tingkat desa.'
      }
    ]
  },
  3: {
    quiz_id: 3,
    level_id: 3,
    judul: 'Kuis Checkpoint Level 3: Bank Sampah & Ekonomi Sirkular',
    materi: 'Bank Sampah',
    deskripsi: 'Selesaikan kuis pamungkas ini untuk mendapatkan sertifikat Duta Pilah Sampah Desa Sarwadadi!',
    pertanyaan: [
      {
        question_id: 301,
        pertanyaan: 'Bagaimana cara kerja "Bank Sampah" bagi warga masyarakat Desa Sarwadadi?',
        opsi_a: 'Warga menabung uang kertas lalu meminjam sampah plastik',
        opsi_b: 'Warga menyetor sampah anorganik yang terpilah lalu mendapatkan saldo tabungan uang',
        opsi_c: 'Warga membakar sampah plastik untuk mendapatkan koin emas',
        opsi_d: 'Warga mengubur kaleng bekas di halaman rumah',
        jawaban_benar: 'b',
        penjelasan: 'Bank Sampah menerapkan sistem perbankan di mana sampah terpilah ditimbang, dihargai sesuai jenisnya, dan dicatat di buku tabungan warga.'
      },
      {
        question_id: 302,
        pertanyaan: 'Prinsip "Ekonomi Sirkular" dalam pengelolaan sampah mengajarkan kita untuk...',
        opsi_a: 'Memakai barang sekali pakai lalu langsung membuangnya begitu saja',
        opsi_b: 'Menjaga material barang tetap bermanfaat selama mungkin melalui daur ulang dan perbaikan',
        opsi_c: 'Membeli barang sebanyak mungkin tanpa memikirkan sisa kemasannya',
        opsi_d: 'Membakar semua limbah agar cepat habis tak berbekas',
        jawaban_benar: 'b',
        penjelasan: 'Ekonomi Sirkular mengubah pola linier (ambil-pakai-buang) menjadi siklus berputar di mana limbah diolah kembali menjadi produk bermanfaat.'
      },
      {
        question_id: 303,
        pertanyaan: 'Tindakan sederhana siswa SD yang mencerminkan prinsip "Reduce" (mengurangi sampah) adalah:',
        opsi_a: 'Membawa botol minum (tumbler) dan kotak bekal sendiri dari rumah',
        opsi_b: 'Membeli banyak minuman kemasan saset plastik setiap hari',
        opsi_c: 'Menggunakan 5 kantong plastik untuk membawa 1 bungkus permen',
        opsi_d: 'Membuang kertas tulis yang baru terisi satu baris',
        jawaban_benar: 'a',
        penjelasan: 'Membawa tumbler & wadah makan sendiri mencegah munculnya sampah kemasan plastik sekali pakai sejak awal.'
      }
    ]
  }
};

export const DEFAULT_LEADERBOARD: LeaderboardEntry[] = [
  {
    id: 'lead-1',
    nama: 'Siti Nurhaliza',
    kelas: '6 SD',
    sekolah: 'SD Negeri Sarwadadi',
    total_koin: 3450,
    sampah_dipilah: 18,
    akurasi: 100,
    level_tertinggi: 3,
    tanggal: 'Hari ini'
  },
  {
    id: 'lead-2',
    nama: 'Aditya Pratama',
    kelas: '5 SD',
    sekolah: 'SD Negeri Sarwadadi',
    total_koin: 2900,
    sampah_dipilah: 16,
    akurasi: 95,
    level_tertinggi: 3,
    tanggal: 'Kemarin'
  },
  {
    id: 'lead-3',
    nama: 'Dewi Lestari',
    kelas: '5 SD',
    sekolah: 'SD Negeri Sarwadadi',
    total_koin: 2650,
    sampah_dipilah: 15,
    akurasi: 93,
    level_tertinggi: 3,
    tanggal: '2 hari lalu'
  },
  {
    id: 'lead-4',
    nama: 'Rian Hidayat',
    kelas: '4 SD',
    sekolah: 'SD Negeri Sarwadadi',
    total_koin: 2150,
    sampah_dipilah: 13,
    akurasi: 90,
    level_tertinggi: 2,
    tanggal: '3 hari lalu'
  },
  {
    id: 'lead-5',
    nama: 'Farah Ramadhani',
    kelas: '4 SD',
    sekolah: 'SD Negeri Sarwadadi',
    total_koin: 1800,
    sampah_dipilah: 11,
    akurasi: 88,
    level_tertinggi: 2,
    tanggal: '4 hari lalu'
  },
  {
    id: 'lead-6',
    nama: 'Bagas Saputra',
    kelas: '3 SD',
    sekolah: 'SD Negeri Sarwadadi',
    total_koin: 1350,
    sampah_dipilah: 9,
    akurasi: 85,
    level_tertinggi: 1,
    tanggal: '5 hari lalu'
  }
];

export const MATERI_3R = [
  {
    title: '1. REDUCE (Mengurangi)',
    icon: '🔻',
    color: '#3498db',
    summary: 'Mencegah timbulan sampah sejak awal dengan mengurangi pemakaian barang sekali pakai.',
    tips: [
      'Bawa tumbler (botol minum) dan kotak makan sendiri ke sekolah.',
      'Gunakan tas belanja kain berulang kali saat ke warung/pasar.',
      'Pilih produk dengan kemasan yang lebih sedikit / isi ulang (refill).'
    ]
  },
  {
    title: '2. REUSE (Menggunakan Kembali)',
    icon: '🔄',
    color: '#2ecc71',
    summary: 'Memanfaatkan kembali barang-barang yang masih layak tanpa harus dibuang langsung.',
    tips: [
      'Gunakan kaleng atau botol kaca bekas sebagai pot tanaman hias atau tempat pensil.',
      'Sumbangkan pakaian atau buku cerita yang sudah tidak terpakai ke adik kelas.',
      'Manfaatkan kedua sisi kertas untuk mencoret-coret catatan.'
    ]
  },
  {
    title: '3. RECYCLE (Mendaur Ulang)',
    icon: '♻️',
    color: '#f39c12',
    summary: 'Mengolah limbah yang tidak bisa dipakai lagi menjadi produk baru yang bernilai.',
    tips: [
      'Pilah sampah plastik, kertas, kardus, dan kaleng untuk disetor ke Bank Sampah.',
      'Olah sisa makanan dan daun kering menjadi pupuk kompos atau pakan ternak maggot.',
      'Dukung produk hasil daur ulang karya pengrajin lokal.'
    ]
  },
  {
    title: '4. BANK SAMPAH & EKONOMI SIRKULAR',
    icon: '🏛️',
    color: '#9b59b6',
    summary: 'Sampah bukan lagi musibah, melainkan berkah ekonomi jika dipilah dari sumbernya!',
    tips: [
      'Sampah yang dipilah dari rumah memiliki nilai rupiah saat ditimbang.',
      'Membantu menjaga kebersihan lingkungan desa Sarwadadi tetap asri dan sehat.',
      'Menciptakan lapangan kerja hijau bagi pengelola TPS 3R desa.'
    ]
  }
];
