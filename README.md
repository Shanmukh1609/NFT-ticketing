# NFT Based Event Ticketing System

The traditional ticketing system faces issues like fraud, scalping, lack of transparency, and limited control over resale. Fake or forged tickets and inflated prices in secondary markets weaken trust and fairness. An NFT-based ticketing system solves these problems by minting unique, tamper-proof tickets on a blockchain. It ensures authenticity, secure ownership verification, transparent transactions, and controlled resale through smart contracts. Additionally, it reduces environmental impact by eliminating paper tickets, offering a sustainable and efficient solution for events.


______

## Instructions to run the code

### Make sure to have latest version of #Node JS 

To install all the suitable packages run
```shell
npm install  
```
Compile the Smart Contracts
```shell
npx hardhat compile
```
Run the local Hardhat network
```shell
npx hardhat node
```

Deploy the smart contract
```shell
npx hardhat run ./deploy/deploy.js --network localhost
```
