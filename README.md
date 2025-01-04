# Solana Wallet Balance Tracker  

A simple yet powerful Node.js Web App to track token balances and net worth of any Solana wallet.  

---

## Features  
- **Real-Time Token Balances**: Fetches and displays token balances for any given Solana wallet address.  
- **Net Worth Calculation**: Calculates the wallet’s total value in **USD** and **IDR**, based on real-time token prices.  
- **Token Price Integration**: Uses APIs like GeckoTerminal and CoinGecko to retrieve token prices and currency exchange rates.  
- **Blockchain Interaction**: Leverages **@solana/web3.js** to interact directly with the Solana blockchain.  
- **Clean UI**: Utilizes **EJS** templates for dynamic rendering and a user-friendly interface.  
- **Modular Design**: Built for scalability and easy integration into larger projects.  

---

## Tech Stack  
- **Backend**: Node.js, Express.js  
- **Blockchain**: @solana/web3.js  
- **Templating**: EJS  
- **APIs**: GeckoTerminal, CoinGecko  

---

## How It Works  
1. Input a Solana wallet address in the application.  
2. The app fetches the wallet's token balances and metadata from the Solana blockchain.  
3. Token prices and exchange rates are retrieved from external APIs.  
4. Displays token details, prices, and net worth in an easy-to-read format.  

---

## Installation
1. Clone this repository:  
   ```bash
   git clone https://github.com/yourusername/solana-wallet-balance-tracker.git
   cd solana-wallet-balance-tracker

2. Install dependencies:
   ```bash
   npm install

3. Start the application:
   ```bash
   node app.js

## Screenshots
![image](https://github.com/user-attachments/assets/d7624d19-0551-4bd7-8c0b-2a6d2a1dc068)
![image](https://github.com/user-attachments/assets/7edde784-e9d6-4c4e-8eee-faee8efcf93c)


