
const { ethers, BigNumber } = require('ethers');
const deployedContracts = require('./contracts/hardhat_contracts.json');
const { address: multisigContractAddress, abi: multisigContractABI } = deployedContracts[31337].localhost.contracts['MetaMultiSigWallet'];

const provider = new ethers.providers.StaticJsonRpcProvider("http://localhost:8545");
// Use burner wallet private key
const privateKey = '0x7172931ae2a0ed241af84722b0c1672014ea82ef2611b074275c9c1f564ff270'
const wallet = new ethers.Wallet(privateKey, provider);

const run = async () => {
    const multisigContract = new ethers.Contract(multisigContractAddress, multisigContractABI, wallet);
    const multisigContractInterface = new ethers.utils.Interface(multisigContractABI)

    const toAddress = multisigContractAddress;
    const callData = multisigContractInterface.encodeFunctionData('setPurpose', ["hello there2"])
    const value = 0;

    const nonce = (await multisigContract.nonce()).toNumber();

    const txHash = await multisigContract.getTransactionHash(
        nonce, toAddress, 0, callData);

    const signature = await wallet.signMessage(ethers.utils.arrayify(txHash));

    const recover = await multisigContract.recover(txHash, signature);
    // console.log({ callData, txHash, signature, recover });

    const tx = await multisigContract.executeTransaction(toAddress, value, callData, signature);
    console.log(tx);

    console.log(await multisigContract.purpose());
}
run()