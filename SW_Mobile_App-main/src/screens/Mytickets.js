import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Icon from 'react-native-vector-icons/Ionicons'

const Mytickets = () => {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Icon name="chevron-back-circle" size={40} color="#FFB300" />
                <Text style={styles.title}>
                    My Tickets
                </Text>
            </View>
        </View>
    )
}

export default Mytickets

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#118B50',
        alignItems: 'center',
    },
    header: {
        marginTop: 50,
        flexDirection: 'row',
        alignItems: 'center',
    },
    title: {
        fontSize: 30,
        color: '#FFFFFF',
        marginLeft: 70,
    },
})
