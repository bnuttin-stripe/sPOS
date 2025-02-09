import { React } from 'react';
import { View, Text } from 'react-native';
import { usePowerState } from 'react-native-device-info';

import { useRecoilValue } from 'recoil';
import { settingsAtom, themesAtom } from '../atoms';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCircle, faLink, faLinkSlash, faBatteryExclamation, faBattery1, faBattery2, faBattery3, faBattery4, faBattery5, faBatteryBolt } from '@fortawesome/pro-regular-svg-icons';

import { css } from '../styles';

export default StatusBar = (props) => {
    const powerState = usePowerState();
    const settings = useRecoilValue(settingsAtom);
    const themes = useRecoilValue(themesAtom);
    const colors = themes[settings.theme]?.colors || themes['default'].colors;

    return (
        <>
            <View style={styles.indicator}>
                {/* <Text style={{ fontSize: 30, color: props.paymentStatus == 'ready' ? '#00C851' : '#ff4444', marginTop: -4, marginRight: 4 }}>•</Text> */}
                {/* <FontAwesomeIcon icon={props.paymentStatus == 'ready' ? faLink : faLinkSlash} style={{ color: props.paymentStatus == 'ready' ? '#00C851' : '#ff4444' }} size={18} /> */}
                <FontAwesomeIcon icon={props.paymentStatus == 'ready' ? faLink : faLinkSlash} style={{ color: colors.bannerText }} size={18} />
                {settings.isAOD
                    ? powerState.batteryState != 'charging'
                        ? <>
                            {powerState.batteryLevel <= 0.05 && <FontAwesomeIcon icon={faBatteryExclamation} style={styles.level} size={18} />}
                            {powerState.batteryLevel > 0.05 && powerState.batteryLevel <= .15 && <FontAwesomeIcon icon={faBattery1} style={styles.level} size={18} />}
                            {powerState.batteryLevel > 0.15 && powerState.batteryLevel <= .33 && <FontAwesomeIcon icon={faBattery2} style={styles.level} size={18} />}
                            {powerState.batteryLevel > 0.33 && powerState.batteryLevel <= .50 && <FontAwesomeIcon icon={faBattery3} style={styles.level} size={18} />}
                            {powerState.batteryLevel > 0.50 && powerState.batteryLevel <= .75 && <FontAwesomeIcon icon={faBattery4} style={styles.level} size={18} />}
                            {powerState.batteryLevel > 0.75 && <FontAwesomeIcon icon={faBattery5} style={styles.level} size={18} />}
                        </>
                        : <>
                            <FontAwesomeIcon icon={faBatteryBolt} style={styles.level} size={18} />
                        </>
                    : <></>
                }
            </View>
        </>
    );
};

const styles = {
    indicator: {
        flexDirection: 'row',
        position: 'absolute',
        right: 12,
        top: 12,
        alignItems: 'center'
    },
    level: {
        color: 'white',
        marginLeft: 6
    },
};
