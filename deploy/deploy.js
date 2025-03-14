const hre = require("hardhat");

async function main() {
    // Get deployer account
    const [deployer] = await hre.ethers.getSigners();

    console.log("Deploying contract with account:", deployer.address);

    // Deploy Organizers contract
    const Organiser = await hre.ethers.getContractFactory("Organizers");
    const organiser = await Organiser.deploy(); // Await deployment here

    console.log("Organiser deployed at:", organiser.target); // Use `target` instead of `address`
}

// Run the script and handle errors properly
main().catch((error) => {
    console.error("Error in deployment:", error);
    process.exitCode = 1;
});
