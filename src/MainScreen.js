import React, {useEffect, useState, useCallback, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import {WebView} from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MainScreen = ({route}) => {
  const {email} = route.params;
  const [sites, setSites] = useState([]);
  const [currentSite, setCurrentSite] = useState(null);
  const [copyrightInfo, setCopyrightInfo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const animationValue = useRef(new Animated.Value(0)).current;

  // Fetch the list of websites when the component mounts
  useEffect(() => {
    fetch(
      'https://6389df1b4eccb986e89cf319.mockapi.io/external-verification/websites',
    )
      .then(response => response.json())
      .then(data => setSites(data))
      .catch(error => console.error(error));
  }, []);

  // Function to handle when a website is selected
  const handleSiteTap = site => {
    setCurrentSite(site);
    setIsLoading(true);
    animationValue.setValue(0); // Reset the animation value
    Animated.loop(
      Animated.timing(animationValue, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ).start();
  };

  const LoadingIndicator = () => {
    const width = Dimensions.get('window').width;
    const translateX = animationValue.interpolate({
      inputRange: [0, 1],
      outputRange: [-width, width],
    });
    return (
      <Animated.View
        style={{
          width: 20,
          height: 8, // Increased height
          backgroundColor: 'blue',
          transform: [{translateX}],
        }}
      />
    );
  };

  const runJSInTheWebview = () => {
    return `
    const allSpans = [...document.querySelectorAll('footer span')];
    const copyrightSpan = allSpans.find(span => span.innerText.includes('©'));
    if (copyrightSpan) {
      window.ReactNativeWebView.postMessage(copyrightSpan.innerText);
    } else {
      window.ReactNativeWebView.postMessage('NOT_FOUND');
    }
  `;
  };

  const onMessage = event => {
    const info = event.nativeEvent.data;
    setIsLoading(false);
    Animated.timing(animationValue).stop();
    if (info === 'NOT_FOUND') {
      Alert.alert('Error', 'Could not find copyright info on this site');
    } else {
      AsyncStorage.setItem('copyrightInfo', info); // Save to AsyncStorage
      setCopyrightInfo(info);
    }
  };

  useEffect(() => {
    const fetchCopyrightInfo = async () => {
      try {
        const info = await AsyncStorage.getItem('copyrightInfo');
        if (info) {
          setCopyrightInfo(info);
        }
      } catch (error) {
        console.error(error);
        Alert.alert('Error', 'Could not fetch copyright info');
      }
    };

    fetchCopyrightInfo();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Hello, {email}</Text>
      {sites.map((site, index) => (
        <TouchableOpacity
          style={styles.siteLink}
          key={index}
          onPress={() => handleSiteTap(site)}>
          <Text style={styles.siteUrl}>{site.url}</Text>
        </TouchableOpacity>
      ))}
      {currentSite && (
        <WebView
          source={{uri: currentSite.url}}
          injectedJavaScript={runJSInTheWebview()}
          onMessage={onMessage}
        />
      )}
      {isLoading ? (
        <LoadingIndicator />
      ) : (
        <Text style={styles.copyrightText}>Copyright: {copyrightInfo}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  welcomeText: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  siteLink: {
    padding: 15,
    marginVertical: 5,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  siteUrl: {
    fontSize: 18,
    color: '#28405c',
  },
  copyrightText: {
    marginTop: 20,
    fontSize: 20,
    fontWeight: '500',
    color: '#333',
  },
});

export default MainScreen;
