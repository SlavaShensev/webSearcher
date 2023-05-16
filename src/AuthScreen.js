import React, {useState, useEffect, useRef} from 'react';
import {
  Button,
  TextInput,
  View,
  Alert,
  StyleSheet,
  Animated,
  Text,
  Dimensions,
} from 'react-native';

const AuthScreen = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const animationValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.timing(animationValue, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ).start();
    }
  }, [loading]);

  const handleLogin = () => {
    // Check if email is valid
    if (validateEmail(email)) {
      setLoading(true);
      animationValue.setValue(0);
      setTimeout(() => {
        setLoading(false);
        navigation.navigate('Main', {email: email});
      }, 2000);
    } else {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
    }
  };

  // Function to validate email
  const validateEmail = email => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  };
  const width = Dimensions.get('window').width / 2;
  const translateX = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-width, width],
  });
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Login to WebSearch</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        keyboardType="email-address"
      />
      <View style={styles.button}>
        {loading ? (
          <Animated.View
            style={{
              width: width,
              height: 3,
              backgroundColor: '#007BFF',
              borderRadius: 5,
              transform: [{translateX}],
            }}
          />
        ) : (
          <Button title="Log in" onPress={handleLogin} color="#1e88e5" />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: '#1e88e5',
    borderWidth: 1,
    marginBottom: 20,
    paddingLeft: 10,
    borderRadius: 5,
  },
  button: {
    height: 40,
    borderRadius: 5,
    overflow: 'hidden',
  },
});

export default AuthScreen;
