import { pobierzLokale } from "@/lib/lokale";
import StopkaM from "../mobilne/StopkaM";
import { linkiStopki } from "../mobilne/linki";

export default async function Stopka() {
  // Linki do stron fraz (/krasnik/pizza…) z każdej podstrony — Google trafia po nich do wszystkich.
  const lokale = await pobierzLokale();
  return <StopkaM linki={linkiStopki(lokale)} szaman="szkic" />;
}
