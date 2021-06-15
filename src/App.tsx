import React, {useEffect} from 'react';
import logo from './logo.svg';
import './App.css';
import {web3Accounts, web3Enable, web3FromSource} from "@polkadot/extension-dapp";

const {blake2AsHex} = require('@polkadot/util-crypto');


function App() {

    useEffect(() => {
        const getExtensionAddress = async () => {

            const extensions = await web3Enable('Polkadex');
            if (extensions.length > 0) {
                const allAccounts = await web3Accounts();
                if (allAccounts.length > 0) {
                    console.log(allAccounts[0].address)
                    // Get the address of user: for this example, I am taking the first address
                    return allAccounts[0];

                } else {
                    console.warn('Please create account in Polka extension first.')
                    return ""
                }
            } else {
                console.warn('Please install Polka Chrome extension first from https://polkadot.js.org/extension/')
                return ""
            }
        }
        // This is how auth should work
        // For more documenatation check out: https://polkadot.js.org/docs/extension
        // Please install polkadotjs-extension and create an account in it before running this application
        getExtensionAddress().then(account => {
            if (account !== "") {
                console.log("Users's Address: ", account.address)
                // GET Request to path {domain of Openware}/api/v2/barong/identity/time to get a response like {"time":1623693678}
                // we use the value of 'time' as nonce
                // using a hardcoded nonce as example
                let nonce = "1623693678";
                let address = account.address;
                console.log("Nonce from Openfinex: ", nonce);

                let message = "#" + address + "#" + nonce.toString();
                console.log("Message to sign: ", message);

                web3FromSource(account.meta.source)
                    .then(injector => {
                        const signRaw = injector?.signer?.signRaw;

                        if (!!signRaw) {
                            // after making sure that signRaw is defined
                            // we can use it to sign our message
                            const hash = blake2AsHex(message)
                            console.log("Message Hash", hash);
                            signRaw({
                                address,
                                data: hash,
                                type: 'bytes'
                            }).then((obj: any) => {
                                console.log("Signature to send to Openfinex's barong: ", obj.signature)

                                // Now do
                                // POST /api/v2/barong/identity/sessions
                                let payload = {
                                    "nickname": address,
                                    "algo": "SR25519", // NOTE: OPENWARE TEAM PLEASE NOTE THIS
                                    "hash": "Blake2",
                                    "nonce": nonce,
                                    "signature": obj.signature,
                                    "captcha_response": ""
                                }
                            })
                        }
                    })

            } else {
                console.log("Unable to get address")
            }

        })
    }, []);
    return (
        <div className="App">
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo"/>
                <p>
                    Edit <code>src/App.tsx</code> and save to reload.
                </p>
                <a
                    className="App-link"
                    href="https://reactjs.org"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Learn React
                </a>
            </header>
        </div>
    );
}

export default App;
