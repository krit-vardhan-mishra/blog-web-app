import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AdPlaceholder from './AdPlaceholder';

const AdSlot = ({ placement, className = '' }) => {
  const location = useLocation();

  // If in development mode, render the styled visual placeholder
  if (import.meta.env.DEV) {
    return <AdPlaceholder placement={placement} className={className} />;
  }

  // Load production environment variables
  const clientId = import.meta.env.VITE_ADSENSE_CLIENT_ID || 'ca-pub-0000000000000000';
  
  // Map placements to specific slot environment variables
  const getSlotId = (place) => {
    switch (place) {
      case 'explore-feed':
        return import.meta.env.VITE_ADSENSE_SLOT_EXPLORE_FEED || '0000000001';
      case 'article-end':
        return import.meta.env.VITE_ADSENSE_SLOT_ARTICLE_END || '0000000002';
      case 'dashboard-feed':
        return import.meta.env.VITE_ADSENSE_SLOT_DASHBOARD_FEED || '0000000003';
      case 'in-article':
        return import.meta.env.VITE_ADSENSE_SLOT_IN_ARTICLE || '0000000004';
      default:
        return '0000000000';
    }
  };

  const slotId = getSlotId(placement);

  // Dynamic script loader for production AdSense tag
  useEffect(() => {
    const scriptId = 'google-adsense-script';
    let scriptElement = document.getElementById(scriptId);

    if (!scriptElement) {
      scriptElement = document.createElement('script');
      scriptElement.id = scriptId;
      scriptElement.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`;
      scriptElement.async = true;
      scriptElement.crossOrigin = 'anonymous';
      document.head.appendChild(scriptElement);
    }
  }, [clientId]);

  // Route-change triggered ad load (runs on component mount and when pathname changes)
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      // Catch error silenty as AdSense scripts might fail to execute if blocked by AdBlockers
      console.warn('AdSense unit load failed or was blocked: ', error.message);
    }
  }, [location.pathname]);

  // Determine styling class based on placement
  let displayStyle = 'block';
  let width = 'auto';
  let height = 'auto';

  if (placement === 'explore-feed' || placement === 'dashboard-feed') {
    displayStyle = 'block';
  } else if (placement === 'article-end') {
    displayStyle = 'inline-block';
    width = '100%';
    height = '90px';
  } else if (placement === 'in-article') {
    displayStyle = 'block';
    width = '100%';
  }

  return (
    <div 
      className={`adsense-wrapper overflow-hidden bg-gray-900/10 rounded-lg ${className}`}
      style={{ minWidth: '250px' }}
    >
      <ins
        className="adsbygoogle"
        style={{
          display: displayStyle,
          width: width,
          height: height,
        }}
        data-ad-client={clientId}
        data-ad-slot={slotId}
        data-ad-format={placement === 'article-end' || placement === 'in-article' ? 'horizontal' : 'auto'}
        data-full-width-responsive={placement === 'article-end' || placement === 'in-article' ? 'false' : 'true'}
      />
    </div>
  );
};

export default AdSlot;
