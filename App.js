import { React, useEffect, useState } from 'react';
import { AppState, Text, View, PermissionsAndroid, ActivityIndicator, SafeAreaView, Platform } from 'react-native';
import { getSerialNumber, isTablet, getModel } from 'react-native-device-info';
import { TapZoneIndicator, useStripeTerminal } from '@stripe/stripe-terminal-react-native';
import { css } from './styles';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTriangleExclamation } from '@fortawesome/pro-solid-svg-icons';

import { useRecoilState, useRecoilValue, useResetRecoilState } from 'recoil';
import { settingsAtom, logAtom } from './atoms';

import Header from './components/Header';
import Calculator from './components/Calculator';
import Products from './components/Products';
import Checkout from './components/Checkout';
import Transactions from './components/Transactions';
import Customers from './components/Customers';
import Customer from './components/Customer';
import CustomerEntry from './components/CustomerEntry';
import Settings from './components/Settings';
import LogViewer from './components/LogViewer';
import SettingsHandler from './components/SettingsHandler';
import Kiosk from './components/Kiosk';
import KioskCheckout from './components/KioskCheckout';

import * as Utils from './utilities';

export default function App({ route }) {
  const page = route.params?.page;
  const backendUrl = process.env.EXPO_PUBLIC_API_URL;
  const settings = useRecoilValue(settingsAtom);
  const [serial, setSerial] = useState();

  const { initialize } = useStripeTerminal();
  const [initialized, setInitialized] = useState(false);
  const [infoMsg, setInfoMsg] = useState('Initializing Stripe Terminal');

  const [reader, setReader] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('');
  const [logs, setLogs] = useRecoilState(logAtom);

  useEffect(() => {
    (async () => {
      const sn = await getSerialNumber();
      setSerial(sn);
    })();
  }, []);

  const [appState, setAppState] = useState(AppState.currentState);
  // Handle app state updates - necessary to reconnect to the reader when app brought back to foreground
  useEffect(() => {
    // return;
    const handleAppStateChange = (nextAppState) => {
      setAppState(nextAppState);
    };

    AppState.addEventListener('change', handleAppStateChange);

    return () => {
      AppState.removeEventListener('change', handleAppStateChange);
    };
  }, []);

  const Log = (title, data) => {
    console.log(title, data);
    setLogs([...logs, {
      time: Date.now(),
      title: title,
      body: JSON.stringify(data, null, 2)
    }]);
  }

  const { createPaymentIntent, setLocalMobileUxConfiguration, collectPaymentMethod, confirmPaymentIntent, createSetupIntent, collectSetupIntentPaymentMethod, confirmSetupIntent, getPaymentMethod } = useStripeTerminal();

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
      // For iOS permissions are handled in the info.plist
      await initializeReader();
    }
  }

  const initializeReader = async () => {
    setInfoMsg("Starting reader software");
    const { error, reader } = await initialize();

    if (error) {
      setInfoMsg('StripeTerminal init failed - ' + error.message);
      Log('initializeReader', error)
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

  // Event-based function calls
  const { discoverReaders, connectHandoffReader, connectLocalMobileReader } =
    useStripeTerminal({
      onUpdateDiscoveredReaders: (readers) => {
        Log('onUpdateDiscoveredReaders', readers)
        if (readers.length > 0) {
          setReader(readers[0]);
          readers[0].serialNumber?.substring(0, 3) == 'STR'
            ? connectAODReader(readers[0])
            : connectTTPReader(readers[0])
        }
        else {
          setInfoMsg("No reader found");
        }
      },
      onFinishDiscoveringReaders: (error) => {
        Log("onFinishDiscoveringReaders", error);
      },
      onDidChangeOfflineStatus: (status) => {
        Log('onDidChangeOfflineStatus', status)
      },
      onDidSucceedReaderReconnect: () => {
        Log("onDidSucceedReaderReconnect", "");
      },
      onDidChangePaymentStatus: (status) => {
        Log('onDidChangePaymentStatus', status)
        setPaymentStatus(status);
      },
      onDidDisconnect: (reason) => {
        Log('onDidDisconnect', reason);
      },
      onDidReportUnexpectedReaderDisconnect: (error) => {
        Log('onDidReportUnexpectedReaderDisconnect', error);
      },
      onDidChangeConnectionStatus: (status) => {
        Log('onDidChangeConnectionStatus', status);
      },
    });

  // Step 1 - discover readers
  const discoverHandoffReader = async () => {
    const { error } = await discoverReaders({
      discoveryMethod: 'handoff'
    });
    if (error) {
      setInfoMsg('Failed to discover handoff reader. ' + error.message);
      Log("discoverHandoffReader", error);
    }
  };

  const discoverLocalMobileReader = async () => {
    const { error } = await discoverReaders({
      discoveryMethod: 'localMobile',
      // simulated: true
    });
    if (error) {
      setInfoMsg('Failed to discover readers. ' + error.message);
      Log("discoverLocalMobileReader", error);
    }
  };

  // Setp 2 - connect to reader
  const connectAODReader = async (reader) => {
    const { error } = await connectHandoffReader({
      reader: reader
    });
    if (error) {
      setInfoMsg('Failed to discover readers. ' + error.message);
      Log("connectHandoffReader", error);
      return;
    }
    return;
  };

  const connectTTPReader = async (reader) => {
    const { error } = await connectLocalMobileReader({
      reader: reader,
      locationId: process.env.EXPO_PUBLIC_TTPA_LOCATION
    });
    if (error) {
      setInfoMsg('Failed to discover readers. ' + error.message);
      Log("connectLocalMobileReader", error);
      return;
    }
    return;
  };

  const reconnectReader = async () => {
    if (reader && reader.serialNumber && reader.status == 'offline') {
      Log("reconnectReader", reader);
      reader.serialNumber.substring(0, 3) == 'STR'
        ? connectAODReader(reader)
        : connectTTPReader(reader)
    }
  }

  // For iOS
  useEffect(() => {
    // return;
    if (appState == 'active') {
      reconnectReader();
    }
  }, [appState]);

  useEffect(() => {
    if (initialized && serial !== undefined) {
      serial.substring(0, 3) == 'STR'
        ? discoverHandoffReader()
        : discoverLocalMobileReader();
    }
    Log("model", getModel());
  }, [initialized, serial]);

  /// PAYMENT INTENTS
  const pay = async (payload, onSuccess) => {
    if (settings?.model == '22in-I-Series-4' || settings?.model == 'K2_A13') {
      const { uxError } = await setLocalMobileUxConfiguration({
        tapZone: {
          tapZoneIndicator: TapZoneIndicator.BELOW,
          tapZonePosition: {
            xBias: 0.5,
            yBias: 1
          }
        }
      });
    }
    const { error, paymentIntent } = await createPaymentIntent(payload);
    if (error) {
      Log("createPaymentIntent", error);
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
      Log("collectPaymentMethod", error);
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
      Log("confirmPaymentIntent", error);
      return;
    }
    if (onSuccess) onSuccess(paymentIntent);
  };

  // SETUP INTENTS
  const setup = async () => {
    const { error, setupIntent } = await createSetupIntent({
    });
    if (error) {
      Log("createSetupIntent", error);
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
      Log("collectSetupIntentPaymentMethod", error);
      return;
    }
    return confirmSetup(setupIntent);
  }

  const confirmSetup = async (si) => {
    const { setupIntent, error } = await confirmSetupIntent({
      setupIntent: si,
    });
    if (error) {
      Log("confirmSetupIntent", error);
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
        {reader
          ? <>
            <SettingsHandler serial={serial} setInfoMsg={setInfoMsg} />
            {!settings.account
              ? <View style={{ justifyContent: 'center', flex: 1 }}>
                <ActivityIndicator size="large" color={'#36455A'} />
                <Text style={{ padding: 40 }}>{infoMsg}</Text>
              </View>
              : <>
                {isTablet() && <>
                  {(page == 'Kiosk' || page == undefined) && <Kiosk columns={4} />}
                  {page == 'KioskCheckout' && <KioskCheckout pay={pay} />}
                </>}
                {!isTablet() && <>
                  <Header page={page} reader={reader} paymentStatus={paymentStatus} />
                  {(page == 'Calculator' || page == undefined) && <Calculator pay={pay} />}
                  {page == 'Products' && <Products pay={pay} />}
                  {page == 'Checkout' && <Checkout pay={pay} />}
                  {page == 'Transactions' && <Transactions setup={setup} />}
                  {page == 'Customers' && <Customers showLTV={true} mode='details' showIcons={true} />}
                  {page == 'Customer' && <Customer id={route.params.id} setup={setup} />}
                  {page == 'CustomerEntry' && <CustomerEntry origin={route.params.origin} />}
                  {page == 'Scanner' && <Scanner />}
                  {page == 'Settings' && <Settings reconnectReader={reconnectReader} />}
                  {page == 'Log' && <LogViewer />}
                </>}
              </>
            }

          </>
          : <>
            {/* <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
              <FontAwesomeIcon icon={faTriangleExclamation} color={'#36455A'} size={30} />
              <Text style={{ padding: 40, lineHeight: 30 }}>No reader detected. The Stripe account may not be enabled for Apps on Device, or the device may not have the required specifications.</Text>
            </View> */}
            <View style={{ justifyContent: 'center', flex: 1 }}>
              <ActivityIndicator size="large" color={'#36455A'} />
              <Text style={{ padding: 40 }}>{infoMsg}</Text>
            </View>
          </>}
      </>
      }
    </SafeAreaView>
  );
}
