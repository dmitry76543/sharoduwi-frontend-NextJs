const BADGES = [
  {
    icon: <path d="M5 13l4 4L19 7" />,
    text: "Доставка по Москве и Московской области",
  },
  {
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    text: "Срочная доставка ко времени",
  },
  {
    icon: (
      <path d="M12 2l2.4 7.4H22l-6 4.4 2.3 7.2L12 16.6 5.7 21l2.3-7.2-6-4.4h7.6z" />
    ),
    text: "На рынке с 2005 года",
  },
  {
    icon: <path d="M3 7h18M3 12h18M3 17h12" />,
    text: "Композиции под заказ",
  },
  {
    icon: (
      <>
        <path d="M21 10c0 6-9 11-9 11s-9-5-9-11a9 9 0 0118 0z" />
        <circle cx="12" cy="10" r="3" />
      </>
    ),
    text: "Два магазина в Жуковском",
  },
];

export function TopBar() {
  return (
    <div className="topbar">
      <div className="topbar-row">
        {BADGES.map((b) => (
          <span className="tb-badge" key={b.text}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              {b.icon}
            </svg>
            {b.text}
          </span>
        ))}
      </div>
    </div>
  );
}
