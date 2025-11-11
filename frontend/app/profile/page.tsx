"use client";

import { Layout } from "@/components/layout/Layout";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useAccount } from "wagmi";
import { usePendingBalance, useRewardVault } from "@/hooks/useRewardVault";
import { formatEther } from "viem";
import { useState, useEffect } from "react";

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const { pendingBalance, isLoading, refetch } = usePendingBalance(address);
  const { withdraw, isPending, isConfirming, isSuccess, error } = useRewardVault();
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  useEffect(() => {
    if (isSuccess) {
      setWithdrawSuccess(true);
      setWithdrawError(null);
      refetch();
      setTimeout(() => setWithdrawSuccess(false), 5000);
    }
  }, [isSuccess, refetch]);

  useEffect(() => {
    if (error) {
      setWithdrawError((error as Error).message);
      setTimeout(() => setWithdrawError(null), 5000);
    }
  }, [error]);

  if (!isConnected) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto text-center py-16">
          <div className="text-6xl mb-4">👤</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile</h1>
          <p className="text-gray-600 mb-8">
            Please connect your wallet to view your profile
          </p>
        </div>
      </Layout>
    );
  }

  const handleWithdraw = async () => {
    try {
      await withdraw();
    } catch (err) {
      console.error("Withdraw error:", err);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
        <p className="text-gray-600 mb-8">Manage your account and earnings</p>

        {/* Success/Error Messages */}
        {withdrawSuccess && (
          <div className="card mb-6 bg-green-50 border-green-200">
            <p className="text-green-800 font-medium">
              🎉 Withdrawal successful!
            </p>
          </div>
        )}

        {withdrawError && (
          <div className="card mb-6 bg-red-50 border-red-200">
            <p className="text-red-800">{withdrawError}</p>
          </div>
        )}

        {/* Account Info */}
        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4">Account</h2>
          <div>
            <dt className="text-sm text-gray-600 mb-1">Wallet Address</dt>
            <dd className="font-mono text-sm bg-gray-50 p-3 rounded border border-gray-200 break-all">
              {address}
            </dd>
          </div>
        </div>

        {/* Earnings */}
        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4">Earnings</h2>

          {isLoading ? (
            <div className="py-8">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 mb-4">
                <div className="text-sm text-primary-700 mb-1">Pending Balance</div>
                <div className="text-4xl font-bold text-primary-900">
                  {pendingBalance ? formatEther(pendingBalance) : "0"} ETH
                </div>
                <div className="text-xs text-primary-600 mt-2">
                  Tips from your notes waiting to be withdrawn
                </div>
              </div>

              <button
                onClick={handleWithdraw}
                disabled={
                  isPending ||
                  isConfirming ||
                  !pendingBalance ||
                  pendingBalance === BigInt(0)
                }
                className="w-full btn-primary"
              >
                {isPending && "Preparing..."}
                {isConfirming && "Confirming..."}
                {!isPending && !isConfirming && "Withdraw"}
              </button>

              {isPending && (
                <p className="text-sm text-gray-600 text-center mt-3">
                  Please confirm the transaction in your wallet...
                </p>
              )}
              {isConfirming && (
                <p className="text-sm text-gray-600 text-center mt-3">
                  Waiting for confirmation...
                </p>
              )}
            </>
          )}
        </div>

        {/* Info Section */}
        <div className="card bg-gray-50">
          <h3 className="font-semibold mb-3">How Earnings Work</h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>• You earn 85% of all tips received on your notes</li>
            <li>• Tips are automatically split when received</li>
            <li>• Withdraw your earnings anytime using this page</li>
            <li>• All transactions are secure and non-custodial</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}
