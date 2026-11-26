import Image, { getImageProps } from "next/image";

const optimized = (src: string) => src.startsWith("/eddfa/") && !src.endsWith(".optimized.webp") ? src.replace(/\.webp$/, ".optimized.webp") : src;

export function Photo({ src, alt, className = "", priority = false, sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 40vw" }: { src: string; alt: string; className?: string; priority?: boolean; sizes?: string }) {
  const source = optimized(src);
  const nativeSize = /\/eclat-(classic|confort|service)(\.optimized)?\.webp$/.test(src);
  return <Image src={source} alt={alt} fill loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : undefined} sizes={nativeSize ? "300px" : sizes} className={`${className}${nativeSize ? " native-resolution" : ""}`} />;
}

// The first section's photo for two shapes of screen (the user, 26 November 2026). Computers and tablets get the wide
// bathroom; phones, where the wide one showed only the radiator, get a tall picture of the same bathroom made for them
// (hero-eden-phone, see ASSET-PROVENANCE.md). The browser loads only the one it shows.
export function HeroPhoto({ wide, tall, className = "" }: { wide: string; tall: string; className?: string }) {
  const common = { alt: "", sizes: "100vw", loading: "eager", fetchPriority: "high" } as const;
  const phone = getImageProps({ ...common, src: optimized(tall), width: 1080, height: 1910 }).props;
  const { srcSet, ...computer } = getImageProps({ ...common, src: optimized(wide), width: 3200, height: 1800 }).props;
  return <picture>
    <source media="(max-width: 640px)" srcSet={phone.srcSet} sizes="100vw" width={1080} height={1910} />
    <img {...computer} srcSet={srcSet} alt="" className={className} />
  </picture>;
}
