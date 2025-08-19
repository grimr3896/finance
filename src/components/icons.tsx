import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 128 128"
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <g transform="translate(64, 48) scale(0.8)">
        <path d="M0,0 A30,15 0 1,1 0,-1 Q0,0 15,0 T0,0" fill="currentColor" stroke="none" />
        <path d="M0,0 A40,20 0 1,0 0,1 Q0,0 -20,0 T0,0" stroke="currentColor" strokeWidth="6" fill="none" />
        <path d="M -45 15 l 5 5 l -5 5 l -5 -5 z" fill="currentColor" stroke="none" />
        <path d="M -35 -25 l 3 3 l -3 3 l -3 -3 z" fill="currentColor" stroke="none" />
        <path d="M 40 -20 l 4 4 l -4 4 l -4 -4 z" fill="currentColor" stroke="none" />
        <path d="M 50 10 l 3 3 l -3 3 l -3 -3 z" fill="currentColor" stroke="none" />
      </g>
    </svg>
  );
}
