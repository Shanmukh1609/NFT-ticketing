import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import CryptoJS from "crypto-js";
import toast, { Toaster } from "react-hot-toast";
import { ethers } from "ethers";
import NFTminting from "../abis/NFTminting.json";
import config from "../config.json";
import './css/verifyQR.css'
const SECRET_KEY = "NFT-Ticketing-By-IIIT_Dharwad";

const VerifyQR = () => {
  const [searchParams] = useSearchParams();
  const [ticketData, setTicketData] = useState(null);
  const [trueOwner,setTrueOwner] = useState(false);
  const [provider, setProvider] = useState(null);
  const [nft, setNft] = useState(null);
  const [eventName,setEventName] = useState('');


  useEffect(() => {
    const loadContract = async () => {
      if (!window.ethereum) {
        console.error("MetaMask is not installed!");
        return;
      }

      try {
        const provideri = new ethers.BrowserProvider(window.ethereum);
        const signer = await provideri.getSigner();
        const network = await provideri.getNetwork();
        const chainId = Number(network.chainId); // Convert BigInt to Number

        console.log("Connected to network:", chainId);
        setProvider(provideri);

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

  useEffect(() => {
    const qrVerify= async()=>{ const encryptedData = searchParams.get("data");
    if (encryptedData) {
      try {
        const decryptedBytes = CryptoJS.AES.decrypt(decodeURIComponent(encryptedData), SECRET_KEY);
        const decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);
        const parsed = JSON.parse(decryptedText);
        setTicketData(parsed);
        if(!nft){
            console.log("no nft");
            toast.error("Error in verification process");
            return;
        }

        const ownedBy = await nft.ownerOf(parsed.tokenId);
        if(ownedBy === parsed.wallet){
        setTrueOwner(true);
          toast.success("True Owner, Verified Successfully");
          const eve = await nft.getevent(parsed.eventNum);
          setEventName(eve.eventName);
        }
       else{
        toast.error("Verification failed, Incorrect Owner");    
       }
      } catch (err) {
        console.error("Decryption failed:", err);
      }
    }}
    qrVerify();
  }, [nft,searchParams]);

  const shortenAddress = (addr) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };


  return (
    <div className="verify-container">
      <div className="verify-card">
        <h1 className="verify-heading">QR Ticket Verification</h1>
  
        {ticketData ? (
          <>
            <div
              className={`status-badge ${
                trueOwner === true
                  ? "status-success"
                  : trueOwner === false
                  ? "status-failure"
                  : "status-neutral"
              }`}
            >
              {trueOwner === true
                ? "✅ Verified: True Owner"
                : trueOwner === false
                ? "❌ Verification Failed"
                : "Verifying..."}
            </div>
  
            <div className="event-info">
            <h4> <strong>{eventName}</strong></h4>
              <p><span className="label">🎟 Wallet:</span> <strong>{shortenAddress(ticketData.wallet)}</strong></p>
              <p><span className="label">🪑 Seat No:</span> <strong>{ticketData.seatNum}</strong></p>
            </div>
          </>
        ) : (
          <p className="loading-message">Loading or invalid QR...</p>
        )}
  
        <Toaster />
      </div>
    </div>
  );
  
};

export default VerifyQR;
