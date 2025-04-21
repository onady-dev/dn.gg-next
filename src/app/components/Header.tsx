"use client";

import React from "react";
import Link from "next/link";
import { useGroupStore } from "../stores/groupStore";
import * as S from "../styles/HeaderStyles";

export default function Header() {
  const { selectedGroup, setSelectedGroup, groups } = useGroupStore();

  return (
    <S.HeaderContainer>
      <S.HeaderInner>
        <S.LogoNavContainer>
          <S.Logo>
            <Link href="/">DN.GG</Link>
          </S.Logo>
          <S.Navigation>
            <Link href="/rankings">랭킹</Link>
            <Link href="/teams">팀 관리</Link>
            <Link href="/games">게임 관리</Link>
          </S.Navigation>
        </S.LogoNavContainer>
        <S.GroupSelect value={selectedGroup || ""} onChange={(e) => setSelectedGroup(Number(e.target.value))}>
          <option value="">그룹 선택</option>
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </S.GroupSelect>
      </S.HeaderInner>
    </S.HeaderContainer>
  );
}
