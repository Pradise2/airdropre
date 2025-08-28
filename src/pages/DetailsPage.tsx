// src/pages/DetailsPage.tsx (Corrected and Improved)

import { useParams } from 'react-router-dom';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatUnits, isAddress, BaseError } from 'viem';
import React, { useState, useEffect } from 'react';

import { raindropContractAddress, raindropContractABI, erc20ABI } from '../contracts/info';
import './DetailsPage.css';

// --- Best Practice: Re-usable Error Handling Utility ---
function getErrorMessage(error: unknown): string {
    if (!error) return "An unknown error occurred.";
    if (error instanceof BaseError) {
        const rootCause = error.walk();
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

export function DetailsPage() {
    const { id: raindropId } = useParams();
    const { address } = useAccount();

    const [participantsToAdd, setParticipantsToAdd] = useState('');

    // --- Step 1: Fetch the core details of the raindrop ---
    const { data: details, isLoading: isLoadingDetails, refetch: refetchDetails } = useReadContract({
        address: raindropContractAddress,
        abi: raindropContractABI,
        functionName: 'getRaindropDetails',
        args: [raindropId!],
        // FIX 1: 'enabled' must be nested inside the 'query' object
        query: {
            enabled: !!raindropId,
        }
    });

    // Destructure token address for the next hook
    const tokenAddress = details?.[1];

    // --- Step 2: Fetch the decimals for the specific token, enabled only AFTER we have the token address ---
    const { data: tokenDecimals, isLoading: isLoadingDecimals } = useReadContract({
        address: tokenAddress,
        abi: erc20ABI,
        functionName: 'decimals',
        query: {
            enabled: !!tokenAddress,
        }
    });

    const { data: hash, writeContract, isPending, error } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

    useEffect(() => {
        if (isConfirmed) {
            alert("Transaction successful!");
            refetchDetails(); // Refetch details to update the UI
        }
    }, [isConfirmed, refetchDetails]);

    const handleExecute = () => {
        writeContract({
            address: raindropContractAddress,
            abi: raindropContractABI,
            functionName: 'executeRaindrop',
            args: [raindropId!],
        });
    };

    const handleCancel = () => {
        writeContract({
            address: raindropContractAddress,
            abi: raindropContractABI,
            functionName: 'cancelRaindrop',
            args: [raindropId!],
        });
    };

    const handleAddParticipants = () => {
        // IMPROVEMENT: Use isAddress for robust validation
        const addresses = participantsToAdd
            .split(/[\s,]+/)
            .filter(addr => isAddress(addr));

        if (addresses.length === 0) {
            alert("Please enter at least one valid Ethereum address.");
            return;
        }

        writeContract({
            address: raindropContractAddress,
            abi: raindropContractABI,
            functionName: 'addParticipants',
            args: [raindropId!, addresses],
        });
    };

    if (isLoadingDetails) return <p>Loading details...</p>;
    if (!details) return <p>Could not find details for raindrop: {raindropId}</p>;

    const [host, token, totalAmount, scheduledTime, executed, cancelled, participantCount] = details;
    const isHost = address === host;
    const executionDate = new Date(Number(scheduledTime) * 1000);
    const canExecute = !executed && !cancelled && new Date() > executionDate;

    const isLoading = isPending || isConfirming;

    return (
        <div className="detailsContainer">
            <h2>Raindrop: {raindropId}</h2>

            <div className="detailsGrid">
                <div><strong>Status:</strong></div>
                <div>
                    {executed ? <span className="status executed">Executed</span> :
                     cancelled ? <span className="status cancelled">Cancelled</span> :
                     <span className="status scheduled">Scheduled</span>}
                </div>

                <div><strong>Host:</strong></div>
                <div>{host}</div>

                <div><strong>Token:</strong></div>
                <div>{token}</div>

                <div><strong>Total Amount:</strong></div>
                <div>
                    {/* FIX 2: Use fetched tokenDecimals instead of hardcoded 18 */}
                    {isLoadingDecimals ? 'Loading...' : (
                        tokenDecimals !== undefined ? formatUnits(totalAmount, tokenDecimals) : 'N/A'
                    )}
                </div>

                <div><strong>Scheduled Time:</strong></div>
                <div>{executionDate.toLocaleString()}</div>
                
                <div><strong>Participants:</strong></div>
                <div>{participantCount.toString()}</div>
            </div>

            {isHost && !executed && !cancelled && (
                <div className="managementSection">
                    <h3>Manage Raindrop</h3>
                    <div className="actionButtons">
                        <button onClick={handleExecute} disabled={!canExecute || isLoading}>
                            {isLoading ? 'Processing...' : 'Execute Raindrop'}
                        </button>
                        <button onClick={handleCancel} disabled={isLoading} className="cancelButton">
                            {isLoading ? 'Processing...' : 'Cancel Raindrop'}
                        </button>
                    </div>
                    {!canExecute && <small>You can execute this raindrop after the scheduled time has passed.</small>}

                    <div className="addParticipants">
                        <h4>Add Participants</h4>
                        <textarea
                            rows={5}
                            placeholder="Paste addresses here, separated by spaces or commas."
                            value={participantsToAdd}
                            onChange={(e) => setParticipantsToAdd(e.target.value)}
                        />
                        <button onClick={handleAddParticipants} disabled={isLoading}>
                            {isLoading ? 'Processing...' : 'Add Participants'}
                        </button>
                    </div>
                </div>
            )}

            {/* FIX 3: Use the safe getErrorMessage utility */}
            {error && <p className="error">Error: {getErrorMessage(error)}</p>}
        </div>
    );
}