'use client'

import { IUser } from '@/types/next-auth'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send,
  User,
  Bot,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Settings,
  Share2,
  Copy,
  MessageSquare,
  FileText,
  BookOpen,
  Scale,
  Gavel,
  Building,
  Crown,
  AlertCircle,
  Lock,
  Award,
  ArrowRight,
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'


interface Message {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
  isTyping?: boolean
  audioUrl?: string
  isPlaying?: boolean
}

interface Suggestion {
  id: string
  text: string
  category: 'general' | 'contract' | 'labor' | 'property' | 'criminal' | 'civil'
  icon: React.ReactNode
}

const suggestions: Suggestion[] = [
  {
    id: '1',
    text: 'Tôi có quyền gì khi bị sa thải trái phép?',
    category: 'labor',
    icon: <Building className="w-4 h-4" />
  },
  {
    id: '2',
    text: 'Cách soạn thảo hợp đồng mua bán nhà?',
    category: 'property',
    icon: <FileText className="w-4 h-4" />
  },
  {
    id: '3',
    text: 'Thủ tục thành lập công ty TNHH?',
    category: 'general',
    icon: <Scale className="w-4 h-4" />
  },
  {
    id: '4',
    text: 'Quyền lợi người lao động khi nghỉ việc?',
    category: 'labor',
    icon: <Gavel className="w-4 h-4" />
  },
  {
    id: '5',
    text: 'Cách khiếu nại quyết định hành chính?',
    category: 'civil',
    icon: <MessageSquare className="w-4 h-4" />
  },
  {
    id: '6',
    text: 'Thủ tục thừa kế tài sản?',
    category: 'property',
    icon: <BookOpen className="w-4 h-4" />
  }
]

const categories = [
  { id: 'general', name: 'Tổng hợp', icon: <Scale className="w-4 h-4" /> },
  { id: 'contract', name: 'Hợp đồng', icon: <FileText className="w-4 h-4" /> },
  { id: 'labor', name: 'Lao động', icon: <Building className="w-4 h-4" /> },
  { id: 'property', name: 'Tài sản', icon: <BookOpen className="w-4 h-4" /> },
  { id: 'criminal', name: 'Hình sự', icon: <Gavel className="w-4 h-4" /> },
  { id: 'civil', name: 'Dân sự', icon: <MessageSquare className="w-4 h-4" /> }
]

// Giới hạn số câu hỏi theo gói user
const QUERY_LIMITS = {
  normal: 30,
  pro: 100,
  admin: Infinity,
} as const

// Lưu trữ lịch sử chat trong localStorage
const getChatHistoryKey = (userId: string) => `vilaw_chat_history_${userId}`
const getQueryCountKey = (userId: string) => `vilaw_query_count_${userId}`

// Lấy user level từ email hoặc metadata
const getUserLevel = (email?: string): 'normal' | 'pro' | 'admin' => {
  if (!email) return 'normal'
  if (email.includes('admin') || email.includes('@vilaw.com')) return 'admin'
  if (email.includes('pro')) return 'pro'
  return 'normal'
}

export default function ChatPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const user = session?.user as IUser | undefined
  const userId = user?._id 
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Xin chào! Tôi là trợ lý pháp lý AI của ViLaw. Tôi có thể giúp bạn tìm hiểu về pháp luật Việt Nam, soạn thảo văn bản pháp lý, và trả lời các câu hỏi liên quan đến quyền lợi của bạn. Bạn có thể hỏi tôi bất cứ điều gì!',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [queryCount, setQueryCount] = useState(0)
  const [userLevel, setUserLevel] = useState<'normal' | 'pro' | 'admin'>('normal')
  const [isLimitReached, setIsLimitReached] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Yêu cầu đăng nhập theo NextAuth mới để sử dụng Chat

  // Redirect sang trang đăng nhập mới nếu chưa đăng nhập
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace(`/auth/login?redirect=${encodeURIComponent('/chat')}`)
    }
  }, [status, router])

  // Lấy user level khi user đăng nhập
  useEffect(() => {
    if (user?.email) {
      const level = getUserLevel(user.email)
      setUserLevel(level)
    }
  }, [user])

  // Kiểm tra giới hạn
  const checkLimitReached = (count: number, level: 'normal' | 'pro' | 'admin') => {
    const limit = QUERY_LIMITS[level]
    if (limit !== Infinity && count >= limit) {
      setIsLimitReached(true)
      return true
    }
    setIsLimitReached(false)
    return false
  }

  // Lưu lịch sử chat vào localStorage
  const saveChatHistory = (userId: string, chatMessages: Message[]) => {
    try {
      const historyKey = getChatHistoryKey(userId)
      // Chuyển đổi Date thành string để lưu
      const serializableMessages = chatMessages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp.toISOString()
      }))
      localStorage.setItem(historyKey, JSON.stringify(serializableMessages))
    } catch (error) {
      console.error('Error saving chat history:', error)
    }
  }

  // Lưu số lượng câu hỏi
  const saveQueryCount = (userId: string, count: number) => {
    try {
      const countKey = getQueryCountKey(userId)
      localStorage.setItem(countKey, count.toString())
    } catch (error) {
      console.error('Error saving query count:', error)
    }
  }


  // Tải lịch sử chat và số lượng câu hỏi khi user đăng nhập
  useEffect(() => {
    if (user && status === 'authenticated' && userId) {
      const historyKey = getChatHistoryKey(userId)
     

      // Tải lịch sử chat
      try {
        const savedHistory = localStorage.getItem(historyKey)
        if (savedHistory) {
          const parsedHistory = JSON.parse(savedHistory)
          // Chuyển đổi timestamp từ string sang Date
          const restoredMessages = parsedHistory.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
          // Chỉ set messages nếu có lịch sử hợp lệ và không rỗng
          if (restoredMessages.length > 0) {
            setMessages(restoredMessages)
            toast.success('Đã tải lịch sử chat')
          }
        }
      } catch (error) {
        console.error('Error loading chat history:', error)
      }

    }
  }, [user, status, userId])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const sanitizeContent = (raw?: string) => {
    if (typeof raw !== "string") return raw;
    let t = raw.replace(/\\r\\n/g, "\\n").replace(/\\r/g, "\\n");
    // Convert literal escaped sequences to real characters
    t = t.replace(/\\n/g, "\n").replace(/\\r/g, "\r");
    // Remove token markers like <|file_separator|>, <|im_end|>, etc.
    t = t.replace(/<\|[\s\S]*?\|>/g, "");
    // Remove any bracketed HASH... TIMESTAMP footer (non-greedy)
    t = t.replace(/\[[\s\S]*?HASH:[\s\S]*?\]/g, "");
    // Remove asterisks used as markdown list markers but keep emphasis if desired
    t = t.replace(/\*+/g, "");
    // Fix stray punctuation sequences like ", ." -> "."
    t = t.replace(/,\s*\./g, ".");
    // Collapse multiple blank lines
    t = t.replace(/\n{3,}/g, "\n\n");
    // Collapse multiple spaces/tabs
    t = t.replace(/[ \t]{2,}/g, " ");
    return t.trim();
  };

  useEffect(() => {
    scrollToBottom()
  }, [messages])

   const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    // Kiểm tra đăng nhập
    if (!user) {
      toast.error("Vui lòng đăng nhập để sử dụng Chat AI");
      router.push(`/supabase-login?redirect=${encodeURIComponent("/chat")}`);
      return;
    }

    // Kiểm tra giới hạn số câu hỏi
    // const limit = QUERY_LIMITS[userLevel]
    // if (limit !== Infinity && queryCount >= limit) {
    //   toast.error(`Bạn đã đạt giới hạn ${limit} câu hỏi cho gói ${userLevel}. Vui lòng nâng cấp để tiếp tục sử dụng.`)
    //   setIsLimitReached(true)
    //   return
    // }

    const getFallbackReply = () =>
      "Hiện tại không thể gọi AI. " +
      "Chúng tôi sẽ phản hồi sớm nhất khi hệ thống ổn định.";

    const safeGenerateAIResponse = async (userInput: string) => {
      try {
        return await generateAIResponse(userInput);
      } catch (err: any) {
        console.error("AI fallback error:", err);
        toast.error("AI tạm thời không phản hồi, dùng câu trả lời mẫu");
        return getFallbackReply();
      }
    };

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: content.trim(),
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputValue("");
    setIsTyping(true);

    // Tăng số lượng câu hỏi và lưu
    const newQueryCount = queryCount + 1;
    setQueryCount(newQueryCount);
    saveQueryCount(userId  || '', newQueryCount);
    checkLimitReached(newQueryCount, userLevel);

    // Tạo tin nhắn AI trước với nội dung rỗng để cập nhật theo streaming
    const aiMessageId = (Date.now() + 1).toString();
    const initialAiResponse: Message = {
      id: aiMessageId,
      type: "ai",
      content: "",
      timestamp: new Date(),
    };
    const messagesWithAi = [...updatedMessages, initialAiResponse];
    setMessages(messagesWithAi);
    // Flag để ngăn race condition: nếu streaming callback đến trước khi state được flush,
    // ta vẫn biết rằng ai message đã được tạo (scheduled) và không thêm bản sao nữa.
    let aiMessageScheduled = true;

    try {
      const anyWindow = window as any;
      let aiText = "";

      // Thử dùng apiService nếu có
      if (anyWindow?.apiService?.chatWithAI) {
        try {
          const aiRes = await anyWindow.apiService.chatWithAI(content, "vi");
          aiText = aiRes?.response || "";
        } catch (e) {
          console.log("apiService failed, using streaming API");
        }
      }

      // Nếu không có apiService hoặc không có kết quả, dùng streaming API
      if (!aiText) {
        // Sử dụng streaming với callback để cập nhật UI theo thời gian thực
        const updateMessageContent = (newContent: string) => {
          setMessages((prevMessages) => {
            const messageExists = prevMessages.some(
              (msg) => msg.id === aiMessageId
            );
            if (!messageExists) {
              // Nếu tin nhắn chưa tồn tại và chưa được scheduled (fallback), thêm mới
              if (!aiMessageScheduled) {
                aiMessageScheduled = true;
                return [
                  ...prevMessages,
                  {
                    id: aiMessageId,
                    type: "ai" as const,
                    content: newContent,
                    timestamp: new Date(),
                  },
                ];
              }
              // Nếu đã scheduled, tránh thêm duplicate; map will add nothing
              return prevMessages;
            }
            // Cập nhật tin nhắn hiện có
            return prevMessages.map((msg) =>
              msg.id === aiMessageId ? { ...msg, content: newContent } : msg
            );
          });
        };

        let accumulatedContent = "";
        aiText = await generateAIResponse(
          content,
          (chunk: string) => {
            // Normalize newline characters
            const normalizedChunk = chunk
              .replace(/\r\n/g, "\n")
              .replace(/\r/g, "\n");
            console.log(
              "Received chunk (repr):",
              JSON.stringify(normalizedChunk)
            );

            if (!accumulatedContent) {
              accumulatedContent = normalizedChunk;
            } else if (normalizedChunk.includes(accumulatedContent)) {
              // Server sent the whole text again -> replace to avoid duplication
              accumulatedContent = normalizedChunk;
            } else {
              // Ensure there's a newline between previous content and new chunk if needed
              if (
                !accumulatedContent.endsWith("\n") &&
                !normalizedChunk.startsWith("\n")
              ) {
                accumulatedContent += "\n" + normalizedChunk;
              } else {
                accumulatedContent += normalizedChunk;
              }
            }

            console.log(
              "Accumulated content (repr):",
              JSON.stringify(accumulatedContent)
            );
            updateMessageContent(accumulatedContent);
          },
          userId || '', // Sử dụng user.id làm conversation_id
          {} // extraHeaders nếu cần
        );

        console.log("Final AI response:", aiText);

        // Prefer the streamed accumulated content (kept during onChunk) because
        // some backends return a final payload without original newlines.
        const finalText =
          accumulatedContent && accumulatedContent.trim()
            ? accumulatedContent
            : aiText;
        if (finalText) {
          updateMessageContent(finalText);
        }
      } else {
        // Nếu dùng apiService, cập nhật tin nhắn với nội dung đầy đủ
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === aiMessageId ? { ...msg, content: aiText } : msg
          )
        );
      }

      // Lấy messages hiện tại để lưu
      setMessages((prevMessages) => {
        const finalMessages = prevMessages.map((msg) =>
          msg.id === aiMessageId
            ? {
                ...msg,
                // If aiText lacks newlines, prefer the already-streamed msg.content (preserves formatting)
                content:
                  aiText && typeof aiText === "string" && aiText.includes("\n")
                    ? aiText
                    : msg.content,
              }
            : msg
        );
        // Lưu lịch sử chat sau khi có phản hồi AI
        saveChatHistory(userId || '', finalMessages);
        return finalMessages;
      });
    } catch (e) {
      console.error("AI error:", e);
      toast.error("Không thể gọi AI hiện tại, dùng phản hồi mẫu");

      // Fallback: dùng safeGenerateAIResponse (không streaming)
      try {
        const fallbackText = await safeGenerateAIResponse(content);
        setMessages((prevMessages) => {
          const finalMessages = prevMessages.map((msg) =>
            msg.id === aiMessageId ? { ...msg, content: fallbackText } : msg
          );
          saveChatHistory(userId || '', finalMessages);
          return finalMessages;
        });
      } catch (fallbackError) {
        // Nếu fallback cũng lỗi, hiển thị thông báo lỗi
        const errorMessage =
          "Xin lỗi, không thể kết nối với AI. Vui lòng thử lại sau.";
        setMessages((prevMessages) => {
          const finalMessages = prevMessages.map((msg) =>
            msg.id === aiMessageId ? { ...msg, content: errorMessage } : msg
          );
          saveChatHistory(userId || '', finalMessages);
          return finalMessages;
        });
      }
    } finally {
      setIsTyping(false);
    }
  };

  const generateAIResponse = async (
    userInput: string,
    onChunk?: (chunk: string) => void,
    conversationId: string = "1",
    extraHeaders: Record<string, string> = {}
  ): Promise<string> => {
    const url = "https://vilawbot.onrender.com/api/v1/chat/stream";
    const controller = new AbortController();

    let fullResponse = "";

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...extraHeaders,
        },
        body: JSON.stringify({
          message: userInput?.trim() || "Nội dung câu hỏi trống",
          conversation_id: conversationId,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error("Stream request failed: " + res.status);
      }

      const reader = res.body?.getReader();
      if (!reader) {
        throw new Error("Response body is not readable");
      }

      const decoder = new TextDecoder("utf-8");
      let buf = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        buf += chunk;

        // Xử lý giống `iter_lines` trong test script: tách theo dòng, giữ lại phần chưa đầy đủ
        const lines = buf.split("\n");
        // Lưu phần cuối cùng (có thể là partial line) để ghép với chunk tiếp theo
        buf = lines.pop() || "";

        for (const rawLine of lines) {
          // Preserve original leading spaces to keep markdown/list formatting
          const raw = rawLine.replace(/\r$/, "");
          if (!raw.trim()) continue;
          if (raw.startsWith(":")) continue; // SSE comment

          let payload = "";
          if (raw.startsWith("data:")) {
            // Keep payload as-is (don't trim) to preserve indentation/newlines
            payload = raw.replace(/^data:\s*/, "");
          } else {
            // plain text line (non-SSE)
            payload = raw;
          }

          if (!payload) continue;

          let textToAdd = payload;
          try {
            const parsed = JSON.parse(payload);
            if (typeof parsed === "object" && parsed !== null) {
              // ưu tiên trường `text` giống test script
              textToAdd =
                parsed.text ??
                parsed.message ??
                parsed.content ??
                parsed.response ??
                parsed.data ??
                JSON.stringify(parsed);
            } else if (typeof parsed === "string") {
              textToAdd = parsed;
            }
          } catch {
            textToAdd = payload;
          }

          if (typeof textToAdd === "string") {
            // Convert escaped sequences ("\\n", "\\r", "\\t") to real characters
            textToAdd = textToAdd
              .replace(/\\r/g, "\r")
              .replace(/\\n/g, "\n")
              .replace(/\\t/g, "\t");
          }

          if (textToAdd) {
            // Maintain newline behavior for SSE `data:` events but preserve original spacing
            const appended = raw.startsWith("data:")
              ? textToAdd + "\n"
              : textToAdd;
            fullResponse += appended;
            if (onChunk) onChunk(appended);
          }
        }
      }

      // Xử lý phần còn lại trong buffer (dòng cuối cùng)
      if (buf.trim()) {
        const raw = buf.replace(/\r$/, "");
        if (raw && !raw.startsWith(":")) {
          const payload = raw.startsWith("data:")
            ? raw.replace(/^data:\s*/, "")
            : raw;
          let textToAdd = payload;
          try {
            const parsed = JSON.parse(payload);
            if (typeof parsed === "object" && parsed !== null) {
              textToAdd =
                parsed.text ??
                parsed.message ??
                parsed.content ??
                parsed.response ??
                parsed.data ??
                JSON.stringify(parsed);
            } else if (typeof parsed === "string") {
              textToAdd = parsed;
            }
          } catch {
            textToAdd = payload;
          }
          if (typeof textToAdd === "string") {
            textToAdd = textToAdd
              .replace(/\\r/g, "\r")
              .replace(/\\n/g, "\n")
              .replace(/\\t/g, "\t");
          }
          if (textToAdd) {
            const appended = raw.startsWith("data:")
              ? textToAdd + "\n"
              : textToAdd;
            fullResponse += appended;
            if (onChunk) onChunk(appended);
          }
        }
      }

      return fullResponse;
    } catch (err: any) {
      console.error("Stream error details:", err);
      if (err.name === "AbortError") {
        throw new Error("Request was aborted");
      }
      throw new Error(`Stream error: ${err?.message ?? String(err)}`);
    }
  };
  

  const handleSuggestionClick = (suggestion: Suggestion) => {
    handleSendMessage(suggestion.text)
  }

  const filteredSuggestions = selectedCategory === 'all'
    ? suggestions
    : suggestions.filter(s => s.category === selectedCategory)

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(inputValue)
    }
  }

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
    toast.success('Đã sao chép tin nhắn')
  }

  const handleShareMessage = (content: string) => {
    if (navigator.share) {
      navigator.share({
        title: 'ViLaw Chat',
        text: content,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(content)
      toast.success('Đã sao chép để chia sẻ')
    }
  }

  // Hiển thị loading khi đang kiểm tra đăng nhập
  if (status === 'loading') {
    return (
      <div className="min-h-screen theme-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Đang kiểm tra đăng nhập...</p>
        </div>
      </div>
    )
  }

  // Không hiển thị nội dung nếu chưa đăng nhập (sẽ redirect)
  if (!user) {
    return null
  }

  const limit = QUERY_LIMITS[userLevel]
  const remainingQueries = limit === Infinity ? '∞' : Math.max(0, limit - queryCount)

  return (
    <div className="min-h-screen theme-bg">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-primary-600 hover:text-primary-700">
              <ArrowRight className="w-5 h-5 rotate-180" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Chat AI Pháp lý</h1>
              <p className="text-sm text-gray-500">Trợ lý AI 24/7 cho câu hỏi pháp lý</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Hiển thị số câu hỏi còn lại */}
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-200">
              {userLevel === 'pro' && <Crown className="w-4 h-4 text-yellow-600" />}
              {userLevel === 'admin' && <Award className="w-4 h-4 text-red-600" />}
              <span className="text-sm font-medium text-gray-700">
                {isLimitReached ? (
                  <span className="text-red-600">Đã hết lượt</span>
                ) : (
                  <span>Còn lại: <strong>{remainingQueries}</strong> câu hỏi</span>
                )}
              </span>
            </div>

            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-2 rounded-lg ${isMuted ? 'bg-red-100 text-red-600' : 'text-gray-600 hover:bg-gray-100'}`}
              title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              title="Cài đặt"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Thông báo khi đạt giới hạn */}
      {isLimitReached && (
        <div className="max-w-7xl mx-auto px-4 pt-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="font-medium text-gray-900">Bạn đã đạt giới hạn {limit} câu hỏi cho gói {userLevel}</p>
                <p className="text-sm text-gray-600">Nâng cấp lên Pro để được {QUERY_LIMITS.pro} câu hỏi/tháng</p>
              </div>
            </div>
            <Link
              href="/payment?pkg=Pro"
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Crown className="w-4 h-4" />
              <span>Nâng cấp ngay</span>
            </Link>
          </motion.div>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[600px] flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6">
                <AnimatePresence>
                  {messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`mb-6 ${message.type === 'user' ? 'text-right' : 'text-left'}`}
                    >
                      <div className={`inline-flex items-start space-x-3 max-w-[80%] ${message.type === 'user' ? 'ml-auto' : ''}`}>
                        {message.type === 'ai' && (
                          <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <Bot className="w-4 h-4 text-white" />
                          </div>
                        )}

                        <div className={`rounded-2xl px-4 py-3 ${message.type === 'user'
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                          }`}>
                          <div className="whitespace-pre-wrap">
                            {message.content ? (
                              typeof message.content === "string" ? (
                                // Sanitize and display
                                sanitizeContent(message.content)
                              ) : (
                                message.content
                              )
                            ) : message.type === "ai" && isTyping ? (
                              <span className="text-gray-400 italic">
                                Đang soạn thảo...
                              </span>
                            ) : (
                              ""
                            )}
                          </div>
                          <div className={`text-xs mt-2 ${message.type === 'user' ? 'text-primary-100' : 'text-gray-500'
                            }`}>
                            {message.timestamp.toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>

                        {message.type === 'user' && (
                          <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>

                      {message.type === 'ai' && (
                        <div className="flex items-center space-x-2 mt-2 ml-11">
                          <button
                            onClick={() => handleCopyMessage(message.content)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                            title="Sao chép"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleShareMessage(message.content)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                            title="Chia sẻ"
                          >
                            <Share2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start space-x-3 mb-6"
                  >
                    <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-gray-100 rounded-2xl px-4 py-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce animation-delay-100"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce animation-delay-200"></div>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-gray-200 p-4">
                {isLimitReached && (
                  <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center space-x-2">
                    <Lock className="w-4 h-4 text-yellow-600" />
                    <p className="text-sm text-yellow-800">
                      Bạn đã đạt giới hạn. Vui lòng nâng cấp để tiếp tục sử dụng.
                    </p>
                  </div>
                )}
                <div className="flex items-end space-x-3">
                  <div className="flex-1">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={isLimitReached ? "Đã đạt giới hạn - Vui lòng nâng cấp" : "Nhập câu hỏi pháp lý của bạn..."}
                      disabled={isLimitReached}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        isLimitReached ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                    />
                  </div>

                  <button
                    onClick={() => setIsRecording(!isRecording)}
                    disabled={isLimitReached}
                    className={`p-3 rounded-lg ${
                      isLimitReached 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : isRecording 
                          ? 'bg-red-500 text-white' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    title={isRecording ? 'Dừng ghi âm' : 'Ghi âm'}
                  >
                    {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>

                  <button
                    onClick={() => handleSendMessage(inputValue)}
                    disabled={!inputValue.trim() || isLimitReached}
                    className="p-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={isLimitReached ? "Đã đạt giới hạn" : "Gửi tin nhắn"}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Suggestions Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Gợi ý câu hỏi</h3>

              {/* Category Filter */}
              <div className="mb-4">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  aria-label="Lọc theo danh mục"
                >
                  <option value="all">Tất cả danh mục</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Suggestions */}
              <div className="space-y-3">
                {filteredSuggestions.map((suggestion) => (
                  <motion.button
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="text-primary-600">{suggestion.icon}</div>
                      <span className="text-sm font-medium text-gray-900">{suggestion.text}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 