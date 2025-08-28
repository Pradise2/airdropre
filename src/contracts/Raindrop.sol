// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title RaindropEscrow (V2)
 * @author Your Name/Company
 * @dev Smart contract for escrowing tokens and executing gas-efficient batch transfers.
 * This contract improves upon the basic escrow model by:
 * 1. Locking funds at scheduling time to guarantee availability.
 * 2. Enabling batched transfers in a single transaction to save gas.
 * 3. Providing atomic execution for reliability.
 * 4. Introducing granular and gas-safe participant management functions.
 * 5. Using custom errors and other optimizations for maximum efficiency.
 */
contract RaindropEscrow is ReentrancyGuard, Ownable(msg.sender) {
    using SafeERC20 for IERC20;

    // --- Constants ---
    uint256 public constant MAX_PARTICIPANTS = 1_000_000;
    uint256 public constant MIN_AMOUNT_PER_PARTICIPANT = 100; // Smallest unit (e.g., wei)

    // --- State Variables ---
    uint256 public platformFeeBps; // Platform fee in basis points (10 = 0.1%)
    address public feeRecipient;

    struct Raindrop {
        string raindropId;
        address host;
        address token;
        uint256 totalAmount;
        uint64 scheduledTime; // Packed for gas efficiency
        uint32 participantCount; // Packed for gas efficiency
        bool executed; // Packed for gas efficiency
        bool cancelled; // Packed for gas efficiency
        mapping(address => uint256) participantIndex; // O(1) lookup for existence and index
        address[] participantList;
    }

    mapping(string => Raindrop) public raindrops;

    // --- Custom Errors ---
    error AlreadyExists(string raindropId);
    error NotFound(string raindropId);
    error NotAuthorized();
    error AlreadyExecuted();
    error AlreadyCancelled();
    error InvalidConfiguration(string reason);
    error InvalidInput(string reason);
    error ExecutionFailed(string reason);

    // --- Events ---
    event RaindropCreated(string indexed raindropId, address indexed host, address indexed token, uint256 totalAmount, uint256 scheduledTime);
    event RaindropExecuted(string indexed raindropId, uint256 participantCount, uint256 amountPerParticipant);
    event RaindropCancelled(string indexed raindropId, address indexed host, uint256 refundAmount);
    event ParticipantsAdded(string indexed raindropId, uint256 count);
    event ParticipantsRemoved(string indexed raindropId, uint256 count);
    event ParticipantsCleared(string indexed raindropId);
    event PlatformFeeUpdated(uint256 newFeeBps);
    event FeeRecipientUpdated(address newFeeRecipient);

    // --- Constructor ---
    constructor(address initialFeeRecipient, uint256 initialFeeBps) {
        if (initialFeeRecipient == address(0)) revert InvalidInput("Fee recipient cannot be zero address");
        if (initialFeeBps > 100) revert InvalidInput("Fee cannot exceed 1%"); // Max 1%
        feeRecipient = initialFeeRecipient;
        platformFeeBps = initialFeeBps;
    }

    // --- Core Functions (Host-facing) ---

    /**
     * @dev Creates and funds a new raindrop escrow.
     * @param raindropId A unique identifier for the raindrop.
     * @param token The address of the ERC20 token to be distributed.
     * @param totalAmount The total amount of tokens to escrow.
     * @param scheduledTime The UNIX timestamp when the raindrop can be executed.
     */
    function createRaindrop(string calldata raindropId, address token, uint256 totalAmount, uint256 scheduledTime) external nonReentrant {
        if (bytes(raindrops[raindropId].raindropId).length > 0) revert AlreadyExists(raindropId);
        if (token == address(0)) revert InvalidInput("Invalid token address");
        if (totalAmount == 0) revert InvalidInput("Amount must be greater than 0");
        if (scheduledTime <= block.timestamp) revert InvalidInput("Scheduled time must be in the future");

        Raindrop storage newRaindrop = raindrops[raindropId];
        newRaindrop.raindropId = raindropId;
        newRaindrop.host = msg.sender;
        newRaindrop.token = token;
        newRaindrop.scheduledTime = uint64(scheduledTime);
        
        IERC20(token).safeTransferFrom(msg.sender, address(this), totalAmount);
        newRaindrop.totalAmount = totalAmount;

        emit RaindropCreated(raindropId, msg.sender, token, totalAmount, scheduledTime);
    }

    /**
     * @dev Adds a list of participants to a raindrop. Can be called in batches.
     * @param raindropId The identifier of the raindrop.
     * @param newParticipants An array of participant addresses to add.
     */
    function addParticipants(string calldata raindropId, address[] calldata newParticipants) external {
        Raindrop storage raindrop = raindrops[raindropId];
        if (bytes(raindrop.raindropId).length == 0) revert NotFound(raindropId);
        if (msg.sender != raindrop.host && msg.sender != owner()) revert NotAuthorized();
        if (raindrop.executed) revert AlreadyExecuted();
        if (raindrop.cancelled) revert AlreadyCancelled();
        
        uint256 currentCount = raindrop.participantCount;
        if (currentCount + newParticipants.length > MAX_PARTICIPANTS) revert InvalidInput("Exceeds max participant limit");

        for (uint256 i = 0; i < newParticipants.length; i++) {
            address participant = newParticipants[i];
            if (participant == address(0) || participant == raindrop.host) continue; // Skip invalid addresses
            if (raindrop.participantIndex[participant] == 0) { // 0 indicates not a participant
                raindrop.participantList.push(participant);
                raindrop.participantIndex[participant] = raindrop.participantList.length;
            }
        }
        raindrop.participantCount = uint32(raindrop.participantList.length);
        _validateAmountPerParticipant(raindrop);
        emit ParticipantsAdded(raindropId, raindrop.participantCount - currentCount);
    }

    /**
     * @dev Removes a list of participants from a raindrop.
     * @param raindropId The identifier of the raindrop.
     * @param participantsToRemove An array of participant addresses to remove.
     */
    function removeParticipants(string calldata raindropId, address[] calldata participantsToRemove) external {
        Raindrop storage raindrop = raindrops[raindropId];
        if (bytes(raindrop.raindropId).length == 0) revert NotFound(raindropId);
        if (msg.sender != raindrop.host && msg.sender != owner()) revert NotAuthorized();
        if (raindrop.executed) revert AlreadyExecuted();
        if (raindrop.cancelled) revert AlreadyCancelled();

        uint256 removedCount = 0;
        for (uint256 i = 0; i < participantsToRemove.length; i++) {
            address participant = participantsToRemove[i];
            uint256 index = raindrop.participantIndex[participant];

            if (index > 0) { // If participant exists
                address lastParticipant = raindrop.participantList[raindrop.participantList.length - 1];
                raindrop.participantList[index - 1] = lastParticipant; // Move last element to the removed spot
                raindrop.participantIndex[lastParticipant] = index; // Update index of moved element
                
                raindrop.participantList.pop();
                delete raindrop.participantIndex[participant];
                removedCount++;
            }
        }
        raindrop.participantCount -= uint32(removedCount);
        emit ParticipantsRemoved(raindropId, removedCount);
    }

    /**
     * @dev Clears all participants from a raindrop.
     * @param raindropId The identifier of the raindrop.
     */
    function clearParticipants(string calldata raindropId) external {
        Raindrop storage raindrop = raindrops[raindropId];
        if (bytes(raindrop.raindropId).length == 0) revert NotFound(raindropId);
        if (msg.sender != raindrop.host && msg.sender != owner()) revert NotAuthorized();
        if (raindrop.executed) revert AlreadyExecuted();
        if (raindrop.cancelled) revert AlreadyCancelled();

        for (uint256 i = 0; i < raindrop.participantList.length; i++) {
            delete raindrop.participantIndex[raindrop.participantList[i]];
        }
        delete raindrop.participantList;
        raindrop.participantCount = 0;
        emit ParticipantsCleared(raindropId);
    }
    
    /**
     * @dev Executes the raindrop, distributing tokens to all participants.
     * @param raindropId The identifier of the raindrop to execute.
     */
    function executeRaindrop(string calldata raindropId) external nonReentrant {
        Raindrop storage raindrop = raindrops[raindropId];
        if (bytes(raindrop.raindropId).length == 0) revert NotFound(raindropId);
        if (msg.sender != raindrop.host && msg.sender != owner()) revert NotAuthorized();
        if (raindrop.executed) revert AlreadyExecuted();
        if (raindrop.cancelled) revert AlreadyCancelled();
        if (block.timestamp < raindrop.scheduledTime) revert ExecutionFailed("Too early to execute");
        if (raindrop.participantCount == 0) revert ExecutionFailed("No participants in the raindrop");
        if (feeRecipient == address(0) && platformFeeBps > 0) revert InvalidConfiguration("Fee recipient not set");

        raindrop.executed = true; // Prevent reentrancy

        uint256 platformFee = (raindrop.totalAmount * platformFeeBps) / 10000;
        uint256 totalToDistribute = raindrop.totalAmount - platformFee;
        uint256 amountPerParticipant = totalToDistribute / raindrop.participantCount;
        uint256 totalDistributed = amountPerParticipant * raindrop.participantCount;
        uint256 remainder = totalToDistribute - totalDistributed;

        IERC20 token = IERC20(raindrop.token);

        for (uint256 i = 0; i < raindrop.participantCount; i++) {
            token.safeTransfer(raindrop.participantList[i], amountPerParticipant);
        }

        if (platformFee > 0) {
            token.safeTransfer(feeRecipient, platformFee);
        }

        if (remainder > 0) {
            token.safeTransfer(raindrop.host, remainder);
        }

        emit RaindropExecuted(raindropId, raindrop.participantCount, amountPerParticipant);
    }

    /**
     * @dev Cancels a raindrop and refunds the entire escrowed amount to the host.
     * @param raindropId The identifier of the raindrop to cancel.
     */
    function cancelRaindrop(string calldata raindropId) external nonReentrant {
        Raindrop storage raindrop = raindrops[raindropId];
        if (bytes(raindrop.raindropId).length == 0) revert NotFound(raindropId);
        if (msg.sender != raindrop.host && msg.sender != owner()) revert NotAuthorized();
        if (raindrop.executed) revert AlreadyExecuted();
        if (raindrop.cancelled) revert AlreadyCancelled();

        raindrop.cancelled = true;
        IERC20(raindrop.token).safeTransfer(raindrop.host, raindrop.totalAmount);

        emit RaindropCancelled(raindropId, raindrop.host, raindrop.totalAmount);
    }

    // --- Getter Functions ---

    function getRaindropDetails(string calldata raindropId) external view returns (address host, address token, uint256 totalAmount, uint256 scheduledTime, bool executed, bool cancelled, uint256 participantCount) {
        Raindrop storage raindrop = raindrops[raindropId];
        if (bytes(raindrop.raindropId).length == 0) revert NotFound(raindropId);
        return (raindrop.host, raindrop.token, raindrop.totalAmount, raindrop.scheduledTime, raindrop.executed, raindrop.cancelled, raindrop.participantCount);
    }

    /**
     * @dev Gets a paginated list of participants for a given raindrop.
     * @param raindropId The identifier of the raindrop.
     * @param cursor The starting index for pagination.
     * @param size The number of participants to return.
     * @return An array of participant addresses.
     */
    function getParticipantsPaginated(string calldata raindropId, uint256 cursor, uint256 size) external view returns (address[] memory) {
        Raindrop storage raindrop = raindrops[raindropId];
        if (bytes(raindrop.raindropId).length == 0) revert NotFound(raindropId);
        
        uint256 length = size;
        if (cursor + size > raindrop.participantCount) {
            length = raindrop.participantCount - cursor;
        }

        address[] memory participants = new address[](length);
        for (uint256 i = 0; i < length; i++) {
            participants[i] = raindrop.participantList[cursor + i];
        }
        return participants;
    }

    // --- Admin Functions ---

    function updatePlatformFee(uint256 newFeeBps) external onlyOwner {
        if (newFeeBps > 100) revert InvalidInput("Fee cannot exceed 1%"); // Max 1%
        platformFeeBps = newFeeBps;
        emit PlatformFeeUpdated(newFeeBps);
    }



    function updateFeeRecipient(address newFeeRecipient) external onlyOwner {
        if (newFeeRecipient == address(0)) revert InvalidInput("Fee recipient cannot be zero address");
        feeRecipient = newFeeRecipient;
        emit FeeRecipientUpdated(newFeeRecipient);
    }

    function emergencyRecoverToken(address token, uint256 amount) external onlyOwner {
        IERC20(token).safeTransfer(owner(), amount);
    }

    // --- Internal Functions ---

    /**
     * @dev Internal function to validate if the amount per participant meets the minimum requirement.
     */
    function _validateAmountPerParticipant(Raindrop storage raindrop) internal view {
        if (raindrop.participantCount > 0) {
            uint256 fee = (raindrop.totalAmount * platformFeeBps) / 10000;
            uint256 distributable = raindrop.totalAmount - fee;
            if (distributable / raindrop.participantCount < MIN_AMOUNT_PER_PARTICIPANT) {
                revert ExecutionFailed("Amount per participant is below minimum");
            }
        }
    }
}