import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CloseIcon, ImageIcon } from '../components/icons';
import { downscaleImage } from '../lib/downscaleImage';
import { RootStackParamList } from '../navigation/types';
import { color, font, gutter, radius, space, type } from '../theme/tokens';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Capture'>;

const BLANK_DETECTED = { title: '', author: '', genre: '', pages: 0 };

export default function CaptureScreen() {
  const navigation = useNavigation<Nav>();
  const [permission, requestPermission] = useCameraPermissions();
  const [taking, setTaking] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  const goToManualEntry = () => {
    navigation.replace('Confirm', { mode: 'create', photoUri: null, detected: BLANK_DETECTED });
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
          <CloseIcon size={22} color={color.nightText} strokeWidth={1.8} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Photograph the cover</Text>
        <TouchableOpacity
          style={styles.iconBtn}
          accessibilityRole="button"
          accessibilityLabel="Library"
          onPress={pickFromLibrary}
        >
          <ImageIcon color={color.nightText} />
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
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Enter details manually" onPress={goToManualEntry}>
            <Text style={styles.controlLabel}>Type</Text>
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
    backgroundColor: color.night,
  },
  header: {
    paddingHorizontal: 14,
    paddingTop: space[1],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...type.headerTitle,
    color: color.nightText,
  },
  viewfinderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: gutter,
  },
  viewfinder: {
    width: 240,
    aspectRatio: 2 / 3,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: color.nightSurface,
  },
  viewfinderFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: space[4],
  },
  fallbackText: {
    ...type.secondary,
    color: color.nightTextSecondary,
    textAlign: 'center',
  },
  viewfinderCorner: {
    ...StyleSheet.absoluteFill,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(244, 242, 238, 0.35)',
  },
  footer: {
    paddingHorizontal: gutter,
    paddingBottom: space[8],
    alignItems: 'center',
    gap: space[6],
  },
  hint: {
    ...type.secondary,
    color: color.nightTextSecondary,
    textAlign: 'center',
    maxWidth: 300,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 40,
  },
  controlLabel: {
    fontFamily: font.sansMedium,
    fontSize: 15,
    color: color.nightText,
    minWidth: 56,
    textAlign: 'center',
  },
  shutterOuter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 3,
    borderColor: color.nightText,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: color.nightText,
  },
  sampleBtn: {
    minHeight: 44,
    justifyContent: 'center',
  },
  sampleLabel: {
    fontFamily: font.sansMedium,
    fontSize: 15,
    color: color.nightAccent,
  },
});
