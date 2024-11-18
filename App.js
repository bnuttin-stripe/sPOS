import { React, useEffect, useState } from 'react';
import { Text, View, PermissionsAndroid, ActivityIndicator, SafeAreaView } from 'react-native';
import { useStripeTerminal } from '@stripe/stripe-terminal-react-native';
import { css, colors } from './styles';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTriangleExclamation } from '@fortawesome/pro-solid-svg-icons';

import Header from './components/Header';
import Calculator from './components/Calculator';
import Products from './components/Products';
import Checkout from './components/Checkout';
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
  const [readerFound, setReaderFound] = useState(true);

  const { createPaymentIntent, collectPaymentMethod, confirmPaymentIntent, createSetupIntent, collectSetupIntentPaymentMethod, confirmSetupIntent } = useStripeTerminal();

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
        setReaderFound(readers.length > 0);
        readers.length > 0
          ? connectReader(readers[0])
          : setInfoMsg("No reader found");
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

  /// PAYMENT INTENTS
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
    });
    if (error) {
      console.log("confirmPaymentIntent error: ", error);
      return;
    }
    console.log("confirmPaymentIntent success: ", paymentIntent);
    if (onSuccess) onSuccess();
  };

  // SETUP INTENTS
  const setup = async () => {
    const { error, setupIntent } = await createSetupIntent({
    });
    console.log(setupIntent);
    if (error) {
      console.log("createSetupIntent error: ", error);
      return;
    }
    return collectSIPM(setupIntent);
  }

  const collectSIPM = async (si) => {
    const { setupIntent, error } = await collectSetupIntentPaymentMethod({
      setupIntent: si,
      allowRedisplay: "always",
      customerConsentCollected: true
    });
    if (error) {
      console.log("collectSetupIntentPaymentMethod error: ", error);
      return;
    }
    return confirmSetup(setupIntent);
  }

  const confirmSetup = async (si) => {
    const { setupIntent, error } = await confirmSetupIntent({
      setupIntent: si
    });

    if (error) {
      console.log("confirmSetupIntent error: ", error);
      return;
    }
    return setupIntent.paymentMethodId;
  }

  return (
    <SafeAreaView style={css.app}>
      {!initialized &&
        <View style={{ justifyContent: 'center', flex: 1 }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ padding: 40 }}>{infoMsg}</Text>
        </View>
      }
      {initialized && <>
        {readerFound
          ? <>
            <Header page={page} />
            {page == 'Calculator' && <Calculator pay={pay} />}
            {page == 'Products' && <Products pay={pay} />}
            {page == 'Checkout' && <Checkout pay={pay} />}
            {page == 'Transactions' && <Transactions setup={setup} />}
            {page == 'Customers' && <Customers showLTV={true} mode='details' showIcons={true}
            // initialLoad={true}
            />}
            {page == 'Customer' && <Customer id={route.params.id} />}
            {page == 'CustomerEntry' && <CustomerEntry origin={route.params.origin} />}
            {page == 'Scanner' && <Scanner />}
            {page == 'Settings' && <Settings />}
          </>
          : <>
            <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
              <FontAwesomeIcon icon={faTriangleExclamation} color={colors.primary} size={30} />
              <Text style={{ padding: 40, lineHeight: 30 }}>No reader detected. The Stripe account may not be enabled for Apps on Device, or the device may not have the required specifications.</Text>
            </View>
          </>}
      </>
      }
    </SafeAreaView>
  );
}
