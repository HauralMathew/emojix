import { useState, useEffect } from 'react';
import { PANORA_API_KEY, PANORA_API_URL } from '../constants/contract';

interface AptPriceData {
  usdPrice: string;
  nativePrice: string;
  lastUpdated: Date;
}

export const useAptPrice = () => {
  const [aptPrice, setAptPrice] = useState<AptPriceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAptPrice = async () => {
    try {
      setLoading(true);
      setError(null);

      // Panora API endpoint for APT prices
      const response = await fetch(PANORA_API_URL, {
        headers: {
          'x-api-key': PANORA_API_KEY
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Find APT token in the response
      const aptToken = data.find((token: any) => 
        token.symbol === 'APT' || 
        token.name === 'Aptos' ||
        token.faAddress === '0x1::aptos_coin::AptosCoin'
      );

      if (aptToken) {
        setAptPrice({
          usdPrice: aptToken.usdPrice,
          nativePrice: aptToken.nativePrice,
          lastUpdated: new Date()
        });
      } else {
        // Fallback: APT is typically the native token, so we can use the first result
        // or set a default value
        setAptPrice({
          usdPrice: '8.42', // Fallback price
          nativePrice: '1.0',
          lastUpdated: new Date()
        });
      }
    } catch (err) {
      console.error('Error fetching APT price:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch price');
      
      // Set fallback price on error
      setAptPrice({
        usdPrice: '8.42',
        nativePrice: '1.0',
        lastUpdated: new Date()
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAptPrice();
    
    // Refresh price every 30 seconds
    const interval = setInterval(fetchAptPrice, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    aptPrice,
    loading,
    error,
    refetch: fetchAptPrice
  };
};
