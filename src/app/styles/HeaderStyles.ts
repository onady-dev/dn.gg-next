"use client";

import styled from "styled-components";

export const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  z-index: 1000;
`;

export const HeaderInner = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const LogoNavContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 48px;
  
  @media (max-width: 768px) {
    gap: 24px;
  }
`;

export const Logo = styled.div`
  font-size: 24px;
  font-weight: bold;
  
  a {
    color: #000;
    text-decoration: none;
  }
  
  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

export const Navigation = styled.nav`
  display: flex;
  gap: 32px;
  
  a {
    color: #666;
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    transition: color 0.2s;
    
    &:hover {
      color: #000;
    }
    
    svg {
      width: 20px;
      height: 20px;
      display: none;
    }
  }
  
  @media (max-width: 768px) {
    gap: 16px;
    
    a {
      font-size: 0;
      
      svg {
        display: block;
        width: 24px;
        height: 24px;
      }
    }
  }
`;

export const GroupContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  
  @media (max-width: 768px) {
    gap: 8px;
  }
`;

export const GroupSelect = styled.select`
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #ddd;
  background-color: white;
  font-size: 14px;
  min-width: 140px;
  cursor: pointer;
  
  @media (max-width: 768px) {
    min-width: 60px;
    padding: 6px 8px;
    font-size: 14px;
  }
`;

export const CreateGroupButton = styled.button`
  padding: 8px 16px;
  border-radius: 6px;
  background-color: #007AFF;
  color: white;
  border: none;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &:hover {
    background-color: #0056b3;
  }
  
  &::before {
    content: "+";
    font-size: 20px;
    line-height: 1;
    display: none;
    height: 20px;
    width: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  @media (max-width: 768px) {
    padding: 0;
    width: 32px;
    height: 32px;
    font-size: 0;
    justify-content: center;
    align-items: center;
    
    &::before {
      display: flex;
      margin: 0;
    }
  }
`;

export const EmptyStateText = styled.span`
  color: #666;
  font-size: 14px;
  
  @media (max-width: 768px) {
    font-size: 12px;
  }
`;
