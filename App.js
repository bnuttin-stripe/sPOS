import { React, useEffect, useState } from 'react';
import { StyleSheet, Text, View, PermissionsAndroid, Animated } from 'react-native';
import { useStripeTerminal } from '@stripe/stripe-terminal-react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faLoader } from '@fortawesome/pro-light-svg-icons';

import Calculator from './components/Calculator';

export default function App() {
  const { initialize } = useStripeTerminal();
  const [ initialized, setInitialized ] = useState(false);

  const checkPermissionsAndInitialize = async () => {
    //console.log("Requesting location permissions");
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission',
        message: 'Stripe Terminal needs access to your location',
        buttonPositive: 'Accept',
      }
    );
    //console.log(granted);
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      //console.log('You can use the Location');
      await initializeReader();
    } else {
      console.error(
        'Location services are required in order to connect to a reader.'
      );
    }
  }

  const initializeReader = async () => {
    const { error, reader } = await initialize();

    if (error) {
      Alert.alert('StripeTerminal init failed', error.message);
      return;
    }

    if (reader) {
      console.log('StripeTerminal has been initialized properly and connected to the reader',reader);
      return;
    }

    setInitialized(true);
    console.log('StripeTerminal has been initialized properly');
  };

  useEffect(() => {
    checkPermissionsAndInitialize();
  }, []);


  const { discoverReaders, discoveredReaders, connectHandoffReader } =
    useStripeTerminal({
      onUpdateDiscoveredReaders: (readers) => {
        console.log("onUpdateDiscoveredReaders");
        // console.log(readers);
        // console.log("Will connect to reader " + readers[0]?.id);
        connectReader(readers[0]);
      },
      onFinishDiscoveringReaders: (error) => {
        console.log("onFinishDiscoveringReaders");
        // console.log(error);
      },
      onDidChangeOfflineStatus: (status) => {
        console.log("onDidChangeOfflineStatus");
        // console.log(status);
        //setReaderStatus(status);
      },
      onDidSucceedReaderReconnect: () => {
        console.log("onDidSucceedReaderReconnect");
      },
      onDidChangePaymentStatus: (status) => {
        console.log("onDidChangePaymentStatus");
        console.log(status);
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
    //console.log("Reader connected", setHandoffReader);
    return;
};

  useEffect(() => {
    if (initialized) discoverHandoffReader();
  }, [initialized]);

  return (
    <View style={styles.container}>
      {!initialized &&
        <View style={styles.container}>
          <FontAwesomeIcon icon={faLoader} color={'gray'} size={128} style={{ marginBottom: 40 }} />
          <Text>Initializing, please wait...</Text>
        </View>
      }
      {initialized && <Calculator />}
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
