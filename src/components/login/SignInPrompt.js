import React from 'react';
import eneftigo_logo from "assets/eneftigo_logo.png"

export function SignInPrompt({onClick}) {
  return (
    <main>
      <h1>
      <span><img src={eneftigo_logo} width="100px" alt="eneftigo"/></span></h1>
      <h1>
        <span>Welcome to ENEFTIGO!</span>
      </h1>
      <p  style={{ textAlign: 'center' }}>
        To explore the Marketplace and trade items you need to sign in using the NEAR Wallet. It is very simple,
        just use the button below.
      </p>
      <p style={{ textAlign: 'center' }}>
        <button onClick={onClick}>SIGN IN WITH NEAR WALLET</button>
      </p>
      <p  style={{ textAlign: 'center' }}>
        Do not worry, this app runs in testnet. Spend as much as you want. It's Monopoly money. The NFTs are the glitter, too.
      </p>
      <br/>
    </main>
  );
}

export function SignOutButton({onClick}) {
  return (
    <button style={{ color:"var(--eneftigo-black)", backgroundColor:"var(--eneftigo-red)", margin: "auto", height: '32px', float: 'right' }} onClick={onClick}>
      SIGN OUT
    </button>
  );
}
