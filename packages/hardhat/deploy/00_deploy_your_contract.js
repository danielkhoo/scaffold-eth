// deploy/00_deploy_your_contract.js

const { ethers } = require("hardhat");

const localChainId = "31337";

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  // REPLACE WITH YOUR FRONTEND WALLET ADDRESS
  const YOUR_WALLET_ADDRESS = "0x955a3ec178A76cA2f5cA52fFa88390E341430058"

  // ================ DEMO Contract ================
  await deploy("YourContract", {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer,
    // args: [ "Hello", ethers.utils.parseEther("1.5") ],
    log: true,
    waitConfirmations: 5,
  });
  const yourContract = await ethers.getContract("YourContract", deployer);
  await yourContract.transferOwnership(YOUR_WALLET_ADDRESS);

  // ================ DEMO ERC-20 Contract ================
  /* 
  await deploy("YourToken", {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer,
    // args: [ "Hello", ethers.utils.parseEther("1.5") ],
    log: true,
    waitConfirmations: 5,
  });

  // Get contract
  const yourToken = await ethers.getContract("YourToken", deployer);
  // Transfer some tokens to your frontend address
  await yourToken.transfer(YOUR_WALLET_ADDRESS, ethers.utils.parseEther("10"));
  */

  // ================ DEMO ERC-721 Contract ================
  /* 
  await deploy("YourCollectible", {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer,
    // args: [ "Hello", ethers.utils.parseEther("1.5") ],
    log: true,
    waitConfirmations: 5,
  });
  */

};
module.exports.tags = ["YourContract"];
