"use client";

import { createContext, useContext } from "react";

export class ClientAdminError extends Error {
  constructor(message: string, public status: number) { super(message); }
}
export async function adminApi<T>(path: string, body?: unknown, method = "GET"): Promise<T> {
  const response = await fetch(`/api/admin/${path}`, {
    method, credentials: "same-origin", cache: "no-store",
    headers: body !== undefined && !(body instanceof FormData) ? { "Content-Type": "application/json" } : undefined,
    body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new ClientAdminError(data.message ?? "Connexion au serveur impossible.", response.status);
  return data;
}

export const AdminApiContext = createContext(adminApi);
export const AdminPhotoContext = createContext((filename: string) => `/api/catalog-image/${encodeURIComponent(filename)}`);
export const useAdminApi = () => useContext(AdminApiContext);
export const useAdminPhoto = () => useContext(AdminPhotoContext);
