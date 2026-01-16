'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import type { LanguagePack } from '@/lib/types';

export default function DashboardPage() {
  const [languages, setLanguages] = useState<LanguagePack[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLanguages();
  }, []);

  const fetchLanguages = async () => {
    try {
      const response = await fetch('/api/languages');
      const result = await response.json();
      if (result.success) {
        setLanguages(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch languages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalSize = languages.reduce((sum, lang) => sum + lang.sizeBytes, 0);
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const rtlCount = languages.filter(l => l.rtl).length;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">대시보드</h1>

      {/* Stats Cards */}
      <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Languages */}
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">등록된 언어팩</p>
              <p className="mt-1 text-3xl font-bold text-gray-900">
                {isLoading ? '-' : languages.length}
              </p>
            </div>
            <div className="rounded-full bg-blue-100 p-3">
              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Size */}
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">총 용량</p>
              <p className="mt-1 text-3xl font-bold text-gray-900">
                {isLoading ? '-' : formatSize(totalSize)}
              </p>
            </div>
            <div className="rounded-full bg-green-100 p-3">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
            </div>
          </div>
        </div>

        {/* RTL Languages */}
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">RTL 언어</p>
              <p className="mt-1 text-3xl font-bold text-gray-900">
                {isLoading ? '-' : rtlCount}
              </p>
            </div>
            <div className="rounded-full bg-yellow-100 p-3">
              <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
          </div>
        </div>

        {/* Manifest Status */}
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Manifest 상태</p>
              <p className="mt-1 text-xl font-bold text-green-600">
                {isLoading ? '-' : '최신'}
              </p>
            </div>
            <div className="rounded-full bg-green-100 p-3">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">빠른 작업</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Link
            href="/languages"
            className="flex items-center gap-3 rounded-lg bg-white p-4 shadow transition-shadow hover:shadow-md"
          >
            <div className="rounded-full bg-blue-100 p-2">
              <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <span className="font-medium text-gray-900">새 언어팩 추가</span>
          </Link>

          <a
            href="/manifest.json"
            target="_blank"
            className="flex items-center gap-3 rounded-lg bg-white p-4 shadow transition-shadow hover:shadow-md"
          >
            <div className="rounded-full bg-green-100 p-2">
              <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <span className="font-medium text-gray-900">Manifest 보기</span>
          </a>

          <Link
            href="/languages"
            className="flex items-center gap-3 rounded-lg bg-white p-4 shadow transition-shadow hover:shadow-md"
          >
            <div className="rounded-full bg-purple-100 p-2">
              <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="font-medium text-gray-900">언어팩 관리</span>
          </Link>
        </div>
      </div>

      {/* Recent Languages */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">최근 언어팩</h2>
        {isLoading ? (
          <div className="rounded-lg bg-white p-8 text-center shadow">
            <p className="text-gray-500">로딩 중...</p>
          </div>
        ) : languages.length === 0 ? (
          <div className="rounded-lg bg-white p-8 text-center shadow">
            <p className="text-gray-500">등록된 언어팩이 없습니다</p>
            <Link
              href="/languages"
              className="mt-2 inline-block text-primary hover:underline"
            >
              첫 언어팩 추가하기
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    언어
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    버전
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    용량
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    업데이트
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {languages.slice(0, 5).map((lang) => (
                  <tr key={lang.code} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="font-medium text-gray-900">
                        {lang.localName}
                      </span>
                      <span className="ml-2 text-sm text-gray-500">
                        ({lang.code})
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      v{lang.version}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {lang.size}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {new Date(lang.updatedAt).toLocaleDateString('ko-KR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
