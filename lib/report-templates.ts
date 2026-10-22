import type { MachineType, ReportInspectionItem, ReportLoadTest } from './types';

export interface InspectionTemplate {
  visualItems: string[];
  functionalItems: string[];
  loadTests: { testType: string; loadFactor: number }[];
  wallThicknessCheck: boolean;
  safetyValveCheck: boolean;
  manometerCheck: boolean;
  nextInspectionMonths: number;
}

const KRENLER: InspectionTemplate = {
  visualItems: [
    'Ana ve uç kiriş yapısal bütünlüğü, çatlak/deformasyon kontrolü',
    'Kaldırma halatı aşınma, kopuk ve tel kırığı kontrolü (TS EN 12385)',
    'Halat drumu ve makara oluk durum muayenesi',
    'Kanca, mandal ve güvenlik pimi muayenesi (TS EN 1677)',
    'Fren sistemi balata/kavrama aşınma kontrolü',
    ' Elektrik panosu, kablo hattı ve topraklama kontrolü',
    'Yürüyüş grubu tekerlek/ray teması ve aşınma kontrolü',
    'Sinyal lambaları ve sesli uyarı sistemi kontrolü',
    'Operatör kabini ve kontrol kumanda butonları',
    'Yük gösterge ve sınır anahtarı (limit switch) kontrolü',
  ],
  functionalItems: [
    'Boş halıyle tüm hareketlerin deneyi (kaldırma/indirme/gezme)',
    'Yük sınır anahtarı işlevsel deneyi',
    'Acil durdurma butonu işlevsel deneyi',
    'Fren tutma deneyi (yük asılı halde kayma kontrolü)',
    'Sesli ve ışıklı uyarı sistemi işlevsel deneyi',
  ],
  loadTests: [
    { testType: 'Statik Deney (TS 10116)', loadFactor: 1.25 },
    { testType: 'Dinamik Deney (TS 10116)', loadFactor: 1.1 },
  ],
  wallThicknessCheck: false,
  safetyValveCheck: false,
  manometerCheck: false,
  nextInspectionMonths: 12,
};

const KENDINDEN_TAHRIKLI: InspectionTemplate = {
  visualItems: [
    'Çatal ve çatal taşıyıcı yapısal bütünlük, çatlak/deformasyon kontrolü',
    'Kaldırma zinciri uzama ve aşınma ölçümü (TS ISO 606)',
    'Hidrolik sistem boru/hortum sızdırmazlık kontrolü',
    'Direksiyon ve tekerlek/aksam aşınma kontrolü',
    'Fren ve debriyaj sistemi işlev kontrolü',
    'Çatallar arası mesafe ayar mekanizması kontrolü',
    'Akü/motor kompartımanı ve kablo kontrolü',
    'Operatör koruyucu kabin (OPS) bütünlüğü',
    'Korna, far ve uyarı lambaları kontrolü',
    'Yük seklini koruma ve stabilite plakaları kontrolü',
  ],
  functionalItems: [
    'Hidrolik kaldırma/indirme deneyi (tam strok)',
    'Yük tutma (back tilt) deneyi',
    'Direksiyon ve manevra kabiliyeti deneyi',
    'Acil durdurma ve park freni deneyi',
    'Hidrolik sızdırmazlık deneyi (tam yük altında 5 dk)',
  ],
  loadTests: [
    { testType: 'Statik Deney (TS 10116)', loadFactor: 1.25 },
    { testType: 'Dinamik Deney (TS 10116)', loadFactor: 1.1 },
  ],
  wallThicknessCheck: false,
  safetyValveCheck: false,
  manometerCheck: false,
  nextInspectionMonths: 12,
};

const BASINCLI_KAPLAR: InspectionTemplate = {
  visualItems: [
    'Tank gövde dış yüzey korozyon, çatlak ve deformasyon kontrolü',
    'Kaynak dikişleri görsel muayenesi (TS EN ISO 5817)',
    'Giriş/çıkış flanş ve bağlantı contalık muayenesi',
    'Manometre ve basınç göstergesi montaj kontrolü',
    'Emniyet valfi (PRV) mühür ve etiket kontrolü',
    'Drenaj/tahliye vanası işlevsel kontrolü',
    'Destek ayakları ve sabitleme kontrolü',
    'Boyama ve korozyon önleyici kaplama durumu',
    'Levha ve etiket (tasarım basınç, hacim, yıl) kontrolü',
    'Topraklama ve elektriki tesisat kontrolü (kompresör/hidrofor)',
  ],
  functionalItems: [
    'Emniyet valfi açma basıncı set değeri deneyi',
    'Basınç ayar şalteri (presostat) kesme deneyi',
    'Manometre kalibrasyon kontrolü (karşılaştırma)',
    'Drenaj vanası tam kapanma deneyi',
    'Otomatik çalışma/stop döngüsü deneyi',
  ],
  loadTests: [],
  wallThicknessCheck: true,
  safetyValveCheck: true,
  manometerCheck: true,
  nextInspectionMonths: 12,
};

const PLATFORMLAR: InspectionTemplate = {
  visualItems: [
    'Mast/kolon ve makas yapısal bütünlüğü, çatlak/deformasyon kontrolü',
    'Kaldırma silindiri ve hidrolik hortum sızdırmazlık kontrolü',
    'Kaldırma zinciri/halatı aşınma kontrolü',
    'Mekanik kilitleme mandalları bütünlüğü',
    'Platform zemini ve güvenlik rail kontrolü',
    'Acil durum indirme (manual lowering) valfi kontrolü',
    'Eğim sensörü ve aşırı yük algılayıcı montaj kontrolü',
    'Elektrik panosu ve kablo kontrolü',
    'Tekerlek ve fren sistemi kontrolü',
    'Yük kapasite etiketi ve uyarı levhaları kontrolü',
  ],
  functionalItems: [
    'Mekanik kilitleme mandalları işlevsel deneyi',
    'Acil durum indirme sistemi deneyi',
    'Eğim sensörü alarm işlevsel deneyi',
    'Aşırı yük algılayıcı deneyi',
    'Acil durdurma butonu deneyi',
    'Tüm hareketlerde yumuşak start/stop deneyi',
  ],
  loadTests: [
    { testType: 'Statik Deney (TS 10116)', loadFactor: 1.25 },
    { testType: 'Dinamik Deney (TS 10116)', loadFactor: 1.1 },
  ],
  wallThicknessCheck: false,
  safetyValveCheck: false,
  manometerCheck: false,
  nextInspectionMonths: 12,
};

// --- 5 Yeni Cihaz Şablonları ---

const CARASKAL: InspectionTemplate = {
  visualItems: [
    'Zincir/halat aşınma, tel kırığı ve korozyon kontrolü (TS EN 13157)',
    'Bakla (chain link) uzama ölçümü ve hatve kontrolü',
    'Yük kancası ağız açılması ölçümü ve deformasyon kontrolü',
    'Kanca emniyet mandalı (latch) bütünlük ve fonksiyon kontrolü',
    'Frenleme mekanizması balata/kavrama aşınma kontrolü',
    'Dişli kutusu yağ seviyesi ve sızdırmazlık kontrolü',
    'Elektrik motoru, kablo ve topraklama kontrolü',
    'Asma göz (eye bolt) ve bağlantı elemanları kontrolü',
    'Kumanda butonları ve acil stop fonksiyon kontrolü',
    'Kapasite etiketi ve uyarı levhaları kontrolü',
  ],
  functionalItems: [
    'Frenleme mekanizması işlev testi (yük asılı halde kayma kontrolü)',
    'Acil durdurma butonu işlevsel deneyi',
    'Yük kancası emniyet mandalı deneyi',
    'Sesli/ışıklı uyarı sistemi işlevsel deneyi',
    'Limit anahtarı (yük sınırı) işlevsel deneyi',
  ],
  loadTests: [
    { testType: 'Statik Test (WLL x 1.25) (TS EN 13157)', loadFactor: 1.25 },
    { testType: 'Dinamik Test (WLL x 1.1) (TS EN 13157)', loadFactor: 1.1 },
  ],
  wallThicknessCheck: false,
  safetyValveCheck: false,
  manometerCheck: false,
  nextInspectionMonths: 12,
};

const ISTIF_MAKINESI: InspectionTemplate = {
  visualItems: [
    'Kaldırma zincirleri hatve uzama ölçümü (TS ISO 606)',
    'Hidrolik silindir sızdırmazlık ve yağ kaçak kontrolü',
    'Çatal çatlak, deformasyon ve aşınma denetimi',
    'Çatal taşıyıcı (carriage) yapısal bütünlük kontrolü',
    'Hidrolik hortum ve boru hattı sızdırmazlık kontrolü',
    'Direksiyon ve tekerlek/aks aşınma kontrolü',
    'Akü/motor kompartımanı ve kablo kontrolü',
    'Operatör koruyucu kabin (OPS) bütünlüğü',
    'Fren ve park freni mekanizması kontrolü',
    'Kapasite etiketi ve yük sekli koruma levhaları kontrolü',
  ],
  functionalItems: [
    'Hidrolik kaldırma/indirme deneyi (tam strok)',
    'Yük tutma (back tilt) deneyi',
    'Frenleme fonksiyon testi (yük altında durma)',
    'Acil durdurma ve park freni deneyi',
    'Hidrolik sızdırmazlık deneyi (tam yük altında 5 dk)',
  ],
  loadTests: [
    { testType: 'Statik Deney (TS 10116)', loadFactor: 1.25 },
    { testType: 'Dinamik Deney (TS 10116)', loadFactor: 1.1 },
  ],
  wallThicknessCheck: false,
  safetyValveCheck: false,
  manometerCheck: false,
  nextInspectionMonths: 12,
};

const KALORIFER_KAZANI: InspectionTemplate = {
  visualItems: [
    'Kazan gövde ve duman boruları korozyon denetimi (TS EN 12953)',
    'Kaynak dikişleri görsel muayenesi (TS EN ISO 5817)',
    'Emniyet ventili (PRV) mühür, etiket ve montaj kontrolü',
    'Manometre ve termometre montaj ve kalibrasyon kontrolü',
    'Brülör alev kontrol tertibatı ve elektrot kontrolü',
    'Baca gazı çıkış ve baca bağlantı kontrolü',
    'Sıcak su sirkülasyon pompası montaj kontrolü',
    'Kazan izolasyon ve sıcak yüzey koruma kontrolü',
    'Besleme suyu hattı ve vanalar kontrolü',
    'Kapasite/etiket levhaları ve tasarım parametre kontrolü',
  ],
  functionalItems: [
    'Emniyet ventili set değer açma kontrolü (set basınçta açma deneyi)',
    'Brülör alev kontrol tertibatı fonksiyon testi (alev kesme deneyi)',
    'Manometre kalibrasyon kontrolü (karşılaştırma standardı ile)',
    'Termometre kalibrasyon kontrolü (karşılaştırma standardı ile)',
    'Otomatik çalışma/stop döngüsü deneyi (termostat/presostat kesme)',
  ],
  loadTests: [],
  wallThicknessCheck: true,
  safetyValveCheck: true,
  manometerCheck: true,
  nextInspectionMonths: 12,
};

const KIZGIN_YAG_KAZANI: InspectionTemplate = {
  visualItems: [
    'Azot yastıklama sistemi basınç ve seviye kontrolü (TS EN 13445)',
    'Termal yağ sirkülasyon pompası kaçak denetimi',
    'Genleşme tankı seviye ve basınç kontrolü',
    'Gövde dış yüzey korozyon, çatlak ve deformasyon kontrolü',
    'Kaynak dikişleri görsel muayenesi (TS EN ISO 5817)',
    'Emniyet valfi (PRV) mühür ve etiket kontrolü',
    'Isı transfer borusu (coil) ve bağlantı kontrolü',
    'Sıcak yağ hattı izolasyon ve sızdırmazlık kontrolü',
    'Manometre, termometre ve seviye göstergesi kontrolü',
    'Kapasite/etiket levhaları ve tasarım parametre kontrolü',
  ],
  functionalItems: [
    'Azot yastıklama basınç kontrolü (set değerde basınk okuması)',
    'Termal yağ sirkülasyon pompası kaçak denetimi (çalışır halde)',
    'Genleşme tankı seviye ve basınç alarm test adımları',
    'Emniyet valfi açma basıncı set değeri deneyi',
    'Otomatik sıcaklık kontrol ve alarm döngüsü deneyi',
  ],
  loadTests: [],
  wallThicknessCheck: true,
  safetyValveCheck: true,
  manometerCheck: true,
  nextInspectionMonths: 12,
};

const BOYLER_AKUMULASYON: InspectionTemplate = {
  visualItems: [
    'Katodik koruma (magnezyum anot) aşınma durumu kontrolü',
    'Serpantin (eşanjör) dış yüzey korozyon ve birikinti kontrolü',
    'Gövde dış yüzey izolasyon ve korozyon denetimi',
    'Emniyet valfi (PRV) mühür, etiket ve montaj kontrolü',
    'Çekvalf (non-return valve) montaj ve kontrolü',
    'Manometre ve termometre montaj kontrolü',
    'Giriş/çıkış flanş ve bağlantı contalık muayenesi',
    'Drenaj/tahliye vanası işlevsel kontrolü',
    'Destek ayakları ve sabitleme kontrolü',
    'Kapasite/etiket levhaları kontrolü',
  ],
  functionalItems: [
    'Serpantin sızdırmazlık testi (basınç altında kaçak kontrolü)',
    'Emniyet valfi açma basıncı set değeri fonksiyon kontrolü',
    'Çekvalf fonksiyon kontrolü (geri akış engelleme deneyi)',
    'Katodik koruma (anot) fonksiyon kontrolü (ölçüm)',
    'Otomatik çalışma/stop döngüsü deneyi (termostat kesme)',
  ],
  loadTests: [],
  wallThicknessCheck: false,
  safetyValveCheck: true,
  manometerCheck: true,
  nextInspectionMonths: 12,
};

const MACHINE_TEMPLATES: Record<string, InspectionTemplate> = {
  'caraskal': CARASKAL,
  'istif-makinesi': ISTIF_MAKINESI,
  'kalorifer-kazani': KALORIFER_KAZANI,
  'kizgin-yag-kazani': KIZGIN_YAG_KAZANI,
  'boyler-akumulasyon': BOYLER_AKUMULASYON,
};

export function getInspectionTemplate(machine: MachineType): InspectionTemplate {
  if (MACHINE_TEMPLATES[machine.id]) {
    return MACHINE_TEMPLATES[machine.id];
  }
  switch (machine.category) {
    case 'krenler':
      return KRENLER;
    case 'kendinden-tahrikli':
      return KENDINDEN_TAHRIKLI;
    case 'basincli-kaplar':
      return BASINCLI_KAPLAR;
    case 'platformlar':
      return PLATFORMLAR;
  }
}

export function buildInspectionItems(template: InspectionTemplate): ReportInspectionItem[] {
  const items: ReportInspectionItem[] = [];
  for (const v of template.visualItems) {
    items.push({ name: `[Görsel Muayene] ${v}`, result: 'Uygun', note: '' });
  }
  for (const f of template.functionalItems) {
    items.push({ name: `[İşlevsel Deney] ${f}`, result: 'Uygun', note: '' });
  }
  return items;
}

export function buildLoadTests(
  template: InspectionTemplate,
  wll: number
): ReportLoadTest[] {
  return template.loadTests.map((t) => ({
    testType: t.testType,
    loadFactor: t.loadFactor,
    wll,
    calculatedLoad: +(wll * t.loadFactor).toFixed(2),
    result: 'Geçti',
  }));
}

export function buildWallThicknessDefaults() {
  return [
    { location: 'Üst başlık (Tasimum)', nominal: 6.0, measured: 5.8, result: 'Kabul' as const },
    { location: 'Alt başlık (Tasimum)', nominal: 6.0, measured: 5.9, result: 'Kabul' as const },
    { location: 'Silindirik gövde (0°)', nominal: 8.0, measured: 7.7, result: 'Kabul' as const },
    { location: 'Silindirik gövde (90°)', nominal: 8.0, measured: 7.6, result: 'Kabul' as const },
    { location: 'Silindirik gövde (180°)', nominal: 8.0, measured: 7.8, result: 'Kabul' as const },
    { location: 'Silindirik gövde (270°)', nominal: 8.0, measured: 7.7, result: 'Kabul' as const },
  ];
}
