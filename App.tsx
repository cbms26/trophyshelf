import { CormorantGaramond_600SemiBold } from '@expo-google-fonts/cormorant-garamond';
import { Lora_400Regular } from '@expo-google-fonts/lora';
import { NavigationContainer } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootNavigator from './src/navigation/RootNavigator';
import { BooksProvider, useBooks } from './src/store/BooksContext';
import { color } from './src/theme/tokens';

function Gate({ children }: { children: React.ReactNode }) {
  const { ready } = useBooks();
  if (!ready) return <View style={{ flex: 1, backgroundColor: color.bg }} />;
  return <>{children}</>;
}

export default function App() {
  const [fontsLoaded] = useFonts({
    CormorantGaramond_600SemiBold,
    Lora_400Regular,
  });

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: color.bg }} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <BooksProvider>
          <Gate>
            <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>
          </Gate>
        </BooksProvider>
        <StatusBar style="dark" />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
