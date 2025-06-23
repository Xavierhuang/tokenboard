const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying BNB Crowdfunding contracts to BSC...\n");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", balance.toString());

  // Deploy the CrowdfundFactory contract
  console.log("\n📦 Deploying CrowdfundFactory...");
  const CrowdfundFactory = await ethers.getContractFactory("CrowdfundFactory");
  const factory = await CrowdfundFactory.deploy();
  await factory.waitForDeployment();

  console.log("✅ CrowdfundFactory deployed to:", factory.target);

  // Verify deployment
  console.log("\n🔍 Verifying deployment...");
  const campaignCount = await factory.getCampaignsCount();
  console.log("Initial campaign count:", campaignCount.toString());

  // Save deployment info
  const deploymentInfo = {
    network: "BSC",
    deployer: deployer.address,
    factoryAddress: factory.target,
    deploymentTime: new Date().toISOString(),
    contracts: {
      CrowdfundFactory: factory.target,
      Campaign: "Will be deployed per campaign",
      ProjectToken: "Will be deployed per campaign"
    }
  };

  console.log("\n📋 Deployment Summary:");
  console.log("Network: BSC");
  console.log("Factory Address:", factory.target);
  console.log("Deployer:", deployer.address);
  console.log("Deployment Time:", deploymentInfo.deploymentTime);

  // Save to file
  const fs = require('fs');
  fs.writeFileSync(
    'deployment-bnb.json', 
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("\n💾 Deployment info saved to deployment-bnb.json");

  console.log("\n🎉 BNB Crowdfunding contracts deployed successfully!");
  console.log("\n📝 Next steps:");
  console.log("1. Update your .env.local file with:");
  console.log(`   NEXT_PUBLIC_FACTORY_ADDRESS=${factory.target}`);
  console.log("2. Update the FACTORY_ADDRESS in pages/crowdsource.tsx");
  console.log("3. Test the deployment by creating a campaign");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }); 