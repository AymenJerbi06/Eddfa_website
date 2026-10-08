"use client";

import { useEffect } from "react";

export function AdminLanguage() {
  useEffect(() => {
    document.documentElement.lang = "fr";
    document.documentElement.dir = "ltr";
  }, []);
  return null;
}
