// src/pages/CreatePage.tsx (Fully Corrected)

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseUnits, isAddress, BaseError } from 'viem';
import { useNavigate } from 'react-router-dom';

import { raindropContractAddress, raindropContractABI, erc20ABI } from '../contracts/info';

// --- Best Practice: Robust Error Handling Utility ---
function getErrorMessage(error: unknown): string {
  if (!error) return "An unknown error occurred.";
  
  if (error instanceof BaseError) {
    const rootCause = error.walk();
    // Safely check if 'shortMessage' exists on the object before accessing it
    if ('shortMessage' in rootCause && typeof rootCause.shortMessage === 'string') {
        return rootCause.shortMessage;
    }
    return rootCause.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}


export function CreatePage() {
  const navigate = useNavigate();
  const { isConnected } = useAccount();
  
  const { writeContractAsync, error, isPending } = useWriteContract();

  // State for form inputs
  const [raindropId, setRaindropId] = useState('');
  const [tokenAddress, setTokenAddress] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  
  const [statusMessage, setStatusMessage] = useState('');
  const [approvalHash, setApprovalHash] = useState<`0x${string}` | undefined>();
  const [creationHash, setCreationHash] = useState<`0x${string}` | undefined>();

  const { data: tokenDecimals, isLoading: isFetchingDecimals } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: erc20ABI,
    functionName: 'decimals',
    // ===================================================================
    // FIX 1: 'enabled' must be nested within the 'query' object
    // ===================================================================
    query: {
        enabled: isAddress(tokenAddress), 
    }
  });

  const { isSuccess: isApprovalConfirmed, isLoading: isConfirmingApproval } = useWaitForTransactionReceipt({ hash: approvalHash });
  const { isSuccess: isCreationConfirmed, isLoading: isConfirmingCreation } = useWaitForTransactionReceipt({ hash: creationHash });

  useEffect(() => {
    if (isApprovalConfirmed && tokenDecimals) {
      const handleCreateRaindrop = async () => {
        try {
          setStatusMessage('Creating raindrop... Please confirm in your wallet.');
          const timestamp = Math.floor(new Date(scheduledTime).getTime() / 1000);
          
          const createHash = await writeContractAsync({
            address: raindropContractAddress,
            abi: raindropContractABI,
            functionName: 'createRaindrop',
            args: [
              raindropId,
              tokenAddress as `0x${string}`,
              parseUnits(totalAmount, tokenDecimals),
              BigInt(timestamp)
            ],
          });
          setCreationHash(createHash);
          setStatusMessage('Processing creation transaction...');
        } catch (e) {
          console.error(e);
          setStatusMessage(''); 
        }
      };
      handleCreateRaindrop();
    }
  }, [isApprovalConfirmed, tokenDecimals, navigate, raindropId, scheduledTime, totalAmount, tokenAddress, writeContractAsync]);

  useEffect(() => {
    if (isCreationConfirmed) {
      alert("Raindrop created successfully!");
      navigate(`/raindrop/${raindropId}`);
    }
  }, [isCreationConfirmed, navigate, raindropId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tokenDecimals === undefined) { // Check for undefined instead of just falsy
      alert("Invalid token address or unable to fetch token details. Please check the address and try again.");
      return;
    }
    try {
      setStatusMessage('Requesting approval... Please confirm in your wallet.');
      const approveHash = await writeContractAsync({
        address: tokenAddress as `0x${string}`,
        abi: erc20ABI,
        functionName: 'approve',
        args: [
          raindropContractAddress,
          parseUnits(totalAmount, tokenDecimals),
        ],
      });
      setApprovalHash(approveHash);
      setStatusMessage('Processing approval transaction...');
    } catch (e) {
      console.error(e);
      setStatusMessage(''); 
    }
  };

  if (!isConnected) {
    return <p>Please connect your wallet to create a raindrop.</p>;
  }

  const isLoading = isPending || isConfirmingApproval || isConfirmingCreation;

  return (
    <div>
      <h2>Create a New Raindrop</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label>Raindrop ID (a unique name)</label><br />
          <input type="text" value={raindropId} onChange={(e) => setRaindropId(e.target.value)} required style={{ width: '400px', padding: '0.5rem' }} />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Token Contract Address</label><br />
          <input type="text" value={tokenAddress} onChange={(e) => setTokenAddress(e.target.value)} required style={{ width: '400px', padding: '0.5rem' }} />
          {isFetchingDecimals && <small>Fetching token info...</small>}
          {tokenAddress && isAddress(tokenAddress) && !isFetchingDecimals && tokenDecimals === undefined && <small style={{ color: 'red' }}>Could not find token. Is it a valid ERC20 on this network?</small>}
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Total Amount to Distribute</label><br />
          <input type="number" value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} required style={{ width: '400px', padding: '0.5rem' }} />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Scheduled Execution Time</label><br />
          <input type="datetime-local" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} required style={{ width: '400px', padding: '0.5rem' }}/>
        </div>

        <button type="submit" disabled={isLoading || isFetchingDecimals || tokenDecimals === undefined}>
          {statusMessage || (isLoading ? 'Processing...' : 'Approve & Create Raindrop')}
        </button>
      </form>
      {/* ===================================================================
          FIX 2: Use the safer getErrorMessage utility function
          =================================================================== */}
      {error && <p style={{ color: 'red' }}>Error: {getErrorMessage(error)}</p>}
    </div>
  );
}