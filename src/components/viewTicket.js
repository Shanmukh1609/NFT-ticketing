import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import "./css/viewTicket.css"; // Import CSS for pop-up styling

const ViewTicket = ({ event, onClose, nft }) => {
  const [ticketIds, setTicketIds] = useState([]);

  useEffect(() => {
    const loadTicketIds = async () => {
      try {
        if (!event || !nft) return; // Ensure event and contract exist
  
        const ticketsArray = [];
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
        }
        console.log(ticketsArray);
  
        setTicketIds(ticketsArray);
      } catch (error) {
        console.error("Error loading tickets:", error);
      }
    };
  
    loadTicketIds();
  }, [event, nft]);
  



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
              </div>
            ))
          ) : (
            <p>No tickets available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewTicket;
