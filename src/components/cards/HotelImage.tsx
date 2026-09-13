"use client";

import Image from "next/image";
import { useState } from "react";

export function HotelImage({ src, name }: { src: string; name: string }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showPlaceholder = !src || failedSrc === src;

  return (
    <Image
      src={showPlaceholder ? "/images/hotel-placeholder.svg" : src}
      alt={showPlaceholder ? `${name} — placeholder illustration` : name}
      fill
      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
      className="object-cover transition-transform duration-500 group-hover:scale-105"
      onError={() => { if (!showPlaceholder) setFailedSrc(src); }}
    />
  );
}
