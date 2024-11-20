import { React, useEffect, Suspense, View, Text } from 'react';
import { registerRootComponent } from 'expo';
import { StripeTerminalProvider } from '@stripe/stripe-terminal-react-native';

import { createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';

import { RecoilRoot } from 'recoil';

import Root from './Root';

export default function Base() {
  return (
    <RecoilRoot>
        <Root />
    </RecoilRoot>
  );
}

// registerRootComponent(Base);

