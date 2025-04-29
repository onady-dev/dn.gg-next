import React, { useState } from 'react';
import { useGroupStore } from '../stores/groupStore';
import * as S from '../styles/ModalStyles';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateGroupModal({ isOpen, onClose }: CreateGroupModalProps) {
  const [groupName, setGroupName] = useState('');
  const { createGroup } = useGroupStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;

    try {
      await createGroup(groupName);
      setGroupName('');
      onClose();
    } catch (error) {
      console.error('그룹 생성 실패:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <S.ModalOverlay onClick={onClose}>
      <S.ModalContent onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        <S.ModalHeader>
          <h2>새 그룹 생성</h2>
          <S.CloseButton onClick={onClose}>&times;</S.CloseButton>
        </S.ModalHeader>
        <form onSubmit={handleSubmit}>
          <S.ModalBody>
            <S.InputGroup>
              <label htmlFor="groupName">그룹 이름</label>
              <input
                id="groupName"
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="그룹 이름을 입력하세요"
              />
            </S.InputGroup>
          </S.ModalBody>
          <S.ModalFooter>
            <S.Button type="button" onClick={onClose} variant="secondary">
              취소
            </S.Button>
            <S.Button type="submit" variant="primary">
              생성
            </S.Button>
          </S.ModalFooter>
        </form>
      </S.ModalContent>
    </S.ModalOverlay>
  );
} 