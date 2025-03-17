import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRoute } from '@react-navigation/native';

const AddStageScreen = ({ route }) => {
    const navigation = useNavigation();
    const { setUpcommingStages, stage } = route.params || {}; // Get editing stage if provided

    // Initialize state with existing stage details (if editing) or empty values
    const [stageName, setStageName] = useState(stage?.name || '');
    const [description, setDescription] = useState(stage?.description || '');
    const [startDate, setStartDate] = useState(stage?.startDate || '');
    const [endDate, setEndDate] = useState(stage?.endDate || '');
    const [image, setImage] = useState(stage?.image || null);

    // Pick image from gallery
    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    // Capture photo from camera
    const takePhoto = async () => {
        let result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    // Handle Save (either add or update)
    const handleSaveStage = () => {
        if (stageName && startDate && endDate && description) {
            if (stage) {
                // Edit existing stage
                setUpcommingStages(prevStages =>
                    prevStages.map(s => (s.name === stage.name ? { ...s, name: stageName, description, startDate, endDate, image } : s))
                );
            } else {
                // Add new stage
                setUpcommingStages(prevStages => [...prevStages, { name: stageName, description, startDate, endDate, image }]);
            }
            navigation.goBack();
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.headerText}>{stage ? 'Edit Stage' : 'Add New Stage'}</Text>

            <TextInput
                style={styles.input}
                placeholder="Stage Name"
                placeholderTextColor="#888"
                value={stageName}
                onChangeText={setStageName}
            />

            <TextInput
                style={styles.input}
                placeholder="Start Date (YYYY-MM-DD)"
                placeholderTextColor="#888"
                value={startDate}
                onChangeText={setStartDate}
            />

            <TextInput
                style={styles.input}
                placeholder="End Date (YYYY-MM-DD)"
                placeholderTextColor="#888"
                value={endDate}
                onChangeText={setEndDate}
            />

            <TextInput
                style={[styles.input, styles.descriptionInput]}
                placeholder="Description"
                placeholderTextColor="#888"
                multiline
                value={description}
                onChangeText={setDescription}
            />

            {/* Image Picker Buttons */}
            <View style={styles.imagePickerContainer}>
                <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
                    <Text style={styles.imageButtonText}>Pick from Gallery</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.imageButton} onPress={takePhoto}>
                    <Text style={styles.imageButtonText}>Take a Photo</Text>
                </TouchableOpacity>
            </View>

            {/* Show Selected Image */}
            {image && <Image source={{ uri: image }} style={styles.previewImage} />}

            <TouchableOpacity style={styles.addButton} onPress={handleSaveStage}>
                <Text style={styles.addButtonText}>{stage ? 'Save Changes' : 'Add Stage'}</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flexGrow: 1, backgroundColor: '#118B50', alignItems: 'center', paddingVertical: 30 },
    headerText: { fontSize: 30, color: '#FFFFFF', marginBottom: 20 },
    input: { backgroundColor: '#E3F0AF', width: 300, height: 50, borderRadius: 10, paddingLeft: 15, fontSize: 18, marginBottom: 20 },
    descriptionInput: { height: 100, textAlignVertical: 'top' },
    imagePickerContainer: { flexDirection: 'row', marginBottom: 20 },
    imageButton: { backgroundColor: '#FFB300', padding: 10, borderRadius: 10, marginHorizontal: 10 },
    imageButtonText: { color: '#000', fontSize: 14, fontWeight: 'bold' },
    previewImage: { width: 200, height: 200, borderRadius: 10, marginBottom: 20 },
    addButton: { backgroundColor: '#FFB300', padding: 10, borderRadius: 10 },
    addButtonText: { color: '#000', fontSize: 18, fontWeight: 'bold' },
});

export default AddStageScreen;
