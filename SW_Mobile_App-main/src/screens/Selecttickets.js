import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import React, { useState, useEffect } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

function CheckoutButton({ onPress }) {
    return (
        <TouchableOpacity onPress={onPress}>
            <View style={styles.checkoutButton}>
                <Text style={styles.checkoutButtonText}>
                    Checkout
                </Text>
            </View>
        </TouchableOpacity>
    );
}


function BackButton({ onPress }) {
    return (
        <TouchableOpacity onPress={onPress}>
            <Icon name="chevron-back-circle" size={40} color="#FFB300" />
        </TouchableOpacity>
    );
}

const TicketType = ({ price, onUpdate }) => {
    // State to manage the quantity of this ticket type
    const [quantity, setQuantity] = useState(0);

    const decreaseQuantity = () => {

        if (quantity > 0) {
            setQuantity(quantity - 1);
            onUpdate(price, -1); 
        }
    };

    const increaseQuantity = () => {
        setQuantity(quantity + 1);
        onUpdate(price, 1);
    };

    return (
        <View style={styles.ticketType}>
            <Text style={styles.ticketTypePrice}>{price}</Text>
            <View style={styles.quantityContainer}>
                <TouchableOpacity onPress={decreaseQuantity}>
                    <Text style={styles.quantityButton}>-</Text>
                </TouchableOpacity>
                <Text style={styles.quantity}>{quantity}</Text>
                <TouchableOpacity onPress={increaseQuantity}>
                    <Text style={styles.quantityButton}>+</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const Selecttickets = () => {
    const navigation = useNavigation();
    // State variables to track total price and quantity
    const [totalPrice, setTotalPrice] = useState(0);
    const [quantity, setQuantity] = useState(0);

    const gotoPaymentdetails = () => {
        navigation.navigate('Paymentdetails', { totalPrice});
    };

    const gotoeventdetails = () => {
        navigation.goBack();
    };

    //update the total price and quantity based on ticket selection
    const updateSummary = (price, quantityToAdd) => {
        setTotalPrice(totalPrice + (price * quantityToAdd));
        setQuantity(quantity + quantityToAdd);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <BackButton onPress={gotoeventdetails} />
                <Text style={styles.headerText}>Select Tickets</Text>
            </View>

            <View style={styles.eventContainer}>
                <Image source={require('../../assets/img/festive.jpg')} style={styles.eventImage} />
                <View style={styles.eventDetails}>
                    <Text style={styles.eventName}>Event Name</Text>
                    <Text style={styles.eventDate}>Event Date & Time</Text>
                </View>
            </View>

            <Text style={styles.ticketTypetext}>Ticket Type</Text>

            <View style={styles.ticketTypeTitle}>
                {/* 
                Mapping through an array of ticket prices.
                Each TicketType component receives the price and updateSummary function as props.
                */}
                {[1000, 2000, 3000].map((price, index) => (
                    <TicketType price={price} key={index} onUpdate={updateSummary} />
                ))}
            </View>

            <View style={styles.orderSummaryContainer}>
                <Text style={styles.orderSummaryTitle}>Payment Summary</Text>
                <View style={styles.orderSummaryItem}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                        <Text style={styles.orderSummaryText}>Quantity</Text>
                        <Text style={styles.orderSummaryText}>{quantity}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                        <Text style={styles.orderSummaryText}>Total</Text>
                        <Text style={styles.orderSummaryText}>{totalPrice}</Text>
                    </View>
                </View>
            </View>

            <CheckoutButton onPress={gotoPaymentdetails}  />
        </View>
    );
};

export default Selecttickets;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#118B50',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        marginTop: 30,
    },
    headerText: {
        fontSize: 30,
        color: '#FFFFFF',
        marginHorizontal: 50,
    },
    eventContainer: {
        flexDirection: 'row',
        marginTop: 20,
    },
    eventImage: {
        width: 150,
        height: 140,
        borderRadius: 20,
        marginHorizontal: 20,
    },
    eventDetails: {
        marginTop: 40,
    },
    eventName: {
        fontSize: 25,
        color: '#FFFFFF',
    },
    eventDate: {
        fontSize: 20,
        color: '#C7ADCE',
        marginTop: 10,
    },
    ticketTypeTitle: {
        flexDirection: 'column',
        marginTop: 5,
        alignItems: 'center',
    },
    ticketTypetext: {
        fontSize: 25,
        color: '#FFFFFF',
        marginTop: 20,
        marginRight: 200,
    },
    ticketType: {
        backgroundColor: '#C7ADCE',
        width: 350,
        borderRadius: 10,
        marginTop: 10,
        paddingHorizontal: 20,
        paddingVertical: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    ticketTypePrice: {
        fontSize: 20,
        color: '#000000',

    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
        justifyContent: 'flex-end',
    },
    quantityButton: {
        fontSize: 20,
        color: '#000000',
        marginHorizontal: 5,
    },
    quantity: {
        fontSize: 20,
        color: '#000000',
        paddingHorizontal: 10,
    },
    orderSummaryContainer: {
        marginRight: 50,
        marginLeft: 30,
    },
    orderSummaryTitle: {
        fontSize: 25,
        color: '#FFFFFF',
        marginTop: 30,
    },
    orderSummaryItem: {
        marginTop: 10,
    },
    orderSummaryText: {
        fontSize: 20,
        color: '#C7ADCE',
        marginBottom: 5,
    },
    checkoutButton: {
        backgroundColor: '#F6BD0F',
        height: 40,
        width: 300,
        justifyContent: 'center',
        borderRadius: 20,
        marginTop: 30,
    },
    checkoutButtonText: {
        fontSize: 20,
        color: '#000000',
        textAlign: 'center',
        fontWeight: 'bold',
    },
});
