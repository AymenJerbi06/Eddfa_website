"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { ArrowLeft, ArrowRight, Check, ImagePlus, LoaderCircle, Plus, Save, Trash2, X } from "lucide-react";
import { useState, type FormEvent, type ReactNode } from "react";
import { blankVariant, type AdminProduct, type AdminPromotion, type AdminVariant } from "@/lib/admin-types";
import { adminApi } from "./api";

export const money = (value: number) => new Intl.NumberFormat("fr-TN", { style: "currency", currency: "TND", minimumFractionDigits: 3 }).format(value);
export const photoUrl = (filename: string) => `/api/catalog-image/${encodeURIComponent(filename)}`;
export function IconButton({ title, children, onClick, disabled = false, className = "" }: { title: string; children: ReactNode; onClick: () => void; disabled?: boolean; className?: string }) { return <button type="button" title={title} aria-label={title} className={`admin-icon ${className}`} onClick={onClick} disabled={disabled}>{children}</button>; }
function Drawer({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return <Dialog.Root open onOpenChange={open => { if (!open) onClose(); }}><Dialog.Portal><Dialog.Overlay className="admin-overlay" /><Dialog.Content className="admin-drawer eddfa-admin" aria-describedby={undefined}><div className="admin-drawer-header"><Dialog.Title>{title}</Dialog.Title><Dialog.Close asChild><button type="button" title="Fermer" aria-label="Fermer" className="admin-icon"><X size={21} /></button></Dialog.Close></div>{children}</Dialog.Content></Dialog.Portal></Dialog.Root>;
}
function NumberField({ label, value, onChange, decimal = false, unit, required = false }: { label: string; value: number | null; onChange: (value: number | null) => void; decimal?: boolean; unit?: string; required?: boolean }) {
  return <label>{label}<span className="admin-unit-field"><input type="number" min="0" max="1000000" step={decimal ? "0.001" : "1"} value={value ?? ""} required={required} onChange={event => onChange(event.target.value === "" ? null : Number(event.target.value))} />{unit && <span>{unit}</span>}</span></label>;
}
function productPayload(product: AdminProduct) {
  const { id: _id, updatedAt: _updated, ...rest } = product;
  void _id; void _updated;
  return { ...rest, variants: product.variants.map(({ inventoryId: _inventory, stocked: _stock, reserved: _reserved, ...variant }) => { void _inventory; void _stock; void _reserved; return variant; }) };
}
export function ProductEditor({ initial, products, onClose, onSaved }: { initial: AdminProduct; products: AdminProduct[]; onClose: () => void; onSaved: () => Promise<void> }) {
  const [product, setProduct] = useState<AdminProduct>(() => structuredClone(initial));
  const [tab, setTab] = useState("produit");
  const [language, setLanguage] = useState("fr");
  const [handleEdited, setHandleEdited] = useState(!!initial.id);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [mediaLibrary, setMediaLibrary] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const bundle = product.category === "bundle";
  const variants = products.filter(item => item.category !== "bundle").flatMap(item => item.variants.filter(variant => variant.id && variant.inventoryId).map(variant => ({ id: variant.id!, label: `${item.title} · ${variant.title}` })));
  const set = <K extends keyof AdminProduct>(key: K, value: AdminProduct[K]) => setProduct(current => ({ ...current, [key]: value }));
  function changeVariant<K extends keyof AdminVariant>(key: K, value: AdminVariant[K]) {
    setProduct(current => ({ ...current, variants: current.variants.map((variant, index) => index === selectedVariant ? { ...variant, [key]: value } : variant) }));
  }
  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setError(""); setUploading(true);
    try {
      if (product.images.length + files.length > 12) throw new Error("Vous pouvez ajouter jusqu'à 12 photos.");
      for (const file of Array.from(files)) {
        const form = new FormData(); form.append("file", file);
        const data = await adminApi<{ filename: string }>("uploads", form, "POST");
        setProduct(current => ({ ...current, images: [...current.images, data.filename] }));
      }
    } catch (error) { setError(error instanceof Error ? error.message : "Ajout impossible."); }
    finally { setUploading(false); }
  }
  async function save(event: FormEvent) {
    event.preventDefault(); setError(""); setBusy(true);
    try {
      const saved = await adminApi<{ product: AdminProduct }>(`products${product.id ? `/${product.id}` : ""}`, productPayload(product), "POST");
      setProduct(saved.product);
      await onSaved(); onClose();
    } catch (error) { setError(error instanceof Error ? error.message : "Enregistrement impossible."); setBusy(false); }
  }
  const variant = product.variants[selectedVariant] ?? product.variants[0];
  const library = [...new Set(products.flatMap(item => item.images))].filter(image => !product.images.includes(image));
  function moveImage(index: number, delta: number) { const images = [...product.images]; [images[index], images[index + delta]] = [images[index + delta], images[index]]; set("images", images); }
  return <Drawer title={`${product.id ? "Modifier" : "Ajouter"} ${bundle ? "un pack" : "un produit"}`} onClose={() => { if (!busy && !uploading) onClose(); }}>
    <form className="admin-editor" onSubmit={save}>
      <div className="admin-editor-tabs" role="tablist" aria-label="Fiche produit">{[["produit", "Produit"], ["photos", "Photos"], ["versions", bundle ? "Prix" : "Versions & prix"], ...(bundle ? [["composition", "Composition"]] : [])].map(([key, label]) => <button type="button" role="tab" aria-selected={tab === key} key={key} onClick={() => setTab(key)}>{label}{key === "photos" && <span>{product.images.length}</span>}</button>)}</div>
      <div className="admin-editor-body">
        {tab === "produit" && <><div className="admin-form-heading"><h3>Informations</h3><div className="admin-segment" aria-label="Langue">{["fr", "ar"].map(lang => <button type="button" key={lang} aria-pressed={language === lang} onClick={() => setLanguage(lang)}>{lang === "fr" ? "Français" : "العربية"}</button>)}</div></div>
          <label>Nom du {bundle ? "pack" : "produit"}<input required={language === "fr"} value={language === "fr" ? product.title : product.titleAr} dir={language === "ar" ? "rtl" : "ltr"} onChange={event => { const value = event.target.value; setProduct(current => ({ ...current, [language === "fr" ? "title" : "titleAr"]: value, ...(!handleEdited && language === "fr" ? { handle: value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") } : {}) })); }} /></label>
          <label>Description<textarea rows={5} dir={language === "ar" ? "rtl" : "ltr"} value={language === "fr" ? product.description : product.descriptionAr} onChange={event => set(language === "fr" ? "description" : "descriptionAr", event.target.value)} /></label>
          {!bundle && <label>Installation<textarea rows={3} dir={language === "ar" ? "rtl" : "ltr"} value={language === "fr" ? product.installation : product.installationAr} onChange={event => set(language === "fr" ? "installation" : "installationAr", event.target.value)} /></label>}
          <div className="admin-form-grid">{!bundle && <label>Gamme<select value={product.category} onChange={event => set("category", event.target.value as "eden" | "eclat")}><option value="eden">EDEN · Eau chaude</option><option value="eclat">ECLAT · Électrique</option></select></label>}<label>Visibilité<select value={product.status} onChange={event => set("status", event.target.value as "draft" | "published")}><option value="draft">Brouillon</option><option value="published">Publié</option></select></label>{!bundle && <NumberField label="Nombre de tubes" value={product.tubes} onChange={value => set("tubes", value)} />}</div>
          <label>Adresse du produit<input required value={product.handle} pattern="[a-z0-9]+(-[a-z0-9]+)*" onChange={event => { setHandleEdited(true); set("handle", event.target.value); }} /><span className="admin-field-context">/fr/produits/{product.handle || "nom-du-produit"}</span></label>
        </>}
        {tab === "photos" && <><div className="admin-form-heading"><h3>Photos</h3><button type="button" className="admin-button" onClick={() => setMediaLibrary(!mediaLibrary)}>Bibliothèque</button></div><label className={`admin-upload ${uploading ? "busy" : ""}`}>{uploading ? <LoaderCircle className="admin-spin" size={24} /> : <ImagePlus size={25} />}<span>{uploading ? "Ajout en cours…" : "Ajouter des photos"}</span><input aria-label="Ajouter des photos" type="file" accept="image/png,image/jpeg,image/webp" multiple disabled={uploading || busy} onChange={event => { void upload(event.target.files); event.target.value = ""; }} /></label>
          {mediaLibrary && <div className="admin-media-library" aria-label="Bibliothèque de photos">{library.length ? library.map(image => <button type="button" key={image} aria-label={`Choisir ${image}`} onClick={() => { if (product.images.length < 12) set("images", [...product.images, image]); else setError("Maximum 12 photos."); }}><img src={photoUrl(image)} alt="" /><Plus size={17} /></button>) : <p>Aucune autre photo.</p>}</div>}
          <div className="admin-photo-grid">{product.images.map((image, index) => <div className="admin-photo-item" key={image}><img src={photoUrl(image)} alt={`Photo ${index + 1}`} />{index === 0 && <span className="admin-cover-tag">Photo principale</span>}<div className="admin-photo-actions"><IconButton title="Déplacer à gauche" disabled={index === 0 || busy} onClick={() => moveImage(index, -1)}><ArrowLeft size={16} /></IconButton><IconButton title="Déplacer à droite" disabled={index === product.images.length - 1 || busy} onClick={() => moveImage(index, 1)}><ArrowRight size={16} /></IconButton><IconButton title={`Retirer la photo ${index + 1}`} disabled={busy} onClick={() => set("images", product.images.filter((_, item) => item !== index))}><Trash2 size={16} /></IconButton></div></div>)}</div>
        </>}
        {tab === "versions" && <><div className="admin-form-heading"><h3>{bundle ? "Prix du pack" : "Versions & prix"}</h3>{!bundle && <button type="button" className="admin-button" disabled={product.variants.length >= 20} onClick={() => { setSelectedVariant(product.variants.length); set("variants", [...product.variants, { ...blankVariant(), title: `Version ${product.variants.length + 1}` }]); }}><Plus size={16} />Version</button>}</div>
          {!bundle && <div className="admin-variant-tabs">{product.variants.map((item, index) => <button type="button" key={item.id ?? index} aria-pressed={selectedVariant === index} onClick={() => setSelectedVariant(index)}>{item.title || `Version ${index + 1}`}</button>)}</div>}
          <div className="admin-form-grid"><label>Nom de la version<input required value={variant.title} onChange={event => changeVariant("title", event.target.value)} /></label><label>Référence / SKU<input value={variant.sku} onChange={event => changeVariant("sku", event.target.value)} /></label><NumberField label="Prix" value={variant.price} decimal unit="TND" onChange={value => changeVariant("price", value)} /></div>
          {!bundle && <><h3 className="admin-subheading">Dimensions & caractéristiques</h3><div className="admin-form-grid three">{([["height", "Hauteur", "mm"], ["width", "Largeur", "mm"], ["depth", "Profondeur", "mm"], ["thermalPower", "Puissance thermique", "W"], ["resistance", "Résistance électrique", "W"], ["centres", "Entraxe", "mm"], ["weight", "Poids", "kg"]] as const).map(([key, label, unit]) => <NumberField key={key} label={label} unit={unit} decimal={key === "weight"} value={variant[key]} onChange={value => changeVariant(key, value)} />)}</div>{product.variants.length > 1 && <button type="button" className="admin-button danger admin-remove-version" onClick={() => { set("variants", product.variants.filter((_, index) => index !== selectedVariant)); setSelectedVariant(0); }}><Trash2 size={16} />Retirer cette version</button>}</>}
        </>}
        {tab === "composition" && <><div className="admin-form-heading"><h3>Composition du pack</h3><button type="button" className="admin-button" onClick={() => set("components", [...product.components, { variantId: "", quantity: 1 }])}><Plus size={16} />Composant</button></div><div className="admin-bundle-components">{product.components.map((component, index) => <div key={index}><label>Produit / version<select required value={component.variantId} onChange={event => set("components", product.components.map((item, row) => row === index ? { ...item, variantId: event.target.value } : item))}><option value="">Choisir un produit</option>{variants.filter(variant => variant.id === component.variantId || !product.components.some(item => item.variantId === variant.id)).map(variant => <option key={variant.id} value={variant.id}>{variant.label}</option>)}</select></label><NumberField label="Quantité" required value={component.quantity} onChange={value => set("components", product.components.map((item, row) => row === index ? { ...item, quantity: value ?? 1 } : item))} /><IconButton title="Retirer le composant" onClick={() => set("components", product.components.filter((_, row) => row !== index))}><Trash2 size={18} /></IconButton></div>)}</div></>}
      </div>
      <div className="admin-editor-footer">{error && <div className="admin-error" role="alert">{error}</div>}<div><button type="button" className="admin-button" disabled={busy || uploading} onClick={onClose}>Annuler</button><button type="submit" className="admin-button primary" disabled={busy || uploading}>{busy ? <LoaderCircle className="admin-spin" size={17} /> : <Save size={17} />}{busy ? "Enregistrement…" : "Enregistrer"}</button></div></div>
    </form>
  </Drawer>;
}
export function PromotionEditor({ initial, onClose, onSaved }: { initial: AdminPromotion; onClose: () => void; onSaved: () => Promise<void> }) {
  const [promotion, setPromotion] = useState(initial);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function save(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    const { id, used: _used, ...input } = promotion; void _used;
    try { const saved = await adminApi<{ promotion: AdminPromotion }>(`promotions${id ? `/${id}` : ""}`, input, "POST"); setPromotion(saved.promotion); await onSaved(); onClose(); }
    catch (error) { setError(error instanceof Error ? error.message : "Enregistrement impossible."); setBusy(false); }
  }
  return <Drawer title={initial.id ? "Modifier un code promo" : "Ajouter un code promo"} onClose={() => { if (!busy) onClose(); }}><form className="admin-editor" onSubmit={save}><div className="admin-editor-body"><label>Code<input required autoFocus pattern="[A-Za-z0-9_-]{3,40}" value={promotion.code} onChange={event => setPromotion({ ...promotion, code: event.target.value.toUpperCase() })} /></label><div className="admin-form-grid"><label>Type de remise<select value={promotion.type} onChange={event => setPromotion({ ...promotion, type: event.target.value as "percentage" | "fixed" })}><option value="percentage">Pourcentage</option><option value="fixed">Montant fixe</option></select></label><NumberField label="Remise" value={promotion.value} unit={promotion.type === "percentage" ? "%" : "TND"} required decimal onChange={value => setPromotion({ ...promotion, value: value ?? 0 })} /><label>Statut<select value={promotion.status} onChange={event => setPromotion({ ...promotion, status: event.target.value as AdminPromotion["status"] })}><option value="active">Actif</option><option value="draft">Brouillon</option><option value="inactive">Inactif</option></select></label><NumberField label="Nombre d'utilisations maximum" value={promotion.limit} onChange={value => setPromotion({ ...promotion, limit: value })} /></div></div><div className="admin-editor-footer">{error && <div className="admin-error" role="alert">{error}</div>}<div><button type="button" className="admin-button" disabled={busy} onClick={onClose}>Annuler</button><button type="submit" className="admin-button primary" disabled={busy}>{busy ? <LoaderCircle className="admin-spin" size={17} /> : <Check size={17} />}Enregistrer</button></div></div></form></Drawer>;
}
export function DeleteDialog({ name, busy, error, onClose, onConfirm }: { name: string; busy: boolean; error: string; onClose: () => void; onConfirm: () => void }) {
  return <Dialog.Root open onOpenChange={open => { if (!open && !busy) onClose(); }}><Dialog.Portal><Dialog.Overlay className="admin-overlay" /><Dialog.Content className="admin-confirm eddfa-admin"><Dialog.Title>Supprimer « {name} » ?</Dialog.Title><Dialog.Description>Cette suppression ne peut pas être annulée.</Dialog.Description>{error && <div className="admin-error" role="alert">{error}</div>}<div><button className="admin-button" disabled={busy} onClick={onClose}>Annuler</button><button className="admin-button danger" disabled={busy} onClick={onConfirm}>{busy ? <LoaderCircle className="admin-spin" size={17} /> : <Trash2 size={17} />}Supprimer</button></div></Dialog.Content></Dialog.Portal></Dialog.Root>;
}
