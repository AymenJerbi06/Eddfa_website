import Link from "next/link";
export default function NotFound() { return <div className="not-found"><span className="eyebrow">404</span><h1>Page introuvable</h1><p>Cette page n’existe pas ou a été déplacée.</p><Link className="pill-button" href="/fr">Retour à l’accueil</Link></div>; }
