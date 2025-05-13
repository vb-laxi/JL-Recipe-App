import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, TextInput, Image } from 'react-native';
import { db, auth } from '../firebaseConfig'; // Adjust path as needed
import { ref, onValue } from 'firebase/database';
import { useNavigation } from '@react-navigation/native';

const ForumScreen = () => {
  const [posts, setPosts] = useState([]);
  const [searchText, setSearchText] = useState('');
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

  // Function to determine user display name based on authentication status
  const getUserDisplay = (post) => {
    if (post.isAuthenticated) {
      // For authenticated users - show truncated user ID or email if available
      return post.userId ? `👤 ${post.userId.substring(0, 8)}...` : 'Authenticated User';
    } else {
      // For anonymous users - show their chosen display name
      return `📝 ${post.anonymousUsername || 'Anonymous'}`;
    }
  };

  const renderItem = ({ item }) => (
    <Pressable 
      style={styles.postContainer}
      onPress={() => navigation.navigate('PostDetail', { post: item })}
    >
      <View style={styles.postHeader}>
        <Text style={styles.postTitle}>{item.title}</Text>
        <Text style={styles.userText}>{getUserDisplay(item)}</Text>
      </View>

      {/* Show ingredients snippet */}
      {item.ingredients && (
        <View style={styles.ingredientsSnippet}>
          <Text style={styles.sectionLabel}>Ingredients:</Text>
          <Text numberOfLines={2} style={styles.snippetText}>
            {item.ingredients}
          </Text>
        </View>
      )}

      {/* Show preparation steps snippet */}
      <Text numberOfLines={3} style={styles.postText}>{item.text}</Text>
      
      {/* Show image thumbnail if available */}
      {item.image && (
        <View style={styles.thumbnailContainer}>
          <Image 
            source={{ uri: item.image }} 
            style={styles.thumbnail}
            resizeMode="cover"
          />
        </View>
      )}

      <Text style={styles.timestamp}>{new Date(item.timestamp).toLocaleString()}</Text>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Recipe Feed</Text>
      </View>

      <TextInput
        style={styles.searchBar}
        placeholder="Search recipes by title..."
        value={searchText}
        onChangeText={setSearchText}
      />

      <FlatList
        data={filteredPosts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No recipes found matching your search.</Text>
            <Text style={styles.emptySubtext}>Be the first to share a recipe!</Text>
          </View>
        }
      />

      {/* Button to navigate to the PostScreen */}
      <Pressable 
        style={styles.addButton} 
        onPress={() => navigation.navigate('Post')}
      >
        <Text style={styles.addButtonText}>+</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  header: {
    marginBottom: 15,
    marginTop: 10,
    paddingHorizontal: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  searchBar: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  postContainer: {
    padding: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 3,
  },
  ingredientsSnippet: {
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
    padding: 8,
    borderRadius: 5,
  },
  snippetText: {
    fontSize: 14,
    color: '#555',
  },
  postText: {
    fontSize: 15,
    marginBottom: 10,
    color: '#444',
    lineHeight: 20,
  },
  userText: {
    fontSize: 13,
    color: '#0066cc',
    marginLeft: 5,
    fontWeight: '500',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    alignSelf: 'flex-end',
    marginTop: 5,
  },
  thumbnailContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  thumbnail: {
    width: '100%',
    height: 150,
    borderRadius: 8,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#999',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#FF6B6B',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  addButtonText: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
  },
});

export default ForumScreen;
