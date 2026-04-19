const hre = require("hardhat");

async function main() {
  console.log("Deploying AbdulSupplyChain contract...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "MATIC");

  const SupplyChain = await hre.ethers.getContractFactory("AbdulSupplyChain");
  const supplyChain = await SupplyChain.deploy();

  await supplyChain.waitForDeployment();

  const address = await supplyChain.getAddress();
  console.log("AbdulSupplyChain deployed to:", address);
  console.log("Transaction hash:", supplyChain.deploymentTransaction().hash);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });