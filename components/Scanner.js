import { React, useState, useEffect } from 'react';
import { Text, Image, View, Pressable, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import * as Utils from '../utilities';
import { Camera, useCameraPermission, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';

export default Scanner = (props) => {
    const device = useCameraDevice('back');
    const { hasPermission } = useCameraPermission();
    const [foundCode, setFoundCode] = useState(false);
    const [code, setCode] = useState('');

    const codeScanner = useCodeScanner({
        codeTypes: ['qr', 'ean-13'],
        onCodeScanned: (codes) => {
            setFoundCode(true);
            setCode(codes[0].value);
            //console.log(`Scanned ${codes.length} codes!`)
        }
    })

    return (
        <View style={styles.container}>
            <View style={styles.viewport}>
                <Camera
                    style={StyleSheet.absoluteFill}
                    device={device}
                    isActive={!foundCode}
                    photo={true}
                    resizeMode="cover"
                    codeScanner={codeScanner}
                />
            </View>
            <Text>{code}</Text>
        </View>
    )
}

const styles = {
    container: {
        flex: 1,
        width: '100%'
        // flexDirection: 'row',
        // justifyContent: 'center',
        // alignItems: 'flex-start',
        // margin: 20,
        // backgroundColor: 'black'
    },
    viewport: {
        margin: 15,
        height: '40%',
    },
    camera: {
        //height: '33%',
        // margin: 10,
    }
}
