import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CoverPlate from '../components/CoverPlate';
import { persistCover } from '../lib/coverStore';
import { writeInscription } from '../lib/inscribe';
import { RootStackParamList } from '../navigation/types';
import { useBooks } from '../store/BooksContext';
import { color, font, gutter, radius, shadow, space, type } from '../theme/tokens';
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

  const leave = (how: 'retake' | 'discard') => {
    if (editing) navigation.goBack();
    else if (how === 'retake') navigation.replace('Capture');
    else navigation.popToTop();
  };

  const handleSaveEdit = () => {
    if (!editing) return;
    updateBook(editing.id, {
      ...trimmed(),
      pagesRead: editing.status === 'reading' ? readCount : pageCount,
    });
    navigation.goBack();
  };

  const handleStartReading = async () => {
    setSaving(true);
    const now = new Date().toISOString();
    const coverUri = await persistCover(photoUri);
    const book: Book = {
      id: `${Date.now()}`,
      ...trimmed(),
      pagesRead: readCount,
      inscription: '',
      coverUri,
      status: 'reading',
      startedAt: now,
      finishedAt: null,
      volume: null,
      createdAt: now,
      updatedAt: now,
    };
    addBook(book);
    navigation.popToTop();
  };

  const handleEnshrine = async () => {
    setSaving(true);
    const fields = trimmed();
    const now = new Date().toISOString();
    const [{ text }, coverUri] = await Promise.all([
      writeInscription({
        title: fields.title,
        author: fields.author,
        genre: fields.genre,
        days: null,
      }),
      persistCover(photoUri),
    ]);
    const book: Book = {
      id: `${Date.now()}`,
      ...fields,
      pagesRead: pageCount,
      inscription: text,
      coverUri,
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
          <TouchableOpacity
            style={styles.headerSide}
            accessibilityRole="button"
            onPress={() => leave('retake')}
            disabled={saving}
          >
            <Text style={styles.retake}>{editing ? 'Cancel' : 'Retake'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{editing ? 'Edit details' : 'Confirm details'}</Text>
          <View style={styles.headerSide} />
        </View>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.introRow}>
            <CoverPlate
              style={styles.plate}
              elevation="sm"
              imageUri={photoUri ?? undefined}
              label={photoUri ? undefined : 'No photo'}
            />
            <View style={styles.introCopy}>
              {isFromCover ? (
                <>
                  <View style={styles.tag}>
                    <Text style={styles.tagLabel}>Read from the cover</Text>
                  </View>
                  <Text style={styles.introBody}>Check each field. Decorative cover type is easy to misread.</Text>
                </>
              ) : editing ? (
                <Text style={styles.introBody}>Change anything here. The inscription stays as it was written.</Text>
              ) : (
                <Text style={styles.introBody}>Enter the details yourself — no cover photo this time.</Text>
              )}
            </View>
          </View>

          {!editing ? (
            <View style={styles.seg} accessibilityRole="radiogroup">
              <SegOption label="Finished" active={status === 'finished'} onPress={() => setStatus('finished')} />
              <SegOption label="Still reading" active={status === 'reading'} onPress={() => setStatus('reading')} />
            </View>
          ) : null}

          <View style={styles.fields}>
            <Field label="Title" value={title} onChangeText={setTitle} />
            <Field label="Author" value={author} onChangeText={setAuthor} />
            <View style={styles.fieldPair}>
              <Field label="Genre" value={genre} onChangeText={setGenre} style={styles.fieldHalf} />
              <Field label="Pages" value={pages} onChangeText={setPages} keyboardType="number-pad" style={styles.fieldHalf} />
            </View>

            {status === 'reading' ? (
              <Field label="Pages read so far" value={pagesRead} onChangeText={setPagesRead} keyboardType="number-pad" />
            ) : (
              <View style={styles.staticRow}>
                <Text style={styles.staticLabel}>Finished on</Text>
                <Text style={styles.staticValue}>{formatDate(editing?.finishedAt ?? new Date().toISOString())}</Text>
              </View>
            )}

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Note to your future self (optional)</Text>
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                value={note}
                onChangeText={setNote}
                placeholder="Read on the train, mostly."
                placeholderTextColor={color.placeholder}
                accessibilityLabel="Note to your future self"
                multiline
              />
            </View>
          </View>
        </ScrollView>
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.discardBtn}
            accessibilityRole="button"
            onPress={() => leave('discard')}
            disabled={saving}
          >
            <Text style={styles.discardLabel}>{editing ? 'Cancel' : 'Discard'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.primaryBtn, saving && styles.btnDisabled]}
            accessibilityRole="button"
            onPress={primary.onPress}
            disabled={saving}
          >
            <Text style={styles.primaryLabel}>{primary.label}</Text>
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
  style,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  keyboardType?: 'default' | 'number-pad';
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.field, style]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        accessibilityLabel={label}
        placeholderTextColor={color.placeholder}
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
    paddingHorizontal: space[4],
    paddingTop: space[1],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerSide: {
    width: 76,
    minHeight: 44,
    justifyContent: 'center',
    paddingLeft: space[2],
  },
  retake: {
    fontFamily: font.sansMedium,
    fontSize: 16,
    color: color.text,
  },
  headerTitle: {
    ...type.headerTitle,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: gutter,
    paddingTop: space[4],
    paddingBottom: space[6],
    gap: 18,
  },
  introRow: {
    flexDirection: 'row',
    gap: space[4],
    alignItems: 'flex-start',
  },
  plate: {
    width: 76,
    aspectRatio: 2 / 3,
  },
  introCopy: {
    flex: 1,
    gap: space[2],
    paddingTop: 2,
  },
  tag: {
    alignSelf: 'flex-start',
    backgroundColor: color.accentTint,
    borderRadius: radius.pill,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  tagLabel: {
    ...type.label,
    color: color.accentText,
  },
  introBody: {
    ...type.secondary,
    lineHeight: 21,
  },
  seg: {
    flexDirection: 'row',
    gap: 4,
    padding: 4,
    borderRadius: radius.lg,
    backgroundColor: color.surface,
  },
  segOpt: {
    flex: 1,
    height: 40,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segOptActive: {
    backgroundColor: color.card,
    ...shadow.sm,
  },
  segLabel: {
    fontFamily: font.sansMedium,
    fontSize: 15,
    color: color.textSecondary,
  },
  segLabelActive: {
    fontFamily: font.sansSemiBold,
    color: color.text,
  },
  fields: {
    gap: 14,
  },
  fieldPair: {
    flexDirection: 'row',
    gap: space[3],
  },
  fieldHalf: {
    flex: 1,
  },
  field: {
    gap: 6,
  },
  fieldLabel: {
    ...type.label,
  },
  input: {
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 12,
    ...type.body,
    lineHeight: 22,
    backgroundColor: color.surface,
    borderRadius: radius.md,
  },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  staticRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: space[1],
  },
  staticLabel: {
    ...type.body,
    fontSize: 15,
    color: color.textSecondary,
  },
  staticValue: {
    ...type.body,
    fontSize: 15,
    fontVariant: ['tabular-nums', 'lining-nums'],
  },
  footer: {
    paddingHorizontal: gutter,
    paddingTop: space[3],
    paddingBottom: space[3],
    flexDirection: 'row',
    gap: 10,
  },
  discardBtn: {
    flex: 1,
    height: 52,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  discardLabel: {
    fontFamily: font.sansMedium,
    fontSize: 16,
    color: color.textSecondary,
  },
  primaryBtn: {
    flex: 2,
    height: 52,
    backgroundColor: color.ink,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: {
    opacity: 0.6,
  },
  primaryLabel: {
    ...type.button,
    color: color.onInk,
  },
});
