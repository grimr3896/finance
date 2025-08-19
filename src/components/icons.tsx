import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M14.5 17.5c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3" />
      <path d="M11.5 14.5v-10" />
      <path d="M10 3.5h3" />
      <path d="M13 3.5h3" />
      <path d="M16 12a4 4 0 0 1-8 0" />
      <path d="M16 12h2a6 6 0 0 0-12 0h2" />
    </svg>
  );
}
