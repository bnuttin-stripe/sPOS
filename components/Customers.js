import { React, useState, useEffect } from 'react';
import { Text, View, Pressable, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import * as Utils from '../utilities';
import { DataTable, shadow } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useRecoilState, useRecoilValue } from 'recoil';
import { customerAtom, settingsAtom } from '../atoms';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faBarcodeRead, faXmark, faChevronRight } from '@fortawesome/pro-light-svg-icons';
import { css, colors } from '../styles';
import CartDrawer from './CartDrawer';
import { Camera, useCameraPermission, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';
import { height } from '@fortawesome/free-brands-svg-icons/fa42Group';


export default Customers = (props) => {
    const navigation = useNavigation();
    const [refreshing, setRefreshing] = useState(false);
    const [customers, setCustomers] = useRecoilState(customerAtom);
    const settings = useRecoilValue(settingsAtom);
    const device = useCameraDevice('back');

    const [scannerOpen, setScannerOpen] = useState(false);
    const [foundCode, setFoundCode] = useState(false);

    const codeScanner = useCodeScanner({
        codeTypes: ['pdf-417'],
        onCodeScanned: (codes) => {
            console.log(codes[0].value);
            const customerDetails = codes[0].value.split('\n');
            const lastNameRegex = /(?:\nDCS)(.*)(?:\n)/;
            console.log(lastNameRegex.exec(codes[0].value)[1]);
            return;
            const foundProduct = products.find(x => x.id == codes[0].value);
            const productInCart = cart.find(x => x.id == codes[0].value);
            if (!productInCart) {
                setCart([...cart, foundProduct]);
                setFoundCode(true);
            }
        }
    })

    const Row = (customer) => {
        return (
            <Pressable key={customer.id} onPress={() => console.log(customer)}>
                <DataTable.Row>
                    <DataTable.Cell style={{ flex: 5, paddingTop: 8, paddingBottom: 8, paddingRight: 5 }}>
                        <Text>
                            {customer.name}
                        </Text>
                    </DataTable.Cell>
                    <DataTable.Cell style={{ flex: 5, paddingTop: 8, paddingBottom: 8, paddingRight: 5 }}>
                        <Text>
                            {customer.email}
                        </Text>
                    </DataTable.Cell>
                </DataTable.Row>
            </Pressable >
        )
    }

    const getCustomers = async () => {
        setRefreshing(true);
        const response = await fetch(settings.backendUrl + '/customers', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const data = await response.json();
        setCustomers(data);
        setRefreshing(false);
    };

    useEffect(() => {
        getCustomers();
    }, []);

    return (
        <View style={[css.container, { padding: 0 }]}>
            <DataTable style={{ flex: 1 }}>
                <DataTable.Header style={css.tableHeader}>
                    <DataTable.Title style={{ flex: 5 }}>Name</DataTable.Title>
                    <DataTable.Title style={{ flex: 2 }}>Email</DataTable.Title>
                </DataTable.Header>
                <ScrollView
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={getCustomers}
                            progressViewOffset={150}
                            colors={['white']}
                            progressBackgroundColor={colors.slate}
                        />
                    }
                >
                    {customers.length > 0 && customers.map && customers.map((customer) => Row(customer))}
                </ScrollView>
            </DataTable>
            {scannerOpen && <>
                <View style={styles.cameraPreview}>
                    <Camera
                        style={StyleSheet.absoluteFill}
                        device={device}
                        isActive={!foundCode}
                        photo={true}
                        resizeMode="cover"
                        codeScanner={codeScanner}
                    />
                </View>
                <Pressable style={[styles.floatingIcon, { left: 20, backgroundColor: colors.yellow }]} onPress={() => setScannerOpen(false)}>
                    <FontAwesomeIcon icon={faXmark} color={'white'} size={18} />
                </Pressable>
                <Pressable style={[styles.floatingIcon, { left: 80, backgroundColor: colors.blurple }]} onPress={() => setFoundCode(false)}>
                    <FontAwesomeIcon icon={faChevronRight} color={'white'} size={18} />
                </Pressable>
            </>}
            {!scannerOpen && <>
                <Pressable style={[styles.floatingIcon, { left: 20, backgroundColor: colors.blurple }]} onPress={() => setScannerOpen(true)}>
                    <FontAwesomeIcon icon={faBarcodeRead} color={'white'} size={18} />
                </Pressable>
            </>}
            <CartDrawer />
        </View>
    )
}

const styles = {
    cameraPreview: {
        // margin: 10,
        height: '40%',
        // borderWidth: 2,
        borderColor: colors.slate
    },
    floatingIcon: {
        position: 'absolute',
        color: 'white',
        bottom: 100,
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 25,
        shadownColor: 'black',
        elevation: 8,
    },
}