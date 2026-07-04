import Link from "next/link";

import { getCityBySlug } from "@/lib/cities";

type CityNotFoundProps = {
  params?: Promise<{ city: string }>;
};

export default async function CityNotFound({ params }: CityNotFoundProps) {
  const cityParam = params ? (await params).city : "";
  const known = cityParam ? getCityBySlug(cityParam) : undefined;

  return (
    <main className="sec info-page" style={{ paddingTop: 120, minHeight: "60vh" }}>
      <div className="wrap">
        <div className="info-hero reveal in">
          <h1>Место доставки не найдено</h1>
          <p className="info-lead">
            {cityParam && !known
              ? `Регион «${cityParam}» не обслуживается. Выберите место из списка.`
              : "Страница не существует."}
          </p>
          <p>
            <Link href="/cities" className="btn btn-primary">
              Выбрать место доставки
            </Link>{" "}
            <Link href="/" className="btn btn-ghost">
              На главную
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
