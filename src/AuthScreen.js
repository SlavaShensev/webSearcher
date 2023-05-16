import React, {useState} from 'react';
import {Button, TextInput, View, Alert, StyleSheet} from 'react-native';

const AuthScreen = ({navigation}) => {
  const [email, setEmail] = useState('');

  const handleLogin = () => {
    // Check if email is valid
    if (validateEmail(email)) {
      // send email to the server
      navigation.navigate('Main', {email: email});
    } else {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
    }
  };

  // Function to validate email
  const validateEmail = email => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
      />
      <Button title="Log in" onPress={handleLogin} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingLeft: 10,
  },
});

export default AuthScreen;
