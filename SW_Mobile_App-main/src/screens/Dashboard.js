import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image } from 'react-native'
import React from 'react'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { useNavigation } from '@react-navigation/native'; 


const Dashboard = () => {
  const navigation = useNavigation(); 

  function viewMore() {
    navigation.navigate('Popularevents');
  }

  function more() {
    navigation.navigate('Eventdetails');
  }

  function navigateToSearch() {
    navigation.navigate('Search');
  }

  // Array of Milestones
  const Milestones = [
    { name: 'Event 1', date: 'May 1, 2024', imageSource: require('../../assets/img/festive.jpg') },
    { name: 'Event 2', date: 'May 5, 2024', imageSource: require('../../assets/img/festive.jpg') },
    { name: 'Event 3', date: 'May 10, 2024', imageSource: require('../../assets/img/festive.jpg') },
    { name: 'Event 4', date: 'May 15, 2024', imageSource: require('../../assets/img/festive.jpg') },
  ];

  return (
    <View style={styles.container}>

      <View style={styles.titleContainer}>
        <Text style={styles.title}>
          Hello, --Name--
        </Text>
        <Icon style={styles.waveIcon} name="hand-wave" size={30} color="#F6BD0F" />
      </View>

      <Text style={styles.subTitle}>
        Let's Build Your Dream Home
      </Text>
      {/* Button to navigate to Search Screen */}
      <TouchableOpacity onPress={navigateToSearch} style={styles.searchButton}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ color: '#C7ADCE', fontSize: 18, marginRight: 150 }}>
            Search Milestones
          </Text>
          <Icon name="magnify" size={24} color="#C7ADCE" />
        </View>
      </TouchableOpacity>

      <View style={{ flexDirection: 'row', marginTop: 20 }}>
        <Text style={{ fontSize: 25, color: '#FFFFFF' }}>
        Current Milestone
        </Text>
        <TouchableOpacity onPress={viewMore}>
          <Text style={styles.viewMoreText}>
            View More
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.containerbox}>
        <Image
          source={require('../../assets/img/festive.jpg')}
          style={{ width: 150, height: 160, borderRadius: 20, marginVertical: 10, marginHorizontal: 10 }}
        />
        <View style={styles.eventDetails}>
          <Text style={styles.eventDetailText1}>Event Name</Text>
          <Text style={styles.eventDetailText2}>Event Date</Text>
          <TouchableOpacity onPress={more}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.eventDetailText3}>More</Text>
              <Icon style={{ marginTop: 20 }} name="chevron-right" size={20} color="#000000" />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ flexDirection: 'row', marginTop: 20 }}>
        <Text style={styles.MilestonesText}>
          Upcomming Project Milestones
        </Text>
      </View>

      {/* Horizontal ScrollView for Milestones */}
      <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', marginTop: 20 }}>
          {/* Render each upcoming event */}
          {Milestones.map((event, index) => (
            <Image
              key={index}
              source={event.imageSource}
              style={{ width: 150, height: 160, borderRadius: 20, marginVertical: 10, marginHorizontal: 10 }}
            />
          ))}
        </View>
      </ScrollView>

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#118B50',
    alignItems: 'center',
  },
  containerbox: {
    backgroundColor: '#E3F0AF',
    flexDirection: 'row',
    width: 340,
    height: 180,
    borderRadius: 20,
    marginTop: 20,
  },
  searchButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    paddingVertical: 6,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  eventDetails: {
    marginLeft: 10,
    marginTop: 20,
  },
  eventDetailText1: {
    fontSize: 20,
    color: '#000000',
    fontWeight: 'bold',
  },
  eventDetailText2: {
    fontSize: 15,
    color: '#000000',
    marginTop: 20,
  },
  eventDetailText3: {
    fontSize: 15,
    color: '#000000',
    fontWeight: 'bold',
    marginTop: 20,
  },
  title: {
    fontSize: 30,
    color: '#FFFFFF',
    marginTop: 50,
    marginRight: 110,
  },
  titleContainer: {
    flexDirection: 'row',
  },
  waveIcon: {
    marginTop: 60,
    marginLeft: 1,
  },
  subTitle: {
    fontSize: 20,
    color: '#C7ADCE',
    marginRight: 130,
    marginTop: 10,
  },
  viewMoreText: {
    fontSize: 15,
    color: '#FFFFFF',
    marginLeft: 90,
  },
  MilestonesText: {
    fontSize: 25,
    color: '#FFFFFF',
    marginRight: 130,
  },
});

export default Dashboard
