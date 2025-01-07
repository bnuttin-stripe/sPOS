import { React } from 'react';
import { View, Text } from 'react-native';
import { usePowerState } from 'react-native-device-info';

import { useRecoilValue } from 'recoil';
import { settingsAtom } from '../atoms';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faBatteryExclamation, faBattery1, faBattery2, faBattery3, faBattery4, faBattery5, faBatteryBolt } from '@fortawesome/pro-regular-svg-icons';

import { css, themeColors } from '../styles';

export default StatusBar = (props) => {
    const powerState = usePowerState();
    const settings = useRecoilValue(settingsAtom);
    const colors = themeColors[settings.theme];

    return (
        <>
            <View style={styles.indicator}>
                <Text style={{ fontSize: 30, color: props.paymentStatus == 'ready' ? colors.success : colors.danger, marginTop: -4, marginRight: 4 }}>•</Text>
                {settings.isAOD
                    ? powerState.batteryState != 'charging'
                        ? <>
                            {powerState.batteryLevel <= 0.05 && <FontAwesomeIcon icon={faBatteryExclamation} style={styles.level} size={22} />}
                            {powerState.batteryLevel > 0.05 && powerState.batteryLevel <= .15 && <FontAwesomeIcon icon={faBattery1} style={styles.level} size={22} />}
                            {powerState.batteryLevel > 0.15 && powerState.batteryLevel <= .33 && <FontAwesomeIcon icon={faBattery2} style={styles.level} size={22} />}
                            {powerState.batteryLevel > 0.33 && powerState.batteryLevel <= .50 && <FontAwesomeIcon icon={faBattery3} style={styles.level} size={22} />}
                            {powerState.batteryLevel > 0.50 && powerState.batteryLevel <= .75 && <FontAwesomeIcon icon={faBattery4} style={styles.level} size={22} />}
                            {powerState.batteryLevel > 0.75 && <FontAwesomeIcon icon={faBattery5} style={styles.level} size={22} />}
                        </>
                        : <>
                            <FontAwesomeIcon icon={faBatteryBolt} style={styles.level} size={22} />
                        </>
                    : <></>
                }
            </View>
        </>
    )
}

const styles = {
    indicator: {
        flexDirection: 'row',
        position: 'absolute',
        right: 10,
        alignItems: 'center'
    },
    level: {
        color: 'white',
    },
};
