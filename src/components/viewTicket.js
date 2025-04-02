import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import "./css/viewTicket.css"; // Import CSS for pop-up styling

const ViewTicket = ({ event, onClose, nft }) => {
  const [ticketIds, setTicketIds] = useState([]);
  const [history, setHistory] = useState({});
  const [showHistory, setShowHistory] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    const loadTicketIds = async () => {
      try {
        if (!event || !nft) return; // Ensure event and contract exist
  
        const ticketsArray = [];
        const historyData = {};

        for (const tid of event.ticketIds) {
          const ticketData = await nft.getTicket(tid);
          const Owner = await nft.ownerOf(tid); // Fetch the owner of the ticket
          
          const ticket ={
            ticketId:tid,
            eventId:ticketData.eventId,
            seatNum:ticketData.seatNum,
            Price:ticketData.Price,
            isAvailablebid:ticketData.isAvailablebid,
            owner:Owner
          };
          // Add owner information to the ticket object
          ticketsArray.push(ticket);

          const transferEvents = await nft.queryFilter(nft.filters.TransferNFTresale(null, null, tid));
          console.log(transferEvents.map(event => event.args));
          const owners = transferEvents.map(event => event.args.from);
          const prices = transferEvents.map(event => ethers.formatEther(event.args.price)); // Convert from wei to ETH

          historyData[tid] = { owners, prices };
        }
        console.log(historyData);
        setHistory(historyData);
        setTicketIds(ticketsArray);
      } catch (error) {
        console.error("Error loading tickets:", error);
      }
    };
  
    loadTicketIds();
  }, [event, nft]);
  

  const handleShowHistory = (ticket) => {
    setSelectedTicket(ticket);
    setShowHistory(true);
  };

  return (
    <div className="popup">
      <div className="popup-inner">
        <div className="popup-header">
          <h2>Tickets for {event.eventName}</h2>
          <button className="close-btn" onClick={onClose}>X</button>
        </div>
        
        <div className="tickets-list">
          {ticketIds.length > 0 ? (
            ticketIds.map((ticket, i) => (
              <div key={i} className="resale-ticket">
                <p>Owner: <strong>{ticket.owner}</strong></p> 
                <p>Price: <strong>{ethers.formatEther(ticket.Price)} ETH</strong></p>
                <p>Seat No:<strong>{ticket.seatNum}</strong></p>
                <button 
                className={`bid-button ${ticket.isAvailablebid ? "red" : "green"}`}>
                {ticket.isAvailablebid ? "For Bid" : "No Resale"}
                </button>
                <button className="history-button" onClick={() => handleShowHistory(ticket)}>
                <strong>View Ownership History</strong>  
                </button>
              </div>
            ))
          ) : (
            <p>No tickets available</p>
          )}
        </div>
      </div>
       {/* Pop-up for Ownership History */}
       {showHistory && selectedTicket && (
        <div className="popup">
          <div className="popup-inner-owner">
            <div className="popup-header">
              <h2>Ownership History</h2>
              <button className="close-btn" onClick={() => setShowHistory(false)}>X</button>
            </div>
            <div className="history-list">
            {history[selectedTicket.ticketId]?.owners.length > 0 ? (
          history[selectedTicket.ticketId].owners.map((owner, index) => (
            <p className="showOwners" key={index}>
              <strong>Previous Owner:</strong> {owner} <br />
              <strong>Price Bought:</strong> {history[selectedTicket.ticketId].prices[index]} ETH
            </p>
          ))
        ) : (
          <p>No previous owners found</p>
        )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewTicket;
