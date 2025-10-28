 'use client';

import { useEffect } from 'react';

export default function WebsiteIdHandler() {
  useEffect(() => {
    // Server'dan gelen header'ı okuyup localStorage'a kaydet
    const getWebsiteId = async () => {
      try {
        const response = await fetch(window.location.href, {
          method: 'HEAD',
        });
        const websiteId = response.headers.get('x-website-id');

        if (websiteId) {
          localStorage.setItem('websiteId', websiteId);
        }
      } catch (error) {
        console.error('Website ID alınamadı:', error);
      }
    };

    getWebsiteId();
  }, []);

  return null; // Bu bileşen görsel bir şey render etmez
}
