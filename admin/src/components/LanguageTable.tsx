'use client';

import React, { useState } from 'react';
import type { LanguagePack } from '@/lib/types';

interface LanguageTableProps {
  languages: LanguagePack[];
  onDelete: (code: string) => void;
  onVersionUpdate: (code: string, version: string) => void;
  onReplace: (code: string, file: File, version: string) => void;
}

export const LanguageTable: React.FC<LanguageTableProps> = ({
  languages,
  onDelete,
  onVersionUpdate,
  onReplace,
}) => {
  const [editingVersion, setEditingVersion] = useState<string | null>(null);
  const [newVersion, setNewVersion] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleVersionEdit = (pack: LanguagePack) => {
    setEditingVersion(pack.code);
    setNewVersion(pack.version);
  };

  const handleVersionSave = (code: string) => {
    if (newVersion.trim()) {
      onVersionUpdate(code, newVersion.trim());
    }
    setEditingVersion(null);
    setNewVersion('');
  };

  const handleFileReplace = async (code: string, version: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.epub';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        onReplace(code, file, version);
      }
    };
    input.click();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (languages.length === 0) {
    return (
      <div className="rounded-lg bg-gray-50 p-8 text-center">
        <svg className="mx-auto mb-4 h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <p className="text-gray-500">아직 등록된 언어팩이 없습니다</p>
        <p className="mt-1 text-sm text-gray-400">
          위의 &apos;새 언어팩 추가&apos; 버튼을 클릭하여 추가하세요
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              언어
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              파일
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              버전
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              업데이트
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
              작업
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {languages.map((pack) => (
            <tr key={pack.code} className="hover:bg-gray-50">
              {/* Language */}
              <td className="whitespace-nowrap px-6 py-4">
                <div className="flex items-center gap-2">
                  <div>
                    <div className="font-medium text-gray-900">
                      {pack.localName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {pack.name} ({pack.code})
                      {pack.rtl && (
                        <span className="ml-2 rounded bg-yellow-100 px-1.5 py-0.5 text-xs text-yellow-700">
                          RTL
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </td>

              {/* File */}
              <td className="whitespace-nowrap px-6 py-4">
                <div className="text-sm text-gray-900">{pack.file}</div>
                <div className="text-sm text-gray-500">{pack.size}</div>
              </td>

              {/* Version */}
              <td className="whitespace-nowrap px-6 py-4">
                {editingVersion === pack.code ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newVersion}
                      onChange={(e) => setNewVersion(e.target.value)}
                      className="w-20 rounded border border-gray-300 px-2 py-1 text-sm"
                      autoFocus
                    />
                    <button
                      onClick={() => handleVersionSave(pack.code)}
                      className="text-green-600 hover:text-green-800"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setEditingVersion(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <span
                    onClick={() => handleVersionEdit(pack)}
                    className="cursor-pointer rounded bg-blue-100 px-2 py-1 text-sm text-blue-700 hover:bg-blue-200"
                  >
                    v{pack.version}
                  </span>
                )}
              </td>

              {/* Updated */}
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                {formatDate(pack.updatedAt)}
              </td>

              {/* Actions */}
              <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => handleFileReplace(pack.code, pack.version)}
                    className="rounded bg-gray-100 px-3 py-1.5 text-gray-700 hover:bg-gray-200"
                    title="파일 교체"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </button>
                  <a
                    href={`/books/${pack.file}`}
                    download
                    className="rounded bg-gray-100 px-3 py-1.5 text-gray-700 hover:bg-gray-200"
                    title="다운로드"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </a>
                  {confirmDelete === pack.code ? (
                    <>
                      <button
                        onClick={() => {
                          onDelete(pack.code);
                          setConfirmDelete(null);
                        }}
                        className="rounded bg-red-600 px-3 py-1.5 text-white hover:bg-red-700"
                      >
                        확인
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="rounded bg-gray-100 px-3 py-1.5 text-gray-700 hover:bg-gray-200"
                      >
                        취소
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(pack.code)}
                      className="rounded bg-red-100 px-3 py-1.5 text-red-700 hover:bg-red-200"
                      title="삭제"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
