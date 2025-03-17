import { StyleSheet, Text, View, Image, TouchableOpacity, Button } from 'react-native'
import React, { useState } from 'react'
import Icon from 'react-native-vector-icons/Fontisto'
import { useNavigation } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const UpcommingStages = () => {
    const navigation = useNavigation();
    const [upcommingStages, setUpcommingStages] = useState([
        { name: "Stage 1", startDate: "Date 1" },
        { name: "Stage 2", startDate: "Date 2" },
        { name: "Stage 3", startDate: "Date 3" },
        { name: "Stage 4", startDate: "Date 4" },
    ]);

    function gotoSelectTickets() {
        navigation.navigate('Eventdetails');
    }

    function gotoAddStage() {
        navigation.navigate('AddStage', { setUpcommingStages });
    }

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.headerText}>Upcomming Stages</Text>
                <Icon style={styles.icon} name="fire" size={30} color="#FFB300" />
            </View>

            <KeyboardAwareScrollView showsVerticalScrollIndicator={false}>
                {upcommingStages.map((stage, index) => (
                    <TouchableOpacity key={index} onPress={() => navigation.navigate('Eventdetails', { stage, setUpcommingStages })}>
                        <View style={styles.containerbox}>
                            <Image
                                source={stage.image ? { uri: stage.image } : require('../../assets/img/festive.jpg')}
                                style={styles.image}
                            />
                            <View style={styles.stageDetails}>
                                <Text style={styles.stageDetailText1}>{stage.name}</Text>
                                <Text style={styles.stageDetailText2}>{stage.startDate}</Text>
                                <View style={styles.moreContainer}>
                                    <Text style={styles.stageDetailText3}>More</Text>
                                    <Icon name="angle-right" size={15} color="#000000" />
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
            </KeyboardAwareScrollView>

            {/* Add Stage Button */}
            <TouchableOpacity style={styles.addButton} onPress={gotoAddStage}>
                <Text style={styles.addButtonText}>+ Add Stage</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#118B50', alignItems: 'center' },
    headerContainer: { flexDirection: 'row' },
    headerText: { fontSize: 30, color: '#FFFFFF', marginLeft: 10, marginTop: 50, marginBottom: 10 },
    icon: { marginTop: 53, marginLeft: 10 },
    containerbox: { backgroundColor: '#E3F0AF', flexDirection: 'row', width: 340, height: 180, borderRadius: 20, marginTop: 20 },
    image: { width: 150, height: 160, borderRadius: 20, marginVertical: 10, marginHorizontal: 10 },
    stageDetails: { marginLeft: 10, marginTop: 20 },
    stageDetailText1: { fontSize: 20, color: '#000000', fontWeight: 'bold' },
    stageDetailText2: { fontSize: 15, color: '#000000', marginTop: 20 },
    stageDetailText3: { fontSize: 15, color: '#000000', fontWeight: 'bold', marginTop: 20 },
    moreContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 20 },
    addButton: { backgroundColor: '#FFB300', padding: 10, borderRadius: 10, marginTop: 20 },
    addButtonText: { color: '#000', fontSize: 18, fontWeight: 'bold' },
});

export default UpcommingStages;
