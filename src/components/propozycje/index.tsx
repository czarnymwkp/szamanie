import { P01Glowna, P01Lokal } from "./P01";
import P02Glowna from "./P02Glowna";
import P02Lokal from "./P02Lokal";
import P03Glowna from "./P03Glowna";
import P03Lokal from "./P03Lokal";
import P04Glowna from "./P04Glowna";
import P04Lokal from "./P04Lokal";
import P05Glowna from "./P05Glowna";
import P05Lokal from "./P05Lokal";
import P06Glowna from "./P06Glowna";
import P06Lokal from "./P06Lokal";
import P07Glowna from "./P07Glowna";
import P07Lokal from "./P07Lokal";
import P08Glowna from "./P08Glowna";
import P08Lokal from "./P08Lokal";
import P09Glowna from "./P09Glowna";
import P09Lokal from "./P09Lokal";
import P10Glowna from "./P10Glowna";
import P10Lokal from "./P10Lokal";
import type { PropsGlownej, PropsLokalu } from "./wspolne";

// Rejestr propozycji wyglądu: numer → strona główna i strona lokalu.
export function GlownaPropozycji(props: PropsGlownej) {
  switch (props.nr) {
    case 2:
      return <P02Glowna {...props} />;
    case 3:
      return <P03Glowna {...props} />;
    case 4:
      return <P04Glowna {...props} />;
    case 5:
      return <P05Glowna {...props} />;
    case 6:
      return <P06Glowna {...props} />;
    case 7:
      return <P07Glowna {...props} />;
    case 8:
      return <P08Glowna {...props} />;
    case 9:
      return <P09Glowna {...props} />;
    case 10:
      return <P10Glowna {...props} />;
    default:
      return <P01Glowna {...props} />;
  }
}

export function LokalPropozycji(props: PropsLokalu) {
  switch (props.nr) {
    case 2:
      return <P02Lokal {...props} />;
    case 3:
      return <P03Lokal {...props} />;
    case 4:
      return <P04Lokal {...props} />;
    case 5:
      return <P05Lokal {...props} />;
    case 6:
      return <P06Lokal {...props} />;
    case 7:
      return <P07Lokal {...props} />;
    case 8:
      return <P08Lokal {...props} />;
    case 9:
      return <P09Lokal {...props} />;
    case 10:
      return <P10Lokal {...props} />;
    default:
      return <P01Lokal {...props} />;
  }
}
