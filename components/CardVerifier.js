import { React, useState, useEffect } from 'react';
import { Text, View, Pressable, ScrollView, RefreshControl, Modal, ActivityIndicator } from 'react-native';
import { DataTable } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

import { useRecoilState, useRecoilValue } from 'recoil';
import { transactionAtom, settingsAtom } from '../atoms';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowsRotate, faXmark, faArrowRightArrowLeft, faBoxCheck, faCircleCheck, faCircleExclamation, faBan, faMagnifyingGlass } from '@fortawesome/pro-solid-svg-icons';

import * as Utils from '../utilities';
import { css, themeColors } from '../styles';

export default CardVerifier = (props) => {
    const settings = useRecoilValue(settingsAtom);
    const colors = themeColors[settings.theme];

    const [verificationPM, setVerificationPM] = useState(null);
    const [verificationSuccessful, setVerificationSuccessful] = useState(null);
    const [showVerificationResults, setShowVerificationResults] = useState(false);

    const checkCard = async () => {
        const pm = await props.setup();
        setVerificationPM(pm);
    }

    // useEffect(() => {
    //     console.log("verificationPM",verificationPM);
    //     console.log("verificationSuccessful", verificationSuccessful);
    //     console.log("props.pi", props.pi);
    // }, [])

    useEffect(() => {
        if (verificationPM != null) {
            setVerificationSuccessful(cardValid());
        }
        else {
            setVerificationSuccessful(null);
        }
    }, [verificationPM, props.pi]);

    useEffect(() => {
        setShowVerificationResults(verificationSuccessful !== null);
    }, [verificationSuccessful]);

    const cardValid = () => {
        console.log("verificationPM", verificationPM);
        if (verificationPM == null) return false;
        return verificationPM?.card_present?.fingerprint == props.pi?.latest_charge?.payment_method_details?.card?.fingerprint ||
            verificationPM?.card_present?.fingerprint == props.pi?.latest_charge?.payment_method_details?.card_present?.fingerprint ||
            verificationPM?.card_present?.payment_account_reference == props.pi?.latest_charge?.payment_method_details?.card?.payment_account_reference ||
            verificationPM?.card_present?.payment_account_reference == props.pi?.latest_charge?.payment_method_details?.card_present?.payment_account_reference
    }

    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 12, flex: 1 }}>
            {showVerificationResults
                ? verificationSuccessful
                    ? <><FontAwesomeIcon icon={faCircleCheck} color={colors.success} size={14} />
                        <Text style={{ color: colors.success, fontSize: 14, marginLeft: 5 }}>Match</Text></>
                    : <><FontAwesomeIcon icon={faCircleExclamation} color={colors.danger} size={14} />
                        <Text style={{ color: colors.danger, fontSize: 14, marginLeft: 5 }}>No Match</Text></>
                : <Pressable onPress={checkCard}>
                    <Text style={[css.inlineButton, { backgroundColor: colors.primary }]}>Check</Text>
                </Pressable>
            }
        </View>
    )
}