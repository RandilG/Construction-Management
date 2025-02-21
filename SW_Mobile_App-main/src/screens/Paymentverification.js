import React from 'react';
import { StyleSheet, Text, View, Image, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Import the useNavigation hook

function Verificationcodefield() {
    return (
        <View style={styles.inputContainer}>
            <View style={styles.inputField}>
                <TextInput
                    placeholder='Enter Verification Code'
                    placeholderTextColor={'#000000'}
                    style={styles.textInput}
                />
            </View>
            <VerifyButton />
        </View>
    );
}

function VerifyButton() {
    const navigation = useNavigation(); // Use the useNavigation hook to access navigation

    const gotoVerify = () => {
        navigation.navigate('Paymentverification');
    }

    return (
        <TouchableOpacity onPress={gotoVerify}>
            <View style={styles.verifyButton}>
                <Text style={styles.verifyButtonText}>
                    Verify
                </Text>
            </View>
        </TouchableOpacity>
    );
}

const Paymentverification = () => {
    const navigation = useNavigation(); // Use the useNavigation hook to access navigation

    return (
        <View style={styles.container}>
            <Text style={styles.headerText}>
                Payment Verification
            </Text>

            <Image
                source={require('../../assets/img/forgotpass2.png')}
                style={styles.image}
            />

            <Text style={styles.description}>
                In order to verify your identity, enter the verification code that was sent to your mail
            </Text>
            <View style={styles.inputContainer}>
                <View style={styles.inputField}>
                    <TextInput
                        placeholder='Enter Verification Code'
                        placeholderTextColor={'#000000'}
                        style={styles.textInput}
                    />
                </View>
            </View>

            <VerifyButton />
        </View>
    );
}

export default Paymentverification;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#118B50',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerText: {
        fontSize: 22,
        color: '#FFFFFF',
        marginBottom: 5,
        fontWeight: 'bold',
    },
    image: {
        width: 240,
        height: 250,
        alignContent: 'center',
        marginBottom: 20,
    },
    description: {
        fontSize: 16,
        color: '#BBBBC4',
        marginTop: 5,
        marginBottom: 20,
        textAlign: 'center',
    },
    inputContainer: {
        marginTop: 10,
    },
    inputField: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        height: 40,
        width: 300,
        marginHorizontal: 20,
        justifyContent: 'center',
        paddingLeft: 20,
    },
    textInput: {
        opacity: 0.6,
        fontSize: 18,
    },
    verifyButton: {
        backgroundColor: '#F6BD0F',
        height: 40,
        width: 300,
        justifyContent: 'center',
        borderRadius: 20,
        marginHorizontal: 20,
        marginTop: 40,
        marginBottom: 80,
    },
    verifyButtonText: {
        fontSize: 20,
        color: '#000000',
        textAlign: 'center',
        fontWeight: 'bold',
    },
});
