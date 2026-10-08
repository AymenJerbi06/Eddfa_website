"use client";

import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { ZodError } from "zod";
import type { AdminData } from "@/lib/admin-types";
import { demoPhotos, mutateDemoCatalog } from "@/lib/demo-catalog";
import { AdminApiContext, AdminPhotoContext, adminApi, ClientAdminError } from "./api";

export function DemoAdminProvider({ initial, children }: { initial: AdminData; children: ReactNode }) {
  const data = useRef(structuredClone(initial));
  const photos = useRef(new Map<string, string>());
  const releasePhotos = useCallback(() => {
    for (const url of photos.current.values()) URL.revokeObjectURL(url);
    photos.current.clear();
  }, []);
  useEffect(() => releasePhotos, [releasePhotos]);

  const request = useCallback(async <T,>(path: string, body?: unknown, method = "GET"): Promise<T> => {
    if (path === "session") {
      const result = await adminApi<T>(path, body, method);
      if (method === "DELETE") { releasePhotos(); data.current = structuredClone(initial); }
      return result;
    }
    // Every demo operation still checks the HttpOnly server session.
    await adminApi("session");
    if (path === "data" && method === "GET") return structuredClone(data.current) as T;
    try {
      if (path === "uploads" && method === "POST") {
        const file = body instanceof FormData ? body.get("file") : null;
        if (!(file instanceof File) || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Error("Choisissez une photo JPEG, PNG ou WebP.");
        if (file.size > 10 * 1024 * 1024 || photos.current.size >= 30) throw new Error("Limite de photos atteinte (10 Mo par photo, 30 par session).");
        const bitmap = await createImageBitmap(file);
        const valid = bitmap.width > 0 && bitmap.height > 0 && bitmap.width <= 6000 && bitmap.height <= 6000;
        bitmap.close();
        if (!valid) throw new Error("La photo doit mesurer au maximum 6000 pixels par cote.");
        const extension = file.type === "image/jpeg" ? "jpg" : file.type.split("/")[1];
        const filename = `demo-${crypto.randomUUID()}.${extension}`;
        photos.current.set(filename, URL.createObjectURL(file));
        return { filename } as T;
      }
      const next = structuredClone(data.current);
      const result = mutateDemoCatalog(next, path, body, method);
      data.current = next;
      return result as T;
    } catch (error) {
      const message = error instanceof ZodError ? error.issues[0]?.message : error instanceof Error ? error.message : "Action impossible.";
      throw new ClientAdminError(message ?? "Verifiez les champs.", 400);
    }
  }, [initial, releasePhotos]);

  const photo = useCallback((filename: string) => photos.current.get(filename) ?? (demoPhotos.has(filename) ? `/eddfa/${filename}` : ""), []);
  return <AdminApiContext.Provider value={request}><AdminPhotoContext.Provider value={photo}>{children}</AdminPhotoContext.Provider></AdminApiContext.Provider>;
}
