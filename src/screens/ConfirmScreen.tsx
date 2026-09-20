import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CoverPlate from '../components/CoverPlate';
import { writeInscription } from '../lib/inscribe';
import { RootStackParamList } from '../navigation/types';
import { useBooks } from '../store/BooksContext';
import { color, font, radius } from '../theme/tokens';
import { Book, BookStatus } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Confirm'>;
type Route = RouteProp<RootStackParamList, 'Confirm'>;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function ConfirmScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const { books, addBook, updateBook, nextVolume } = useBooks();

  const editing = params.mode === 'edit' ? books.find((b) => b.id === params.bookId) ?? null : null;
  const photoUri = params.mode === 'create' ? params.photoUri : editing?.coverUri ?? null;
  const detected = params.mode === 'create' ? params.detected : null;
  const isFromCover = !!detected && detected.title.length > 0;

  const [title, setTitle] = useState(editing?.title ?? detected?.title ?? '');
  const [author, setAuthor] = useState(editing?.author ?? detected?.author ?? '');
  const [genre, setGenre] = useState(editing?.genre ?? detected?.genre ?? '');
  const [pages, setPages] = useState(
    editing ? String(editing.pages || '') : detected?.pages ? String(detected.pages) : ''
  );
  const [pagesRead, setPagesRead] = useState(editing ? String(editing.pagesRead || '') : '');
  const [note, setNote] = useState(editing?.note ?? '');
  const [status, setStatus] = useState<BookStatus>(editing?.status ?? 'finished');
  const [saving, setSaving] = useState(false);

  const pageCount = parseInt(pages, 10) || 0;
  const readCount = Math.min(pageCount || Number.MAX_SAFE_INTEGER, parseInt(pagesRead, 10) || 0);

  const trimmed = () => ({
    title: title.trim() || 'Untitled',
    author: author.trim() || 'Unknown',
    genre: genre.trim() || 'Unsorted',
    pages: pageCount,
    note: note.trim(),
  });

  const handleSaveEdit = () => {
    if (!editing) return;
    updateBook(editing.id, {
      ...trimmed(),
      pagesRead: editing.status === 'reading' ? readCount : pageCount,
    });
    navigation.goBack();
  };

  const handleStartReading = () => {
    const now = new Date().toISOString();
    const book: Book = {
      id: `${Date.now()}`,
      ...trimmed(),
      pagesRead: readCount,
      inscription: '',
      coverUri: photoUri,
      status: 'reading',
      startedAt: now,
      finishedAt: null,
      volume: null,
      createdAt: now,
      updatedAt: now,
    };
    addBook(book);
    navigation.goBack();
  };

  const handleEnshrine = async () => {
    setSaving(true);
    const fields = trimmed();
    const now = new Date().toISOString();
    const { text } = await writeInscription({
      title: fields.title,
      author: fields.author,
      genre: fields.genre,
      days: null,
    });
    const book: Book = {
      id: `${Date.now()}`,
      ...fields,
      pagesRead: pageCount,
      inscription: text,
      coverUri: photoUri,
      status: 'finished',
      startedAt: null,
      finishedAt: now,
      volume: nextVolume(),
      createdAt: now,
      updatedAt: now,
    };
    addBook(book);
    navigation.replace('Plaque', { bookId: book.id });
  };

  const primary = editing
    ? { label: 'Save changes', onPress: handleSaveEdit }
    : status === 'reading'
      ? { label: 'Start reading', onPress: handleStartReading }
      : { label: saving ? 'Engraving the plaque…' : 'Enshrine it', onPress: handleEnshrine };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <TouchableOpacity accessibilityRole="button" onPress={() => navigation.goBack()} disabled={saving}>
            <Text style={styles.retake}>{editing ? 'Cancel' : 'Retake'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{editing ? 'Edit the details' : 'Confirm the details'}</Text>
          <View style={{ width: 52 }} />
        </View>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
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
              ) : editing ? (
                <Text style={styles.introBody}>Change anything here. The inscription stays as it was written.</Text>
              ) : (
                <Text style={styles.introBody}>Enter the details yourself — no cover photo this time.</Text>
              )}
            </View>
          </View>

          {!editing ? (
            <View style={styles.seg}>
              <SegOption label="Finished" active={status === 'finished'} onPress={() => setStatus('finished')} />
              <SegOption label="Still reading" active={status === 'reading'} onPress={() => setStatus('reading')} />
            </View>
          ) : null}

          <View style={styles.fields}>
            <Field label="Title" value={title} onChangeText={setTitle} />
            <Field label="Author" value={author} onChangeText={setAuthor} />
            <Field label="Genre" value={genre} onChangeText={setGenre} />
            <Field label="Pages" value={pages} onChangeText={setPages} keyboardType="number-pad" />

            {status === 'reading' ? (
              <Field label="Pages read so far" value={pagesRead} onChangeText={setPagesRead} keyboardType="number-pad" />
            ) : (
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Finished on</Text>
                <View style={styles.inputStatic}>
                  <Text style={styles.inputStaticText}>
                    {formatDate(editing?.finishedAt ?? new Date().toISOString())}
                  </Text>
                </View>
              </View>
            )}

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
          <TouchableOpacity
            style={styles.discardBtn}
            accessibilityRole="button"
            onPress={() => navigation.goBack()}
            disabled={saving}
          >
            <Text style={styles.discardLabel}>{editing ? 'Cancel' : 'Discard'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.enshrineBtn, saving && styles.btnDisabled]}
            accessibilityRole="button"
            onPress={primary.onPress}
            disabled={saving}
          >
            <Text style={styles.enshrineLabel}>{primary.label}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function SegOption({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[styles.segOpt, active && styles.segOptActive]}
      accessibilityRole="radio"
      accessibilityState={{ selected: active }}
      onPress={onPress}
    >
      <Text style={[styles.segLabel, active && styles.segLabelActive]}>{label}</Text>
    </TouchableOpacity>
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
    width: 52,
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
  seg: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: color.divider,
    borderRadius: radius.md,
    overflow: 'hidden',
    marginBottom: 16,
  },
  segOpt: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  segOptActive: {
    borderWidth: 1,
    borderColor: color.accent,
    borderRadius: radius.md,
    margin: -1,
  },
  segLabel: {
    fontFamily: font.body,
    fontSize: 13,
    color: color.text,
  },
  segLabelActive: {
    color: color.accent,
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
  btnDisabled: {
    opacity: 0.6,
  },
  enshrineLabel: {
    fontFamily: font.heading,
    fontSize: 14,
    color: '#fff',
  },
});
