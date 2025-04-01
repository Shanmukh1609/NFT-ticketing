import React, { useState } from "react";
import "./css/buyTicket.css";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import toast, { Toaster } from "react-hot-toast";

const BuyTicket = ({ event, onClose, nft }) => {
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);

  const buyHandlerOrg = async (eve) => {
    try {
      if (!nft) {
        toast.error("Problem in loading the SC");
        return;
      }

      // Check if Metamask is installed
      if (!window.ethereum) {
        toast.error("Please install Metamask to continue!");
        return;
      }

      // Request account from Metamask
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const acc = accounts[0]; // Correct way to get the address
      setAccount(acc);

      const ticketPriceInETH = ethers.parseEther(eve.ticketPrice.toString());

      // Send ETH along with the transaction
      const tx = await nft.createNFTticket(acc, eve.eventId, {
        from: acc, // Ensures transaction is from the buyer
        value: ticketPriceInETH, // Sends ETH from the user’s wallet
      });

      await tx.wait();
      toast.success("Ticket successfully purchased!");
    } catch (error) {
      toast.error("Problem in buying the NFT");
      console.error("Error:", error);
    }
  };

  if (!event) return null; // Prevents errors if no event is selected

  return (
    <div className="popup">
      <div className="popup-inner">
        <div className="event-header">
          <h1 className="event-name">{event.eventName}</h1>
          <button className="close-btn" onClick={onClose}>✖</button>
        </div>

        <div className="organiser-info">
          <p>Organiser: {event.orgAddress}</p>
          <div className="ticket-details">
            <div className="ticket-item">
              <p>Tickets Available: {event.totalTickets - event.ticketsSold}</p>
            </div>
            <div className="ticket-item">
              <p>Price (per ticket): {event.ticketPrice.toString()} ETH</p>
            </div>
            <button className="buy-button" onClick={() => buyHandlerOrg(event)}>BUY</button>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
};

export default BuyTicket;
