import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Icon from 'react-native-vector-icons/Ionicons'

const Eventchat = () => {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Icon style={styles.icon} name="chevron-back-circle" size={40} color="#FFB300" />
                <Text style={styles.headerText}>
                    Event Details
                </Text>
            </View>
        </View>
    )
}

export default Eventchat

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#401971',
        alignItems: 'center',
    },
    header: {
        marginTop: 50,
        flexDirection: 'row',
    },
    icon: {
        // Add any specific styles for the icon here if needed
    },
    headerText: {
        fontSize: 30,
        color: '#FFFFFF',
        marginHorizontal: 60,
    },
})
