/** Shared little traveller: also used by the residents at the end of the world. */
export default function Character({ pose = 'idle', facing = 'right', girl = false, className = '' }) {
  return (
    <svg className={`traveller-character ${className}`} data-pose={pose} data-facing={facing} data-girl={girl || undefined} viewBox="0 0 90 110" fill="none" aria-hidden="true">
      <g className="traveller-body" stroke="#29271f" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
        {girl ? <path d="M32 32C24 47 27 66 23 71C30 75 57 74 66 68C59 60 64 40 56 30Z" fill="#493d31" /> : <g className="traveller-bag"><path d="M29 51C18 45 14 53 16 66L18 77L31 76Z" fill="#aa7950" /><path d="M18 60L29 60M20 51L21 45L28 45L30 52M18 70L26 70" /><path d="M20 62L20 67" stroke="#f4efdf" /></g>}
        <g className="traveller-leg traveller-leg-back"><path d="M48 76L52 92L52 102" /><path d="M51 102L62 104" strokeWidth="4" /></g>
        <g className="traveller-leg traveller-leg-front"><path d="M37 76L35 92L31 101" /><path d="M30 102L39 105" strokeWidth="4" /></g>
        <path d={girl ? 'M35 52L52 52L60 79Q43 84 28 77Z' : 'M34 51Q43 47 54 51L55 77Q43 81 31 76Z'} fill={girl ? '#bd816a' : '#7d8860'} />
        {!girl && <><path d="M33 53L36 73M51 52L50 73" stroke="#c0af86" strokeWidth="3" /><path d="M38 60L47 60" strokeWidth="1.4" /><path d="M42 53L43 60" stroke="#f4efdf" strokeWidth="1.2" /></>}
        <g className="traveller-arm traveller-arm-back"><path d="M34 56L25 66L30 76" /><circle cx="30" cy="76" r="2.8" fill="#d9b08a" /></g>
        <g className="traveller-head"><path d="M28 28C28 15 56 13 61 28L59 41C57 50 35 52 30 40Z" fill="#dfb991" /><path d="M28 32C20 23 29 15 32 15C32 8 43 11 46 12C55 7 63 15 62 22C67 25 63 34 59 34L57 25L48 29L42 24L33 29L32 35Z" fill="#343028" /><path d="M31 33C23 29 25 42 32 40" fill="#dfb991" />
          <g className="traveller-face"><path d="M43 34L43 36M54 33L54 35" strokeWidth="2.5" /><path d="M48 38L51 39L48 40" strokeWidth="1" /><path d="M44 44Q49 47 53 43" strokeWidth="1.3" /></g>
          {girl && <><path d="M29 28Q31 13 44 19Q50 26 61 27" fill="#493d31" /><path d="M29 30L25 51M60 30L64 51" stroke="#493d31" strokeWidth="5" /><path d="M61 21L69 17L68 26Z" fill="#b77861" /></>}
        </g>
        <g className="traveller-arm traveller-arm-front"><path d="M53 55L62 65L57 76" /><circle cx="57" cy="76" r="2.8" fill="#dfb991" /></g>
      </g>
    </svg>
  );
}
