"use client";

import React from "react";
import Link from "next/link";
import { useGroupStore } from "../stores/groupStore";

export default function Header() {
  const { selectedGroup, setSelectedGroup, groups } = useGroupStore();

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1>
              <Link href="/" className="text-xl font-bold text-gray-900">
                DN.GG
              </Link>
            </h1>
            <nav>
              <Link href="/rankings" className="text-gray-600 hover:text-gray-900">
                랭킹
              </Link>
            </nav>
          </div>
          <select
            className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-900 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[140px]"
            value={selectedGroup || ""}
            onChange={(e) => setSelectedGroup(Number(e.target.value))}
          >
            <option value="" className="text-gray-500">
              그룹 선택
            </option>
            {groups.map((group) => (
              <option key={group.id} value={group.id} className="text-gray-900">
                {group.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
}
