"use client";

import { createContext, useContext } from "react";
import { products, type CatalogProduct } from "@/lib/content";

export const CatalogContext = createContext<CatalogProduct[]>(products);
export const useCatalog = () => useContext(CatalogContext);
