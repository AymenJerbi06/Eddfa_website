export function normalizeTunisianPhone(input: string): string | null {
  const ascii = input.replace(/[٠-٩]/g, (n) => String("٠١٢٣٤٥٦٧٨٩".indexOf(n)));
  if (!/^[+\d\s().-]+$/.test(ascii)) return null;
  let digits = ascii.replace(/\D/g, "");
  if (digits.startsWith("00216")) digits = digits.slice(5);
  else if (digits.length === 11 && digits.startsWith("216")) digits = digits.slice(3);
  return /^[2-9]\d{7}$/.test(digits) ? `+216${digits}` : null;
}

export function switchLocalePath(pathname: string, locale: "fr" | "ar"): string {
  return pathname.replace(/^\/(fr|ar)(?=\/|$)/, `/${locale}`);
}
