import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Recommendation } from '../lib/chat';
import { useBooks } from '../store/BooksContext';
import { ChatMessage, useChat } from '../store/ChatContext';
import { color, font, radius } from '../theme/tokens';
import { CloseIcon, SendIcon } from './icons';

const YEAR = new Date().getFullYear();

// The Librarian is asked for plain text, but Gemini still slips in markdown
// emphasis now and then — show *Title* / **Title** as just Title.
const plain = (text: string) => text.replace(/(\*\*|__|\*|_)(\S(?:[^*_\n]*?\S)?)\1/g, '$2');
const STARTERS = [
  'Recommend something like my last finished book',
  'Which genre do I read most?',
  `Summarize my ${YEAR} reading`,
];

export default function ChatSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const { books, finished } = useBooks();
  const { messages, busy, send, retry, clear } = useChat();
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  const emptyShelf = books.length === 0;
  const submit = (text: string) => {
    if (!text.trim() || busy || emptyShelf) return;
    send(text);
    setDraft('');
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <KeyboardAvoidingView
        style={styles.avoider}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        pointerEvents="box-none"
      >
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.kicker}>The Librarian</Text>
              <Text style={styles.title}>Ask about your shelf</Text>
            </View>
            {messages.length > 0 ? (
              <TouchableOpacity accessibilityRole="button" onPress={clear} style={styles.clearBtn}>
                <Text style={styles.clearLabel}>Clear</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Close" onPress={onClose} hitSlop={10}>
              <CloseIcon />
            </TouchableOpacity>
          </View>

          <ScrollView
            ref={scrollRef}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          >
            {emptyShelf ? (
              <Text style={styles.intro}>
                Your shelf is still empty. Enshrine your first book and I'll get to know your taste.
              </Text>
            ) : messages.length === 0 ? (
              <>
                <Text style={styles.intro}>
                  I know every volume on your shelf{finished.length ? ` — all ${finished.length} enshrined` : ''}. Ask me
                  about them, or let me find your next read.
                </Text>
                <View style={styles.starters}>
                  {STARTERS.map((s) => (
                    <TouchableOpacity key={s} style={styles.chip} accessibilityRole="button" onPress={() => submit(s)}>
                      <Text style={styles.chipLabel}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            ) : (
              messages.map((m) => <Bubble key={m.id} message={m} onRetry={retry} />)
            )}
          </ScrollView>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={draft}
              onChangeText={setDraft}
              placeholder={emptyShelf ? 'Enshrine a book to begin' : 'Ask the Librarian…'}
              placeholderTextColor={color.textMuted55}
              editable={!emptyShelf}
              multiline
              maxLength={2000}
              onSubmitEditing={() => submit(draft)}
              blurOnSubmit={false}
              submitBehavior="submit"
              returnKeyType="send"
            />
            <TouchableOpacity
              style={[styles.sendBtn, (!draft.trim() || busy || emptyShelf) && styles.disabled]}
              accessibilityRole="button"
              accessibilityLabel="Send"
              disabled={!draft.trim() || busy || emptyShelf}
              onPress={() => submit(draft)}
            >
              <SendIcon />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function Bubble({ message, onRetry }: { message: ChatMessage; onRetry: () => void }) {
  const mine = message.role === 'user';
  if (message.status === 'streaming' && !message.text) {
    return (
      <View style={[styles.msg, styles.theirs, styles.typing]}>
        <ActivityIndicator size="small" color={color.accent} />
        <Text style={styles.typingLabel}>Consulting the stacks…</Text>
      </View>
    );
  }
  return (
    <View style={{ alignSelf: mine ? 'flex-end' : 'stretch' }}>
      <View
        style={[styles.msg, mine ? styles.mine : styles.theirs, message.status === 'error' && styles.errorMsg]}
      >
        <Text style={[styles.msgText, mine && styles.mineText]}>{mine ? message.text : plain(message.text)}</Text>
        {message.status === 'error' ? (
          <TouchableOpacity accessibilityRole="button" onPress={onRetry} style={styles.retryBtn}>
            <Text style={styles.retryLabel}>Try again</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      {message.recommendations?.length ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recs}>
          {message.recommendations.map((r) => (
            <RecCard key={r.isbn ?? r.title} rec={r} />
          ))}
        </ScrollView>
      ) : null}
    </View>
  );
}

function RecCard({ rec }: { rec: Recommendation }) {
  return (
    <TouchableOpacity
      style={styles.rec}
      accessibilityRole="link"
      accessibilityLabel={`${rec.title} on Google Books`}
      disabled={!rec.infoLink}
      onPress={() => rec.infoLink && Linking.openURL(rec.infoLink).catch(() => {})}
    >
      {rec.thumbnail ? (
        <Image source={{ uri: rec.thumbnail }} style={styles.recCover} resizeMode="cover" />
      ) : (
        <View style={[styles.recCover, styles.recCoverBlank]} />
      )}
      <Text style={styles.recTitle} numberOfLines={2}>
        {rec.title}
      </Text>
      <Text style={styles.recAuthor} numberOfLines={1}>
        {rec.authors.join(', ')}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(45, 43, 43, 0.5)',
  },
  avoider: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    height: '82%',
    backgroundColor: color.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    borderWidth: 1,
    borderColor: color.divider,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: color.divider,
  },
  kicker: {
    fontFamily: font.body,
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: color.accent,
  },
  title: {
    fontFamily: font.heading,
    fontSize: 22,
    lineHeight: 26,
    color: color.text,
  },
  clearBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: color.divider,
    borderRadius: radius.md,
  },
  clearLabel: {
    fontFamily: font.body,
    fontSize: 12,
    color: color.textMuted70,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 14,
    gap: 10,
  },
  intro: {
    fontFamily: font.body,
    fontStyle: 'italic',
    fontSize: 14,
    lineHeight: 21,
    color: color.textMuted70,
  },
  starters: {
    gap: 8,
    marginTop: 6,
  },
  chip: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: color.accent300,
    backgroundColor: color.accent100,
    borderRadius: 9999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipLabel: {
    fontFamily: font.body,
    fontSize: 13,
    color: color.accent700,
  },
  msg: {
    borderRadius: radius.lg,
    paddingHorizontal: 12,
    paddingVertical: 9,
    maxWidth: '88%',
  },
  mine: {
    alignSelf: 'flex-end',
    backgroundColor: color.accent,
  },
  theirs: {
    alignSelf: 'flex-start',
    backgroundColor: color.bg,
    borderWidth: 1,
    borderColor: color.divider,
  },
  errorMsg: {
    borderColor: color.accent400,
    backgroundColor: color.accent100,
  },
  msgText: {
    fontFamily: font.body,
    fontSize: 14,
    lineHeight: 21,
    color: color.text,
  },
  mineText: {
    color: '#fff',
  },
  typing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typingLabel: {
    fontFamily: font.body,
    fontStyle: 'italic',
    fontSize: 13,
    color: color.textMuted62,
  },
  retryBtn: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  retryLabel: {
    fontFamily: font.heading,
    fontSize: 14,
    color: color.accent700,
    textDecorationLine: 'underline',
  },
  recs: {
    gap: 10,
    paddingTop: 8,
  },
  rec: {
    width: 104,
    gap: 4,
  },
  recCover: {
    width: 104,
    height: 152,
    borderRadius: radius.sm,
    backgroundColor: color.neutral300,
  },
  recCoverBlank: {
    borderWidth: 1,
    borderColor: color.divider,
  },
  recTitle: {
    fontFamily: font.heading,
    fontSize: 14,
    lineHeight: 16,
    color: color.text,
  },
  recAuthor: {
    fontFamily: font.body,
    fontStyle: 'italic',
    fontSize: 11,
    color: color.textMuted62,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: color.divider,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 110,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontFamily: font.body,
    fontSize: 14,
    color: color.text,
    borderWidth: 1,
    borderColor: color.divider,
    borderRadius: radius.md,
    backgroundColor: color.bg,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: color.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.45,
  },
});
