import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomBar from '../components/BottomBar';
import CoverPlate from '../components/CoverPlate';
import { GearIcon, SearchIcon, YearIcon } from '../components/icons';
import ProgressSheet from '../components/ProgressSheet';
import { writeInscription } from '../lib/inscribe';
import { daysBetween } from '../lib/inscriptions';
import { RootStackParamList } from '../navigation/types';
import { useBooks } from '../store/BooksContext';
import { color, font, radius, space } from '../theme/tokens';
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
          placeholderTextColor={color.textMuted55}
          autoFocus
          autoCorrect={false}
          returnKeyType="search"
        />
      ) : null}
      {isEmpty ? (
        <EmptyShelf />
      ) : (
        <>
          {finished.length > 0 ? <StatsRow books={finished} /> : null}
          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            {reading.length > 0 ? <ReadingNow reading={reading} onPress={setProgressBook} /> : null}
            <EnshrinedGrid
              books={visible}
              total={finished.length}
              sortLabel={SORT_LABEL[sort]}
              onCycleSort={() => setSort((s) => SORT_ORDER[(SORT_ORDER.indexOf(s) + 1) % SORT_ORDER.length])}
              filtered={query.trim().length > 0}
            />
          </ScrollView>
        </>
      )}
      <BottomBar active="shelf" />
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

function Header({ searchOpen, onToggleSearch }: { searchOpen: boolean; onToggleSearch: () => void }) {
  const navigation = useNavigation<Nav>();
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.kicker}>Est. 2026</Text>
        <Text style={styles.h2}>The Shelf</Text>
      </View>
      <View style={styles.headerActions}>
        <TouchableOpacity
          style={[styles.iconBtn, searchOpen && styles.iconBtnActive]}
          accessibilityLabel="Search"
          accessibilityRole="button"
          accessibilityState={{ selected: searchOpen }}
          onPress={onToggleSearch}
        >
          <SearchIcon color={searchOpen ? color.accent : color.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconBtn}
          accessibilityLabel="Reading year"
          accessibilityRole="button"
          onPress={() => navigation.navigate('Year')}
        >
          <YearIcon color={color.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconBtn}
          accessibilityLabel="Settings"
          accessibilityRole="button"
          onPress={() => navigation.navigate('Settings')}
        >
          <GearIcon color={color.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function EmptyShelf() {
  const navigation = useNavigation<Nav>();
  return (
    <View style={styles.emptyWrap}>
      <View style={styles.emptySpines}>
        <View style={[styles.emptySpine, { height: 120 }]} />
        <View style={[styles.emptySpine, { height: 138, width: 22 }]} />
        <View style={[styles.emptySpine, { height: 106, width: 30 }]} />
      </View>
      <View style={styles.emptyShelfLine} />
      <View style={styles.emptyCopy}>
        <Text style={styles.kicker}>Nothing here yet</Text>
        <Text style={styles.emptyTitle}>A shelf is built{'\n'}one finished book{'\n'}at a time.</Text>
        <Text style={styles.emptyBody}>
          Photograph the cover of something you've finished — this year, last year, in school. It gets a plate, a
          date and an inscription written for that book alone.
        </Text>
      </View>
      <TouchableOpacity
        style={styles.emptyPrimaryBtn}
        accessibilityRole="button"
        onPress={() => navigation.navigate('Capture')}
      >
        <Text style={styles.emptyPrimaryLabel}>Enshrine your first book</Text>
      </TouchableOpacity>
    </View>
  );
}

function StatsRow({ books }: { books: Book[] }) {
  const totalPages = books.reduce((sum, b) => sum + b.pages, 0);
  const now = new Date();
  const thisMonth = books.filter((b) => {
    if (!b.finishedAt) return false;
    const d = new Date(b.finishedAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  return (
    <View style={styles.statsRow}>
      <StatCell value={String(books.length)} label="Volumes" divider />
      <StatCell value={totalPages.toLocaleString()} label="Pages" divider />
      <StatCell value={String(thisMonth)} label="This month" />
    </View>
  );
}

function StatCell({ value, label, divider }: { value: string; label: string; divider?: boolean }) {
  return (
    <View style={[styles.statCell, divider && styles.statCellDivider]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ReadingNow({ reading, onPress }: { reading: Book[]; onPress: (b: Book) => void }) {
  return (
    <View>
      <View style={styles.sectionHeadRow}>
        <Text style={styles.sectionLabel}>Reading now</Text>
        <Text style={styles.sectionAside}>
          {reading.length} {reading.length === 1 ? 'book' : 'books'}
        </Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.readingRow}>
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
              <CoverPlate style={styles.readingPlate} imageUri={b.coverUri ?? undefined} />
              <View style={styles.readingInfo}>
                <Text style={styles.readingTitle} numberOfLines={1}>
                  {b.title}
                </Text>
                <Text style={styles.readingProgress}>
                  {b.pagesRead} / {b.pages || '?'} pp
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

function EnshrinedGrid({
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
  const heading = filtered
    ? `${books.length} of ${total} found`
    : books[0]?.finishedAt
      ? `Enshrined · ${monthYear(books[0].finishedAt)}`
      : 'Enshrined';
  return (
    <View>
      <View style={[styles.sectionHeadRow, styles.enshrinedHeadRow]}>
        <Text style={styles.sectionLabel}>{heading}</Text>
        {total > 0 ? (
          <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Sort by ${sortLabel}`} onPress={onCycleSort}>
            <Text style={styles.sectionAside}>Sort · {sortLabel}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      {total === 0 ? (
        <Text style={styles.gridEmpty}>Nothing enshrined yet — finish a book to give it a plate.</Text>
      ) : books.length === 0 ? (
        <Text style={styles.gridEmpty}>No matches.</Text>
      ) : (
        <View style={styles.grid}>
          {books.map((b) => (
            <TouchableOpacity
              key={b.id}
              style={styles.gridCell}
              accessibilityRole="button"
              onPress={() => navigation.navigate('Detail', { bookId: b.id })}
            >
              <CoverPlate style={styles.shelfPlate} elevation="sm" label={b.coverUri ? undefined : 'cover photo'} imageUri={b.coverUri ?? undefined} />
              <View style={styles.plateRule} />
              <Text style={styles.bookTitle}>{b.title}</Text>
              <Text style={styles.bookAuthor}>{b.author}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

function monthYear(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: color.bg,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: color.divider,
  },
  kicker: {
    fontFamily: font.body,
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: color.accent,
    marginBottom: 4,
  },
  h2: {
    fontFamily: font.heading,
    fontSize: 30,
    letterSpacing: -0.6,
    color: color.text,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 6,
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
  iconBtnActive: {
    borderColor: color.accent,
  },
  searchInput: {
    marginHorizontal: 20,
    marginTop: 10,
    minHeight: 38,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontFamily: font.body,
    fontSize: 14,
    color: color.text,
    borderWidth: 1,
    borderColor: color.accent,
    borderRadius: radius.md,
  },
  gridEmpty: {
    fontFamily: font.body,
    fontStyle: 'italic',
    fontSize: 13,
    color: color.textMuted60,
    paddingVertical: 12,
    paddingBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: color.divider,
  },
  statCell: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  statCellDivider: {
    borderRightWidth: 1,
    borderRightColor: color.divider,
  },
  statValue: {
    fontFamily: font.heading,
    fontSize: 22,
    lineHeight: 22,
    color: color.text,
    fontVariant: ['tabular-nums', 'lining-nums'],
  },
  statLabel: {
    fontFamily: font.body,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: color.textMuted55,
    marginTop: 3,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  sectionHeadRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  enshrinedHeadRow: {
    borderTopWidth: 1,
    borderTopColor: color.divider,
    paddingTop: 14,
  },
  sectionLabel: {
    fontFamily: font.body,
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: color.textMuted55,
  },
  sectionAside: {
    fontFamily: font.body,
    fontSize: 11,
    color: color.accent700,
  },
  readingRow: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 20,
  },
  readingCard: {
    width: 176,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: color.divider,
    borderRadius: radius.md,
    padding: 8,
  },
  readingPlate: {
    width: 36,
    height: 54,
  },
  readingInfo: {
    flex: 1,
    minWidth: 0,
  },
  readingTitle: {
    fontFamily: font.heading,
    fontSize: 13,
    lineHeight: 16,
    color: color.text,
  },
  readingProgress: {
    fontFamily: font.body,
    fontSize: 10,
    color: color.textMuted55,
    marginTop: 2,
    fontVariant: ['tabular-nums', 'lining-nums'],
  },
  progressTrack: {
    height: 2,
    backgroundColor: color.neutral200,
    marginTop: 6,
  },
  progressFill: {
    height: 2,
    backgroundColor: color.accent,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    paddingBottom: 20,
  },
  gridCell: {
    width: '46%',
  },
  shelfPlate: {
    aspectRatio: 2 / 3,
  },
  plateRule: {
    height: 1,
    backgroundColor: color.accent,
    opacity: 0.5,
    marginTop: 8,
    marginBottom: 6,
  },
  bookTitle: {
    fontFamily: font.heading,
    fontSize: 14,
    lineHeight: 16,
    color: color.text,
  },
  bookAuthor: {
    fontFamily: font.body,
    fontStyle: 'italic',
    fontSize: 11,
    color: color.textMuted60,
    marginTop: 2,
  },
  emptyWrap: {
    flex: 1,
    paddingHorizontal: space[6],
    paddingTop: space[8],
    paddingBottom: space[8],
    justifyContent: 'space-between',
  },
  emptySpines: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 5,
    height: 150,
    opacity: 0.55,
  },
  emptySpine: {
    width: 26,
    borderWidth: 1,
    borderColor: color.neutral400,
    borderRadius: 3,
  },
  emptyShelfLine: {
    height: 3,
    backgroundColor: color.neutral300,
    marginTop: -30,
  },
  emptyCopy: {
    marginTop: space[6],
  },
  emptyTitle: {
    fontFamily: font.heading,
    fontWeight: '400',
    fontSize: 32,
    lineHeight: 36,
    color: color.text,
    marginBottom: 10,
  },
  emptyBody: {
    fontFamily: font.body,
    fontSize: 13,
    lineHeight: 22,
    color: color.textMuted65,
  },
  emptyPrimaryBtn: {
    backgroundColor: color.accent,
    borderRadius: radius.md,
    paddingVertical: 13,
    alignItems: 'center',
  },
  emptyPrimaryLabel: {
    fontFamily: font.heading,
    fontSize: 14,
    color: '#fff',
  },
});
