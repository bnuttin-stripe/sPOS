import { React, useState, useEffect } from 'react';
import { Text, Image, View, Pressable, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import * as Utils from '../utilities';
import { Camera, useCameraPermission, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';
import { css, colors } from '../styles';

export default Scanner = (props) => {
    const device = useCameraDevice('back');
    const { hasPermission } = useCameraPermission();
    const [foundCode, setFoundCode] = useState(false);
    const [code, setCode] = useState('');

    const codeScanner = useCodeScanner({
        codeTypes: ['qr', 'ean-13', 'code-128', 'pdf-417'],
        onCodeScanned: (codes) => {
            // console.log(codes[0]);
            setFoundCode(true);
            setCode(codes[0].value);
        }
    })

    return (
        <View style={css.container}>
            <View style={css.cameraPreview}>
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
