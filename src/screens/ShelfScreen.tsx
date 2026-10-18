import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomBar, { BOTTOM_BAR_CLEARANCE } from '../components/BottomBar';
import ChatBubble from '../components/ChatBubble';
import CoverPlate from '../components/CoverPlate';
import { ChevronDownIcon, GearIcon, SearchIcon } from '../components/icons';
import ProgressSheet from '../components/ProgressSheet';
import { writeInscription } from '../lib/inscribe';
import { daysBetween } from '../lib/inscriptions';
import { RootStackParamList } from '../navigation/types';
import { useBooks } from '../store/BooksContext';
import { color, gutter, radius, shadow, space, type } from '../theme/tokens';
import { Book } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

type SortKey = 'newest' | 'title' | 'pages';
const SORT_LABEL: Record<SortKey, string> = { newest: 'Newest', title: 'Title', pages: 'Pages' };
const SORT_ORDER: SortKey[] = ['newest', 'title', 'pages'];

export default function ShelfScreen() {
  const navigation = useNavigation<Nav>();
  const { finished, reading, updateBook, nextVolume } = useBooks();
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [sort, setSort] = useState<SortKey>('newest');
  const [progressBook, setProgressBook] = useState<Book | null>(null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? finished.filter((b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q))
      : finished;
    const sorted = [...filtered];
    if (sort === 'title') sorted.sort((a, b) => a.title.localeCompare(b.title));
    else if (sort === 'pages') sorted.sort((a, b) => b.pages - a.pages);
    else sorted.sort((a, b) => (b.finishedAt ?? '').localeCompare(a.finishedAt ?? ''));
    return sorted;
  }, [finished, query, sort]);

  const finishReading = async () => {
    if (!progressBook) return;
    const now = new Date().toISOString();
    const { text } = await writeInscription({
      title: progressBook.title,
      author: progressBook.author,
      genre: progressBook.genre,
      days: daysBetween(progressBook.startedAt, now),
    });
    updateBook(progressBook.id, {
      status: 'finished',
      finishedAt: now,
      pagesRead: progressBook.pages,
      inscription: text,
      volume: nextVolume(),
    });
    const id = progressBook.id;
    setProgressBook(null);
    navigation.navigate('Plaque', { bookId: id });
  };

  const isEmpty = finished.length === 0 && reading.length === 0;

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <Header
        summary={isEmpty ? null : shelfSummary(finished, reading)}
        searchOpen={searchOpen}
        onToggleSearch={() => {
          setSearchOpen((v) => !v);
          setQuery('');
        }}
      />
      {searchOpen ? (
        <TextInput
          style={styles.searchInput}
          value={query}
          onChangeText={setQuery}
          placeholder="Search by title or author"
          placeholderTextColor={color.placeholder}
          autoFocus
          autoCorrect={false}
          returnKeyType="search"
        />
      ) : null}
      {isEmpty ? (
        <EmptyShelf />
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {reading.length > 0 ? <ReadingNow reading={reading} onPress={setProgressBook} /> : null}
          <FinishedGrid
            books={visible}
            total={finished.length}
            sortLabel={SORT_LABEL[sort]}
            onCycleSort={() => setSort((s) => SORT_ORDER[(SORT_ORDER.indexOf(s) + 1) % SORT_ORDER.length])}
            filtered={query.trim().length > 0}
          />
        </ScrollView>
      )}
      <BottomBar active="shelf" />
      <ChatBubble bottom={BOTTOM_BAR_CLEARANCE} />
      <ProgressSheet
        book={progressBook}
        onClose={() => setProgressBook(null)}
        onUpdate={(pagesRead) => {
          if (progressBook) updateBook(progressBook.id, { pagesRead });
          setProgressBook(null);
        }}
        onFinish={finishReading}
      />
    </SafeAreaView>
  );
}

// One quiet line under the title in place of a stats bar, e.g.
// "6 books · 2,927 pages · 2 this month".
function shelfSummary(finished: Book[], reading: Book[]) {
  if (finished.length === 0) return `${reading.length} reading`;
  const pages = finished.reduce((sum, b) => sum + b.pages, 0);
  const now = new Date();
  const thisMonth = finished.filter((b) => {
    if (!b.finishedAt) return false;
    const d = new Date(b.finishedAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const parts = [`${finished.length} ${finished.length === 1 ? 'book' : 'books'}`, `${pages.toLocaleString()} pages`];
  if (thisMonth > 0) parts.push(`${thisMonth} this month`);
  return parts.join(' · ');
}

function Header({
  summary,
  searchOpen,
  onToggleSearch,
}: {
  summary: string | null;
  searchOpen: boolean;
  onToggleSearch: () => void;
}) {
  const navigation = useNavigation<Nav>();
  return (
    <View style={styles.header}>
      <View style={styles.headerRow}>
        <Text style={styles.h1}>Shelf</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.iconBtn, searchOpen && styles.iconBtnActive]}
            accessibilityLabel="Search"
            accessibilityRole="button"
            accessibilityState={{ selected: searchOpen }}
            onPress={onToggleSearch}
          >
            <SearchIcon size={22} color={color.text} strokeWidth={1.7} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            accessibilityLabel="Settings"
            accessibilityRole="button"
            onPress={() => navigation.navigate('Settings')}
          >
            <GearIcon size={22} color={color.text} strokeWidth={1.7} />
          </TouchableOpacity>
        </View>
      </View>
      {summary ? <Text style={styles.summary}>{summary}</Text> : null}
    </View>
  );
}

function EmptyShelf() {
  const navigation = useNavigation<Nav>();
  return (
    <View style={styles.emptyWrap}>
      <View>
        <View style={styles.emptySpines}>
          <View style={[styles.emptySpine, { height: 96 }]} />
          <View style={[styles.emptySpine, { height: 112, width: 20 }]} />
          <View style={[styles.emptySpine, { height: 84, width: 28 }]} />
        </View>
        <View style={styles.emptyShelfLine} />
      </View>
      <View style={styles.emptyCopy}>
        <Text style={styles.emptyTitle}>A shelf is built one finished book at a time.</Text>
        <Text style={styles.emptyBody}>
          Photograph the cover of something you've finished — this year, last year, in school. It gets a plate, a
          date and an inscription written for that book alone.
        </Text>
      </View>
      <TouchableOpacity
        style={styles.primaryBtn}
        accessibilityRole="button"
        onPress={() => navigation.navigate('Capture')}
      >
        <Text style={styles.primaryLabel}>Enshrine your first book</Text>
      </TouchableOpacity>
    </View>
  );
}

function ReadingNow({ reading, onPress }: { reading: Book[]; onPress: (b: Book) => void }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeadRow}>
        <Text style={styles.sectionTitle}>Reading now</Text>
        <Text style={styles.sectionAside}>
          {reading.length} {reading.length === 1 ? 'book' : 'books'}
        </Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.readingScroller}
        contentContainerStyle={styles.readingRow}
      >
        {reading.map((b) => {
          const pct = b.pages > 0 ? Math.min(100, Math.round((b.pagesRead / b.pages) * 100)) : 0;
          return (
            <TouchableOpacity
              key={b.id}
              style={styles.readingCard}
              accessibilityRole="button"
              accessibilityLabel={`Update progress for ${b.title}`}
              onPress={() => onPress(b)}
            >
              <CoverPlate style={styles.readingPlate} elevation="sm" imageUri={b.coverUri ?? undefined} />
              <View style={styles.readingInfo}>
                <Text style={styles.readingTitle} numberOfLines={1}>
                  {b.title}
                </Text>
                <Text style={styles.readingProgress}>
                  {b.pagesRead.toLocaleString()} of {b.pages ? b.pages.toLocaleString() : '?'} pages
                </Text>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${pct}%` }]} />
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

function FinishedGrid({
  books,
  total,
  sortLabel,
  onCycleSort,
  filtered,
}: {
  books: Book[];
  total: number;
  sortLabel: string;
  onCycleSort: () => void;
  filtered: boolean;
}) {
  const navigation = useNavigation<Nav>();
  const heading = filtered ? `${books.length} of ${total} found` : 'Finished';
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeadRow}>
        <Text style={styles.sectionTitle}>{heading}</Text>
        {total > 0 ? (
          <TouchableOpacity
            style={styles.sortBtn}
            accessibilityRole="button"
            accessibilityLabel={`Sorted by ${sortLabel}. Change sort`}
            onPress={onCycleSort}
            hitSlop={10}
          >
            <Text style={styles.sectionAside}>{sortLabel}</Text>
            <ChevronDownIcon color={color.textSecondary} />
          </TouchableOpacity>
        ) : null}
      </View>
      {total === 0 ? (
        <Text style={styles.gridEmpty}>Nothing finished yet — finish a book to give it a plate.</Text>
      ) : books.length === 0 ? (
        <Text style={styles.gridEmpty}>No matches.</Text>
      ) : (
        <View style={styles.grid}>
          {books.map((b) => (
            <TouchableOpacity
              key={b.id}
              style={styles.gridCell}
              accessibilityRole="button"
              accessibilityLabel={`${b.title} by ${b.author}`}
              onPress={() => navigation.navigate('Detail', { bookId: b.id })}
            >
              <CoverPlate
                style={styles.shelfPlate}
                elevation="md"
                label={b.coverUri ? undefined : b.title}
                imageUri={b.coverUri ?? undefined}
              />
              <Text style={styles.bookTitle}>{b.title}</Text>
              <Text style={styles.bookAuthor}>{b.author}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: color.bg,
  },
  header: {
    paddingHorizontal: gutter,
    paddingTop: space[3],
    gap: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  h1: {
    ...type.display,
  },
  summary: {
    ...type.secondary,
    fontSize: 15,
    lineHeight: 22,
  },
  headerActions: {
    flexDirection: 'row',
    gap: space[1],
    marginRight: -10,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnActive: {
    backgroundColor: color.surface,
  },
  searchInput: {
    marginHorizontal: gutter,
    marginTop: space[3],
    height: 46,
    paddingHorizontal: 14,
    ...type.body,
    backgroundColor: color.surface,
    borderRadius: radius.md,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: gutter,
    paddingTop: space[6],
    paddingBottom: space[8],
    gap: space[8],
  },
  section: {
    gap: space[3],
  },
  sectionHeadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    ...type.section,
  },
  sectionAside: {
    ...type.secondary,
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  gridEmpty: {
    ...type.secondary,
    fontSize: 15,
    lineHeight: 22,
    paddingVertical: space[2],
  },
  readingScroller: {
    marginHorizontal: -gutter,
  },
  readingRow: {
    flexDirection: 'row',
    gap: space[3],
    paddingHorizontal: gutter,
  },
  readingCard: {
    width: 248,
    flexDirection: 'row',
    gap: space[3],
    alignItems: 'center',
    backgroundColor: color.surface,
    borderRadius: radius.lg,
    padding: 10,
  },
  readingPlate: {
    width: 44,
    height: 66,
  },
  readingInfo: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  readingTitle: {
    ...type.bookTitle,
  },
  readingProgress: {
    ...type.caption,
    fontVariant: ['tabular-nums', 'lining-nums'],
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: color.track,
    marginTop: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: color.accent,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 28,
    paddingTop: space[1],
  },
  // Two columns with ~16px between them; a percentage (not a fixed gap) so
  // the pair always fits on one row at any screen width.
  gridCell: {
    width: '47.5%',
  },
  shelfPlate: {
    aspectRatio: 2 / 3,
    marginBottom: 10,
  },
  bookTitle: {
    ...type.bookTitle,
  },
  bookAuthor: {
    ...type.secondary,
    marginTop: 2,
  },
  // Bottom padding keeps the call to action clear of the floating Librarian button.
  emptyWrap: {
    flex: 1,
    paddingHorizontal: gutter,
    paddingTop: space[10],
    paddingBottom: 88,
    justifyContent: 'space-between',
  },
  emptySpines: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    paddingLeft: 4,
  },
  emptySpine: {
    width: 24,
    borderWidth: 1.5,
    borderColor: color.track,
    borderBottomWidth: 0,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  emptyShelfLine: {
    height: 2,
    borderRadius: 1,
    backgroundColor: color.track,
  },
  emptyCopy: {
    gap: space[3],
  },
  emptyTitle: {
    ...type.display,
    fontSize: 30,
    lineHeight: 36,
  },
  emptyBody: {
    ...type.body,
    color: color.textSecondary,
  },
  primaryBtn: {
    height: 52,
    backgroundColor: color.ink,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.sm,
  },
  primaryLabel: {
    ...type.button,
    color: color.onInk,
  },
});
