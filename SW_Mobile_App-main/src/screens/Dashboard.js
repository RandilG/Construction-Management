import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native'
import React, { useState, useEffect } from 'react'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native'
import axios from 'axios'
import SidebarNavigation from './../navigations/SidebarNavigation' // Import the new component

const Dashboard = () => {
  const navigation = useNavigation()
  const [userData, setUserData] = useState(null)
  const [projects, setProjects] = useState([])
  const [stages, setStages] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentProject, setCurrentProject] = useState(null)
  const [currentMilestone, setCurrentMilestone] = useState(null)

  useEffect(() => {
    // Fetch user data and projects
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Get email from AsyncStorage or auth context
        const email = await AsyncStorage.getItem('email')
        
        // Fetch user data
        const userResponse = await axios.get(`http://192.168.8.116:3000/api/get-user/${email}`)
        setUserData(userResponse.data)
        
        // Fetch projects for this user
        const projectsResponse = await axios.get(`http://192.168.8.116:3000/api/projects/${email}`)
        setProjects(projectsResponse.data)
        
        // Set current project (the latest one)
        if (projectsResponse.data.length > 0) {
          setCurrentProject(projectsResponse.data[0]) // Assuming sorted by latest
        }
        
        // Fetch all stages
        const stagesResponse = await axios.get('http://192.168.8.116:3000/api/stages')
        setStages(stagesResponse.data)
        
        // Set current milestone for the current project
        if (projectsResponse.data.length > 0 && projectsResponse.data[0].currentStageId) {
          const currentStage = stagesResponse.data.find(
            stage => stage.id === projectsResponse.data[0].currentStageId
          )
          setCurrentMilestone(currentStage)
        }
        
        setLoading(false)
      } catch (error) {
        console.error('Error fetching data:', error)
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])

  function viewMoreProjects() {
    navigation.navigate('ViewProjects')
  }

  function viewMoreMilestones() {
    navigation.navigate('UpcommingStages')
  }

  function navigateToSearch() {
    navigation.navigate('Search')
  }

  function goToStageDetails(stage) {
    navigation.navigate('Eventdetails', { stage })
  }

  function addNewProject() {
    navigation.navigate('AddProject')
  }

  function goToProjectDetails(project) {
    navigation.navigate('ProjectDetails', { project })
  }

  // Placeholder image for when actual image is not available
  const placeholderImage = require('../../assets/img/festive.jpg')

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Add the Sidebar Navigation component */}
      <SidebarNavigation navigation={navigation} />
      
      <ScrollView style={styles.contentContainer}>
        {/* User greeting - moved right to make space for hamburger menu */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Hello, {userData ? userData.name : '--Name--'}</Text>
          <Icon style={styles.waveIcon} name="hand-wave" size={30} color="#F6BD0F" />
        </View>

        <Text style={styles.subTitle}>Let's Build Your Dream Home</Text>

        {/* Current Project Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Current Project</Text>
          <TouchableOpacity onPress={viewMoreProjects}>
            <Text style={styles.viewMoreText}>View More</Text>
          </TouchableOpacity>
        </View>

        {currentProject ? (
          <TouchableOpacity onPress={() => goToProjectDetails(currentProject)}>
            <View style={styles.containerbox}>
              <Image 
                source={currentProject.imageUrl ? { uri: currentProject.imageUrl } : placeholderImage} 
                style={styles.image} 
              />
              <View style={styles.eventDetails}>
                <Text style={styles.eventDetailText1}>{currentProject.name}</Text>
                <Text style={styles.eventDetailText2}>Started: {currentProject.startDate}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.eventDetailText3}>More</Text>
                  <Icon style={{ marginTop: 20 }} name="chevron-right" size={20} color="#000000" />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ) : (
          <Text style={{ color: '#FFFFFF', fontSize: 18, marginTop: 10 }}>No Projects Available</Text>
        )}

        {/* Add New Project Button */}
        <TouchableOpacity onPress={addNewProject} style={styles.addButton}>
          <Icon name="plus" size={24} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add New Project</Text>
        </TouchableOpacity>

        {/* Current Milestone Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Current Milestone</Text>
          <TouchableOpacity onPress={viewMoreMilestones}>
            <Text style={styles.viewMoreText}>View More</Text>
          </TouchableOpacity>
        </View>

        {currentMilestone ? (
          <TouchableOpacity onPress={() => goToStageDetails(currentMilestone)}>
            <View style={styles.containerbox}>
              <Image 
                source={currentMilestone.imageUrl ? { uri: currentMilestone.imageUrl } : placeholderImage} 
                style={styles.image} 
              />
              <View style={styles.eventDetails}>
                <Text style={styles.eventDetailText1}>{currentMilestone.name}</Text>
                <Text style={styles.eventDetailText2}>Start: {currentMilestone.startDate}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.eventDetailText3}>More</Text>
                  <Icon style={{ marginTop: 20 }} name="chevron-right" size={20} color="#000000" />
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ) : (
          <Text style={{ color: '#FFFFFF', fontSize: 18, marginTop: 10 }}>No Milestones Available</Text>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#118B50'
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 10
  },
  containerbox: { 
    backgroundColor: '#E3F0AF', 
    flexDirection: 'row', 
    width: '100%', 
    height: 180, 
    borderRadius: 20, 
    marginTop: 15 
  },
  searchButton: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 15, 
    paddingVertical: 10, 
    paddingHorizontal: 20, 
    marginTop: 20,
    width: '100%'
  },
  image: { 
    width: 150, 
    height: 160, 
    borderRadius: 20, 
    margin: 10 
  },
  eventDetails: { 
    flex: 1,
    marginLeft: 10, 
    marginTop: 20 
  },
  eventDetailText1: { 
    fontSize: 20, 
    color: '#000000', 
    fontWeight: 'bold' 
  },
  eventDetailText2: { 
    fontSize: 15, 
    color: '#000000', 
    marginTop: 10 
  },
  eventDetailText3: { 
    fontSize: 15, 
    color: '#000000', 
    fontWeight: 'bold', 
    marginTop: 20 
  },
  title: { 
    fontSize: 30, 
    color: '#FFFFFF', 
    marginTop: 50
  },
  titleContainer: { 
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    paddingLeft: 40 // Added padding to make room for hamburger menu
  },
  waveIcon: { 
    marginTop: 10, 
    marginLeft: 10 
  },
  subTitle: { 
    fontSize: 20, 
    color: '#C7ADCE', 
    marginBottom: 10,
    paddingLeft: 40 // Added padding to match titleContainer
  },
  viewMoreText: { 
    fontSize: 15, 
    color: '#FFFFFF', 
    marginLeft: 5,
    textDecorationLine: 'underline'
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 20
  },
  sectionTitle: {
    fontSize: 25,
    color: '#FFFFFF'
  },
  addButton: {
    backgroundColor: '#F6BD0F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    paddingVertical: 12,
    marginTop: 20,
    width: '100%'
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10
  }
});

export default Dashboard;