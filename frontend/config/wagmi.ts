import { http, createConfig } from "wagmi";
import { localhost } from "wagmi/chains";
import { injected } from "wagmi/connectors";

// Custom localhost chain for Hardhat
export const hardhatChain = {
  id: 31337,
  name: "Localhost",
  nativeCurrency: {
    decimals: 18,
    name: "Ether",
    symbol: "ETH",
  },
  rpcUrls: {
    default: { http: ["http://127.0.0.1:8545"] },
    public: { http: ["http://127.0.0.1:8545"] },
  },
  testnet: true,
} as const;

export const config = createConfig({
  chains: [hardhatChain],
  connectors: [injected()],
  transports: {
    [hardhatChain.id]: http(),
  },
  ssr: false,
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
