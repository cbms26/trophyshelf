import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MedalIcon } from '../components/icons';
import { ordinalWords } from '../lib/inscriptions';
import { sharePlate } from '../lib/sharePlate';
import { RootStackParamList } from '../navigation/types';
import { useBooks } from '../store/BooksContext';
import { color, font, radius, space, type } from '../theme/tokens';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Plaque'>;
type Route = RouteProp<RootStackParamList, 'Plaque'>;

export default function PlaqueScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const { books } = useBooks();
  const book = books.find((b) => b.id === params.bookId);
  const plateRef = useRef<View>(null);

  if (!book) return null;

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View ref={plateRef} collapsable={false} style={styles.plateCard}>
        <View style={styles.seal}>
          <MedalIcon size={36} color={color.nightAccent} strokeWidth={1.3} />
        </View>
        <View style={styles.titleBlock}>
          <Text style={styles.kicker}>Volume the {ordinalWords(book.volume ?? 1)}</Text>
          <Text style={styles.title}>{book.title}</Text>
          <Text style={styles.meta}>
            {book.author}
            {book.pages > 0 ? ` · ${book.pages.toLocaleString()} pages` : ''}
          </Text>
        </View>
        {book.inscription ? <Text style={styles.inscription}>“{book.inscription}”</Text> : null}
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.primaryBtn}
          accessibilityRole="button"
          onPress={() => navigation.popToTop()}
        >
          <Text style={styles.primaryLabel}>Place it on the shelf</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.ghostBtn} accessibilityRole="button" onPress={() => sharePlate(book, plateRef)}>
          <Text style={styles.ghostLabel}>Share this plate</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: color.night,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space[8],
    gap: 48,
  },
  // Captured as the share image, so it carries its own background.
  plateCard: {
    alignItems: 'center',
    alignSelf: 'stretch',
    gap: 28,
    paddingVertical: space[6],
    backgroundColor: color.night,
  },
  seal: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 1,
    borderColor: color.nightRing,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBlock: {
    alignItems: 'center',
    gap: space[2],
  },
  kicker: {
    fontFamily: font.sansMedium,
    fontSize: 14,
    lineHeight: 20,
    color: color.nightAccent,
  },
  title: {
    ...type.display,
    letterSpacing: -0.3,
    color: color.nightText,
    textAlign: 'center',
  },
  meta: {
    ...type.body,
    fontSize: 15,
    lineHeight: 22,
    color: color.nightTextSecondary,
    textAlign: 'center',
  },
  inscription: {
    ...type.inscription,
    color: color.nightBody,
    textAlign: 'center',
    maxWidth: 300,
  },
  actions: {
    gap: 6,
    width: '100%',
    maxWidth: 300,
  },
  primaryBtn: {
    height: 52,
    backgroundColor: color.nightText,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryLabel: {
    ...type.button,
    color: color.ink,
  },
  ghostBtn: {
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostLabel: {
    fontFamily: font.sansMedium,
    fontSize: 15,
    color: color.nightTextSecondary,
  },
});
