import { useId } from "react";
import "./Szaman.css";

// Czteroramienna iskierka (czary szamana).
const iskra = (x: number, y: number, r: number) =>
  `M${x} ${y - r}Q${x} ${y} ${x + r} ${y}Q${x} ${y} ${x} ${y + r}Q${x} ${y} ${x - r} ${y}Q${x} ${y} ${x} ${y - r}Z`;

const ISKRY = [
  { d: iskra(54, 122, 9), kolor: "#ffd75e", opoznienie: "0s" },
  { d: iskra(44, 160, 6), kolor: "#f5ebe1", opoznienie: "0.15s" },
  { d: iskra(108, 112, 5), kolor: "#ffd75e", opoznienie: "0.3s" },
  { d: iskra(214, 22, 8), kolor: "#ffd75e", opoznienie: "0.1s" },
  { d: iskra(226, 52, 5), kolor: "#f5ebe1", opoznienie: "0.25s" },
];

/**
 * Maskotka szamanie.pl: szaman w kapturze zajada burgera (trzy gryzy), widelcem-laską wyczarowuje nowego
 * i zaprasza do wyszukiwania. SVG + CSS, pętla 10 s; bez animacji przy „ogranicz ruch”.
 * `dymek` — chmurka „A Ty co szamiesz?” po lewej stronie postaci (tam, gdzie na komputerze jest wyszukiwarka).
 */
export default function Szaman({ className = "", dymek = false }: { className?: string; dymek?: boolean }) {
  const id = useId();
  const maska = `ugryzienia-${id}`;
  const cialo = `cialo-${id}`;

  return (
    <div aria-hidden className={className}>
      <svg viewBox="0 0 240 240" className="sz-szaman">
        <defs>
          {/* Ugryzienia: czarne koła w masce „zjadają” prawą stronę burgera, jedno po drugim. */}
          <mask id={maska} maskUnits="userSpaceOnUse" x="30" y="100" width="100" height="90">
            <rect x="30" y="100" width="100" height="90" fill="#fff" />
            <circle className="sz-ugryz1" cx="105" cy="138" r="9" />
            <circle className="sz-ugryz2" cx="106" cy="152" r="9" />
            <circle className="sz-ugryz3" cx="100" cy="145" r="10" />
          </mask>
          <clipPath id={cialo}>
            <path d="M62 240C62 196 92 170 135 168C178 170 208 196 208 240Z" />
          </clipPath>
        </defs>

        <g className="sz-oddech">
          {/* Laska-widelec z piórkiem (jak w logo) */}
          <g className="sz-laska">
            <path d="M200 236V58" stroke="#f5ebe1" strokeWidth="7" strokeLinecap="round" />
            <rect x="187" y="48" width="26" height="9" rx="4.5" fill="#f5ebe1" />
            <path d="M191 50V30M200 50V28M209 50V30" stroke="#f5ebe1" strokeWidth="5.5" strokeLinecap="round" />
            <path d="M200 66q7 4 8 12" stroke="#ff6400" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <circle cx="208" cy="81" r="3.2" fill="#ff6400" />
            <circle cx="209" cy="88" r="3.2" fill="#f5ebe1" />
            <path d="M209 91C215 100 215 112 208 121C203 111 203 100 209 91Z" fill="#f5ebe1" />
            <path d="M208.5 93V119" stroke="#d6c6b3" strokeWidth="1.2" />
          </g>

          {/* Płaszcz z kremowym zygzakiem i naszyjnik z kłem */}
          <path d="M62 240C62 196 92 170 135 168C178 170 208 196 208 240Z" fill="#ff6400" />
          <path
            clipPath={`url(#${cialo})`}
            d="M60 222l9-9 9 9 9-9 9 9 9-9 9 9 9-9 9 9 9-9 9 9 9-9 9 9 9-9 9 9 9-9 9 9"
            stroke="#f5ebe1"
            strokeWidth="5"
            strokeLinejoin="round"
            fill="none"
          />
          {[
            [111, 177],
            [118, 183],
            [126, 187],
            [135, 188.5],
            [144, 187],
            [152, 183],
            [159, 177],
          ].map(([x, y]) => (
            <circle key={x} cx={x} cy={y} r="3.6" fill="#f5ebe1" />
          ))}
          <path d="M130.5 190.5h9L135 203Z" fill="#fff8ee" stroke="#fff8ee" strokeWidth="3" strokeLinejoin="round" />

          {/* Ręka z laską */}
          <path d="M163 190L190 185" stroke="#e65a00" strokeWidth="18" strokeLinecap="round" />
          <circle cx="193" cy="184" r="9.5" fill="#f2c299" />

          {/* Kaptur (tył), głowa, piórko, rondo kaptura z futerkiem */}
          <path d="M86 152C78 106 94 74 122 63C126 41 140 23 168 12C162 28 160 45 162 63C186 75 196 108 186 152Z" fill="#e65a00" />
          <circle cx="135" cy="118" r="42" fill="#f2c299" />
          <path d="M101 90C85 78 77 58 81 38C93 52 103 70 101 90Z" fill="#f5ebe1" />
          <path d="M81 38C83 45 86 51 90 57C85 54 82 47 81 38Z" fill="#ff6400" />
          <path d="M100 88C93 72 87 56 82 40" stroke="#d6c6b3" strokeWidth="1.3" fill="none" />
          <path d="M92 122C90 92 108 74 135 74C162 74 180 92 178 122C168 104 154 96 135 96C116 96 102 104 92 122Z" fill="#ff6400" />
          <path d="M95 116C103 103 117 96 135 96C153 96 167 103 175 116" stroke="#f5ebe1" strokeWidth="5" strokeLinecap="round" fill="none" />

          {/* Twarz: malunki, rumieńce, nos */}
          <g fill="#c24a00">
            <rect x="98" y="129" width="11" height="3.4" rx="1.7" />
            <rect x="98" y="135.5" width="11" height="3.4" rx="1.7" />
            <rect x="161" y="129" width="11" height="3.4" rx="1.7" />
            <rect x="161" y="135.5" width="11" height="3.4" rx="1.7" />
          </g>
          <circle cx="116" cy="134" r="5.5" fill="#ff7a45" opacity="0.35" />
          <circle cx="154" cy="134" r="5.5" fill="#ff7a45" opacity="0.35" />
          <path d="M132.5 128.5q2.5 3 5 0" stroke="#c98a62" strokeWidth="2" strokeLinecap="round" fill="none" />

          {/* Oczy: otwarte (patrzą w stronę wyszukiwarki, gdy zaprasza) albo zadowolone „^ ^” przy żuciu */}
          <g className="sz-oczy-otwarte">
            <g className="sz-zrenice">
              <ellipse cx="119" cy="119" rx="5.5" ry="6.5" fill="#1a1a1a" />
              <ellipse cx="151" cy="119" rx="5.5" ry="6.5" fill="#1a1a1a" />
              <circle cx="121" cy="116.5" r="1.8" fill="#fff" />
              <circle cx="153" cy="116.5" r="1.8" fill="#fff" />
            </g>
          </g>
          <g className="sz-oczy-zadowolone" stroke="#1a1a1a" strokeWidth="3.5" strokeLinecap="round" fill="none">
            <path d="M112 121q7-7 14 0M144 121q7-7 14 0" />
          </g>

          {/* Usta: uśmiech / otwarte przed gryzem / żucie */}
          <path className="sz-usta-usmiech" d="M125 141q10 9 20 0" stroke="#4a1a0a" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          <g className="sz-usta-otwarte">
            <ellipse cx="135" cy="144" rx="8" ry="9" fill="#4a1a0a" />
            <ellipse cx="135" cy="149" rx="5" ry="3" fill="#e0645a" />
          </g>
          <g className="sz-usta-zucie">
            <ellipse className="sz-zucie" cx="135" cy="143" rx="9" ry="4.5" fill="#4a1a0a" />
          </g>
          <g className="sz-okruchy" fill="#f2a33a">
            <circle cx="122" cy="150" r="1.9" />
            <circle cx="127" cy="154" r="1.5" />
            <circle cx="118" cy="156" r="1.7" />
          </g>

          {/* Ręka z burgerem: obraca się w barku do ust, burger obraca się odwrotnie, więc zostaje poziomo */}
          <g className="sz-reka">
            <path d="M108 188L86 170" stroke="#e65a00" strokeWidth="18" strokeLinecap="round" />
            <g className="sz-burger">
              <g mask={`url(#${maska})`}>
                <path d="M57 145C57 127 103 127 103 145Z" fill="#f2a33a" />
                <path d="M64 137q6-6 14-7" stroke="#ffd08a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                <g fill="#fff3d6">
                  <ellipse cx="72" cy="137" rx="2" ry="1.2" />
                  <ellipse cx="82" cy="134" rx="2" ry="1.2" />
                  <ellipse cx="92" cy="137" rx="2" ry="1.2" />
                  <ellipse cx="86" cy="140.5" rx="2" ry="1.2" />
                </g>
                <path d="M55 145q4 5 8 0t8 0 8 0 8 0 8 0 8 0v3H55Z" fill="#5fb54a" />
                <path d="M58 147h44l-4 6-6-3-6 5-6-4-10 4-6-4-6 2Z" fill="#ffcc2f" />
                <rect x="57" y="149" width="46" height="8" rx="4" fill="#6a3518" />
                <path d="M58 157h44c0 6-4 8-8 8H66c-4 0-8-2-8-8Z" fill="#e8902f" />
              </g>
            </g>
            <ellipse cx="83" cy="167" rx="10" ry="8" fill="#f2c299" />
            <circle cx="93" cy="161" r="4" fill="#f2c299" />
          </g>

          {ISKRY.map((i) => (
            <path key={i.d} className="sz-iskra" d={i.d} fill={i.kolor} style={{ animationDelay: i.opoznienie }} />
          ))}
        </g>
      </svg>

      {dymek && (
        <p className="sz-dymek">
          A Ty co szamiesz?
          <span className="block text-xs font-bold text-tekst-2">← wpisz w wyszukiwarkę</span>
        </p>
      )}
    </div>
  );
}
