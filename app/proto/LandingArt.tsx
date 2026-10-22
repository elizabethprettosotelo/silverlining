"use client";

/*
 * The crow on the first onboarding screen. Sits behind the welcome copy at the
 * top of the screen; pass `flying` when Get started is pressed and the crow
 * takes off toward the sun.
 */

import { useEffect, useRef } from "react";
import { buildLandingArt } from "./landingArtData";

export default function LandingArt({ flying }: { flying: boolean }) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    if (ref.current) buildLandingArt(ref.current);
  }, []);
  return (
    <div className="landing-art" aria-hidden>
      <svg ref={ref} viewBox="0 0 390 580" className={flying ? "flying" : undefined} />
    </div>
  );
}
