"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowUpRight, Boxes, Check, ChevronRight, CircleAlert, Eye, LayoutDashboard, LoaderCircle, LogOut, Package, Pencil, Plus, RefreshCw, Save, Search, ShoppingBag, Tag, Trash2, Warehouse, X } from "lucide-react";
import { blankProduct, type AdminData, type AdminOrder, type AdminProduct, type AdminPromotion } from "@/lib/admin-types";
import { adminApi, ClientAdminError } from "./api";
import { DeleteDialog, IconButton, ProductEditor, PromotionEditor, money, photoUrl } from "./editors";

const sections = [
  { key: "apercu", title: "Vue d'ensemble", icon: LayoutDashboard },
  { key: "produits", title: "Produits", icon: Package },
  { key: "stock", title: "Stock", icon: Warehouse },
  { key: "promos", title: "Codes promo", icon: Tag },
  { key: "packs", title: "Packs", icon: Boxes },
  { key: "commandes", title: "Commandes", icon: ShoppingBag },
];
function Badge({ status }: { status: string }) {
  const labels: Record<string, string> = { published: "Publié", draft: "Brouillon", active: "Actif", inactive: "Inactif", pending: "En attente", completed: "Terminée", canceled: "Annulée", not_paid: "Non payée", captured: "Encaissée", not_fulfilled: "Non expédiée", fulfilled: "Expédiée", delivered: "Livrée" };
  return <span className={`admin-badge ${["published", "active", "completed", "captured", "delivered"].includes(status) ? "positive" : ""}`}>{labels[status] ?? status}</span>;
}
function ProductImage({ product }: { product: AdminProduct }) { return product.images[0] ? <img src={photoUrl(product.images[0])} alt="" className="admin-product-thumb" /> : <span className="admin-product-thumb empty"><Package size={22} /></span>; }
function ProductRows({ products, onEdit, onDelete }: { products: AdminProduct[]; onEdit: (product: AdminProduct) => void; onDelete: (product: AdminProduct) => void }) {
  return <div className="admin-product-list"><div className="admin-list-labels"><span>Produit</span><span>Gamme / versions</span><span>Prix</span><span>Statut</span><span /></div>{products.map(product => {
    const prices = product.variants.map(variant => variant.price).filter((price): price is number => price !== null);
    return <div className="admin-product-row" key={product.id}><button className="admin-product-name" onClick={() => onEdit(product)}><ProductImage product={product} /><span><strong>{product.title}</strong><small>{product.handle}</small></span></button><div className="admin-product-category">{product.category === "bundle" ? "Pack" : product.category.toUpperCase()}<small>{product.variants.length} {product.variants.length > 1 ? "versions" : "version"}</small></div><div className="admin-product-price">{prices.length ? <><strong>{money(Math.min(...prices))}</strong>{prices.length !== product.variants.length && <small>Prix à compléter</small>}</> : <span className="admin-muted">À renseigner</span>}</div><Badge status={product.status} /><div className="admin-row-actions"><IconButton title={`Modifier ${product.title}`} onClick={() => onEdit(product)}><Pencil size={16} /></IconButton>{product.status === "published" && <Link className="admin-icon" title={`Voir ${product.title}`} aria-label={`Voir ${product.title}`} href={`/fr/produits/${product.handle}`} target="_blank" rel="noopener noreferrer"><Eye size={16} /></Link>}<IconButton title={`Supprimer ${product.title}`} onClick={() => onDelete(product)}><Trash2 size={16} /></IconButton></div></div>;
  })}</div>;
}
function StockRow({ product, variant, locationId, saved }: { product: AdminProduct; variant: AdminProduct["variants"][number]; locationId: string; saved: () => Promise<void> }) {
  const [quantity, setQuantity] = useState(String(variant.stocked ?? 0));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try { await adminApi("stock", { inventoryId: variant.inventoryId, locationId, quantity: Number(quantity) }, "POST"); await saved(); }
    catch (error) { setError(error instanceof Error ? error.message : "Enregistrement impossible."); }
    finally { setBusy(false); }
  }
  return <form className="admin-stock-row" onSubmit={submit}><div className="admin-product-name"><ProductImage product={product} /><span><strong>{product.title}</strong><small>{variant.title}</small></span></div><span className="admin-stock-reference">{variant.sku || "—"}</span><span className="admin-reserved">{variant.reserved ?? 0}<small>réservé</small></span><span className="admin-available">{Math.max(0, (variant.stocked ?? 0) - (variant.reserved ?? 0))}<small>disponible</small></span><div className="admin-stock-edit"><input aria-label={`Stock ${product.title} ${variant.title}`} type="number" min={variant.reserved ?? 0} step="1" max="1000000" required value={quantity} onChange={event => setQuantity(event.target.value)} disabled={busy} /><button type="submit" className="admin-icon" title="Enregistrer le stock" aria-label={`Enregistrer le stock ${product.title} ${variant.title}`} disabled={busy || !variant.inventoryId}>{busy ? <LoaderCircle className="admin-spin" size={17} /> : <Save size={17} />}</button></div>{error && <div className="admin-error" role="alert">{error}</div>}</form>;
}
function Empty({ title, action, onClick }: { title: string; action?: string; onClick?: () => void }) { return <div className="admin-empty"><Package size={28} /><h3>{title}</h3>{action && onClick && <button className="admin-button primary" onClick={onClick}><Plus size={17} />{action}</button>}</div>; }
function OrderDetails({ order, onClose }: { order: AdminOrder; onClose: () => void }) {
  const address = order.shipping_address;
  return <Dialog.Root open onOpenChange={open => { if (!open) onClose(); }}><Dialog.Portal><Dialog.Overlay className="admin-overlay" /><Dialog.Content className="admin-drawer eddfa-admin" aria-describedby={undefined}><div className="admin-drawer-header"><Dialog.Title>Commande #{order.display_id}</Dialog.Title><Dialog.Close asChild><button className="admin-icon" title="Fermer" aria-label="Fermer"><X size={21} /></button></Dialog.Close></div><div className="admin-editor-body"><Badge status={order.status} /><h3 className="admin-subheading">Client</h3><p>{address?.first_name} {address?.last_name}<br />{address?.phone}<br />{order.email}</p><h3>Livraison</h3><p>{address?.address_1}<br />{address?.city}</p><h3>Produits</h3>{order.items?.map(item => <div className="admin-order-item" key={item.id}><span>{item.quantity} × {item.title}</span><strong>{money(item.unit_price * item.quantity)}</strong></div>)}<div className="admin-order-item"><strong>Total</strong><strong>{money(order.total)}</strong></div></div></Dialog.Content></Dialog.Portal></Dialog.Root>;
}

export function AdminDashboard({ email }: { email: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const view = sections.some(section => section.key === params.get("vue")) ? params.get("vue")! : "apercu";
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [editor, setEditor] = useState<AdminProduct | null>(null);
  const [promoEditor, setPromoEditor] = useState<AdminPromotion | null>(null);
  const [deletion, setDeletion] = useState<{ path: string; name: string } | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [logoutBusy, setLogoutBusy] = useState(false);
  const load = useCallback(async () => {
    setRefreshing(true); setError("");
    try { setData(await adminApi<AdminData>("data")); }
    catch (error) { if (error instanceof ClientAdminError && [401, 403].includes(error.status)) router.replace("/admin/login"); else setError(error instanceof Error ? error.message : "Chargement impossible."); throw error; }
    finally { setLoading(false); setRefreshing(false); }
  }, [router]);
  useEffect(() => { void load().catch(() => {}); }, [load]);
  useEffect(() => { setQuery(""); setFilter("all"); }, [view]);
  useEffect(() => { if (!notice) return; const timer = setTimeout(() => setNotice(""), 4000); return () => clearTimeout(timer); }, [notice]);
  async function saved() { await load(); setNotice("Modifications enregistrées."); }
  async function signOut() {
    setLogoutBusy(true);
    try { await adminApi("session", undefined, "DELETE"); router.replace("/admin/login"); router.refresh(); }
    catch (error) { setError(error instanceof Error ? error.message : "Déconnexion impossible."); setLogoutBusy(false); }
  }
  function deleteProduct(product: AdminProduct) { setDeleteError(""); setDeletion({ path: `products/${product.id}`, name: product.title }); }
  async function confirmDelete() {
    if (!deletion) return; setDeleteBusy(true); setDeleteError("");
    try { await adminApi(deletion.path, undefined, "DELETE"); await load(); setDeletion(null); setNotice("Suppression enregistrée."); }
    catch (error) { setDeleteError(error instanceof Error ? error.message : "Suppression impossible."); }
    finally { setDeleteBusy(false); }
  }
  const normalize = (value: string) => value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
  const matches = (value: string) => normalize(value).includes(normalize(query));
  const products = data?.products ?? [];
  const regular = products.filter(product => product.category !== "bundle");
  const stockProducts = regular.filter(product => matches(`${product.title} ${product.variants.map(variant => variant.sku).join(" ")}`));
  const shownProducts = products.filter(product => (view === "packs" ? product.category === "bundle" : product.category !== "bundle") && matches(`${product.title} ${product.titleAr} ${product.handle}`) && (filter === "all" || product.status === filter));
  const addProduct = () => setEditor(blankProduct(view === "packs"));
  const addPromotion = () => setPromoEditor({ code: "", type: "percentage", value: 10, status: "draft", limit: null });
  const current = sections.find(section => section.key === view)!;
  return <div className="admin-workspace">
    <aside className="admin-sidebar"><Link href="/admin" className="admin-brand" aria-label="EDDFA administration"><Image src="/eddfa/logo.optimized.webp" alt="EDDFA" width={166} height={43} priority /><small>ADMINISTRATION</small></Link><nav aria-label="Administration EDDFA">{sections.map(section => { const Icon = section.icon; return <Link href={section.key === "apercu" ? "/admin" : `/admin?vue=${section.key}`} key={section.key} aria-current={view === section.key ? "page" : undefined}><Icon size={19} /><span>{section.title}</span>{data && ["produits", "packs"].includes(section.key) && <small>{products.filter(product => (section.key === "packs") === (product.category === "bundle")).length}</small>}</Link>; })}</nav><div className="admin-sidebar-foot"><span>SFAX · TUNISIE</span><span>TND</span></div></aside>
    <div className="admin-main"><header className="admin-topbar"><span>EDDFA <ChevronRight size={14} />{current.title}</span><div><Link className="admin-store-link" href="/fr" target="_blank" rel="noopener noreferrer">Voir la boutique<ArrowUpRight size={17} /></Link><button className="admin-icon" title="Se déconnecter" aria-label="Se déconnecter" disabled={logoutBusy} onClick={() => void signOut()}>{logoutBusy ? <LoaderCircle className="admin-spin" size={18} /> : <LogOut size={18} />}</button></div></header>
      <main className="admin-content"><div className="admin-page-heading"><div><span className="admin-eyebrow">VOTRE BOUTIQUE</span><h1>{current.title}</h1></div><div className="admin-heading-actions"><IconButton title="Actualiser" disabled={refreshing} onClick={() => void load().catch(() => {})}><RefreshCw size={18} className={refreshing ? "admin-spin" : ""} /></IconButton>{["produits", "packs"].includes(view) && <button className="admin-button primary" disabled={!data} onClick={addProduct}><Plus size={18} />{view === "packs" ? "Ajouter un pack" : "Ajouter un produit"}</button>}{view === "promos" && <button className="admin-button primary" disabled={!data} onClick={addPromotion}><Plus size={18} />Ajouter un code</button>}</div></div>
        {error && <div className="admin-error admin-page-error" role="alert"><CircleAlert size={18} /><span>{error}</span><button className="admin-button" onClick={() => void load().catch(() => {})}>Réessayer</button></div>}
        {loading ? <div className="admin-loading" role="status"><LoaderCircle size={24} className="admin-spin" />Chargement de la boutique…</div> : data && <>
          {view === "apercu" && <><div className="admin-metrics">{[["Produits publiés", regular.filter(product => product.status === "published").length, Package], ["Versions en stock", regular.flatMap(product => product.variants).filter(variant => (variant.stocked ?? 0) > (variant.reserved ?? 0)).length, Warehouse], ["Codes actifs", data.promotions.filter(promo => promo.status === "active").length, Tag], ["Commandes", data.orders.length, ShoppingBag]].map(([label, value, Icon]) => { const MetricIcon = Icon as typeof Package; return <div key={String(label)}><span>{String(label)}<MetricIcon size={19} /></span><strong>{String(value)}</strong></div>; })}</div>
            <section className="admin-section"><div className="admin-section-heading"><h2>Votre catalogue</h2><button className="admin-button primary" onClick={() => setEditor(blankProduct())}><Plus size={17} />Ajouter un produit</button></div><ProductRows products={regular} onEdit={setEditor} onDelete={deleteProduct} /></section>
            {regular.some(product => product.variants.some(variant => variant.price === null)) && <section className="admin-section admin-completeness"><div><CircleAlert size={21} /><h2>Prix à compléter</h2></div>{regular.filter(product => product.variants.some(variant => variant.price === null)).map(product => <button key={product.id} onClick={() => setEditor(product)}><span>{product.title}</span><span>{product.variants.filter(variant => variant.price === null).length} {product.variants.length > 1 ? "versions" : "version"}<ChevronRight size={17} /></span></button>)}</section>}
          </>}
          {view !== "apercu" && <div className="admin-toolbar"><label className="admin-search"><Search size={18} /><input type="search" aria-label="Rechercher" placeholder={view === "promos" ? "Rechercher un code…" : view === "commandes" ? "Commande, client…" : "Rechercher un produit…"} value={query} onChange={event => setQuery(event.target.value)} /></label>{["produits", "packs"].includes(view) && <div className="admin-segment" aria-label="Visibilité">{[["all", "Tous"], ["published", "Publiés"], ["draft", "Brouillons"]].map(([key, label]) => <button key={key} aria-pressed={filter === key} onClick={() => setFilter(key)}>{label}</button>)}</div>}</div>}
          {["produits", "packs"].includes(view) && (shownProducts.length ? <ProductRows products={shownProducts} onEdit={setEditor} onDelete={deleteProduct} /> : <Empty title={query || filter !== "all" ? "Aucun résultat." : view === "packs" ? "Aucun pack pour le moment." : "Votre catalogue est vide."} action={query || filter !== "all" ? undefined : view === "packs" ? "Ajouter un pack" : "Ajouter un produit"} onClick={addProduct} />)}
          {view === "stock" && <><div className="admin-location"><Warehouse size={18} />EDDFA Sfax</div><div className="admin-stock-list"><div className="admin-stock-labels"><span>Produit / version</span><span>Référence</span><span>Réservé</span><span>Disponible</span><span>Stock total</span></div>{stockProducts.flatMap(product => product.variants.map(variant => <StockRow key={`${variant.id}-${variant.stocked}`} product={product} variant={variant} locationId={data.locationId} saved={saved} />))}</div>{!stockProducts.length && <Empty title="Aucun résultat." />}</>}
          {view === "promos" && (data.promotions.filter(promo => matches(promo.code)).length ? <div className="admin-promo-list"><div className="admin-promo-labels"><span>Code</span><span>Remise</span><span>Utilisations</span><span>Statut</span><span /></div>{data.promotions.filter(promo => matches(promo.code)).map(promo => <div className="admin-promo-row" key={promo.id}><strong className="admin-code">{promo.code}</strong><span>{promo.type === "percentage" ? `${promo.value} %` : money(promo.value)}</span><span>{promo.used ?? 0}{promo.limit ? ` / ${promo.limit}` : " / ∞"}</span><Badge status={promo.status} /><div className="admin-row-actions"><IconButton title={`Modifier ${promo.code}`} onClick={() => setPromoEditor(promo)}><Pencil size={16} /></IconButton><IconButton title={`Supprimer ${promo.code}`} onClick={() => { setDeleteError(""); setDeletion({ path: `promotions/${promo.id}`, name: promo.code }); }}><Trash2 size={16} /></IconButton></div></div>)}</div> : <Empty title={query ? "Aucun résultat." : "Aucun code promo pour le moment."} action={query ? undefined : "Ajouter un code"} onClick={addPromotion} />)}
          {view === "commandes" && (data.orders.filter(order => matches(`${order.display_id} ${order.email ?? ""} ${order.shipping_address?.first_name ?? ""} ${order.shipping_address?.last_name ?? ""}`)).length ? <div className="admin-orders-list">{data.orders.filter(order => matches(`${order.display_id} ${order.email ?? ""} ${order.shipping_address?.first_name ?? ""} ${order.shipping_address?.last_name ?? ""}`)).map(order => <button className="admin-order-row" key={order.id} onClick={() => setOrder(order)}><strong>#{order.display_id}</strong><span>{order.shipping_address?.first_name} {order.shipping_address?.last_name}<small>{new Intl.DateTimeFormat("fr-TN").format(new Date(order.created_at))}</small></span><strong>{money(order.total)}</strong><Badge status={order.status} /><ChevronRight size={18} /></button>)}</div> : <Empty title={query ? "Aucun résultat." : "Aucune commande pour le moment."} />)}
        </>}
      </main><footer className="admin-workspace-footer"><span>EDDFA · ALUMINIUM & CONFORT</span><span>{email}</span></footer>
    </div>
    {notice && <div className="admin-toast" role="status"><Check size={18} />{notice}</div>}
    {editor && <ProductEditor key={editor.id ?? "new"} initial={editor} products={products} onClose={() => setEditor(null)} onSaved={saved} />}
    {promoEditor && <PromotionEditor key={promoEditor.id ?? "new"} initial={promoEditor} onClose={() => setPromoEditor(null)} onSaved={saved} />}
    {deletion && <DeleteDialog name={deletion.name} busy={deleteBusy} error={deleteError} onClose={() => setDeletion(null)} onConfirm={() => void confirmDelete()} />}
    {order && <OrderDetails order={order} onClose={() => setOrder(null)} />}
  </div>;
}
