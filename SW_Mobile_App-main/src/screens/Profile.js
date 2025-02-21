import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import Icon from 'react-native-vector-icons/Ionicons'

const CircleWithText = ({ number }) => {
  return (
    <View style={styles.circleContainer}>
      <Text style={styles.circleText}>{number}</Text>
    </View>
  );
}

const TicketsButton = ({ stack }) => {
  function gotoMytickets() {
    stack.navigate('Mytickets');
  }

  return (
    <TouchableOpacity onPress={gotoMytickets} style={styles.buttonContainer}>
      <Icon name="ticket" size={40} color="#FFB300" />
      <Text style={styles.buttonText}>Tickets</Text>
    </TouchableOpacity>
  );
}

const EditProfileButton = ({ stack2 }) => {
  function gotoEditacc() {
    stack2.navigate('Editacc');
  }

  return (
    <TouchableOpacity onPress={gotoEditacc} style={styles.buttonContainer}>
      <Icon name="pencil-sharp" size={30} color="#C7ADCE" />
      <Text style={styles.buttonTextSmall}>Edit Profile</Text>
    </TouchableOpacity>
  );
}

const LogoutButton = ({ stack3 }) => {
  function gotologin() {
    stack3.navigate('Login');
  }

  return (
    <TouchableOpacity onPress={gotologin} style={[styles.buttonContainer, styles.logoutButtonContainer]}>
      <Icon name="log-out-outline" size={40} color="#C7ADCE" />
      <Text style={[styles.buttonText, styles.buttonTextSmall]}>Logout</Text>
    </TouchableOpacity>
  );
}

const Profile = ({ stack, stack2, stack3 }) => {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/img/userprofile.png')}
        style={styles.profileImage}
      />
      <Text style={styles.profileName}>
        --Name--
      </Text>

      <View style={styles.circleRow}>
        <CircleWithText number="12" />
        <CircleWithText number="10" />
      </View>

      <View style={styles.statsRow}>
        <Text style={styles.statsText}>Attended</Text>
        <Text style={styles.statsText}>Upcoming</Text>
      </View>

      <TicketsButton stack={stack} />
      <EditProfileButton stack2={stack2} />
      <LogoutButton stack3={stack3} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#118B50',
    alignItems: 'center',
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 100,
    borderWidth: 4,
    borderColor: '#F6BD0F',
    marginBottom: 10,
    marginTop: 100,
  },
  profileName: {
    fontSize: 30,
    color: '#FFFFFF',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  circleRow: {
    flexDirection: 'row',
  },
  circleContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F6BD0F',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 40,
  },
  circleText: {
    fontSize: 45,
    fontWeight: 'bold',
    color: 'white',
  },
  statsRow: {
    flexDirection: 'row',
  },
  statsText: {
    fontSize: 20,
    color: '#FFFFFF',
    marginBottom: 20,
    marginHorizontal: 50,
  },
  buttonContainer: {
    marginTop: 40,
  },
  buttonText: {
    fontSize: 25,
    color: '#FFFFFF',
    marginHorizontal: 45,
    marginTop: -33,
  },
  buttonTextSmall: {
    fontSize: 20,
    color: '#C7ADCE',
    marginHorizontal: 30,
    marginTop: -25,
  },
  logoutButtonContainer: {
    marginTop: 20,
    marginLeft: 47,
  },
});

export default Profile;
