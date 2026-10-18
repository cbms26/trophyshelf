import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomBar, { BOTTOM_BAR_CLEARANCE } from '../components/BottomBar';
import ChatBubble from '../components/ChatBubble';
import { shareMessage } from '../lib/sharePlate';
import { computeYearStats } from '../lib/yearStats';
import { useBooks } from '../store/BooksContext';
import { color, font, gutter, radius, space, type } from '../theme/tokens';

const YEAR = new Date().getFullYear();

export default function YearScreen() {
  const { books } = useBooks();
  const stats = computeYearStats(books, YEAR);
  const bestMonthCount = Math.max(0, ...stats.months.map((m) => m.count));

  const share = () => {
    shareMessage(
      `My ${YEAR} reading year on TrophyShelf: ${stats.volumes} volumes, ${stats.pages.toLocaleString()} pages.`
    );
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.h1}>{YEAR}</Text>
        <Text style={styles.subtitle}>Your reading year</Text>
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.bigStats}>
          <View style={styles.bigStat}>
            <Text style={styles.bigStatValue}>{stats.volumes}</Text>
            <Text style={styles.bigStatLabel}>{stats.volumes === 1 ? 'book finished' : 'books finished'}</Text>
          </View>
          <View style={styles.bigStat}>
            <Text style={styles.bigStatValue}>{stats.pages.toLocaleString()}</Text>
            <Text style={styles.bigStatLabel}>pages read</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>By month</Text>
          <View style={styles.monthsRow}>
            {stats.months.map((m, i) => (
              <View key={i} style={styles.monthCol}>
                <View
                  style={[
                    styles.monthBar,
                    m.count > 0
                      ? {
                          height: m.h as any,
                          backgroundColor: m.count === bestMonthCount ? color.accent : color.accentSoft,
                        }
                      : styles.monthBarEmpty,
                  ]}
                />
                <Text style={styles.monthLabel}>{m.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {stats.genres.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Genres</Text>
            <View style={styles.genreList}>
              {stats.genres.map((g) => (
                <View key={g.name} style={styles.genreRow}>
                  <Text style={styles.genreName} numberOfLines={1}>
                    {g.name}
                  </Text>
                  <View style={styles.genreTrack}>
                    <View style={[styles.genreFill, { width: g.pct as any }]} />
                  </View>
                  <Text style={styles.genreCount}>{g.n}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Highlights</Text>
          {stats.notables.length > 0 ? (
            <View>
              {stats.notables.map((n) => (
                <View key={n.k} style={styles.notableRow}>
                  <Text style={styles.notableKey}>{n.k}</Text>
                  <Text style={styles.notableValue}>{n.v}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyNote}>Enshrine a book this year to see it here.</Text>
          )}
          <TouchableOpacity style={styles.shareBtn} accessibilityRole="button" onPress={share}>
            <Text style={styles.shareLabel}>Share your year</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <BottomBar active="year" />
      <ChatBubble bottom={BOTTOM_BAR_CLEARANCE} />
    </SafeAreaView>
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
  h1: {
    ...type.display,
    fontVariant: ['lining-nums'],
  },
  subtitle: {
    ...type.secondary,
    fontSize: 15,
    lineHeight: 22,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: gutter,
    paddingTop: 28,
    paddingBottom: space[8],
    gap: space[8],
  },
  bigStats: {
    flexDirection: 'row',
    gap: space[4],
  },
  bigStat: {
    flex: 1,
    gap: 2,
  },
  bigStatValue: {
    fontFamily: font.serif,
    fontSize: 46,
    lineHeight: 52,
    color: color.text,
    fontVariant: ['tabular-nums', 'lining-nums'],
  },
  bigStatLabel: {
    ...type.secondary,
  },
  section: {
    gap: 14,
  },
  sectionTitle: {
    ...type.section,
  },
  monthsRow: {
    flexDirection: 'row',
    gap: 6,
    height: 132,
  },
  monthCol: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 6,
  },
  monthBar: {
    width: '100%',
    borderRadius: 3,
  },
  monthBarEmpty: {
    height: 4,
    backgroundColor: color.divider,
  },
  monthLabel: {
    ...type.caption,
    fontSize: 12,
    lineHeight: 16,
  },
  genreList: {
    gap: space[3],
  },
  genreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
  },
  genreName: {
    ...type.body,
    fontSize: 15,
    lineHeight: 20,
    width: 96,
  },
  genreTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: color.surface,
    overflow: 'hidden',
  },
  genreFill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: color.accent,
  },
  genreCount: {
    ...type.secondary,
    width: 24,
    textAlign: 'right',
    fontVariant: ['tabular-nums', 'lining-nums'],
  },
  notableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: space[3],
    paddingVertical: space[3],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: color.divider,
  },
  notableKey: {
    ...type.body,
    fontSize: 15,
    lineHeight: 22,
    color: color.textSecondary,
  },
  notableValue: {
    ...type.body,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'right',
    flexShrink: 1,
  },
  emptyNote: {
    ...type.secondary,
    fontSize: 15,
    lineHeight: 22,
  },
  shareBtn: {
    height: 52,
    backgroundColor: color.ink,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: space[3],
  },
  shareLabel: {
    ...type.button,
    color: color.onInk,
  },
});
