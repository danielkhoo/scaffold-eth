
const { ethers, BigNumber } = require('ethers');
const deployedContracts = require('./contracts/hardhat_contracts.json');
const axios = require("axios");
const { address: multisigContractAddress, abi: multisigContractABI } = deployedContracts[31337].localhost.contracts['MetaMultiSigWallet'];

const provider = new ethers.providers.StaticJsonRpcProvider("http://localhost:8545");
// Use burner wallet private key
const privateKey = '0x7172931ae2a0ed241af84722b0c1672014ea82ef2611b074275c9c1f564ff270'
const wallet = new ethers.Wallet(privateKey, provider);

const secondSigner = '0x8334391Ad5F22C1F0598986111B0a750cADC5Aba'
const run = async () => {
    const multisigContract = new ethers.Contract(multisigContractAddress, multisigContractABI, wallet);
    const multisigContractInterface = new ethers.utils.Interface(multisigContractABI)

    const nonce = (await multisigContract.nonce()).toNumber();

    // Add signer
    const toAddress = multisigContract.address;
    const value = 0;
    const functionSignature = 'addSigner'
    const functionArgs = [secondSigner, 1];
    const callData = multisigContractInterface.encodeFunctionData(functionSignature, functionArgs)

    const txHash = await multisigContract.getTransactionHash(
        nonce, toAddress, value, callData);
    const signature = await wallet.signMessage(ethers.utils.arrayify(txHash));

    // const recover = await multisigContract.recover(txHash, signature);
    // console.log({ recover });

    // Save to firebase
    const txData = { functionSignature, functionArgs, toAddress, value, nonce, signatures: [signature], signers: [wallet.address] }
    console.log(txData);

    await multisigContract.createTransaction(JSON.stringify(txData))


    // Get transaction
    /*
    const proposedTransaction = await multisigContract.getTransactions(nonce);
    if (proposedTransaction !== "") {
        const txData = JSON.parse(proposedTransaction)
        const { functionSignature, functionArgs, toAddress, value, nonce, signatures } = txData

        const callData = multisigContractInterface.encodeFunctionData(functionSignature, functionArgs)
        const txHash = await multisigContract.getTransactionHash(
            nonce, toAddress, value, callData);
        const newSignature = await wallet.signMessage(ethers.utils.arrayify(txHash));

        const updatedTx = {
            ...txData,
            signatures: [...txData.signatures, newSignature],
            signers: [...txData.signers, wallet.address]
        }
        console.log(updatedTx);
        await multisigContract.createTransaction(JSON.stringify(updatedTx))
    }
    */

    // Send transaction
    // const tx = await multisigContract.executeTransaction(toAddress, value, callData, [signature]);
    // console.log(tx);

}
run()

// Transfer Eth
// const toAddress = wallet.address;
// const value = ethers.utils.parseEther("1").toString();
// const callData = "0x00";