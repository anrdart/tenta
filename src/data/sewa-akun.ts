// src/data/sewa-akun.ts
// Konten layanan "Sewa Akun" — rental akun iklan whitelist Google & Meta.
// Single source of truth untuk halaman /layanan/sewa-akun.

export interface WhitelistInfo {
  key: 'meta' | 'google';
  title: string;
  desc: string;
  benefits: string[];
  requirements: string[];
}

export interface SewaPlan {
  name: string;
  tagline: string;
  price: string;
  unit: string;
  featured?: boolean;
  features: string[];
}

export interface FlowStep {
  no: number;
  tahap: string;
  aksi: string;
}

export interface TopupMethod {
  metode: string;
  cara: string;
}

export interface SewaFaq { q: string; a: string }

export const SEWA_HERO = {
  eyebrow: 'Sewa Akun',
  title: 'Iklan Jalan Terus,',
  titleAccent: 'Tanpa Drama Akun Kena Banned.',
  desc: 'Sewa Akun Whitelist Google & Meta Premium di Tentaklik. Dapatkan infrastruktur iklan kelas korporat dengan limit tanpa batas, review kilat, dan kestabilan performa untuk scale-up bisnis Anda.',
} as const;

export const META_WL: WhitelistInfo = {
  key: 'meta',
  title: 'Meta Ads Whitelist',
  desc: 'Akun iklan Facebook & Instagram yang sudah terverifikasi di bawah Business Manager resmi partner Meta.',
  benefits: [
    'Akun stabil, minim risiko random restrict',
    'Tidak ada limit spending harian — bebas scale',
    'Tidak dikenakan PPN',
    'Bisa digunakan untuk semua tipe campaign: Traffic, Leads, Conversions, Catalog, dll',
    'Support appeal melalui jalur langsung ke tim Meta',
    'Saldo otomatis pindah ke akun pengganti jika terjadi disable (syarat & ketentuan berlaku)',
  ],
  requirements: [
    'Memiliki akun Facebook personal yang aktif',
    'Memiliki Facebook Business Manager (BM)',
    'Fan Page / akun Instagram minimal berusia 7 hari dan sudah ada postingan',
    'Memiliki website dengan kontak (nomor WhatsApp / email) yang tertera jelas',
    'Produk / layanan yang diiklankan tidak melanggar kebijakan Meta',
  ],
};

export const GOOGLE_WL: WhitelistInfo = {
  key: 'google',
  title: 'Google Ads Whitelist',
  desc: 'Akun Google Ads yang dikelola resmi Google Partner agensi Tentaklik.',
  benefits: [
    'Risiko suspend lebih rendah dibanding akun Google Ads personal biasa',
    'Tidak ada batas maksimal spending harian — cocok untuk skala besar',
    'Proses appeal lebih cepat karena terhubung langsung ke Google Partner',
    'Saldo otomatis pindah ke akun pengganti jika terjadi disable (syarat & ketentuan berlaku)',
    'Support teknis oleh tim Tentaklik yang profesional dengan kebijakan Google Ads',
  ],
  requirements: [
    'Memiliki akun Gmail aktif',
    'Memiliki website / landing page yang sudah live',
    'Produk / layanan yang diiklankan tidak melanggar kebijakan Google Ads',
  ],
};

// Struktur harga — tier pricing volume besar (lihat docs section 4.4).
// Fee topup menurun seiring volume topup bulanan. Growth = best value (featured).
export const SEWA_PLANS: SewaPlan[] = [
  {
    name: 'Starter',
    tagline: 'Minimal spending 300rb',
    price: '5%',
    unit: 'fee topup',
    features: [
      'Sekali topup 300rb - 5jt',
      'Akun Whitelist Resmi',
      'Tanpa biaya PPN',
      'Support appeal jalur partner',
      'Saldo pindah otomatis jika disable*',
      'Support prioritas (standar)',
    ],
  },
  {
    name: 'Growth',
    tagline: 'Minimal spending 300rb',
    price: '4,5%',
    unit: 'fee topup',
    featured: true,
    features: [
      'Sekali topup 5jt - 15jt',
      'Akun Whitelist Resmi',
      'Tanpa biaya PPN',
      'Support appeal jalur partner',
      'Saldo pindah otomatis jika disable*',
      'Support prioritas (prioritas)',
    ],
  },
  {
    name: 'Scale',
    tagline: 'Minimal spending 300rb',
    price: '3,5%',
    unit: 'fee topup',
    features: [
      'Topup di atas 15jt',
      'Akun Whitelist Resmi',
      'Tanpa biaya PPN',
      'Support appeal jalur partner',
      'Saldo pindah otomatis jika disable*',
      'Support prioritas (VIP)',
    ],
  },
];

// Biaya sewa akun & setup — ditampilkan di section pricing homepage (di atas fee topup per paket).
export const SEWA_RENTAL = {
  setup: 'Gratis',
  tiers: [
    { label: '1 Bulan', price: '150rb' },
    { label: '3 Bulan', price: '350rb' },
    { label: '6 Bulan', price: '792rb' },
  ],
} as const;

export const FLOW_META: FlowStep[] = [
  { no: 1, tahap: 'Daftar akun dashboard', aksi: 'Buka tentaklik.com dan daftar akun dengan email aktif' },
  { no: 2, tahap: 'Isi formulir pengajuan', aksi: 'Masukkan: ID Business Manager Meta, link Fan Page, link landing page, jenis produk/layanan' },
  { no: 3, tahap: 'Verifikasi data', aksi: 'Tim Tentaklik memverifikasi BM ID dan kelengkapan data (maks. 1–2 jam hari kerja)' },
  { no: 4, tahap: 'Akun aktif', aksi: 'Akun iklan whitelist muncul di Business Manager klien — siap digunakan' },
  { no: 5, tahap: 'Topup saldo', aksi: 'Transfer ke rekening / e-wallet Tentaklik + konfirmasi via dashboard atau WhatsApp' },
  { no: 6, tahap: 'Mulai beriklan', aksi: 'Buat campaign di Ads Manager seperti biasa menggunakan akun whitelist yang sudah aktif' },
];

export const FLOW_GOOGLE: FlowStep[] = [
  { no: 1, tahap: 'Daftar akun dashboard', aksi: 'Buka tentaklik.com dan daftar akun dengan email Google aktif' },
  { no: 2, tahap: 'Isi formulir pengajuan', aksi: 'Masukkan: Customer ID Google Ads (jika sudah ada), URL website/landing page, kategori bisnis' },
  { no: 3, tahap: 'Proses setup MCC', aksi: 'Tim Tentaklik membuat / menghubungkan akun ke MCC resmi (estimasi 1×24 jam hari kerja)' },
  { no: 4, tahap: 'Akun aktif', aksi: 'Akun Google Ads muncul di dashboard klien — siap untuk topup' },
  { no: 5, tahap: 'Topup saldo', aksi: 'Transfer ke rekening Tentaklik + konfirmasi — saldo masuk dalam hitungan jam' },
  { no: 6, tahap: 'Mulai beriklan', aksi: 'Buat campaign di Google Ads sesuai kebutuhan bisnis' },
];

export const TOPUP_METHODS: TopupMethod[] = [
  { metode: 'Transfer Bank', cara: 'Transfer ke rekening Tentaklik → konfirmasi via WhatsApp atau dashboard dengan bukti transfer' },
  { metode: 'E-Wallet (GoPay / OVO / DANA)', cara: 'Transfer ke nomor e-wallet → konfirmasi via WhatsApp dengan bukti' },
  { metode: 'Dashboard langsung', cara: 'Login dashboard Tentaklik → pilih menu Topup → pilih metode → ikuti instruksi' },
];

export const SEWA_FAQS: SewaFaq[] = [
  { q: 'Apakah akun whitelist 100% aman dari banned?', a: 'Tidak. Tidak ada akun yang kebal banned jika melanggar kebijakan platform. Akun whitelist jauh lebih tahan dari random restrict, tapi jika iklan yang ditayangkan melanggar TOS Meta atau Google, akun tetap bisa dinonaktifkan. Tentaklik membantu proses appeal untuk kasus yang bukan disebabkan pelanggaran user.' },
  { q: 'Apakah saya bisa punya lebih dari satu akun whitelist?', a: 'Bisa. Anda dapat mengajukan lebih dari satu akun whitelist sesuai kebutuhan campaign Anda.' },
  { q: 'Bagaimana jika akun lama saya sudah terhubung ke provider whitelist lain?', a: 'Untuk Meta: Anda perlu menggunakan BM baru yang bersih. Untuk Google: akun existing bisa dihubungkan ke MCC Tentaklik, namun perlu dilepas dari MCC provider sebelumnya terlebih dahulu.' },
  { q: 'Bisakah saya migrasi campaign dari akun lama ke akun whitelist Tentaklik?', a: 'Untuk Meta: bisa — campaign yang sudah berjalan di akun lama dapat dipindahkan ke akun whitelist. Untuk Google: akun existing bisa langsung dihubungkan ke akun Tentaklik.' },
  { q: 'Apakah ada kontrak atau komitmen jangka panjang?', a: 'Ada. Jika akun tidak digunakan selama sebulan maka akan dicabut otomatis, dan akan diberitahukan ke klien terlebih dahulu oleh CS.' },
  { q: 'Kenapa fee topup Tentaklik 4% sedangkan kompetitor ada yang 3%?', a: 'Tentaklik memposisikan layanan di level yang sedikit lebih premium dengan justifikasi: onboarding checklist gratis, support lebih personal (bukan bot), dan pengalaman khusus untuk kategori NGO/yayasan. Selain itu, efisiensi utama tetap dari penghematan PPN sehingga klien tetap hemat dibanding akun biasa.' },
  { q: 'Apakah Tentaklik cocok untuk organisasi sosial atau yayasan?', a: 'Sangat cocok. Tentaklik memiliki pengalaman langsung mendampingi lembaga sosial yang menjalankan campaign donasi. Kami memahami kebutuhan konten sosial yang sering terkena false-positive restrict, dan akun whitelist memberi perlindungan ekstra untuk campaign yang sensitif.' },
  { q: 'Bagaimana cara menghubungi CS Tentaklik?', a: 'CS Tentaklik dapat dihubungi via WhatsApp di nomor yang tertera di website tentaklik.com. Jam operasional: Senin–Minggu, 24 jam.' },
  { q: 'Apakah ada fitur topup otomatis?', a: 'Saat ini topup dilakukan secara manual dengan konfirmasi via dashboard atau WhatsApp. Fitur topup otomatis sedang dalam pengembangan.' },
];

export const SEWA_SEO = {
  title: 'Sewa Akun Whitelist Google & Meta Ads — Tentaklik',
  description: 'Sewa akun iklan whitelist Google Ads & Meta Ads (Facebook & Instagram) di Tentaklik: tanpa limit spending, tanpa PPN, anti random banned, dan saldo pindah otomatis jika disable. Fee topup mulai dari 3,5%.',
} as const;

export const SEWA_KEYWORDS = [
  'sewa akun iklan',
  'sewa akun facebook ads',
  'sewa akun google ads',
  'akun whitelist meta',
  'akun whitelist google',
  'sewa akun meta ads',
  'agency ads whitelist',
];

// Section "Cocok untuk berbagai industri" — dipakai LP sewa-akun + 2 LP whitelist.
export interface Industry { label: string; icon: string; tint: string }

export const INDUSTRY_HEADING = {
  title: 'Cocok untuk berbagai industri',
  sub: 'Umumnya digunakan oleh advertiser di industri:',
} as const;

// tint = warna dasar kartu (gradient lembut digenerate di komponen).
export const INDUSTRIES: Industry[] = [
  { label: 'Personal Care',   icon: '🧴', tint: '#E8F0FE' },
  { label: 'Fashion Dewasa',  icon: '👗', tint: '#FCE7F3' },
  { label: 'Kesehatan',       icon: '🩺', tint: '#E7F6EC' },
  { label: 'Kecantikan',      icon: '💄', tint: '#F3E8FF' },
  { label: 'Produk Dewasa',   icon: '📦', tint: '#FFF1E6' },
  { label: 'NGO / Sosial',    icon: '🤝', tint: '#E6F4F7' },
];
