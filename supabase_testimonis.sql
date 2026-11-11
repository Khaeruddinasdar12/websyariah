-- Testimoni alumni untuk halaman Tentang
CREATE TABLE IF NOT EXISTS public.testimonis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama text NOT NULL,
  nama_en text,
  nama_ar text,
  peran text NOT NULL,
  peran_en text,
  peran_ar text,
  kutipan text NOT NULL,
  kutipan_en text,
  kutipan_ar text,
  inisial text,
  urut integer,
  aktif boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.testimonis ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active testimonis" ON public.testimonis;
DROP POLICY IF EXISTS "Authenticated can read testimonis" ON public.testimonis;
DROP POLICY IF EXISTS "Authenticated can insert testimonis" ON public.testimonis;
DROP POLICY IF EXISTS "Authenticated can update testimonis" ON public.testimonis;
DROP POLICY IF EXISTS "Authenticated can delete testimonis" ON public.testimonis;

CREATE POLICY "Public can read active testimonis"
ON public.testimonis
FOR SELECT
TO anon
USING (aktif = true);

CREATE POLICY "Authenticated can read testimonis"
ON public.testimonis
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated can insert testimonis"
ON public.testimonis
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated can update testimonis"
ON public.testimonis
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated can delete testimonis"
ON public.testimonis
FOR DELETE
TO authenticated
USING (true);

GRANT SELECT ON public.testimonis TO anon, authenticated, service_role;
GRANT INSERT, UPDATE, DELETE ON public.testimonis TO authenticated, service_role;

INSERT INTO public.testimonis (
  nama, nama_en, nama_ar,
  peran, peran_en, peran_ar,
  kutipan, kutipan_en, kutipan_ar,
  inisial, urut
)
SELECT *
FROM (
  VALUES
  ($q$Putra Ramadhan, S.H., M.H.$q$, $q$Putra Ramadhan, S.H., M.H.$q$, $q$بترا رمضان، S.H.، M.H.$q$, $q$Alumni 2022 | Hukum Keluarga Islam (Ahwalu Syakhsiyah) | ASN Penghulu Kemenag Bone$q$, $q$Alumni 2022 | Islamic Family Law (Ahwalu Syakhsiyah) | Civil Servant - Religious Affairs Officer Kemenag Bone$q$, $q$خريج 2022 | قانون الأسرة الإسلامي (أحوال شخصية) | موظف حكومي - مسؤول الشؤون الدينية كمناج بوني$q$, $q$Saya sangat bersyukur pernah menempuh pendidikan di Prodi Hukum Keluarga Islam (HKI) Fakultas Syariah dan Hukum Islam IAIN Bone, karena ilmu yang diperoleh sangat bermanfaat bagi profesi yang saat ini diemban yakni sebagai Penghulu di Kementerian Agama Kab. Bone.$q$, $q$I am very grateful to have studied at the Islamic Family Law (HKI) Study Program, Faculty of Sharia and Islamic Law IAIN Bone, because the knowledge I gained is very useful for my current profession as a Religious Affairs Officer at the Ministry of Religion of Bone Regency.$q$, $q$أنا ممتن جداً لأنني درست في برنامج قانون الأسرة الإسلامي (HKI) كلية الشريعة والقانون الإسلامي IAIN Bone، لأن المعرفة التي حصلت عليها مفيدة جداً لمهنتي الحالية كمسؤول الشؤون الدينية في وزارة الشؤون الدينية لمقاطعة بوني.$q$, $q$PR$q$, 1),
  ($q$Ahmad Afandi, S.H., M.H.$q$, $q$Ahmad Afandi, S.H., M.H.$q$, $q$أحمد أفندي، S.H.، M.H.$q$, $q$Alumni 2023 | Hukum Tatanegara (Siyasah Syar'iyyah) | ASN Penghulu Kemenag Bone$q$, $q$Alumni 2023 | Constitutional Law (Siyasah Syar'iyyah) | Civil Servant - Religious Affairs Officer Kemenag Bone$q$, $q$خريج 2023 | القانون الدستوري (سياسة شرعية) | موظف حكومي - مسؤول الشؤون الدينية كمناج بوني$q$, $q$Saya bangga menjadi bagian dari Fakultas Syariah dan Hukum Islam IAIN Bone. Ilmu dan pengalaman yang saya peroleh tidak hanya memperkuat pemahaman hukum konvensional, tetapi juga hukum islam dan membentuk karakter serta profesionalitas saya. Semoga fakultas ini terus maju dan melahirkan lulusan yang berintegritas serta siap menghadapi tantangan zaman.$q$, $q$I am proud to be part of the Faculty of Sharia and Islamic Law IAIN Bone. The knowledge and experience I gained not only strengthened my understanding of conventional law, but also Islamic law and shaped my character and professionalism. May this faculty continue to progress and produce graduates with integrity who are ready to face the challenges of the times.$q$, $q$أنا فخور بأن أكون جزءاً من كلية الشريعة والقانون الإسلامي IAIN Bone. المعرفة والخبرة التي حصلت عليها لم تقوّي فقط فهمي للقانون التقليدي، ولكن أيضاً القانون الإسلامي وشكّلت شخصيتي ومهنتي. أتمنى أن تستمر هذه الكلية في التقدم وتنتج خريجين ذوي نزاهة مستعدين لمواجهة تحديات العصر.$q$, $q$AA$q$, 2),
  ($q$Vivin Sanjaya, S.H.$q$, $q$Vivin Sanjaya, S.H.$q$, $q$فيفين سانجايا، S.H.$q$, $q$Alumni 2014 | Hukum Tata Negara | PNS Badan Pengawas Pemilu (BAWASLU)$q$, $q$Alumni 2014 | Constitutional Law | Civil Servant - Election Supervisory Agency (BAWASLU)$q$, $q$خريج 2014 | القانون الدستوري | موظف حكومي - هيئة مراقبة الانتخابات (BAWASLU)$q$, $q$Menempuh pendidikan di Prodi Hukum Tata Negara IAIN Bone adalah salah satu keputusan terbaik dalam hidup saya. Di sini, saya tidak hanya belajar tentang konstitusi dan hukum pemerintahan, tetapi juga nilai-nilai etika, integritas, dan tanggung jawab sebagai warga negara yang berkeadilan. Para dosen di Prodi HTN membimbing saya dengan pendekatan akademik yang kritis namun penuh keteladanan. Diskusi tentang demokrasi, pemilu, dan politik Islam yang saya peroleh di bangku kuliah menjadi bekal penting dalam menjalankan tugas sebagai aparatur di BAWASLU. Saya bangga menjadi bagian dari keluarga besar HTN IAIN Bone. Prodi ini bukan hanya mencetak sarjana hukum, tetapi membentuk generasi yang siap mengawal demokrasi dan menjaga marwah bangsa dengan ilmu dan akhlak.$q$, $q$Studying at the Constitutional Law Study Program IAIN Bone was one of the best decisions in my life. Here, I not only learned about constitution and government law, but also ethical values, integrity, and responsibility as a just citizen. The lecturers at the HTN Study Program guided me with a critical yet exemplary academic approach. Discussions about democracy, elections, and Islamic politics that I gained in the classroom became important provisions in carrying out my duties as an official at BAWASLU. I am proud to be part of the HTN IAIN Bone family. This study program does not only produce law graduates, but forms a generation ready to guard democracy and maintain the nation's dignity with knowledge and character.$q$, $q$الدراسة في برنامج القانون الدستوري IAIN Bone كانت واحدة من أفضل القرارات في حياتي. هنا، لم أتعلم فقط عن الدستور وقانون الحكومة، ولكن أيضاً القيم الأخلاقية والنزاهة والمسؤولية كمواطن عادل. الأساتذة في برنامج HTN أرشدوني بنهج أكاديمي نقدي لكن مليء بالقدوة. المناقشات حول الديمقراطية والانتخابات والسياسة الإسلامية التي حصلت عليها في الفصل الدراسي أصبحت أحكاماً مهمة في تنفيذ واجباتي كمسؤول في BAWASLU. أنا فخور بأن أكون جزءاً من عائلة HTN IAIN Bone. هذا البرنامج الدراسي لا ينتج فقط خريجي قانون، ولكن يشكل جيلاً مستعداً لحماية الديمقراطية والحفاظ على كرامة الأمة بالمعرفة والخلق.$q$, $q$VS$q$, 3),
  ($q$A. Muh. Taufiqurrahman, Y$q$, $q$A. Muh. Taufiqurrahman, Y$q$, $q$أ. مح. توفيق الرحمن، Y$q$, $q$Alumni 2025 | Hukum Tata Negara | Tentara Nasional Indonesia (TNI)$q$, $q$Alumni 2025 | Constitutional Law | Indonesian National Armed Forces (TNI)$q$, $q$خريج 2025 | القانون الدستوري | القوات المسلحة الوطنية الإندونيسية (TNI)$q$, $q$Belajar di Prodi Hukum Tata Negara IAIN Bone telah memberikan saya bekal yang sangat berharga, bukan hanya dalam bidang akademik, tetapi juga dalam pembentukan karakter. Nilai-nilai disiplin, tanggung jawab, dan pengabdian kepada bangsa yang saya pelajari di kampus menjadi dasar kuat dalam menjalankan tugas sebagai prajurit TNI. Kajian tentang konstitusi, negara, dan etika kepemimpinan yang diajarkan di HTN membuka wawasan saya tentang pentingnya menjaga kedaulatan hukum dan martabat bangsa. Prodi ini tidak hanya mengajarkan teori, tetapi membentuk mental pemimpin yang siap berdiri di garis terdepan demi keadilan dan keamanan negara. Saya bangga menjadi bagian dari keluarga besar HTN IAIN Bone. Di sinilah saya belajar bahwa pengabdian kepada negara harus didasari oleh ilmu, iman, dan integritas.$q$, $q$Studying at the Constitutional Law Study Program IAIN Bone has given me very valuable provisions, not only in the academic field, but also in character building. The values of discipline, responsibility, and dedication to the nation that I learned on campus became a strong foundation in carrying out my duties as a TNI soldier. Studies about constitution, state, and leadership ethics taught at HTN opened my insight into the importance of maintaining legal sovereignty and national dignity. This study program does not only teach theory, but forms a leader's mentality ready to stand at the forefront for justice and national security. I am proud to be part of the HTN IAIN Bone family. Here I learned that dedication to the country must be based on knowledge, faith, and integrity.$q$, $q$الدراسة في برنامج القانون الدستوري IAIN Bone أعطتني أحكاماً قيمة جداً، ليس فقط في المجال الأكاديمي، ولكن أيضاً في بناء الشخصية. قيم الانضباط والمسؤولية والتكريس للأمة التي تعلمتها في الحرم الجامعي أصبحت أساساً قوياً في تنفيذ واجباتي كجندي TNI. الدراسات حول الدستور والدولة وأخلاق القيادة التي تُدرس في HTN فتحت بصيرتي حول أهمية الحفاظ على سيادة القانون وكرامة الأمة. هذا البرنامج الدراسي لا يعلّم فقط النظرية، ولكن يشكل عقلية القائد المستعدة للوقوف في الخط الأمامي من أجل العدالة والأمن الوطني. أنا فخور بأن أكون جزءاً من عائلة HTN IAIN Bone. هنا تعلمت أن التكريس للدولة يجب أن يكون قائماً على المعرفة والإيمان والنزاهة.$q$, $q$AT$q$, 4)
) AS seed (
  nama, nama_en, nama_ar,
  peran, peran_en, peran_ar,
  kutipan, kutipan_en, kutipan_ar,
  inisial, urut
)
WHERE NOT EXISTS (SELECT 1 FROM public.testimonis);
