'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { UploadModal, LanguageTable } from '@/components';
import type { LanguagePack } from '@/lib/types';

export default function LanguagesPage() {
  const [languages, setLanguages] = useState<LanguagePack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchLanguages = useCallback(async () => {
    try {
      const response = await fetch('/api/languages');
      const result = await response.json();
      if (result.success) {
        setLanguages(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch languages:', error);
      showMessage('error', '언어팩 목록을 불러오는데 실패했습니다');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLanguages();
  }, [fetchLanguages]);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleUpload = (pack: LanguagePack) => {
    setLanguages((prev) => {
      const existing = prev.findIndex((p) => p.code === pack.code);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = pack;
        return updated;
      }
      return [...prev, pack];
    });
    showMessage('success', `${pack.localName} 언어팩이 추가되었습니다`);
  };

  const handleDelete = async (code: string) => {
    try {
      const response = await fetch(`/api/languages/${code}`, {
        method: 'DELETE',
      });
      const result = await response.json();

      if (result.success) {
        setLanguages((prev) => prev.filter((p) => p.code !== code));
        showMessage('success', '언어팩이 삭제되었습니다');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Failed to delete language pack:', error);
      showMessage('error', '삭제 중 오류가 발생했습니다');
    }
  };

  const handleVersionUpdate = async (code: string, version: string) => {
    try {
      const response = await fetch(`/api/languages/${code}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ version }),
      });
      const result = await response.json();

      if (result.success) {
        setLanguages((prev) =>
          prev.map((p) =>
            p.code === code
              ? { ...p, version, updatedAt: new Date().toISOString() }
              : p
          )
        );
        showMessage('success', '버전이 업데이트되었습니다');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Failed to update version:', error);
      showMessage('error', '버전 업데이트 중 오류가 발생했습니다');
    }
  };

  const handleReplace = async (code: string, file: File, version: string) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('version', version);

      const response = await fetch(`/api/languages/${code}`, {
        method: 'PUT',
        body: formData,
      });
      const result = await response.json();

      if (result.success) {
        setLanguages((prev) =>
          prev.map((p) => (p.code === code ? result.data : p))
        );
        showMessage('success', 'EPUB 파일이 교체되었습니다');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Failed to replace file:', error);
      showMessage('error', '파일 교체 중 오류가 발생했습니다');
    }
  };

  const handleRegenerateManifest = async () => {
    try {
      const response = await fetch('/api/languages', {
        method: 'PUT',
      });
      const result = await response.json();

      if (result.success) {
        showMessage('success', 'Manifest가 재생성되었습니다');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Failed to regenerate manifest:', error);
      showMessage('error', 'Manifest 재생성 중 오류가 발생했습니다');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">언어팩 관리</h1>
        <div className="flex gap-3">
          <button
            onClick={handleRegenerateManifest}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Manifest 재생성
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            새 언어팩 추가
          </button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mb-4 rounded-lg p-4 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="rounded-lg bg-white p-8 text-center shadow">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-gray-500">로딩 중...</p>
        </div>
      ) : (
        <LanguageTable
          languages={languages}
          onDelete={handleDelete}
          onVersionUpdate={handleVersionUpdate}
          onReplace={handleReplace}
        />
      )}

      {/* Upload Modal */}
      <UploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpload={handleUpload}
        existingCodes={languages.map((l) => l.code)}
      />

      {/* Instructions */}
      <div className="mt-8 rounded-lg bg-blue-50 p-6">
        <h3 className="mb-3 font-semibold text-blue-900">사용 방법</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-blue-500">1.</span>
            <span><strong>새 언어팩 추가</strong>: 언어를 선택하고 EPUB 파일을 업로드합니다</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-blue-500">2.</span>
            <span><strong>버전 관리</strong>: 버전 번호를 클릭하여 수정할 수 있습니다</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-blue-500">3.</span>
            <span><strong>파일 교체</strong>: 업로드 아이콘을 클릭하여 EPUB 파일을 교체합니다</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-blue-500">4.</span>
            <span><strong>Manifest 자동 생성</strong>: 언어팩 변경 시 manifest.json이 자동 업데이트됩니다</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
