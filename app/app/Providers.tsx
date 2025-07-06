"use client";

import { PrivyProvider } from "@privy-io/react-auth";

// Add Flow network configuration
const flowTestnet = {
  id: 545, // Flow EVM Testnet
  name: 'Flow EVM Testnet',
  network: 'flow-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Flow',
    symbol: 'FLOW',
  },
  rpcUrls: {
    default: {
      http: ['https://testnet.evm.nodes.onflow.org'],
    },
    public: {
      http: ['https://testnet.evm.nodes.onflow.org'],
    },
  },
  blockExplorers: {
    default: { name: 'Flow EVM Explorer', url: 'https://evm-testnet.flowscan.org' },
  },
};

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={{
        // Remove embedded wallets - use external wallets only
        embeddedWallets: {
          createOnLogin: "off", // Disable embedded wallet creation
        },
        loginMethods: ["wallet", "email", "sms"], // Keep wallet as primary login method
        appearance: {
          showWalletLoginFirst: true, // Show wallet connection first
        },
        supportedChains: [flowTestnet],
        // No defaultChain - keeps Privy's defaults for Self verification
      }}
    >
      {children}
    </PrivyProvider>
  );
} 