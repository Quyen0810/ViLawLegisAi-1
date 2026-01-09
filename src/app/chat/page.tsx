'use client'

import React from 'react'
import { IUser } from '@/types/next-auth'
import { useState, useRef, useEffect, useCallback, useMemo, memo } from 'react'
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

// Sanitize content - đặt ngoài component để tránh tạo lại
const sanitizeContent = (raw?: string): string => {
  if (typeof raw !== "string") return raw ?? "";
  let t = raw.replace(/\\r\\n/g, "\\n").replace(/\\r/g, "\\n");
  t = t.replace(/\\n/g, "\n").replace(/\\r/g, "\r");
  t = t.replace(/<\|[\s\S]*?\|>/g, "");
  t = t.replace(/\[[\s\S]*?HASH:[\s\S]*?\]/g, "");
  t = t.replace(/,\s*\./g, ".");
  t = t.replace(/\n{3,}/g, "\n\n");
  t = t.replace(/[ \t]{2,}/g, " ");
  return t.trim();
};

// Format content để hiển thị đẹp hơn - CẢI TIẾN với markdown-like rendering
const formatContent = (content: string, isUser: boolean = false): React.ReactNode => {
  if (!content) return null;

  // CRITICAL: Pre-process content to ensure proper line breaks
  let processedContent = content;

  // Handle escaped newlines from API
  processedContent = processedContent.replace(/\\n/g, '\n');
  processedContent = processedContent.replace(/\\r\\n/g, '\n');
  processedContent = processedContent.replace(/\\r/g, '\n');

  // INSERT LINE BREAKS before common patterns that should start on new lines
  // Pattern: numbered items like "1. ", "2. " etc anywhere in text
  processedContent = processedContent.replace(/(\d+\.\s+(?:[A-ZÀ-Ỹa-zà-ỹ]))/g, '\n\n$1');

  // Pattern: asterisk bullets "* Something" - convert to dash and add newline
  processedContent = processedContent.replace(/\*\s+([A-ZÀ-Ỹa-zà-ỹ])/g, '\n- $1');

  // Pattern: **Header:** or **Header** style sections - add newlines before
  processedContent = processedContent.replace(/\*\*([^*]+)\*\*/g, '\n\n**$1**\n');

  // Pattern: emoji headers - add newlines before
  processedContent = processedContent.replace(/(📞|👨‍⚖️|💡|☎️|📍|⚠️|⏰|✅|❌|🔍|📄|⚖️|🏛️)/g, '\n\n$1');

  // Pattern: triple dash divider
  processedContent = processedContent.replace(/---/g, '\n---\n');

  // Clean up multiple newlines
  processedContent = processedContent.replace(/\n{3,}/g, '\n\n');
  processedContent = processedContent.trim();


  // Split content into lines for processing
  const lines = processedContent.split('\n');
  const elements: React.ReactNode[] = [];
  let currentParagraph: string[] = [];
  let listItems: string[] = [];
  let isInList = false;
  let sectionCount = 0;

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const text = currentParagraph.join(' ').trim();
      if (text) {
        elements.push(
          <p key={`p-${elements.length}`} style={{
            marginBottom: '14px',
            lineHeight: '1.85',
            color: isUser ? 'inherit' : '#111827'
          }}>
            {formatInlineText(text, isUser)}
          </p>
        );
      }
      currentParagraph = [];
    }
  };

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} style={{
          marginBottom: '14px',
          paddingLeft: '24px',
          listStyleType: 'disc'
        }}>
          {listItems.map((item, idx) => (
            <li key={idx} style={{
              marginBottom: '8px',
              lineHeight: '1.75',
              color: isUser ? 'inherit' : '#111827'
            }}>
              {formatInlineText(item, isUser)}
            </li>
          ))}
        </ul>
      );
      listItems = [];
      isInList = false;
    }
  };

  // Format inline text (bold, links, etc.)
  const formatInlineText = (text: string, isUser: boolean = false): React.ReactNode => {
    // Pre-clean: fix malformed patterns like **text:* or **text*
    let cleanText = text
      .replace(/\*\*([^*:]+):\*/g, '**$1:**')  // **text:* -> **text:**
      .replace(/\*\*([^*]+)\*(?!\*)/g, '**$1**')  // **text* -> **text**  
      .replace(/(?<!\*)\*(?!\*)/g, '');  // remove orphan single *

    const parts: React.ReactNode[] = [];
    let key = 0;


    // Pattern for **bold** text
    const boldPattern = /\*\*([^*]+)\*\*/g;

    let lastIndex = 0;
    let match;

    while ((match = boldPattern.exec(cleanText)) !== null) {
      if (match.index > lastIndex) {
        parts.push(<span key={key++}>{cleanText.slice(lastIndex, match.index)}</span>);
      }
      parts.push(
        <strong key={key++} style={{
          fontWeight: 600,
          color: isUser ? 'inherit' : '#1e40af'
        }}>
          {match[1]}
        </strong>
      );
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < cleanText.length) {
      parts.push(<span key={key++}>{cleanText.slice(lastIndex)}</span>);
    }

    return parts.length > 0 ? parts : cleanText;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Empty line - flush current paragraph
    if (!line) {
      flushList();
      flushParagraph();
      continue;
    }

    // Main section headers (1. 2. 3. Title)
    if (/^\d+\.\s+[A-ZÀ-Ỹ]/.test(line)) {
      flushList();
      flushParagraph();
      sectionCount++;
      elements.push(
        <div key={`section-${elements.length}`} style={{
          backgroundColor: '#eff6ff',
          borderLeft: '4px solid #3b82f6',
          padding: '12px 16px',
          marginTop: sectionCount > 1 ? '20px' : '8px',
          marginBottom: '12px',
          borderRadius: '0 8px 8px 0'
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: 700,
            color: '#1e40af',
            margin: 0
          }}>
            {formatInlineText(line, isUser)}
          </h3>
        </div>
      );
      continue;
    }

    // Divider line (---)
    if (/^-{3,}$/.test(line)) {
      flushList();
      flushParagraph();
      elements.push(
        <hr key={`hr-${elements.length}`} style={{
          margin: '20px 0',
          border: 'none',
          borderTop: '2px solid #e5e7eb'
        }} />
      );
      continue;
    }

    // Emoji headers (📞, 👨‍⚖️, 💡, etc.)
    if (/^[📞👨💡☎️📍⚠️⏰✅❌🔍📄⚖️🏛️]/.test(line)) {
      flushList();
      flushParagraph();
      elements.push(
        <div key={`emoji-${elements.length}`} style={{
          fontSize: '15px',
          fontWeight: 600,
          marginTop: '16px',
          marginBottom: '8px',
          color: isUser ? 'inherit' : '#111827',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {formatInlineText(line, isUser)}
        </div>
      );
      continue;
    }

    // Bullet points (-, *, •)
    if (/^[\-\*\•]\s/.test(line)) {
      flushParagraph();
      isInList = true;
      listItems.push(line.replace(/^[\-\*\•]\s*/, ''));
      continue;
    }

    // If we were in a list and this line doesn't start with bullet, flush list
    if (isInList && !/^[\-\*\•]\s/.test(line)) {
      flushList();
    }

    // Regular text - add to current paragraph
    currentParagraph.push(line);
  }

  // Flush remaining content
  flushList();
  flushParagraph();

  return <>{elements}</>;
};


// ============================================
type LawyerType = 'criminal' | 'business' | 'civil_dongnai' | 'civil' | 'general' | '';

const detectLawyerNeed = (userQuestion: string): { needsLawyer: boolean; lawyerType: LawyerType } => {
  const q = userQuestion.toLowerCase();

  // Keywords cho từng loại luật sư (MỞ RỘNG)
  const criminalKeywords = [
    'hình sự', 'bị tố cáo', 'bị bắt', 'điều tra', 'truy tố', 'án tù', 'tội danh',
    'công an', 'viện kiểm sát', 'bào chữa', 'kháng cáo', 'tù giam', 'phạm tội',
    'bị cáo', 'nguyên đơn', 'bị đơn', 'tạm giam', 'tạm giữ', 'khởi tố',
    'phạt tù', 'án treo', 'tội phạm', 'bị hại', 'vi phạm pháp luật', 'buông tha',
    'giết người', 'trộm cắp', 'cướp', 'lừa đảo', 'tham nhũng', 'gây thương tích'
  ];

  const civilKeywords = [
    'kiện', 'tranh chấp', 'sa thải', 'thừa kế', 'ly hôn', 'chia tài sản',
    'mua bán nhà', 'hợp đồng', 'bồi thường', 'tòa án', 'đơn kiện', 'đại diện',
    'quyền nuôi con', 'cấp dưỡng', 'di chúc', 'tài sản chung', 'nợ', 'trả nợ',
    'đòi nợ', 'vay mượn', 'thế chấp', 'đất đai', 'nhà đất', 'sang tên',
    'chuyển nhượng', 'giấy tờ nhà', 'sổ đỏ', 'sổ hồng', 'quyền sử dụng đất',
    'tranh chấp đất', 'lấn chiếm', 'xây dựng trái phép', 'vi phạm hợp đồng',
    'bị lừa', 'bị lừa đảo', 'mất tiền', 'đòi lại tiền', 'không trả', 'chiếm đoạt',
    'vỡ nợ', 'xù nợ', 'nợ xấu', 'vay tín dụng đen'
  ];

  const businessKeywords = [
    'thành lập công ty', 'doanh nghiệp', 'hợp đồng thương mại', 'm&a',
    'sáp nhập', 'mua lại', 'giấy phép kinh doanh', 'đầu tư', 'thuế doanh nghiệp',
    'cổ phần', 'cổ đông', 'hội đồng quản trị', 'giải thể', 'phá sản',
    'giấy phép', 'đăng ký kinh doanh', 'vốn điều lệ', 'tranh chấp thương mại',
    'hợp đồng lao động', 'thanh lý', 'kinh doanh', 'xuất nhập khẩu', 'mở công ty'
  ];

  const directKeywords = [
    'tìm luật sư', 'cần luật sư', 'liên hệ luật sư', 'giới thiệu luật sư',
    'có luật sư nào', 'thuê luật sư', 'tư vấn luật sư', 'số điện thoại luật sư',
    'liên hệ tư vấn', 'gặp luật sư', 'hẹn luật sư', 'văn phòng luật sư'
  ];

  const seriousLaborKeywords = [
    'sa thải oan', 'không trả lương', 'bị đuổi việc', 'nợ lương',
    'sa thải trái phép', 'chấm dứt hợp đồng trái phép', 'bị cắt lương',
    'bóc lột', 'bị ép nghỉ việc', 'không được đóng bảo hiểm', 'quỵt lương',
    'chèn ép', 'bị đối xử bất công', 'vi phạm quyền lao động'
  ];

  // Câu hỏi phức tạp cần tư vấn chuyên sâu
  const complexQuestionKeywords = [
    'phải làm gì', 'nên làm gì', 'xử lý thế nào', 'giải quyết như thế nào',
    'quyền gì', 'quyền lợi', 'có quyền', 'được quyền', 'bị xâm phạm',
    'bị thiệt hại', 'khiếu nại', 'tố cáo', 'báo công an', 'ra tòa',
    'kiện được không', 'có vi phạm', 'trái pháp luật', 'đúng hay sai',
    'có hợp pháp', 'được phép không', 'bị phạt', 'bị xử lý', 'bị truy cứu',
    'mất tiền', 'lừa qua mạng', 'ứng dụng lừa đảo'
  ];

  // Check direct request first
  if (directKeywords.some(kw => q.includes(kw))) {
    return { needsLawyer: true, lawyerType: 'general' };
  }

  // Check criminal
  if (criminalKeywords.some(kw => q.includes(kw))) {
    return { needsLawyer: true, lawyerType: 'criminal' };
  }

  // Check business
  if (businessKeywords.some(kw => q.includes(kw))) {
    return { needsLawyer: true, lawyerType: 'business' };
  }

  // Check civil/labor with Dong Nai
  if (civilKeywords.some(kw => q.includes(kw))) {
    if (q.includes('đồng nai') || q.includes('biên hòa')) {
      return { needsLawyer: true, lawyerType: 'civil_dongnai' };
    }
    return { needsLawyer: true, lawyerType: 'civil' };
  }

  // Check serious labor disputes
  if (seriousLaborKeywords.some(kw => q.includes(kw))) {
    return { needsLawyer: true, lawyerType: 'civil' };
  }

  // Check complex questions that may need professional advice
  if (complexQuestionKeywords.some(kw => q.includes(kw))) {
    return { needsLawyer: true, lawyerType: 'general' };
  }

  return { needsLawyer: false, lawyerType: '' };
};

const getLawyerInfo = (lawyerType: LawyerType): string => {
  const lawyerInfoMap: Record<LawyerType, string> = {
    'criminal': `

---
📞 **Tư vấn chuyên sâu**

Vụ việc của bạn thuộc lĩnh vực hình sự, rất cần sự hỗ trợ từ luật sư chuyên nghiệp:

👨‍⚖️ **Luật sư Lê Văn Tiến** (Chuyên hình sự, tranh chấp phức tạp)
☎️ **02513 741 041**

💡 Luật sư sẽ giúp bạn: Bào chữa, đại diện tại cơ quan điều tra, tư vấn quyền lợi và chiến lược pháp lý tốt nhất.`,

    'business': `

---
📞 **Tư vấn chuyên sâu**

Vấn đề doanh nghiệp cần được xử lý chuyên nghiệp và chính xác:

👨‍⚖️ **Luật sư Tiến Đỗ (Pascal)** (Tư vấn doanh nghiệp, hợp đồng thương mại)
☎️ **090 391 8681**

💡 Luật sư sẽ giúp bạn: Thành lập công ty, soạn thảo hợp đồng, tư vấn pháp lý doanh nghiệp, M&A.`,

    'civil_dongnai': `

---
📞 **Tư vấn chuyên sâu**

Với vấn đề tại Đồng Nai, tôi giới thiệu luật sư địa phương:

👨‍⚖️ **Luật sư Hoàng Anh** (Đồng Nai - Chuyên tranh chấp dân sự, hợp đồng)
☎️ **094 5909 068**
📍 Khu vực: Đồng Nai và các tỉnh lân cận

💡 Luật sư sẽ giúp bạn: Đại diện kiện tụng, soạn thảo hợp đồng, giải quyết tranh chấp dân sự.`,

    'civil': `

---
📞 **Tư vấn chuyên sâu**

Vụ việc của bạn có thể cần sự hỗ trợ trực tiếp từ luật sư. Tôi đề xuất:

👨‍⚖️ **Luật sư Hoàng Anh** (Chuyên tranh chấp dân sự, hợp đồng)
☎️ **094 5909 068** (Đồng Nai)

👨‍⚖️ **Luật sư Lê Văn Tiến** (Chuyên hình sự, tranh chấp phức tạp)
☎️ **02513 741 041**

💡 Luật sư sẽ giúp bạn: Tư vấn pháp lý chi tiết, đại diện tại tòa, bảo vệ quyền lợi hợp pháp.`,

    'general': `

---
📞 **Tư vấn chuyên sâu**

Vụ việc của bạn có thể cần sự hỗ trợ trực tiếp từ luật sư. Tôi đề xuất:

👨‍⚖️ **Luật sư Hoàng Anh** (Chuyên tranh chấp dân sự, hợp đồng)
☎️ **094 5909 068** (Đồng Nai)

👨‍⚖️ **Luật sư Lê Văn Tiến** (Chuyên hình sự, tranh chấp phức tạp)
☎️ **02513 741 041**

👨‍⚖️ **Luật sư Tiến Đỗ (Pascal)** (Tư vấn doanh nghiệp)
☎️ **090 391 8681**

💡 Luật sư sẽ giúp bạn: Tư vấn pháp lý chi tiết, đại diện tại tòa, bảo vệ quyền lợi hợp pháp.`,

    '': ''
  };

  return lawyerInfoMap[lawyerType] || '';
};

// ============================================
// OPTIMIZED: Tách MessageItem thành component riêng với memo
// ============================================
interface MessageItemProps {
  message: Message;
  isTyping: boolean;
  isLatest: boolean;
  onCopy: (content: string) => void;
  onShare: (content: string) => void;
}

const MessageItem = memo(function MessageItem({
  message,
  isTyping,
  isLatest,
  onCopy,
  onShare
}: MessageItemProps) {
  // Memoize sanitized and formatted content
  const displayContent = useMemo(() => {
    if (!message.content) return null;
    const sanitized = typeof message.content === "string"
      ? sanitizeContent(message.content)
      : message.content;
    return formatContent(sanitized, message.type === 'user');
  }, [message.content, message.type]);

  // Get raw text for copy/share
  const rawText = useMemo(() => {
    if (!message.content) return '';
    return typeof message.content === "string"
      ? sanitizeContent(message.content)
      : message.content;
  }, [message.content]);

  const MotionWrapper = isLatest ? motion.div : 'div';
  const motionProps = isLatest ? {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.2 }
  } : {};

  return (
    <MotionWrapper
      {...motionProps}
      className={`mb-6 ${message.type === 'user' ? 'text-right' : 'text-left'}`}
      suppressHydrationWarning
    >
      <div className={`inline-flex items-start space-x-3 max-w-[85%] ${message.type === 'user' ? 'ml-auto' : ''}`} suppressHydrationWarning>
        {message.type === 'ai' && (
          <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
            <Bot className="w-4 h-4 text-white" />
          </div>
        )}

        <div className={`rounded-2xl px-5 py-4 ${message.type === 'user'
          ? 'bg-gradient-to-br from-primary-600 to-primary-700 text-white shadow-md'
          : 'bg-gray-50 text-gray-900 border border-gray-100 shadow-sm'
          }`}>
          <div
            className="chat-content"
            style={{
              fontSize: '15px',
              wordBreak: 'break-word',
              maxWidth: '100%'
            }}
            suppressHydrationWarning
          >
            {displayContent ? (
              displayContent
            ) : message.type === "ai" && isTyping ? (
              <span className="text-gray-400 italic">
                Đang soạn thảo...
              </span>
            ) : (
              ""
            )}
          </div>
          <div className={`text-xs mt-2 ${message.type === 'user' ? 'text-primary-100' : 'text-gray-500'
            }`} suppressHydrationWarning>
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
            onClick={() => onCopy(rawText)}
            className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
            title="Sao chép"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onShare(rawText)}
            className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
            title="Chia sẻ"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </MotionWrapper>
  );
});

// ============================================
// OPTIMIZED: Tách TypingIndicator
// ============================================
const TypingIndicator = memo(function TypingIndicator() {
  return (
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
  );
});

// ============================================
// OPTIMIZED: Throttle helper cho streaming updates
// ============================================
function createThrottledUpdater(updateFn: (content: string) => void, delay: number = 150) {
  let lastUpdate = 0;
  let pendingContent = "";
  let timeoutId: NodeJS.Timeout | null = null;

  return (content: string) => {
    pendingContent = content;
    const now = Date.now();

    if (now - lastUpdate >= delay) {
      lastUpdate = now;
      updateFn(pendingContent);
    } else if (!timeoutId) {
      timeoutId = setTimeout(() => {
        lastUpdate = Date.now();
        updateFn(pendingContent);
        timeoutId = null;
      }, delay - (now - lastUpdate));
    }
  };
}

export default function ChatPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const user = session?.user as IUser | undefined
  const userId = user?._id
  const [messages, setMessages] = useState<Message[]>([])
  const [isInitialized, setIsInitialized] = useState(false)
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

  // Redirect sang trang đăng nhập mới nếu chưa đăng nhập
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace(`/auth/login?redirect=${encodeURIComponent('/chat')}`)
    }
  }, [status, router])

  // Initialize welcome message on client side only
  useEffect(() => {
    if (!isInitialized) {
      setMessages([{
        id: '1',
        type: 'ai',
        content: 'Xin chào! Tôi là trợ lý pháp lý AI của ViLaw. Tôi có thể giúp bạn tìm hiểu về pháp luật Việt Nam, soạn thảo văn bản pháp lý, và trả lời các câu hỏi liên quan đến quyền lợi của bạn. Bạn có thể hỏi tôi bất cứ điều gì!',
        timestamp: new Date()
      }])
      setIsInitialized(true)
    }
  }, [isInitialized])

  // Lấy user level khi user đăng nhập
  useEffect(() => {
    if (user?.email) {
      const level = getUserLevel(user.email)
      setUserLevel(level)
    }
  }, [user?.email])

  // Kiểm tra giới hạn - memoized
  const checkLimitReached = useCallback((count: number, level: 'normal' | 'pro' | 'admin') => {
    const limit = QUERY_LIMITS[level]
    if (limit !== Infinity && count >= limit) {
      setIsLimitReached(true)
      return true
    }
    setIsLimitReached(false)
    return false
  }, [])

  // Lưu lịch sử chat vào localStorage - memoized
  const saveChatHistory = useCallback((uId: string, chatMessages: Message[]) => {
    try {
      const historyKey = getChatHistoryKey(uId)
      const serializableMessages = chatMessages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp.toISOString()
      }))
      localStorage.setItem(historyKey, JSON.stringify(serializableMessages))
    } catch (error) {
      console.error('Error saving chat history:', error)
    }
  }, [])

  // Lưu số lượng câu hỏi - memoized
  const saveQueryCount = useCallback((uId: string, count: number) => {
    try {
      const countKey = getQueryCountKey(uId)
      localStorage.setItem(countKey, count.toString())
    } catch (error) {
      console.error('Error saving query count:', error)
    }
  }, [])

  const isHistoryLoaded = useRef(false)

  // Tải lịch sử chat và số lượng câu hỏi khi user đăng nhập
  useEffect(() => {
    if (user && status === 'authenticated' && userId && !isHistoryLoaded.current) {
      const historyKey = getChatHistoryKey(userId)

      try {
        const savedHistory = localStorage.getItem(historyKey)
        if (savedHistory) {
          const parsedHistory = JSON.parse(savedHistory)
          const restoredMessages = parsedHistory.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
          if (restoredMessages.length > 0) {
            setMessages(restoredMessages)
            isHistoryLoaded.current = true
            toast.success('Đã tải lịch sử chat')
          }
        }
      } catch (error) {
        console.error('Error loading chat history:', error)
      }
    }
  }, [user, status, userId])

  // Scroll to bottom - memoized
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // ============================================
  // OPTIMIZED: generateAIResponse với throttled updates
  // ============================================
  const generateAIResponse = useCallback(async (
    userInput: string,
    onChunk?: (chunk: string) => void,
    conversationId: string = "1",
    extraHeaders: Record<string, string> = {}
  ): Promise<string> => {

    // Use environment variable or fallback to Render production URL
    const API_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL || "https://vilaw-be.onrender.com"}/api/v1/chatmessages`;
    const controller = new AbortController();

    let fullResponse = "";

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...extraHeaders,
        },
        body: JSON.stringify({
          sessionId: conversationId || "default-session",
          messages: [{
            sender: "user",
            text: userInput?.trim(),
            timestamp: new Date(),
            metadata: {}
          }]
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error("Stream request failed: " + res.status);
      }

      const contentType = res.headers.get("content-type") || "";

      // Check if response is SSE stream or plain text/json
      if (contentType.includes("text/event-stream")) {
        // SSE streaming mode
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

          const lines = buf.split("\n");
          buf = lines.pop() || "";

          for (const rawLine of lines) {
            const raw = rawLine.replace(/\r$/, "");
            if (!raw.trim() || raw.startsWith(":")) continue;

            const payload = raw.startsWith("data:") ? raw.slice(5).trim() : raw;
            if (!payload) continue;

            let textToAdd = payload;
            if (payload[0] === '{' || payload[0] === '[') {
              try {
                const parsed = JSON.parse(payload);
                textToAdd = parsed.text ?? parsed.message ?? parsed.content ?? parsed.response ?? payload;
              } catch {
                // Keep original payload if JSON parse fails
              }
            }

            if (textToAdd) {
              fullResponse += textToAdd;
              if (onChunk) {
                onChunk(fullResponse);
              }
            }
          }
        }

        // Process remaining buffer
        if (buf.trim() && !buf.startsWith(":")) {
          const payload = buf.startsWith("data:") ? buf.slice(5).trim() : buf.trim();
          if (payload) {
            fullResponse += payload;
          }
        }
      } else {
        // Plain text or JSON response mode
        const text = await res.text();

        // Try to parse as JSON first
        try {
          const json = JSON.parse(text);
          // Mentor: Backend trả về document có mảng messages, tin nhắn AI nằm ở cuối
          if (json.messages && Array.isArray(json.messages) && json.messages.length > 0) {
            const lastMsg = json.messages[json.messages.length - 1];
            fullResponse = lastMsg.text || lastMsg.content || text;
          } else {
            fullResponse = json.aiMessage?.content ?? json.text ?? json.message ?? json.content ?? json.response ?? text;
          }
        } catch {
          // Use plain text
          fullResponse = text;
        }

        if (onChunk) onChunk(fullResponse);
      }

      // Final update để đảm bảo hiển thị đầy đủ
      if (onChunk) onChunk(fullResponse);

      return fullResponse;
    } catch (err: any) {
      console.error("Stream error details:", err);
      if (err.name === "AbortError") {
        throw new Error("Request was aborted");
      }
      throw new Error(`Stream error: ${err?.message ?? String(err)}`);
    }
  }, []);



  // ============================================
  // OPTIMIZED: handleSendMessage với batched updates
  // ============================================
  const handleSendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    if (!user) {
      toast.error("Vui lòng đăng nhập để sử dụng Chat AI");
      router.push(`/supabase-login?redirect=${encodeURIComponent("/chat")}`);
      return;
    }

    const getFallbackReply = () =>
      "Hiện tại không thể gọi AI. " +
      "Chúng tôi sẽ phản hồi sớm nhất khi hệ thống ổn định.";

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: content.trim(),
      timestamp: new Date(),
    };

    const aiMessageId = (Date.now() + 1).toString();
    const initialAiResponse: Message = {
      id: aiMessageId,
      type: "ai",
      content: "",
      timestamp: new Date(),
    };

    // Batch initial update
    setMessages(prev => [...prev, userMessage, initialAiResponse]);
    setInputValue("");
    setIsTyping(true);

    // Update query count
    const newQueryCount = queryCount + 1;
    setQueryCount(newQueryCount);
    saveQueryCount(userId || '', newQueryCount);
    checkLimitReached(newQueryCount, userLevel);

    // Detect if user needs lawyer suggestion (hiển thị SAU khi AI xong)
    const { needsLawyer, lawyerType } = detectLawyerNeed(content);
    const lawyerInfo = needsLawyer ? getLawyerInfo(lawyerType) : '';

    try {
      // OPTIMIZED: Create throttled updater - only update UI every 200ms
      const throttledUpdate = createThrottledUpdater((newContent: string) => {
        setMessages(prevMessages =>
          prevMessages.map(msg =>
            msg.id === aiMessageId ? { ...msg, content: newContent } : msg
          )
        );
      }, 50);

      const aiText = await generateAIResponse(
        content,
        throttledUpdate,
        userId || '',
        {}
      );

      // Final update: AI response + lawyer info at the END
      const finalContent = aiText
        ? (lawyerInfo ? `${aiText}\n\n${lawyerInfo}` : aiText)
        : (lawyerInfo || '');

      setMessages(prevMessages => {
        const finalMessages = prevMessages.map(msg =>
          msg.id === aiMessageId
            ? { ...msg, content: finalContent || msg.content }
            : msg
        );
        saveChatHistory(userId || '', finalMessages);
        return finalMessages;
      });

    } catch (e) {
      console.error("AI error:", e);
      toast.error("Không thể gọi AI hiện tại, dùng phản hồi mẫu");

      const fallbackText = lawyerInfo
        ? `${getFallbackReply()}\n\n${lawyerInfo}`
        : getFallbackReply();
      setMessages(prevMessages => {
        const finalMessages = prevMessages.map(msg =>
          msg.id === aiMessageId ? { ...msg, content: fallbackText } : msg
        );
        saveChatHistory(userId || '', finalMessages);
        return finalMessages;
      });
    } finally {
      setIsTyping(false);
    }
  }, [user, userId, queryCount, userLevel, router, generateAIResponse, saveChatHistory, saveQueryCount, checkLimitReached]);

  // Memoized suggestion click handler
  const handleSuggestionClick = useCallback((suggestion: Suggestion) => {
    handleSendMessage(suggestion.text)
  }, [handleSendMessage])

  // Memoized filtered suggestions
  const filteredSuggestions = useMemo(() =>
    selectedCategory === 'all'
      ? suggestions
      : suggestions.filter(s => s.category === selectedCategory),
    [selectedCategory]
  )

  // Memoized key press handler
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(inputValue)
    }
  }, [handleSendMessage, inputValue])

  // Memoized copy handler
  const handleCopyMessage = useCallback((content: string) => {
    navigator.clipboard.writeText(content)
    toast.success('Đã sao chép tin nhắn')
  }, [])

  // Memoized share handler
  const handleShareMessage = useCallback((content: string) => {
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
  }, [])

  // Toggle handlers - memoized
  const toggleMute = useCallback(() => setIsMuted(prev => !prev), [])
  const toggleRecording = useCallback(() => setIsRecording(prev => !prev), [])

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
    <div className="min-h-screen theme-bg" suppressHydrationWarning>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4" suppressHydrationWarning>
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
              onClick={toggleMute}
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

      <div className="max-w-7xl mx-auto p-6" suppressHydrationWarning>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chat Interface */}
          <div className="lg:col-span-3" suppressHydrationWarning>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[600px] flex flex-col">
              {/* Messages - OPTIMIZED with individual MessageItem components */}
              <div className="flex-1 overflow-y-auto p-6" suppressHydrationWarning>
                {messages.map((message, index) => (
                  <MessageItem
                    key={message.id}
                    message={message}
                    isTyping={isTyping}
                    isLatest={index === messages.length - 1}
                    onCopy={handleCopyMessage}
                    onShare={handleShareMessage}
                  />
                ))}

                {isTyping && messages[messages.length - 1]?.content === '' && (
                  <TypingIndicator />
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
                      className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${isLimitReached ? 'bg-gray-100 cursor-not-allowed' : ''
                        }`}
                    />
                  </div>

                  <button
                    onClick={toggleRecording}
                    disabled={isLimitReached}
                    className={`p-3 rounded-lg ${isLimitReached
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
          <div className="lg:col-span-1" suppressHydrationWarning>
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