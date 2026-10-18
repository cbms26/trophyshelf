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
import { color, font, radius, space, type } from '../theme/tokens';
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
          <View style={styles.grabber} />
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>The Librarian</Text>
              <Text style={styles.subtitle}>Ask about your shelf</Text>
            </View>
            {messages.length > 0 ? (
              <TouchableOpacity accessibilityRole="button" onPress={clear} style={styles.clearBtn}>
                <Text style={styles.clearLabel}>Clear</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity style={styles.closeBtn} accessibilityRole="button" accessibilityLabel="Close" onPress={onClose}>
              <CloseIcon size={22} color={color.text} strokeWidth={1.8} />
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
              placeholderTextColor={color.placeholder}
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
    backgroundColor: color.backdrop,
  },
  avoider: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    height: '84%',
    backgroundColor: color.bg,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: space[5],
    paddingTop: space[2],
  },
  grabber: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: color.track,
    marginBottom: space[3],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    paddingBottom: space[3],
  },
  title: {
    ...type.title,
  },
  subtitle: {
    ...type.secondary,
    marginTop: 2,
  },
  clearBtn: {
    minHeight: 44,
    paddingHorizontal: space[2],
    justifyContent: 'center',
  },
  clearLabel: {
    fontFamily: font.sansMedium,
    fontSize: 15,
    color: color.textSecondary,
  },
  closeBtn: {
    width: 44,
    height: 44,
    marginRight: -10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingVertical: space[3],
    gap: space[3],
  },
  intro: {
    ...type.body,
    color: color.textSecondary,
  },
  starters: {
    gap: space[2],
    marginTop: space[2],
  },
  chip: {
    alignSelf: 'flex-start',
    backgroundColor: color.surface,
    borderRadius: radius.pill,
    paddingHorizontal: space[4],
    paddingVertical: 10,
  },
  chipLabel: {
    ...type.body,
    fontSize: 15,
    lineHeight: 20,
  },
  msg: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: '88%',
  },
  mine: {
    alignSelf: 'flex-end',
    backgroundColor: color.ink,
    borderBottomRightRadius: 6,
  },
  theirs: {
    alignSelf: 'flex-start',
    backgroundColor: color.surface,
    borderBottomLeftRadius: 6,
  },
  errorMsg: {
    backgroundColor: color.accentTint,
  },
  msgText: {
    ...type.body,
  },
  mineText: {
    color: color.onInk,
  },
  typing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
  },
  typingLabel: {
    ...type.secondary,
    fontSize: 15,
  },
  retryBtn: {
    marginTop: space[2],
    alignSelf: 'flex-start',
  },
  retryLabel: {
    fontFamily: font.sansSemiBold,
    fontSize: 15,
    color: color.accentText,
    textDecorationLine: 'underline',
  },
  recs: {
    gap: space[3],
    paddingTop: space[2],
  },
  rec: {
    width: 104,
    gap: 4,
  },
  recCover: {
    width: 104,
    height: 156,
    borderRadius: radius.sm,
    backgroundColor: color.surface,
  },
  recCoverBlank: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: color.divider,
  },
  recTitle: {
    ...type.bookTitle,
    fontSize: 15,
    lineHeight: 19,
    marginTop: 4,
  },
  recAuthor: {
    ...type.caption,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: space[2],
    paddingTop: space[2],
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    paddingHorizontal: space[4],
    paddingTop: 11,
    paddingBottom: 11,
    ...type.body,
    lineHeight: 22,
    backgroundColor: color.surface,
    borderRadius: 22,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: color.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.35,
  },
});
