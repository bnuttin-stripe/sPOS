import { React, useState, useEffect } from 'react';
import { Text, TextInput, View, Pressable, ScrollView, ActivityIndicator, Vibration } from 'react-native';
import * as Utils from '../utilities';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowTurnLeft } from '@fortawesome/pro-light-svg-icons';
import { useRecoilValue } from 'recoil';
import { settingsAtom } from '../atoms';
import { css, colors } from '../styles';

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
    const settings = useRecoilValue(settingsAtom);

    const getTransaction = async () => {
        setIsLoading(true);
        const response = await fetch(settings.backendUrl + '/transaction/' + props.pi.id, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        const data = await response.json();
        setTransaction(data);
        setIsLoading(false);
    };

    const refundTransaction = async () => {
        Vibration.vibrate(100);
        setIsRefunding(true);
        const response = await fetch(settings.backendUrl + '/refund', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: props.pi.id
            })
        });
        const data = await response.json();
        setTransaction(data);
        setIsRefunding(false);
    }

    useEffect(() => {
        getTransaction();
    }, []);

    return (
        <View style={css.container}>
            {isLoading && <View style={css.loader}>
                <ActivityIndicator size="large" color={colors.slate} />
            </View>}
            {!isLoading && <View>
                <Text style={css.label}>Order ID</Text>
                <TextInput
                    style={css.input}
                    value={transaction?.metadata?.orderNumber}
                    editable={false}
                />

                <Text style={css.label}>Date</Text>
                <TextInput
                    style={css.input}
                    value={Utils.displayDateTime(transaction?.created)}
                    editable={false}
                />

                <Text style={css.label}>Status</Text>
                <TextInput
                    style={css.input}
                    value={status(transaction)}
                    editable={false}
                />

                <Text style={css.label}>Amount</Text>
                <TextInput
                    style={css.input}
                    value={Utils.displayPrice(transaction?.amount_received / 100, 'usd')}
                    editable={false}
                />

                {status(transaction) == 'Succeeded' && <View style={css.row}>
                    <Pressable style={[css.button, { backgroundColor: colors.yellow, color: 'white' }]} onPress={refundTransaction}>
                        {!isRefunding && <>
                            <FontAwesomeIcon icon={faArrowTurnLeft} color={'white'} size={24} />
                            <Text style={css.buttonText}>Refund</Text>
                        </>}
                        {isRefunding &&
                            <ActivityIndicator size="large" color="white" />
                        }
                    </Pressable>
                </View>}


                {/* <View style={css.row}>
                    <Text style={styles.label}>Order ID</Text>
                    <Text style={styles.value}>{transaction?.metadata?.orderNumber}</Text>
                </View>
                <View style={css.row}>
                    <Text style={styles.label}>Date</Text>
                    <Text style={styles.value}>{Utils.displayDateTime(transaction?.created)}</Text>
                </View>
                <View style={css.row}>
                    <Text style={styles.label}>Status</Text>
                    <Text style={styles.value}>{status(transaction)}</Text>
                </View>
                <View style={css.row}>
                    <Text style={styles.label}>Amount</Text>
                    <Text style={styles.value}>{Utils.displayPrice(transaction?.amount_received / 100, 'usd')}</Text>
                </View>
                {status(transaction) == 'Succeeded' && <View style={styles.row}>
                    <Pressable style={[css.button, { backgroundColor: colors.yellow, color: 'white' }]} onPress={refundTransaction}>
                        {!isRefunding && <>
                            <FontAwesomeIcon icon={faArrowTurnLeft} color={'white'} size={24} />
                            <Text style={css.buttonText}>Refund</Text>
                        </>}
                        {isRefunding &&
                            <ActivityIndicator size="large" color="white" />
                        }
                    </Pressable>
                </View>} */}


            </View>}
        </View>
    )
}

// const styles = {
//     container: {
//         flex: 1,
//         flexDirection: 'row',
//         justifyContent: 'center',
//         alignItems: 'flex-start',
//         margin: 20,
//     },
//     row: {
//         width: '100%',
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         padding: 10,
//         // borderBottomWidth: 1,
//         // borderBottomColor: '#425466',
//     },
//     label: {
//         flex: 1,
//         flexDirection: 'row',
//         fontSize: 18,
//         color: '#425466',
//         fontWeight: 'bold',
//     },
//     value: {
//         flex: 2,
//         flexDirection: 'row',
//         fontSize: 18,
//         justifyContent: 'flex-start',
//         alignItems: 'flex-start',
//     },
//     button: {
//         height: 50,
//         justifyContent: 'center',
//         flexDirection: 'row',
//         alignItems: 'center',
//         borderRadius: 5,
//         backgroundColor: '#FFBB00',
//         margin: -10,
//         color: 'white',
//         marginTop: 10,
//         paddingLeft: 20,
//         paddingRight: 20,
//     }
// }
