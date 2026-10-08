export type Locale = "fr" | "ar";
export type Localized = Record<Locale, string>;
export const locales: Locale[] = ["fr", "ar"];
export function isLocale(value: string): value is Locale { return locales.includes(value as Locale); }

// Supplied catalog data. These IDs are local content keys, not manufacturer SKUs.
export type ProductVariant = {
  id: string;
  dimensions: [number, number, number];
  thermalPower: number;
  centres?: number;
  resistance?: number;
  weight?: number;
  price?: number | null;
};
export type CatalogProduct = {
  id: string;
  handle: string;
  title: Localized;
  description: Localized;
  category: "eden" | "eclat" | "bundle";
  bundleComponents?: { title: Localized; version: string; quantity: number }[];
  tubes?: number;
  installation: Localized;
  variants: ProductVariant[];
  image: string;
  gallery: string[];
  price: null;
  purchasable: false;
};

export const asset = (name: string) => `/eddfa/${name}.webp`;
export const products: CatalogProduct[] = [
  {
    id: "eden-80", handle: "eden-80", title: { fr: "EDEN 80", ar: "EDEN 80" }, category: "eden", tubes: 13,
    description: { fr: "Un sèche-serviettes à eau chaude compact, composé de 13 tubes en aluminium. Deux largeurs pour trouver sa place dans votre salle de bain.", ar: "مجفف مناشف مدمج بالماء الساخن، يتكون من 13 أنبوباً من الألمنيوم. عرضان ليناسب مساحة حمامك." },
    installation: { fr: "À raccorder à une chaudière de chauffage central. Faites vérifier les raccordements et l’entraxe par un installateur qualifié.", ar: "يُربط بمرجل التدفئة المركزية. يجب التحقق من التوصيلات والمسافة بين محوريها مع فني مؤهل." },
    image: asset("eden-80"), gallery: [asset("eden-80")],
    variants: [{ id: "eden-80-475", dimensions: [800, 475, 25], centres: 450, thermalPower: 382, weight: 3.7 }, { id: "eden-80-525", dimensions: [800, 525, 25], centres: 500, thermalPower: 410, weight: 3.9 }], price: null, purchasable: false,
  },
  {
    id: "eden-100", handle: "eden-100", title: { fr: "EDEN 100", ar: "EDEN 100" }, category: "eden", tubes: 17,
    description: { fr: "17 tubes en aluminium pour réchauffer votre salle de bain et vos serviettes. Un format de 1 mètre, disponible avec deux entraxes de raccordement.", ar: "17 أنبوباً من الألمنيوم لتدفئة حمامك ومناشفك. ارتفاع متر واحد وخياران للمسافة بين محوري التوصيل." },
    installation: { fr: "Nécessite un chauffage central à eau chaude. L’installation et le raccordement sont à confier à un professionnel qualifié.", ar: "يتطلب تدفئة مركزية بالماء الساخن. يُعهد بالتركيب والتوصيل إلى فني مؤهل." },
    image: asset("eden-100"), gallery: [asset("eden-100")],
    variants: [{ id: "eden-100-475", dimensions: [1000, 475, 25], centres: 450, thermalPower: 495, weight: 4.7 }, { id: "eden-100-525", dimensions: [1000, 525, 25], centres: 500, thermalPower: 530, weight: 5 }], price: null, purchasable: false,
  },
  {
    id: "eden-120", handle: "eden-120", title: { fr: "EDEN 120", ar: "EDEN 120" }, category: "eden", tubes: 21,
    description: { fr: "Le plus grand format EDEN : 21 tubes en aluminium et 1,20 mètre de hauteur. Une surface généreuse pour les serviettes de toute la famille.", ar: "أكبر مقاس في مجموعة EDEN: 21 أنبوباً من الألمنيوم وارتفاع 1.20 متر، بمساحة واسعة لمناشف العائلة." },
    installation: { fr: "Radiateur à eau chaude relié au chauffage central. Vérifiez l’espace disponible et les raccordements avec votre installateur.", ar: "مشعّ بالماء الساخن متصل بالتدفئة المركزية. تحقّق من المساحة المتاحة والتوصيلات مع الفني." },
    image: asset("eden-120"), gallery: [asset("eden-120")],
    variants: [{ id: "eden-120-475", dimensions: [1200, 475, 25], centres: 450, thermalPower: 610, weight: 5.75 }, { id: "eden-120-525", dimensions: [1200, 525, 25], centres: 500, thermalPower: 653, weight: 6.1 }], price: null, purchasable: false,
  },
  {
    id: "eclat-classic", handle: "eclat-classic", title: { fr: "ECLAT CLASSIC", ar: "ECLAT CLASSIC" }, category: "eclat",
    description: { fr: "Le confort électrique en toute simplicité. Un élément chauffant marche/arrêt, sans réglage, pour une utilisation indépendante du chauffage central.", ar: "راحة كهربائية بكل بساطة. عنصر تسخين يعمل بالتشغيل والإيقاف دون ضبط، باستقلال عن التدفئة المركزية." },
    installation: { fr: "Modèle électrique mural. Vérifiez la fixation et le raccordement électrique adapté à votre salle de bain avec un professionnel.", ar: "طراز كهربائي جداري. تحقّق مع فني من التثبيت والتوصيل الكهربائي المناسب لحمامك." },
    image: asset("gallery-001"), gallery: [asset("gallery-001"), asset("eclat-classic")],
    variants: [{ id: "eclat-classic-250", dimensions: [800, 450, 25], resistance: 250, thermalPower: 420 }, { id: "eclat-classic-400", dimensions: [1000, 450, 25], resistance: 400, thermalPower: 560 }], price: null, purchasable: false,
  },
  {
    id: "eclat-confort", handle: "eclat-confort", title: { fr: "ECLAT CONFORT", ar: "ECLAT CONFORT" }, category: "eclat",
    description: { fr: "Un sèche-serviettes électrique réglable et programmable. Adaptez son fonctionnement à votre rythme, pour joindre l’économie au confort.", ar: "مجفف مناشف كهربائي قابل للضبط والبرمجة. اضبط تشغيله وفق يومك للجمع بين الاقتصاد والراحة." },
    installation: { fr: "Modèle électrique mural avec commande programmable. Le raccordement doit respecter les exigences de sécurité de votre salle de bain.", ar: "طراز كهربائي جداري بتحكم قابل للبرمجة. يجب أن يراعي التوصيل متطلبات سلامة الحمام." },
    image: asset("gallery-002"), gallery: [asset("gallery-002"), asset("eclat-confort")],
    variants: [{ id: "eclat-confort-300", dimensions: [800, 450, 25], resistance: 300, thermalPower: 425 }, { id: "eclat-confort-600", dimensions: [1200, 450, 25], resistance: 600, thermalPower: 680 }], price: null, purchasable: false,
  },
  {
    id: "eclat-service", handle: "eclat-service", title: { fr: "ECLAT SERVICE", ar: "ECLAT SERVICE" }, category: "eclat",
    description: { fr: "Un sèche-serviettes électrique sur pied, sans fixation murale. Il se pose au sol et peut être déplacé d’un espace à l’autre.", ar: "مجفف مناشف كهربائي قائم بذاته دون تثبيت جداري. يُوضع على الأرض ويمكن نقله من مساحة إلى أخرى." },
    installation: { fr: "À poser sur une surface stable, dans un emplacement compatible avec la sécurité électrique. Consultez les consignes d’utilisation avant déplacement.", ar: "يُوضع على سطح ثابت في موقع مناسب للسلامة الكهربائية. راجع تعليمات الاستخدام قبل نقله." },
    image: asset("gallery-003"), gallery: [asset("gallery-003"), asset("eclat-service")],
    variants: [{ id: "eclat-service-250", dimensions: [900, 450, 25], resistance: 250, thermalPower: 420 }, { id: "eclat-service-400", dimensions: [1100, 450, 25], resistance: 400, thermalPower: 560 }], price: null, purchasable: false,
  },
];

export type Inspiration = { id: string; title: Localized; image: string; category: "noir" | "blanc" };
export const inspirations: Inspiration[] = [
  { id: "001", title: { fr: "Le confort en noir", ar: "راحة باللون الأسود" }, image: asset("gallery-001"), category: "noir" },
  { id: "002", title: { fr: "Douceur en blanc", ar: "نعومة باللون الأبيض" }, image: asset("gallery-002"), category: "blanc" },
  { id: "003", title: { fr: "Des lignes épurées", ar: "خطوط أنيقة" }, image: asset("gallery-003"), category: "noir" },
  { id: "004", title: { fr: "La chaleur au quotidien", ar: "دفء كل يوم" }, image: asset("gallery-004"), category: "noir" },
  { id: "005", title: { fr: "Une touche de lumière", ar: "لمسة من الضوء" }, image: asset("gallery-005"), category: "blanc" },
  { id: "006", title: { fr: "Votre rituel de confort", ar: "راحتك اليومية" }, image: asset("gallery-006"), category: "noir" },
  { id: "008", title: { fr: "Naturellement blanc", ar: "أبيض بطابع طبيعي" }, image: asset("gallery-008"), category: "blanc" },
  { id: "009", title: { fr: "Un intérieur qui vous ressemble", ar: "مساحة تعكس ذوقك" }, image: asset("gallery-009"), category: "noir" },
  { id: "0011", title: { fr: "Le détail fait la différence", ar: "التفاصيل تصنع الفرق" }, image: asset("gallery-0011"), category: "noir" },
];

export const company = {
  name: "EDDFA",
  phone: "31 547 491",
  telephone: "+21631547491",
  email: "Commercial@eddfa.tn",
  address: "Route de Gabès, boulevard de l'environnement, rue Maarouf Essrarfi, Sfax 3000, Tunisie",
  mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d13116.65788972195!2d10.7389973!3d34.7262484!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x13002d34b7318d03%3A0x809d528a43131c33!2sEDDFA!5e0!3m2!1sfr!2stn!4v1664369613082!5m2!1sfr!2stn",
  footerCreditApproved: true,
};

export const messages = {
  fr: {
    nav: ["Accueil", "À propos", "Produits", "Photos", "Contact"],
    tagline: "ALUMINIUM & CONFORT",
    heroTitle: "Sèche-serviettes en aluminium.",
    heroText: "Fabriqués à Sfax. À eau chaude ou électriques, trouvez le confort qui s’accorde à votre salle de bain.",
    contact: "Contactez-nous", quote: "Demander un devis", discover: "Découvrir", allProducts: "Tous les produits", allProjects: "Toutes les inspirations",
    what: "FABRICANT TUNISIEN", aboutTitle: "Le confort commence chez nous.",
    aboutText: "Installée à Sfax, EDDFA fabrique des sèche-serviettes en aluminium. Nos deux univers, EDEN à eau chaude et ECLAT électrique, accompagnent les besoins de votre intérieur.",
    services: ["Fabrication en aluminium", "Conception & développement", "EDEN · eau chaude", "ECLAT · électrique", "Conseil avant installation", "Particuliers & professionnels"],
    profile: "Découvrir notre entreprise", productsEyebrow: "NOS SÈCHE-SERVIETTES", productsTitle: "Deux gammes. Votre confort.",
    why: "NOTRE APPROCHE", commitment: "L’exigence, jusque dans les détails.",
    principles: [
      { title: "L’aluminium, notre métier", text: "Développement et fabrication : notre équipe à Sfax travaille la matière pour concevoir des sèche-serviettes fonctionnels et esthétiques." },
      { title: "EDEN ou ECLAT", text: "EDEN se raccorde à votre chauffage central. ECLAT fonctionne à l’électricité, avec des modèles marche/arrêt, programmables ou sur pied." },
      { title: "Un choix bien accompagné", text: "Dimensions, entraxe, puissance et installation : échangeons sur votre salle de bain avant de choisir le bon modèle." },
    ],
    projects: "LA COLLECTION EN IMAGES", inspirationTitle: "La chaleur a du style.",
    collections: "NOS MODÈLES", collectionsTitle: "À chaque salle de bain son modèle.",
    trust: "POURQUOI NOUS RENCONTRER ?",
    benefits: [
      { title: "Fabricant à Sfax", text: "Une entreprise tunisienne, un interlocuteur pour votre projet." },
      { title: "Votre installation", text: "Les bons renseignements avant de choisir votre équipement." },
      { title: "À votre écoute", text: "Particuliers et professionnels, parlons de vos besoins." },
      { title: "Des choix clairs", text: "Des informations produit utiles, sans détour." },
    ],
    cta: "Votre intérieur.\nVotre projet.", ctaText: "Une question sur un produit ou une installation ? Échangeons avec l’équipe EDDFA.",
    quickLinks: "Liens utiles", address: "Nous trouver", footerText: "EDDFA, fabricant de sèche-serviettes en aluminium. À Sfax, au service de votre confort intérieur.",
    rights: "EDDFA. Tous droits réservés.", menu: "Ouvrir le menu", close: "Fermer", next: "Suivant", previous: "Précédent", language: "العربية", skip: "Aller au contenu", back: "Retour aux produits", zoom: "Agrandir l’image",
    catalogTitle: "Nos sèche-serviettes", catalogText: "EDEN à eau chaude, ECLAT électrique. Des modèles en aluminium pour réchauffer votre salle de bain et vos serviettes.", bundle: "Packs", composition: "Composition du pack",
    all: "Tout", eden: "EDEN · Eau chaude", eclat: "ECLAT · Électrique", black: "Noir", white: "Blanc", search: "Rechercher un produit", searchPlaceholder: "EDEN, ECLAT, programmable…", noResults: "Aucun produit ne correspond à votre recherche.", clear: "Réinitialiser", inquiry: "Parlons de votre projet", onRequest: "Prix sur demande", selection: "Sélection", specifications: "Caractéristiques", productNote: "Valeurs issues du catalogue fourni. Conditions de mesure de la puissance thermique à confirmer avec EDDFA.",
    variant: "Dimensions & version", height: "Hauteur", width: "Largeur", depth: "Profondeur", centres: "Entraxe", resistance: "Résistance électrique", thermalPower: "Puissance thermique annoncée", weight: "Poids", tubes: "Tubes", installation: "Installation", construction: "Tubes ronds en aluminium de diamètre 20 mm, fixés entre des collecteurs.",
    certificate: "Avis technique Veritas · EN 442-1", certificateText: "Document de 2023 concernant EDEN 100/50. Validité indiquée jusqu’au 25 juin 2026 ; renouvellement non fourni.", certificateLink: "Consulter le document (PDF)",
    aboutPageTitle: "EDDFA.\nLa matière, le confort.", contactTitle: "Parlons de votre projet.", contactText: "Un modèle, une dimension, une question ? Notre équipe est à votre écoute.",
    formTitle: "Votre demande", name: "Nom et prénom", phone: "Téléphone", email: "Email (facultatif)", region: "Gouvernorat", chooseRegion: "Sélectionner", product: "Modèle", chooseProduct: "À préciser", chooseVariant: "À préciser", message: "Votre message", submit: "Préparer ma demande", prepared: "Demande préparée, non envoyée.", draftText: "Vous pouvez télécharger votre demande ou l’adresser à notre équipe par email.", download: "Télécharger", emailDraft: "Ouvrir mon email", another: "Nouvelle demande", invalidPhone: "Indiquez un numéro tunisien valide à 8 chiffres.",
    adminTitle: "Espace administration", adminUnavailable: "L’accès à l’administration n’est pas encore disponible.", returnHome: "Retour à l’accueil", notFound: "Page introuvable", notFoundText: "Cette page n’existe pas ou a été déplacée.", pauseVideo: "Mettre la vidéo en pause", playVideo: "Lire la vidéo",
  },
  ar: {
    nav: ["الرئيسية", "من نحن", "المنتجات", "الصور", "اتصل بنا"],
    tagline: "ألمنيوم وراحة",
    heroTitle: "مجففات مناشف من الألمنيوم.",
    heroText: "صُنعت في صفاقس. بالماء الساخن أو بالكهرباء، اختر الراحة المناسبة لحمامك.",
    contact: "اتصل بنا", quote: "اطلب عرض سعر", discover: "اكتشف", allProducts: "جميع المنتجات", allProjects: "جميع الصور",
    what: "صناعة تونسية", aboutTitle: "الراحة تبدأ من هنا.",
    aboutText: "تُصنّع EDDFA في صفاقس مجففات مناشف من الألمنيوم. مجموعتا EDEN بالماء الساخن وECLAT الكهربائية تلبيان احتياجات مساحتك الداخلية.",
    services: ["تصنيع من الألمنيوم", "تصميم وتطوير", "EDEN · ماء ساخن", "ECLAT · كهربائي", "نصائح قبل التركيب", "أفراد ومهنيون"],
    profile: "اكتشف شركتنا", productsEyebrow: "مجففات المناشف", productsTitle: "مجموعتان لراحتك.",
    why: "نهجنا", commitment: "اهتمام بالجودة حتى أدق التفاصيل.",
    principles: [
      { title: "الألمنيوم اختصاصنا", text: "من التطوير إلى التصنيع، يعمل فريقنا في صفاقس لتصميم مجففات مناشف تجمع بين الوظيفة والجمال." },
      { title: "EDEN أو ECLAT", text: "تتصل EDEN بالتدفئة المركزية. تعمل ECLAT بالكهرباء، بطرازات تشغيل وإيقاف أو قابلة للبرمجة أو قائمة بذاتها." },
      { title: "اختيار بمرافقة فريقنا", text: "المقاسات والمسافة بين التوصيلات والقدرة والتركيب: لنتحدث عن حمامك قبل اختيار الطراز المناسب." },
    ],
    projects: "المجموعة بالصور", inspirationTitle: "دفء بطابع أنيق.",
    collections: "طرازاتنا", collectionsTitle: "لكل حمام طرازه المناسب.",
    trust: "لماذا نتحدث معاً؟",
    benefits: [
      { title: "مصنع في صفاقس", text: "شركة تونسية وفريق يهتم بمشروعك." },
      { title: "التركيب المناسب", text: "المعلومات الضرورية قبل اختيار تجهيزاتك." },
      { title: "نستمع إليك", text: "للأفراد والمهنيين، لنتحدث عن احتياجاتكم." },
      { title: "خيارات واضحة", text: "معلومات مفيدة عن المنتجات دون تعقيد." },
    ],
    cta: "مساحتك.\nمشروعك.", ctaText: "سؤال عن منتج أو تركيب؟ تواصل مع فريق EDDFA.",
    quickLinks: "روابط مفيدة", address: "موقعنا", footerText: "EDDFA، مصنع مجففات مناشف من الألمنيوم في صفاقس، لراحة مساحتك الداخلية.",
    rights: "EDDFA. جميع الحقوق محفوظة.", menu: "فتح القائمة", close: "إغلاق", next: "التالي", previous: "السابق", language: "Français", skip: "الانتقال إلى المحتوى", back: "العودة إلى المنتجات", zoom: "تكبير الصورة",
    catalogTitle: "مجففات المناشف", catalogText: "EDEN بالماء الساخن وECLAT بالكهرباء. طرازات من الألمنيوم لتدفئة حمامك ومناشفك.", bundle: "مجموعات", composition: "محتويات المجموعة",
    all: "الكل", eden: "EDEN · ماء ساخن", eclat: "ECLAT · كهربائي", black: "أسود", white: "أبيض", search: "البحث عن منتج", searchPlaceholder: "EDEN، ECLAT، قابل للبرمجة…", noResults: "لا توجد منتجات تطابق بحثك.", clear: "إعادة ضبط", inquiry: "لنتحدث عن مشروعك", onRequest: "السعر عند الطلب", selection: "اختيارات", specifications: "المواصفات", productNote: "قيم من الكتالوج المقدم. يرجى تأكيد ظروف قياس القدرة الحرارية مع EDDFA.",
    variant: "المقاسات والإصدار", height: "الارتفاع", width: "العرض", depth: "العمق", centres: "المسافة بين محوري التوصيل", resistance: "قدرة عنصر التسخين الكهربائي", thermalPower: "القدرة الحرارية المعلنة", weight: "الوزن", tubes: "الأنابيب", installation: "التركيب", construction: "أنابيب ألمنيوم دائرية بقطر 20 مم مثبتة بين أنابيب التجميع.",
    certificate: "رأي فني من Veritas · EN 442-1", certificateText: "وثيقة من سنة 2023 تخص EDEN 100/50. الصلاحية المذكورة حتى 25 جوان 2026؛ لم يُقدّم تجديد.", certificateLink: "عرض الوثيقة (PDF)",
    aboutPageTitle: "EDDFA.\nالخامة والراحة.", contactTitle: "لنتحدث عن مشروعك.", contactText: "منتج أو مقاس أو سؤال؟ فريقنا يستمع إليك.",
    formTitle: "طلبك", name: "الاسم واللقب", phone: "الهاتف", email: "البريد الإلكتروني (اختياري)", region: "الولاية", chooseRegion: "اختر", product: "الطراز", chooseProduct: "يُحدّد لاحقاً", chooseVariant: "يُحدّد لاحقاً", message: "رسالتك", submit: "تحضير طلبي", prepared: "تم تحضير الطلب ولم يُرسل.", draftText: "يمكنك تنزيل طلبك أو إرساله إلى فريقنا بالبريد الإلكتروني.", download: "تنزيل", emailDraft: "فتح البريد الإلكتروني", another: "طلب جديد", invalidPhone: "أدخل رقم هاتف تونسي صحيحاً من 8 أرقام.",
    adminTitle: "مساحة الإدارة", adminUnavailable: "الدخول إلى الإدارة غير متاح بعد.", returnHome: "العودة إلى الرئيسية", notFound: "الصفحة غير موجودة", notFoundText: "هذه الصفحة غير موجودة أو نُقلت.", pauseVideo: "إيقاف الفيديو مؤقتاً", playVideo: "تشغيل الفيديو",
  },
};

export const navPaths = ["", "/a-propos", "/produits", "/inspirations", "/contact"] as const;
export const pageContentId = "page-content";

export function navigationHref(locale: Locale, path: typeof navPaths[number]) {
  return `/${locale}${path}`;
}

export const governorates: Localized[] = [
  { fr: "Ariana", ar: "أريانة" }, { fr: "Béja", ar: "باجة" }, { fr: "Ben Arous", ar: "بن عروس" }, { fr: "Bizerte", ar: "بنزرت" }, { fr: "Gabès", ar: "قابس" }, { fr: "Gafsa", ar: "قفصة" }, { fr: "Jendouba", ar: "جندوبة" }, { fr: "Kairouan", ar: "القيروان" }, { fr: "Kasserine", ar: "القصرين" }, { fr: "Kébili", ar: "قبلي" }, { fr: "Le Kef", ar: "الكاف" }, { fr: "Mahdia", ar: "المهدية" }, { fr: "La Manouba", ar: "منوبة" }, { fr: "Médenine", ar: "مدنين" }, { fr: "Monastir", ar: "المنستير" }, { fr: "Nabeul", ar: "نابل" }, { fr: "Sfax", ar: "صفاقس" }, { fr: "Sidi Bouzid", ar: "سيدي بوزيد" }, { fr: "Siliana", ar: "سليانة" }, { fr: "Sousse", ar: "سوسة" }, { fr: "Tataouine", ar: "تطاوين" }, { fr: "Tozeur", ar: "توزر" }, { fr: "Tunis", ar: "تونس" }, { fr: "Zaghouan", ar: "زغوان" },
];
