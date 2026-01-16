'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { AVAILABLE_LANGUAGES } from '@/lib/languages';
import type { LanguagePack } from '@/lib/types';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (pack: LanguagePack) => void;
  existingCodes: string[];
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onUpload,
  existingCodes,
}) => {
  const [selectedCode, setSelectedCode] = useState('');
  const [version, setVersion] = useState('1.0');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const availableLanguages = AVAILABLE_LANGUAGES.filter(
    (lang) => !existingCodes.includes(lang.code)
  );

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setError('');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/epub+zip': ['.epub'],
    },
    maxFiles: 1,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedCode) {
      setError('언어를 선택해주세요');
      return;
    }

    if (!file) {
      setError('EPUB 파일을 업로드해주세요');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('code', selectedCode);
      formData.append('version', version);
      formData.append('file', file);

      const response = await fetch('/api/languages', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || '업로드 실패');
      }

      onUpload(result.data);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '업로드 중 오류 발생');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedCode('');
    setVersion('1.0');
    setFile(null);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            새 언어팩 업로드
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Language Select */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              언어 선택
            </label>
            <select
              value={selectedCode}
              onChange={(e) => setSelectedCode(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none"
            >
              <option value="">언어를 선택하세요</option>
              {availableLanguages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.localName} ({lang.name})
                </option>
              ))}
            </select>
          </div>

          {/* Version Input */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              버전
            </label>
            <input
              type="text"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="1.0"
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-primary focus:outline-none"
            />
          </div>

          {/* File Upload */}
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              EPUB 파일
            </label>
            <div
              {...getRootProps()}
              className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                isDragActive
                  ? 'border-primary bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              {file ? (
                <div className="text-sm text-gray-600">
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="mt-1">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : isDragActive ? (
                <p className="text-primary">파일을 여기에 놓으세요</p>
              ) : (
                <div className="text-gray-500">
                  <svg className="mx-auto mb-2 h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p>EPUB 파일을 드래그하거나 클릭하여 선택</p>
                </div>
              )}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="flex-1 rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary-dark disabled:opacity-50"
            >
              {isUploading ? '업로드 중...' : '업로드'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
