const hre = require("hardhat");
const events  = require("../JSON_FILES/events.json")

async function main() {
    // Get deployer account
    const [deployer,user1,user2,user3,user4] = await hre.ethers.getSigners();

    console.log("Deploying contract with account:", deployer.address);

    // Deploy Organizers contract
    const Nft = await hre.ethers.getContractFactory("NFTminting");
    const nft = await Nft.deploy();
await nft.waitForDeployment(); // Ensures the contract is fully deployed before using it
 // Await deployment here
    // await nft.deployed();

    console.log("nft deployed at:", nft.target); // Use `target` instead of `address`
    const array =[user1,user2,user3,user4];

    for(let i = 0; i < array.length; i++){
        const transaction = await nft.connect(array[i]).newOrganiser(array[i].address);
        await transaction.wait();
        
    }
    console.log("Events",events.length);
   
    for(let i=0;i<events.length;i++){
        const transaction = await nft.connect(user1).newEvent(
            user1.address,
            events[i].eventName,
            events[i].uri,
            events[i].eventDescription,
            events[i].venue,
            events[i].price,
            events[i].totalTickets,
            events[i].priceCap
        );
        await transaction.wait();
    }

   console.log("Contract deployed to:", nft.target);


}

// Run the script and handle errors properly
main().catch((error) => {
    console.error("Error in deployment:", error);
    process.exitCode = 1;
});


