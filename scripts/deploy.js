const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying contracts to BNB Smart Chain...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Deploy the CrowdfundFactory contract
  const CrowdfundFactory = await ethers.getContractFactory("CrowdfundFactory");
  const factory = await CrowdfundFactory.deploy();
  await factory.waitForDeployment();

  console.log("CrowdfundFactory deployed to:", factory.address);

  // Verify the deployment
  console.log("\nDeployment Summary:");
  console.log("===================");
  console.log("Network:", network.name);
  console.log("Deployer:", deployer.address);
  console.log("CrowdfundFactory:", factory.address);
  console.log("===================");

  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    deployer: deployer.address,
    factory: factory.address,
    timestamp: new Date().toISOString()
  };

  console.log("\nDeployment info saved to deployment.json");
  require('fs').writeFileSync(
    'deployment.json',
    JSON.stringify(deploymentInfo, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 