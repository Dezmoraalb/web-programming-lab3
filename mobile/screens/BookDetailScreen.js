import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import { api } from '../api';

const EMPTY_BOOK = {
  title: '',
  author: '',
  isbn: '',
  year: '',
  genre: '',
  pages: '',
  available: true,
};

function bookToForm(b) {
  if (!b) return { ...EMPTY_BOOK };
  return {
    title: b.title ?? '',
    author: b.author ?? '',
    isbn: b.isbn ?? '',
    year: b.year != null ? String(b.year) : '',
    genre: b.genre ?? '',
    pages: b.pages != null ? String(b.pages) : '',
    available: !!b.available,
  };
}

function formToPayload(form) {
  const parseIntOrNull = (s) => {
    const t = String(s).trim();
    if (t === '') return null;
    const n = parseInt(t, 10);
    if (Number.isNaN(n)) throw new Error('Рік та сторінки мають бути числами');
    return n;
  };
  if (!form.title.trim()) throw new Error('Назва є обов\'язковою');
  if (!form.author.trim()) throw new Error('Автор є обов\'язковим');

  return {
    title: form.title.trim(),
    author: form.author.trim(),
    isbn: form.isbn.trim() || null,
    year: parseIntOrNull(form.year),
    genre: form.genre.trim() || null,
    pages: parseIntOrNull(form.pages),
    available: !!form.available,
  };
}

export default function BookDetailScreen({ route, navigation }) {
  const { mode: initialMode = 'view', book: initialBook = null } =
    route.params || {};

  const [mode, setMode] = useState(initialMode);
  const [book, setBook] = useState(initialBook);
  const [form, setForm] = useState(bookToForm(initialBook));
  const [saving, setSaving] = useState(false);

  const editable = mode !== 'view';

  const setField = (key) => (value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const onCancel = () => {
    if (mode === 'create') {
      navigation.goBack();
    } else {
      setForm(bookToForm(book));
      setMode('view');
    }
  };

  const onSave = async () => {
    let payload;
    try {
      payload = formToPayload(form);
    } catch (e) {
      Alert.alert('Помилка', e.message);
      return;
    }
    setSaving(true);
    try {
      if (mode === 'create') {
        await api.create(payload);
        navigation.goBack();
      } else {
        const updated = await api.update(book.id, payload);
        setBook(updated);
        setForm(bookToForm(updated));
        setMode('view');
      }
    } catch (e) {
      Alert.alert('Помилка', e.message);
    } finally {
      setSaving(false);
    }
  };

  const onDelete = () => {
    Alert.alert('Видалити книгу?', book.title, [
      { text: 'Скасувати', style: 'cancel' },
      {
        text: 'Видалити',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.remove(book.id);
            navigation.goBack();
          } catch (e) {
            Alert.alert('Помилка', e.message);
          }
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#f4f5f8' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Field label="Назва *" value={form.title} onChange={setField('title')} editable={editable} />
        <Field label="Автор *" value={form.author} onChange={setField('author')} editable={editable} />
        <Field label="ISBN" value={form.isbn} onChange={setField('isbn')} editable={editable} />
        <Field label="Рік видання" value={form.year} onChange={setField('year')} editable={editable} keyboardType="numeric" />
        <Field label="Жанр" value={form.genre} onChange={setField('genre')} editable={editable} />
        <Field label="Кількість сторінок" value={form.pages} onChange={setField('pages')} editable={editable} keyboardType="numeric" />

        <View style={styles.row}>
          <Text style={styles.label}>У наявності</Text>
          <Switch
            value={form.available}
            onValueChange={setField('available')}
            disabled={!editable}
          />
        </View>

        <View style={styles.actions}>
          {mode === 'view' && (
            <>
              <TouchableOpacity
                style={[styles.btn, styles.primaryBtn]}
                onPress={() => setMode('edit')}
              >
                <Text style={styles.primaryBtnText}>Редагувати</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.dangerBtn]}
                onPress={onDelete}
              >
                <Text style={styles.dangerBtnText}>Видалити</Text>
              </TouchableOpacity>
            </>
          )}

          {(mode === 'edit' || mode === 'create') && (
            <>
              <TouchableOpacity
                style={[styles.btn, styles.primaryBtn, saving && { opacity: 0.6 }]}
                onPress={onSave}
                disabled={saving}
              >
                <Text style={styles.primaryBtnText}>
                  {saving ? 'Збереження…' : 'Зберегти'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.secondaryBtn]}
                onPress={onCancel}
                disabled={saving}
              >
                <Text style={styles.secondaryBtnText}>Скасувати</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({ label, value, onChange, editable, keyboardType }) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, !editable && styles.inputDisabled]}
        value={value}
        onChangeText={onChange}
        editable={editable}
        keyboardType={keyboardType}
        placeholderTextColor="#aaa"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40 },
  fieldGroup: { marginBottom: 14 },
  label: { fontSize: 13, color: '#555', marginBottom: 6, fontWeight: '500' },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#dde0e6',
    color: '#1a1a1a',
  },
  inputDisabled: { backgroundColor: '#eef0f3', color: '#333' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#dde0e6',
  },
  actions: { marginTop: 8, gap: 10 },
  btn: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryBtn: { backgroundColor: '#3a5ba0' },
  primaryBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  secondaryBtn: { backgroundColor: '#e3e6ec' },
  secondaryBtnText: { color: '#333', fontWeight: '600', fontSize: 15 },
  dangerBtn: { backgroundColor: '#fde2e2' },
  dangerBtnText: { color: '#a52424', fontWeight: '600', fontSize: 15 },
});
