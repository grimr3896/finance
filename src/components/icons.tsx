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
      <path d="M12 5c3.5 0 6.2 2 7.1 5.2.9 3.2.1 6.3-2.3 8.4-2.4 2.1-5.6 2.7-8.8 1.9-3.2-.8-5.8-3-7-6.2C.1 11.2 1.3 7.1 4.2 4.6 7.1 2.1 10.5 2 12 5Z" />
      <path d="M12 12c-2 0-3.5-1.5-3.5-3.5S10 5 12 5s3.5 1.5 3.5 3.5" />
      <path d="M19.5 10.5 21 8" />
      <path d="m3.5 14.5 1 2" />
      <path d="M15 20.5 14 19" />
    </svg>
  );
}
