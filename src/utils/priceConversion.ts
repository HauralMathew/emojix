/**
 * Price conversion utilities for APT <-> USD
 */

export interface PriceData {
  usdPrice: string;
  nativePrice: string;
}

/**
 * Convert APT amount to USD
 * @param aptAmount - Amount in APT (as string or number)
 * @param priceData - Current price data from Panora API
 * @returns USD amount as string with 2-4 decimal places
 */
export const convertAptToUsd = (aptAmount: string | number, priceData: PriceData): string => {
  const apt = typeof aptAmount === 'string' ? parseFloat(aptAmount) : aptAmount;
  const usdPrice = parseFloat(priceData.usdPrice);
  
  if (isNaN(apt) || isNaN(usdPrice)) return '$0.00';
  
  const usdAmount = apt * usdPrice;
  
  // Show 2 decimal places for amounts >= $1, 4 for amounts < $1
  if (usdAmount >= 1) {
    return `$${usdAmount.toFixed(2)}`;
  } else {
    return `$${usdAmount.toFixed(4)}`;
  }
};

/**
 * Convert USD amount to APT
 * @param usdAmount - Amount in USD (as string or number)
 * @param priceData - Current price data from Panora API
 * @returns APT amount as string with 4-6 decimal places
 */
export const convertUsdToApt = (usdAmount: string | number, priceData: PriceData): string => {
  const usd = typeof usdAmount === 'string' ? parseFloat(usdAmount) : usdAmount;
  const usdPrice = parseFloat(priceData.usdPrice);
  
  if (isNaN(usd) || isNaN(usdPrice) || usdPrice === 0) return '0.000000';
  
  const aptAmount = usd / usdPrice;
  
  // Show 4 decimal places for amounts >= 1 APT, 6 for amounts < 1 APT
  if (aptAmount >= 1) {
    return aptAmount.toFixed(4);
  } else {
    return aptAmount.toFixed(7);
  }
};

/**
 * Format APT amount with proper decimal places
 * @param aptAmount - Amount in APT (as string or number)
 * @returns Formatted APT amount as string
 */
export const formatAptAmount = (aptAmount: string | number): string => {
  const apt = typeof aptAmount === 'string' ? parseFloat(aptAmount) : aptAmount;
  
  if (isNaN(apt)) return '0.000000';
  
  // Show 4 decimal places for amounts >= 1 APT, 6 for amounts < 1 APT
  if (apt >= 1) {
    return apt.toFixed(4);
  } else {
    return apt.toFixed(7);
  }
};

/**
 * Format USD amount with proper decimal places
 * @param usdAmount - Amount in USD (as string or number)
 * @returns Formatted USD amount as string
 */
export const formatUsdAmount = (usdAmount: string | number): string => {
  const usd = typeof usdAmount === 'string' ? parseFloat(usdAmount) : usdAmount;
  
  if (isNaN(usd)) return '$0.000000';
  
  // Always show 6 decimal places for USD amounts
  return `$${usd.toFixed(6)}`;
};
