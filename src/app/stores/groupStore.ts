import { create } from "zustand";
import { api } from "@/lib/axios";

interface Group {
  id: number;
  name: string;
  description: string;
}

interface GroupState {
  selectedGroup: number | null;
  groups: Group[];
  setSelectedGroup: (groupId: number | null) => void;
  setGroups: (groups: Group[]) => void;
  loadGroups: () => Promise<void>;
}

// localStorage에서 마지막 선택한 그룹 ID 가져오기
const getStoredGroupId = (): number | null => {
  if (typeof window === "undefined") return null;
  const storedId = localStorage.getItem("selectedGroupId");
  return storedId ? Number(storedId) : null;
};

export const useGroupStore = create<GroupState>((set) => ({
  selectedGroup: getStoredGroupId(),
  groups: [],
  setSelectedGroup: (groupId) => {
    if (typeof window !== "undefined") {
      if (groupId) {
        localStorage.setItem("selectedGroupId", String(groupId));
      } else {
        localStorage.removeItem("selectedGroupId");
      }
    }
    set({ selectedGroup: groupId });
  },
  setGroups: (groups) => {
    set({ groups });
    // 저장된 그룹 ID가 있고, 해당 그룹이 존재하는 경우에만 선택
    const storedGroupId = getStoredGroupId();
    if (storedGroupId && groups.some((group) => group.id === storedGroupId)) {
      set({ selectedGroup: storedGroupId });
    } else if (groups.length > 0) {
      // 저장된 그룹이 없거나 유효하지 않은 경우 첫 번째 그룹 선택
      const firstGroupId = groups[0].id;
      if (typeof window !== "undefined") {
        localStorage.setItem("selectedGroupId", String(firstGroupId));
      }
      set({ selectedGroup: firstGroupId });
    }
  },
  loadGroups: async () => {
    try {
      const response = await api.get("/group/all");
      const groups = response.data;
      set({ groups });

      // 저장된 그룹 ID가 있고, 해당 그룹이 존재하는 경우에만 선택
      const storedGroupId = getStoredGroupId();
      if (storedGroupId && groups.some((group) => group.id === storedGroupId)) {
        set({ selectedGroup: storedGroupId });
      } else if (groups.length > 0) {
        // 저장된 그룹이 없거나 유효하지 않은 경우 첫 번째 그룹 선택
        const firstGroupId = groups[0].id;
        if (typeof window !== "undefined") {
          localStorage.setItem("selectedGroupId", String(firstGroupId));
        }
        set({ selectedGroup: firstGroupId });
      }
    } catch (error) {
      console.error("그룹 목록을 불러오는데 실패했습니다:", error);
    }
  },
}));
