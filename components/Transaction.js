import { React, useState, useEffect } from 'react';
import { Text, Image, View, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import * as Utils from '../utilities';
import { DataTable } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowTurnLeft } from '@fortawesome/pro-light-svg-icons';

const status = (pi) => {
    if (pi.latest_charge.amount_refunded > 0) {
        return 'Refunded';
    } else {
        return 'Succeeded';
    }
}

export default Transaction = (props) => {
    const [transaction, setTransaction] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefunding, setIsRefunding] = useState(false);
    const navigation = useNavigation();

    const getTransaction = async () => {
        setIsLoading(true);
        const response = await fetch(`https://western-honey-chamomile.glitch.me/transaction/` + props.pi.id, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        const data = await response.json();
        // console.log(data);
        setTransaction(data);
        setIsLoading(false);
    };

    const refundTransaction = async () => {
        setIsRefunding(true);
        const response = await fetch(`https://western-honey-chamomile.glitch.me/refund`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: props.pi.id
            })
        });
        const data = await response.json();
        console.log(data);
        setTransaction(data);
        setIsRefunding(false);
    }

    useEffect(() => {
        getTransaction();
    }, []);

    return (
        <View style={styles.container}>
            {isLoading && <View style={styles.loader}>
                <ActivityIndicator size="large" color="#425466" />
            </View>}
            {!isLoading && <View>
                <View style={styles.row}>
                    <Text style={styles.label}>Order ID</Text>
                    <Text style={styles.value}>{transaction?.metadata?.orderNumber}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Date</Text>
                    <Text style={styles.value}>{Utils.displayDateTime(transaction?.created)}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Status</Text>
                    <Text style={styles.value}>{status(transaction)}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Amount</Text>
                    <Text style={styles.value}>{Utils.displayPrice(transaction?.amount_received / 100, 'usd')}</Text>
                </View>
                {status(transaction) == 'Succeeded' && <View style={styles.row}>
                    <Pressable style={styles.tile} onPress={refundTransaction}>
                        {!isRefunding && <>
                            <FontAwesomeIcon icon={faArrowTurnLeft} color={'white'} size={32} />
                            <Text style={{ color: 'white' }}>Refund</Text>
                        </>}
                        {isRefunding &&
                            <ActivityIndicator size="large" color="white" />
                        }
                    </Pressable>
                </View>}
            </View>}
        </View>
    )
}

const styles = {
    container: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-start',
        margin: 20,
    },
    loader: {
        justifyContent: 'center',
        flexDirection: 'column',
        height: '100%'
    },
    row: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        // borderBottomWidth: 1,
        // borderBottomColor: '#425466',
    },
    label: {
        flex: 1,
        flexDirection: 'row',
        fontSize: 20,
        color: '#425466',
        fontWeight: 'bold',
    },
    value: {
        flex: 2,
        flexDirection: 'row',
        fontSize: 20,
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
    },
    tile: {
        width: '100%',
        height: 80,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 7,
        borderColor: 'white',
        borderRadius: 20,
        backgroundColor: '#FFBB00',
        margin: -10,
        color: 'white',
    }
}
