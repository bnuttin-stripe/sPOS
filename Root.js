import { React, useEffect, useState } from 'react';
import { StyleSheet, Text, SafeAreaView } from 'react-native';
import { registerRootComponent } from 'expo';
import { StripeTerminalProvider } from '@stripe/stripe-terminal-react-native';

import App from './App';

export default function Root() {
  const fetchTokenProvider = async () => {
    const response = await fetch(`https://western-honey-chamomile.glitch.me/connection_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const { secret } = await response.json();
    //console.log(secret);
    return secret;
  };

  useEffect(() => {
    // checkPermissions();
    fetchTokenProvider();
  }, []);

  return (
    <StripeTerminalProvider
      logLevel="verbose"
      tokenProvider={fetchTokenProvider}
    >
      <SafeAreaView style={styles.container}>
        <App />
      </SafeAreaView >
    </StripeTerminalProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

registerRootComponent(Root);

