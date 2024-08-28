import { React, useEffect, useState } from 'react';
import { StyleSheet, View, Text, SafeAreaView } from 'react-native';
import { registerRootComponent } from 'expo';
import { StripeTerminalProvider } from '@stripe/stripe-terminal-react-native';

import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';

import { RecoilRoot } from 'recoil';

import App from './App';
import Transactions from './components/Transactions';
import Transaction from './components/Transaction';
import Settings from './components/Settings';

export default function Root() {
  const fetchTokenProvider = async () => {
    const response = await fetch(`https://western-honey-chamomile.glitch.me/connection_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const { secret } = await response.json();
    return secret;
  };

  useEffect(() => {
    fetchTokenProvider();
  }, []);

  const Drawer = createDrawerNavigator();

  return (
    <StripeTerminalProvider
      logLevel="verbose"
      tokenProvider={fetchTokenProvider}
    >
      <RecoilRoot>
        <NavigationContainer>
          <Drawer.Navigator initialRouteName="App" screenOptions={{ headerShown: false, swipeEnabled: false }}>
            <Drawer.Screen name="App" component={App} />
            <Drawer.Screen name="Transactions" component={Transactions} />
            <Drawer.Screen name="Transaction" component={Transaction} />
            <Drawer.Screen name="Settings" component={Settings} />
          </Drawer.Navigator>
        </NavigationContainer>
      </RecoilRoot>
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

