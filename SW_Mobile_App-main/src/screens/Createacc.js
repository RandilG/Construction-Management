import React, { useState } from 'react'; // ✅ Import useState
import { StyleSheet, Text, View, Image, TouchableOpacity, TextInput, Alert } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation } from '@react-navigation/native'; 
import axios from 'axios';

function Createprofilefield() {
    const navigation = useNavigation();
    const [form, setForm] = useState({ // ✅ Fix: useState now exists
        name: '',
        email: '',
        nic: '',
        contact_number: '',
        password: '',
        confirmPassword: ''
    });

    const handleInputChange = (field, value) => {
        setForm({ ...form, [field]: value });
    };

    const handleSignup = async () => {
        if (!form.name || !form.email || !form.nic || !form.contact_number || !form.password || !form.confirmPassword) {
            Alert.alert('Error', 'All fields are required');
            return;
        }

        if (form.password !== form.confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        try {
            const response = await axios.post('http://192.168.8.175:3000/api/signup', {
                name: form.name,
                email: form.email,
                nic: form.nic,
                contact_number: form.contact_number,
                password: form.password
            });

            Alert.alert('Success', response.data.message);
            navigation.navigate('OtpVerification', { email: form.email }); // Navigate to OTP verification page
        } catch (error) {
            console.error("Signup Error:", error);
            Alert.alert('Signup Failed', error.response?.data?.message || 'Something went wrong');
        }
    };

    return (
        <View>
            <View style={styles.inputContainer}>
                <TextInput
                    placeholder='Enter Full Name'
                    placeholderTextColor={'#000000'}
                    style={styles.input}
                    onChangeText={(text) => handleInputChange('name', text)}
                    value={form.name}
                />
            </View>
            <View style={[styles.inputContainer, { marginTop: 30 }]}>
                <TextInput
                    placeholder='Enter Email Address'
                    placeholderTextColor={'#000000'}
                    style={styles.input}
                    onChangeText={(text) => handleInputChange('email', text)}
                    value={form.email}
                />
            </View>
            <View style={[styles.inputContainer, { marginTop: 30 }]}>
                <TextInput
                    placeholder='Enter NIC'
                    placeholderTextColor={'#000000'}
                    style={styles.input}
                    onChangeText={(text) => handleInputChange('nic', text)}
                    value={form.nic}
                />
            </View>
            <View style={[styles.inputContainer, { marginTop: 30 }]}>
                <TextInput
                    placeholder='Enter Contact No'
                    placeholderTextColor={'#000000'}
                    style={styles.input}
                    onChangeText={(text) => handleInputChange('contact_number', text)}
                    value={form.contact_number}
                />
            </View>
            <View style={[styles.inputContainer, { marginTop: 30 }]}>
                <TextInput
                    placeholder='Enter New Password'
                    placeholderTextColor={'#000000'}
                    style={styles.input}
                    secureTextEntry
                    onChangeText={(text) => handleInputChange('password', text)}
                    value={form.password}
                />
            </View>
            <View style={[styles.inputContainer, { marginTop: 30 }]}>
                <TextInput
                    placeholder='Confirm Password'
                    placeholderTextColor={'#000000'}
                    style={styles.input}
                    secureTextEntry
                    onChangeText={(text) => handleInputChange('confirmPassword', text)}
                    value={form.confirmPassword}
                />
            </View>
            <BottomButtons handleSignup={handleSignup} />
        </View>
    );
}

function BottomButtons({ handleSignup }) {
    const navigation = useNavigation();

    return (
        <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <View style={styles.button}>
                    <Text style={styles.buttonText}>Cancel</Text>
                </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSignup}>
                <View style={[styles.button, { marginLeft: 20 }]}>
                    <Text style={styles.buttonText}>Create</Text>
                </View>
            </TouchableOpacity>
        </View>
    );
}

const Createacc = () => {
    return (
        <KeyboardAwareScrollView>
            <View style={styles.container}>
                <Text style={styles.title}>
                    User Profile
                </Text>
                <Image
                    source={require('../../assets/img/userprofile.png')}
                    style={styles.profileImage}
                />
                <Createprofilefield />
            </View>
        </KeyboardAwareScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#118B50',
        alignItems: 'center',
        height: 887,
    },
    title: {
        fontSize: 30,
        color: '#FFFFFF',
        marginBottom: 20,
        marginTop: 80,
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: '#F6BD0F',
        marginBottom: 30,
    },
    inputContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        height: 35,
        width: 350,
        marginHorizontal: 20,
        justifyContent: 'center',
        paddingLeft: 20,
    },
    input: {
        fontSize: 18,
        opacity: 0.5
    },
    buttonContainer: {
        flexDirection: 'row',
        marginHorizontal: 20,
        marginTop: 40,
        marginBottom: 56,
    },
    button: {
        backgroundColor: '#F6BD0F',
        height: 40,
        width: 150,
        justifyContent: 'center',
        borderRadius: 20,
        marginHorizontal: 10,
        marginTop: 20,
    },
    buttonText: {
        fontSize: 25,
        color: '#000000',
        textAlign: 'center'
    }
});

export default Createacc;
