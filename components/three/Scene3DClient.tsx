"use client";

import dynamic from "next/dynamic";
import type { Scene3DProps } from "./Scene3D";

const Scene3D = dynamic(() => import("./Scene3D"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center">
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="relative grid h-16 w-16 place-items-center">
          <span className="absolute inset-0 animate-ping rounded-full border border-acid/30" />
          <span className="absolute inset-2 rounded-full border border-dashed border-violet/40 animate-spin-slow" />
          <span className="h-3 w-3 rounded-full bg-acid shadow-[0_0_20px_#c8ff2e]" />
        </span>
        <span className="text-[11px] tracking-[0.3em] text-white/35">
          OPENING PORTAL
        </span>
      </div>
    </div>
  ),
});

export function Scene3DClient(props: Scene3DProps) {
  return <Scene3D {...props} />;
}
