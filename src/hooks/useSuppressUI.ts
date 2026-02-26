import { useEffect } from 'react';
import { useUI } from '../context/UIContext';

export function useSuppressUI(id: string, options = { header: true, footer: true }) {
  const { suppressHeader, releaseHeader, suppressFooter, releaseFooter } = useUI();

  useEffect(() => {
    if (options.header) suppressHeader(id);
    if (options.footer) suppressFooter(id);

    return () => {
      if (options.header) releaseHeader(id);
      if (options.footer) releaseFooter(id);
    };
  }, [id, options.header, options.footer, suppressHeader, releaseHeader, suppressFooter, releaseFooter]);
}
