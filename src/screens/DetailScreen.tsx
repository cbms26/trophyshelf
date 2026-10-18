import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ActionMenu from '../components/ActionMenu';
import ChatBubble from '../components/ChatBubble';
import CoverPlate from '../components/CoverPlate';
import { BackIcon, MoreIcon, ShareIcon } from '../components/icons';
import { daysBetween } from '../lib/inscriptions';
import { sharePlate } from '../lib/sharePlate';
import { RootStackParamList } from '../navigation/types';
import { useBooks } from '../store/BooksContext';
import { color, gutter, space, type } from '../theme/tokens';

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

  const meta = [
    book.genre,
    book.pages > 0 ? `${book.pages.toLocaleString()} pages` : null,
    days !== null ? `${days} day${days === 1 ? '' : 's'}` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  const detailRows = [
    book.finishedAt ? { k: 'Finished', v: fmt(book.finishedAt) } : null,
    book.startedAt ? { k: 'Started', v: fmt(book.startedAt) } : null,
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
          <BackIcon />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.iconBtn}
            accessibilityRole="button"
            accessibilityLabel="Share"
            onPress={() => sharePlate(book, plateRef)}
          >
            <ShareIcon />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            accessibilityRole="button"
            accessibilityLabel="More"
            onPress={() => setMenuOpen(true)}
          >
            <MoreIcon />
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View ref={plateRef} collapsable={false} style={styles.plateCard}>
          <CoverPlate
            style={styles.plate}
            elevation="lg"
            imageUri={book.coverUri ?? undefined}
            label={book.coverUri ? undefined : book.title}
          />
          <Text style={styles.title}>{book.title}</Text>
          <Text style={styles.author}>{book.author}</Text>
          {meta ? <Text style={styles.meta}>{meta}</Text> : null}
          {book.inscription ? (
            <View style={styles.inscriptionBlock}>
              <View style={styles.inscriptionRule} />
              <Text style={styles.inscriptionText}>{book.inscription}</Text>
            </View>
          ) : null}
        </View>
        {detailRows.length > 0 ? (
          <View style={styles.detailRows}>
            {detailRows.map((r) => (
              <View key={r.k} style={styles.detailRow}>
                <Text style={styles.detailKey}>{r.k}</Text>
                <Text style={styles.detailValue}>{r.v}</Text>
              </View>
            ))}
          </View>
        ) : null}
        {book.note ? (
          <View style={styles.noteBlock}>
            <Text style={styles.noteLabel}>Your note</Text>
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
      <ChatBubble />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: color.bg,
  },
  header: {
    paddingHorizontal: 14,
    paddingTop: space[1],
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  iconBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 2,
  },
  scrollContent: {
    paddingHorizontal: gutter + 4,
    paddingBottom: 96,
  },
  // Captured as the share image, so it carries its own background.
  plateCard: {
    alignItems: 'center',
    backgroundColor: color.bg,
    paddingTop: space[3],
    paddingBottom: space[2],
  },
  plate: {
    width: 156,
    aspectRatio: 2 / 3,
  },
  title: {
    ...type.display,
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.3,
    textAlign: 'center',
    marginTop: space[6],
  },
  author: {
    ...type.body,
    lineHeight: 22,
    color: color.textSecondary,
    marginTop: space[1],
    textAlign: 'center',
  },
  meta: {
    ...type.secondary,
    marginTop: 10,
    textAlign: 'center',
  },
  inscriptionBlock: {
    alignItems: 'center',
    gap: 10,
    marginTop: 28,
  },
  inscriptionRule: {
    width: 28,
    height: 2,
    borderRadius: 1,
    backgroundColor: color.accent,
  },
  inscriptionText: {
    ...type.inscription,
    textAlign: 'center',
    maxWidth: 320,
  },
  detailRows: {
    marginTop: 28,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: color.divider,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 13,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: color.divider,
  },
  detailKey: {
    ...type.body,
    fontSize: 15,
    lineHeight: 22,
    color: color.textSecondary,
  },
  detailValue: {
    ...type.body,
    fontSize: 15,
    lineHeight: 22,
    fontVariant: ['tabular-nums', 'lining-nums'],
  },
  noteBlock: {
    marginTop: space[6],
    gap: 6,
  },
  noteLabel: {
    ...type.section,
    fontSize: 14,
    lineHeight: 20,
  },
  noteText: {
    ...type.body,
    fontSize: 15,
    lineHeight: 23,
    color: color.textSecondary,
  },
});
