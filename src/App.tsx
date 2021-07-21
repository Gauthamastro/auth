import React, {useEffect} from 'react';
import logo from './logo.svg';
import './App.css';
import {mnemonicGenerate} from '@polkadot/util-crypto';
import { Keyring } from '@polkadot/keyring';
const {blake2AsHex} = require('@polkadot/util-crypto');
const { u8aToHex, stringToU8a } = require('@polkadot/util');


function App() {

    useEffect(() => {
        const getExtensionAddress = async () => {
            const keyring = new Keyring({ type: 'ed25519', ss58Format: 2 });
        // generate a mnemonic with default params (we can pass the number
        // of words required 12, 15, 18, 21 or 24, less than 12 words, while
        // valid, is not supported since it is more-easily crackable)
            const mnemonic = mnemonicGenerate();
        // create & add the pair to the keyring with the type and some additional
        // metadata specified
            const pair = keyring.addFromUri(mnemonic, {name: 'first pair'}, 'ed25519');
        // the pair has been added to our keyring
            console.log(keyring.pairs.length, 'pairs available');

        // log the name & address (the latter encoded with the ss58Format)
            console.log(pair.meta.name, 'has address', pair.address);
            return pair
        }
        // This is how auth should work
        // For more documenatation check out: https://polkadot.js.org/docs/extension
        // Please install polkadotjs-extension and create an account in it before running this application
        getExtensionAddress().then(pair => {

                console.log("Users's Address: ", pair.address)
                // GET Request to path {domain of Openware}/api/v2/barong/identity/time to get a response like {"time":1623693678}
                // we use the value of 'time' as nonce
                // using a hardcoded nonce as example
                let nonce = "1623693678";
                let address = pair.address;
                console.log("Nonce from Openfinex: ", nonce);

                let message = "#" + address + "#" + nonce.toString();
                console.log("Message to sign: ", message);
                const hash = blake2AsHex(message)
                console.log("Message Hash", hash);
                const signature = pair.sign(stringToU8a(hash));
                console.log("Signature: ",u8aToHex(signature))
                // Now do
                // POST /api/v2/barong/identity/sessions/signature
                let payload = {
                    "nickname": address,
                    "algo": "ED25519", // NOTE: OPENWARE TEAM PLEASE NOTE THIS
                    "hash": "Blake2",
                    "nonce": nonce,
                    "signature": u8aToHex(signature),
                    "captcha_response": ""
                }
                console.log("Payload for Barong", payload)

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
