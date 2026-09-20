import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomBar from '../components/BottomBar';
import CoverPlate from '../components/CoverPlate';
import { SearchIcon, YearIcon } from '../components/icons';
import { RootStackParamList } from '../navigation/types';
import { useBooks } from '../store/BooksContext';
import { color, font, radius, space } from '../theme/tokens';
import { Book, ReadingBook } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function ShelfScreen() {
  const { books, reading } = useBooks();

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <Header />
      {books.length === 0 ? (
        <EmptyShelf />
      ) : (
        <>
          <StatsRow books={books} />
          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
            {reading.length > 0 ? <ReadingNow reading={reading} /> : null}
            <EnshrinedGrid books={books} />
          </ScrollView>
        </>
      )}
      <BottomBar active="shelf" />
    </SafeAreaView>
  );
}

function Header() {
  const navigation = useNavigation<Nav>();
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.kicker}>Est. 2026</Text>
        <Text style={styles.h2}>The Shelf</Text>
      </View>
      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.iconBtn} accessibilityLabel="Search" accessibilityRole="button">
          <SearchIcon color={color.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconBtn}
          accessibilityLabel="Reading year"
          accessibilityRole="button"
          onPress={() => navigation.navigate('Year')}
        >
          <YearIcon color={color.text} />
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

function ReadingNow({ reading }: { reading: ReadingBook[] }) {
  return (
    <View>
      <View style={styles.sectionHeadRow}>
        <Text style={styles.sectionLabel}>Reading now</Text>
        <Text style={styles.sectionAside}>{reading.length} books</Text>
      </View>
      <View style={styles.readingRow}>
        {reading.map((b) => {
          const pct = Math.round((b.pagesRead / b.pages) * 100);
          return (
            <View key={b.id} style={styles.readingCard}>
              <CoverPlate style={styles.readingPlate} />
              <View style={styles.readingInfo}>
                <Text style={styles.readingTitle} numberOfLines={1}>
                  {b.title}
                </Text>
                <Text style={styles.readingProgress}>
                  {b.pagesRead} / {b.pages} pp
                </Text>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${pct}%` }]} />
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function EnshrinedGrid({ books }: { books: Book[] }) {
  const navigation = useNavigation<Nav>();
  const monthLabel = books.length > 0 ? monthYear(books[0].finishedAt) : '';
  return (
    <View>
      <View style={[styles.sectionHeadRow, styles.enshrinedHeadRow]}>
        <Text style={styles.sectionLabel}>Enshrined · {monthLabel}</Text>
        <Text style={styles.sectionAside}>Sort</Text>
      </View>
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
    marginBottom: 20,
  },
  readingCard: {
    flex: 1,
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
