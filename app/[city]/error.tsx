"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function CityRouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="sec info-page" style={{ paddingTop: 120, minHeight: "50vh" }}>
      <div className="wrap">
        <div className="info-hero reveal in">
          <h1>Не удалось загрузить страницу</h1>
          <p className="info-lead">
            Произошла ошибка при открытии раздела. Попробуйте ещё раз или вернитесь на главную.
          </p>
          <p>
            <button type="button" className="btn btn-primary" onClick={reset}>
              Повторить
            </button>{" "}
            <Link href="/" className="btn btn-ghost">
              На главную
            </Link>{" "}
            <Link href="/cities" className="btn btn-ghost">
              Место доставки
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
