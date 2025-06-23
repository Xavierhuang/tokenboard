import React from 'react';

interface SecuritizeIconProps {
  className?: string;
}

const SecuritizeIcon = ({ className }: SecuritizeIconProps) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* The outer orange ring and dots */}
    <circle cx="12" cy="12" r="9.5" stroke="#F5A623" strokeWidth="1.5" />
    <circle cx="19.5" cy="12" r="2" fill="#F5A623" />
    <circle cx="4.5" cy="12" r="2" fill="#F5A623" />
    
    {/* The inner white circle */}
    <circle cx="12" cy="12" r="8" fill="white" />

    {/* The 'S' logo */}
    <path
      d="M14.998 8.00195C14.998 6.89738 14.1025 6.00195 12.998 6.00195C11.8934 6.00195 10.998 6.89738 10.998 8.00195C10.998 8.8353 11.5147 9.55364 12.25 9.85195"
      stroke="#00838F"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9.00195 15.998C9.00195 17.1026 9.89738 17.998 11.002 17.998C12.1065 17.998 13.002 17.1026 13.002 15.998C13.002 15.1647 12.4853 14.4463 11.75 14.148"
      stroke="#00838F"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default SecuritizeIcon; 