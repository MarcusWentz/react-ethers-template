// https://docs.metamask.io/guide/ethereum-provider.html#using-the-provider

import React, {useState} from 'react'
import {ethers} from 'ethers'
import contractABI from './contracts/contractABI.json'

const SimpleStorage = () => {

	// deploy simple storage contract and paste deployed contract address here. This value is local ganache chain
	let contractAddress = '0xdbaA7dfBd9125B7a43457D979B1f8a1Bd8687f37';

	const goerliChainId = 5;

	// const providerRead = new ethers.providers.Web3Provider(window.ethereum); //Imported ethers from index.html with "<script src="https://cdn.ethers.io/lib/ethers-5.6.umd.min.js" type="text/javascript"></script>".

	const [errorMessage, setErrorMessage] = useState(null);
	const [defaultAccount, setDefaultAccount] = useState(null);
	const [connButtonText, setConnButtonText] = useState('🦊 Connect Wallet');

	const [currentContractVal, setCurrentContractVal] = useState('Connect wallet then click button above');

	const [provider, setProvider] = useState(null);
	const [signer, setSigner] = useState(null);
	const [contract, setContract] = useState(null);

	const connectWalletHandler = async () => {
		if (window.ethereum && window.ethereum.isMetaMask) {

			window.ethereum.request({ method: 'eth_requestAccounts'})
			.then(accounts => {
				accountChangedHandler(accounts[0]);
				setConnButtonText(accounts[0].substr(0,5) + "..." +  accounts[0].substr(38,4) );
			})
			.catch(error => {
				setErrorMessage(error.message);
			
			});

			// let chainId = await getChainIdConnected();
			// alert(JSON.stringify(chainId))

			if(window.ethereum.networkVersion != goerliChainId){
				// alert("You are not on the Goerli Testnet! Please switch to Goerli and refresh page.")
				try{
				  await window.ethereum.request({
					  method: "wallet_switchEthereumChain",
					  params: [{
						 chainId: "0x5"
					  }]
					})
				//   location.reload(); 
					window.location.reload(true);
				  // alert("Failed to add the network at chainId " + goerliChainId + " with wallet_addEthereumChain request. Add the network with https://chainlist.org/ or do it manually. Error log: " + error.message)
				} catch (error) {
				  alert("Failed to add the network at chainId " + goerliChainId + " with wallet_addEthereumChain request. Add the network with https://chainlist.org/ or do it manually. Error log: " + error.message)
				}
			  }

		} else {
			console.log('Need to install MetaMask');
			setErrorMessage('Please install MetaMask browser extension to interact');
		}
	}

	// update account, will cause component re-render
	const accountChangedHandler = (newAccount) => {
		setDefaultAccount(newAccount);
		updateEthers();
	}

	// listen for account changes
	window.ethereum.on('accountsChanged', accountChangedHandler);

	const updateEthers = () => {
		let tempProvider = new ethers.providers.Web3Provider(window.ethereum);
		setProvider(tempProvider);

		let tempSigner = tempProvider.getSigner();
		setSigner(tempSigner);

		let tempContract = new ethers.Contract(contractAddress, contractABI, tempSigner);
		setContract(tempContract);	
	}

	const setHandler = (event) => {
		if(event.target.setText.value === "") {
			alert("Enter a number.");
			return;
		}
		// try{
		event.preventDefault();
		console.log('sending ' + event.target.setText.value + ' to the contract');
		contract.set(event.target.setText.value);
		// } catch {
		// 	alert("Enter a number.")
		// }
	}

	const getCurrentVal = async () => {
		try{
			let val = await contract.storedData();
			setCurrentContractVal(val.toNumber());
		} catch {
			alert("Connect your wallet first.")
		}
	}
	
	// async function getChainIdConnected() {

	// 	const connectedNetworkObject = await providerRead.getNetwork();
	// 	const chainIdConnected = connectedNetworkObject.chainId;
	// 	return chainIdConnected
	  
	// }

	return (
		<div>
		<h4> </h4>
			<button onClick={connectWalletHandler}>{connButtonText}</button>
			<div>
			<button onClick={getCurrentVal} style={{marginTop: '5em'}}> Get Current Contract Value </button>
			<div>
			</div>
			{currentContractVal}
			{errorMessage}
			<h4> </h4>
			</div>
			<form onSubmit={setHandler}>
				<input id="setText" type="text"/>
				<h4> </h4>
				<button type={"submit"}> Update Contract </button>
			</form>
		</div>
	);
}

export default SimpleStorage;