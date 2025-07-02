import { create } from "zustand";
import { api } from "@/lib/axios";
import { useAuthStore } from "./useAuthStore";

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
  createGroup: (name: string) => Promise<void>;
}

const STORAGE_KEY = 'selectedGroupId';

// localStorage에서 마지막 선택한 그룹 ID 가져오기
const getStoredGroupId = (): number | null => {
  if (typeof window === "undefined") return null;
  const storedId = localStorage.getItem(STORAGE_KEY);
  return storedId ? Number(storedId) : null;
};

export const useGroupStore = create<GroupState>((set) => ({
  selectedGroup: getStoredGroupId(),
  groups: [],
  setSelectedGroup: (groupId) => {
    if (typeof window !== "undefined") {
      if (groupId) {
        localStorage.setItem(STORAGE_KEY, String(groupId));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    set({ selectedGroup: groupId });
  },
  setGroups: (groups) => set({ groups }),
  loadGroups: async () => {
    try {
      const response = await api.get("/group/all");
      const groups = response.data;
      set({ groups });
    } catch (error) {
      console.error("그룹 목록을 불러오는데 실패했습니다:", error);
    }
  },
  createGroup: async (name: string) => {
    try {
      const user = useAuthStore((state) => state.user);
      const response = await api.post("/group", { name }, {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
        },
      });
      const newGroup = response.data;
      set((state) => ({
        groups: [...state.groups, newGroup],
        selectedGroup: newGroup.id
      }));
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, String(newGroup.id));
      }
    } catch (error) {
      console.error("그룹 생성에 실패했습니다:", error);
      throw error;
    }
  },
}));
