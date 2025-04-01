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

  const [eventss, setEventss] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [nft, setNft] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [resalePrice, setResalePrice] = useState("");

  useEffect(() => {
    const loadContract = async () => {
      if (!window.ethereum) {
        console.error("MetaMask is not installed!");
        return;
      }
      if (!acc) {
        console.log("No wallet address provided.");
        return;
      }

      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const network = await provider.getNetwork();
        const chainId = Number(network.chainId);

        if (!config[chainId]?.organiser?.address) {
          console.error("Contract address not found for this network!");
          return;
        }

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

        const tktArray = [];
        const eventArray = [];

        for (const tid of Buyer.ticketIds) {
          const tkt = await nft.getTicket(tid);
          if (!tkt) continue;

          tktArray.push(tkt);
          const eve = await nft.getevent(Number(tkt.eventId));
          if (eve) eventArray.push(eve);
        }
        setTickets(tktArray);
        setEventss(eventArray);
      } catch (error) {
        console.error("Error loading events:", error);
      }
    };

    loadEvents();
  }, [nft]);

  const openResaleModal = (ticketId) => {
    setSelectedTicketId(ticketId);
    setShowModal(true);
  };

  const handleResale = async () => {
    if (!selectedTicketId || !resalePrice) {
      toast.error("Please enter a valid price");
      return;
    }
    try {
        const eth = ethers.parseEther(resalePrice);
      const tx = await nft.resaleNFT(selectedTicketId, eth,acc);
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
      <div className="event-header">
        <span>EVENT NAME</span>
        <span>TICKET ID</span>
      </div>
      <div className="event-list">
        {tickets.length > 0 && eventss.length > 0 ? (
          tickets.map((ticket, index) => (
            <div className="event-item" key={index}>
              <span className="event-name">{eventss[index]?.eventName || "Unknown Event"}</span>
              <span className="ticket-id">#{ticket?.ticketId || "N/A"}</span>
              <button className="view-ticket-btn">View ticket</button>
              <button className="resell-btn" onClick={() => openResaleModal(ticket.ticketId)}>Resell</button>
            </div>
          ))
        ) : (
          <p>No tickets found.</p>
        )}
      </div>
      <button className="home-btn" onClick={() => navigate("/")}>Home</button>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Set Resale Price</h2>
            <input
              type="number"
              placeholder="Enter price in ETH"
              value={resalePrice}
              onChange={(e) => setResalePrice(e.target.value)}
            />
            <button onClick={handleResale}>Confirm</button>
            <button onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </div>
      )}

      <Toaster />
    </div>
  );
};

export default UserDashboard;
