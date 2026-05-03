import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { api } from '../api';

export default function BooksListScreen({ navigation }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.list();
      setBooks(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onDelete = (book) => {
    Alert.alert(
      'Видалення книги',
      `Видалити «${book.title}»?`,
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Видалити',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.remove(book.id);
              setBooks((prev) => prev.filter((b) => b.id !== book.id));
            } catch (e) {
              Alert.alert('Помилка', e.message);
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate('BookDetail', { mode: 'view', book: item })
      }
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.author} numberOfLines={1}>
          {item.author}
          {item.year ? ` · ${item.year}` : ''}
        </Text>
        <Text
          style={[
            styles.badge,
            item.available ? styles.badgeOk : styles.badgeNo,
          ]}
        >
          {item.available ? 'У наявності' : 'Видана'}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => onDelete(item)}
        style={styles.deleteBtn}
        hitSlop={10}
      >
        <Text style={styles.deleteText}>✕</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {loading && books.length === 0 ? (
        <ActivityIndicator style={{ marginTop: 32 }} size="large" />
      ) : (
        <FlatList
          data={books}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={
            books.length === 0 ? styles.emptyContainer : { padding: 12 }
          }
          ListEmptyComponent={
            !loading && (
              <Text style={styles.empty}>
                Книг немає. Натисніть «+» щоб додати першу.
              </Text>
            )
          }
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={load} />
          }
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('BookDetail', { mode: 'create' })}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f5f8' },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    alignItems: 'center',
  },
  title: { fontSize: 16, fontWeight: '600', color: '#1a1a1a' },
  author: { fontSize: 13, color: '#555', marginTop: 2 },
  badge: {
    marginTop: 6,
    alignSelf: 'flex-start',
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  badgeOk: { backgroundColor: '#dff5e1', color: '#1f7a35' },
  badgeNo: { backgroundColor: '#fde2e2', color: '#a52424' },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fde2e2',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  deleteText: { color: '#a52424', fontWeight: '700', fontSize: 16 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 28,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3a5ba0',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  fabText: { color: '#fff', fontSize: 32, lineHeight: 34 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { color: '#888', fontSize: 14, paddingHorizontal: 32, textAlign: 'center' },
  errorBox: { backgroundColor: '#fde2e2', padding: 10 },
  errorText: { color: '#a52424', textAlign: 'center' },
});
