import type { PpidContent } from './types';

const digitalFile = 'File Digital';

export const ppidContentId: PpidContent = {
  intro: [
    'Undang-Undang Nomor 14 Tahun 2008 tentang Keterbukaan Informasi Publik merupakan momentum penting dalam mendorong implementasi keterbukaan informasi di Indonesia. Undang-undang ini memberikan landasan hukum terhadap setiap orang untuk memperoleh informasi dan mewajibkan Badan Publik menyediakan serta melayani permohonan informasi secara tepat, tepat waktu, biaya ringan, profesional, dan dengan cara yang sederhana.',
    'Sebagai wujud komitmen terhadap keterbukaan informasi publik, Institut Agama Islam Negeri (IAIN) Bone melalui Pejabat Pengelola Informasi dan Dokumentasi (PPID) menyediakan berbagai informasi publik yang dapat diakses oleh masyarakat sesuai dengan ketentuan peraturan perundang-undangan.',
  ],
  downloadUrl: 'https://febi.iain-bone.ac.id/ppid',
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
          title:
            'Informasi IAIN Bone yang meliputi visi dan misi, tujuan serta sasaran, struktur organisasi, profil singkat pejabat struktural, peta, alamat dan kontak IAIN Bone',
          summary:
            'Informasi IAIN Bone yang meliputi visi dan misi, tujuan serta sasaran, struktur organisasi, profil singkat pejabat struktural, peta, alamat dan kontak IAIN Bone',
          unit: 'Fungsi Kehumasan, UPT TIPD',
          format: digitalFile,
        },
        {
          no: '2',
          title: 'LHKPN Pimpinan',
          summary: 'Memuat informasi LHKPN Rektor dan Wakil Rektor',
          unit: 'SPI, Fungsi OKH',
          format: digitalFile,
        },
        { no: 'a.', title: 'Rektor', summary: 'Memuat informasi LHKPN Rektor dan Wakil Rektor', unit: 'SPI, Fungsi OKH', format: digitalFile, isSubRow: true },
        { no: 'b.', title: 'Wakil Rektor I', summary: 'Memuat informasi LHKPN Rektor dan Wakil Rektor', unit: 'SPI, Fungsi OKH', format: digitalFile, isSubRow: true },
        { no: 'c.', title: 'Wakil Rektor II', summary: 'Memuat informasi LHKPN Rektor dan Wakil Rektor', unit: 'SPI, Fungsi OKH', format: digitalFile, isSubRow: true },
        { no: 'd.', title: 'Wakil Rektor III', summary: 'Memuat informasi LHKPN Rektor dan Wakil Rektor', unit: 'SPI, Fungsi OKH', format: digitalFile, isSubRow: true },
        { no: 'e.', title: 'Pejabat Lainnya', summary: 'Memuat informasi LHKPN para pejabat yang wajib LHKPN', unit: 'SPI, Fungsi OKH', format: digitalFile, isSubRow: true },
        {
          no: '3',
          title: 'Program atau Kegiatan Tahun 2025',
          summary:
            'Menyediakan informasi seluruh nama program, kegiatan, penanggung jawab, sumber dan besaran anggaran serta jadwal pelaksanaan',
          unit: 'Fungsi Perencanaan',
          format: digitalFile,
        },
        {
          no: '4',
          title: 'Program Strategis atau Prioritas Tahun 2025',
          summary:
            'Menyajikan informasi program strategis/prioritas yang dilengkapi sumber dan besaran anggaran, target dan realisasi penyelesaian serta penanggung jawab',
          unit: 'Fungsi Perencanaan',
          format: digitalFile,
        },
        {
          no: '5',
          title: 'Kalender Akademik',
          summary: 'Menyajikan informasi elektronik maupun data digital.',
          unit: 'Subbagian Layanan Akademik',
          format: digitalFile,
        },
        {
          no: '6',
          title: 'Informasi yang berkaitan dengan hak-hak Sivitas Akademika',
          summary:
            'Menyajikan informasi yang berkaitan dengan hak-hak civitas akademik (beasiswa, hibah, UKT, Kartu Indonesia Pintar, dll)',
          unit: 'Subbagian Layanan Akademik',
          format: digitalFile,
        },
        {
          no: '7',
          title: 'Informasi Penerimaan Calon Pegawai dan/atau Pejabat Negara',
          summary:
            'Menyajikan informasi elektronik tentang seleksi pegawai atau seleksi terbuka pimpinan dan sejenisnya',
          unit: 'Fungsi OKH',
          format: digitalFile,
        },
        {
          no: '8',
          title: 'Ringkasan kinerja atas program/kegiatan yang telah maupun sedang dilaksanakan',
          summary:
            'Menyajikan informasi capaian realisasi kegiatan yang telah atau sedang dilaksanakan di tahun 2025 dan disertai dokumen terkait',
          unit: 'Fungsi Perencanaan',
          format: digitalFile,
        },
        {
          no: '9',
          title: 'Dokumen Laporan Tahunan',
          summary: 'Menyajikan informasi elektronik dan dokumen digital tentang laporan tahunan',
          unit: 'Fungsi Perencanaan',
          format: digitalFile,
        },
        {
          no: '10',
          title: 'Laporan Keuangan',
          summary: 'Laporan Keuangan yang telah diaudit.',
          unit: 'Fungsi Keuangan',
          format: digitalFile,
        },
        { no: 'a.', title: 'Laporan Keuangan yang telah diaudit', summary: 'Laporan Keuangan yang telah diaudit.', unit: 'Fungsi Keuangan', format: digitalFile, isSubRow: true },
        { no: 'b.', title: 'Realisasi Penerimaan dan Penggunaan UKT', summary: 'Menyajikan informasi dalam bentuk informasi Realisasi penerimaan dan penggunaan UKT Tahun', unit: 'Fungsi Keuangan', format: digitalFile, isSubRow: true },
        { no: 'c.', title: 'Realisasi Penggunaan Anggaran Tahun Berjalan', summary: 'Menyajikan informasi dalam bentuk informasi Realisasi penerimaan dan penggunaan UKT', unit: 'Fungsi Keuangan', format: digitalFile, isSubRow: true },
        { no: 'd.', title: 'Informasi Keuangan Lainnya', summary: 'Informasi Keuangan Lainnya.', unit: 'Fungsi Keuangan', format: digitalFile, isSubRow: true },
        {
          no: '11',
          title: 'Ringkasan Akses Laporan Informasi Publik',
          summary: 'Ringkasan Akses Laporan Informasi Publik',
          unit: 'Fungsi Kehumasan, PPID',
          format: digitalFile,
        },
        { no: 'a.', title: 'Jumlah Permintaan Informasi Publik yang diterima', summary: 'Ringkasan Akses Laporan Informasi Publik', unit: 'Fungsi Kehumasan, PPID', format: digitalFile, isSubRow: true },
        { no: 'b.', title: 'Waktu yang diperlukan dalam memenuhi setiap Permintaan Informasi Publik', summary: 'Ringkasan Akses Laporan Informasi Publik', unit: 'Fungsi Kehumasan, PPID', format: digitalFile, isSubRow: true },
        { no: 'c.', title: 'Jumlah Permintaan Informasi Publik yang dikabulkan baik sebagian atau seluruhnya dan Permintaan Informasi Publik yang ditolak', summary: 'Ringkasan Akses Laporan Informasi Publik', unit: 'Fungsi Kehumasan, PPID', format: digitalFile, isSubRow: true },
        { no: 'd.', title: 'Alasan Penolakan Permintaan Informasi Publik', summary: 'Ringkasan Akses Laporan Informasi Publik', unit: 'Fungsi Kehumasan, PPID', format: digitalFile, isSubRow: true },
        {
          no: '12',
          title: 'Informasi Tentang Peraturan, Keputusan, dan/atau Kebijakan yang Mengikat',
          summary: 'Informasi Tentang Peraturan, Keputusan, dan/atau Kebijakan yang Mengikat',
          unit: 'Fungsi OKH',
          format: digitalFile,
        },
        { no: 'a.', title: 'Daftar Rancangan dan Tahap Pembentukan', summary: 'Informasi Tentang Peraturan, Keputusan, dan/atau Kebijakan yang Mengikat', unit: 'Fungsi OKH', format: digitalFile, isSubRow: true },
        { no: 'b.', title: 'Daftar Peraturan Perundang-Undangan, Keputusan atau Kebijakan yang telah disahkan', summary: 'Informasi Tentang Peraturan, Keputusan, dan/atau Kebijakan yang Mengikat', unit: 'Fungsi OKH', format: digitalFile, isSubRow: true },
        {
          no: '13',
          title: 'Prosedur Memperoleh Informasi Publik',
          summary: 'Menyajikan informasi Prosedur Memperoleh Informasi Publik',
          unit: 'Fungsi Kehumasan, PPID',
          format: digitalFile,
        },
        { no: 'a.', title: 'Tata Cara Memperoleh Informasi Publik', summary: 'Menyajikan informasi Prosedur Memperoleh Informasi Publik', unit: 'Fungsi Kehumasan, PPID', format: digitalFile, isSubRow: true },
        { no: 'b.', title: 'Tata Cara Pengajuan Keberatan', summary: 'Menyajikan informasi Prosedur Memperoleh Informasi Publik', unit: 'Fungsi Kehumasan, PPID', format: digitalFile, isSubRow: true },
        { no: 'c.', title: 'Tata Cara Proses Penyelesaian Sengketa Informasi Publik', summary: 'Menyajikan informasi Prosedur Memperoleh Informasi Publik', unit: 'Fungsi Kehumasan, PPID', format: digitalFile, isSubRow: true },
        {
          no: '14',
          title:
            'Tata Cara Pengaduan Penyalahgunaan Wewenang atau Pelanggaran yang dilakukan oleh Pejabat Perguruan Tinggi',
          summary: 'Menyajikan informasi Prosedur Memperoleh Informasi Publik',
          unit: 'SPI',
          format: digitalFile,
        },
      ],
    },
    {
      id: 'setiap-saat',
      number: 2,
      title: 'Informasi Wajib Tersedia Setiap Saat',
      description:
        'Informasi yang wajib tersedia setiap saat dan dapat diakses masyarakat sesuai prosedur layanan informasi publik.',
      rows: [
        {
          no: '15',
          title: 'Daftar Informasi Publik',
          summary:
            'Menyediakan Daftar Informasi Publik terakhir yang telah ditetapkan sesuai dengan format Perki 1/2021',
          unit: 'Fungsi Kehumasan, UPT TIPD',
          format: digitalFile,
        },
        {
          no: '16',
          title: 'Informasi tentang peraturan, keputusan, dan/atau kebijakan PTN Tahun 2023-2025 yang terdiri dari',
          summary: 'Informasi tentang peraturan, keputusan, dan/atau kebijakan PTN',
          unit: 'Fungsi OKH',
          format: digitalFile,
        },
        { no: 'a.', title: 'Masukan-Masukan dari Berbagai Pihak atas Peraturan, Keputusan dan Kebijakan', summary: 'Menyediakan daftar dokumen masukan-masukan dari berbagai pihak atas peraturan, keputusan atau kebijakan yang dibentuk', unit: 'Fungsi OKH', format: digitalFile, isSubRow: true },
        { no: 'b.', title: 'Risalah Rapat', summary: 'Menyediakan daftar dokumen risalah rapat dari proses pembentukan peraturan, keputusan atau kebijakan yang dibentuk', unit: 'Fungsi OKH', format: digitalFile, isSubRow: true },
        { no: 'c.', title: 'Dokumen rancangan peraturan, keputusan kebijakan yang dibentuk', summary: 'Menyediakan daftar dokumen rancangan peraturan, keputusan kebijakan yang dibentuk', unit: 'Fungsi OKH', format: digitalFile, isSubRow: true },
        { no: 'd.', title: 'Dokumen tahap perumusan peraturan, keputusan atau kebijakan yang dibentuk', summary: 'Menyediakan daftar dokumen tahap perumusan peraturan, keputusan atau kebijakan yang dibentuk', unit: 'Fungsi OKH', format: digitalFile, isSubRow: true },
        { no: 'e.', title: 'Dokumen peraturan, keputusan dan/atau kebijakan yang telah diterbitkan', summary: 'Menyediakan daftar dokumen peraturan, keputusan dan/atau kebijakan yang telah diterbitkan.', unit: 'Fungsi OKH', format: digitalFile, isSubRow: true },
        {
          no: '17',
          title: 'Informasi tentang organisasi, administrasi, kepegawaian',
          summary: 'Informasi tentang organisasi, administrasi, kepegawaian',
          unit: 'Fungsi OKH',
          format: digitalFile,
        },
        { no: 'a.', title: 'Dokumen pedoman pengelolaan organisasi, administrasi, personil dan keuangan', summary: 'Daftar Dokumen pedoman pengelolaan organisasi, administrasi, personil', unit: 'Fungsi OKH', format: digitalFile, isSubRow: true },
        { no: 'b.', title: 'Dokumen profil pimpinan dan pegawai', summary: 'Dokumen profil pimpinan dan pegawai', unit: 'Fungsi OKH', format: digitalFile, isSubRow: true },
        {
          no: '18',
          title:
            'Surat menyurat pimpinan atau pejabat dalam rangka pelaksanaan tugas, fungsi, dan wewenangnya Tahun 2023-2025',
          summary:
            'Surat menyurat pimpinan atau pejabat dalam rangka pelaksanaan tugas, fungsi, dan wewenangnya Tahun 2023-2025',
          unit: 'Bagian Umum dan Layanan Akademik',
          format: digitalFile,
        },
        {
          no: '19',
          title:
            'Jumlah, jenis, dan gambaran umum pelanggaran yang ditemukan dalam pengawasan internal serta laporan penindakannya',
          summary:
            'Jumlah, jenis, dan gambaran umum pelanggaran yang ditemukan dalam pengawasan internal serta laporan penindakannya',
          unit: 'SPI',
          format: digitalFile,
        },
        {
          no: '20',
          title: 'Data perbendaharaan atau inventaris 2023-2025',
          summary: 'Data perbendaharaan atau inventaris 2023-2025',
          unit: 'Bagian Umum dan Layanan Akademik',
          format: digitalFile,
        },
        {
          no: '21',
          title: 'Rencana Strategis IAIN Bone',
          summary: 'Rencana Strategis IAIN Bone',
          unit: 'Fungsi Perencanaan',
          format: digitalFile,
        },
      ],
    },
    {
      id: 'serta-merta',
      number: 3,
      title: 'Informasi Wajib Diumumkan Serta Merta',
      description:
        'Informasi yang wajib diumumkan segera apabila terdapat keadaan yang dapat mengancam hajat hidup orang banyak maupun ketertiban umum.',
      rows: [
        {
          no: '22',
          title: 'Berita kegiatan IAIN Bone',
          summary: 'Berita kegiatan IAIN Bone',
          unit: 'Fungsi Kehumasan, PPID',
          format: digitalFile,
        },
        {
          no: '23',
          title: 'Edaran, Instruksi dan pengumuman Rektor IAIN Bone',
          summary: 'Edaran, Instruksi dan pengumuman Rektor IAIN Bone',
          unit: 'Fungsi Kehumasan, PPID',
          format: digitalFile,
        },
      ],
    },
  ],
};
