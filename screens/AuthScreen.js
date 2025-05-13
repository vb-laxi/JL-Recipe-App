import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { auth } from '../firebaseConfig';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
} from 'firebase/auth';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import { useNavigation } from '@react-navigation/native';

// Configure web browser for authentication
WebBrowser.maybeCompleteAuthSession();

// Replace with your actual Google client IDs
const EXPO_CLIENT_ID = '11092434680388-m0rbig38l8ef4dp3nuo01f42ri7seegh.apps.googleusercontent.com';
const ANDROID_CLIENT_ID = '11092434680388-m0rbig38l8ef4dp3nuo01f42ri7seegh.apps.googleusercontent.com';
const IOS_CLIENT_ID = '11092434680388-m0rbig38l8ef4dp3nuo01f42ri7seegh.apps.googleusercontent.com';

const AuthScreen = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  // Log the redirect URI to help with debugging
  console.log("Redirect URI:", makeRedirectUri({
    scheme: 'recipeapp',
    useProxy: true
  }));

  // Use the Google provider from expo-auth-session with proper configuration for Expo Go
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: EXPO_CLIENT_ID,
    androidClientId: ANDROID_CLIENT_ID,
    iosClientId: IOS_CLIENT_ID,
    redirectUri: makeRedirectUri({
      scheme: 'recipeapp',
      useProxy: true
    }),
    useProxy: true, // Essential for Expo Go testing
    scopes: ['profile', 'email']
  });

  useEffect(() => {
    if (response?.type === 'success') {
      setLoading(true);
      // Handle the Google Sign-In response
      const { id_token } = response.params;
      
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential)
        .then(() => {
          Alert.alert('Success', 'Signed in with Google!');
          navigation.goBack();
        })
        .catch((error) => {
          console.error('Google Sign-in error:', error);
          Alert.alert('Google Sign-in Failed', error.message);
        })
        .finally(() => {
          setLoading(false);
        });
    } else if (response?.type === 'error') {
      console.error('Google Sign-in error response:', response.error);
      Alert.alert('Google Sign-in Error', response.error?.message || 'An error occurred during Google sign-in');
    }
  }, [response]);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        Alert.alert('Success', 'Account created successfully!');
        setIsSignUp(false);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        Alert.alert('Success', 'Signed in successfully!');
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Authentication Failed', error.message);
      console.error('Authentication error:', error);
    } finally {
      setLoading(false);
      setEmail('');
      setPassword('');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await promptAsync();
    } catch (error) {
      console.error('Error starting Google Sign-In:', error);
      Alert.alert('Error', 'Failed to start Google sign-in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isSignUp ? 'Create Account' : 'Welcome Back'}</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!loading}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!loading}
      />
      
      <TouchableOpacity 
        style={[styles.button, loading && styles.disabledButton]} 
        onPress={handleAuth}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{isSignUp ? 'Sign Up' : 'Sign In'}</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.googleButton} 
        onPress={handleGoogleSignIn}
        disabled={!request || loading}
      >
        <Text style={styles.googleButtonText}>Continue with Google</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.toggleButton} 
        onPress={() => setIsSignUp(!isSignUp)}
        disabled={loading}
      >
        <Text style={styles.toggleText}>
          {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#4285F4',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  disabledButton: {
    backgroundColor: '#A9A9A9',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  googleButton: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  googleButtonText: {
    color: '#757575',
    fontSize: 16,
    fontWeight: 'bold',
  },
  toggleButton: {
    marginTop: 10,
    alignItems: 'center',
  },
  toggleText: {
    color: '#4285F4',
    fontSize: 14,
  },
});

export default AuthScreen;
