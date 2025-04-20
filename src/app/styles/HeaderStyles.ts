"use client";

import styled from "styled-components";

export const HeaderContainer = styled.header`
  background-color: white;
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 40;
  backdrop-filter: blur(8px);
  background-color: rgba(255, 255, 255, 0.95);
`;

export const HeaderInner = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  height: 4rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const LogoNavContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
`;

export const Logo = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;

  a {
    color: var(--text-color);
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover {
      color: var(--primary-color);
    }
  }
`;

export const Navigation = styled.nav`
  display: flex;
  gap: 1.5rem;

  a {
    color: #6b7280;
    font-weight: 500;
    transition: color 0.2s ease;
    position: relative;

    &:hover {
      color: var(--text-color);
    }

    &::after {
      content: "";
      position: absolute;
      bottom: -4px;
      left: 0;
      width: 100%;
      height: 2px;
      background-color: var(--primary-color);
      transform: scaleX(0);
      transition: transform 0.2s ease;
    }

    &:hover::after {
      transform: scaleX(1);
    }
  }
`;

export const GroupSelect = styled.select`
  padding: 0.5rem 2rem 0.5rem 1rem;
  background-color: white;
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-color);
  min-width: 140px;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--primary-color);
  }

  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.1);
  }

  option {
    color: var(--text-color);
    padding: 0.5rem;
  }
`;
