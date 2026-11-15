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
  // Installation video supplied by EDDFA: a YouTube link or a file under /public. Shown only when present.
  installationVideo?: string;
};

export const asset = (name: string) => `/eddfa/${name}.webp`;
// Scenes made with AI from EDDFA's own product photos (see ASSET-PROVENANCE.md). The site labels every one of them.
export const isScene = (image: string) => /\/(scene|closer)-[a-z0-9-]+(\.optimized)?\.webp$/.test(image);
export const products: CatalogProduct[] = [
  {
    id: "eden-80", handle: "eden-80", title: { fr: "EDEN 80", ar: "EDEN 80" }, category: "eden", tubes: 13,
    description: { fr: "Un sèche-serviettes à eau chaude compact, composé de 13 tubes en aluminium. Deux largeurs pour trouver sa place dans votre salle de bain.", ar: "مجفف مناشف مدمج بالماء الساخن، يتكون من 13 أنبوباً من الألمنيوم. عرضان ليناسب مساحة حمامك." },
    installation: { fr: "À raccorder à une chaudière de chauffage central. Faites vérifier les raccordements et l’entraxe par un installateur qualifié.", ar: "يُربط بمرجل التدفئة المركزية. يجب التحقق من التوصيلات والمسافة بين محوريها مع فني مؤهل." },
    image: asset("scene-eden-80"), gallery: [asset("scene-eden-80"), asset("scene-eden-80-wide"), asset("scene-eden-80-detail")],
    variants: [{ id: "eden-80-475", dimensions: [800, 475, 25], centres: 450, thermalPower: 382, weight: 3.7 }, { id: "eden-80-525", dimensions: [800, 525, 25], centres: 500, thermalPower: 410, weight: 3.9 }], price: null, purchasable: false,
  },
  {
    id: "eden-100", handle: "eden-100", title: { fr: "EDEN 100", ar: "EDEN 100" }, category: "eden", tubes: 17,
    description: { fr: "17 tubes en aluminium pour réchauffer votre salle de bain et vos serviettes. Un format de 1 mètre, disponible avec deux entraxes de raccordement.", ar: "17 أنبوباً من الألمنيوم لتدفئة حمامك ومناشفك. ارتفاع متر واحد وخياران للمسافة بين محوري التوصيل." },
    installation: { fr: "Nécessite un chauffage central à eau chaude. L’installation et le raccordement sont à confier à un professionnel qualifié.", ar: "يتطلب تدفئة مركزية بالماء الساخن. يُعهد بالتركيب والتوصيل إلى فني مؤهل." },
    image: asset("scene-eden-100"), gallery: [asset("scene-eden-100")],
    variants: [{ id: "eden-100-475", dimensions: [1000, 475, 25], centres: 450, thermalPower: 495, weight: 4.7 }, { id: "eden-100-525", dimensions: [1000, 525, 25], centres: 500, thermalPower: 530, weight: 5 }], price: null, purchasable: false,
  },
  {
    id: "eden-120", handle: "eden-120", title: { fr: "EDEN 120", ar: "EDEN 120" }, category: "eden", tubes: 21,
    description: { fr: "Le plus grand format EDEN : 21 tubes en aluminium et 1,20 mètre de hauteur. Une surface généreuse pour les serviettes de toute la famille.", ar: "أكبر مقاس في مجموعة EDEN: 21 أنبوباً من الألمنيوم وارتفاع 1.20 متر، بمساحة واسعة لمناشف العائلة." },
    installation: { fr: "Radiateur à eau chaude relié au chauffage central. Vérifiez l’espace disponible et les raccordements avec votre installateur.", ar: "مشعّ بالماء الساخن متصل بالتدفئة المركزية. تحقّق من المساحة المتاحة والتوصيلات مع الفني." },
    image: asset("scene-eden-120"), gallery: [asset("scene-eden-120"), asset("closer-eden")],
    variants: [{ id: "eden-120-475", dimensions: [1200, 475, 25], centres: 450, thermalPower: 610, weight: 5.75 }, { id: "eden-120-525", dimensions: [1200, 525, 25], centres: 500, thermalPower: 653, weight: 6.1 }], price: null, purchasable: false,
  },
  {
    id: "eclat-classic", handle: "eclat-classic", title: { fr: "ECLAT CLASSIC", ar: "ECLAT CLASSIC" }, category: "eclat",
    description: { fr: "Le confort électrique en toute simplicité. Un élément chauffant marche/arrêt, sans réglage, pour une utilisation indépendante du chauffage central.", ar: "راحة كهربائية بكل بساطة. عنصر تسخين يعمل بالتشغيل والإيقاف دون ضبط، باستقلال عن التدفئة المركزية." },
    installation: { fr: "Modèle électrique mural. Vérifiez la fixation et le raccordement électrique adapté à votre salle de bain avec un professionnel.", ar: "طراز كهربائي جداري. تحقّق مع فني من التثبيت والتوصيل الكهربائي المناسب لحمامك." },
    image: asset("scene-eclat-classic"), gallery: [asset("scene-eclat-classic"), asset("scene-eclat-classic-terracotta")],
    variants: [{ id: "eclat-classic-250", dimensions: [800, 450, 25], resistance: 250, thermalPower: 420 }, { id: "eclat-classic-400", dimensions: [1000, 450, 25], resistance: 400, thermalPower: 560 }], price: null, purchasable: false,
  },
  {
    id: "eclat-confort", handle: "eclat-confort", title: { fr: "ECLAT CONFORT", ar: "ECLAT CONFORT" }, category: "eclat",
    description: { fr: "Un sèche-serviettes électrique réglable et programmable. Adaptez son fonctionnement à votre rythme, pour joindre l’économie au confort.", ar: "مجفف مناشف كهربائي قابل للضبط والبرمجة. اضبط تشغيله وفق يومك للجمع بين الاقتصاد والراحة." },
    installation: { fr: "Modèle électrique mural avec commande programmable. Le raccordement doit respecter les exigences de sécurité de votre salle de bain.", ar: "طراز كهربائي جداري بتحكم قابل للبرمجة. يجب أن يراعي التوصيل متطلبات سلامة الحمام." },
    image: asset("scene-eclat-confort"), gallery: [asset("scene-eclat-confort"), asset("scene-eclat-confort-wide")],
    variants: [{ id: "eclat-confort-300", dimensions: [800, 450, 25], resistance: 300, thermalPower: 425 }, { id: "eclat-confort-600", dimensions: [1200, 450, 25], resistance: 600, thermalPower: 680 }], price: null, purchasable: false,
  },
  {
    id: "eclat-service", handle: "eclat-service", title: { fr: "ECLAT SERVICE", ar: "ECLAT SERVICE" }, category: "eclat",
    description: { fr: "Un sèche-serviettes électrique sur pied, sans fixation murale. Il se pose au sol et peut être déplacé d’un espace à l’autre.", ar: "مجفف مناشف كهربائي قائم بذاته دون تثبيت جداري. يُوضع على الأرض ويمكن نقله من مساحة إلى أخرى." },
    installation: { fr: "À poser sur une surface stable, dans un emplacement compatible avec la sécurité électrique. Consultez les consignes d’utilisation avant déplacement.", ar: "يُوضع على سطح ثابت في موقع مناسب للسلامة الكهربائية. راجع تعليمات الاستخدام قبل نقله." },
    image: asset("scene-eclat-service"), gallery: [asset("scene-eclat-service")],
    variants: [{ id: "eclat-service-250", dimensions: [900, 450, 25], resistance: 250, thermalPower: 420 }, { id: "eclat-service-400", dimensions: [1100, 450, 25], resistance: 400, thermalPower: 560 }], price: null, purchasable: false,
  },
];

// The photos of the Photos page and of the home strip: bathroom scenes made from EDDFA's product photos (see
// ASSET-PROVENANCE.md). `wide` marks the landscape ones: two columns on the Photos page, not in the home strip.
export type Inspiration = { id: string; title: Localized; image: string; category: "noir" | "blanc"; range: "eden" | "eclat"; wide?: boolean };
export const inspirations: Inspiration[] = [
  { id: "s-eden-80", title: { fr: "EDEN 80 noir, lumière du matin", ar: "EDEN 80 الأسود في ضوء الصباح" }, image: asset("scene-eden-80"), category: "noir", range: "eden" },
  { id: "s-eclat-confort", title: { fr: "ECLAT Confort blanc, tons naturels", ar: "ECLAT Confort الأبيض بألوان طبيعية" }, image: asset("scene-eclat-confort"), category: "blanc", range: "eclat" },
  { id: "s-eclat-service", title: { fr: "ECLAT Service noir sur zellige blanc", ar: "ECLAT Service الأسود على زليج أبيض" }, image: asset("scene-eclat-service"), category: "noir", range: "eclat" },
  { id: "s-eden-100", title: { fr: "EDEN 100 blanc sur faïence verte", ar: "EDEN 100 الأبيض على بلاط أخضر" }, image: asset("scene-eden-100"), category: "blanc", range: "eden" },
  { id: "s-eden-120", title: { fr: "EDEN 120 noir, lumière douce", ar: "EDEN 120 الأسود في ضوء هادئ" }, image: asset("scene-eden-120"), category: "noir", range: "eden" },
  { id: "s-eden-wide", title: { fr: "EDEN 80 noir, la salle de bain au matin", ar: "EDEN 80 الأسود، الحمام في الصباح" }, image: asset("scene-eden-80-wide"), category: "noir", range: "eden", wide: true },
  { id: "s-eclat-classic", title: { fr: "ECLAT Classic noir, salle de bain claire", ar: "ECLAT Classic الأسود في حمام مضيء" }, image: asset("scene-eclat-classic"), category: "noir", range: "eclat" },
  { id: "s-eden-detail", title: { fr: "EDEN 80, le détail", ar: "EDEN 80 عن قرب" }, image: asset("scene-eden-80-detail"), category: "noir", range: "eden" },
  { id: "s-eclat-terracotta", title: { fr: "ECLAT Classic noir, mur terracotta", ar: "ECLAT Classic الأسود على جدار بلون الطين" }, image: asset("scene-eclat-classic-terracotta"), category: "noir", range: "eclat" },
  { id: "s-eclat-wide", title: { fr: "ECLAT Confort blanc, vue d’ensemble", ar: "ECLAT Confort الأبيض، نظرة شاملة" }, image: asset("scene-eclat-confort-wide"), category: "blanc", range: "eclat", wide: true },
  { id: "s-eden-120-soir", title: { fr: "EDEN 120 noir, le soir", ar: "EDEN 120 الأسود في المساء" }, image: asset("closer-eden"), category: "noir", range: "eden" },
];

// The five EDDFA ranges named by the client (voice message, November 2026). EDEN and ECLAT texts are EDDFA's own
// words from eddfa.tn; EOLE, ECLIPSE and ELAN have no supplied photos, models or specifications yet.
export type FamilyId = "eden" | "eclat" | "eole" | "eclipse" | "elan";
export type SizingBasis = "thermal" | "electric";
export type ProductFamily = {
  id: FamilyId;
  name: string;
  kind: Localized;
  summary: Localized;
  intro: Localized[];
  highlights: Localized[];
  image?: string;
  sizing?: SizingBasis;
};
export const families: ProductFamily[] = [
  {
    id: "eden", name: "EDEN", image: asset("scene-eden-80-wide"), sizing: "thermal",
    kind: { fr: "Sèche-serviettes à eau chaude", ar: "مجففات مناشف بالماء الساخن" },
    summary: { fr: "Raccordés au chauffage central, 100 % aluminium.", ar: "تُربط بالتدفئة المركزية، من الألمنيوم بالكامل." },
    intro: [
      { fr: "Chauffer confortablement une salle de bain tout en profitant d’une serviette chaude, c’est la promesse des sèche-serviettes EDEN.", ar: "تدفئة الحمام براحة مع الاستمتاع بمنشفة دافئة: هذا ما تعد به مجففات المناشف EDEN." },
      { fr: "Les sèche-serviettes eau chaude « EDEN » sont des radiateurs 100 % en aluminium, accordés à une chaudière centrale et chauffés par la circulation d’eau chaude entre ses collecteurs.", ar: "مجففات المناشف بالماء الساخن «EDEN» مشعّات من الألمنيوم بالكامل، تُربط بمرجل مركزي وتسخن بفضل دوران الماء الساخن بين أنابيب التجميع." },
    ],
    highlights: [
      { fr: "Design à prix accessible", ar: "تصميم بسعر في المتناول" },
      { fr: "Garantie contre la corrosion", ar: "ضمان ضد التآكل" },
      { fr: "Installation simple et pratique", ar: "تركيب بسيط وعملي" },
      { fr: "Très économique", ar: "اقتصادي جداً" },
      { fr: "Dimension adaptée à votre salle de bain", ar: "مقاس يناسب حمامك" },
    ],
  },
  {
    id: "eclat", name: "ECLAT", image: asset("scene-eclat-confort-wide"), sizing: "electric",
    kind: { fr: "Sèche-serviettes électriques", ar: "مجففات مناشف كهربائية" },
    summary: { fr: "Électriques et autonomes, sans chaudière.", ar: "كهربائية ومستقلة، دون حاجة إلى مرجل." },
    intro: [
      { fr: "Vous ne disposez pas d’un chauffage central ? Vous souhaitez avoir une salle de bain agréablement chaude et une serviette moelleuse à la sortie de la douche ? Vous cherchez à sécher votre linge en hiver et même en été ?", ar: "لا تملك تدفئة مركزية؟ تريد حماماً دافئاً ومنشفة ناعمة عند الخروج من الدش؟ تبحث عن تجفيف غسيلك في الشتاء وحتى في الصيف؟" },
      { fr: "C’est possible grâce à nos radiateurs sèche-serviettes électriques ECLAT. ECLAT est la solution qui vous apportera le plus grand confort pour toute l’année, même en été.", ar: "هذا ممكن بفضل مشعّات تجفيف المناشف الكهربائية ECLAT. إنها الحل الذي يمنحك أكبر قدر من الراحة طوال السنة، حتى في الصيف." },
    ],
    highlights: [
      { fr: "Chaleur immédiate et constante", ar: "حرارة فورية وثابتة" },
      { fr: "Indépendance au niveau de fonctionnement", ar: "استقلالية في التشغيل" },
      { fr: "Usage simple et pratique : chauffer en un seul clic", ar: "استعمال بسيط وعملي: تدفئة بنقرة واحدة" },
      { fr: "Appareil librement programmable (ECLAT CONFORT)", ar: "جهاز قابل للبرمجة بحرية (ECLAT CONFORT)" },
      { fr: "Installation facile", ar: "تركيب سهل" },
    ],
  },
  {
    id: "eole", name: "EOLE",
    kind: { fr: "Sèche-linge", ar: "مجففات الغسيل" },
    summary: { fr: "Pour faire sécher votre linge à la maison.", ar: "لتجفيف غسيلك في المنزل." },
    intro: [{ fr: "EOLE est la gamme sèche-linge d’EDDFA, fabriquée à Sfax.", ar: "EOLE هي مجموعة مجففات الغسيل من EDDFA، مصنوعة في صفاقس." }],
    highlights: [],
  },
  {
    id: "eclipse", name: "ECLIPSE",
    kind: { fr: "Manches à balai", ar: "مقابض المكانس" },
    summary: { fr: "Des manches à balai fabriqués par EDDFA.", ar: "مقابض مكانس من صنع EDDFA." },
    intro: [{ fr: "ECLIPSE réunit les manches à balai EDDFA, fabriqués à Sfax.", ar: "تضم ECLIPSE مقابض المكانس من EDDFA، المصنوعة في صفاقس." }],
    highlights: [],
  },
  {
    id: "elan", name: "ELAN",
    kind: { fr: "Supports de tuyau d’arrosage", ar: "حوامل خراطيم الري" },
    summary: { fr: "Pour ranger le tuyau du jardin.", ar: "لترتيب خرطوم الحديقة." },
    intro: [{ fr: "ELAN est le support EDDFA pour ranger votre tuyau d’arrosage au jardin.", ar: "ELAN هو حامل EDDFA لترتيب خرطوم الري في حديقتك." }],
    highlights: [],
  },
];
export function familyById(id: string | undefined) { return families.find(family => family.id === id); }

// General installation stages. The appliance's own notice and EDDFA's instructions always take precedence.
export type InstallationKind = "hydraulic" | "electric-wall" | "electric-floor";
export function installationKind(product: Pick<CatalogProduct, "category" | "handle">): InstallationKind | null {
  if (product.category === "eden") return "hydraulic";
  if (product.category === "eclat") return product.handle === "eclat-service" ? "electric-floor" : "electric-wall";
  return null;
}
export const installationGuides: Record<InstallationKind, { steps: { title: Localized; text: Localized }[]; advice: Localized }> = {
  hydraulic: {
    steps: [
      { title: { fr: "Vérifier le chauffage", ar: "التحقق من التدفئة" }, text: { fr: "EDEN fonctionne avec un chauffage central à eau chaude. Choisissez l’entraxe (450 ou 500 mm) qui correspond à vos arrivées d’eau.", ar: "يعمل EDEN مع تدفئة مركزية بالماء الساخن. اختر المسافة بين محوري التوصيل (450 أو 500 مم) المناسبة لمداخل الماء لديك." } },
      { title: { fr: "Fixer au mur", ar: "التثبيت على الجدار" }, text: { fr: "Tracez l’emplacement de niveau et fixez l’appareil sur un mur capable de supporter son poids une fois rempli d’eau.", ar: "حدّد الموضع بشكل أفقي وثبّت الجهاز على جدار يتحمل وزنه وهو ممتلئ بالماء." } },
      { title: { fr: "Raccorder", ar: "التوصيل" }, text: { fr: "Raccordez l’entrée et la sortie au circuit de chauffage avec des robinets adaptés, puis contrôlez l’étanchéité.", ar: "صِل المدخل والمخرج بدائرة التدفئة بواسطة صمامات مناسبة، ثم تحقّق من عدم وجود تسرب." } },
      { title: { fr: "Mettre en eau et purger", ar: "الملء وإخراج الهواء" }, text: { fr: "Remplissez le circuit, purgez l’air du radiateur et vérifiez l’absence de fuite avant la première chauffe.", ar: "املأ الدائرة، وأخرج الهواء من المشعّ، وتأكد من عدم وجود تسرب قبل التشغيل الأول." } },
    ],
    advice: { fr: "Confiez le raccordement à un plombier-chauffagiste qualifié.", ar: "اعهد بالتوصيل إلى سبّاك مختص في التدفئة." },
  },
  "electric-wall": {
    steps: [
      { title: { fr: "Choisir l’emplacement", ar: "اختيار الموضع" }, text: { fr: "Installez l’appareil hors de portée des projections d’eau de la douche ou de la baignoire, en respectant les règles de sécurité électrique de la salle de bain.", ar: "ركّب الجهاز بعيداً عن رذاذ ماء الدش أو حوض الاستحمام، مع احترام قواعد السلامة الكهربائية في الحمام." } },
      { title: { fr: "Fixer au mur", ar: "التثبيت على الجدار" }, text: { fr: "Fixez l’appareil de niveau, avec des chevilles adaptées à votre mur.", ar: "ثبّت الجهاز بشكل أفقي بواسطة براغٍ وأوتاد تناسب جدارك." } },
      { title: { fr: "Brancher", ar: "التوصيل الكهربائي" }, text: { fr: "Raccordez-le à une alimentation conforme, protégée par un disjoncteur différentiel 30 mA. En cas de doute, faites appel à un électricien.", ar: "صِله بمصدر كهربائي مطابق ومحمي بقاطع تفاضلي 30 مللي أمبير. عند الشك، استعن بكهربائي." } },
      { title: { fr: "Mettre en marche", ar: "التشغيل" }, text: { fr: "Allumez l’appareil. Sur ECLAT CONFORT, réglez et programmez la chauffe selon vos horaires.", ar: "شغّل الجهاز. في ECLAT CONFORT، اضبط التسخين وبرمجه حسب أوقاتك." } },
    ],
    advice: { fr: "Le raccordement électrique doit respecter les règles de sécurité de la salle de bain.", ar: "يجب أن يحترم التوصيل الكهربائي قواعد السلامة في الحمام." },
  },
  "electric-floor": {
    steps: [
      { title: { fr: "Choisir l’emplacement", ar: "اختيار الموضع" }, text: { fr: "Posez l’appareil sur un sol stable et sec, à l’écart des projections d’eau.", ar: "ضع الجهاز على أرضية ثابتة وجافة، بعيداً عن رذاذ الماء." } },
      { title: { fr: "Brancher", ar: "التوصيل الكهربائي" }, text: { fr: "Branchez-le sur une prise conforme, protégée par un disjoncteur différentiel 30 mA.", ar: "صِله بمقبس مطابق ومحمي بقاطع تفاضلي 30 مللي أمبير." } },
      { title: { fr: "Mettre en marche", ar: "التشغيل" }, text: { fr: "Allumez l’appareil et disposez vos serviettes.", ar: "شغّل الجهاز وضع مناشفك." } },
      { title: { fr: "Déplacer", ar: "النقل" }, text: { fr: "Éteignez et débranchez l’appareil avant de le déplacer vers une autre pièce.", ar: "أطفئ الجهاز وافصله عن الكهرباء قبل نقله إلى غرفة أخرى." } },
    ],
    advice: { fr: "Gardez la prise et le câble à l’abri de l’eau.", ar: "احفظ المقبس والكابل بعيداً عن الماء." },
  },
};

export const company = {
  name: "EDDFA",
  legalName: "Entreprise de Développement et de Fabrication en Aluminium",
  phone: "31 547 491",
  telephone: "+21631547491",
  email: "Commercial@eddfa.tn",
  address: "Route de Gabès, boulevard de l'environnement, rue Maarouf Essrarfi, Sfax 3000, Tunisie",
  mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d13116.65788972195!2d10.7389973!3d34.7262484!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x13002d34b7318d03%3A0x809d528a43131c33!2sEDDFA!5e0!3m2!1sfr!2stn!4v1664369613082!5m2!1sfr!2stn",
  directionsUrl: "https://www.google.com/maps/search/?api=1&query=EDDFA%2C%20Sfax",
  social: [
    { name: "Facebook", url: "https://www.facebook.com/eddfa.tn" },
    { name: "Instagram", url: "https://www.instagram.com/eddfa.tn" },
    { name: "LinkedIn", url: "https://www.linkedin.com/company/eddfa" },
  ],
  footerCreditApproved: true,
};

export const messages = {
  fr: {
    nav: ["Accueil", "Présentation", "Produits", "Photos", "Contact", "Devis"],
    tagline: "ALUMINIUM & CONFORT",
    heroTitle: "Sèche-serviettes en aluminium.",
    heroText: "Fabriqués à Sfax. À eau chaude ou électriques, trouvez le confort qui s’accorde à votre salle de bain.",
    contact: "Contactez-nous", quote: "Obtenir un devis", discover: "Découvrir", rangesNav: "Nos gammes", modelsNav: "Modèles de la gamme", allProjects: "Toutes les inspirations",
    what: "FABRICANT TUNISIEN", aboutTitle: "Le confort commence chez nous.",
    aboutText: "Installée à Sfax, EDDFA développe et fabrique en aluminium. Sa spécialité : le sèche-serviettes, au cœur de cinq gammes pour la maison et le jardin.",
    profile: "Découvrir notre entreprise", productsEyebrow: "NOS PRODUITS", productsTitle: "Cinq gammes, un même savoir-faire.",
    why: "NOS EXIGENCES", commitment: "L’exigence, jusque dans les détails.",
    principles: [
      { title: "L’aluminium, notre métier", text: "Développement et fabrication : notre équipe à Sfax travaille la matière pour concevoir des produits fonctionnels et esthétiques." },
      { title: "Mesuré selon EN 442", text: "Le bureau de contrôle Veritas a mesuré les émissions de l’EDEN 100 selon la norme EN 442 (avis technique de 2023)." },
      { title: "Le produit local", text: "EDDFA est née pour enrichir l’industrie tunisienne et favoriser le produit local par rapport aux produits importés." },
    ],
    facts: [{ value: "100 %", label: "aluminium pour nos sèche-serviettes" }, { value: "5", label: "gammes de produits" }, { value: "EN 442", label: "émissions mesurées par Veritas" }, { value: "Sfax", label: "développement et fabrication" }],
    progress: ["Articles", "Coordonnées", "Envoi"], howCalculated: "Comment est-ce calculé ?", readMore: "Lire la suite", readLess: "Réduire",
    projects: "LA COLLECTION EN IMAGES", inspirationTitle: "La chaleur a du style.",
    startEyebrow: "NOS GAMMES", startTitle: "Que cherchez-vous ?", models: "modèles", seeRange: "Voir la gamme",
    cta: "Votre intérieur.\nVotre projet.", ctaText: "Une question sur un produit ou une installation ? Échangeons avec l’équipe EDDFA.",
    quickLinks: "Liens utiles", address: "Nous trouver", footerText: "EDDFA, fabricant de sèche-serviettes en aluminium. À Sfax, au service de votre confort intérieur.",
    rights: "EDDFA. Tous droits réservés.", menu: "Ouvrir le menu", close: "Fermer", next: "Suivant", previous: "Précédent", language: "العربية", skip: "Aller au contenu", back: "Retour aux produits", zoom: "Agrandir l’image",
    catalogTitle: "Nos produits", catalogText: "Sèche-serviettes EDEN et ECLAT, sèche-linge EOLE, manches à balai ECLIPSE, supports de tuyau ELAN : choisissez une gamme pour découvrir ses articles.", bundle: "Packs", composition: "Composition du pack",
    all: "Tout", eden: "EDEN · Eau chaude", eclat: "ECLAT · Électrique", black: "Noir", white: "Blanc", search: "Rechercher un produit", clear: "Réinitialiser", inquiry: "Parlons de votre projet", onRequest: "Prix sur demande", selection: "Sélection", specifications: "Caractéristiques", productNote: "Valeurs issues du catalogue fourni. Conditions de mesure de la puissance thermique à confirmer avec EDDFA.",
    variant: "Dimensions & version", height: "Hauteur", width: "Largeur", depth: "Profondeur", centres: "Entraxe", resistance: "Résistance électrique", thermalPower: "Puissance thermique annoncée", weight: "Poids", tubes: "Tubes", installation: "Installation", construction: "Tubes ronds en aluminium de diamètre 20 mm, fixés entre des collecteurs.",
    certificate: "Avis technique Veritas · EN 442-1", certificateText: "Document de 2023 concernant EDEN 100/50. Validité indiquée jusqu’au 25 juin 2026 ; renouvellement non fourni.", certificateLink: "Consulter le document (PDF)",
    aboutPageTitle: "EDDFA.\nLa matière, le confort.", contactTitle: "Parlons de votre projet.", contactText: "Un modèle, une dimension, une question ? Notre équipe est à votre écoute.",
    formTitle: "Votre demande", name: "Nom et prénom", phone: "Téléphone", email: "Email (facultatif)", region: "Gouvernorat", chooseRegion: "Sélectionner", product: "Modèle", chooseProduct: "À préciser", chooseVariant: "À préciser", message: "Votre message", submit: "Préparer ma demande", prepared: "Demande préparée, non envoyée.", draftText: "Vous pouvez télécharger votre demande ou l’adresser à notre équipe par email.", download: "Télécharger", emailDraft: "Ouvrir mon email", another: "Nouvelle demande", invalidPhone: "Indiquez un numéro tunisien valide à 8 chiffres.",
    adminTitle: "Espace administration", adminUnavailable: "L’accès à l’administration n’est pas encore disponible.", returnHome: "Retour à l’accueil", notFound: "Page introuvable", notFoundText: "Cette page n’existe pas ou a été déplacée.", pauseVideo: "Mettre la vidéo en pause", playVideo: "Lire la vidéo",
    presentationEyebrow: "L’ACTIVITÉ", presentationTitle: "Développer et fabriquer en aluminium.",
    // EDDFA's own presentation text from eddfa.tn, with spelling corrected only.
    presentation: [
      "EDDFA est une société tunisienne, spécialisée en développement et fabrication en aluminium, qui a pour principale activité la fabrication des sèche-serviettes (électriques et à eau chaude). Grâce à son volet « Développement », EDDFA recherche des solutions performantes et esthétiques capables de s’adapter à tous les espaces et à tous les goûts, tout en assurant la fiabilité, l’innovation et l’efficacité à ses produits.",
      "En plus de l’intérêt financier, la société EDDFA est née pour enrichir l’industrie tunisienne et favoriser le produit local par rapport aux produits importés.",
      "Tout cela est réalisé grâce à une équipe professionnelle qui vit, respire et travaille en mode intégré. Une équipe qui est aussi mordue de stratégie que de création et de technologie pour garantir la qualité, la durabilité et l’efficacité de son produit.",
    ],
    slogan: "EDDFA, la perfection à sa meilleure.",
    historyEyebrow: "HISTORIQUE", historyTitle: "Notre parcours.",
    history: [
      { title: "Une ambition industrielle", text: "EDDFA, Entreprise De Développement de Fabrication en Aluminium, est née à Sfax pour enrichir l’industrie tunisienne et favoriser le produit local face aux produits importés." },
      { title: "Le développement, notre moteur", text: "Son volet « Développement » recherche des solutions performantes et esthétiques, adaptées à tous les espaces et à tous les goûts." },
      { title: "Le sèche-serviettes, notre spécialité", text: "EDEN à eau chaude et ECLAT électrique : des sèche-serviettes 100 % aluminium. Les émissions de l’EDEN 100 ont été mesurées selon la norme EN 442 par Veritas en 2023." },
      { title: "Aujourd’hui, cinq gammes", text: "Aux sèche-serviettes s’ajoutent les sèche-linge EOLE, les manches à balai ECLIPSE et les supports de tuyau d’arrosage ELAN." },
    ],
    infoEyebrow: "INFORMATIONS GÉNÉRALES", infoTitle: "EDDFA en bref.",
    info: { legalName: "Entreprise", activity: "Activité", ranges: "Gammes", premises: "Nos locaux", phone: "Téléphone", email: "Email", social: "Réseaux sociaux", market: "Clients" },
    activityValue: "Développement et fabrication en aluminium, spécialiste du sèche-serviettes", marketValue: "Particuliers et professionnels, en Tunisie", directions: "Itinéraire",
    stepsLabel: "Votre devis en trois étapes",
    quoteSteps: [
      { title: "Cochez vos articles", text: "Toutes les gammes EDDFA, version par version." },
      { title: "Indiquez les quantités", text: "De 1 à 99 pièces par article." },
      { title: "Recevez votre devis", text: "Notre équipe vous répond avec un devis détaillé." },
    ],
    articlesOf: "Les articles", compareTitle: "Comparer les versions", dimensions: "Dimensions (H × L × P)", chooseModel: "Choisir mon modèle",
    soonTitle: "Fiches articles en préparation.", soonText: "Les articles de cette gamme seront bientôt présentés ici, avec leurs fiches techniques. Notre équipe vous renseigne dès maintenant.", callUs: "Appeler EDDFA",
    sizingEyebrow: "CHOISIR SON SÈCHE-SERVIETTES", sizingTitle: "Quelle taille pour votre salle de bain ?", sizingText: "Indiquez la surface et la hauteur de votre salle de bain : nous calculons la puissance nécessaire et le modèle adapté.",
    surface: "Surface au sol (m²)", ceiling: "Hauteur sous plafond (m)", insulation: "Isolation de la pièce",
    insulationLevels: { good: "Bonne", average: "Moyenne", poor: "Faible" }, insulationHints: { good: "Construction récente ou isolée", average: "Le cas le plus courant", poor: "Logement ancien, murs froids" },
    surfaceRange: "Entre 1 et 60 m²", ceilingRange: "Entre 2 et 5 m",
    requiredPower: "Puissance nécessaire", volume: "Volume", recommended: "Modèle conseillé", alternatives: "Autres modèles adaptés", noneSingle: "Aucun appareil seul ne couvre ce besoin : prévoyez-en plusieurs, ou parlez-en à notre équipe.", noneAtAll: "Ce besoin dépasse nos modèles : notre équipe vous conseille.", enterValues: "Indiquez la surface de votre salle de bain pour voir le modèle conseillé.",
    viewModel: "Voir le modèle", addToQuote: "Ajouter au devis", method: "La méthode de calcul", formula: "Puissance (W) = Surface (m²) × Hauteur (m) × Coefficient (W/m³)", coefficient: "Coefficient d’isolation",
    sizingThermal: "Puissances thermiques annoncées au catalogue EDDFA. La chaleur réellement fournie dépend de la température de l’eau de votre chauffage central.", sizingElectric: "Pour un modèle électrique, la chaleur produite correspond à la puissance de sa résistance.", sizingDisclaimer: "Estimation indicative, selon les règles usuelles de dimensionnement d’une salle de bain. Pièce très exposée (grande fenêtre, murs extérieurs) : choisissez le modèle supérieur. Notre équipe confirme le choix avec vous.",
    switchToEclat: "Pas de chauffage central ? Choisissez un modèle ECLAT.", switchToEden: "Vous avez un chauffage central ? Découvrez EDEN.", sizingLink: "Quelle taille choisir ? Calculez-la", sizingNav: "Choisir son sèche-serviettes", sizingNavHint: "Calcul de la puissance · EDEN et ECLAT", closerAlt: "Sèche-serviettes EDEN 120 noir dans une salle de bain, le soir, une serviette crème sur les tubes du haut", 
    technicalSheet: "Fiche technique", printSheet: "Imprimer la fiche technique", allVersions: "Toutes les versions", installNotice: "Suivez toujours la notice fournie avec l’appareil.", videoTitle: "Vidéo d’installation", videoSoon: "La vidéo d’installation de ce modèle sera bientôt disponible. En attendant, notre équipe vous guide par téléphone.", related: "Dans la même gamme", documents: "Document",
    quotePageTitle: "Obtenir un devis.", quoteIntro: "Cochez les articles qui vous intéressent et indiquez les quantités. Notre équipe prépare votre devis.",
    selectArticles: "Vos articles", quantity: "Quantité", decrease: "Retirer une pièce", increase: "Ajouter une pièce", generalRequest: "Modèle à préciser avec notre équipe",
    selectionTitle: "Votre sélection", emptySelection: "Aucun article coché pour l’instant.", customer: "Vos coordonnées", customerType: "Vous êtes", individual: "Particulier", professional: "Professionnel (installateur, revendeur…)",
    details: "Précisions (facultatif)", submitQuote: "Obtenir mon devis", selectAtLeastOne: "Cochez au moins un article pour obtenir un devis.", continueQuote: "Finaliser ma demande",
    quotePrepared: "Demande de devis préparée, non envoyée.", quoteDraftText: "Téléchargez-la ou adressez-la à notre équipe par email : elle vous répond avec un devis détaillé.", quoteSubject: "EDDFA - Demande de devis", editRequest: "Modifier ma demande", lines: "Articles",
    faqEyebrow: "QUESTIONS", faqTitle: "Vos questions.",
    faq: [
      { q: "EDEN ou ECLAT : lequel choisir ?", a: "EDEN se raccorde à un chauffage central à eau chaude. Sans chauffage central, choisissez ECLAT : il est électrique et fonctionne seul, sans chaudière." },
      { q: "Quelle taille pour ma salle de bain ?", a: "Sur les pages EDEN et ECLAT, indiquez la surface et la hauteur de la pièce : le calcul donne la puissance nécessaire et le modèle conseillé. Notre équipe confirme le choix avec vous.", href: "/produits/eden#choisir", cta: "Calculer ma taille" },
      { q: "Comment obtenir un prix ?", a: "Nos prix sont sur demande. Sur la page Devis, cochez vos articles et indiquez les quantités : notre équipe vous répond avec un devis détaillé.", href: "/devis", cta: "Obtenir un devis" },
      { q: "Où sont fabriqués vos produits ?", a: "À Sfax, route de Gabès, où EDDFA développe et fabrique ses produits en aluminium." },
      { q: "Qui installe un sèche-serviettes ?", a: "EDEN se raccorde au chauffage central et ECLAT au réseau électrique : confiez l’installation à un professionnel qualifié. Chaque fiche article détaille les étapes, et notre équipe vous guide par téléphone." },
    ],
    chapters: ["Activité", "Historique", "Produits", "Informations", "Locaux"], chaptersLabel: "Sur cette page", premisesEyebrow: "LOCAUX ET LOCALISATION", premisesTitle: "Nos locaux à Sfax.",
    assurances: ["Fabriqué à Sfax", "100 % aluminium", "Conseil avant votre achat"],
    toScale: "À l’échelle", viewLabel: "Affichage des articles",
    finish: "Finition", roomAlt: "en situation dans une salle de bain", teamPlate: "L’équipe EDDFA", teamPlace: "Sfax, Tunisie", detailAlt: "Détail d’un sèche-serviettes EDEN noir : tubes en aluminium, robinet chromé et serviette",
    drawingNote: "Schéma indicatif, cotes en millimètres.", photo: "Photo", of: "sur",
  },
  ar: {
    nav: ["الرئيسية", "تقديم الشركة", "المنتجات", "الصور", "اتصل بنا", "عرض سعر"],
    tagline: "ألمنيوم وراحة",
    heroTitle: "مجففات مناشف من الألمنيوم.",
    heroText: "صُنعت في صفاقس. بالماء الساخن أو بالكهرباء، اختر الراحة المناسبة لحمامك.",
    contact: "اتصل بنا", quote: "احصل على عرض سعر", discover: "اكتشف", rangesNav: "مجموعاتنا", modelsNav: "طرازات المجموعة", allProjects: "جميع الصور",
    what: "صناعة تونسية", aboutTitle: "الراحة تبدأ من هنا.",
    aboutText: "تطوّر EDDFA وتصنّع منتجات من الألمنيوم في صفاقس. اختصاصها مجففات المناشف، في قلب خمس مجموعات للمنزل والحديقة.",
    profile: "اكتشف شركتنا", productsEyebrow: "منتجاتنا", productsTitle: "خمس مجموعات وخبرة واحدة.",
    why: "معاييرنا", commitment: "اهتمام بالجودة حتى أدق التفاصيل.",
    principles: [
      { title: "الألمنيوم اختصاصنا", text: "من التطوير إلى التصنيع، يعمل فريقنا في صفاقس لتصميم منتجات تجمع بين الوظيفة والجمال." },
      { title: "قياس وفق EN 442", text: "قاس مكتب المراقبة Veritas انبعاثات EDEN 100 وفق المواصفة EN 442 (رأي فني سنة 2023)." },
      { title: "المنتوج المحلي", text: "تأسست EDDFA لإثراء الصناعة التونسية وتشجيع المنتوج المحلي مقارنة بالمنتجات المستوردة." },
    ],
    facts: [{ value: "100 %", label: "ألمنيوم في مجففات المناشف" }, { value: "5", label: "مجموعات منتجات" }, { value: "EN 442", label: "انبعاثات قاسها Veritas" }, { value: "صفاقس", label: "تطوير وتصنيع" }],
    progress: ["المنتجات", "المعلومات", "الإرسال"], howCalculated: "كيف يتم الحساب؟", readMore: "اقرأ المزيد", readLess: "عرض أقل",
    projects: "المجموعة بالصور", inspirationTitle: "دفء بطابع أنيق.",
    startEyebrow: "مجموعاتنا", startTitle: "عمّ تبحث؟", models: "طرازات", seeRange: "اكتشف المجموعة",
    cta: "مساحتك.\nمشروعك.", ctaText: "سؤال عن منتج أو تركيب؟ تواصل مع فريق EDDFA.",
    quickLinks: "روابط مفيدة", address: "موقعنا", footerText: "EDDFA، مصنع مجففات مناشف من الألمنيوم في صفاقس، لراحة مساحتك الداخلية.",
    rights: "EDDFA. جميع الحقوق محفوظة.", menu: "فتح القائمة", close: "إغلاق", next: "التالي", previous: "السابق", language: "Français", skip: "الانتقال إلى المحتوى", back: "العودة إلى المنتجات", zoom: "تكبير الصورة",
    catalogTitle: "منتجاتنا", catalogText: "مجففات المناشف EDEN وECLAT، مجففات الغسيل EOLE، مقابض المكانس ECLIPSE وحوامل الخراطيم ELAN: اختر مجموعة لاكتشاف منتجاتها.", bundle: "مجموعات", composition: "محتويات المجموعة",
    all: "الكل", eden: "EDEN · ماء ساخن", eclat: "ECLAT · كهربائي", black: "أسود", white: "أبيض", search: "البحث عن منتج", clear: "إعادة ضبط", inquiry: "لنتحدث عن مشروعك", onRequest: "السعر عند الطلب", selection: "اختيارات", specifications: "المواصفات", productNote: "قيم من الكتالوج المقدم. يرجى تأكيد ظروف قياس القدرة الحرارية مع EDDFA.",
    variant: "المقاسات والإصدار", height: "الارتفاع", width: "العرض", depth: "العمق", centres: "المسافة بين محوري التوصيل", resistance: "قدرة عنصر التسخين الكهربائي", thermalPower: "القدرة الحرارية المعلنة", weight: "الوزن", tubes: "الأنابيب", installation: "التركيب", construction: "أنابيب ألمنيوم دائرية بقطر 20 مم مثبتة بين أنابيب التجميع.",
    certificate: "رأي فني من Veritas · EN 442-1", certificateText: "وثيقة من سنة 2023 تخص EDEN 100/50. الصلاحية المذكورة حتى 25 جوان 2026؛ لم يُقدّم تجديد.", certificateLink: "عرض الوثيقة (PDF)",
    aboutPageTitle: "EDDFA.\nالخامة والراحة.", contactTitle: "لنتحدث عن مشروعك.", contactText: "منتج أو مقاس أو سؤال؟ فريقنا يستمع إليك.",
    formTitle: "طلبك", name: "الاسم واللقب", phone: "الهاتف", email: "البريد الإلكتروني (اختياري)", region: "الولاية", chooseRegion: "اختر", product: "الطراز", chooseProduct: "يُحدّد لاحقاً", chooseVariant: "يُحدّد لاحقاً", message: "رسالتك", submit: "تحضير طلبي", prepared: "تم تحضير الطلب ولم يُرسل.", draftText: "يمكنك تنزيل طلبك أو إرساله إلى فريقنا بالبريد الإلكتروني.", download: "تنزيل", emailDraft: "فتح البريد الإلكتروني", another: "طلب جديد", invalidPhone: "أدخل رقم هاتف تونسي صحيحاً من 8 أرقام.",
    adminTitle: "مساحة الإدارة", adminUnavailable: "الدخول إلى الإدارة غير متاح بعد.", returnHome: "العودة إلى الرئيسية", notFound: "الصفحة غير موجودة", notFoundText: "هذه الصفحة غير موجودة أو نُقلت.", pauseVideo: "إيقاف الفيديو مؤقتاً", playVideo: "تشغيل الفيديو",
    presentationEyebrow: "نشاطنا", presentationTitle: "تطوير الألمنيوم وتصنيعه.",
    // Draft Arabic translation of EDDFA's presentation text, to be approved by EDDFA.
    presentation: [
      "EDDFA شركة تونسية مختصة في تطوير الألمنيوم وتصنيعه، ونشاطها الرئيسي صناعة مجففات المناشف (الكهربائية وبالماء الساخن). وبفضل قسم «التطوير»، تبحث EDDFA عن حلول فعّالة وجميلة تتلاءم مع كل المساحات وكل الأذواق، مع ضمان الموثوقية والابتكار والنجاعة لمنتجاتها.",
      "إلى جانب الجدوى المالية، تأسست شركة EDDFA لإثراء الصناعة التونسية وتشجيع المنتوج المحلي مقارنة بالمنتجات المستوردة.",
      "ويتحقق كل ذلك بفضل فريق محترف يعيش ويتنفس ويعمل بطريقة متكاملة؛ فريق شغوف بالاستراتيجية بقدر شغفه بالإبداع والتكنولوجيا، لضمان جودة منتوجه واستدامته ونجاعته.",
    ],
    slogan: "EDDFA، الكمال في أبهى صوره.",
    historyEyebrow: "تاريخنا", historyTitle: "مسيرتنا.",
    history: [
      { title: "طموح صناعي", text: "وُلدت EDDFA، مؤسسة تطوير وتصنيع الألمنيوم، في صفاقس لإثراء الصناعة التونسية وتشجيع المنتوج المحلي أمام المنتجات المستوردة." },
      { title: "التطوير محرّكنا", text: "يبحث قسم «التطوير» عن حلول فعّالة وجميلة تناسب كل المساحات وكل الأذواق." },
      { title: "مجففات المناشف اختصاصنا", text: "EDEN بالماء الساخن وECLAT الكهربائية: مجففات مناشف من الألمنيوم بالكامل. قاس Veritas انبعاثات EDEN 100 وفق المواصفة EN 442 سنة 2023." },
      { title: "اليوم، خمس مجموعات", text: "تُضاف إلى مجففات المناشف مجففات الغسيل EOLE ومقابض المكانس ECLIPSE وحوامل خراطيم الري ELAN." },
    ],
    infoEyebrow: "معلومات عامة", infoTitle: "EDDFA باختصار.",
    info: { legalName: "المؤسسة", activity: "النشاط", ranges: "المجموعات", premises: "مقرّنا", phone: "الهاتف", email: "البريد الإلكتروني", social: "شبكات التواصل", market: "حرفاؤنا" },
    activityValue: "تطوير وتصنيع الألمنيوم، مختصة في مجففات المناشف", marketValue: "أفراد ومهنيون في تونس", directions: "الاتجاهات",
    stepsLabel: "عرض سعرك في ثلاث خطوات",
    quoteSteps: [
      { title: "اختر منتجاتك", text: "كل مجموعات EDDFA، إصداراً بإصدار." },
      { title: "حدّد الكميات", text: "من 1 إلى 99 قطعة لكل منتج." },
      { title: "استلم عرض السعر", text: "يجيبك فريقنا بعرض سعر مفصّل." },
    ],
    articlesOf: "منتجات", compareTitle: "مقارنة الإصدارات", dimensions: "المقاسات (ارتفاع × عرض × عمق)", chooseModel: "اختيار طرازي",
    soonTitle: "بطاقات المنتجات قيد الإعداد.", soonText: "ستُعرض هنا قريباً منتجات هذه المجموعة مع بطاقاتها الفنية. فريقنا يجيبك من الآن.", callUs: "اتصل بـ EDDFA",
    sizingEyebrow: "اختيار مجفف المناشف", sizingTitle: "أي مقاس يناسب حمامك؟", sizingText: "أدخل مساحة حمامك وارتفاعه: نحسب القدرة اللازمة والطراز المناسب.",
    surface: "مساحة الأرضية (م²)", ceiling: "ارتفاع السقف (م)", insulation: "عزل الغرفة",
    insulationLevels: { good: "جيد", average: "متوسط", poor: "ضعيف" }, insulationHints: { good: "بناء حديث أو معزول", average: "الحالة الأكثر شيوعاً", poor: "مسكن قديم وجدران باردة" },
    surfaceRange: "بين 1 و60 م²", ceilingRange: "بين 2 و5 م",
    requiredPower: "القدرة اللازمة", volume: "الحجم", recommended: "الطراز المقترح", alternatives: "طرازات مناسبة أخرى", noneSingle: "لا يكفي جهاز واحد لهذه الحاجة: خطّط لأكثر من جهاز، أو تحدّث مع فريقنا.", noneAtAll: "هذه الحاجة تتجاوز طرازاتنا: فريقنا ينصحك.", enterValues: "أدخل مساحة حمامك لعرض الطراز المقترح.",
    viewModel: "عرض الطراز", addToQuote: "إضافة إلى عرض السعر", method: "طريقة الحساب", formula: "القدرة (واط) = المساحة (م²) × الارتفاع (م) × المعامل (واط/م³)", coefficient: "معامل العزل",
    sizingThermal: "القدرات الحرارية المعلنة في كتالوج EDDFA. الحرارة الفعلية تتوقف على حرارة ماء التدفئة المركزية.", sizingElectric: "في الطراز الكهربائي، تساوي الحرارة المنتَجة قدرة عنصر التسخين.", sizingDisclaimer: "تقدير إرشادي وفق القواعد المعتادة لتحديد قدرة تدفئة الحمام. إذا كانت الغرفة معرّضة جداً للبرد (نافذة كبيرة أو جدران خارجية) فاختر الطراز الأعلى. فريقنا يؤكد معك الاختيار.",
    switchToEclat: "لا تملك تدفئة مركزية؟ اختر طرازاً من ECLAT.", switchToEden: "لديك تدفئة مركزية؟ اكتشف EDEN.", sizingLink: "أي مقاس تختار؟ احسبه", sizingNav: "اختيار مجفف المناشف", sizingNavHint: "حساب القدرة · EDEN وECLAT", closerAlt: "مجفف المناشف EDEN 120 الأسود في حمام مساءً، ومنشفة بلون الكريمة على الأنابيب العلوية", 
    technicalSheet: "البطاقة الفنية", printSheet: "طباعة البطاقة الفنية", allVersions: "كل الإصدارات", installNotice: "اتبع دائماً دليل الاستعمال المرفق بالجهاز.", videoTitle: "فيديو التركيب", videoSoon: "سيتوفر فيديو تركيب هذا الطراز قريباً. في الأثناء، يرشدك فريقنا عبر الهاتف.", related: "من نفس المجموعة", documents: "وثيقة",
    quotePageTitle: "الحصول على عرض سعر.", quoteIntro: "اختر المنتجات التي تهمك وحدّد الكميات، ويُعدّ فريقنا عرض السعر.",
    selectArticles: "منتجاتك", quantity: "الكمية", decrease: "إنقاص قطعة", increase: "إضافة قطعة", generalRequest: "الطراز يُحدّد مع فريقنا",
    selectionTitle: "اختياراتك", emptySelection: "لم تختر أي منتج بعد.", customer: "معلوماتك", customerType: "أنت", individual: "فرد", professional: "مهني (مركّب، موزّع…)",
    details: "تفاصيل إضافية (اختياري)", submitQuote: "احصل على عرض السعر", selectAtLeastOne: "اختر منتجاً واحداً على الأقل للحصول على عرض سعر.", continueQuote: "إتمام طلبي",
    quotePrepared: "تم تحضير طلب عرض السعر ولم يُرسل.", quoteDraftText: "يمكنك تنزيله أو إرساله إلى فريقنا بالبريد الإلكتروني ليجيبك بعرض سعر مفصّل.", quoteSubject: "EDDFA - طلب عرض سعر", editRequest: "تعديل طلبي", lines: "المنتجات",
    faqEyebrow: "أسئلة", faqTitle: "أسئلتكم.",
    faq: [
      { q: "EDEN أم ECLAT: أيهما أختار؟", a: "يُربط EDEN بتدفئة مركزية بالماء الساخن. إن لم تكن لديك تدفئة مركزية، اختر ECLAT: فهو كهربائي ويعمل بمفرده دون مرجل." },
      { q: "أي مقاس يناسب حمامي؟", a: "في صفحتي EDEN وECLAT، أدخل مساحة الغرفة وارتفاعها: يعطيك الحساب القدرة اللازمة والطراز المناسب، ويؤكد فريقنا الاختيار معك.", href: "/produits/eden#choisir", cta: "احسب المقاس المناسب" },
      { q: "كيف أحصل على السعر؟", a: "أسعارنا عند الطلب. في صفحة عرض السعر، اختر منتجاتك وحدّد الكميات: يجيبك فريقنا بعرض سعر مفصّل.", href: "/devis", cta: "احصل على عرض سعر" },
      { q: "أين تُصنع منتجاتكم؟", a: "في صفاقس، على طريق قابس، حيث تطوّر EDDFA منتجاتها من الألمنيوم وتصنّعها." },
      { q: "من يركّب مجفف المناشف؟", a: "يُربط EDEN بالتدفئة المركزية وECLAT بالشبكة الكهربائية: اعهد بالتركيب إلى فني مؤهل. تفصّل كل صفحة منتج مراحل التركيب، ويرشدك فريقنا عبر الهاتف." },
    ],
    chapters: ["النشاط", "المسيرة", "المنتجات", "معلومات عامة", "المقر"], chaptersLabel: "في هذه الصفحة", premisesEyebrow: "المقر والموقع", premisesTitle: "مقرّنا في صفاقس.",
    assurances: ["صُنع في صفاقس", "ألمنيوم بالكامل", "نصيحة قبل الشراء"],
    toScale: "بالمقياس نفسه", viewLabel: "طريقة عرض المنتجات",
    finish: "اللون", roomAlt: "داخل حمّام", teamPlate: "فريق EDDFA", teamPlace: "صفاقس، تونس", detailAlt: "تفصيل من مجفف المناشف EDEN الأسود: أنابيب من الألمنيوم وصمام مطلي بالكروم ومنشفة",
    drawingNote: "رسم توضيحي، المقاسات بالمليمتر.", photo: "صورة", of: "من",
  },
};

export const navPaths = ["", "/a-propos", "/produits", "/inspirations", "/contact", "/devis"] as const;
export const pageContentId = "page-content";

export function navigationHref(locale: Locale, path: typeof navPaths[number]) {
  return `/${locale}${path}`;
}

export const governorates: Localized[] = [
  { fr: "Ariana", ar: "أريانة" }, { fr: "Béja", ar: "باجة" }, { fr: "Ben Arous", ar: "بن عروس" }, { fr: "Bizerte", ar: "بنزرت" }, { fr: "Gabès", ar: "قابس" }, { fr: "Gafsa", ar: "قفصة" }, { fr: "Jendouba", ar: "جندوبة" }, { fr: "Kairouan", ar: "القيروان" }, { fr: "Kasserine", ar: "القصرين" }, { fr: "Kébili", ar: "قبلي" }, { fr: "Le Kef", ar: "الكاف" }, { fr: "Mahdia", ar: "المهدية" }, { fr: "La Manouba", ar: "منوبة" }, { fr: "Médenine", ar: "مدنين" }, { fr: "Monastir", ar: "المنستير" }, { fr: "Nabeul", ar: "نابل" }, { fr: "Sfax", ar: "صفاقس" }, { fr: "Sidi Bouzid", ar: "سيدي بوزيد" }, { fr: "Siliana", ar: "سليانة" }, { fr: "Sousse", ar: "سوسة" }, { fr: "Tataouine", ar: "تطاوين" }, { fr: "Tozeur", ar: "توزر" }, { fr: "Tunis", ar: "تونس" }, { fr: "Zaghouan", ar: "زغوان" },
];
