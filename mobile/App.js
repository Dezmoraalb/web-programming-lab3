import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

import BooksListScreen from './screens/BooksListScreen';
import BookDetailScreen from './screens/BookDetailScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#3a5ba0' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '600' },
        }}
      >
        <Stack.Screen
          name="BooksList"
          component={BooksListScreen}
          options={{ title: 'Бібліотека' }}
        />
        <Stack.Screen
          name="BookDetail"
          component={BookDetailScreen}
          options={({ route }) => ({
            title:
              route.params?.mode === 'create'
                ? 'Нова книга'
                : route.params?.mode === 'edit'
                ? 'Редагування'
                : 'Книга',
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
