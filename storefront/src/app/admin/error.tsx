"use client";

import Link from "next/link";
import { RefreshCw } from "lucide-react";

export default function AdminErrorPage({ reset }: { reset: () => void }) {
  return <main className="admin-service-error"><img src="/eddfa/logo.optimized.webp" alt="EDDFA" width="166" height="43" /><h1>Administration indisponible</h1><p>Le serveur ne répond pas pour le moment.</p><button className="admin-button primary" onClick={reset}><RefreshCw size={17} />Réessayer</button><Link href="/fr">Retour à la boutique</Link></main>;
}
