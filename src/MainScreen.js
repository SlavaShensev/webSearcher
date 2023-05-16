import React, {useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, Alert, StyleSheet} from 'react-native';
import {WebView} from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MainScreen = ({route}) => {
  const {email} = route.params;
  const [sites, setSites] = useState([]);
  const [currentSite, setCurrentSite] = useState(null);
  const [copyrightInfo, setCopyrightInfo] = useState('');

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
  };

  // Function to run JavaScript in the WebView
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

  // Function to handle messages from the WebView
  const onMessage = event => {
    const info = event.nativeEvent.data;
    if (info === 'NOT_FOUND') {
      Alert.alert('Error', 'Could not find copyright info on this site');
    } else {
      AsyncStorage.setItem('copyrightInfo', info); // Save to AsyncStorage
      setCopyrightInfo(info);
    }
  };

  // Read copyrightInfo from AsyncStorage when component mounts
  useEffect(() => {
    AsyncStorage.getItem('copyrightInfo').then(info => {
      if (info) {
        setCopyrightInfo(info);
      }
    });
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
      <Text style={styles.copyrightText}>Copyright: {copyrightInfo}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  welcomeText: {
    fontSize: 20,
    marginBottom: 20,
  },
  siteLink: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#ddd',
    borderRadius: 5,
  },
  siteUrl: {
    fontSize: 16,
  },
  copyrightText: {
    marginTop: 20,
    fontSize: 18,
  },
});

export default MainScreen;
