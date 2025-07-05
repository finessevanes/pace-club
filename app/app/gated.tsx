"use client";
import { usePrivy } from "@privy-io/react-auth";

export default function GatedPage() {
  const { ready, authenticated, login, logout, user } = usePrivy();

  if (!ready) return <div>Loading Privy...</div>;

  if (!authenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <h2 className="text-2xl font-bold mb-4">Access Restricted</h2>
          <p className="mb-6">You must connect your wallet to access this page.</p>
          <button onClick={login} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-md">Connect Wallet</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg text-center">
        <h2 className="text-3xl font-bold mb-4 text-green-700">Welcome to the Gated Page!</h2>
        <p className="mb-4">You are authenticated with Privy.</p>
        <div className="mb-4">{user?.wallet?.address && (<span className="font-mono text-gray-700">{user.wallet.address}</span>)}</div>
        <button onClick={logout} className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-md">Logout</button>
      </div>
    </div>
  );
} 