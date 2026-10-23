const paths = {
  arrow: "M5 12h14M13 6l6 6-6 6",
  northeast: "M6 18 18 6M6 6h12v12",
  down: "M12 4v16M5 13l7 7 7-7",
  sound: "M11 5 6 9H3v6h3l5 4V5ZM15 8c3 2 3 6 0 8M18 5c5 4 5 10 0 14",
  mute: "M11 5 6 9H3v6h3l5 4V5ZM16 9l5 6M21 9l-5 6",
  map: "m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2V5Zm6-2v16m6-14v16",
  close: "m6 6 12 12M18 6 6 18",
  mail: "M3 5h18v14H3V5Zm0 0 9 8 9-8",
  home: "m3 10 9-7 9 7M5 9v12h14V9M9 21v-8h6v8",
};
export default function Icon({ name = "arrow", size = 20, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d={paths[name] || paths.arrow} />
    </svg>
  );
}
