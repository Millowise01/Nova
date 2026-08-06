import { getApiClient } from "./api";

export function getWalletBalance() {
  return getApiClient().wallet.getBalance();
}
