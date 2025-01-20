import { React, useState } from 'react';
import { View, Text, Pressable, Image, ActivityIndicator, Platform } from 'react-native';

import { useRecoilState, useRecoilValue, useResetRecoilState } from 'recoil';
import { cartAtom, settingsAtom, themesAtom, currentCustomerAtom } from '../atoms';

import { css, themeColors } from '../styles';
import { color } from 'react-native-elements/dist/helpers';

export default TTPIEducation = (props) => {
    const settings = useRecoilValue(settingsAtom);
    const themes = useRecoilValue(themesAtom);
    const colors = themes[settings.theme]?.colors;
    
    const [step, setStep] = useState(1);

    const styles = {
        page: {
            width: '100%',
            marginTop: 0
            // height: '100%',
        },
        header: {
            flexDirection: 'row',
            alignItems: 'flex-end',
            width: '100%',
            marginBottom: 20,
            // marginTop: 20
        },
        action: {
            // flex: 1,
            color: 'blue',
            fontSize: 16,
        },
        title: {
            // fontFamily: 'SF Pro',
            fontWeight: 'bold',
            fontSize: 20,
            marginBottom: 10
        },
        body: {
            fontSize: 16,
            marginBottom: 14
        },
        image: {
            // height: '40%',
            width: '100%',
            resizeMode: 'contain',
        }
    }

    const next = () => {
        if (step == 1) setStep(2);
        if (step == 2) setStep(3);
    }

    const previous = () => {
        if (step == 2) setStep(1);
        if (step == 3) setStep(2);
    }

    return (
        <View style={styles.page}>
            <View style={styles.header}>
                <Pressable onPress={previous} style={{ flex: 1 }}><Text style={styles.action}>{step !== 1 ? "Previous" : " "}</Text></Pressable>
                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center' }}><Text style={{ fontSize: 18, fontWeight: 'light' }}>Tutorial</Text></View>
                {step !== 3 &&<Pressable onPress={next} style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end' }}><Text style={styles.action}>Next</Text></Pressable>}
                {step == 3 && <Pressable onPress={() => props.setModalVisible(false)} style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end' }}><Text style={styles.action}>Close</Text></Pressable>}
            </View>
            {step == 1 && <>
                <Text style={styles.title}>Accept contactless payments with only an iPhone</Text>
                <Image style={[styles.image, { height: '50%', marginBottom: 20 }]} source={require('../assets/ttpi/step1.png')} />
                <Text style={styles.body}>With Tap to Pay on iPhone and Stripe, you can accept all types of in-person, contactless payments right on your iPhone — from physical debit and credit cards to Apple Pay and other digital wallets — no extra terminals or hardware needed.</Text>
                <Text style={styles.body}>It's easy, secure, and private.</Text>
            </>}
            {step == 2 && <>
                <Text style={styles.title}>How to accept contactless cards with Tap to Pay on iPhone</Text>
                <Image style={[styles.image, { height: '30%', marginBottom: 30 }]} source={require('../assets/ttpi/step2.png')} />
                <Text style={styles.body}>1. Open the Wick & Wool app on your iPhone, and select an amount in the Calculator screen, or build a cart in the Products screen and click the Pay button.</Text>
                <Text style={styles.body}>2. Present your iPhone to the customer.</Text>
                <Text style={styles.body}>3. Your customer holds their card horizontally at the top of your iPhone, over the contactless symbol.</Text>
                <Text style={styles.body}>4. When you see the Done checkmark, the card read is complete and the transaction is being processed.</Text>
            </>}
            {step == 3 && <>
                <Text style={styles.title}>How to accept Apple Pay and other digital wallets with Tap to Pay on iPhone</Text>
                <Image style={[styles.image, { height: '30%', marginBottom: 30 }]} source={require('../assets/ttpi/step3.png')} />
                <Text style={styles.body}>1. Open the Wick & Wool app on your iPhone, and select an amount in the Calculator screen, or build a cart in the Products screen and click the Pay button.</Text>
                <Text style={styles.body}>2. Present your iPhone to the customer.</Text>
                <Text style={styles.body}>3. Your customer holds their device at the top of your iPhone, over the contactless symbol.</Text>
                <Text style={styles.body}>4. When you see the Done checkmark, the card read is complete and the transaction is being processed.</Text>
            </>}
        </View>
    )
}

