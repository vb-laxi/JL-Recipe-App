import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Image, Switch } from 'react-native';
import { db, auth } from '../firebaseConfig'; // Adjust the path as needed
import { ref, push } from 'firebase/database';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'react-native-image-picker';

// Define screen names as constants to prevent typos
const SCREENS = {
  AUTH: 'Auth'
};

const PostScreen = () => {
  const [text, setText] = useState(''); // State for preparation steps
  const [title, setTitle] = useState(''); // State for the post title
  const [ingredients, setIngredients] = useState(''); // State for ingredients
  const [image, setImage] = useState(null); // State for the selected image
  const [anonymousUsername, setAnonymousUsername] = useState(''); // Anonymous username for non-authenticated users
  const [useAuthentication, setUseAuthentication] = useState(!!auth.currentUser); // Default to authenticated if user is logged in
  const navigation = useNavigation();

  const handleAuth = () => {
    navigation.navigate(SCREENS.AUTH);
    console.log('Navigating to Auth screen');
  };

  const handlePost = async () => {
    // Validate common required fields
    if (!text.trim()) {
      Alert.alert('Warning', 'Please enter some preparation steps.');
      return;
    }
    if (!title.trim()) {
      Alert.alert('Warning', 'Please enter a title for your post.');
      return;
    }
    if (!ingredients.trim()) {
      Alert.alert('Warning', 'Please enter your ingredients.');
      return;
    }

    // Check if using anonymous posting and validate username
    if (!useAuthentication && !anonymousUsername.trim()) {
      Alert.alert('Warning', 'Please enter a display name to post anonymously.');
      return;
    }

    const postsRef = ref(db, 'posts');
    const postData = {
      text: text,
      title: title,
      ingredients: ingredients,
      timestamp: new Date().toISOString(),
    };

    // Add user identification based on auth method
    if (useAuthentication && auth.currentUser) {
      // Use Firebase auth user ID
      postData.userId = auth.currentUser.uid;
      postData.isAuthenticated = true;
    } else {
      // Use anonymous username
      postData.anonymousUsername = anonymousUsername.trim();
      postData.isAuthenticated = false;
    }

    if (image) {
      postData.image = image.uri; // Store the image URI
    }

    push(postsRef, postData)
      .then(() => {
        setText('');
        setTitle('');
        setIngredients('');
        setImage(null);
        if (!useAuthentication) {
          // Keep the anonymous username for future posts
        }
        Alert.alert('Success', 'Your recipe has been posted!');
        navigation.goBack();
      })
      .catch((error) => {
        Alert.alert('Error', 'Failed to post. Please try again later.', [{ text: 'OK' }]);
        console.error('Error posting:', error);
      });
  };

  const handleChooseImage = async () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };

    ImagePicker.launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
        Alert.alert('Error', 'Could not select image. Please try again.');
      } else {
        if (response.assets && response.assets.length > 0) {
          setImage({ uri: response.assets[0].uri });
        }
      }
    });
  };

  // Toggle between authenticated and anonymous posting
  const toggleAuthenticationMode = () => {
    setUseAuthentication(!useAuthentication);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Create a Recipe Post</Text>

      <TextInput
        style={styles.titleInput}
        placeholder="Recipe Title"
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        style={styles.input}
        multiline
        value={ingredients}
        onChangeText={setIngredients}
        placeholder="List your ingredients!"
      />

      <TextInput
        style={styles.input}
        multiline
        value={text}
        onChangeText={setText}
        placeholder="Preparation steps..."
      />

      {/* Authentication toggle section */}
      <View style={styles.authToggleContainer}>
        <Text>Post as authenticated user</Text>
        <Switch
          value={useAuthentication}
          onValueChange={toggleAuthenticationMode}
          disabled={!auth.currentUser} // Disable toggle if not logged in
        />
      </View>

      {/* Show username field for anonymous posting */}
      {(!useAuthentication || !auth.currentUser) && (
        <TextInput
          style={styles.usernameInput}
          placeholder="Enter a display name for your post"
          value={anonymousUsername}
          onChangeText={setAnonymousUsername}
        />
      )}

      {/* Show current authentication status */}
      <Text style={styles.authStatus}>
        {auth.currentUser
          ? useAuthentication
            ? `Posting as: ${auth.currentUser.email || auth.currentUser.displayName || 'Authenticated User'}`
            : 'Posting anonymously with display name'
          : 'Posting anonymously with display name'}
      </Text>

      {image && (
        <View style={styles.imagePreviewContainer}>
          <Image source={{ uri: image.uri }} style={styles.imagePreview} />
        </View>
      )}

      <View style={styles.buttonContainer}>
        <Button title="Choose Image" onPress={handleChooseImage} />
        <Button title="Post Recipe" onPress={handlePost} />
      </View>

      {/* Optional login prompt */}
      {!auth.currentUser && (
        <View style={styles.loginPrompt}>
          <Text style={styles.loginText}>Want to track all your recipes?</Text>
          <Button title="Sign In" onPress={handleAuth} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-start',
  },
  label: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  titleInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 15,
    marginBottom: 10,
    fontSize: 16,
    minHeight: 40,
  },
  usernameInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 15,
    marginBottom: 10,
    fontSize: 16,
  },
  authToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  authStatus: {
    fontStyle: 'italic',
    marginBottom: 15,
    color: '#555',
  },
  imagePreviewContainer: {
    marginTop: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  imagePreview: {
    width: 200,
    height: 200,
    borderRadius: 10,
    resizeMode: 'contain',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    marginBottom: 20,
  },
  loginPrompt: {
    marginTop: 20,
    padding: 15,
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  loginText: {
    marginBottom: 10,
    fontSize: 16,
  },
});

export default PostScreen;
