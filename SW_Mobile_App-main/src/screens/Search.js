import { StyleSheet, Text, View, TextInput, TouchableOpacity, ImageBackground } from 'react-native';
import React, { useState } from 'react';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native'; 
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation(); 

  const handleSearch = (text) => {
    setSearchQuery(text);
    //perform searching logic here based on the 'text'
    // For now, console log is used for the text
    console.log('Search Query:', text);
  };

  const handleCancel = () => {
    setSearchQuery('');
  };

  // Array of event names corresponding to each image
  const eventNames = ["Event 1", "Event 2", "Event 3", "Event 4", "Event 5"];

  return (
    <View style={styles.container}>
      <View style={{
        flexDirection: 'row',
        marginTop: 50,
      }}>
        <Text style={{
          fontSize: 30,
          color: '#FFFFFF',
        }}>
          Events
        </Text>
        <Icon style={{
          marginTop: 7,
          marginLeft: 10,
        }} name="calendar-check" size={30} color="#FDD835" />
      </View>
      <View style={styles.searchBar}>
        <Icon name="search" size={20} color="#757575" style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          placeholder="Search Events"
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery !== '' && (
          <TouchableOpacity onPress={handleCancel}>
            <Icon name="times" size={20} color="#757575" style={styles.cancelIcon} />
          </TouchableOpacity>
        )}
      </View>

      <KeyboardAwareScrollView contentContainerStyle={styles.scrollViewContent} showsVerticalScrollIndicator={false}>
        {eventNames.map((eventName, index) => (
          <TouchableOpacity key={index} onPress={() => navigation.navigate('EventDetails', { eventName })}>
            <View style={styles.imageContainer}>
              <ImageBackground
                source={require('../../assets/img/festive.jpg')}
                style={styles.imageBackground}
                imageStyle={styles.imageStyle}
              >
                <Text style={styles.eventName}>{eventName}</Text>
              </ImageBackground>
            </View>
          </TouchableOpacity>
        ))}
      </KeyboardAwareScrollView>

      <View style={{
        marginTop: 10,
        marginBottom: 10,
        
      }}>
      </View>
    </View>
  );
};

export default Search;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#118B50',
    alignItems: 'center',
  },
  searchBar: {
    marginTop: 20,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    width: '80%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 4,
  },
  searchIcon: {
    marginRight: 10,
  },
  cancelIcon: {
    marginLeft: 10,
  },
  input: {
    flex: 1,
    fontSize: 17,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 10, // Adjust this value to leave space for the bottom navigation
  },
  imageContainer: {
    marginBottom: 10,
  },
  imageBackground: {
    width: 300,
    height: 150,
    alignItems: 'center',
    position: 'relative',
  },
  imageStyle: {
    borderRadius: 10,
  },
  eventName: {
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: 'bold',
    textShadowColor: '#D32F2F',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 20,
  },
});
