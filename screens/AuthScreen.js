import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { auth } from '../firebaseConfig';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
} from 'firebase/auth';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { useNavigation } from '@react-navigation/native';

// Replace with your actual Google Sign-in web client ID from Firebase console
const GOOGLE_CLIENT_ID = '1092434680388-m0rbig38l8ef4dp3nuo01f42ri7seegh.apps.googleusercontent.com';

// Replace with your iOS and Android redirect URIs configured in Firebase
const REDIRECT_URI = AuthSession.makeRedirectUri({
    scheme: 'myapp', // Or 'com.yourbundleid.yourproject' if you have it
  });
WebBrowser.maybeCompleteAuthSession();

const AuthScreen = () => {
    const [request, response, promptAsync] = AuthSession.useAuthRequest({
        clientId: GOOGLE_CLIENT_ID,
        redirectUri: REDIRECT_URI,
        scopes: ['openid', 'profile', 'email'],
        responseType: 'id_token',
        extraParams: {
          nonce: 'nonce', // You can generate a secure nonce in production
        },
      });
      
  const navigation = useNavigation();
  console.log('Request object:', request);

  useEffect(() => {
    console.log('Redirect URI:', REDIRECT_URI); // Add this line
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential)
        .then(() => {
          Alert.alert('Success', 'Signed in with Google!');
          navigation.goBack();
        })
        .catch((error) => {
          Alert.alert('Google Sign-in Failed', error.message);
          console.error('Google Sign-in error:', error);
        });
    }
  }, [response, navigation, REDIRECT_URI]);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

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
      setEmail('');
      setPassword('');
    }
  };

  const handleGoogleSignIn = async () => {
    promptAsync();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isSignUp ? 'Sign Up' : 'Sign In'}</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title={isSignUp ? 'Sign Up' : 'Sign In'} onPress={handleAuth} />
      <Button
        title={isSignUp ? 'Already have an account? Sign In' : 'Don\'t have an account? Sign Up'}
        onPress={() => setIsSignUp(!isSignUp)}
      />
      <Button title="Sign in with Google" onPress={handleGoogleSignIn} disabled={!request} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
});

export default AuthScreen;