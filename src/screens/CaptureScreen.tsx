import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { downscaleImage } from '../lib/downscaleImage';
import { RootStackParamList } from '../navigation/types';
import { color, font } from '../theme/tokens';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Capture'>;

const BLANK_DETECTED = { title: '', author: '', genre: '', pages: 0 };

export default function CaptureScreen() {
  const navigation = useNavigation<Nav>();
  const [permission, requestPermission] = useCameraPermissions();
  const [taking, setTaking] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  const goToManualEntry = () => {
    navigation.navigate('Confirm', { photoUri: null, detected: BLANK_DETECTED });
  };

  const goToAnalyzing = async (rawUri: string) => {
    try {
      const { uri, base64 } = await downscaleImage(rawUri);
      navigation.replace('Analyzing', { photoUri: uri, base64 });
    } catch {
      // Couldn't process the photo (corrupt file, out of memory, etc.) —
      // don't strand the user, fall through to manual entry.
      goToManualEntry();
    }
  };

  const takePicture = async () => {
    if (!cameraRef.current || taking) return;
    setTaking(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      if (photo?.uri) {
        await goToAnalyzing(photo.uri);
      }
    } catch {
      // Camera failed to capture — let the user retry rather than guessing.
    } finally {
      setTaking(false);
    }
  };

  const pickFromLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
      aspect: [2, 3],
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      await goToAnalyzing(result.assets[0].uri);
    }
  };

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission]);

  const canUseCamera = permission?.granted && permission.status !== 'denied';

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconBtn}
          accessibilityRole="button"
          accessibilityLabel="Close"
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.iconGlyph}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Photograph the cover</Text>
        <TouchableOpacity
          style={styles.iconBtn}
          accessibilityRole="button"
          accessibilityLabel="Library"
          onPress={pickFromLibrary}
        >
          <Text style={styles.iconGlyph}>▤</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.viewfinderWrap}>
        {canUseCamera ? (
          <View style={styles.viewfinder}>
            <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />
            <View pointerEvents="none" style={styles.viewfinderCorner} />
          </View>
        ) : (
          <View style={[styles.viewfinder, styles.viewfinderFallback]}>
            <Text style={styles.fallbackText}>
              {permission === null ? 'Requesting camera access…' : 'Camera unavailable in this environment'}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.hint}>Fill the frame with the front cover. Glare is fine — the reader is forgiving.</Text>
        <View style={styles.controlsRow}>
          <TouchableOpacity accessibilityRole="button" onPress={pickFromLibrary}>
            <Text style={styles.controlLabel}>Library</Text>
          </TouchableOpacity>
          {canUseCamera ? (
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Take photo" onPress={takePicture} disabled={taking}>
              <View style={styles.shutterOuter}>
                <View style={styles.shutterInner} />
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity accessibilityRole="button" onPress={requestPermission}>
              <View style={styles.shutterOuter}>
                <View style={styles.shutterInner} />
              </View>
            </TouchableOpacity>
          )}
          <TouchableOpacity accessibilityRole="button" onPress={goToManualEntry}>
            <Text style={styles.controlLabel}>ISBN</Text>
          </TouchableOpacity>
        </View>
        {!canUseCamera ? (
          <TouchableOpacity
            style={styles.sampleBtn}
            accessibilityRole="button"
            onPress={goToManualEntry}
          >
            <Text style={styles.sampleLabel}>Enter details manually instead</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: color.neutral900,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconGlyph: {
    color: color.neutral100,
    fontSize: 16,
  },
  headerTitle: {
    fontFamily: font.heading,
    fontSize: 15,
    color: color.neutral100,
  },
  viewfinderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  viewfinder: {
    width: 236,
    aspectRatio: 2 / 3,
    overflow: 'hidden',
    backgroundColor: '#3a3835',
  },
  viewfinderFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  fallbackText: {
    fontFamily: font.body,
    fontSize: 12,
    color: color.neutral500,
    textAlign: 'center',
  },
  viewfinderCorner: {
    ...StyleSheet.absoluteFill,
    borderWidth: 1,
    borderColor: color.accent,
    opacity: 0.9,
    margin: -14,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
    gap: 20,
  },
  hint: {
    fontFamily: font.body,
    fontSize: 12,
    color: color.neutral400,
    textAlign: 'center',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 36,
  },
  controlLabel: {
    fontFamily: font.body,
    fontSize: 12,
    color: color.neutral400,
  },
  shutterOuter: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 1,
    borderColor: color.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: color.accent,
  },
  sampleBtn: {
    paddingVertical: 8,
  },
  sampleLabel: {
    fontFamily: font.body,
    fontSize: 12,
    color: color.accent400,
    textDecorationLine: 'underline',
  },
});
