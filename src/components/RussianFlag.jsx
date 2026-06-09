/**
 * Флаг РФ нарисован как SVG (а не эмодзи), чтобы корректно
 * отображаться во всех браузерах, включая Windows.
 */
export default function RussianFlag({ className = '' }) {
  return (
    <svg
      className={className}
      width="30"
      height="20"
      viewBox="0 0 9 6"
      role="img"
      aria-label="Россия"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="9" height="6" fill="#ffffff" />
      <rect y="2" width="9" height="2" fill="#0039a6" />
      <rect y="4" width="9" height="2" fill="#d52b1e" />
    </svg>
  );
}
