import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MedalIcon } from '../components/icons';
import { ordinalWords } from '../lib/inscriptions';
import { RootStackParamList } from '../navigation/types';
import { useBooks } from '../store/BooksContext';
import { color, font } from '../theme/tokens';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Plaque'>;
type Route = RouteProp<RootStackParamList, 'Plaque'>;

export default function PlaqueScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const { books } = useBooks();
  const book = books.find((b) => b.id === params.bookId);

  if (!book) return null;

  const share = () => {
    Share.share({
      message: `${book.title} — ${book.author}\n\n"${book.inscription}"\n\nEnshrined on TrophyShelf.`,
    }).catch(() => {});
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.seal}>
        <View style={styles.sealInner} />
        <MedalIcon size={40} color={color.accent500} strokeWidth={1.2} />
      </View>
      <View style={styles.titleBlock}>
        <Text style={styles.kicker}>Volume the {ordinalWords(book.volume)}</Text>
        <Text style={styles.title}>{book.title}</Text>
        <Text style={styles.meta}>
          {book.author} · {book.pages} pages
        </Text>
      </View>
      <Text style={styles.inscription}>"{book.inscription}"</Text>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.primaryBtn}
          accessibilityRole="button"
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.primaryLabel}>Place it on the shelf</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.ghostBtn} accessibilityRole="button" onPress={share}>
          <Text style={styles.ghostLabel}>Share this plate</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: color.neutral900,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 40,
    gap: 28,
  },
  seal: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 1,
    borderColor: color.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sealInner: {
    position: 'absolute',
    top: 9,
    left: 9,
    right: 9,
    bottom: 9,
    borderRadius: 46,
    borderWidth: 1,
    borderColor: color.accent400,
    opacity: 0.45,
  },
  titleBlock: {
    alignItems: 'center',
  },
  kicker: {
    fontFamily: font.body,
    fontSize: 10,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    color: color.accent,
    marginBottom: 10,
  },
  title: {
    fontFamily: font.heading,
    fontWeight: '400',
    fontSize: 34,
    color: color.neutral100,
    lineHeight: 38,
    marginBottom: 8,
    textAlign: 'center',
  },
  meta: {
    fontFamily: font.body,
    fontStyle: 'italic',
    fontSize: 13,
    color: color.neutral400,
  },
  inscription: {
    fontFamily: font.body,
    fontStyle: 'italic',
    fontSize: 13,
    lineHeight: 23,
    color: color.neutral300,
    textAlign: 'center',
    maxWidth: 262,
  },
  actions: {
    gap: 9,
    width: 236,
  },
  primaryBtn: {
    borderWidth: 1,
    borderColor: color.accent400,
    borderRadius: 4,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryLabel: {
    fontFamily: font.heading,
    fontSize: 14,
    color: color.accent300,
  },
  ghostBtn: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  ghostLabel: {
    fontFamily: font.body,
    fontSize: 13,
    color: color.neutral400,
  },
});
