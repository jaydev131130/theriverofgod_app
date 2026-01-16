import { NextRequest, NextResponse } from 'next/server';
import {
  getLanguagePacks,
  deleteLanguagePack,
  updateLanguagePackVersion,
  addLanguagePack,
  saveEpubFile,
} from '@/lib/storage';
import { isRtlLanguage } from '@/lib/languages';
import type { LanguagePack, ApiResponse } from '@/lib/types';

interface RouteContext {
  params: Promise<{ code: string }>;
}

// GET: 특정 언어팩 조회
export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<ApiResponse<LanguagePack>>> {
  try {
    const { code } = await context.params;
    const packs = await getLanguagePacks();
    const pack = packs.find(p => p.code === code);

    if (!pack) {
      return NextResponse.json(
        { success: false, error: 'Language pack not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: pack });
  } catch (error) {
    console.error('Failed to get language pack:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get language pack' },
      { status: 500 }
    );
  }
}

// PATCH: 언어팩 버전 업데이트
export async function PATCH(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<ApiResponse>> {
  try {
    const { code } = await context.params;
    const body = await request.json();
    const { version } = body;

    if (!version) {
      return NextResponse.json(
        { success: false, error: 'Version is required' },
        { status: 400 }
      );
    }

    const success = await updateLanguagePackVersion(code, version);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Language pack not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update language pack:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update language pack' },
      { status: 500 }
    );
  }
}

// PUT: 언어팩 EPUB 파일 교체
export async function PUT(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<ApiResponse<LanguagePack>>> {
  try {
    const { code } = await context.params;
    const formData = await request.formData();
    const version = (formData.get('version') as string) || undefined;
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'EPUB file is required' },
        { status: 400 }
      );
    }

    if (!file.name.endsWith('.epub')) {
      return NextResponse.json(
        { success: false, error: 'File must be an EPUB file' },
        { status: 400 }
      );
    }

    const packs = await getLanguagePacks();
    const existingPack = packs.find(p => p.code === code);

    if (!existingPack) {
      return NextResponse.json(
        { success: false, error: 'Language pack not found' },
        { status: 404 }
      );
    }

    // 파일 저장
    const buffer = Buffer.from(await file.arrayBuffer());
    const { fileName, size, sizeBytes } = await saveEpubFile(code, buffer);

    const updatedPack: LanguagePack = {
      ...existingPack,
      file: fileName,
      size,
      sizeBytes,
      version: version || existingPack.version,
      rtl: isRtlLanguage(code),
      updatedAt: new Date().toISOString(),
    };

    await addLanguagePack(updatedPack);

    return NextResponse.json({ success: true, data: updatedPack });
  } catch (error) {
    console.error('Failed to update language pack:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update language pack' },
      { status: 500 }
    );
  }
}

// DELETE: 언어팩 삭제
export async function DELETE(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<ApiResponse>> {
  try {
    const { code } = await context.params;
    const success = await deleteLanguagePack(code);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Language pack not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete language pack:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete language pack' },
      { status: 500 }
    );
  }
}
