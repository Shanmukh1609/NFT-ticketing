import { React, useState, useEffect } from "react";
import { useNavigate, useLocation, Form } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { ethers } from "ethers"; // ✅ Import ethers
import NFTminting from "../abis/NFTminting.json"; // ✅ Ensure ABI is correct
import config from "../config.json"; // ✅ Ensure contract address is defined
import "./css/addEvent.css"; // ✅ Import the CSS
import axios from "axios";
// import { pinata } from "./pinataConfig"


const AddEvent = () => {
  const location = useLocation();
  const { acc } = location.state || {}; // ✅ Extract acc

  const [eventName, setEventName] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [ticketPrice, setTicketPrice] = useState(0);
  const [totalTickets, setTotalTickets] = useState(0);
  const [priceCap, setPriceCap] = useState(0);
  const [venue, setVenue] = useState("");
  const [uri, setURI] = useState("");
  const [img,setImg]=useState("");
  const [nft, setNFT] = useState(null);



  const navigate = useNavigate();

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
        const chainId = Number(network.chainId); // Convert BigInt to Number

        if (!config[chainId]?.organiser?.address) {
          console.error("Contract address not found for this network!");
          return;
        }

        const contract = new ethers.Contract(
          config[chainId].organiser.address,
          NFTminting.abi,
          signer
        );

        console.log("Contract Instance:", contract);
        setNFT(contract);
      } catch (error) {
        console.error("Error loading contract:", error);
      }
    };

    loadContract();
  }, []);

  const newEvent = async () => {
    if (!nft) {
      console.log("NFT contract is not loaded yet.");
      return;
    }

    if (!acc) {
      console.log("No wallet address provided.");
      return;
    }

    const uploadToPinata = async (selectedFile) => {
     
      console.log(process.env.REACT_APP_PINATA_API_KEY);
      try {  
        const fileData = new FormData();
        fileData.append("file",selectedFile);
        const upload = await axios({
          method:"post",
          url:"https://api.pinata.cloud/pinning/pinFileToIPFS",
          data:fileData,
          headers:{
            pinata_api_key:"a4950de3285db968d175",
            pinata_secret_api_key:"037e7b274b95127e45e645b64ee9dbc2e5bbebebeb57f3224f45badd6e519c5f",
            "Content-Type":"multipart/form-data",
          }
        })
        console.log(upload.data.IpfsHash);
        return upload.data.IpfsHash;
      } catch (error) {
        console.error("Error uploading file to Pinata:", error);
        return null;
      }
    };

    try {
      const URI = await uploadToPinata(img);
      console.log(URI);
      setURI(URI);
      const tx = await nft.newEvent(acc, eventName, URI, eventDescription, venue, ticketPrice, totalTickets, priceCap);
      await tx.wait();
      toast.success("Successfully added the Event");
      console.log("Added");
      navigate("/organiser", { state: { acc } });
    } catch (error) {
      toast.error("Error in adding the event");
      console.error("Error:", error);
    }
  };

  
  return (
    <>
      <div className="new-arrival-container">
        <div className="new-arrival-header">
          <h1 className="add-eve"><strong>NEW EVENT</strong></h1>
        </div>

        <div className="new-arrival-form">
          <div className="input-group">
            <label htmlFor="eventName">Event Name</label>
            <input type="text" id="eventName" value={eventName} onChange={(e) => setEventName(e.target.value)} />
          </div>

          <div className="input-group">
            <label htmlFor="venue">Venue</label>
            <input type="text" id="venue" value={venue} onChange={(e) => setVenue(e.target.value)} />
          </div>

          <div className="input-group">
            <label htmlFor="totalTickets">Number of Tickets</label>
            <input type="number" id="totalTickets" value={totalTickets} onChange={(e) => setTotalTickets(Number(e.target.value))} />
          </div>

          <div className="input-group">
            <label htmlFor="ticketPrice">Price of Each Ticket</label>
            <input type="number" id="ticketPrice" value={ticketPrice} onChange={(e) => setTicketPrice(Number(e.target.value))} />
          </div>

          <div className="input-group">
            <label htmlFor="priceCap">Price Cap</label>
            <input type="number" id="priceCap" value={priceCap} onChange={(e) => setPriceCap(Number(e.target.value))} />
          </div>

          <div className="input-group">
          <label htmlFor="image">Image</label>
          <input 
            type="file" 
            id="image" 
            accept="image/*" 
            onChange={(e) => setImg(e.target.files[0])} // Set the selected file
          />
         </div>

          <div className="input-group">
            <label htmlFor="eventDescription">Description</label>
            <input type="text" id="eventDescription" value={eventDescription} onChange={(e) => setEventDescription(e.target.value)} />
          </div>

          <button className="add-button" onClick={newEvent}>
            ADD
          </button>
        </div>
      </div>
      <Toaster />
    </>
  );
};

export default AddEvent;
