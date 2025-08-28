// src/components/Header.tsx

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Link } from 'react-router-dom';
import './Header.css'; // We'll create this file next

export function Header() {
  return (
      <header className="header">
            <Link to="/" className="logo">
                    💧 Raindrop
                          </Link>
                                <nav className="navLinks">
                                        <Link to="/">Home</Link>
                                                <Link to="/create">Create Raindrop</Link>
                                                      </nav>
                                                            <div className="connectButtonContainer">
                                                                    <ConnectButton />
                                                                          </div>
                                                                              </header>
                                                                                );
                                                                                }