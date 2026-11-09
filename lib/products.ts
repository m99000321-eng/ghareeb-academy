export type CategoryId = "boxing" | "kickboxing" | "kungfu" | "mma";

export type GearKind =
  | "glove"
  | "mma-glove"
  | "staff"
  | "sword"
  | "headgear"
  | "shin"
  | "chest"
  | "wraps"
  | "bag"
  | "mouthguard"
  | "belt"
  | "knee"
  | "fan"
  | "shoe"
  | "shorts"
  | "mitts"
  | "uniform";

export type Category = {
  id: CategoryId;
  name: string;
  nameEn: string;
  tagline: string;
  description: string;
  color: string;
  colorSoft: string;
  gradient: string;
  index: string;
};

export type Product = {
  slug: string;
  sku: string;
  name: string;
  nameEn: string;
  category: CategoryId;
  price: number;
  oldPrice?: number;
  rating: number;
  reviews: number;
  badge?: string;
  stock: number;
  colors: string[];
  modelColor: string;
  modelAccent: string;
  image?: string;
  description: string;
  features: string[];
  featured?: boolean;
  active?: boolean;
};

export const categories: Category[] = [
  {
    id: "kickboxing",
    name: "كيك بوكس",
    nameEn: "Kickboxing",
    tagline: "أرجل من نار",
    description: "قفازات وواقيات ساق مصممة لتحمل أعنف الركلات وأسرع اللكمات.",
    color: "#ff7a18",
    colorSoft: "rgba(255, 122, 24, 0.16)",
    gradient: "from-[#ff7a18] to-[#ff2d6f]",
    index: "01",
  },
  {
    id: "boxing",
    name: "بوكس",
    nameEn: "Boxing",
    tagline: "القوة الخالصة",
    description: "جلد طبيعي وحشوات متعددة الطبقات تحمي يديك في كل جولة.",
    color: "#ff3d6e",
    colorSoft: "rgba(255, 61, 110, 0.16)",
    gradient: "from-[#ff3d6e] to-[#7c3aed]",
    index: "02",
  },
  {
    id: "kungfu",
    name: "كونغ فو",
    nameEn: "Kung Fu",
    tagline: "سكون قبل العاصفة",
    description: "أدوات ووشو وتاي تشي بروح شرقية، توازن بين الخشب والحديد.",
    color: "#2ee6a8",
    colorSoft: "rgba(46, 230, 168, 0.16)",
    gradient: "from-[#2ee6a8] to-[#0ea5e9]",
    index: "03",
  },
  {
    id: "mma",
    name: "إم إم إيه",
    nameEn: "MMA",
    tagline: "كل شيء مسموح",
    description: "عتاد قتال مختلط خفيف ومرن، من القفاز المفتوح إلى واقي القصبة.",
    color: "#8b5cf6",
    colorSoft: "rgba(139, 92, 246, 0.16)",
    gradient: "from-[#8b5cf6] to-[#22d3ee]",
    index: "04",
  },
];

export const products: Product[] = [
  {
    slug: "nova-boxing-gloves",
    sku: "GH-BX-001",
    name: "قفاز ملاكمة نوفا — جلد طبيعي",
    nameEn: "Nova Boxing Gloves",
    category: "boxing",
    price: 549,
    oldPrice: 690,
    rating: 4.9,
    reviews: 218,
    badge: "الأكثر مبيعاً",
    stock: 42,
    colors: ["#ff3d6e", "#111118", "#c8ff2e"],
    modelColor: "#ff3d6e",
    modelAccent: "#111118",
    image: "/products/nova-boxing-gloves.webp",
    description:
      "قفاز نوفا هو قفازك الأول والأخير. جلد طبيعي كامل الحبيبات، حشوة ثلاثية الكثافة تمتص الصدمات، وبطانة داخلية مضادة للبكتيريا تحافظ على يديك جافة في أطول الجولات.",
    features: [
      "جلد طبيعي كامل الحبيبات",
      "حشوة ثلاثية الكثافة IMG",
      "تثبيت معصم بشريط عريض",
      "بطانة مضادة للرطوبة",
    ],
    featured: true,
  },
  {
    slug: "orbit-sparring-gloves",
    sku: "GH-BX-002",
    name: "قفاز سبارينغ أوربت 16 أونصة",
    nameEn: "Orbit Sparring Gloves",
    category: "boxing",
    price: 429,
    rating: 4.7,
    reviews: 143,
    stock: 37,
    colors: ["#f5f5f7", "#ff3d6e", "#8b5cf6"],
    modelColor: "#f5f5f7",
    modelAccent: "#ff3d6e",
    image: "/products/orbit-sparring-gloves.webp",
    description:
      "مصمم للسبارينغ الطويل. حشوة أسمك توزع الطاقة على مساحة أوسع، ما يقلل الإصابات ويطيل عمر القفاز مع شريكك في التدريب.",
    features: [
      "حشوة سبارينغ فائقة النعومة",
      "بطانة ميش للتهوية",
      "وزن 16 أونصة",
      "مناسب للمبتدئين والمحترفين",
    ],
  },
  {
    slug: "titan-hand-wraps",
    sku: "GH-BX-003",
    name: "رابطة أيدي تيتان 4.5 متر",
    nameEn: "Titan Hand Wraps",
    category: "boxing",
    price: 79,
    rating: 4.8,
    reviews: 402,
    badge: "جديد",
    stock: 120,
    colors: ["#111118", "#ff3d6e", "#c8ff2e"],
    modelColor: "#c8ff2e",
    modelAccent: "#111118",
    image: "/products/titan-hand-wraps.webp",
    description:
      "رابطة مرنة بنسبة 70% قطن و30% إيلاستين، تلتف حول اليد والمعصم دون تكتل. طرف لاصق قوي يبقى ثابتًا حتى آخر جولة.",
    features: ["طول 4.5 متر", "قطن مرن فائق", "طرف لاصق مقوى", "قابلة للغسل"],
  },
  {
    slug: "halo-boxing-headgear",
    sku: "GH-BX-004",
    name: "خوذة ملاكمة هالة",
    nameEn: "Halo Headgear",
    category: "boxing",
    price: 629,
    rating: 4.6,
    reviews: 96,
    stock: 24,
    colors: ["#111118", "#ff3d6e", "#22d3ee"],
    modelColor: "#111118",
    modelAccent: "#ff3d6e",
    image: "/products/halo-boxing-headgear.webp",
    description:
      "مجال رؤية واسع وحماية جانبية كاملة. إسفنج إمباكشن متعدد الطبقات وفتحات تهوية استراتيجية تحافظ على برودة رأسك.",
    features: ["رؤية محيطية 180°", "إسفنج متعدد الطبقات", "أحزمة قابلة للتعديل", "وزن خفيف"],
  },
  {
    slug: "cosmos-heavy-bag",
    sku: "GH-BX-005",
    name: "كيس ملاكمة كوزموس المعلق",
    nameEn: "Cosmos Heavy Bag",
    category: "boxing",
    price: 899,
    oldPrice: 1099,
    rating: 4.9,
    reviews: 87,
    badge: "خصم 18%",
    stock: 15,
    colors: ["#111118", "#ff3d6e"],
    modelColor: "#111118",
    modelAccent: "#ff3d6e",
    image: "/products/cosmos-heavy-bag.webp",
    description:
      "كيس بحشوة ألياف مضغوطة لا تتكتل مع الوقت. جلد صناعي مقوى يتحمل آلاف اللكمات، مع سلسلة تثبيت دوارة وسادة صوتية.",
    features: ["وزن 45 كجم", "جلد صناعي مقوى", "سلسلة دوارة", "وسادة امتصاص صوت"],
  },
  {
    slug: "shield-mouthguard",
    sku: "GH-BX-006",
    name: "واقي أسنان شيلد برو",
    nameEn: "Shield Pro Mouthguard",
    category: "boxing",
    price: 89,
    rating: 4.5,
    reviews: 311,
    stock: 210,
    colors: ["#c8ff2e", "#ff3d6e", "#22d3ee"],
    modelColor: "#c8ff2e",
    modelAccent: "#7c3aed",
    image: "/products/shield-mouthguard.webp",
    description:
      "حماية مزدوجة للفك والأسنان بتصميم قابل للقولبة بالحرارة. مجرى تنفس أمامي يسمح بالتنفس الطبيعي أثناء الضغط.",
    features: ["قولبة منزلية سهلة", "مجرى تنفس", "حماية مزدوجة", "علبة حفظ"],
  },
  {
    slug: "apex-boxing-shoes",
    sku: "GH-BX-007",
    name: "حذاء ملاكمة أبيكس برو",
    nameEn: "Apex Boxing Shoes",
    category: "boxing",
    price: 499,
    oldPrice: 599,
    rating: 4.8,
    reviews: 112,
    badge: "جديد",
    stock: 34,
    colors: ["#111118", "#ff3d6e", "#f5f5f7"],
    modelColor: "#111118",
    modelAccent: "#ff3d6e",
    image: "/products/apex-boxing-shoes.webp",
    description:
      "حذاء ملاكمة عالي الرقبة يثبّت الكاحل في الدوران والاندفاع. نعل مطاطي بنمط محوري يسمح بالالتفاف السريع دون انزلاق، وشبك تهوية يبقي القدم جافة داخل الحلبة.",
    features: ["دعم كاحل عالي", "نعل محوري للدوران", "شبك تهوية خفيف", "ثبات على الحلبة"],
  },
  {
    slug: "phantom-speed-bag",
    sku: "GH-BX-008",
    name: "كيس سرعة فانتوم",
    nameEn: "Phantom Speed Bag",
    category: "boxing",
    price: 349,
    rating: 4.7,
    reviews: 84,
    stock: 41,
    colors: ["#111118", "#ff3d6e"],
    modelColor: "#111118",
    modelAccent: "#ff3d6e",
    image: "/products/phantom-speed-bag.webp",
    description:
      "كيس سرعة من الجلد الطبيعي بإيقاع رجعي سريع. مثانة هوائية قابلة للاستبدال ومعلق دوّار فولاذي يمنحك تحكمًا كاملًا في الإيقاع والتوقيت.",
    features: ["جلد طبيعي متين", "مثانة قابلة للاستبدال", "معلق دوّار فولاذي", "وزن مثالي للسرعة"],
  },
  {
    slug: "vector-double-end-bag",
    sku: "GH-BX-009",
    name: "كيس مزدوج الطرف فيكتور",
    nameEn: "Vector Double-End Bag",
    category: "boxing",
    price: 429,
    rating: 4.6,
    reviews: 67,
    stock: 29,
    colors: ["#111118", "#ff3d6e", "#f5f5f7"],
    modelColor: "#111118",
    modelAccent: "#ff3d6e",
    image: "/products/vector-double-end-bag.webp",
    description:
      "كيس مزدوج الطرف يتحرك في كل الاتجاهات ليطوّر ردّ فعلك ودقة توقيتك. حبال مطاطية قابلة للضبط وحلقات فولاذية تتحمل التدريب اليومي.",
    features: ["حبال مطاطية مزدوجة", "جلد مقوّى", "حلقات فولاذية", "تدريب التوقيت والدفاع"],
  },
  {
    slug: "aegis-groin-guard",
    sku: "GH-BX-010",
    name: "واقي فخذ أيجيس",
    nameEn: "Aegis Groin Guard",
    category: "boxing",
    price: 189,
    rating: 4.8,
    reviews: 152,
    badge: "أساسي",
    stock: 85,
    colors: ["#111118", "#ff3d6e"],
    modelColor: "#111118",
    modelAccent: "#ff3d6e",
    image: "/products/aegis-groin-guard.webp",
    description:
      "حماية أساسية في السبارينغ والمباريات. قوقعة صلبة مبطنة توزع الصدمات، وأحزمة مرنة قابلة للتعديل تبقى ثابتة أثناء الحركة.",
    features: ["قوقعة صلبة مبطنة", "أحزمة قابلة للتعديل", "بطانة مسامية", "مقاسات متعددة"],
  },

  {
    slug: "solar-kickboxing-gloves",
    sku: "GH-KB-001",
    name: "قفاز كيك بوكس سولار",
    nameEn: "Solar Kickboxing Gloves",
    category: "kickboxing",
    price: 489,
    oldPrice: 599,
    rating: 4.8,
    reviews: 176,
    badge: "الأكثر مبيعاً",
    stock: 33,
    colors: ["#ff7a18", "#111118", "#c8ff2e"],
    modelColor: "#ff7a18",
    modelAccent: "#111118",
    image: "/products/solar-kickboxing-gloves.webp",
    description:
      "قفاز مصمم للحركة السريعة. وزن مثالي وتوازن أمامي يسمح باللكمات المتسلسلة دون إجهاد، مع بطانة تثبت اليد أثناء الدوران.",
    features: ["جلد صناعي فائق", "وزن 12 أونصة", "بطانة مانعة للانزلاق", "تهوية في الكف"],
    featured: true,
  },
  {
    slug: "apollo-shin-guards",
    sku: "GH-KB-002",
    name: "واقي ساق أبولو",
    nameEn: "Apollo Shin Guards",
    category: "kickboxing",
    price: 399,
    rating: 4.7,
    reviews: 132,
    stock: 48,
    colors: ["#111118", "#ff7a18"],
    modelColor: "#111118",
    modelAccent: "#ff7a18",
    image: "/products/apollo-shin-guards.webp",
    description:
      "حماية من الركبة إلى مشط القدم بتصميم منحنٍ يتبع شكل الساق. أحزمة خلفية مزدوجة تمنع الانزياح في الركلات الدائرية.",
    features: ["حماية كاملة للقصبة", "بطانة إسفنجية ناعمة", "حزامان قابلان للتعديل", "خفيف الوزن"],
    featured: true,
  },
  {
    slug: "orion-chest-guard",
    sku: "GH-KB-003",
    name: "واقي صدر أوريون",
    nameEn: "Orion Chest Guard",
    category: "kickboxing",
    price: 459,
    rating: 4.4,
    reviews: 58,
    stock: 26,
    colors: ["#111118", "#ff7a18", "#22d3ee"],
    modelColor: "#111118",
    modelAccent: "#ff7a18",
    image: "/products/orion-chest-guard.webp",
    description:
      "واقي صدر للسبارينغ والتايكوندو، خفيف لكنه يمتص الصدمات القوية. تصميم محدب يبقي الحركة حرة للكتفين.",
    features: ["إسفنج عالي الكثافة", "تصميم محدب مرن", "أحزمة كتف مريحة", "سطح قابل للمسح"],
  },
  {
    slug: "neon-training-gloves",
    sku: "GH-KB-004",
    name: "قفاز تدريب نيون",
    nameEn: "Neon Training Gloves",
    category: "kickboxing",
    price: 349,
    rating: 4.6,
    reviews: 224,
    badge: "جديد",
    stock: 64,
    colors: ["#c8ff2e", "#ff7a18", "#8b5cf6"],
    modelColor: "#c8ff2e",
    modelAccent: "#ff7a18",
    image: "/products/neon-training-gloves.webp",
    description:
      "قفاز البدايات المثالي: خفيف، متين، وسعره في المتناول. مبطن بالكامل ويناسب التدريب اليومي وحصص اللياقة القتالية.",
    features: ["وزن 10 أونصة", "بطانة كاملة", "جلد صناعي متين", "لون عالي الوضوح"],
  },
  {
    slug: "luna-knee-pads",
    sku: "GH-KB-006",
    name: "واقي ركبة لونا",
    nameEn: "Luna Knee Pads",
    category: "kickboxing",
    price: 149,
    rating: 4.7,
    reviews: 145,
    stock: 76,
    colors: ["#111118", "#ff7a18", "#22d3ee"],
    modelColor: "#111118",
    modelAccent: "#ff7a18",
    image: "/products/luna-knee-pads.webp",
    description:
      "واقي ركبة منزلق يغطي الرضفة بحماية مرنة. مناسب للصراع والأرضيات الصلبة، بلا أحزمة تمزج حركتك.",
    features: ["حماية مرنة للرضفة", "بلا أحزمة", "نسيج مسامي", "مقاس موحد"],
  },
  {
    slug: "inferno-thai-shorts",
    sku: "GH-KB-007",
    name: "شورت تايلاندي إنفيرنو",
    nameEn: "Inferno Thai Shorts",
    category: "kickboxing",
    price: 259,
    oldPrice: 319,
    rating: 4.9,
    reviews: 203,
    badge: "جديد",
    stock: 58,
    colors: ["#111118", "#ff7a18", "#c8a24a"],
    modelColor: "#111118",
    modelAccent: "#ff7a18",
    image: "/products/inferno-thai-shorts.webp",
    description:
      "شورت مواي تاي بقطع واسع يمنحك حرية كاملة في الركلات العالية. ساتان خفيف بتفاصيل برتقالية وذهبية، وحزام مطاطي مع رباط داخلي يثبت أثناء الدوران.",
    features: ["قطع واسع للركلات العالية", "ساتان خفيف سريع الجفاف", "حزام مطاطي ورباط", "خياطة معزّزة"],
  },
  {
    slug: "raptor-kick-pads",
    sku: "GH-KB-008",
    name: "بادي ركل رابتور — زوج",
    nameEn: "Raptor Kick Pads",
    category: "kickboxing",
    price: 389,
    rating: 4.8,
    reviews: 96,
    stock: 32,
    colors: ["#111118", "#ff7a18"],
    modelColor: "#111118",
    modelAccent: "#ff7a18",
    image: "/products/raptor-kick-pads.webp",
    description:
      "زوج بادات ركل منحنية للتدريب على الركلات الدائرية والمباشرة. إسفنج عالي الكثافة يمتص الصدمة، وسطح جلدي مقوّى يتحمل آلاف الركلات اليومية.",
    features: ["إسفنج عالي الكثافة", "سطح جلدي مقوّى", "حزام تثبيت خلفي", "مناسبة للمدرب والمقاتل"],
    featured: true,
  },
  {
    slug: "flex-ankle-supports",
    sku: "GH-KB-009",
    name: "دعامة كاحل فليكس — زوج",
    nameEn: "Flex Ankle Supports",
    category: "kickboxing",
    price: 99,
    rating: 4.6,
    reviews: 188,
    stock: 140,
    colors: ["#111118", "#ff7a18"],
    modelColor: "#111118",
    modelAccent: "#ff7a18",
    image: "/products/flex-ankle-supports.webp",
    description:
      "دعامة كاحل مرنة تمنح ثباتًا إضافيًا في الركل والحركة الجانبية. نسيج ضاغط يتنفس وفتحة كعب معزّزة تمنع الاحتكاك داخل الحذاء.",
    features: ["ضغط داعم للكاحل", "نسيج يتنفس", "فتحة كعب معزّزة", "مقاسات مرنة"],
  },
  {
    slug: "cyclone-jump-rope",
    sku: "GH-KB-010",
    name: "حبل تدريب سايكلون",
    nameEn: "Cyclone Jump Rope",
    category: "kickboxing",
    price: 119,
    rating: 4.7,
    reviews: 241,
    badge: "جديد",
    stock: 110,
    colors: ["#111118", "#ff7a18"],
    modelColor: "#111118",
    modelAccent: "#ff7a18",
    image: "/products/cyclone-jump-rope.webp",
    description:
      "حبل سرعة بكابل فولاذي رفيع ومقبضين ألومنيوم مخرّشين لتحكم كامل. يبني إيقاع القدمين ويحسّن اللياقة القلبية في جولات قصيرة.",
    features: ["كابل فولاذي سريع", "مقابض ألومنيوم", "محامل دوّارة", "قابل للضبط بالطول"],
  },

  {
    slug: "seven-wushu-gloves",
    sku: "GH-KF-005",
    name: "قفاز ساندا سيفن",
    nameEn: "Seven Sanda Gloves",
    category: "kungfu",
    price: 219,
    rating: 4.5,
    reviews: 97,
    stock: 58,
    colors: ["#2ee6a8", "#111118", "#c8ff2e"],
    modelColor: "#2ee6a8",
    modelAccent: "#111118",
    image: "/products/seven-wushu-gloves.webp",
    description:
      "قفاز ساندا مفتوح الأصابع للقبض والرمي. حماية للظهر مع مرونة كاملة للكف — للساندا والدفاع عن النفس.",
    features: ["أصابع مفتوحة", "قبضة مرنة", "حماية ظهر اليد", "تثبيت معصم"],
  },
  {
    slug: "serpent-nunchaku",
    sku: "GH-KF-007",
    name: "ننشاكو سيربنت — فولاذ",
    nameEn: "Serpent Nunchaku",
    category: "kungfu",
    price: 279,
    rating: 4.8,
    reviews: 121,
    badge: "محدود",
    stock: 37,
    colors: ["#111118", "#2ee6a8"],
    modelColor: "#111118",
    modelAccent: "#2ee6a8",
    image: "/products/serpent-nunchaku.webp",
    description:
      "ننشاكو فولاذي متوازن بثمانية أضلاع لتحكم أفضل في الدوران. سلسلة مصقولة ولفّات يد جادي ماصة للعرق، مناسبة للتدريب والعروض.",
    features: ["فولاذ متوازن", "سلسلة مصقولة", "لفّات جادي ماصة", "حقيبة حمل"],
  },

  {
    slug: "venom-mma-gloves",
    sku: "GH-MM-001",
    name: "قفاز إم إم إيه فينوم",
    nameEn: "Venom MMA Gloves",
    category: "mma",
    price: 379,
    oldPrice: 469,
    rating: 4.9,
    reviews: 267,
    badge: "الأكثر مبيعاً",
    stock: 52,
    colors: ["#8b5cf6", "#111118", "#22d3ee"],
    modelColor: "#8b5cf6",
    modelAccent: "#111118",
    image: "/products/venom-mma-gloves.webp",
    description:
      "قفاز إم إم إيه مفتوح الأصابع يمنحك قبضة كاملة للرمي والخنق. حماية ظهرية مبطنة دون أي عائق أمام الأصابع.",
    features: ["أصابع مفتوحة حرة", "حماية ظهرية مبطنة", "تثبيت معصم قوي", "جلد صناعي متين"],
    featured: true,
  },
  {
    slug: "abyss-fight-shorts",
    sku: "GH-MM-002",
    name: "شورت قتال أبيس",
    nameEn: "Abyss Fight Shorts",
    category: "mma",
    price: 249,
    rating: 4.7,
    reviews: 193,
    stock: 70,
    colors: ["#111118", "#8b5cf6", "#c8ff2e"],
    modelColor: "#111118",
    modelAccent: "#8b5cf6",
    image: "/products/abyss-fight-shorts.webp",
    description:
      "شورت قتال خفيف للغاية لا يقيّد الحركة. قماش مرن يمتص العرق وشق جانبي يسمح بحرية كاملة في الركلات العالية.",
    features: ["قشاش مرن سريع الجفاف", "شق جانبي", "حزام مطاطي", "جيب خفي"],
  },
  {
    slug: "aqua-mma-training-gloves",
    sku: "GH-MM-003",
    name: "قفاز تدريب أكوا",
    nameEn: "Aqua Training Gloves",
    category: "mma",
    price: 299,
    rating: 4.6,
    reviews: 158,
    badge: "جديد",
    stock: 81,
    colors: ["#22d3ee", "#8b5cf6", "#111118"],
    modelColor: "#22d3ee",
    modelAccent: "#8b5cf6",
    image: "/products/aqua-mma-training-gloves.webp",
    description:
      "قفاز تدريب خفيف للكيس والسبارينغ الخفيف. رغوة أحادية الكثافة سريعة الجفاف لتستمر حتى آخر حصة.",
    features: ["رغوة أحادية الكثافة", "تهوية فائقة", "وزن 6 أونصة", "أصابع مفتوحة"],
  },
  {
    slug: "spartan-shin-guards",
    sku: "GH-MM-004",
    name: "واقي قصبة سبارتن",
    nameEn: "Spartan Shin Guards",
    category: "mma",
    price: 289,
    rating: 4.8,
    reviews: 141,
    stock: 46,
    colors: ["#111118", "#8b5cf6", "#22d3ee"],
    modelColor: "#111118",
    modelAccent: "#8b5cf6",
    image: "/products/spartan-shin-guards.webp",
    description:
      "واقي قصبة خفيف يثبت بالكامل حول الساق. مخصص للحركة الأرضية والركلات المنخفضة في القتال المختلط.",
    features: ["حماية خفيفة مرنة", "أشرطة مطاطية", "لا يقيّد الركبة", "بطانة ناعمة"],
  },
  {
    slug: "guardian-mma-headgear",
    sku: "GH-MM-005",
    name: "خوذة سبارينغ غارديان",
    nameEn: "Guardian Headgear",
    category: "mma",
    price: 679,
    rating: 4.8,
    reviews: 63,
    stock: 19,
    colors: ["#111118", "#8b5cf6", "#c8ff2e"],
    modelColor: "#111118",
    modelAccent: "#8b5cf6",
    image: "/products/guardian-mma-headgear.webp",
    description:
      "حماية شاملة للرأس مع رؤية غير معوقة. مصممة للسبارينغ القتالي بأربطة قابلة للضبط من خمس نقاط.",
    features: ["حماية شاملة", "رؤية واسعة", "أربطة خمس نقاط", "وزن محسّن"],
  },
  {
    slug: "pulse-punch-mitts",
    sku: "GH-MM-006",
    name: "لوحة إسفنجية بولس",
    nameEn: "Pulse Punch Mitts",
    category: "mma",
    price: 159,
    rating: 4.6,
    reviews: 205,
    stock: 95,
    colors: ["#8b5cf6", "#c8ff2e", "#22d3ee"],
    modelColor: "#8b5cf6",
    modelAccent: "#c8ff2e",
    image: "/products/pulse-punch-mitts.webp",
    description:
      "لوحة تدريب للكف مصممة لمدربيك. إسفنج مقوس يمتص اللكمات ويقلل الضغط على المعصم، بجيب إبهام مريح.",
    features: ["إسفنج مقوس", "جيب إبهام", "تهوية جيدة", "مناسبة للجميع"],
  },
  {
    slug: "apex-rashguard",
    sku: "GH-MM-007",
    name: "راش جارد أبيكس طويل الأكمام",
    nameEn: "Apex Rash Guard",
    category: "mma",
    price: 229,
    rating: 4.8,
    reviews: 167,
    stock: 74,
    colors: ["#111118", "#8b5cf6", "#22d3ee"],
    modelColor: "#111118",
    modelAccent: "#8b5cf6",
    image: "/products/apex-rashguard.webp",
    description:
      "راش جارد ضاغط يحمي الجلد من الاحتكاك على الحصيرة ويثبت أثناء الأرضي. أكمام طويلة بدرزات مسطحة وخامة سريعة الجفاف تبقى خفيفة حتى آخر جولة.",
    features: ["خامة ضاغطة سريعة الجفاف", "درزات مسطحة مريحة", "حماية من الاحتكاك", "أكمام طويلة"],
    featured: true,
  },
  {
    slug: "stealth-spats",
    sku: "GH-MM-008",
    name: "بنطلون ضاغط ستيلث",
    nameEn: "Stealth Compression Spats",
    category: "mma",
    price: 219,
    rating: 4.7,
    reviews: 142,
    badge: "جديد",
    stock: 68,
    colors: ["#111118", "#8b5cf6"],
    modelColor: "#111118",
    modelAccent: "#8b5cf6",
    image: "/products/stealth-spats.webp",
    description:
      "بنطلون ضاغط للقتال الأرضي بقصّة مرنة تتبع حركة الورك والركبة. حزام عريض يثبت المكان وخامة مقاومة للشد تتحمل الخنق والاحتكاك.",
    features: ["مرونة رباعية الاتجاه", "حزام عريض مثبت", "مقاومة للشد والاحتكاك", "خامة خفيفة"],
  },
  {
    slug: "titan-groin-cup",
    sku: "GH-MM-009",
    name: "واقي فخذ تيتان",
    nameEn: "Titan Groin Cup",
    category: "mma",
    price: 169,
    rating: 4.6,
    reviews: 118,
    stock: 96,
    colors: ["#111118", "#8b5cf6"],
    modelColor: "#111118",
    modelAccent: "#8b5cf6",
    image: "/products/titan-groin-cup.webp",
    description:
      "واقي فخذ بقوقعة صلبة وحزام مرن يناسب الحركة الأرضية. تصميم منخفض السماكة لا يعيق الركل أو الدفاع، وبطانة مسامية تسحب العرق.",
    features: ["قوقعة صلبة خفيفة", "حزام مرن آمن", "بطانة مسامية", "لا يعيق الحركة"],
  },
  {
    slug: "shadow-grappling-dummy",
    sku: "GH-MM-010",
    name: "دمية مصارعة شادو",
    nameEn: "Shadow Grappling Dummy",
    category: "mma",
    price: 1499,
    oldPrice: 1799,
    rating: 4.9,
    reviews: 42,
    badge: "احترافي",
    stock: 8,
    colors: ["#111118", "#8b5cf6"],
    modelColor: "#111118",
    modelAccent: "#8b5cf6",
    image: "/products/shadow-grappling-dummy.webp",
    description:
      "دمية مصارعة بحشوة كثيفة تتجاوب مع الرمي والتثبيت والخنق. جلد فينيل مقوّى بدرزات معزّزة يتحمل التدريب الأرضي المتكرر، ومقبض للرفع والانقضاض.",
    features: ["حشوة كثيفة متوازنة", "فينيل مقوّى بدرزات", "وزن واقعي للرمي", "مقابض تدريب"],
  },
];

export const categoryMap = Object.fromEntries(
  categories.map((category) => [category.id, category]),
) as Record<CategoryId, Category>;

export const productModels: Record<string, GearKind> = {
  "nova-boxing-gloves": "glove",
  "orbit-sparring-gloves": "glove",
  "titan-hand-wraps": "wraps",
  "halo-boxing-headgear": "headgear",
  "cosmos-heavy-bag": "bag",
  "shield-mouthguard": "mouthguard",
  "solar-kickboxing-gloves": "glove",
  "apollo-shin-guards": "shin",
  "orion-chest-guard": "chest",
  "neon-training-gloves": "glove",
  "luna-knee-pads": "knee",
  "seven-wushu-gloves": "mma-glove",
  "venom-mma-gloves": "mma-glove",
  "abyss-fight-shorts": "shorts",
  "aqua-mma-training-gloves": "mma-glove",
  "spartan-shin-guards": "shin",
  "guardian-mma-headgear": "headgear",
  "pulse-punch-mitts": "mitts",
};

export function getProductModel(slug: string): GearKind {
  return productModels[slug] ?? "glove";
}

export const productMap = Object.fromEntries(
  products.map((product) => [product.slug, product]),
) as Record<string, Product>;

export const featuredProducts = products.filter((product) => product.featured);

export function getProduct(slug: string): Product | undefined {
  return productMap[slug];
}

export function getRelated(product: Product, limit = 4): Product[] {
  return products
    .filter((item) => item.category === product.category && item.slug !== product.slug)
    .slice(0, limit);
}

export function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value);
}

export const SHIPPING_FEE = 35;
export const FREE_SHIPPING_THRESHOLD = 700;

export type SortId = "featured" | "price-asc" | "price-desc" | "rating";

export function queryProducts(options: {
  category?: string | null;
  q?: string | null;
  sort?: string | null;
  featuredOnly?: boolean;
  limit?: number;
}): Product[] {
  return queryFrom(products, options);
}

export function queryFrom(
  source: Product[],
  options: {
    category?: string | null;
    q?: string | null;
    sort?: string | null;
    featuredOnly?: boolean;
    limit?: number;
  },
): Product[] {
  let result = [...source];

  if (options.category && categories.some((item) => item.id === options.category)) {
    result = result.filter((product) => product.category === options.category);
  }

  const query = (options.q ?? "").trim().toLowerCase();
  if (query) {
    result = result.filter((product) =>
      [product.name, product.nameEn, product.description, product.sku]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }

  if (options.featuredOnly) {
    result = result.filter((product) => product.featured);
  }

  switch (options.sort) {
    case "price-asc":
      result.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      result.sort((a, b) => b.price - a.price);
      break;
    case "rating":
      result.sort((a, b) => b.rating - a.rating);
      break;
    default:
      result.sort(
        (a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)),
      );
  }

  if (options.limit && options.limit > 0) {
    result = result.slice(0, options.limit);
  }

  return result;
}
