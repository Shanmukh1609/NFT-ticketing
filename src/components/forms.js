import { useState } from 'react';
import { ethers, getAddress } from 'ethers';
import config from '../config.json';
import Organizers from '../abis/Organizers.json';

const OrganizerForm = () => {
    const [organiserName, setOrganiserName] = useState("");
    const [organiserAddress, setOrganiserAddress] = useState("");
    const [organiserEmail, setOrganiserEmail] = useState("");
    const [organiserPassword, setOrganiserPassword] = useState("");
    const [provider, setProvider] = useState(null);
    const [organiser, setOrganiser] = useState(null);

    const register = async (event) => {
        event.preventDefault();

        if (!window.ethereum) {
            alert("MetaMask not found. Please install MetaMask.");
            return;
        }

        console.log("Connecting ...");

        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const Account = getAddress(accounts[0]); // ✅ FIXED

            setOrganiserAddress(Account);
            console.log("Account: ", Account);

            const providerInstance = new ethers.BrowserProvider(window.ethereum); // ✅ FIXED
            setProvider(providerInstance);

            const network = await providerInstance.getNetwork();
            const signer = await providerInstance.getSigner();

            const dappazon = new ethers.Contract(
                config[network.chainId].organiser.address,
                Organizers,
                signer // ✅ Always use signer to send transactions
            );

            setOrganiser(dappazon);

            const transaction = await dappazon.register(organiserName);
            await transaction.wait();

            console.log(await dappazon.members(Account));
        } catch (error) {
            console.error("Error registering:", error);
        }
    };

    return (
        <div>
            <form onSubmit={register}>
                <label>Organiser Name</label>
                <input
                    type="text"
                    value={organiserName}
                    onChange={(e) => setOrganiserName(e.target.value)}
                    required
                />
                
                <label>Organiser Email</label>
                <input
                    type="email"
                    value={organiserEmail}
                    onChange={(e) => setOrganiserEmail(e.target.value)}
                    required
                />
                <label>Organiser Password</label>
                <input
                    type="password"
                    value={organiserPassword}
                    onChange={(e) => setOrganiserPassword(e.target.value)}
                    required
                />
                <button type="submit">Submit</button>
            </form>
        </div>
    );
};

export default OrganizerForm;
