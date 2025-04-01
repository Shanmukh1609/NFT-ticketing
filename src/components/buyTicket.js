import React from "react";
import "./css/buyTicket.css";
import { useNavigate } from "react-router-dom";

const BuyTicket = ({ event, onClose }) => {
  const navigate = useNavigate();

  if (!event) return null; // Prevents errors if no event is selected

  return (
    <div className="popup">
      <div className="popup-inner">
        <div className="event-header">
          <h1 className="event-name">{event.eventName}</h1>
          <button className="close-btn" onClick={onClose}>✖</button> {/* Close popup button */}
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
            <button className="buy-button" onClick={() => navigate("/booking-form")}>BUY</button>
          </div>
        </div>

        {/* Resale Tickets Section */}
        {event.ticketIds.length > 0 && (
          <div className="resale-tickets">
            <h2>Resale Tickets</h2>
            <div className="resale-header">
              <p>Wallet Address</p>
              <p>Price</p>
            </div>
            <div className="resale-items">
              {event.ticketIds.slice(0, 3).map((ticketId, index) => (
                <div className="resale-item" key={index}>
                  <p>0xAbc...{ticketId}</p> {/* Placeholder Wallet */}
                  <p>{event.resalePrice.toString()} ETH</p>
                  <button className="buy-button" >BUY</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyTicket;
