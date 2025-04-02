import React, { useState ,useEffect} from "react";
import "./css/buyTicket.css";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import toast, { Toaster } from "react-hot-toast";

const BuyTicket = ({ event, onClose, nft }) => {
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [resaleTickets,setResaleTickets] = useState(null);


  useEffect(()=>{
 
   const resaleOfTickets= async ()=>
    { 
      
      try{
  
    
   
    let tkts = [];

    for (const tid of event.ticketIds){
      const reticket = await nft.getTicket(tid);
      if(reticket.isAvailablebid)
       {  const owner = await nft.ownerOf(tid);
        console.log(owner);
        const ticket = {
          ticketId:reticket.ticketId,
          seatNum:reticket.seatNum,
          Price:reticket.Price,
          Owner:owner
        }
        
        tkts.push(ticket); }
    }
    setResaleTickets(tkts);
  }
  catch(error){
    console.log("There is an error", error);
  }
}

resaleOfTickets();
  },[]);

  const buyHandlerOrg = async () => {
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
      console.log("fjg");
      // Request account from Metamask
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const acc = accounts[0]; // Correct way to get the address
      setAccount(acc);
      console.log(event);

      const ticketPriceInETH = ethers.parseEther(event.ticketPrice.toString());

      // Send ETH along with the transaction
      const tx = await nft.createNFTticket(acc, event.eventId, {
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
  
  const buyResaleTicket= async(ticket)=>{
    try{
    if(!ticket){
      console.log("Error in ticket");
      toast.error("error");
    }
    else{
      
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const acc = accounts[0]; // Correct way to get the address
      setAccount(acc);

       const ticketPriceInETH = ethers.parseEther(ticket.Price.toString());
       const ownedBy = nft.ownerOf(ticket.ticketId);
       const tx = await nft.transferNFT(acc,ticket.ticketId,{
        from: ownedBy, // Ensures transaction is from the buyer
        value: ticketPriceInETH, // Sends ETH from the user’s wallet
      });

      await tx.wait();
      toast.success("Ticket successfully purchased!");

    }}
    catch(error){
      console.log(error);
      toast.error("Error in resale");
    }

  }

  if (!event) return null; // Prevents errors if no event is selected

  return (
    <div className="popup">
    <div className="popup-inner">
      <button className="close-btn" onClick={onClose}>✖</button>
      <h1 className="popup-event-title">{event.eventName}</h1>
      <div className="popup-content">
        {/* LEFT COLUMN - Event Image & Details */}
        <div className="popup-left">
          <img
            src={`https://gateway.pinata.cloud/ipfs/${event.uri}`}
            alt={event.eventName}
            className="popup-event-image"
          />
          
          <p className="popup-event-details">
         <span> <strong>Org Address:</strong>{event.orgAddress}</span>
         <span> <strong>Venue:</strong> {event.venue} </span>
         <span> <strong>Tickets Available:</strong> {event.totalTickets - event.ticketsSold} </span>
         <span> <strong>Description:</strong>{event.eventDescription} </span>

          </p>
          

        </div>

        {/* RIGHT COLUMN - Prices */}
        <div className="popup-right">
          <h3 className="pop-right-head">Organiser</h3>
             <div  className="resale-ticket">
               
                <p>Price: {event.ticketPrice} ETH</p>
                <button className="resale-buy-btn" onClick={buyHandlerOrg}>BUY</button>
              </div>

          <h3 className="pop-right-head">Resale Tickets</h3>
          <div className="resale-tickets">
            {resaleTickets?.map((ticket, i) => (
              <div key={i} className="resale-ticket">
                {/* <p>Seller: {ticket.seller}</p> */}
                <p>Owner:<strong> {ticket.Owner ? `${ticket.Owner.slice(0, 10)}...${ticket.Owner.slice(-10)}` : "Loading..."}</strong></p>
                <p>Price: <strong>{ethers.formatEther(ticket.Price)} ETH</strong></p>
                <p>Seat No:<strong>{ticket.seatNum}</strong></p>
                
                <button className="resale-buy-btn" onClick={()=>buyResaleTicket(ticket)}>BUY</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);
};

export default BuyTicket;
