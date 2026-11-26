import { useCallback, useRef } from "react";
import { normalizeTunisianPhone } from "@/lib/inquiry";
import { shake } from "./motion";

// The forms' manners, shared by the contact form and the quote (the motion and ease-of-use pass, 26 November 2026).
// Postel's law: take what the visitor types and tidy it when they leave the field. A Tunisian number written any way
// (+216, 00216, spaces, dots, Arabic digits) is shown back in three chunks (Miller's law: « 31 547 491 »).
export function tidyPhone(input: HTMLInputElement) {
  const phone = normalizeTunisianPhone(input.value);
  if (phone) input.value = `${phone.slice(4, 6)} ${phone.slice(6, 9)} ${phone.slice(9)}`;
}
export function tidyName(input: HTMLInputElement) { input.value = input.value.replace(/\s+/g, " ").trim(); }
export function tidyEmail(input: HTMLInputElement) { input.value = input.value.trim().toLowerCase(); }

// Exaggerated feedback: when the browser stops a form (a field left empty, a number that is not Tunisian), the first
// field it stopped on gives a short shake beside the browser's own message. Given to the form as its ref.
export function useShakeOnInvalid() {
  const release = useRef<(() => void) | null>(null);
  return useCallback((form: HTMLFormElement | null) => {
    release.current?.();
    release.current = null;
    if (!form) return;
    let last = 0;
    // Each refused field reports itself, in the page's order: only the first one of a try shakes.
    const refused = (event: Event) => {
      const now = performance.now();
      if (now - last < 400) return;
      last = now;
      shake(event.target as Element);
    };
    form.addEventListener("invalid", refused, true);
    release.current = () => form.removeEventListener("invalid", refused, true);
  }, []);
}

// A number typed with Arabic digits counts as well; anything that is not a digit is left out.
export function asciiDigits(text: string) {
  return text.replace(/[٠-٩]/g, digit => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit))).replace(/[۰-۹]/g, digit => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit))).replace(/\D/g, "");
}
