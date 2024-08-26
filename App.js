import { React, useEffect, useState } from 'react';
import { StyleSheet, Text, View, PermissionsAndroid, ActivityIndicator, RefreshControl } from 'react-native';
import { useStripeTerminal } from '@stripe/stripe-terminal-react-native';

import Header from './components/Header';
import Calculator from './components/Calculator';
import Transactions from './components/Transactions';
import Transaction from './components/Transaction';
import Scanner from './components/Scanner';

export default function App({ navigation, route }) {
  const page = route.params?.page ?? 'Calculator';

  const { initialize } = useStripeTerminal();
  const [initialized, setInitialized] = useState(false);
  const [infoMsg, setInfoMsg] = useState('Initializing Stripe Terminal');

  const checkPermissionsAndInitialize = async () => {
    setInfoMsg(infoMsg + "\nChecking location permissions");
    const cameraPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: 'Camera Permission',
        message: 'Stripe Terminal needs access to your camera',
        buttonPositive: 'Accept',
      }
    );
    console.log(cameraPermission);
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission',
        message: 'Stripe Terminal needs access to your location',
        buttonPositive: 'Accept',
      }
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      setInfoMsg(infoMsg + "\nLocation permissions checked");
      await initializeReader();
    } else {
      console.error(
        'Location services are required in order to connect to a reader.'
      );
    }
  }

  const initializeReader = async () => {
    setInfoMsg(infoMsg + "\nStarting reader software");
    const { error, reader } = await initialize();

    if (error) {
      Alert.alert('StripeTerminal init failed', error.message);
      return;
    }

    if (reader) {
      setInfoMsg(infoMsg + "\nStripe Terminal has been initialized properly");
      console.log('StripeTerminal has been initialized properly and connected to the reader', reader);
      return;
    }

    setInitialized(true);
    console.log('Stripe Terminal has been initialized properly');
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
        console.log("onFinishDiscoveringReaders");
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
      console.log('Failed to discover readers.\n' + error.message);
    }
  };

  const connectReader = async (reader) => {
    const { error } = await connectHandoffReader({
      reader: reader
    });
    if (error) {
      console.log('connectHandoffReader error:', error);
      return;
    }
    return;
  };

  useEffect(() => {
    if (initialized) discoverHandoffReader();
  }, [initialized]);

  return (
    <View style={styles.container}>
      <Header page={page}/>

      {!initialized &&
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#425466"/>
          <Text style={{ padding: 40 }}>{infoMsg}</Text>
        </View>
      }
      {initialized &&
        <>
          {page == 'Calculator' && <Calculator />}
          {page == 'Transactions' && <Transactions/>}
          {page == 'Transaction' && <Transaction pi={route.params?.pi} />}
          {page == 'Scanner' && <Scanner />}
        </>
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  }
});
