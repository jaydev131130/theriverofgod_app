import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import {
  getLanguagePacks,
  addLanguagePack,
  saveEpubFile,
  generateManifest,
} from '@/lib/storage';
import { getLanguageInfo, isRtlLanguage } from '@/lib/languages';
import type { LanguagePack, ApiResponse } from '@/lib/types';

// GET: 언어팩 목록 조회
export async function GET(): Promise<NextResponse<ApiResponse<LanguagePack[]>>> {
  try {
    const packs = await getLanguagePacks();
    return NextResponse.json({ success: true, data: packs });
  } catch (error) {
    console.error('Failed to get language packs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get language packs' },
      { status: 500 }
    );
  }
}

// POST: 언어팩 추가 (EPUB 업로드)
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<LanguagePack>>> {
  try {
    const formData = await request.formData();
    const code = formData.get('code') as string;
    const version = (formData.get('version') as string) || '1.0';
    const file = formData.get('file') as File;

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Language code is required' },
        { status: 400 }
      );
    }

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'EPUB file is required' },
        { status: 400 }
      );
    }

    // 파일 확장자 검증
    if (!file.name.endsWith('.epub')) {
      return NextResponse.json(
        { success: false, error: 'File must be an EPUB file' },
        { status: 400 }
      );
    }

    const languageInfo = getLanguageInfo(code);
    if (!languageInfo) {
      return NextResponse.json(
        { success: false, error: 'Invalid language code' },
        { status: 400 }
      );
    }

    // 파일 저장
    const buffer = Buffer.from(await file.arrayBuffer());
    const { fileName, size, sizeBytes } = await saveEpubFile(code, buffer);

    const now = new Date().toISOString();
    const pack: LanguagePack = {
      id: uuidv4(),
      code,
      name: languageInfo.name,
      localName: languageInfo.localName,
      file: fileName,
      size,
      sizeBytes,
      version,
      rtl: isRtlLanguage(code),
      createdAt: now,
      updatedAt: now,
    };

    await addLanguagePack(pack);

    return NextResponse.json({ success: true, data: pack });
  } catch (error) {
    console.error('Failed to add language pack:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add language pack' },
      { status: 500 }
    );
  }
}

// PUT: manifest.json 재생성
export async function PUT(): Promise<NextResponse<ApiResponse>> {
  try {
    await generateManifest();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to regenerate manifest:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to regenerate manifest' },
      { status: 500 }
    );
  }
}
