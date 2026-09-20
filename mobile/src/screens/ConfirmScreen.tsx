import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CoverPlate from '../components/CoverPlate';
import { generateInscription } from '../lib/inscriptions';
import { RootStackParamList } from '../navigation/types';
import { useBooks } from '../store/BooksContext';
import { color, font, radius } from '../theme/tokens';
import { Book } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Confirm'>;
type Route = RouteProp<RootStackParamList, 'Confirm'>;

export default function ConfirmScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const { books, addBook } = useBooks();
  const { detected, photoUri } = params;

  const [title, setTitle] = useState(detected.title);
  const [author, setAuthor] = useState(detected.author);
  const [genre, setGenre] = useState(detected.genre);
  const [pages, setPages] = useState(detected.pages ? String(detected.pages) : '');
  const [note, setNote] = useState('');

  const isFromCover = detected.title.length > 0;

  const handleEnshrine = () => {
    const finishedAt = new Date();
    const days = 3 + Math.floor(Math.random() * 12);
    const startedAt = new Date(finishedAt.getTime() - days * 24 * 60 * 60 * 1000);
    const pageCount = parseInt(pages, 10) || 0;
    const book: Book = {
      id: `${Date.now()}`,
      title: title.trim() || 'Untitled',
      author: author.trim() || 'Unknown',
      genre: genre.trim() || 'Unsorted',
      pages: pageCount,
      note: note.trim(),
      inscription: generateInscription(title.trim() || 'Untitled', days),
      coverUri: photoUri,
      startedAt: startedAt.toISOString(),
      finishedAt: finishedAt.toISOString(),
      volume: books.length + 1,
    };
    addBook(book);
    navigation.replace('Plaque', { bookId: book.id });
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <TouchableOpacity accessibilityRole="button" onPress={() => navigation.goBack()}>
            <Text style={styles.retake}>Retake</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Confirm the details</Text>
          <View style={{ width: 52 }} />
        </View>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <View style={styles.introRow}>
            <CoverPlate style={styles.plate} imageUri={photoUri ?? undefined} label={photoUri ? undefined : 'cover photo'} />
            <View style={styles.introCopy}>
              {isFromCover ? (
                <>
                  <View style={styles.tag}>
                    <Text style={styles.tagLabel}>Read from the cover</Text>
                  </View>
                  <Text style={styles.introBody}>
                    Check each field. Covers lie, and the reader misreads decorative type more often than plain.
                  </Text>
                </>
              ) : (
                <Text style={styles.introBody}>Enter the details yourself — no cover photo this time.</Text>
              )}
            </View>
          </View>

          <View style={styles.fields}>
            <Field label="Title" value={title} onChangeText={setTitle} />
            <Field label="Author" value={author} onChangeText={setAuthor} />
            <Field label="Genre" value={genre} onChangeText={setGenre} />
            <Field label="Pages" value={pages} onChangeText={setPages} keyboardType="number-pad" />
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Finished on</Text>
              <View style={styles.inputStatic}>
                <Text style={styles.inputStaticText}>
                  {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                </Text>
              </View>
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>
                A note to your future self <Text style={{ opacity: 0.6 }}>(optional)</Text>
              </Text>
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                value={note}
                onChangeText={setNote}
                placeholder="Read on the train, mostly."
                placeholderTextColor={color.textMuted55}
                multiline
              />
            </View>
          </View>
        </ScrollView>
        <View style={styles.footer}>
          <TouchableOpacity style={styles.discardBtn} accessibilityRole="button" onPress={() => navigation.goBack()}>
            <Text style={styles.discardLabel}>Discard</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.enshrineBtn} accessibilityRole="button" onPress={handleEnshrine}>
            <Text style={styles.enshrineLabel}>Enshrine it</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  keyboardType?: 'default' | 'number-pad';
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholderTextColor={color.textMuted55}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: color.bg,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: color.divider,
  },
  retake: {
    fontFamily: font.body,
    fontSize: 13,
    color: color.accent,
  },
  headerTitle: {
    fontFamily: font.heading,
    fontSize: 15,
    color: color.text,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  introRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 18,
  },
  plate: {
    width: 88,
    aspectRatio: 2 / 3,
  },
  introCopy: {
    flex: 1,
  },
  tag: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: color.accent,
    borderRadius: radius.sm,
    paddingVertical: 3,
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  tagLabel: {
    fontFamily: font.body,
    fontSize: 11,
    color: color.accent,
  },
  introBody: {
    fontFamily: font.body,
    fontSize: 12,
    lineHeight: 19,
    color: color.textMuted62,
  },
  fields: {
    gap: 12,
  },
  field: {
    gap: 5,
  },
  fieldLabel: {
    fontFamily: font.body,
    fontSize: 12,
    color: color.textMuted70,
  },
  input: {
    minHeight: 38,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontFamily: font.body,
    fontSize: 14,
    color: color.text,
    borderWidth: 1,
    borderColor: color.divider,
    borderRadius: radius.md,
  },
  inputMultiline: {
    minHeight: 62,
    textAlignVertical: 'top',
  },
  inputStatic: {
    minHeight: 38,
    paddingHorizontal: 10,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: color.divider,
    borderRadius: radius.md,
  },
  inputStaticText: {
    fontFamily: font.body,
    fontSize: 14,
    color: color.text,
    fontVariant: ['tabular-nums', 'lining-nums'],
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: color.divider,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
    flexDirection: 'row',
    gap: 10,
  },
  discardBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: color.divider,
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  discardLabel: {
    fontFamily: font.heading,
    fontSize: 14,
    color: color.text,
  },
  enshrineBtn: {
    flex: 2,
    backgroundColor: color.accent,
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  enshrineLabel: {
    fontFamily: font.heading,
    fontSize: 14,
    color: '#fff',
  },
});
