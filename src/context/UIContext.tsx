import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

type UIContextType = {
  headerSuppressors: Set<string>;
  footerSuppressors: Set<string>;
  suppressHeader: (id: string) => void;
  releaseHeader: (id: string) => void;
  suppressFooter: (id: string) => void;
  releaseFooter: (id: string) => void;
  isHeaderHidden: boolean;
  isFooterHidden: boolean;
};

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [headerSuppressors, setHeaderSuppressors] = useState(new Set<string>());
  const [footerSuppressors, setFooterSuppressors] = useState(new Set<string>());

  const suppressHeader = useCallback((id: string) =>
    setHeaderSuppressors(prev => new Set(prev).add(id)), []);

  const releaseHeader = useCallback((id: string) =>
    setHeaderSuppressors(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    }), []);

  const suppressFooter = useCallback((id: string) =>
    setFooterSuppressors(prev => new Set(prev).add(id)), []);

  const releaseFooter = useCallback((id: string) =>
    setFooterSuppressors(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    }), []);

  const value = useMemo(() => ({
    headerSuppressors,
    footerSuppressors,
    suppressHeader,
    releaseHeader,
    suppressFooter,
    releaseFooter,
    isHeaderHidden: headerSuppressors.size > 0,
    isFooterHidden: footerSuppressors.size > 0,
  }), [headerSuppressors, footerSuppressors, suppressHeader, releaseHeader, suppressFooter, releaseFooter]);

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) throw new Error('useUI must be used within UIProvider');
  return context;
};
