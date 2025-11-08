export interface EducationData {
  edukasi_penyakit_terminal: {
    metadata: {
      title: string;
      description: string;
      last_updated: string;
      version: string;
    };
    diseases: Disease[];
  };
}

export interface Disease {
  id: string;
  name: string;
  slug: string;
  category: string;
  definition: string | { hiv: string; aids: string };
  symptoms: string[] | {
    utama?: string[];
    sisi_kiri?: string[];
    sisi_kanan?: string[];
  } | {
    tahapan: Array<{
      tahap: string;
      gejala: string;
    }>;
  };
  causes: string[];
  risk_factors?: {
    unchangeable?: string[];
    changeable?: string[];
  } | string[] | Array<{
    kategori: string;
    faktor: string;
  }>;
  references: string[];
}

export interface SymptomDisplay {
  category: string;
  items: string[];
}