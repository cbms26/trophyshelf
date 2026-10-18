import { useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { color, shadow } from '../theme/tokens';
import ChatSheet from './ChatSheet';
import { LibrarianIcon } from './icons';

// Floating entry point to the Librarian. Rendered as the last child of a
// screen's SafeAreaView; `bottom` clears that screen's bottom chrome.
export default function ChatBubble({ bottom = 20 }: { bottom?: number }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <TouchableOpacity
        style={[styles.bubble, { bottom }]}
        accessibilityRole="button"
        accessibilityLabel="Ask the Librarian about your books"
        onPress={() => setOpen(true)}
        activeOpacity={0.85}
      >
        {/* Swap for the final logo: <Image source={require('../../assets/chat-logo.png')} style={styles.logo} /> */}
        <LibrarianIcon size={26} />
      </TouchableOpacity>
      <ChatSheet visible={open} onClose={() => setOpen(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  bubble: {
    position: 'absolute',
    right: 18,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: color.accent,
    borderWidth: 2,
    borderColor: color.accent300,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.md,
  },
});
