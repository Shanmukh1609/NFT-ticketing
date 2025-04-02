import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ethers } from "ethers";
import toast, { Toaster } from "react-hot-toast";
import "./css/user.css";
import config from "../config.json";
import NFTminting from "../abis/NFTminting.json";

const UserDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { acc } = location.state || {};

  const [events, setEvents] = useState([]);
  const [ticketsMap, setTicketsMap] = useState({});
  const [nft, setNft] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [resalePrice, setResalePrice] = useState("");

  useEffect(() => {
    const loadContract = async () => {
      if (!window.ethereum || !acc) return;
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const network = await provider.getNetwork();
        const chainId = Number(network.chainId);
        
        if (!config[chainId]?.organiser?.address) return;

        const contract = new ethers.Contract(
          config[chainId].organiser.address,
          NFTminting.abi,
          signer
        );
        setNft(contract);
      } catch (error) {
        console.error("Error loading contract:", error);
      }
    };
    loadContract();
  }, []);

  useEffect(() => {
    if (!nft) return;
    
    const loadEvents = async () => {
      try {
        const Buyer = await nft.getBuyer(acc);
        if (!Buyer || !Buyer.ticketIds.length) {
          toast.error("No tickets found for this account.");
          return;
        }
        
        const eventMap = {};
        const ticketsByEvent = {};

        for (const tid of Buyer.ticketIds) {
          const tkt = await nft.getTicket(tid);
          if (!tkt) continue;

          const eve = await nft.getevent(Number(tkt.eventId));
          if (!eve) continue;
          
          if (!eventMap[eve.eventId]) {
            eventMap[eve.eventId] = {
              eventId: eve.eventId,
              eventName: eve.eventName,
              venue: eve.venue,
              uri: eve.uri,
              tickets: [],
              priceCap:eve.resalePrice,
            };
          }
          
          eventMap[eve.eventId].tickets.push({
            ticketId: tid,
            seatNum: tkt.seatNum,
          });
        }
        
        setEvents(Object.values(eventMap));
        setTicketsMap(eventMap);
      } catch (error) {
        console.error("Error loading events:", error);
      }
    };
    loadEvents();
  }, [nft]);

  const openResaleModal = (eventId) => {
    setSelectedEventId(eventId);
    setShowModal(true);
  };

  const handleResale = async () => {
    if (!selectedTicketId || !resalePrice || !nft) {
      toast.error("Please enter a valid price");
      return;
    }
    try {
      const eth = ethers.parseEther(resalePrice);
      const tx = await nft.resaleNFT(selectedTicketId, eth, acc);
      await tx.wait();
      toast.success("Ticket listed for resale!");
    } catch (error) {
      console.error("Resale Error:", error);
      toast.error("Resale failed!");
    }
    setShowModal(false);
    setResalePrice("");
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">USER DASHBOARD</h1>
      
      <div className="event-list">
        {events.length > 0 ? (
          events.map((event) => (
            <div className="event-card" key={event.eventId}>
              <img src={`https://gateway.pinata.cloud/ipfs/${event.uri}`}
            alt={event.eventName} className="event-image" />
              <div className="event-details">
                <h3>{event.eventName}</h3>
                <p>{event.venue}</p>
                <p>{event.priceCap}</p>
                <button className="resell-btn" onClick={() => openResaleModal(event.eventId)}>
                  Resell Ticket
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No tickets found.</p>
        )}
      </div>

      {showModal && selectedEventId && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Select Ticket for Resale <span>price Cap:{ticketsMap[selectedEventId].priceCap}</span> </h2>
            <select onChange={(e) => setSelectedTicketId(e.target.value)}>
              <option value="">Select Ticket</option>
              {ticketsMap[selectedEventId].tickets.map((ticket) => (
                <option key={ticket.ticketId} value={ticket.ticketId}>
                  Ticket ID: {ticket.ticketId} - Seat: {ticket.seatNum}
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Enter price in ETH"
              value={resalePrice}
              onChange={(e) => setResalePrice(e.target.value)}
            />
            <button className="confirm-btn" onClick={handleResale}>Confirm</button>
            <button onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </div>
      )}
      
     
      <Toaster />
    </div>
  );
};

export default UserDashboard;