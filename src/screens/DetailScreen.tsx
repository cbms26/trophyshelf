import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ActionMenu from '../components/ActionMenu';
import CoverPlate from '../components/CoverPlate';
import { daysBetween } from '../lib/inscriptions';
import { sharePlate } from '../lib/sharePlate';
import { RootStackParamList } from '../navigation/types';
import { useBooks } from '../store/BooksContext';
import { color, font, radius } from '../theme/tokens';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Detail'>;
type Route = RouteProp<RootStackParamList, 'Detail'>;

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

export default function DetailScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const { books, deleteBook } = useBooks();
  const book = books.find((b) => b.id === params.bookId);
  const plateRef = useRef<View>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!book) return null;

  const days = daysBetween(book.startedAt, book.finishedAt);

  const detailRows = [
    book.finishedAt ? { k: 'Enshrined', v: fmt(book.finishedAt) } : null,
    book.startedAt ? { k: 'Started', v: fmt(book.startedAt) } : null,
    days !== null ? { k: 'Time to finish', v: `${days} day${days === 1 ? '' : 's'}` } : null,
    book.volume !== null ? { k: 'Volume', v: `No. ${book.volume}` } : null,
  ].filter((r): r is { k: string; v: string } => r !== null);

  const remove = () => {
    deleteBook(book.id);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconBtn}
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.iconGlyph}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.iconBtn}
            accessibilityRole="button"
            accessibilityLabel="Share"
            onPress={() => sharePlate(book, plateRef)}
          >
            <Text style={styles.iconGlyph}>↑</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            accessibilityRole="button"
            accessibilityLabel="More"
            onPress={() => setMenuOpen(true)}
          >
            <Text style={styles.iconGlyph}>⋯</Text>
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View ref={plateRef} collapsable={false} style={styles.plateCard}>
          <CoverPlate style={styles.plate} elevation="md" imageUri={book.coverUri ?? undefined} label={book.coverUri ? undefined : 'cover photo'} />
          <View style={styles.titleBlock}>
            <Text style={styles.title}>{book.title}</Text>
            <Text style={styles.author}>{book.author}</Text>
          </View>
          <View style={styles.tags}>
            <Tag label={book.genre} accent />
            {book.pages > 0 ? <Tag label={`${book.pages} pages`} /> : null}
            {days !== null ? <Tag label={`${days} day${days === 1 ? '' : 's'}`} /> : null}
          </View>
          <View style={styles.inscriptionBox}>
            <Text style={styles.inscriptionKicker}>The inscription</Text>
            <Text style={styles.inscriptionText}>{book.inscription}</Text>
          </View>
        </View>
        <View style={styles.detailRows}>
          {detailRows.map((r) => (
            <View key={r.k} style={styles.detailRow}>
              <Text style={styles.detailKey}>{r.k}</Text>
              <Text style={styles.detailValue}>{r.v}</Text>
            </View>
          ))}
        </View>
        {book.note ? (
          <View style={styles.noteBlock}>
            <Text style={styles.sectionLabel}>Your note</Text>
            <Text style={styles.noteText}>{book.note}</Text>
          </View>
        ) : null}
      </ScrollView>
      <ActionMenu
        visible={menuOpen}
        title={book.title}
        onClose={() => setMenuOpen(false)}
        items={[
          { label: 'Edit details', onPress: () => navigation.navigate('Confirm', { mode: 'edit', bookId: book.id }) },
          { label: 'Remove from shelf', onPress: () => setConfirmOpen(true), destructive: true },
        ]}
      />
      <ActionMenu
        visible={confirmOpen}
        title={`Remove ${book.title}? This can't be undone.`}
        onClose={() => setConfirmOpen(false)}
        items={[{ label: 'Remove from shelf', onPress: remove, destructive: true }]}
      />
    </SafeAreaView>
  );
}

function Tag({ label, accent }: { label: string; accent?: boolean }) {
  return (
    <View style={[styles.tag, accent ? styles.tagAccent : styles.tagNeutral]}>
      <Text style={[styles.tagLabel, accent ? styles.tagLabelAccent : styles.tagLabelNeutral]}>{label}</Text>
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
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: color.divider,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGlyph: {
    fontSize: 18,
    color: color.text,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 6,
  },
  plateCard: {
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: color.bg,
    paddingTop: 4,
  },
  scrollContent: {
    paddingHorizontal: 24,
    alignItems: 'center',
    paddingBottom: 40,
  },
  plate: {
    width: 172,
    aspectRatio: 2 / 3,
  },
  titleBlock: {
    marginTop: 16,
    alignItems: 'center',
  },
  title: {
    fontFamily: font.heading,
    fontSize: 27,
    lineHeight: 30,
    color: color.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  author: {
    fontFamily: font.body,
    fontStyle: 'italic',
    fontSize: 13,
    color: color.textMuted62,
  },
  tags: {
    flexDirection: 'row',
    gap: 7,
    marginTop: 12,
    marginBottom: 18,
  },
  tag: {
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 3,
  },
  tagAccent: {
    backgroundColor: color.accent100,
  },
  tagNeutral: {
    backgroundColor: color.neutral100,
  },
  tagLabel: {
    fontFamily: font.body,
    fontSize: 11,
  },
  tagLabelAccent: {
    color: color.accent800,
  },
  tagLabelNeutral: {
    color: color.neutral800,
  },
  inscriptionBox: {
    width: '100%',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: color.text,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  inscriptionKicker: {
    fontFamily: font.body,
    fontSize: 9,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    color: color.accent,
    marginBottom: 10,
  },
  inscriptionText: {
    fontFamily: font.body,
    fontStyle: 'italic',
    fontSize: 14,
    lineHeight: 25,
    color: color.text,
    textAlign: 'center',
  },
  detailRows: {
    width: '100%',
    marginTop: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: color.divider,
  },
  detailKey: {
    fontFamily: font.body,
    fontSize: 12,
    color: color.textMuted58,
  },
  detailValue: {
    fontFamily: font.body,
    fontSize: 12,
    color: color.text,
    fontVariant: ['tabular-nums', 'lining-nums'],
  },
  noteBlock: {
    width: '100%',
    marginTop: 16,
  },
  sectionLabel: {
    fontFamily: font.body,
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: color.textMuted55,
    marginBottom: 8,
  },
  noteText: {
    fontFamily: font.body,
    fontStyle: 'italic',
    fontSize: 13,
    lineHeight: 22,
    color: color.textMuted75,
    textAlign: 'justify',
  },
});
