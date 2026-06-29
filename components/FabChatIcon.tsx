import type { SVGProps } from "react";

export function FabChatIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M12 21a8.2 8.2 0 005.45-2.05L21 21l-2.05-5.45A8.2 8.2 0 1112 21z" />
    </svg>
  );
}
