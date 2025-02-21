import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Icon from 'react-native-vector-icons/Ionicons'

const Favourite = () => {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerText}>
                    Favourite List
                </Text>
                <Icon style={styles.icon} name="heart" size={40} color="#B71C1C" />
            </View>
        </View>
    )
}

export default Favourite

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#118B50',
        alignItems: 'center',
    },
    header: {
        marginTop: 50,
        flexDirection: 'row',
    },
    headerText: {
        fontSize: 30,
        color: '#FFFFFF',
    },
    icon: {
        marginLeft: 10,
    },
})
