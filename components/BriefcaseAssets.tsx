export function BriefcaseFront() {
  return (
    <svg viewBox="0 0 422 521" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Premium leather gradient */}
        <linearGradient id="paint0_linear_briefcase" x1={211} y1={78} x2={211} y2={506} gradientUnits="userSpaceOnUse">
          <stop stopColor="#C8915C" />
          <stop offset={0.3} stopColor="#A67B4E" />
          <stop offset={0.6} stopColor="#8B6642" />
          <stop offset={1} stopColor="#6B4E37" />
        </linearGradient>
        {/* Metallic lock gradient */}
        <linearGradient id="lock_gradient" x1={211} y1={250} x2={211} y2={310} gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFE87C" />
          <stop offset={0.5} stopColor="#D4AF37" />
          <stop offset={1} stopColor="#B8941E" />
        </linearGradient>
        {/* Shadow filter */}
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="4" stdDeviation="8" floodOpacity="0.3" />
        </filter>
        {/* Inner shadow */}
        <filter id="innerShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
          <feOffset dx="0" dy="2" result="offsetblur" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.5" />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      
      <mask
        id="mask0_briefcase_front"
        style={{ maskType: 'alpha' }}
        maskUnits="userSpaceOnUse"
        x={0}
        y={39}
        width={422}
        height={482}
      >
        <path d="M422 521V39H0V521H422Z" fill="black" />
      </mask>
      
      <g mask="url(#mask0_briefcase_front)">
        {/* Main briefcase body with shadow */}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M40 78H382C402 78 418 94 418 114V470C418 490 402 506 382 506H40C20 506 4 490 4 470V114C4 94 20 78 40 78Z"
          fill="url(#paint0_linear_briefcase)"
          filter="url(#shadow)"
        />
        
        {/* Leather texture overlay */}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M40 78H382C402 78 418 94 418 114V470C418 490 402 506 382 506H40C20 506 4 490 4 470V114C4 94 20 78 40 78Z"
          fill="url(#paint0_linear_briefcase)"
          opacity={0.9}
        />
        
        {/* Top edge highlight */}
        <path
          d="M40 78H382C402 78 418 94 418 114V140H4V114C4 94 20 78 40 78Z"
          fill="#D4A574"
          opacity={0.4}
        />
        
        {/* Bottom shadow */}
        <path
          d="M4 450V470C4 490 20 506 40 506H382C402 506 418 490 418 470V450H4Z"
          fill="#4A3422"
          opacity={0.3}
        />
        
        {/* Corner reinforcements */}
        <circle cx={50} cy={120} r={12} fill="#8B6F47" opacity={0.6} />
        <circle cx={372} cy={120} r={12} fill="#8B6F47" opacity={0.6} />
        <circle cx={50} cy={464} r={12} fill="#8B6F47" opacity={0.6} />
        <circle cx={372} cy={464} r={12} fill="#8B6F47" opacity={0.6} />
        
        {/* Handle - more realistic */}
        <g filter="url(#shadow)">
          <path
            d="M170 50C170 38 178 28 188 28H234C244 28 252 38 252 50V78H246V52C246 44 240 38 232 38H190C182 38 176 44 176 52V78H170V50Z"
            fill="#5A3E2B"
          />
          <path
            d="M176 52C176 44 182 38 190 38H232C240 38 246 44 246 52V78H176V52Z"
            fill="url(#paint0_linear_briefcase)"
            opacity={0.8}
          />
          {/* Handle stitching */}
          <line x1={180} y1={42} x2={180} y2={74} stroke="#4A3422" strokeWidth={1.5} strokeDasharray="3 3" opacity={0.5} />
          <line x1={242} y1={42} x2={242} y2={74} stroke="#4A3422" strokeWidth={1.5} strokeDasharray="3 3" opacity={0.5} />
        </g>
        
        {/* Decorative strap */}
        <rect x={50} y={100} width={322} height={35} rx={4} fill="#5A3E2B" opacity={0.4} />
        <rect x={54} y={104} width={314} height={27} rx={2} fill="#8B6F47" opacity={0.3} />
        
        {/* Stitching detail on body */}
        <rect x={20} y={95} width={382} height={2} fill="#6B4E37" opacity={0.4} />
        <rect x={20} y={488} width={382} height={2} fill="#4A3422" opacity={0.4} />
        
        {/* Premium lock/clasp */}
        <g filter="url(#shadow)">
          {/* Lock plate */}
          <rect x={190} y={250} width={42} height={60} rx={8} fill="url(#lock_gradient)" />
          <rect x={193} y={253} width={36} height={54} rx={6} fill="#E6C65A" />
          
          {/* Lock details */}
          <circle cx={211} cy={275} r={10} fill="#B8941E" />
          <circle cx={211} cy={275} r={7} fill="#4A3422" />
          <path d="M209 275L211 285L213 275Z" fill="#4A3422" />
          
          {/* Lock shine */}
          <ellipse cx={200} cy={260} rx={8} ry={12} fill="#FFF9E6" opacity={0.4} />
          
          {/* Screws */}
          <circle cx={196} cy={256} r={2.5} fill="#B8941E" />
          <circle cx={226} cy={256} r={2.5} fill="#B8941E" />
          <circle cx={196} cy={304} r={2.5} fill="#B8941E" />
          <circle cx={226} cy={304} r={2.5} fill="#B8941E" />
          
          {/* Screw slots */}
          <line x1={194} y1={256} x2={198} y2={256} stroke="#8B7355" strokeWidth={1} />
          <line x1={224} y1={256} x2={228} y2={256} stroke="#8B7355" strokeWidth={1} />
          <line x1={194} y1={304} x2={198} y2={304} stroke="#8B7355" strokeWidth={1} />
          <line x1={224} y1={304} x2={228} y2={304} stroke="#8B7355" strokeWidth={1} />
        </g>
        
        {/* Side highlights for depth */}
        <path
          d="M40 78C20 78 4 94 4 114V470C4 490 20 506 40 506V78Z"
          fill="#4A3422"
          opacity={0.2}
        />
        <path
          d="M382 78V506C402 506 418 490 418 470V114C418 94 402 78 382 78Z"
          fill="#D4A574"
          opacity={0.15}
        />
      </g>
    </svg>
  );
}

export function BriefcaseBack() {
  return (
    <svg viewBox="0 0 450 535" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Premium leather gradient for back */}
        <linearGradient id="paint0_linear_briefcase_back" x1={225} y1={90} x2={225} y2={516} gradientUnits="userSpaceOnUse">
          <stop stopColor="#B8834A" />
          <stop offset={0.3} stopColor="#9A6D42" />
          <stop offset={0.6} stopColor="#7D5736" />
          <stop offset={1} stopColor="#5D4129" />
        </linearGradient>
        {/* Shadow filter */}
        <filter
          id="filter0_briefcase_shadow"
          x={0}
          y={400}
          width={450}
          height={140}
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity={0} result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation={25} result="effect1_foregroundBlur" />
        </filter>
        {/* Main shadow */}
        <filter id="shadow_back" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="6" stdDeviation="12" floodOpacity="0.4" />
        </filter>
      </defs>
      
      {/* Ground shadow */}
      <g filter="url(#filter0_briefcase_shadow)">
        <ellipse cx={225} cy={495} rx={180} ry={45} fill="#4A3422" fillOpacity={0.3} />
      </g>
      
      {/* Main briefcase body with shadow */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M50 90H400C420 90 436 106 436 126V480C436 500 420 516 400 516H50C30 516 14 500 14 480V126C14 106 30 90 50 90Z"
        fill="url(#paint0_linear_briefcase_back)"
        filter="url(#shadow_back)"
      />
      
      {/* Leather texture overlay */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M50 90H400C420 90 436 106 436 126V480C436 500 420 516 400 516H50C30 516 14 500 14 480V126C14 106 30 90 50 90Z"
        fill="url(#paint0_linear_briefcase_back)"
        opacity={0.85}
      />
      
      {/* Top edge highlight */}
      <path
        d="M50 90H400C420 90 436 106 436 126V152H14V126C14 106 30 90 50 90Z"
        fill="#C8915C"
        opacity={0.35}
      />
      
      {/* Bottom shadow */}
      <path
        d="M14 460V480C14 500 30 516 50 516H400C420 516 436 500 436 480V460H14Z"
        fill="#3A2616"
        opacity={0.35}
      />
      
      {/* Corner reinforcements */}
      <circle cx={60} cy={132} r={14} fill="#7D5736" opacity={0.7} />
      <circle cx={390} cy={132} r={14} fill="#7D5736" opacity={0.7} />
      <circle cx={60} cy={474} r={14} fill="#7D5736" opacity={0.7} />
      <circle cx={390} cy={474} r={14} fill="#7D5736" opacity={0.7} />
      
      {/* Corner detail rings */}
      <circle cx={60} cy={132} r={10} fill="none" stroke="#5D4129" strokeWidth={2} opacity={0.6} />
      <circle cx={390} cy={132} r={10} fill="none" stroke="#5D4129" strokeWidth={2} opacity={0.6} />
      <circle cx={60} cy={474} r={10} fill="none" stroke="#5D4129" strokeWidth={2} opacity={0.6} />
      <circle cx={390} cy={474} r={10} fill="none" stroke="#5D4129" strokeWidth={2} opacity={0.6} />
      
      {/* Handle (back view) - more detailed */}
      <g filter="url(#shadow_back)">
        <path
          d="M180 60C180 48 188 38 198 38H252C262 38 270 48 270 60V90H264V62C264 54 258 48 250 48H200C192 48 186 54 186 62V90H180V60Z"
          fill="#4A3422"
        />
        <path
          d="M186 62C186 54 192 48 200 48H250C258 48 264 54 264 62V90H186V62Z"
          fill="url(#paint0_linear_briefcase_back)"
          opacity={0.75}
        />
        {/* Handle stitching */}
        <line x1={191} y1={52} x2={191} y2={86} stroke="#3A2616" strokeWidth={1.5} strokeDasharray="3 3" opacity={0.6} />
        <line x1={259} y1={52} x2={259} y2={86} stroke="#3A2616" strokeWidth={1.5} strokeDasharray="3 3" opacity={0.6} />
      </g>
      
      {/* Decorative strap */}
      <rect x={60} y={112} width={330} height={38} rx={5} fill="#4A3422" opacity={0.45} />
      <rect x={65} y={117} width={320} height={28} rx={3} fill="#7D5736" opacity={0.35} />
      
      {/* Stitching details */}
      <rect x={30} y={108} width={390} height={2} fill="#5D4129" opacity={0.5} />
      <rect x={30} y={498} width={390} height={2} fill="#3A2616" opacity={0.5} />
      
      {/* Side depth shadows */}
      <path
        d="M50 90C30 90 14 106 14 126V480C14 500 30 516 50 516V90Z"
        fill="#3A2616"
        opacity={0.25}
      />
      <path
        d="M400 90V516C420 516 436 500 436 480V126C436 106 420 90 400 90Z"
        fill="#C8915C"
        opacity={0.12}
      />
      
      {/* Buckle straps on back */}
      <g opacity={0.6}>
        <rect x={120} y={280} width={40} height={8} rx={3} fill="#5D4129" />
        <rect x={290} y={280} width={40} height={8} rx={3} fill="#5D4129" />
        <circle cx={130} cy={284} r={4} fill="#7D5736" />
        <circle cx={320} cy={284} r={4} fill="#7D5736" />
      </g>
      
      {/* Back panel seam */}
      <line x1={225} y1={120} x2={225} y2={490} stroke="#5D4129" strokeWidth={3} opacity={0.2} />
    </svg>
  );
}
