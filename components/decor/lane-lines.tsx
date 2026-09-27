// Flat concrete lane in perspective — LED lines converging, no gradient. A
// full-bleed backdrop: parent must be `relative isolate overflow-hidden`.
export function LaneLines() {
  return (
    <div className="absolute inset-0 -z-20 flex justify-center overflow-hidden">
      <svg
        viewBox="0 0 800 1000"
        preserveAspectRatio="xMidYMin slice"
        className="h-full w-full max-w-[1100px] opacity-[0.22]"
        aria-hidden="true"
      >
        <g fill="none" strokeLinecap="round" strokeWidth="2">
          <line x1="400" y1="120" x2="40" y2="1000" stroke="#02b2cd" />
          <line x1="400" y1="120" x2="760" y2="1000" stroke="#02b2cd" />
          <line x1="400" y1="120" x2="230" y2="1000" stroke="#02b2cd" />
          <line x1="400" y1="120" x2="570" y2="1000" stroke="#02b2cd" />
          <line x1="400" y1="120" x2="400" y2="1000" stroke="#e2212a" />
          {/* lane cross-slats receding */}
          <line x1="330" y1="300" x2="470" y2="300" stroke="#02b2cd" />
          <line x1="285" y1="470" x2="515" y2="470" stroke="#02b2cd" />
          <line x1="235" y1="680" x2="565" y2="680" stroke="#02b2cd" />
        </g>
      </svg>
    </div>
  )
}
