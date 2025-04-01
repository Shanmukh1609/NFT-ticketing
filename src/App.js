import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import OrgDashboard from "./components/orgDashboard";
import NFTEvents from "./components/events";
import UserDashboard from "./components/users";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// ABIs
import NFTminting from "./abis/NFTminting.json";
import config from "./config.json";
import AddEvent from "./components/addEvent";

const App = () => {
  const [provider, setProvider] = useState(null);
  const [nft, setNft] = useState(null);

  useEffect(() => {
    const loadContract = async () => {
      if (!window.ethereum) {
        console.error("MetaMask is not installed!");
        return;
      }

      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const network = await provider.getNetwork();
        const chainId = Number(network.chainId); // Convert BigInt to Number

        console.log("Connected to network:", chainId);
        setProvider(provider);

        if (!config[chainId]) {
          console.error("Unsupported network!");
          return;
        }

        const NFT = new ethers.Contract(
          config[chainId].organiser.address, // Use converted chainId
          NFTminting.abi,
          signer
        );

        console.log("Contract Address:", config[chainId]?.organiser?.address);

        const eventCount = await NFT.getEventCount();
        console.log("Event Count:", eventCount.toString());

        setNft(NFT);
      } catch (error) {
        console.error("Error loading contract:", error);
      }
    };

    loadContract();
  }, []);

  return (
    <Router>
      <div>
      
        <Routes>
          {/* ✅ Pass nft as a prop */}
          <Route path="/" element={<NFTEvents nft={nft} />} />
          <Route path="/organiser" element={<OrgDashboard nft={nft} />} />
          <Route path="/addEvent" element={<AddEvent nft={nft} />} />
          <Route path="/user" element={<UserDashboard nft={nft} />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
