import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const WelcomeScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Jonah and Lianet's Recipe App</Text>
      <Text style={styles.description}>
        Discover and share your favorite recipes!
      </Text>
      <Button
        title="Go to Recipes"
        onPress={() => navigation.navigate('Forum')} // Navigate to ForumScreen
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5', // Light background
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333', // Darker text
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    marginBottom: 30,
    color: '#666', // Medium gray text
    textAlign: 'center',
  },
});

export default WelcomeScreen;
