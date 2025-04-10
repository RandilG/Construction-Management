import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, TextInput, Alert } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useNavigation } from '@react-navigation/native'; 
import axios from 'axios';

function Createprofilefield() {
    const navigation = useNavigation();
    const [form, setForm] = useState({
        name: '',
        email: '',
        nic: '',
        contact_number: '',
        password: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState({
        name: '',
        email: '',
        nic: '',
        contact_number: '',
        password: '',
        confirmPassword: ''
    });

    const validate = () => {
        let isValid = true;
        const newErrors = {
            name: '',
            email: '',
            nic: '',
            contact_number: '',
            password: '',
            confirmPassword: ''
        };

        // Name validation
        if (!form.name.trim()) {
            newErrors.name = 'Name is required';
            isValid = false;
        } else if (form.name.length < 3) {
            newErrors.name = 'Name must be at least 3 characters';
            isValid = false;
        }

        // Email validation
        if (!form.email.trim()) {
            newErrors.email = 'Email is required';
            isValid = false;
        } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(form.email)) {
            newErrors.email = 'Invalid email address';
            isValid = false;
        }

        // NIC validation (assuming Sri Lankan NIC format)
        if (!form.nic.trim()) {
            newErrors.nic = 'NIC is required';
            isValid = false;
        } else {
            const nicValue = form.nic.trim();
            const isNewFormat = /^\d{12}$/.test(nicValue);
            const isOldFormat = /^\d{10}[vV]$/.test(nicValue);
            
            if (!isNewFormat && !isOldFormat) {
                newErrors.nic = 'Invalid NIC format. Use 12 digits or 9 digits followed by v/V/x/X';
                isValid = false;
            }
        }

        // Contact number validation
        if (!form.contact_number.trim()) {
            newErrors.contact_number = 'Contact number is required';
            isValid = false;
        } else if (!/^(?:\+94|0)?[0-9]{9,10}$/.test(form.contact_number.trim())) {
            newErrors.contact_number = 'Invalid contact number';
            isValid = false;
        }

        // Password validation
        if (!form.password) {
            newErrors.password = 'Password is required';
            isValid = false;
        } else if (form.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
            isValid = false;
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(form.password)) {
            newErrors.password = 'Password must include uppercase, lowercase, number and special character';
            isValid = false;
        }

        // Confirm password validation
        if (!form.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
            isValid = false;
        } else if (form.password !== form.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleInputChange = (field, value) => {
        setForm({ ...form, [field]: value });
        // Clear error when user types
        if (errors[field]) {
            setErrors({ ...errors, [field]: '' });
        }
    };

    const handleSignup = async () => {
        if (!validate()) {
            return;
        }

        try {
            const response = await axios.post('http://192.168.8.116:8081/api/signup', {
                name: form.name,
                email: form.email,
                nic: form.nic,
                contact_number: form.contact_number,
                password: form.password
            });

            Alert.alert('Success', response.data.message || 'Account created successfully! Please verify your email');
            navigation.navigate('OtpVerification', { email: form.email });
        } catch (error) {
            console.error("Signup Error:", error);
            if (error.response) {
                // The server responded with an error
                Alert.alert('Signup Failed', error.response.data.message || 'Registration failed');
            } else if (error.request) {
                // The request was made but no response was received
                Alert.alert('Network Error', 'Could not connect to server. Please check your internet connection.');
            } else {
                // Something happened in setting up the request
                Alert.alert('Error', 'An unexpected error occurred');
            }
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
            {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}

            <View style={[styles.inputContainer, { marginTop: errors.name ? 10 : 30 }]}>
                <TextInput
                    placeholder='Enter Email Address'
                    placeholderTextColor={'#000000'}
                    style={styles.input}
                    onChangeText={(text) => handleInputChange('email', text)}
                    value={form.email}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
            </View>
            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

            <View style={[styles.inputContainer, { marginTop: errors.email ? 10 : 30 }]}>
                <TextInput
                    placeholder='Enter NIC'
                    placeholderTextColor={'#000000'}
                    style={styles.input}
                    onChangeText={(text) => handleInputChange('nic', text)}
                    value={form.nic}
                />
            </View>
            {errors.nic ? <Text style={styles.errorText}>{errors.nic}</Text> : null}

            <View style={[styles.inputContainer, { marginTop: errors.nic ? 10 : 30 }]}>
                <TextInput
                    placeholder='Enter Contact No'
                    placeholderTextColor={'#000000'}
                    style={styles.input}
                    onChangeText={(text) => handleInputChange('contact_number', text)}
                    value={form.contact_number}
                    keyboardType="phone-pad"
                />
            </View>
            {errors.contact_number ? <Text style={styles.errorText}>{errors.contact_number}</Text> : null}

            <View style={[styles.inputContainer, { marginTop: errors.contact_number ? 10 : 30 }]}>
                <TextInput
                    placeholder='Enter New Password'
                    placeholderTextColor={'#000000'}
                    style={styles.input}
                    secureTextEntry
                    onChangeText={(text) => handleInputChange('password', text)}
                    value={form.password}
                    autoCapitalize="none"
                />
            </View>
            {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

            <View style={[styles.inputContainer, { marginTop: errors.password ? 10 : 30 }]}>
                <TextInput
                    placeholder='Confirm Password'
                    placeholderTextColor={'#000000'}
                    style={styles.input}
                    secureTextEntry
                    onChangeText={(text) => handleInputChange('confirmPassword', text)}
                    value={form.confirmPassword}
                    autoCapitalize="none"
                />
            </View>
            {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}

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
        height: 40,
        width: 350,
        marginHorizontal: 20,
        justifyContent: 'center',
        paddingLeft: 20,
    },
    input: {
        fontSize: 18,
        opacity: 0.5
    },
    errorText: {
        color: '#FF4040',
        fontSize: 14,
        marginLeft: 25,
        marginTop: 5,
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