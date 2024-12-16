import { React, useEffect, useState } from 'react';
import { Text, View, PermissionsAndroid, ActivityIndicator, SafeAreaView, Platform } from 'react-native';
import { getSerialNumber, isTablet } from 'react-native-device-info';
import { useStripeTerminal } from '@stripe/stripe-terminal-react-native';
import { css, themeColors } from './styles';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTriangleExclamation } from '@fortawesome/pro-solid-svg-icons';

import { useRecoilState, useResetRecoilState } from 'recoil';
import { settingsAtom } from './atoms';

import Header from './components/Header';
import Calculator from './components/Calculator';
import Products from './components/Products';
import Checkout from './components/Checkout';
import Transactions from './components/Transactions';
import Customers from './components/Customers';
import Customer from './components/Customer';
import CustomerEntry from './components/CustomerEntry';
import Settings from './components/Settings';
import SettingsHandler from './components/SettingsHandler';
import Kiosk from './components/Kiosk';
import CheckoutKiosk from './components/CheckoutKiosk';

import * as Utils from './utilities';

export default function App({ route }) {
  const [formFactorDetermined, setFormFactorDetermined] = useState(false);
  const [tablet, setTablet] = useState(false);

  let page = route.params?.page;

  const { initialize } = useStripeTerminal();
  const [initialized, setInitialized] = useState(false);
  const [infoMsg, setInfoMsg] = useState('Initializing Stripe Terminal');
  const [readerFound, setReaderFound] = useState(true);
  const [serial, setSerial] = useState();
  const [settings, setSettings] = useRecoilState(settingsAtom);
  const colors = themeColors[settings.theme];

  const backendUrl = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    setTablet(isTablet());
    setFormFactorDetermined(true);
  }, []);

  const { createPaymentIntent, collectPaymentMethod, confirmPaymentIntent, createSetupIntent, collectSetupIntentPaymentMethod, confirmSetupIntent, getPaymentMethod } = useStripeTerminal();

  const checkPermissionsAndInitialize = async () => {
    setInfoMsg("Checking location permissions");

    if (Platform.OS == 'android') {
      // Get camera and location permissions
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
    else {
      await initializeReader();
    }
  }

  const initializeReader = async () => {
    setInfoMsg("Starting reader software");
    // console.log("initializeReader");
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

  const { discoverReaders, discoveredReaders, connectHandoffReader, connectLocalMobileReader } =
    useStripeTerminal({
      onUpdateDiscoveredReaders: (readers) => {
        setReaderFound(readers.length > 0);
        readers.length > 0
          ? serial?.substring(0, 3) == 'STR'
            ? connectReader(readers[0])
            : connectTTPAReader(readers[0])
          : setInfoMsg("No reader found");
      },
      onFinishDiscoveringReaders: (error) => {
        // console.log("onFinishDiscoveringReaders", error);
      },
      onDidChangeOfflineStatus: (status) => {
        // console.log("onDidChangeOfflineStatus");
      },
      onDidSucceedReaderReconnect: () => {
        // console.log("onDidSucceedReaderReconnect");
      },
      onDidChangePaymentStatus: (status) => {
        // console.log("onDidChangePaymentStatus");
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
      // simulated: true
    });
    if (error) {
      setInfoMsg('Failed to discover readers. ' + error.message);
    }
  };

  const connectReader = async (reader) => {
    const { error } = await connectHandoffReader({
      reader: reader
    });
    setSerial(reader.serialNumber);
    if (error) {
      setInfoMsg('Failed to discover readers. ' + error.message);
      return;
    }
    return;
  };

  const connectTTPAReader = async (reader) => {
    const { error } = await connectLocalMobileReader({
      reader: reader,
      // locationId: process.env.EXPO_TTPA_LOCATION
      locationId: 'tml_F0V0HAjyiFF9Q8'
    });
    setSerial(reader.serialNumber);
    if (error) {
      setInfoMsg('Failed to discover readers. ' + error.message);
      return;
    }
    return;
  };

  useEffect(() => {
    (async () => {
      const sn = await getSerialNumber();
      setSerial(sn);
    })();
  }, []);

  useEffect(() => {
    if (initialized && serial !== undefined) {
      serial.substring(0, 3) == 'STR'
        ? discoverHandoffReader()
        : discoverLocalMobileReader();
    }
  }, [initialized, serial]);

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
    let payload = {
      paymentIntent: pi
    }
    if (settings.enableSurcharging) {
      payload.surchargeNotice = "A 2% surcharge will be added to cover credit card fees";
      payload.updatePaymentIntent = true;
    }
    const { error, paymentIntent } = await collectPaymentMethod(payload);
    if (error) {
      console.log("collectPaymentMethod error: ", error);
      return;
    }
    confirmPayment(paymentIntent, onSuccess);
  }

  const confirmPayment = async (pi, onSuccess) => {
    let payload = {
      paymentIntent: pi
    }
    if (settings.enableSurcharging) payload.amountSurcharge = 0.02 * pi.amount;
    const { error, paymentIntent } = await confirmPaymentIntent(payload);
    if (error) {
      console.log("confirmPaymentIntent error: ", error);
      return;
    }
    if (onSuccess) onSuccess();
  };

  // SETUP INTENTS
  const setup = async () => {
    const { error, setupIntent } = await createSetupIntent({
    });
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
    // console.log("confirmSetup: ", si);
    const { setupIntent, error } = await confirmSetupIntent({
      setupIntent: si,
    });
    // console.log("confirmSetupIntent: ", setupIntent);
    if (error) {
      console.log("confirmSetupIntent error: ", error);
      return;
    }
    else {
      const response = await fetch(backendUrl + '/payment-method/' + setupIntent.paymentMethodId, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Account': settings.account
        }
      });
      const data = await response.json();
      // console.log("confirmSetupIntent data: ", data);
      return data;
    }
  }

  return (
    <SafeAreaView style={css.app}>
      {!initialized &&
        <View style={{ justifyContent: 'center', flex: 1 }}>
          <ActivityIndicator size="large" color={'#36455A'} />
          <Text style={{ padding: 40 }}>{infoMsg}</Text>
        </View>
      }
      {initialized && <>
        {readerFound && formFactorDetermined
          ? <>
            <SettingsHandler serial={serial} setInfoMsg={setInfoMsg} />
            {!settings.account
              ? <View style={{ justifyContent: 'center', flex: 1 }}>
                <ActivityIndicator size="large" color={'#36455A'} />
                <Text style={{ padding: 40 }}>{infoMsg}</Text>
              </View>
              : <>
                {tablet && <>
                  {(page == 'Kiosk' || page == undefined) && <Kiosk columns={4} />}
                  {page == 'CheckoutKiosk' && <CheckoutKiosk pay={pay} />}
                </>}
                {!tablet && <>
                  <Header page={page} />
                  {(page == 'Calculator' || page == undefined) && <Calculator pay={pay} />}
                  {page == 'Products' && <Products pay={pay} />}
                  {page == 'Checkout' && <Checkout pay={pay} />}
                  {page == 'Transactions' && <Transactions setup={setup} />}
                  {page == 'Customers' && <Customers showLTV={true} mode='details' showIcons={true} />}
                  {page == 'Customer' && <Customer id={route.params.id} />}
                  {page == 'CustomerEntry' && <CustomerEntry origin={route.params.origin} />}
                  {page == 'Scanner' && <Scanner />}
                  {page == 'Settings' && <Settings />}
                  {/* {page == 'Kiosk' && <Kiosk columns={2} />}
                  {page == 'CheckoutKiosk' && <CheckoutKiosk pay={pay} />} */}
                </>}
              </>
            }

          </>
          : <>
            <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
              <FontAwesomeIcon icon={faTriangleExclamation} color={'#36455A'} size={30} />
              <Text style={{ padding: 40, lineHeight: 30 }}>No reader detected. The Stripe account may not be enabled for Apps on Device, or the device may not have the required specifications.</Text>
            </View>
          </>}
      </>
      }
    </SafeAreaView>
  );
}
