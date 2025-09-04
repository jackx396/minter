import React from 'react';
import WalletConnect from './WalletConnect';

const Header = () => {
  return (
    <header className="header">
      <div className="logo">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#5142FC" />
          <path d="M2 17L12 22L22 17V7L12 12L2 7V17Z" fill="#3D30D9" />
        </svg>
        TokenMint
      </div>
      <nav className="nav">
        <a href="#" className="nav-link">Home</a>
        <a href="#" className="nav-link">Docs</a>
        <a href="#" className="nav-link">Support</a>
      </nav>
      <WalletConnect />
    </header>
  );
};

export default Header;