import { catalogBackend } from "@/lib/deployment-policy";

export async function GET(_request: Request, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;
  const backend = catalogBackend();
  if (!backend || filename.includes("..") || /[/\\\x00-\x1f]/.test(filename) || !/\.(webp|png|jpe?g|gif)$/i.test(filename)) return new Response(null, { status: 404 });
  try {
    const response = await fetch(new URL(`/static/${encodeURIComponent(filename)}`, backend), { cache: "no-store", redirect: "error", signal: AbortSignal.timeout(10000) });
    const type = response.headers.get("content-type") ?? "";
    if (!response.ok || !/^image\/(webp|png|jpeg|gif)/.test(type)) return new Response(null, { status: 404 });
    if (Number(response.headers.get("content-length")) > 10 * 1024 * 1024) return new Response(null, { status: 413 });
    const bytes = await response.arrayBuffer();
    if (bytes.byteLength > 10 * 1024 * 1024) return new Response(null, { status: 413 });
    return new Response(bytes, { headers: { "Content-Type": type, "Cache-Control": "public, max-age=60", "X-Content-Type-Options": "nosniff" } });
  } catch { return new Response(null, { status: 503 }); }
}
