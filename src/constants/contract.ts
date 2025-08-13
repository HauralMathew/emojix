import { Network } from '@aptos-labs/ts-sdk';

// Contract Addresses
// Using our deployed emojix contracts on devnet

// Network Constants
export const TESTNET = Network.TESTNET;
export const DEVNET = Network.DEVNET;

// EmojixCore - Main contract (contains emojixcore and emojihex modules)
export const EMOJIX_CORE_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "31f15c9ab78e335e403b118801ee3d4f571e71cfcbba6263f29e6afd62a43151";

// EmojixFactory - Factory contract for creating tokens
export const EMOJIX_FACTORY_ADDRESS = import.meta.env.VITE_EMOJIX_FACTORY_ADDRESS || "98eefaaea8cefa505e4e82a50ee88d459c765ebc8b9204dad3ba17aa4f1d4492";

// Legacy address (keeping for backward compatibility)
export const CONTRACT_ADDRESS = EMOJIX_CORE_ADDRESS;

// Network Configuration
export const NETWORK = import.meta.env.VITE_NETWORK || "devnet"; // or "mainnet" for production

// API Configuration for rate limiting
// Devnet API Key: galyze_dev
export const APTOS_API_KEY = import.meta.env.VITE_APTOS_API_KEY || "AG-HXVDPTB4FFTRXQH5BEZT8VPTTABX8VU6B";

// Panora API Configuration for real-time token prices
export const PANORA_API_KEY = import.meta.env.VITE_PANORA_API_KEY || "a4^KV_EaTf4MW#ZdvgGKX#HUD^3IFEAOV_kzpIE^3BQGA8pDnrkT7JcIy#HNlLGi";
export const PANORA_API_URL = "https://api.panora.exchange/prices";

// Module names
export const EMOJIX_CORE_MODULE = import.meta.env.VITE_MODULE_NAME || "emojixcore";
export const EMOJIHEX_MODULE = "emojihex";