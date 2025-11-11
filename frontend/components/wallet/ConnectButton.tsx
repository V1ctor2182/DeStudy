"use client";

import { useState, useEffect } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";

export function ConnectButton() {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected } = useAccount();
  const { connect, error: connectError, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleConnect = () => {
    console.log("Connect button clicked");
    try {
      connect({ connector: injected() });
    } catch (err) {
      console.error("Connect error:", err);
    }
  };

  // Log any connection errors
  if (connectError) {
    console.error("Wagmi connect error:", connectError);
  }

  // Prevent hydration mismatch by not rendering connected state until mounted
  if (mounted && isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
        <button
          onClick={() => disconnect()}
          className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={handleConnect}
        disabled={isPending}
        className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? "Connecting..." : "Connect Wallet"}
      </button>
      {connectError && (
        <div className="absolute top-full right-0 mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700 max-w-xs">
          {connectError.message}
        </div>
      )}
    </div>
  );
}
