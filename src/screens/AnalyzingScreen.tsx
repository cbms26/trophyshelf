import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CoverPlate from '../components/CoverPlate';
import { analyzeCover } from '../lib/analyzeCover';
import { RootStackParamList } from '../navigation/types';
import { color, font, radius } from '../theme/tokens';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Analyzing'>;
type Route = RouteProp<RootStackParamList, 'Analyzing'>;

const BLANK_DETECTED = { title: '', author: '', genre: '', pages: 0 };

export default function AnalyzingScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async () => {
    setError(null);
    try {
      const detected = await analyzeCover(params.base64);
      navigation.replace('Confirm', { mode: 'create', photoUri: params.photoUri, detected });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Couldn’t read the cover.');
    }
  }, [params.base64, params.photoUri]);

  useEffect(() => {
    run();
  }, [run]);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <CoverPlate style={styles.plate} elevation="md" imageUri={params.photoUri} />
      <View style={styles.copy}>
        <Text style={styles.title}>{error ? "Couldn't read the cover" : 'Reading the cover…'}</Text>
        <Text style={styles.body}>
          {error
            ? error
            : "Asking Gemini for the title, author, genre and page count. You'll get to correct anything it misreads."}
        </Text>
      </View>

      {error ? (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.retryBtn} accessibilityRole="button" onPress={run}>
            <Text style={styles.retryLabel}>Try again</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.manualBtn}
            accessibilityRole="button"
            onPress={() =>
              navigation.replace('Confirm', { mode: 'create', photoUri: params.photoUri, detected: BLANK_DETECTED })
            }
          >
            <Text style={styles.manualLabel}>Enter details manually</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.progressTrack}>
          <View style={styles.progressFill} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: color.bg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 26,
  },
  plate: {
    width: 180,
    aspectRatio: 2 / 3,
  },
  copy: {
    alignItems: 'center',
    maxWidth: 250,
  },
  title: {
    fontFamily: font.heading,
    fontSize: 22,
    color: color.text,
    marginBottom: 6,
    textAlign: 'center',
  },
  body: {
    fontFamily: font.body,
    fontSize: 12,
    lineHeight: 19,
    color: color.textMuted60,
    textAlign: 'center',
  },
  progressTrack: {
    width: 180,
    height: 1,
    backgroundColor: color.neutral300,
    overflow: 'hidden',
  },
  progressFill: {
    height: 1,
    width: '60%',
    backgroundColor: color.accent,
  },
  actions: {
    gap: 10,
    width: 220,
  },
  retryBtn: {
    backgroundColor: color.accent,
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  retryLabel: {
    fontFamily: font.heading,
    fontSize: 14,
    color: '#fff',
  },
  manualBtn: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  manualLabel: {
    fontFamily: font.body,
    fontSize: 12,
    color: color.textMuted60,
    textDecorationLine: 'underline',
  },
});
