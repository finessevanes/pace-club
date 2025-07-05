const hre = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("Deploying VibeProfile contract...");
  console.log("Network:", hre.network.name);

  // Deploy the contract (no constructor arguments needed)
  const VibeProfile = await hre.ethers.getContractFactory("VibeProfile");
  const vibeProfile = await VibeProfile.deploy();

  await vibeProfile.waitForDeployment();
  const contractAddress = await vibeProfile.getAddress();

  console.log("VibeProfile deployed to:", contractAddress);

  // Wait for a few block confirmations
  console.log("Waiting for block confirmations...");
  await vibeProfile.deploymentTransaction().wait(2);

  // Verify the contract if on Flow testnet
  if (hre.network.name === "flowTestnet") {
    console.log("Contract deployed successfully on Flow testnet!");
    console.log("Explorer:", `https://evm-testnet.flowscan.org/address/${contractAddress}`);
  }

  // Save deployment info
  const fs = require("fs");
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: contractAddress,
    contractType: "VibeProfile",
    deployedAt: new Date().toISOString(),
    deployer: (await hre.ethers.provider.getSigner()).address
  };

  // Create deployments directory if it doesn't exist
  if (!fs.existsSync("./deployments")) {
    fs.mkdirSync("./deployments");
  }

  // Save to separate file for vibe profile
  fs.writeFileSync(
    "./deployments/vibe_profile_latest.json",
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\nDeployment complete!");
  console.log("Contract address:", contractAddress);
  console.log("Deployment saved to: ./deployments/vibe_profile_latest.json");
  console.log("\nNext steps:");
  console.log("1. Add contract address to your frontend");
  console.log("2. Test creating profiles from your UI");
  console.log("3. Build the matching interface");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 