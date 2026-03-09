const hre = require("hardhat");

async function main() {
    console.log("Deploying ProductSupplyChain contract...");

    // Get the contract factory
    const ProductSupplyChain = await hre.ethers.getContractFactory("ProductSupplyChain");

    // Deploy the contract
    const contract = await ProductSupplyChain.deploy();

    await contract.waitForDeployment();

    const address = await contract.getAddress();

    console.log(`ProductSupplyChain deployed to: ${address}`);

    // Save the contract address
    const fs = require("fs");
    const contractData = {
        address: address,
        network: hre.network.name,
        deployedAt: new Date().toISOString()
    };

    fs.writeFileSync(
        "./public/contract-address.json",
        JSON.stringify(contractData, null, 2)
    );

    console.log("Contract address saved to public/contract-address.json");

    // Assign some demo roles (optional, for testing)
    if (hre.network.name === "hardhat" || hre.network.name === "localhost") {
        console.log("\nAssigning demo roles...");
        const [owner, distributor, vendor, hospital] = await hre.ethers.getSigners();

        await contract.assignRole(distributor.address, 2); // DISTRIBUTOR
        await contract.assignRole(vendor.address, 3);    // PHARMACY
        await contract.assignRole(hospital.address, 4);    // HOSPITAL

        console.log(`Distributor role assigned to: ${distributor.address}`);
        console.log(`Vendor role assigned to: ${vendor.address}`);
        console.log(`Hospital role assigned to: ${hospital.address}`);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
