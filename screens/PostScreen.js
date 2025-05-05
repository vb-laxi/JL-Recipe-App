import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Image } from 'react-native';
import { db, auth } from '../firebaseConfig'; // Adjust the path as needed
import { ref, push } from 'firebase/database';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'react-native-image-picker'; // Import the image picker

const PostScreen = () => {
  const [text, setText] = useState(''); // State for preparation steps
  const [title, setTitle] = useState(''); // State for the post title
  const [ingredients, setIngredients] = useState(''); // State for ingredients
  const [image, setImage] = useState(null); // State for the selected image
  const navigation = useNavigation();

  const handlePost = async () => {
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

    if (auth.currentUser) {
      const postsRef = ref(db, 'posts');
      const postData = {
        text: text,
        title: title,
        ingredients: ingredients, // Include the ingredients in the post data
        userId: auth.currentUser.uid,
        timestamp: new Date().toISOString(),
      };

      if (image) {
        postData.image = image.uri; // Store the image URI
      }

      push(postsRef, postData)
        .then(() => {
          setText('');
          setTitle('');
          setIngredients(''); // Clear ingredients state
          setImage(null); // Clear the image state
          navigation.goBack();
        })
        .catch((error) => {
          Alert.alert('Error', 'Failed to post. Please try again later.', [{ text: 'OK' }]);
          console.error('Error posting:', error);
        });
    } else {
      Alert.alert('Authentication Required', 'You need to be logged in to post.', [
        { text: 'OK', onPress: () => navigation.navigate('AuthScreen') },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
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

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Create a Post</Text>

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
        onChangeText={setIngredients} // Use ingredients state
        placeholder="List your ingredients!"
      />

      <TextInput
        style={styles.input}
        multiline
        value={text}
        onChangeText={setText}
        placeholder="Preparation steps..."
      />

      {image && (
        <View style={styles.imagePreviewContainer}>
          <Image source={{ uri: image.uri }} style={styles.imagePreview} />
        </View>
      )}

      <Button title="Choose Image" onPress={handleChooseImage} />
      <Button title="Post" onPress={handlePost} />
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
    fontSize: 18,
    marginBottom: 10,
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
});

export default PostScreen;