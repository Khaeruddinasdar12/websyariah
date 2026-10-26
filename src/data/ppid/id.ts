import type { PpidContent } from './types';
import { ppidLinks as link } from './links';

const profilSummary =
  'Informasi IAIN Bone yang meliputi visi dan misi, tujuan serta sasaran, struktur organisasi, profil singkat pejabat struktural, peta, alamat dan kontak IAIN Bone';
const prosedurSummary = 'Menyajikan informasi Prosedur Memperoleh Informasi Publik';
const aksesSummary = 'Ringkasan Akses Laporan Informasi Publik';
const peraturanSummary = 'Informasi Tentang Peraturan, Keputusan, dan/atau Kebijakan yang Mengikat';

export const ppidContentId: PpidContent = {
  intro: [
    'Undang-Undang Nomor 14 Tahun 2008 tentang Keterbukaan Informasi Publik merupakan momentum penting dalam mendorong implementasi keterbukaan informasi di Indonesia. Undang-undang ini memberikan landasan hukum terhadap setiap orang untuk memperoleh informasi dan mewajibkan Badan Publik menyediakan serta melayani permohonan informasi secara tepat, tepat waktu, biaya ringan, profesional, dan dengan cara yang sederhana.',
    'Sebagai wujud komitmen terhadap keterbukaan informasi publik, Institut Agama Islam Negeri (IAIN) Bone melalui Pejabat Pengelola Informasi dan Dokumentasi (PPID) menyediakan berbagai informasi publik yang dapat diakses oleh masyarakat sesuai dengan ketentuan peraturan perundang-undangan.',
  ],
  downloadUrl: link.downloadSk,
  requestUrl: link.permohonan,
  sections: [
    {
      id: 'berkala',
      number: 1,
      title: 'Informasi Publik Wajib Berkala',
      description:
        'Informasi yang wajib diumumkan secara berkala sebagai bentuk transparansi penyelenggaraan pelayanan publik.',
      rows: [
        {
          no: '1',
          title: 'Informasi IAIN Bone',
          summary: profilSummary,
          unit: 'Fungsi Kehumasan, UPT TIPD',
        },
        {
          no: 'a.',
          title: 'Visi dan Misi',
          summary: `${profilSummary} yang terbaru : Yang Terbaru`,
          unit: 'Fungsi Kehumasan, UPT TIPD',
          href: link.visiMisi,
          isSubRow: true,
        },
        {
          no: 'b.',
          title: 'Tujuan Serta Sasaran',
          summary: profilSummary,
          unit: 'Fungsi Kehumasan, UPT TIPD',
          href: link.tujuan,
          isSubRow: true,
        },
        {
          no: 'c.',
          title: 'Struktur Organisasi',
          summary: profilSummary,
          unit: 'Fungsi Kehumasan, UPT TIPD',
          href: link.organisasi,
          isSubRow: true,
        },
        {
          no: 'd.',
          title: 'Profil Singkat Pejabat Struktural',
          summary: profilSummary,
          unit: 'Fungsi Kehumasan, UPT TIPD',
          href: link.profilPejabat,
          isSubRow: true,
        },
        {
          no: 'e.',
          title: 'Peta, Alamat dan Kontak IAIN Bone',
          summary: profilSummary,
          unit: 'Fungsi Kehumasan, UPT TIPD',
          href: link.berandaHttp,
          isSubRow: true,
        },
        {
          no: '2',
          title: 'LHKPN Pimpinan',
          summary: 'Memuat informasi LHKPN Pejabat dan Pimpinan',
          unit: 'Rektor dan Wakil Rektor',
        },
        {
          no: 'a.',
          title: 'Rektor',
          summary: '-',
          unit: 'Rektor',
          href: link.lhkpn,
          isSubRow: true,
        },
        {
          no: 'b.',
          title: 'Wakil Rektor I',
          summary: 'LHKPN Tahun 2024-2026 Belum Tersedia, Awal Menjabat',
          unit: 'Wakil Rektor I',
          href: link.lhkpn,
          isSubRow: true,
        },
        {
          no: 'c.',
          title: 'Wakil Rektor II',
          summary: 'Memuat informasi LHKPN Rektor dan Wakil Rektor',
          unit: 'SPI, Fungsi OKH',
          href: link.lhkpn,
          isSubRow: true,
        },
        {
          no: 'd.',
          title: 'Wakil Rektor III',
          summary: 'LHKPN Tahun 2025-2026 Belum Tersedia, Awal Menjabat',
          unit: 'Wakil Rektor III',
          href: link.lhkpn,
          isSubRow: true,
        },
        {
          no: '3',
          title: 'Program atau Kegiatan Tahun 2025',
          summary:
            'Menyediakan informasi seluruh nama program, kegiatan, penanggung jawab, sumber dan besaran anggaran serta jadwal pelaksanaan.',
          unit: 'Fungsi Perencanaan',
          href: link.program,
        },
        {
          no: '4',
          title: 'Program Strategis atau Prioritas Tahun 2025',
          summary:
            'Menyajikan informasi baik dalam bentuk informasi program strategis/prioritas yang dilengkapi antara lain sumber dan besaran anggaran, target dan realisasi penyelesaian serta penanggung jawab',
          unit: 'Fungsi Perencanaan',
          href: link.program,
        },
        {
          no: '5',
          title: 'Kalender Akademik',
          summary: 'Menyajikan informasi berkaitan dengan pelaksanaan akademik.',
          unit: 'Subbagian Layanan Akademik',
          href: link.beranda,
        },
        {
          no: '6',
          title: 'Informasi yang berkaitan dengan hak-hak Sivitas Akademika',
          summary:
            'Menyajikan informasi baik dalam bentuk informasi khusus lainnya yang berkaitan dengan hak-hak civitas akademik (beasiswa, hibah, UKT, Kartu Indonesia Pintar, dll)',
          unit: 'Subbagian Layanan Akademik',
          href: link.berandaHttp,
        },
        {
          no: '7',
          title: 'Informasi Penerimaan Calon Pegawai dan/atau Pejabat Negara',
          summary:
            'Menyajikan informasi baik dalam bentuk informasi elektronik yang seleksi pegawai atau seleksi terbuka pimpinan dan sejenisnya',
          unit: 'Fungsi OKH',
          href: link.penerimaan,
        },
        {
          no: '8',
          title: 'Ringkasan kinerja atas program/kegiatan yang telah maupun sedang dilaksanakan',
          summary:
            'Menyajikan informasi dalam bentuk informasi elektronik atau sejenisnya yang memuat capaian realisasi kegiatan yang telah atau sedang dilaksanakan di tahun 2025 dan disertai dokumen terkait',
          unit: 'Fungsi Perencanaan',
          href: link.berandaHttp,
        },
        {
          no: '9',
          title: 'Dokumen Laporan Tahunan',
          summary: 'Menyajikan informasi dalam bentuk informasi elektronik dan dokumen digital tentang laporan tahunan',
          unit: 'Fungsi Perencanaan',
          href: link.berandaHttp,
        },
        {
          no: '10',
          title: 'Laporan Keuangan',
          summary: '',
          unit: '',
        },
        {
          no: 'a.',
          title: 'Laporan Keuangan yang telah diaudit',
          summary: 'Laporan Keuangan yang telah diaudit',
          unit: 'Fungsi Keuangan',
          href: link.berandaHttp,
          isSubRow: true,
        },
        {
          no: 'b.',
          title: 'Realisasi Penerimaan dan Penggunaan UKT',
          summary: 'Menyajikan informasi dalam bentuk informasi realisasi penerimaan dan penggunaan UKT',
          unit: 'Fungsi Keuangan',
          href: link.keuangan,
          isSubRow: true,
        },
        {
          no: 'c.',
          title: 'Realisasi Penggunaan Anggaran Tahun Berjalan',
          summary: 'Menyajikan informasi dalam bentuk informasi realisasi penerimaan dan penggunaan UKT',
          unit: 'Fungsi Keuangan',
          href: link.berandaHttp,
          isSubRow: true,
        },
        {
          no: 'd.',
          title: 'Informasi Keuangan Lainnya',
          summary: 'Informasi Keuangan Lainnya',
          unit: 'Fungsi Keuangan',
          href: link.berandaHttp,
          isSubRow: true,
        },
        {
          no: '11',
          title: 'Ringkasan Akses Laporan Informasi Publik',
          summary: '',
          unit: '',
        },
        {
          no: 'a.',
          title: 'Jumlah Permintaan Informasi Publik yang diterima',
          summary: aksesSummary,
          unit: 'Fungsi Kehumasan, PPID',
          href: link.berandaHttp,
          isSubRow: true,
        },
        {
          no: 'b.',
          title: 'Waktu yang diperlukan dalam memenuhi setiap Permintaan Informasi Publik',
          summary: aksesSummary,
          unit: 'Fungsi Kehumasan, PPID',
          href: link.berandaHttp,
          isSubRow: true,
        },
        {
          no: 'c.',
          title: 'Jumlah Permintaan Informasi Publik yang dikabulkan baik sebagian atau seluruhnya dan Permintaan Informasi Publik yang ditolak',
          summary: aksesSummary,
          unit: 'Fungsi Kehumasan, PPID',
          href: link.berandaHttp,
          isSubRow: true,
        },
        {
          no: 'd.',
          title: 'Alasan penolakan Permintaan Informasi Publik',
          summary: aksesSummary,
          unit: 'Fungsi Kehumasan, PPID',
          href: link.berandaHttp,
          isSubRow: true,
        },
        {
          no: '12',
          title: 'Informasi Tentang Peraturan, Keputusan, dan/atau Kebijakan yang Mengikat',
          summary: '',
          unit: '',
        },
        {
          no: 'a.',
          title: 'Daftar Rancangan dan Tahap Pembentukan',
          summary: peraturanSummary,
          unit: 'Fungsi OKH',
          href: link.berandaHttp,
          isSubRow: true,
        },
        {
          no: 'b.',
          title: 'Daftar Peraturan Perundang-Undangan, Keputusan atau Kebijakan yang telah disahkan',
          summary: peraturanSummary,
          unit: 'Fungsi OKH',
          href: link.peraturanDisahkan,
          isSubRow: true,
        },
        {
          no: '13',
          title: 'Prosedur Memperoleh Informasi Publik',
          summary: '',
          unit: '',
        },
        {
          no: 'a.',
          title: 'Tata Cara Memperoleh Informasi Publik',
          summary: prosedurSummary,
          unit: 'Fungsi Kehumasan, PPID',
          href: link.prosedurInfo,
          isSubRow: true,
        },
        {
          no: 'b.',
          title: 'Tata Cara Pengajuan Keberatan',
          summary: prosedurSummary,
          unit: 'Fungsi Kehumasan, PPID',
          href: link.keberatan,
          isSubRow: true,
        },
      ],
    },
    {
      id: 'serta-merta',
      number: 2,
      title: 'Informasi Wajib Diumumkan Serta Merta',
      description:
        'Informasi yang wajib diumumkan segera apabila terdapat keadaan yang dapat mengancam hajat hidup orang banyak maupun ketertiban umum.',
      rows: [
        {
          no: '1',
          title: 'Berita kegiatan IAIN Bone',
          summary: 'Berita kegiatan IAIN Bone',
          unit: 'Fungsi Kehumasan, PPID',
          href: link.berita,
        },
        {
          no: '2',
          title: 'Edaran, Instruksi dan pengumuman Rektor IAIN Bone',
          summary: 'Edaran, Instruksi dan pengumuman Rektor IAIN Bone',
          unit: 'Fungsi Kehumasan, PPID',
          href: link.pengumuman,
        },
      ],
    },
    {
      id: 'setiap-saat',
      number: 3,
      title: 'Informasi Wajib Tersedia Setiap Saat',
      description:
        'Informasi yang wajib tersedia setiap saat dan dapat diakses masyarakat sesuai prosedur layanan informasi publik.',
      rows: [
        {
          no: '1',
          title: 'Daftar Informasi Publik',
          summary:
            'Menyediakan Daftar Informasi Publik terakhir yang telah ditetapkan sesuai dengan format Perki 1/2021',
          unit: 'Fungsi Kehumasan, PPID',
          href: link.daftarInformasi,
        },
        {
          no: '2',
          title: 'Informasi tentang peraturan, keputusan, dan/atau kebijakan PTN Tahun 2023-2025 yang terdiri dari',
          summary: '',
          unit: '',
        },
        {
          no: 'a.',
          title: 'Masukan-Masukan dari Berbagai Pihak atas Peraturan, Keputusan dan Kebijakan',
          summary:
            'Menyediakan daftar dokumen masukan-masukan dari berbagai pihak atas peraturan, keputusan atau kebijakan yang dibentuk',
          unit: 'Fungsi OKH',
          href: link.berandaHttp,
          isSubRow: true,
        },
        {
          no: 'b.',
          title: 'Risalah Rapat',
          summary:
            'Menyediakan daftar dokumen risalah rapat dari proses pembentukan peraturan, keputusan atau kebijakan yang dibentuk',
          unit: 'Fungsi OKH',
          href: link.risalah,
          isSubRow: true,
        },
        {
          no: 'c.',
          title: 'Dokumen rancangan peraturan, keputusan kebijakan yang dibentuk',
          summary: 'Menyediakan daftar dokumen rancangan peraturan, keputusan kebijakan yang dibentuk',
          unit: 'Fungsi OKH',
          href: link.rancangan,
          isSubRow: true,
        },
        {
          no: 'd.',
          title: 'Dokumen tahap perumusan peraturan, keputusan atau kebijakan yang dibentuk',
          summary:
            'Menyediakan daftar dokumen tahap perumusan peraturan, keputusan atau kebijakan yang dibentuk',
          unit: 'Fungsi OKH',
          href: link.perumusan,
          isSubRow: true,
        },
        {
          no: 'e.',
          title: 'Dokumen peraturan, keputusan dan/atau kebijakan yang telah diterbitkan',
          summary: 'Menyediakan daftar dokumen peraturan, keputusan dan/atau kebijakan yang telah diterbitkan.',
          unit: 'Fungsi OKH',
          href: link.diterbitkan,
          isSubRow: true,
        },
        {
          no: '3',
          title: 'Informasi tentang organisasi, administrasi, kepegawaian',
          summary: '',
          unit: '',
        },
        {
          no: 'a.',
          title: 'Dokumen pedoman pengelolaan organisasi, administrasi, personil dan keuangan',
          summary: 'Daftar Dokumen pedoman pengelolaan organisasi, administrasi, personil',
          unit: 'Fungsi OKH',
          href: link.pedoman,
          isSubRow: true,
        },
        {
          no: 'b.',
          title: 'Dokumen profil pimpinan dan pegawai',
          summary: 'Dokumen profil pimpinan dan pegawai',
          unit: 'Fungsi OKH',
          href: link.profilPegawai,
          isSubRow: true,
        },
        {
          no: '4',
          title:
            'Surat menyurat pimpinan atau pejabat dalam rangka pelaksanaan tugas, fungsi, dan wewenangnya Tahun 2023-2025',
          summary:
            'Surat menyurat pimpinan atau pejabat dalam rangka pelaksanaan tugas, fungsi, dan wewenangnya Tahun 2023-2025',
          unit: 'Bagian Umum dan Layanan Akademik',
          href: link.surat,
        },
        {
          no: '5',
          title:
            'Jumlah, jenis, dan gambaran umum pelanggaran yang ditemukan dalam pengawasan internal serta laporan penindakannya',
          summary:
            'Jumlah, jenis, dan gambaran umum pelanggaran yang ditemukan dalam pengawasan internal serta laporan penindakannya',
          unit: 'SPI',
          href: link.pelanggaran,
        },
        {
          no: '6',
          title: 'Data perbendaharaan atau inventaris 2023-2025',
          summary: 'Data perbendaharaan atau inventaris 2023-2025',
          unit: 'Bagian Umum dan Layanan Akademik',
          href: link.inventaris,
        },
        {
          no: '7',
          title: 'Rencana Strategis IAIN Bone',
          summary: 'Rencana Strategis IAIN Bone',
          unit: 'Fungsi Perencanaan',
          href: link.renstra,
        },
      ],
    },
  ],
};
