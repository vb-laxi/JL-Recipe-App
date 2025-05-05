import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, TextInput } from 'react-native'; // Added TextInput
import { db } from '../firebaseConfig'; // Adjust path as needed
import { ref, onValue } from 'firebase/database';
import { useNavigation } from '@react-navigation/native';

const ForumScreen = () => {
  const [posts, setPosts] = useState([]);
  const [searchText, setSearchText] = useState(''); // State for the search query
  const navigation = useNavigation();

  useEffect(() => {
    const postsRef = ref(db, 'posts');
    const unsubscribe = onValue(postsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formattedPosts = Object.keys(data)
          .map((key) => ({ id: key, ...data[key] }))
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setPosts(formattedPosts);
      } else {
        setPosts([]);
      }
    });

    return () => unsubscribe(); // Clean up the listener
  }, []);

  const filteredPosts = posts.filter(post =>
    post.title && post.title.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <View style={styles.postContainer}>
      <Text style={styles.postTitle}>{item.title}</Text> {/* Display the post title */}
      <Text style={styles.postText}>{item.text}</Text>
      {item.userId && <Text style={styles.userText}>User: {item.userId.substring(0, 8)}</Text>}
      <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleString()}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar} // Added search bar style
        placeholder="Search posts by title..."
        value={searchText}
        onChangeText={setSearchText}
      />
      <FlatList
        data={filteredPosts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text>No posts found matching your search.</Text>}
      />
      {/* Button to navigate to the PostScreen using Pressable */}
      <Pressable style={styles.addButton} onPress={() => navigation.navigate('Post')}>
        <Text style={styles.addButtonText}>+</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  searchBar: { // Added search bar style
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  postContainer: {
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  postTitle: { // Added style for post title
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  postText: {
    fontSize: 16,
    marginBottom: 5,
  },
  userText: {
    fontSize: 12,
    color: 'gray',
    marginBottom: 3,
  },
  timestamp: {
    fontSize: 10,
    color: 'lightgray',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'dodgerblue',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  addButtonText: {
    color: 'white',
    fontSize: 24,
  },
});

export default ForumScreen;
