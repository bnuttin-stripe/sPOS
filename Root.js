import { React, useEffect, useState } from 'react';
import { registerRootComponent } from 'expo';
import { StripeTerminalProvider } from '@stripe/stripe-terminal-react-native';
import { getSerialNumber, getUniqueId } from 'react-native-device-info';

import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';

import { RecoilRoot } from 'recoil';

import App from './App';

export default function Root() {
  const fetchTokenProvider = async () => {
    const serial = await getSerialNumber();
    const deviceId = await getUniqueId();

    try {
      // const response = await fetch('https://fog-climbing-currant.glitch.me/connection_token', {
      const response = await fetch('https://stripe360.stripedemos.com/connection_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serialNumber: serial,
          deviceId: deviceId
        })
      });
      const { secret } = await response.json();
      return secret;
    }
    catch (error) {
      console.log(error);
    }
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

