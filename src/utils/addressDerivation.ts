import {
  AccountAddress,
  type AccountAddressInput,
  Hex,
  type HexInput,
  DeriveScheme,
} from "@aptos-labs/ts-sdk";
import { sha3_256 } from "@noble/hashes/sha3";

/**
 * Creates a named object address using the Aptos object model
 * This is used to derive deterministic addresses for markets
 */
export function createNamedObjectAddress(args: {
  creator: AccountAddressInput;
  seed: HexInput;
}): AccountAddress {
  const creatorAddress = AccountAddress.from(args.creator);
  const seed = Hex.fromHexInput(args.seed).toUint8Array();
  const serializedCreatorAddress = creatorAddress.bcsToBytes();
  const preImage = new Uint8Array([
    ...serializedCreatorAddress,
    ...seed,
    DeriveScheme.DeriveObjectAddressFromSeed,
  ]);

  return AccountAddress.from(sha3_256(preImage));
}

/**
 * Encodes emojis to bytes for use as a seed in address derivation
 */
export function encodeEmojis(emojis: string[]): Uint8Array {
  const emojiString = emojis.join("");
  const encoder = new TextEncoder();
  return encoder.encode(emojiString);
}

/**
 * Derives the market address from the given emoji array and registry address
 * This creates the branded contract addresses like "2i76yz7MGyTsoqJXyYd1som6L5panUzejXSEWx6Apump"
 */
export function getMarketAddress(
  emojis: string[],
  registryAddress?: AccountAddressInput
): AccountAddress {
  const defaultRegistryAddress = "0xbe9efc07c8fde828240f36921f68e0dee058cd6d68d0f7590f0cd18b700d6c79"; // Emojix registry address
  const creator = AccountAddress.from(registryAddress ?? defaultRegistryAddress);
  const seed = encodeEmojis(emojis);
  
  return createNamedObjectAddress({
    creator,
    seed,
  });
}

/**
 * Gets the emojix factory module address for a given market address
 */
export function getEmojixFactoryAddress(marketAddress: AccountAddressInput): string {
  const address = AccountAddress.from(marketAddress);
  return `${address.toString()}::emojix_factory`;
}

/**
 * Gets the EmojixToken type for a given market address (FA standard)
 */
export function getEmojixTokenType(marketAddress: AccountAddressInput): string {
  const address = AccountAddress.from(marketAddress);
  return `${address.toString()}::emojix_factory::EmojixToken`;
}

/**
 * Example usage:
 * 
 * const marketAddress = getMarketAddress(["🚀", "🔥"], registryAddress);
 * console.log(marketAddress.toString()); // Something like "2i76yz7MGyTsoqJXyYd1som6L5panUzejXSEWx6Apump"
 * 
 * const tokenType = getEmojixTokenType(marketAddress);
 * console.log(tokenType); // "2i76yz7MGyTsoqJXyYd1som6L5panUzejXSEWx6Apump::emojix_factory::EmojixToken"
 */ 