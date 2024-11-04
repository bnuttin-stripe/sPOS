import { React } from 'react';
import { View } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faBatteryExclamation, faBattery1, faBattery2, faBattery3, faBattery4, faBattery5, faBatteryBolt } from '@fortawesome/pro-regular-svg-icons';
import { css, colors } from '../styles';
import { usePowerState, getCarrier } from 'react-native-device-info';

export default BatteryIndicator = () => {
    const powerState = usePowerState();

    return (
        <>
            <View style={styles.indicator}>
                {powerState.batteryState != 'charging' && <>
                    {powerState.batteryLevel <= 0.05 && <FontAwesomeIcon icon={faBatteryExclamation} style={styles.level} size={22} />}
                    {powerState.batteryLevel > 0.05 && powerState.batteryLevel <= .15 && <FontAwesomeIcon icon={faBattery1} style={styles.level} size={22} />}
                    {powerState.batteryLevel > 0.15 && powerState.batteryLevel <= .33 && <FontAwesomeIcon icon={faBattery2} style={styles.level} size={22} />}
                    {powerState.batteryLevel > 0.33 && powerState.batteryLevel <= .50 && <FontAwesomeIcon icon={faBattery3} style={styles.level} size={22} />}
                    {powerState.batteryLevel > 0.50 && powerState.batteryLevel <= .75 && <FontAwesomeIcon icon={faBattery4} style={styles.level} size={22} />}
                    {powerState.batteryLevel > 0.75 && <FontAwesomeIcon icon={faBattery5} style={styles.level} size={22} />}
                </>}
                {powerState.batteryState == 'charging' && <>
                    <FontAwesomeIcon icon={faBatteryBolt} style={styles.level} size={22} />
                </>}
            </View>
        </>
    )
}

const styles = {
    indicator: {
        flexDirection: 'row',
        position: 'absolute',
        right: 10,
        top: 10,
    },
    level: {
        color: 'white',
    },
};
