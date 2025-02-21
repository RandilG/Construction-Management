import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { StripeProvider, CardField, useConfirmPayment } from '@stripe/stripe-react-native';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native'; 

const API_URL = 'http://10.0.2.2:3000'; 

const Paymentdetails = () => {
  const [cardHolderEmail, setCardHolderEmail] = useState('');
  const { confirmPayment, loading } = useConfirmPayment();
  const [cardDetails, setCardDetails] = useState(null);
  const navigation = useNavigation();

  const route = useRoute(); 
  const totalPrice = route.params?.totalPrice || 0;
  

  const fetchPaymentIntentClientSecret = async () => {
    try {
      const response = await axios.post(`${API_URL}/create-payment-intent`, {
        currency: 'usd',
        amount: totalPrice,
      });
      const data = response.data;
      const { clientSecret } = data;
      return clientSecret;
    } catch (error) {
      console.error('Error fetching client secret:', error);
      throw error;
    }
  };

  const handlePayPress = async () => {
    try {
      if (cardDetails) {
        const clientSecret = await fetchPaymentIntentClientSecret();
        const billingDetails = {
          email: cardHolderEmail,
        };
        const { paymentIntent, error } = await confirmPayment(clientSecret, {
          paymentMethodType: 'Card',
          paymentMethodData: {
            billingDetails,
            card: cardDetails,
          },
        });
        if (error) {
          console.error('Payment confirmation error', error);
        } else if (paymentIntent) {

          console.log('Success from promise', paymentIntent);

          // Data to be sent to server to save payment
          const paymentData = {
            payment_id: paymentIntent.id,
            user_id: 456,
            Email: cardHolderEmail,
            amount: paymentIntent.amount
          };

          // Send payment data to server
          axios.post(`${API_URL}/savepayment`, paymentData)
            .then(response => {
              console.log('Response:', response.data);
            })
            .catch(error => {
              console.error('Error:', error);
            });

          navigation.navigate('Paymentverification'); 
        }
      }
    } catch (error) {
      console.error('Error handling payment:', error);
    }
  };

  const BackButton = () => {
    const navigation = useNavigation();

    const handleBackPress = () => {
      navigation.goBack();
    }

    return (
      <TouchableOpacity onPress={handleBackPress}>
        <Icon name="chevron-back-circle" size={40} color="#F6BD0F" />
      </TouchableOpacity>
    );
  }

  return (
    <StripeProvider
      publishableKey="pk_test_51ObQ74EVdCsIjFayjxfFn84AgbNhpwKqQjOVfmGQGscgNz7NuGC5zqyku85cWRZRvjm74My2vPJTYu28fdszWl4600rUJdhZuh"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <BackButton />
          <Text style={styles.headerText}>Payment Details</Text>
        </View>
        <View>
          <Text style={styles.visaText}>We are Accepting</Text>
          <Image
            source={require('../../assets/img/Visa-Logo.png')}
            style={{
              width: 200,
              height: 60,
              marginBottom: 10,
              marginTop: 20,
              alignContent: 'center',
            }}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Card Holder Email</Text>
          <TextInput
            style={styles.input}
            onChangeText={setCardHolderEmail}
            value={cardHolderEmail}
            placeholder="Enter email"
            keyboardType="email-address"
          />
        </View>
        <View style={styles.cardFieldContainer}>
          <Text style={styles.cardFieldLabel}>Card Details</Text>
          <CardField
            postalCodeEnabled={true}
            placeholder={{
              number: '4242 4242 4242 4242',
            }}
            cardStyle={{
              backgroundColor: '#FFFFFF',
              textColor: '#000000',
            }}
            style={{
              width: '100%',
              height: 50,
              marginVertical: 30,
            }}
            onCardChange={(cardDetails) => setCardDetails(cardDetails)}
            onFocus={(focusedField) => {
            }}
          />
        </View>
        <TouchableOpacity onPress={handlePayPress} style={styles.confirmButton}>
          <Text style={styles.confirmButtonText}>Confirm</Text>
        </TouchableOpacity>
      </View>
    </StripeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#118B50',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    marginTop: 50,
  },
  headerText: {
    fontSize: 30,
    color: '#FFFFFF',
    marginHorizontal: 40,
  },
  visaText: {
    fontSize: 20,
    color: '#F6BD0F',
    marginTop: 20,
    marginLeft: -60,
  },

  inputContainer: {
    marginTop: 20,
  },
  inputLabel: {
    fontSize: 20,
    color: '#C7ADCE',
    marginBottom: 20,
    marginTop: 30,
  },
  input: {
    width: 350,
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 5,
    fontSize: 18,
  },
  cardFieldLabel: {
    fontSize: 20,
    color: '#C7ADCE',
    marginTop: 40,
    marginBottom: -10,
  },
  cardFieldContainer: {
    width: 350,
  },
  confirmButton: {
    backgroundColor: '#F6BD0F',
    height: 40,
    width: 300,
    justifyContent: 'center',
    borderRadius: 20,
    marginTop: 90,
  },
  confirmButtonText: {
    fontSize: 20,
    color: '#000000',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default Paymentdetails;
