import { React, useEffect, useState } from 'react';
import { Text, View, PermissionsAndroid, ActivityIndicator, SafeAreaView } from 'react-native';
import { useStripeTerminal } from '@stripe/stripe-terminal-react-native';
import { css, colors } from './styles';

import Header from './components/Header';
import Calculator from './components/Calculator';
import Products from './components/Products';
import Transactions from './components/Transactions';
import Customers from './components/Customers';
import Customer from './components/Customer';
import CustomerEntry from './components/CustomerEntry';
import Settings from './components/Settings';

export default function App({ route }) {
  // Default page is Calculator
  const page = route.params?.page ?? 'Calculator';

  const { initialize } = useStripeTerminal();
  const [initialized, setInitialized] = useState(false);
  const [infoMsg, setInfoMsg] = useState('Initializing Stripe Terminal');

  const { createPaymentIntent, collectPaymentMethod, confirmPaymentIntent } = useStripeTerminal();

  const checkPermissionsAndInitialize = async () => {
    setInfoMsg("Checking location permissions");

    // Get caneera and location permissions
    const cameraPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: 'Camera Permission',
        message: 'Stripe Terminal needs access to your camera',
        buttonPositive: 'Accept',
      }
    );

    const locationPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission',
        message: 'Stripe Terminal needs access to your location',
        buttonPositive: 'Accept',
      }
    );

    // Initialize Stripe Terminal
    if (locationPermission === PermissionsAndroid.RESULTS.GRANTED) {
      setInfoMsg("Location permissions checked");
      await initializeReader();
    } else {
      setInfoMsg("Location services are required");
    }
  }

  const initializeReader = async () => {
    setInfoMsg("Starting reader software");
    const { error, reader } = await initialize();

    if (error) {
      setInfoMsg('StripeTerminal init failed - ' + error.message);
      return;
    }

    if (reader) {
      setInfoMsg("Stripe Terminal has been initialized properly");
      return;
    }

    setInitialized(true);
  };

  useEffect(() => {
    checkPermissionsAndInitialize();
  }, []);

  const { discoverReaders, discoveredReaders, connectHandoffReader } =
    useStripeTerminal({
      onUpdateDiscoveredReaders: (readers) => {
        console.log("onUpdateDiscoveredReaders");
        connectReader(readers[0]);
      },
      onFinishDiscoveringReaders: (error) => {
        console.log("onFinishDiscoveringReaders", error);
      },
      onDidChangeOfflineStatus: (status) => {
        console.log("onDidChangeOfflineStatus");
      },
      onDidSucceedReaderReconnect: () => {
        console.log("onDidSucceedReaderReconnect");
      },
      onDidChangePaymentStatus: (status) => {
        console.log("onDidChangePaymentStatus");
      },
    });

  const discoverHandoffReader = async () => {
    const { error } = await discoverReaders({
      discoveryMethod: 'handoff'
    });
    if (error) {
      setInfoMsg('Failed to discover handoff reader. ' + error.message);
    }
  };

  const discoverLocalMobileReader = async () => {
    const { error } = await discoverReaders({
      discoveryMethod: 'localMobile',
      simulated: true
    });
    if (error) {
      setInfoMsg('Failed to discover readers. ' + error.message);
    }
  };

  const connectReader = async (reader) => {
    const { error } = await connectHandoffReader({
      reader: reader
    });
    if (error) {
      setInfoMsg('Failed to discover readers. ' + error.message);
      return;
    }
    return;
  };

  useEffect(() => {
    if (initialized) {
      discoverHandoffReader();
      // discoverLocalMobileReader();
    }
  }, [initialized]);

  const pay = async (payload, onSuccess) => {
    const { error, paymentIntent } = await createPaymentIntent(payload);
    if (error) {
      console.log("createPaymentIntent error: ", error);
      return;
    }
    collectPM(paymentIntent, onSuccess);
  }

  const collectPM = async (pi, onSuccess) => {
    console.log("collectPM: ", pi);
    const { error, paymentIntent } = await collectPaymentMethod({
      paymentIntent: pi
    });
    if (error) {
      console.log("collectPaymentMethod error: ", error);
      return;
    }
    confirmPayment(paymentIntent, onSuccess);
  }

  const confirmPayment = async (pi, onSuccess) => {
    console.log("confirmPayment: ", pi);
    const { error, paymentIntent } = await confirmPaymentIntent({
      paymentIntent: pi
      // pi
    });
    if (error) {
      console.log("confirmPaymentIntent error: ", error);
      return;
    }
    console.log("confirmPaymentIntent success: ", paymentIntent);
    if (onSuccess) onSuccess();
    // if (paymentIntent.status === 'succeeded') reset();
  };




  return (
    <SafeAreaView style={css.app}>
      {!initialized &&
        <>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ padding: 40 }}>{infoMsg}</Text>
        </>
      }
      {initialized &&
        <>
          <Header page={page} />
          {page == 'Calculator' && <Calculator pay={pay} />}
          {page == 'Products' && <Products pay={pay}/>}
          {page == 'Transactions' && <Transactions />}
          {page == 'Customers' && <Customers />}
          {page == 'Customer' && <Customer id={route.params.id} />}
          {page == 'CustomerEntry' && <CustomerEntry />}
          {page == 'Scanner' && <Scanner />}
          {page == 'Settings' && <Settings />}
        </>
      }
    </SafeAreaView>
  );
}
