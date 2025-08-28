// src/contracts/info.ts

// TODO: Replace with your deployed contract address
export const raindropContractAddress = '0xc2C674EA471aC90b0e38e0B142f72f6b3a6223c3';

// TODO: Replace with your contract's ABI
// You can get this from your compiled contract artifacts (e.g., in a JSON file)
export const raindropContractABI = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "initialFeeRecipient",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "initialFeeBps",
				"type": "uint256"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [],
		"name": "AlreadyCancelled",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "AlreadyExecuted",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "raindropId",
				"type": "string"
			}
		],
		"name": "AlreadyExists",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "reason",
				"type": "string"
			}
		],
		"name": "ExecutionFailed",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "reason",
				"type": "string"
			}
		],
		"name": "InvalidConfiguration",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "reason",
				"type": "string"
			}
		],
		"name": "InvalidInput",
		"type": "error"
	},
	{
		"inputs": [],
		"name": "NotAuthorized",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "raindropId",
				"type": "string"
			}
		],
		"name": "NotFound",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "OwnableInvalidOwner",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "OwnableUnauthorizedAccount",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "token",
				"type": "address"
			}
		],
		"name": "SafeERC20FailedOperation",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "newFeeRecipient",
				"type": "address"
			}
		],
		"name": "FeeRecipientUpdated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "previousOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "string",
				"name": "raindropId",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "count",
				"type": "uint256"
			}
		],
		"name": "ParticipantsAdded",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "string",
				"name": "raindropId",
				"type": "string"
			}
		],
		"name": "ParticipantsCleared",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "string",
				"name": "raindropId",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "count",
				"type": "uint256"
			}
		],
		"name": "ParticipantsRemoved",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "newFeeBps",
				"type": "uint256"
			}
		],
		"name": "PlatformFeeUpdated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "string",
				"name": "raindropId",
				"type": "string"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "host",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "refundAmount",
				"type": "uint256"
			}
		],
		"name": "RaindropCancelled",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "string",
				"name": "raindropId",
				"type": "string"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "host",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "token",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "totalAmount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "scheduledTime",
				"type": "uint256"
			}
		],
		"name": "RaindropCreated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "string",
				"name": "raindropId",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "participantCount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amountPerParticipant",
				"type": "uint256"
			}
		],
		"name": "RaindropExecuted",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "MAX_PARTICIPANTS",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "MIN_AMOUNT_PER_PARTICIPANT",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "raindropId",
				"type": "string"
			},
			{
				"internalType": "address[]",
				"name": "newParticipants",
				"type": "address[]"
			}
		],
		"name": "addParticipants",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "raindropId",
				"type": "string"
			}
		],
		"name": "cancelRaindrop",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "raindropId",
				"type": "string"
			}
		],
		"name": "clearParticipants",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "raindropId",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "token",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "totalAmount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "scheduledTime",
				"type": "uint256"
			}
		],
		"name": "createRaindrop",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "token",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "emergencyRecoverToken",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "raindropId",
				"type": "string"
			}
		],
		"name": "executeRaindrop",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "feeRecipient",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "raindropId",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "cursor",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "size",
				"type": "uint256"
			}
		],
		"name": "getParticipantsPaginated",
		"outputs": [
			{
				"internalType": "address[]",
				"name": "",
				"type": "address[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "raindropId",
				"type": "string"
			}
		],
		"name": "getRaindropDetails",
		"outputs": [
			{
				"internalType": "address",
				"name": "host",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "token",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "totalAmount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "scheduledTime",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "executed",
				"type": "bool"
			},
			{
				"internalType": "bool",
				"name": "cancelled",
				"type": "bool"
			},
			{
				"internalType": "uint256",
				"name": "participantCount",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "platformFeeBps",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"name": "raindrops",
		"outputs": [
			{
				"internalType": "string",
				"name": "raindropId",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "host",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "token",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "totalAmount",
				"type": "uint256"
			},
			{
				"internalType": "uint64",
				"name": "scheduledTime",
				"type": "uint64"
			},
			{
				"internalType": "uint32",
				"name": "participantCount",
				"type": "uint32"
			},
			{
				"internalType": "bool",
				"name": "executed",
				"type": "bool"
			},
			{
				"internalType": "bool",
				"name": "cancelled",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "raindropId",
				"type": "string"
			},
			{
				"internalType": "address[]",
				"name": "participantsToRemove",
				"type": "address[]"
			}
		],
		"name": "removeParticipants",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "renounceOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newFeeRecipient",
				"type": "address"
			}
		],
		"name": "updateFeeRecipient",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "newFeeBps",
				"type": "uint256"
			}
		],
		"name": "updatePlatformFee",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
] as const; // The "as const" is important for type safety with Wagmi

                                                          // We also need a generic ABI for the ERC20 approve function
                                                          export const erc20ABI = [
                                                            {
                                                                "constant": false,
                                                                    "inputs": [
                                                                          { "name": "spender", "type": "address" },
                                                                                { "name": "value", "type": "uint256" }
                                                                                    ],
                                                                                        "name": "approve",
                                                                                            "outputs": [
                                                                                                  { "name": "", "type": "bool" }
                                                                                                      ],
                                                                                                          "payable": false,
                                                                                                              "stateMutability": "nonpayable",
                                                                                                                  "type": "function"
                                                                                                                    },
                                                                                                                      {
                                                                                                                          "constant": true,
                                                                                                                              "inputs": [
                                                                                                                                    { "name": "owner", "type": "address" }
                                                                                                                                        ],
                                                                                                                                            "name": "balanceOf",
                                                                                                                                                "outputs": [
                                                                                                                                                      { "name": "", "type": "uint256" }
                                                                                                                                                          ],
                                                                                                                                                              "payable": false,
                                                                                                                                                                  "stateMutability": "view",
                                                                                                                                                                      "type": "function"
                                                                                                                                                                        },
                                                                                                                                                                          {
                                                                                                                                                                              "constant": true,
                                                                                                                                                                                  "inputs": [],
                                                                                                                                                                                      "name": "decimals",
                                                                                                                                                                                          "outputs": [
                                                                                                                                                                                                { "name": "", "type": "uint8" }
                                                                                                                                                                                                    ],
                                                                                                                                                                                                        "payable": false,
                                                                                                                                                                                                            "stateMutability": "view",
                                                                                                                                                                                                                "type": "function"
                                                                                                                                                                                                                  }
                                                                                                                                                                                                                  ] as const;