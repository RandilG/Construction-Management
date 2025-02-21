import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

function BuyTicketsButton() {
    const navigation = useNavigation();

    function gotoselecttickets() {
        navigation.navigate('Selecttickets');
    }

    return (
        <TouchableOpacity onPress={gotoselecttickets}>
            <View style={styles.buyTicketsButton}>
                <Text style={styles.buyTicketsButtonText}>
                    Buy Tickets
                </Text>
            </View>
        </TouchableOpacity>
    );
}

function BackButton() {
    const navigation = useNavigation();

    function gotopopularevents() {
        navigation.navigate('Popularevents');
    }

    return (
        <TouchableOpacity onPress={gotopopularevents}>
            <Icon style={styles.backButton} name="chevron-back-circle" size={40} color="#FFB300" />
        </TouchableOpacity>
    );
}

function BookMarkButton() {
    const navigation = useNavigation();

    function gotofavourite() {
        navigation.navigate('Favourite');
    }

    return (
        <TouchableOpacity onPress={gotofavourite}>
            <Icon style={styles.bookmarkButton} name="bookmarks" size={30} color="#FFB300" />
        </TouchableOpacity>
    );
}

const Eventdetails = () => {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            
            <View style={styles.header}>
                <BackButton />
                <Text style={styles.headerText}>
                    Event Details
                </Text>
                <BookMarkButton />
            </View>

            <Image
                source={require('../../assets/img/festive.jpg')}
                style={styles.eventImage}
            />

            <View style={styles.eventInfoContainer}>
                <Text style={styles.eventName}>
                    Event Name
                </Text>
                <Text style={styles.eventLocation}>
                    Event Location
                </Text>
            </View>

            <View style={styles.aboutContainer}>
                <Text style={styles.aboutHeader}>
                    About
                </Text>
                <Text style={styles.aboutDescription}>
                    ---description---
                </Text>
            </View>

            <View style={styles.detailsContainer}>
                <View style={styles.detailItem}>
                    <Icon style={styles.detailIcon} name="location-sharp" size={30} color="#FFB300" />
                    <Text style={styles.detailText}>Location</Text>
                </View>
                <View style={styles.detailItem}>
                    <Icon style={styles.detailIcon} name="calendar-clear" size={30} color="#FFB300" />
                    <Text style={styles.detailText}>Date</Text>
                </View>
                <Text style={[styles.detailText, styles.detailTime]}>Time</Text>
            </View>

            <BuyTicketsButton />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#118B50',
        alignItems: 'center',
    },
    header: {
        marginTop: 40,
        flexDirection: 'row',
    },
    headerText: {
        fontSize: 30,
        color: '#FFFFFF',
        marginBottom: 10,
        marginHorizontal: 40,
    },
    backButton: {
    },
    buyTicketsButton: {
        backgroundColor: '#F6BD0F',
        height: 40,
        width: 300,
        justifyContent: 'center',
        borderRadius: 20,
        marginTop: 50,
    },
    buyTicketsButtonText: {
        fontSize: 20,
        color: '#000000',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    bookmarkButton: {
        marginTop: 5,
    },
    eventImage: {
        width: 350,
        height: 200,
        borderRadius: 20,
        marginVertical: 10,
        marginHorizontal: 10,
    },
    eventInfoContainer: {
        marginTop: 10,
        marginRight: 140,
    },
    eventName: {
        fontSize: 28,
        color: '#FFFFFF',
    },
    eventLocation: {
        fontSize: 25,
        color: '#C7ADCE',
    },
    aboutContainer: {
        marginTop: 50,
        marginRight: 170,
    },
    aboutHeader: {
        fontSize: 23,
        color: '#FFFFFF',
    },
    aboutDescription: {
        fontSize: 20,
        color: '#C7ADCE',
    },
    detailsContainer: {
        marginTop: 30,
        marginRight: 170,
    },
    detailItem: {
        flexDirection: 'row',
    },
    detailIcon: {
    },
    detailText: {
        fontSize: 23,
        color: '#FFFFFF',
        marginLeft: 10,
    },
    detailTime: {
        marginLeft: 40,
        marginTop: -12,
    },
});

export default Eventdetails;
