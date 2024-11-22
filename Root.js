import { React, useEffect, useState } from 'react';
import { registerRootComponent } from 'expo';
import { StripeTerminalProvider } from '@stripe/stripe-terminal-react-native';
import { usePowerState, getCarrier, getSerialNumber } from 'react-native-device-info';

import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';

import { RecoilRoot } from 'recoil';

import App from './App';

export default function Root() {
  const fetchTokenProvider = async () => {
    const serial = await getSerialNumber();
    // console.log('Serial Number:', serial);

    const response = await fetch('https://fog-climbing-currant.glitch.me/connection_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        serialNumber: serial
      })
    });
    const { secret } = await response.json();
    return secret;
  };

  useEffect(() => {
    fetchTokenProvider();
  }, []);

  const Drawer = createDrawerNavigator();

  return (
    <RecoilRoot>
      <StripeTerminalProvider
        // logLevel="verbose"
        logLevel="error"
        tokenProvider={fetchTokenProvider}
      >
        <NavigationContainer>
          <Drawer.Navigator initialRouteName="App" screenOptions={{ headerShown: false, swipeEnabled: false }}>
            <Drawer.Screen name="App" component={App} />
          </Drawer.Navigator>
        </NavigationContainer>
      </StripeTerminalProvider>
    </RecoilRoot>
  );
}

registerRootComponent(Root);

