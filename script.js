
    var account = null;
    var contract = null;
    const ABI = fetch('./ABI.json');
    const ADDRESS = "0xB08797B1928AdA41380e6E7A3B63F828f97460eb";
	
	

    (async () => {
        if (window.ethereum) {
            await window.ethereum.send('eth_requestAccounts');
            window.web3 = new Web3(window.ethereum);
            var accounts = await web3.eth.getAccounts();
            account = accounts[0];
			
            document.getElementById('wallet-address').textContent = account;
			
            document.getElementById('smart-contract-address').textContent = ADDRESS;
            contract = new web3.eth.Contract(ABI, ADDRESS);

            document.getElementById('mint').onclick = async () => {
                const nftName = document.getElementById('nft-name').value;
                const nftDescription = document.getElementById('nft-description').value;
                const imageFile = document.getElementById('image-upload').files[0];

              
                const imageBuffer = await readFileAsync(imageFile);

              
                const imageIpfsHash = await uploadImageToIPFS(imageBuffer);

               
                const metadata = {
                    name: nftName,
                    description: nftDescription,
                    image: `ipfs://${imageIpfsHash}` 
                };

                const metadataIpfsHash = await uploadMetadataToIPFS(metadata);

            
                await contract.methods.safeMint(account, `ipfs://${metadataIpfsHash}`).send({ from: account, value: "10000000" });

                
                document.getElementById('mint').textContent = "NFT Minted Successfully!";
                document.getElementById('mint').style.backgroundColor = "#ff0000";
                setTimeout(() => {
                    document.getElementById('mint').textContent = "Mint an NFT";
                    document.getElementById('mint').style.backgroundColor = "#fa0089";
                    showSpecialButton();
                }, 4000);

                const successMessage = document.getElementById('success-message');
                successMessage.textContent = "Your NFT is Successfully Minted!";
                await displayMintedNFTs();
            };
           
            async function uploadImageToIPFS(imageBuffer) {
                const formData = new FormData();
                formData.append('file', new Blob([imageBuffer]));

                const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'pinata_api_key': 'ae2fefdcd3611a8b9502',
                        'pinata_secret_api_key': '6732d2abb8ded01f2dd38af288cee0c29e72df0c21561390d20614efb14f6e68'
                    }
                });
                return response.IpfsHash;
               
            }

         
            async function uploadMetadataToIPFS(metadata) {
                const formData = new FormData();
                formData.append('file', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));

                const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'pinata_api_key': 'ae2fefdcd3611a8b9502',
                        'pinata_secret_api_key': '6732d2abb8ded01f2dd38af288cee0c29e72df0c21561390d20614efb14f6e68'
                    }
                });

                const result = await response.json();
                return result.IpfsHash;
            }
           function readFileAsync(file) {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsArrayBuffer(file);
                });
                }
            const mintedNFTsContainer = document.getElementById('minted-nfts');

            async function displayMintedNFTs() {
                const totalSupply = await contract.methods.totalSupply().call();
                const balance = await contract.methods.balanceOf(account).call();
                mintedNFTsContainer.innerHTML = "";
                const labelContainer = document.createElement('div');
                labelContainer.style.textAlign = 'center';
                labelContainer.style.marginBottom = '20px';
                if (balance > 0) {
                    labelContainer.innerHTML = `<p>Your Minted NFT's:</p>`;
                }
                mintedNFTsContainer.appendChild(labelContainer);

                for (let i = 1; i <= totalSupply; i++) {
                    const owner = await contract.methods.ownerOf(i).call();

                    if (owner.toLowerCase() === account.toLowerCase()) {
                        const tokenURI = await contract.methods.tokenURI(i).call();
                        const tokenURIData = await fetch(tokenURI);
                        const tokenURIDataJSON = await tokenURIData.json();
                        const imageURL = tokenURIDataJSON.image;
                        const name = tokenURIDataJSON.name;
                        const description = tokenURIDataJSON.description;
                        const backgroundColor = getRandomColor();


                        const nftContainer = document.createElement('div');
                        nftContainer.classList.add('minted-nft-container');
                        nftContainer.style.backgroundColor = backgroundColor;


                        const imgElement = document.createElement('img');
                        imgElement.src = imageURL;
                        imgElement.alt = name + " NFT";
                        imgElement.width = 204;
                        imgElement.height = 192;


                        const nameElement = document.createElement('p');
                        nameElement.textContent = "Name : " + name;
                        const descriptionElement = document.createElement('p');
                        descriptionElement.textContent = "Description : " + description;


                        nftContainer.appendChild(imgElement);
                        nftContainer.appendChild(nameElement);
                        nftContainer.appendChild(descriptionElement);


                        mintedNFTsContainer.appendChild(nftContainer);
                    }
                }
            }

            function getRandomColor() {
                const letters = '0123456789ABCDEF';
                let color = '#';
                for (let i = 0; i < 6; i++) {
                    color += letters[Math.floor(Math.random() * 16)];
                }
                return color;
            }






            displayMintedNFTs();

            const currentTokenID = await contract.methods.tokenId().call();
            document.getElementById('max-supply').textContent = currentTokenID;



        }
    })();
