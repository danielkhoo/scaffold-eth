# 🏗 Scaffold-ETH Speedrun Cheatsheet

> Quick Reference Guide for Scaffold-Eth and SpeedRunEthereum.

🧪 This tutorial is meant as quick reference / run through of all the building blocks and you'll need for building on Ethereum and completing the speedrunethereum challenges. Feel free to follow along step by step. Or just check specific sections and reference implementations.

![image](https://user-images.githubusercontent.com/2653167/124158108-c14ca380-da56-11eb-967e-69cde37ca8eb.png)

# 🏄‍♂️ Quick Start

Prerequisites: [Node (v16 LTS)](https://nodejs.org/en/download/) plus [Yarn](https://classic.yarnpkg.com/en/docs/install/) and [Git](https://git-scm.com/downloads)

> clone/fork 🏗 scaffold-eth:

```bash
git clone https://github.com/scaffold-eth/scaffold-eth.git
```

> install and start your 👷‍ Hardhat chain:

```bash
cd scaffold-eth
yarn install
yarn chain
```

> in a second terminal window, start your 📱 frontend:

```bash
cd scaffold-eth
yarn start
```

> in a third terminal window, 🛰 deploy your contract:

```bash
cd scaffold-eth
yarn deploy
```

🔏 Edit your smart contract `YourContract.sol` in `packages/hardhat/contracts`

📝 Edit your frontend `App.jsx` in `packages/react-app/src`

💼 Edit your deployment scripts in `packages/hardhat/deploy`

📱 Open http://localhost:3000 to see the app

# Section 1: Basic Read and Write

> ⛽️ You'll need to get some funds from the faucet for gas.

![image](https://user-images.githubusercontent.com/2653167/142483294-ff4c305c-0f5e-4099-8c7d-11c142cb688c.png)

To get started deploy your contract. The code is in `YourContract.sol`

```bash
yarn deploy
```

Under the Demo Contract tab, you should see two `part1_` entries, these correspond to the variables and functions in your smart contract. Variable values are display. Functions can be run by hitting send, with the arguments with neccessary.

Try it out to update the purpose.

---

# Section 2: Deposit & Withdraw

Now it's time to get familiar with the iterative development loop of Scaffold-Eth. In `YourContract.sol` uncomment the section `2. Deposit/Withdraw Funds`. Then redeploy it with `yarn deploy --reset`. Refresh your frontend at `localhost:3000` to see the changes. This is your basic development feedback loop as you develop your contract.

You should be able to check your wallets balance in the contract with `part2_balances`. It should 0 as you haven't made a deposit. Try making a deposit with `part2_deposit`. Note that the amount is in wei, use the `*` to
multiply by 10^18.

// Picture of multiplier

If you want more eth click the wallet icon on the bottom right and send your address more eth.

// Picture of faucet

Once you've deposited you should be able to check your balance and see the amount updated.

Note the `receive() external payable` function is implemented, you can test it out by sending the contract address some eth.

Use `part2_withdraw` to get back your eth.

## Section 2.1: Blocktime

Next uncomment the section `2.1 Block time and timelocks`. Redeploy your contract `yarn deploy --reset`.

You'll see the new variable `part2_timeLeft`, its set to 3 mins from deploy. If you deposit funds and try to withdraw with `part2_timeLockedWithdraw` it wont work before that time, `part2_withdraw` will. Check out the code difference in the contract.

---

# Section 3: Commit / Reveal Pattern

Now that you have the basics of working with Scaffold-Eth, we can explore some commone smart contract patterns. The first of which is commit/reveal. As the blockchain is a public it is a challenge to publish values like the a game move so it can't be changed, while not revealing it to the players until later.

The real-world analogy would be playing a card game and placing a card face down on the table. The player is unable to change their card, but it is also not revealed to the rest of the players.

The solution to this is the commit/reveal pattern. In short, we hash the given message with a password or salt provided by the user that is not stored. They can “reveal” the original message at a later time by providing the password that generates a matching hash. This mechanic exploits the one-way nature of hashing, allowing publishing of information beforehand while keeping the content a secret until it needs to be revealed.

Let's try it out! Uncomment the `3. Commit / Reveal` section. You wish to comment out the earlier sections so they are hidden. Redeploy the contract `yarn deploy --reset`.

// picture of the start state

Commit a message you might want to store along with password. A good example would be a game move for Rock Paper Scissors. You'll see that `part3_commitHash` gets updated once you send the transaction.

//Pic of rock

You can then reveal the message with `part3_reveal`. Try using a different password/salt or message and seeing how it errors. If successful `part3_revealMessage` will show the message.

# Section 4: Signature Recovery & Meta Transactions

Next we have a more advanced concept, signature recovery. Typically most transaction we conduct as signed and submitted automatically. However those steps can be split. There some situations where this may be desirable such as operating multi-signature wallets or just save gas fees and bundle transactions together. Let's try it out! Uncomment the `4. Signaure Recovery / Meta Transactions` section. You wish to comment out the earlier sections so they are hidden. Redeploy the contract `yarn deploy --reset`.

The first time we need to do is generate a hash of our transaction, as we learnt in the previous section this is so the transaction details are locked and can't be changed. In this example we want to simulate sending a transaction to transfer ETH from the contract to our wallet.

To start, send 1 ETH to the contract
// Contract balance 1 eth

Now let's formulate the transaction to send that ETH back to our wallet. `address to` should be set to your wallet address and the amount should be the 1 ETH we just added to the contract.

// sigrec2

Send it to get the transaction hash. Now we need to sign the transaction hash with our wallet on frontend. Do so uncomment the component `======= Sign transaction hash UI =======` in `App.jsx`. Take a second to understand what the code is doing. Save and refresh the frontend.

You should see a new component `Sign Transaction Hash`. Enter your transaction has from previously to generate a signature

//sigrec3

Now that we have the transaction hash and signature we can do a "recover" to verify that the signature is valid. Enter both into `part4_recover` and the result should be your wallet address.

Note that the signed transactions can be submitted by anyone not just the signer. To illustrate open a new incognito tab. This will give you a fresh burner wallet. Get some eth from the faucet for gas.

You'll be able to run `part4_executeSignedSend` with the signature we generated provided you use the same to address and amount. It won't work if any of the values are changed.

# Section 5: ERC-20 Tokens & Approve Pattern

Once you're familiar with the writing contracts in Solidity, we can run through some examples of common standards. The ERC-20 token standard is one of them.

Go the `00_deploy_your_contract.js` file and uncomment the `DEMO ERC-20 Contract` section. Fill in `YOUR_WALLET_ADDRESS` with your address. This script will deploy the `YourToken.sol` contract which is example ERC-20 implementation of a Gold token called `GLD`. Run `yarn deploy --reset`.

On the frontend, navigate to the `Demo Token Contract` tab and you should see all the default functions that come with an ERC20. Checking `balanceOf` with your wallet address should show 10 GLD coins which we transferred in the deploy script.

// Erc20_1

You can try sending coins to another address by opening an incognito window and calling `tranfer` to the new burner wallet address. Check `balanceOf` for both addresses to see the updates.

ERC20 tokens have an important caveat that we will explore.

Go back to `YourContract.sol` and uncomment the `5. ERC20 Approve Pattern` section. You wish to comment out the earlier sections so they are hidden. Redeploy both contracts `yarn deploy --reset`.

Take a moment to see how we call the `YourToken` contract from the main contract. In order to interact with our ERC20 contract we need to first set its address, copy the address from the top of `Demo Token Contract` and call `part5_setTokenAddress`.

Now we can try to deposit some of the GLD tokens. You have 10 tokens, try to deposit 5. Don't forget to use the `*` to mulitply the deposit amount!!

Did it work?? You will run into this error message.

// Erc20_2

The reason is that in order for a contract to access tokens, you need to first grant it approval. To do this grab the address of `YourContract` and go back to the `Demo Token Contract` tab. You need to approve the contract address as a spender for the amount. Once you do, you can check the amount with `allowance`.

// Erc20_3

Having given approval, you can now deposit your GLD tokens into the contract.

# Section 6: ERC-721 NFTs

The other extremely common type of smart contract are ERC721 NFTs. Go back to the `00_deploy_your_contract.js` file and uncomment the `DEMO ERC-721 Contract` section. Check out the contract code at `YourCollectible.sol`. Refresh the frontend and navigate to the `Demo NFT Contract` tab.

// erc721_1

Similar to the ERC20, theres lots of inherited functions. Learn more about them at https://docs.openzeppelin.com/contracts/2.x/api/token/erc721

To start let's mint a token. Hit `Mint Item`. Explore the frontend code at `======= Mint Item UI =======` in `app.jsx`. But essentially we are uploading the hardcoded JSON metadata for our NFT to IPFS.

// erc721_2

You can check `balanceOf` same as with the ERC20. `tokenURI` will return the IPFS link were the JSON was uploaded. Try a `transferFrom` to a new burner wallet address in an incognito window.

# Conclusion

That's it! You're familiar with all pieces and patterns needed to SpeedRunEthereum. Take the challenges at SpeedRunEthereum.com.
