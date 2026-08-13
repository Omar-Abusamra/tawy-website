import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  initMetaPixel,
  isMetaPixelConfigured,
  trackMetaPageView,
  trackMetaSearch,
} from '../utils/metaPixel';

const MetaPixel = () => {
  const location = useLocation();
  const lastSearchRef = useRef('');

  useEffect(() => {
    if (!isMetaPixelConfigured()) return;
    initMetaPixel();
  }, []);

  useEffect(() => {
    if (!isMetaPixelConfigured()) return;
    trackMetaPageView();

    const params = new URLSearchParams(location.search);
    const searchQuery = params.get('search')?.trim() || '';

    if (searchQuery && searchQuery !== lastSearchRef.current) {
      lastSearchRef.current = searchQuery;
      trackMetaSearch(searchQuery);
    }

    if (!searchQuery) {
      lastSearchRef.current = '';
    }
  }, [location.pathname, location.search]);

  return null;
};

export default MetaPixel;
