export interface LanguagePack {
  id: string;
  code: string;
  name: string;
  localName: string;
  file: string;
  size: string;
  sizeBytes: number;
  version: string;
  rtl?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Manifest {
  version: string;
  updatedAt: string;
  languages: ManifestLanguage[];
}

export interface ManifestLanguage {
  code: string;
  name: string;
  localName: string;
  file: string;
  size: string;
  version: string;
  rtl?: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
