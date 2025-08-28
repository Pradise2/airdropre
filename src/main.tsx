// src/main.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

import { BrowserRouter } from 'react-router-dom';
import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
// CHANGE 1: Import the Base mainnet
import { base } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const projectId = import.meta.env.VITE_RAINBOWKIT_PROJECT_ID;
if (!projectId) {
  throw new Error("VITE_RAINBOWKIT_PROJECT_ID is not set. Please add it to your .env.local file");
  }

  const config = getDefaultConfig({
    appName: 'Raindrop dApp',
      projectId: projectId,
        // CHANGE 2: Set the chain to Base mainnet
          chains: [base],
            ssr: false, // This should be false for Vite (client-side) apps
            });

            const queryClient = new QueryClient();

            ReactDOM.createRoot(document.getElementById('root')!).render(
              <React.StrictMode>
                  <WagmiProvider config={config}>
                        <QueryClientProvider client={queryClient}>
                                <RainbowKitProvider>
                                          <BrowserRouter>
                                                      <App />
                                                                </BrowserRouter>
                                                                        </RainbowKitProvider>
                                                                              </QueryClientProvider>
                                                                                  </WagmiProvider>
                                                                                    </React.StrictMode>,
                                                                                    );