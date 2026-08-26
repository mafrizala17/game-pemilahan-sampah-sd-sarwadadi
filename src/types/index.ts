export type WasteCategory = 'Organik' | 'Anorganik' | 'B3';
export type Rarity = 'Common' | 'Uncommon' | 'Rare';

export interface Player {
  player_id: number;
  nama: string;
  kelas: string;
  sekolah: string;
  jenis_kelamin: 'L' | 'P';
  tanggal_daftar: string;
}

export interface TrashCategoryInfo {
  kategori_id: WasteCategory;
  nama_kategori: string;
  deskripsi: string;
  warna: string;
  icon: string;
  contoh: string[];
  koin: number;
}

export interface TrashItem {
  trash_item_id: number;
  kategori_id: WasteCategory;
  nama_sampah: string;
  deskripsi: string;
  nilai_koin: number;
  rarity: Rarity;
  icon: string;
  pixelSprite: string; // identifier for pixel art rendering
}

export interface SpawnedTrash {
  id: string;
  item: TrashItem;
  x: number;
  y: number;
  collected: boolean;
  spawnTime: number;
}

export interface LevelConfig {
  level_id: number;
  nama_level: string;
  nama_lokasi: string;
  tipe_lokasi: 'SD' | 'Balai Desa' | 'Lapangan Bola';
  waktu_detik: number;
  deskripsi: string;
  target_sampah: number;
  allowed_categories: WasteCategory[];
  mapTheme: 'sd' | 'balai_desa' | 'lapangan';
  min_quiz_score: number;
}

export interface QuizQuestion {
  question_id: number;
  pertanyaan: string;
  opsi_a: string;
  opsi_b: string;
  opsi_c: string;
  opsi_d: string;
  jawaban_benar: 'a' | 'b' | 'c' | 'd';
  penjelasan: string;
}

export interface LevelQuiz {
  quiz_id: number;
  level_id: number;
  judul: string;
  materi: '3R' | 'Bank Sampah' | 'Jenis Sampah' | 'Ekonomi Sirkular';
  deskripsi: string;
  pertanyaan: QuizQuestion[];
}

export interface CollectionDetail {
  detail_id: number;
  trash_item: TrashItem;
  kategori_dipilih: WasteCategory;
  is_benar: boolean;
  koin_diperoleh: number;
  waktu_setor: string;
}

export interface PlayerProgress {
  player_id: number;
  level_id: number;
  total_koin_level: number;
  sampah_organik: number;
  sampah_anorganik: number;
  sampah_b3: number;
  benar_count: number;
  salah_count: number;
  is_level_completed: boolean;
  quiz_passed: boolean;
  high_score: number;
}

export interface GameStats {
  total_koin: number;
  total_sampah_terkumpul: number;
  total_organik: number;
  total_anorganik: number;
  total_b3: number;
  total_benar: number;
  total_salah: number;
  current_level: number;
  unlocked_levels: number[];
  level_progress: Record<number, PlayerProgress>;
}

export interface LeaderboardEntry {
  id: string;
  nama: string;
  kelas: string;
  sekolah: string;
  total_koin: number;
  sampah_dipilah: number;
  akurasi: number;
  level_tertinggi: number;
  tanggal: string;
  isCurrentPlayer?: boolean;
}
