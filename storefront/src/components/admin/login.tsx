"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Eye, EyeOff, LoaderCircle, LockKeyhole } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { adminApi } from "./api";

export function AdminLogin() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setBusy(true);
    const form = new FormData(event.currentTarget);
    try {
      await adminApi("session", { email: String(form.get("email")).trim().toLowerCase(), password: form.get("password") }, "POST");
      router.replace("/admin"); router.refresh();
    } catch (error) { setError(error instanceof Error ? error.message : "Connexion impossible."); setBusy(false); }
  }
  return <main className="admin-login">
    <Image src="/eddfa/eden-cover.optimized.webp" alt="" fill priority sizes="100vw" className="admin-login-background" />
    <div className="admin-login-shade" />
    <Link className="admin-login-back" href="/fr"><ArrowLeft size={18} />Retour à la boutique</Link>
    <section className="admin-login-form"><Image src="/eddfa/logo.optimized.webp" alt="EDDFA" width={166} height={43} priority /><div className="admin-login-heading"><LockKeyhole size={21} /><span>ESPACE EDDFA</span></div><h1>Bienvenue chez vous.</h1>
      <form onSubmit={submit}><label htmlFor="admin-email">Email<input id="admin-email" name="email" type="email" autoComplete="username" required autoFocus disabled={busy} /></label><label htmlFor="admin-password">Mot de passe<div className="admin-password-field"><input id="admin-password" name="password" type={visible ? "text" : "password"} autoComplete="current-password" required disabled={busy} /><button type="button" className="admin-icon" title={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"} aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"} onClick={() => setVisible(!visible)}>{visible ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></label>
        {error && <div className="admin-error" role="alert">{error}</div>}<button type="submit" className="admin-button primary admin-login-submit" disabled={busy}>{busy ? <LoaderCircle className="admin-spin" size={18} /> : <ArrowRight size={18} />}{busy ? "Connexion…" : "Se connecter"}</button>
      </form>
    </section><span className="admin-login-footer">EDDFA · ALUMINIUM & CONFORT</span>
  </main>;
}
