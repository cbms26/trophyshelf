import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AnalyzingScreen from '../screens/AnalyzingScreen';
import CaptureScreen from '../screens/CaptureScreen';
import ConfirmScreen from '../screens/ConfirmScreen';
import DetailScreen from '../screens/DetailScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import PlaqueScreen from '../screens/PlaqueScreen';
import ShelfScreen from '../screens/ShelfScreen';
import YearScreen from '../screens/YearScreen';
import { useBooks } from '../store/BooksContext';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { onboarded } = useBooks();

  return (
    <Stack.Navigator
      initialRouteName={onboarded ? 'Shelf' : 'Onboarding'}
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Shelf" component={ShelfScreen} />
      <Stack.Screen name="Year" component={YearScreen} />
      <Stack.Screen name="Capture" component={CaptureScreen} options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="Analyzing" component={AnalyzingScreen} />
      <Stack.Screen name="Confirm" component={ConfirmScreen} />
      <Stack.Screen name="Plaque" component={PlaqueScreen} options={{ animation: 'fade' }} />
      <Stack.Screen name="Detail" component={DetailScreen} />
    </Stack.Navigator>
  );
}
