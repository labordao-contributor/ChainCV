'use client'; 

import { useState } from 'react';

import Image from 'next/image';

type Vote = { id: string; proposal: { title: string; }; space: { id: string; }; };

export default function Home() {
  const [walletAddress, setWalletAddress] = useState('');
  const [votes, setVotes] = useState<Vote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const fetchVotes = async () => {
    if (!walletAddress) return;
    setIsLoading(true);
    setHasSearched(true);
    setVotes([]);
    setError('');
    let addressToSearch = walletAddress.toLowerCase();

    if (addressToSearch.endsWith('.eth')) {
      try {
        const response = await fetch('/api/resolve-ens', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ensName: addressToSearch }),
        });
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        addressToSearch = data.address;
      } catch (err: any) {
        setError('Could not find that ENS name. Please check the spelling.');
        setIsLoading(false);
        return;
      }
    }

    const endpoint = 'https://hub.snapshot.org/graphql';
    const query = `query Votes { votes(first: 20, where: { voter: "${addressToSearch}" }) { id proposal { title } space { id } } }`;
    try {
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query }) });
      const { data } = await response.json();
      setVotes(data?.votes || []);
    } catch (err) {
      setError('Failed to fetch governance data.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      
      <Image 
    src="/chaincv-logo.png"
    alt="ChainCV Logo"
    width={300}
    height={300}
    className="mb-0"
  />

      <h1 className="text-4xl font-bold">ChainCV</h1>
      <p className="mt-2 text-lg text-white">Your On-Chain Web3 Resume, Instantly</p>
      <p className="mt-2 text-sm text-white">Powered by LaborDAO</p>
      
      <div className="mt-8 flex w-full max-w-md items-center space-x-2">
        <input
          type="text"
          placeholder="Enter a wallet address..."
          className="flex-grow rounded-md border border-gray-300 px-4 py-2"
          value={walletAddress}
          onChange={(e) => setWalletAddress(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchVotes()}
        />
        <button
          onClick={fetchVotes}
          className="rounded-md bg-blue-600 px-4 py-2 font-semibold text-white"
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Generate'}
        </button>
      </div>
      <div className="mt-12 w-full max-w-2xl">
        {isLoading && <p className="text-center">Loading on-chain data...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}
        {!isLoading && !error && hasSearched && votes.length === 0 && (
          <p className="text-center text-gray-500">No recent governance votes found for this address.</p>
        )}
        {votes.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold">Recent Governance Votes</h2>
            <ul className="mt-4 space-y-2">
              {votes.map((vote) => (
                <li key={vote.id} className="rounded-md border text-white p-3">
                  <p className="font-semibold">{vote.proposal.title}</p>
                  <p className="text-sm text-black-600">In DAO: {vote.space.id}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}