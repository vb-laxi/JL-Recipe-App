import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ForumScreen from './screens/ForumScreen';
import AuthScreen from './screens/AuthScreen';
import PostScreen from './screens/PostScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const Stack = createNativeStackNavigator();

function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen 
            name="Home" 
            component={WelcomeScreen} 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="Forum" 
            component={ForumScreen} 
            options={{ title: 'Find Recipes' }} 
          />
          <Stack.Screen 
            name="Post" 
            component={PostScreen} 
            options={{ title: 'Create Post' }} 
          />
          <Stack.Screen 
            name="Auth" 
            component={AuthScreen} 
            options={{ title: 'Authentication' }} 
          />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

export default App;