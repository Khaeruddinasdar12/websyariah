"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/lib/supabase";
import { fetchKategoriPegawai } from "@/lib/fetchKategoriPegawai";
import { normalizeKategoriIds } from "@/utils/kategoriPegawai";
import { resolveDosenImageUrl } from "@/utils/dosenImage";
import type { KategoriPegawai } from "@/types/kategoriPegawai";

const VISIBLE_CARDS = 4;

interface ProfessorCard {
  id: number;
  name: string;
  imageUrl?: string;
  urut: number;
}

function isProfessorCategory(category: KategoriPegawai): boolean {
  return [category.nama, category.nama_en, category.nama_ar].some(
    (name) => typeof name === "string" && /profesor|professor|أستاذ/i.test(name)
  );
}

function ProfessorPortrait({ person }: { person: ProfessorCard }) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(person.imageUrl) && !failed;

  return (
    <div className="pub-prof-photo">
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={person.imageUrl}
          alt=""
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="pub-prof-fallback" aria-hidden="true">
          <i className="fas fa-user"></i>
        </div>
      )}
    </div>
  );
}

function ProfessorCardView({ person, badge }: { person: ProfessorCard; badge: string }) {
  return (
    <article className="pub-prof-card">
      <ProfessorPortrait person={person} />
      <h3 className="pub-prof-name">{person.name}</h3>
      <p className="pub-prof-role">{badge}</p>
    </article>
  );
}

export default function HomeProfessors() {
  const { t } = useLanguage();
  const [people, setPeople] = useState<ProfessorCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const [kategoriResult, dosenResult] = await Promise.all([
          fetchKategoriPegawai(),
          supabase
            .from("dosens")
            .select("id, nama, prodi, urut, gambar")
            .order("urut", { ascending: true, nullsFirst: false }),
        ]);

        if (!active) return;
        if (dosenResult.error) throw dosenResult.error;

        const professorIds = new Set(
          kategoriResult.data.filter(isProfessorCategory).map((category) => category.id)
        );

        const cards = (dosenResult.data || [])
          .filter((item) => item && item.nama)
          .filter((item) =>
            normalizeKategoriIds(item.prodi).some((id) => professorIds.has(id))
          )
          .map((item) => ({
            id: Number(item.id),
            name: String(item.nama),
            imageUrl: resolveDosenImageUrl(item),
            urut: Number(item.urut) || 999,
          }))
          .sort((a, b) => a.urut - b.urut || a.id - b.id);

        setPeople(cards);
      } catch (error) {
        console.error("Error fetching professors:", error);
        if (active) setPeople([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  if (!loading && people.length === 0) return null;

  const badge = t("home.professors.badge");
  const useSlider = people.length > VISIBLE_CARDS;
  const cards = people.map((person) => (
    <ProfessorCardView key={person.id} person={person} badge={badge} />
  ));

  return (
    <section className="pub-section pub-reveal pub-professors" aria-labelledby="home-professors-title">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pub-prof-intro">
          <div>
            <p className="pub-kicker">{t("home.professors.kicker")}</p>
            <h2 id="home-professors-title" className="pub-h2">
              {t("home.professors.title")}
            </h2>
            <p className="pub-prof-lead">{t("home.professors.lead")}</p>
            <Link href="/tim-kami?kategori=profesor" className="pub-btn pub-prof-cta">
              {t("home.professors.cta")}
              <i className="fas fa-arrow-right text-xs" aria-hidden="true"></i>
            </Link>
          </div>
          <div className="pub-prof-facts" aria-label={t("home.professors.factsLabel")}>
            <article>
              <strong>20</strong>
              <span>{t("home.professors.statInstitute")}</span>
            </article>
            <article className="is-focus">
              <strong>4</strong>
              <span>{t("home.professors.statFaculty")}</span>
            </article>
          </div>
        </div>

        {loading ? (
          <div className="pub-prof-grid" aria-hidden="true">
            {Array.from({ length: VISIBLE_CARDS }, (_, index) => (
              <div key={index} className="pub-prof-card">
                <div className="pub-prof-photo pub-prof-photo-loading" />
              </div>
            ))}
          </div>
        ) : useSlider ? (
          <Swiper
            modules={[Navigation, Pagination]}
            navigation
            pagination={{ clickable: true }}
            spaceBetween={16}
            slidesPerView={2}
            watchOverflow
            breakpoints={{
              1024: { slidesPerView: VISIBLE_CARDS, spaceBetween: 20 },
            }}
            className="prof-swiper"
          >
            {people.map((person) => (
              <SwiperSlide key={person.id}>
                <ProfessorCardView person={person} badge={badge} />
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="pub-prof-grid">{cards}</div>
        )}
      </div>
    </section>
  );
}
