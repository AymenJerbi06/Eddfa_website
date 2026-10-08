import Image from "next/image";

export function Photo({ src, alt, className = "", priority = false, sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw" }: { src: string; alt: string; className?: string; priority?: boolean; sizes?: string }) {
  const source = src.startsWith("/eddfa/") && !src.endsWith(".optimized.webp") ? src.replace(/\.webp$/, ".optimized.webp") : src;
  const nativeSize = /\/eclat-(classic|confort|service)(\.optimized)?\.webp$/.test(src);
  return <Image src={source} alt={alt} fill loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : undefined} sizes={nativeSize ? "300px" : sizes} className={`${className}${nativeSize ? " native-resolution" : ""}`} />;
}
