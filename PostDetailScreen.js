import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { db, auth } from '../firebaseConfig';
import { ref, onValue, push, update, get, set } from 'firebase/database';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons'; // Make sure to install expo/vector-icons

const PostDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { post } = route.params;

  const [fullPost, setFullPost] = useState(post);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [anonymousUsername, setAnonymousUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  
  // Track if user is anonymous or authenticated
  const [isAnonymous, setIsAnonymous] = useState(!auth.currentUser);

  // Load the full post data and its comments
  useEffect(() => {
    const postRef = ref(db, `posts/${post.id}`);
    const unsubscribePost = onValue(postRef, (snapshot) => {
      const postData = snapshot.val();
      if (postData) {
        setFullPost(postData);
        // Set likes count
        setLikesCount(postData.likes ? Object.keys(postData.likes).length : 0);
        
        // Check if current user has liked this post
        if (auth.currentUser && postData.likes && postData.likes[auth.currentUser.uid]) {
          setLiked(true);
        }
      }
    });

    // Load comments
    const commentsRef = ref(db, `comments/${post.id}`);
    const unsubscribeComments = onValue(commentsRef, (snapshot) => {
      const commentsData = snapshot.val();
      if (commentsData) {
        const commentsArray = Object.keys(commentsData)
          .map(key => ({ id: key, ...commentsData[key] }))
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setComments(commentsArray);
      } else {
        setComments([]);
      }
      setLoading(false);
    });

    return () => {
      unsubscribePost();
      unsubscribeComments();
    };
  }, [post.id]);

  // Handle liking a post
  const handleLike = async () => {
    if (!auth.currentUser && !anonymousUsername.trim()) {
      Alert.alert('Name Required', 'Please enter your name to like this post.');
      return;
    }

    const likesRef = ref(db, `posts/${post.id}/likes`);
    
    if (auth.currentUser) {
      // For authenticated users
      if (liked) {
        // Unlike
        update(likesRef, {
          [auth.currentUser.uid]: null
        });
      } else {
        // Like
        update(likesRef, {
          [auth.currentUser.uid]: true
        });
      }
      setLiked(!liked);
    } else {
      // For anonymous users - use device ID or a random ID + username
      const anonymousId = 'anon_' + Math.random().toString(36).substring(2, 15);
      
      if (!liked) {
        update(likesRef, {
          [anonymousId]: anonymousUsername.trim()
        });
        setLiked(true);
      }
    }
  };

  // Handle posting a comment
  const handleComment = () => {
    if (!commentText.trim()) {
      Alert.alert('Empty Comment', 'Please enter a comment.');
      return;
    }

    if (isAnonymous && !anonymousUsername.trim()) {
      Alert.alert('Name Required', 'Please enter your name to comment.');
      return;
    }

    const commentsRef = ref(db, `comments/${post.id}`);
    const newComment = {
      text: commentText.trim(),
      timestamp: new Date().toISOString(),
    };

    if (auth.currentUser) {
      // For authenticated users
      newComment.userId = auth.currentUser.uid;
      newComment.isAuthenticated = true;
      if (auth.currentUser.displayName) {
        newComment.displayName = auth.currentUser.displayName;
      }
    } else {
      // For anonymous users
      newComment.anonymousUsername = anonymousUsername.trim();
      newComment.isAuthenticated = false;
    }

    push(commentsRef, newComment)
      .then(() => {
        setCommentText('');
        // Keep the anonymous username for future comments
      })
      .catch((error) => {
        Alert.alert('Error', 'Failed to post comment. Please try again.');
        console.error('Error posting comment:', error);
      });
  };

  // Function to format the display name for a comment
  const getCommentAuthor = (comment) => {
    if (comment.isAuthenticated) {
      return comment.displayName || `User ${comment.userId.substring(0, 6)}`;
    } else {
      return comment.anonymousUsername || 'Anonymous';
    }
  };

  // Format the post author/creator display
  const getPostAuthor = () => {
    if (fullPost.isAuthenticated) {
      return `👤 ${fullPost.userId ? fullPost.userId.substring(0, 8) : 'Authenticated User'}`;
    } else {
      return `📝 ${fullPost.anonymousUsername || 'Anonymous'}`;
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : null}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView style={styles.scrollContainer}>
        {/* Recipe Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{fullPost.title}</Text>
          <View style={styles.authorRow}>
            <Text style={styles.author}>{getPostAuthor()}</Text>
            <Text style={styles.date}>
              {new Date(fullPost.timestamp).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Recipe Image */}
        {fullPost.image && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: fullPost.image }}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
        )}

        {/* Ingredients Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ingredients</Text>
          <Text style={styles.ingredients}>{fullPost.ingredients}</Text>
        </View>

        {/* Preparation Steps Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preparation Steps</Text>
          <Text style={styles.preparationText}>{fullPost.text}</Text>
        </View>

        {/* Like Button */}
        <View style={styles.actionBar}>
          <Pressable
            style={[styles.likeButton, liked && styles.likedButton]}
            onPress={handleLike}
          >
            <Ionicons 
              name={liked ? "heart" : "heart-outline"} 
              size={24} 
              color={liked ? "#f84f31" : "#333"} 
            />
            <Text style={styles.likeText}>
              {liked ? 'Liked' : 'Like'} • {likesCount}
            </Text>
          </Pressable>
        </View>

        {/* Comments Section */}
        <View style={styles.commentSection}>
          <Text style={styles.sectionTitle}>Comments ({comments.length})</Text>
          
          {loading ? (
            <ActivityIndicator size="small" color="#0000ff" />
          ) : (
            comments.length === 0 ? (
              <Text style={styles.noComments}>No comments yet. Be the first to comment!</Text>
            ) : (
              comments.map((comment) => (
                <View key={comment.id} style={styles.comment}>
                  <View style={styles.commentHeader}>
                    <Text style={styles.commentAuthor}>{getCommentAuthor(comment)}</Text>
                    <Text style={styles.commentTime}>
                      {new Date(comment.timestamp).toLocaleString()}
                    </Text>
                  </View>
                  <Text style={styles.commentText}>{comment.text}</Text>
                </View>
              ))
            )
          )}
        </View>
      </ScrollView>

      {/* Comment Input Area */}
      <View style={styles.commentInputContainer}>
        {isAnonymous && (
          <TextInput
            style={styles.usernameInput}
            placeholder="Your Name"
            value={anonymousUsername}
            onChangeText={setAnonymousUsername}
          />
        )}
        <View style={styles.commentInputRow}>
          <TextInput
            style={styles.commentInput}
            placeholder="Add a comment..."
            value={commentText}
            onChangeText={setCommentText}
            multiline
          />
          <Pressable style={styles.sendButton} onPress={handleComment}>
            <Ionicons name="send" size={24} color="white" />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flex: 1,
    paddingBottom: 80, // Make room for comment input
  },
  header: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  authorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  author: {
    fontSize: 14,
    color: '#0066cc',
    fontWeight: '500',
  },
  date: {
    fontSize: 14,
    color: '#999',
  },
  imageContainer: {
    width: '100%',
    height: 250,
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  section: {
    padding: 16,
    backgroundColor: 'white',
    marginBottom: 16,
    borderRadius: 8,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  ingredients: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
  },
  preparationText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
  },
  actionBar: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    marginHorizontal: 10,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  likedButton: {
    backgroundColor: '#ffe6e6',
  },
  likeText: {
    marginLeft: 8,
    fontWeight: '500',
    color: '#333',
  },
  commentSection: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    marginHorizontal: 10,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  noComments: {
    textAlign: 'center',
    fontSize: 16,
    color: '#777',
    fontStyle: 'italic',
    padding: 16,
  },
  comment: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  commentAuthor: {
    fontWeight: 'bold',
    color: '#444',
  },
  commentTime: {
    fontSize: 12,
    color: '#999',
  },
  commentText: {
    fontSize: 15,
    color: '#333',
  },
  commentInputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
  },
  usernameInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    fontSize: 14,
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    padding: 10,
    marginRight: 10,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#FF6B6B',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PostDetailScreen;
