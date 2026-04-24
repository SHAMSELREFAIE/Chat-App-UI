"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Send,
  Smile,
  Moon,
  Sun,
  Globe,
  Search,
  MoreVertical,
  Phone,
  Video,
  Paperclip,
  Mic,
  ArrowLeft,
  Check,
  CheckCheck,
  X,
  Reply,
  Trash2,
  Copy,
  Forward,
  Image as ImageIcon,
  File,
  Camera,
  MapPin,
  User,
  MicOff,
  PhoneOff,
  VideoOff,
  Volume2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

// Chat background patterns for each chat
const chatBackgrounds = [
  "bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-950/30 dark:to-teal-900/30",
  "bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/30 dark:to-indigo-900/30",
  "bg-gradient-to-br from-rose-50 to-pink-100 dark:from-rose-950/30 dark:to-pink-900/30",
  "bg-gradient-to-br from-amber-50 to-orange-100 dark:from-amber-950/30 dark:to-orange-900/30",
  "bg-gradient-to-br from-violet-50 to-purple-100 dark:from-violet-950/30 dark:to-purple-900/30",
  "bg-gradient-to-br from-cyan-50 to-sky-100 dark:from-cyan-950/30 dark:to-sky-900/30",
  "bg-gradient-to-br from-lime-50 to-green-100 dark:from-lime-950/30 dark:to-green-900/30",
  "bg-gradient-to-br from-fuchsia-50 to-pink-100 dark:from-fuchsia-950/30 dark:to-pink-900/30",
  "bg-gradient-to-br from-stone-50 to-neutral-100 dark:from-stone-950/30 dark:to-neutral-900/30",
  "bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-950/30 dark:to-rose-900/30",
]

// Auto-reply messages
const autoReplies = {
  ar: [
    "شكراً لرسالتك! سأرد عليك قريباً",
    "تمام، فهمت",
    "رائع! سأتابع ذلك",
    "نعم، بالتأكيد",
    "سأرسل لك التفاصيل لاحقاً",
    "ممتاز! شكراً لإخباري",
    "حسناً، موافق",
    "سأكون هناك إن شاء الله",
  ],
  en: [
    "Thanks for your message! I'll reply soon",
    "Okay, got it",
    "Great! I'll follow up on that",
    "Yes, sure",
    "I'll send you the details later",
    "Excellent! Thanks for letting me know",
    "Alright, agreed",
    "I'll be there, God willing",
  ],
}

interface Message {
  id: number
  text: string
  textEn: string
  sender: "me" | "them"
  time: string
  read: boolean
  replyTo?: {
    id: number
    text: string
    textEn: string
    sender: "me" | "them"
  }
  attachment?: {
    type: "image" | "file" | "voice"
    name: string
    url?: string
    duration?: number
  }
}

interface Chat {
  id: number
  name: string
  nameEn: string
  avatar: string
  lastMessage: string
  lastMessageEn: string
  time: string
  unread: number
  online: boolean
  typing: boolean
}

// Mock data with 10 chats
const mockChats: Chat[] = [
  {
    id: 1,
    name: "أحمد محمد",
    nameEn: "Ahmed Mohamed",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=ahmed",
    lastMessage: "مرحباً، كيف حالك اليوم؟",
    lastMessageEn: "Hello, how are you today?",
    time: "10:30",
    unread: 3,
    online: true,
    typing: false,
  },
  {
    id: 2,
    name: "سارة أحمد",
    nameEn: "Sara Ahmed",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sara",
    lastMessage: "شكراً جزيلاً!",
    lastMessageEn: "Thank you very much!",
    time: "09:45",
    unread: 0,
    online: true,
    typing: false,
  },
  {
    id: 3,
    name: "محمد علي",
    nameEn: "Mohamed Ali",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mohamed",
    lastMessage: "سأرسل لك الملف قريباً",
    lastMessageEn: "I will send you the file soon",
    time: "Yesterday",
    unread: 0,
    online: false,
    typing: false,
  },
  {
    id: 4,
    name: "فاطمة حسن",
    nameEn: "Fatma Hassan",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=fatma",
    lastMessage: "اجتماع الغد في الساعة 3",
    lastMessageEn: "Tomorrow's meeting at 3",
    time: "Yesterday",
    unread: 1,
    online: true,
    typing: false,
  },
  {
    id: 5,
    name: "عمر خالد",
    nameEn: "Omar Khaled",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=omar",
    lastMessage: "تمام، موافق على الخطة",
    lastMessageEn: "Ok, agreed on the plan",
    time: "Mon",
    unread: 0,
    online: false,
    typing: false,
  },
  {
    id: 6,
    name: "ليلى محمود",
    nameEn: "Layla Mahmoud",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=layla",
    lastMessage: "صور رائعة من الرحلة!",
    lastMessageEn: "Amazing photos from the trip!",
    time: "Sun",
    unread: 5,
    online: true,
    typing: false,
  },
  {
    id: 7,
    name: "خالد إبراهيم",
    nameEn: "Khaled Ibrahim",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=khaled",
    lastMessage: "هل شاهدت المباراة؟",
    lastMessageEn: "Did you watch the match?",
    time: "Sat",
    unread: 2,
    online: true,
    typing: false,
  },
  {
    id: 8,
    name: "نور الدين",
    nameEn: "Nour Eldeen",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=nour",
    lastMessage: "موعدنا غداً الساعة 5",
    lastMessageEn: "Our appointment is tomorrow at 5",
    time: "Fri",
    unread: 0,
    online: false,
    typing: false,
  },
  {
    id: 9,
    name: "مريم يوسف",
    nameEn: "Mariam Youssef",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=mariam",
    lastMessage: "أرسلت لك الملفات",
    lastMessageEn: "I sent you the files",
    time: "Thu",
    unread: 0,
    online: true,
    typing: false,
  },
  {
    id: 10,
    name: "يوسف عبدالله",
    nameEn: "Yousef Abdullah",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=yousef",
    lastMessage: "شكراً على المساعدة",
    lastMessageEn: "Thanks for the help",
    time: "Wed",
    unread: 0,
    online: false,
    typing: false,
  },
]

const initialMessages: Record<number, Message[]> = {
  1: [
    { id: 1, text: "السلام عليكم", textEn: "Peace be upon you", sender: "them", time: "10:00", read: true },
    { id: 2, text: "وعليكم السلام ورحمة الله", textEn: "And upon you peace and mercy of Allah", sender: "me", time: "10:05", read: true },
    { id: 3, text: "كيف حالك؟", textEn: "How are you?", sender: "them", time: "10:10", read: true },
    { id: 4, text: "الحمد لله، بخير. وأنت؟", textEn: "Praise be to Allah, I'm fine. And you?", sender: "me", time: "10:15", read: true },
    { id: 5, text: "مرحباً، كيف حال�� اليوم؟", textEn: "Hello, how are you today?", sender: "them", time: "10:30", read: false },
  ],
  2: [
    { id: 1, text: "مرحباً سارة!", textEn: "Hello Sara!", sender: "me", time: "09:00", read: true },
    { id: 2, text: "أهلاً وسهلاً", textEn: "Welcome", sender: "them", time: "09:15", read: true },
    { id: 3, text: "هل انتهيتِ من المشروع؟", textEn: "Have you finished the project?", sender: "me", time: "09:30", read: true },
    { id: 4, text: "نعم، تم الانتهاء منه", textEn: "Yes, it's done", sender: "them", time: "09:40", read: true },
    { id: 5, text: "شكراً جزيلاً!", textEn: "Thank you very much!", sender: "them", time: "09:45", read: true },
  ],
  3: [
    { id: 1, text: "هل الملف جاهز؟", textEn: "Is the file ready?", sender: "me", time: "Yesterday", read: true },
    { id: 2, text: "سأرسل لك الملف قريباً", textEn: "I will send you the file soon", sender: "them", time: "Yesterday", read: true },
  ],
  4: [
    { id: 1, text: "متى الاجتماع؟", textEn: "When is the meeting?", sender: "me", time: "Yesterday", read: true },
    { id: 2, text: "اجتماع الغد في الساعة 3", textEn: "Tomorrow's meeting at 3", sender: "them", time: "Yesterday", read: false },
  ],
  5: [
    { id: 1, text: "ما رأيك في الخطة؟", textEn: "What do you think of the plan?", sender: "me", time: "Mon", read: true },
    { id: 2, text: "تمام، موافق على الخطة", textEn: "Ok, agreed on the plan", sender: "them", time: "Mon", read: true },
  ],
  6: [
    { id: 1, text: "شاهدتِ الصور؟", textEn: "Did you see the photos?", sender: "me", time: "Sun", read: true },
    { id: 2, text: "صور رائعة من الرحلة!", textEn: "Amazing photos from the trip!", sender: "them", time: "Sun", read: false },
  ],
  7: [
    { id: 1, text: "المباراة كانت رائعة!", textEn: "The match was amazing!", sender: "them", time: "Sat", read: true },
    { id: 2, text: "هل شاهدت المباراة؟", textEn: "Did you watch the match?", sender: "them", time: "Sat", read: false },
  ],
  8: [
    { id: 1, text: "موعدنا غداً الساعة 5", textEn: "Our appointment is tomorrow at 5", sender: "them", time: "Fri", read: true },
  ],
  9: [
    { id: 1, text: "أرسلت لك الملفات", textEn: "I sent you the files", sender: "them", time: "Thu", read: true },
    { id: 2, text: "شكراً مريم", textEn: "Thanks Mariam", sender: "me", time: "Thu", read: true },
  ],
  10: [
    { id: 1, text: "شكراً على المساعدة", textEn: "Thanks for the help", sender: "them", time: "Wed", read: true },
    { id: 2, text: "عفواً، في أي وقت", textEn: "You're welcome, anytime", sender: "me", time: "Wed", read: true },
  ],
}

const emojis = ["😀", "😂", "😍", "🥰", "😎", "🤔", "👍", "❤️", "🔥", "✨", "🎉", "💪", "🙏", "👋", "💯", "🌟", "😢", "😡", "🤣", "😊", "🥺", "😘", "🤗", "😴", "🤝", "👏", "🎊", "💐", "🌹", "☕", "🍕", "🎮"]

export default function ChatApp() {
  const [isDark, setIsDark] = useState(false)
  const [isArabic, setIsArabic] = useState(true)
  const [selectedChat, setSelectedChat] = useState<number | null>(null)
  const [messages, setMessages] = useState(initialMessages)
  const [chats, setChats] = useState(mockChats)
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [showMobileChat, setShowMobileChat] = useState(false)
  const [replyingTo, setReplyingTo] = useState<Message | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [showCallDialog, setShowCallDialog] = useState<"voice" | "video" | null>(null)
  const [callDuration, setCallDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [copiedMessageId, setCopiedMessageId] = useState<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const recordingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const callIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [isDark])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, selectedChat])

  // Recording timer
  useEffect(() => {
    if (isRecording) {
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } else {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
      setRecordingTime(0)
    }
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
    }
  }, [isRecording])

  // Call timer
  useEffect(() => {
    if (showCallDialog) {
      callIntervalRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1)
      }, 1000)
    } else {
      if (callIntervalRef.current) {
        clearInterval(callIntervalRef.current)
      }
      setCallDuration(0)
    }
    return () => {
      if (callIntervalRef.current) {
        clearInterval(callIntervalRef.current)
      }
    }
  }, [showCallDialog])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const simulateAutoReply = useCallback((chatId: number) => {
    // Set typing indicator
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId ? { ...chat, typing: true } : chat
      )
    )

    // Send reply after delay
    setTimeout(() => {
      const replies = isArabic ? autoReplies.ar : autoReplies.en
      const randomReply = replies[Math.floor(Math.random() * replies.length)]
      const currentTime = new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })

      const newMsg: Message = {
        id: Date.now(),
        text: isArabic ? randomReply : randomReply,
        textEn: isArabic ? randomReply : randomReply,
        sender: "them",
        time: currentTime,
        read: false,
      }

      setMessages((prev) => ({
        ...prev,
        [chatId]: [...(prev[chatId] || []), newMsg],
      }))

      // Update chat list
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                typing: false,
                lastMessage: randomReply,
                lastMessageEn: randomReply,
                time: currentTime,
                unread: selectedChat === chatId ? 0 : chat.unread + 1,
              }
            : chat
        )
      )
    }, 1500 + Math.random() * 2000)
  }, [isArabic, selectedChat])

  const handleSendMessage = () => {
    if (!newMessage.trim() || selectedChat === null) return

    const currentTime = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })

    const newMsg: Message = {
      id: Date.now(),
      text: newMessage,
      textEn: newMessage,
      sender: "me",
      time: currentTime,
      read: false,
      replyTo: replyingTo
        ? {
            id: replyingTo.id,
            text: replyingTo.text,
            textEn: replyingTo.textEn,
            sender: replyingTo.sender,
          }
        : undefined,
    }

    setMessages((prev) => ({
      ...prev,
      [selectedChat]: [...(prev[selectedChat] || []), newMsg],
    }))

    // Update chat last message
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === selectedChat
          ? { ...chat, lastMessage: newMessage, lastMessageEn: newMessage, time: currentTime }
          : chat
      )
    )

    setNewMessage("")
    setReplyingTo(null)

    // Simulate auto-reply
    simulateAutoReply(selectedChat)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const addEmoji = (emoji: string) => {
    setNewMessage((prev) => prev + emoji)
  }

  const handleFileSelect = (type: "image" | "file") => {
    if (selectedChat === null) return

    const currentTime = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })

    const fileName = type === "image" ? "photo.jpg" : "document.pdf"
    const msgText = type === "image" 
      ? (isArabic ? "صورة" : "Photo")
      : (isArabic ? "ملف" : "File")

    const newMsg: Message = {
      id: Date.now(),
      text: msgText,
      textEn: msgText,
      sender: "me",
      time: currentTime,
      read: false,
      attachment: {
        type: type,
        name: fileName,
      },
    }

    setMessages((prev) => ({
      ...prev,
      [selectedChat]: [...(prev[selectedChat] || []), newMsg],
    }))

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === selectedChat
          ? { ...chat, lastMessage: msgText, lastMessageEn: msgText, time: currentTime }
          : chat
      )
    )

    simulateAutoReply(selectedChat)
  }

  const handleVoiceRecord = () => {
    if (isRecording) {
      // Stop recording and send voice message
      if (selectedChat !== null && recordingTime > 0) {
        const currentTime = new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })

        const msgText = isArabic ? "رسالة صوتية" : "Voice message"

        const newMsg: Message = {
          id: Date.now(),
          text: msgText,
          textEn: msgText,
          sender: "me",
          time: currentTime,
          read: false,
          attachment: {
            type: "voice",
            name: "voice_message.ogg",
            duration: recordingTime,
          },
        }

        setMessages((prev) => ({
          ...prev,
          [selectedChat]: [...(prev[selectedChat] || []), newMsg],
        }))

        setChats((prev) =>
          prev.map((chat) =>
            chat.id === selectedChat
              ? { ...chat, lastMessage: msgText, lastMessageEn: msgText, time: currentTime }
              : chat
          )
        )

        simulateAutoReply(selectedChat)
      }
      setIsRecording(false)
    } else {
      setIsRecording(true)
    }
  }

  const handleCopyMessage = (message: Message) => {
    const textToCopy = isArabic ? message.text : message.textEn
    navigator.clipboard.writeText(textToCopy)
    setCopiedMessageId(message.id)
    setTimeout(() => setCopiedMessageId(null), 2000)
  }

  const handleDeleteMessage = (messageId: number) => {
    if (selectedChat === null) return
    setMessages((prev) => ({
      ...prev,
      [selectedChat]: prev[selectedChat].filter((msg) => msg.id !== messageId),
    }))
  }

  const handleForwardMessage = (message: Message) => {
    // For demo, show alert
    alert(isArabic ? "تم تحديد الرسالة للإعادة توجيه" : "Message selected for forwarding")
  }

  const filteredChats = chats.filter((chat) =>
    isArabic
      ? chat.name.includes(searchQuery)
      : chat.nameEn.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const selectedChatData = chats.find((c) => c.id === selectedChat)
  const currentMessages = selectedChat ? messages[selectedChat] || [] : []
  const chatBgIndex = selectedChat ? (selectedChat - 1) % chatBackgrounds.length : 0

  const handleChatSelect = (chatId: number) => {
    setSelectedChat(chatId)
    setShowMobileChat(true)
    // Clear unread count
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId ? { ...chat, unread: 0 } : chat
      )
    )
  }

  const handleBackToList = () => {
    setShowMobileChat(false)
    setSelectedChat(null)
    setReplyingTo(null)
  }

  const endCall = () => {
    setShowCallDialog(null)
    setIsMuted(false)
    setIsVideoOff(false)
  }

  return (
    <div
      className={cn(
        "h-dvh w-full flex transition-colors duration-500 overflow-hidden",
        "font-sans"
      )}
      dir={isArabic ? "rtl" : "ltr"}
    >
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*,.pdf,.doc,.docx"
        onChange={() => {}}
      />

      {/* Call Dialog */}
      <Dialog open={showCallDialog !== null} onOpenChange={() => endCall()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">
              {showCallDialog === "video"
                ? isArabic ? "مكالمة فيديو" : "Video Call"
                : isArabic ? "مكالمة صوتية" : "Voice Call"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-6">
            <Avatar className="h-24 w-24 ring-4 ring-emerald-500">
              <AvatarImage src={selectedChatData?.avatar} />
              <AvatarFallback className="text-2xl">{selectedChatData?.name[0]}</AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h3 className="text-lg font-semibold">
                {isArabic ? selectedChatData?.name : selectedChatData?.nameEn}
              </h3>
              <p className="text-sm text-muted-foreground">
                {formatTime(callDuration)}
              </p>
            </div>
            {showCallDialog === "video" && (
              <div className="w-full h-32 bg-muted rounded-lg flex items-center justify-center">
                {isVideoOff ? (
                  <VideoOff className="h-12 w-12 text-muted-foreground" />
                ) : (
                  <Camera className="h-12 w-12 text-muted-foreground animate-pulse" />
                )}
              </div>
            )}
            <div className="flex items-center gap-4">
              <Button
                variant={isMuted ? "destructive" : "outline"}
                size="icon"
                className="h-12 w-12 rounded-full"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>
              {showCallDialog === "video" && (
                <Button
                  variant={isVideoOff ? "destructive" : "outline"}
                  size="icon"
                  className="h-12 w-12 rounded-full"
                  onClick={() => setIsVideoOff(!isVideoOff)}
                >
                  {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
                </Button>
              )}
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-full"
              >
                <Volume2 className="h-5 w-5" />
              </Button>
              <Button
                variant="destructive"
                size="icon"
                className="h-12 w-12 rounded-full"
                onClick={endCall}
              >
                <PhoneOff className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: isArabic ? 100 : -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className={cn(
          "w-full md:w-80 lg:w-96 bg-card border-border flex flex-col h-full min-h-0",
          isArabic ? "border-l md:border-l" : "border-r md:border-r",
          showMobileChat ? "hidden md:flex" : "flex"
        )}
      >
        {/* Header */}
        <div className="p-3 sm:p-4 border-b border-border bg-card/80 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h1 className="text-lg sm:text-xl font-bold text-foreground">
              {isArabic ? "المحادثات" : "Chats"}
            </h1>
            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsArabic(!isArabic)}
                className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-accent transition-all duration-300 hover:scale-105"
                title={isArabic ? "Switch to English" : "التبديل إلى العربية"}
              >
                <Globe className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsDark(!isDark)}
                className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-accent transition-all duration-300 hover:scale-105"
                title={isDark ? (isArabic ? "الوضع الفاتح" : "Light Mode") : (isArabic ? "الوضع الداكن" : "Dark Mode")}
              >
                <motion.div
                  initial={false}
                  animate={{ rotate: isDark ? 180 : 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {isDark ? <Sun className="h-4 w-4 sm:h-5 sm:w-5" /> : <Moon className="h-4 w-4 sm:h-5 sm:w-5" />}
                </motion.div>
              </Button>
            </div>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className={cn(
              "absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground",
              isArabic ? "right-3" : "left-3"
            )} />
            <Input
              placeholder={isArabic ? "بحث..." : "Search..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "bg-secondary/50 border-0 text-sm sm:text-base",
                isArabic ? "pr-10 pl-3" : "pl-10 pr-3"
              )}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 h-6 w-6",
                  isArabic ? "left-2" : "right-2"
                )}
                onClick={() => setSearchQuery("")}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Chat List */}
        <ScrollArea className="flex-1 min-h-0">
          <AnimatePresence>
            {filteredChats.map((chat, index) => (
              <motion.div
                key={chat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => handleChatSelect(chat.id)}
                className={cn(
                  "flex items-center gap-3 p-3 sm:p-4 cursor-pointer transition-all duration-300",
                  "hover:bg-accent/50 active:scale-[0.98]",
                  selectedChat === chat.id && "bg-accent"
                )}
              >
                <div className="relative flex-shrink-0">
                  <Avatar className="h-10 w-10 sm:h-12 sm:w-12 ring-2 ring-background shadow-md">
                    <AvatarImage src={chat.avatar} />
                    <AvatarFallback>{chat.name[0]}</AvatarFallback>
                  </Avatar>
                  {chat.online && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-emerald-500 rounded-full ring-2 ring-background"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                    <span className="font-semibold text-sm sm:text-base text-foreground truncate">
                      {isArabic ? chat.name : chat.nameEn}
                    </span>
                    <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                      {chat.time}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs sm:text-sm text-muted-foreground truncate flex-1">
                      {chat.typing ? (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-emerald-500 font-medium"
                        >
                          {isArabic ? "يكتب..." : "typing..."}
                        </motion.span>
                      ) : isArabic ? (
                        chat.lastMessage
                      ) : (
                        chat.lastMessageEn
                      )}
                    </p>
                    {chat.unread > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500 }}
                      >
                        <Badge className="bg-emerald-500 text-white hover:bg-emerald-600 h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center rounded-full p-0 text-xs ml-2">
                          {chat.unread}
                        </Badge>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {filteredChats.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              {isArabic ? "لا توجد محادثات" : "No chats found"}
            </div>
          )}
        </ScrollArea>
      </motion.aside>

      {/* Chat Area */}
      <main
        className={cn(
          "flex-1 flex flex-col h-full min-h-0 min-w-0",
          !selectedChat && !showMobileChat && "hidden md:flex",
          showMobileChat ? "flex" : "hidden md:flex"
        )}
      >
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <motion.header
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="p-3 sm:p-4 border-b border-border bg-card/80 backdrop-blur-sm flex items-center justify-between flex-shrink-0"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBackToList}
                  className="md:hidden h-8 w-8"
                >
                  <ArrowLeft className={cn("h-5 w-5", isArabic && "rotate-180")} />
                </Button>
                <Avatar className="h-9 w-9 sm:h-10 sm:w-10 ring-2 ring-background shadow-md">
                  <AvatarImage src={selectedChatData?.avatar} />
                  <AvatarFallback>{selectedChatData?.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-semibold text-sm sm:text-base text-foreground">
                    {isArabic ? selectedChatData?.name : selectedChatData?.nameEn}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {selectedChatData?.typing ? (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-emerald-500"
                      >
                        {isArabic ? "يكتب..." : "typing..."}
                      </motion.span>
                    ) : selectedChatData?.online ? (
                      <span className="text-emerald-500">{isArabic ? "متصل" : "Online"}</span>
                    ) : (
                      <span>{isArabic ? "غير متصل" : "Offline"}</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-0.5 sm:gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-accent transition-all duration-300 hover:scale-105"
                  onClick={() => setShowCallDialog("video")}
                  title={isArabic ? "مكالمة فيديو" : "Video Call"}
                >
                  <Video className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-accent transition-all duration-300 hover:scale-105"
                  onClick={() => setShowCallDialog("voice")}
                  title={isArabic ? "مكالمة صوتية" : "Voice Call"}
                >
                  <Phone className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-accent transition-all duration-300 hover:scale-105"
                    >
                      <MoreVertical className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align={isArabic ? "start" : "end"}>
                    <DropdownMenuItem>
                      <User className="h-4 w-4 mr-2" />
                      {isArabic ? "عرض الملف الشخصي" : "View Profile"}
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Search className="h-4 w-4 mr-2" />
                      {isArabic ? "بحث في المحادثة" : "Search in Chat"}
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <ImageIcon className="h-4 w-4 mr-2" />
                      {isArabic ? "الوسائط والملفات" : "Media & Files"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      {isArabic ? "حذف المحادثة" : "Delete Chat"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </motion.header>

            {/* Messages */}
            <ScrollArea className={cn("flex-1 min-h-0", chatBackgrounds[chatBgIndex])}>
              <div className="space-y-3 sm:space-y-4 max-w-4xl mx-auto p-3 sm:p-4 pb-4">
                <AnimatePresence>
                  {currentMessages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: index * 0.03, type: "spring", stiffness: 300 }}
                      className={cn(
                        "flex group",
                        message.sender === "me"
                          ? isArabic ? "justify-start" : "justify-end"
                          : isArabic ? "justify-end" : "justify-start"
                      )}
                    >
                      <div className="flex items-end gap-1 max-w-[85%] sm:max-w-[70%]">
                        {/* Message Actions - Before message for sent messages */}
                        {message.sender === "me" && !isArabic && (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 mb-6">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => setReplyingTo(message)}
                            >
                              <Reply className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleCopyMessage(message)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleDeleteMessage(message.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        )}

                        {/* Message Actions - Before message for received messages in RTL */}
                        {message.sender === "them" && isArabic && (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 mb-6">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => setReplyingTo(message)}
                            >
                              <Reply className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleCopyMessage(message)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleForwardMessage(message)}
                            >
                              <Forward className="h-3 w-3" />
                            </Button>
                          </div>
                        )}

                        <motion.div
                          whileHover={{ scale: 1.01 }}
                          className={cn(
                            "rounded-2xl px-3 sm:px-4 py-2 shadow-md relative",
                            message.sender === "me"
                              ? "bg-emerald-500 text-white rounded-bl-none"
                              : "bg-card text-foreground rounded-br-none"
                          )}
                        >
                          {/* Reply Preview */}
                          {message.replyTo && (
                            <div
                              className={cn(
                                "mb-2 p-2 rounded-lg text-xs border-l-2",
                                message.sender === "me"
                                  ? "bg-emerald-600/50 border-white/50"
                                  : "bg-muted border-emerald-500"
                              )}
                            >
                              <span className="font-semibold block">
                                {message.replyTo.sender === "me"
                                  ? isArabic ? "أنت" : "You"
                                  : isArabic ? selectedChatData?.name : selectedChatData?.nameEn}
                              </span>
                              <span className="opacity-80 line-clamp-1">
                                {isArabic ? message.replyTo.text : message.replyTo.textEn}
                              </span>
                            </div>
                          )}

                          {/* Attachment */}
                          {message.attachment && (
                            <div className="mb-2">
                              {message.attachment.type === "image" && (
                                <div className="w-48 h-32 bg-black/20 rounded-lg flex items-center justify-center">
                                  <ImageIcon className="h-8 w-8 opacity-50" />
                                </div>
                              )}
                              {message.attachment.type === "file" && (
                                <div className="flex items-center gap-2 p-2 bg-black/10 rounded-lg">
                                  <File className="h-6 w-6" />
                                  <span className="text-sm">{message.attachment.name}</span>
                                </div>
                              )}
                              {message.attachment.type === "voice" && (
                                <div className="flex items-center gap-2 p-2 bg-black/10 rounded-lg min-w-[150px]">
                                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                                    <Mic className="h-4 w-4" />
                                  </Button>
                                  <div className="flex-1 h-1 bg-white/30 rounded-full">
                                    <div className="w-1/3 h-full bg-white rounded-full" />
                                  </div>
                                  <span className="text-xs">
                                    {formatTime(message.attachment.duration || 0)}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Message Text */}
                          {!message.attachment && (
                            <p className="text-sm sm:text-base leading-relaxed">
                              {isArabic ? message.text : message.textEn}
                            </p>
                          )}

                          {/* Time and Status */}
                          <div className={cn(
                            "flex items-center gap-1 mt-1",
                            message.sender === "me"
                              ? isArabic ? "justify-start" : "justify-end"
                              : isArabic ? "justify-end" : "justify-start"
                          )}>
                            <span className={cn(
                              "text-[10px] sm:text-xs",
                              message.sender === "me" ? "text-emerald-100" : "text-muted-foreground"
                            )}>
                              {message.time}
                            </span>
                            {message.sender === "me" && (
                              message.read ? (
                                <CheckCheck className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-200" />
                              ) : (
                                <Check className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-200" />
                              )
                            )}
                          </div>

                          {/* Copied indicator */}
                          {copiedMessageId === message.id && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                              className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background px-2 py-1 rounded text-xs"
                            >
                              {isArabic ? "تم النسخ" : "Copied!"}
                            </motion.div>
                          )}
                        </motion.div>

                        {/* Message Actions - After message for received messages */}
                        {message.sender === "them" && !isArabic && (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 mb-6">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => setReplyingTo(message)}
                            >
                              <Reply className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleCopyMessage(message)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleForwardMessage(message)}
                            >
                              <Forward className="h-3 w-3" />
                            </Button>
                          </div>
                        )}

                        {/* Message Actions - After message for sent messages in RTL */}
                        {message.sender === "me" && isArabic && (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 mb-6">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => setReplyingTo(message)}
                            >
                              <Reply className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleCopyMessage(message)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleDeleteMessage(message.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Reply Preview */}
            <AnimatePresence>
              {replyingTo && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-border bg-card/80 backdrop-blur-sm overflow-hidden flex-shrink-0"
                >
                  <div className="p-2 sm:p-3 flex items-center gap-2">
                    <div className="flex-1 border-l-2 border-emerald-500 pl-3">
                      <span className="text-xs font-semibold text-emerald-500 block">
                        {replyingTo.sender === "me"
                          ? isArabic ? "الرد على نفسك" : "Replying to yourself"
                          : isArabic ? `الرد على ${selectedChatData?.name}` : `Replying to ${selectedChatData?.nameEn}`}
                      </span>
                      <span className="text-sm text-muted-foreground line-clamp-1">
                        {isArabic ? replyingTo.text : replyingTo.textEn}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 flex-shrink-0"
                      onClick={() => setReplyingTo(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Recording Indicator */}
            <AnimatePresence>
              {isRecording && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-border bg-destructive/10 overflow-hidden flex-shrink-0"
                >
                  <div className="p-2 sm:p-3 flex items-center justify-center gap-3">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="w-3 h-3 rounded-full bg-destructive"
                    />
                    <span className="text-sm font-medium text-destructive">
                      {isArabic ? "جاري التسجيل" : "Recording"} {formatTime(recordingTime)}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input Area */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="p-2 sm:p-4 border-t border-border bg-card/80 backdrop-blur-sm flex-shrink-0"
            >
              <div className="flex items-center gap-1 sm:gap-2 max-w-4xl mx-auto">
                {/* Emoji Picker */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 sm:h-10 sm:w-10 hover:bg-accent transition-all duration-300 hover:scale-105 flex-shrink-0"
                    >
                      <Smile className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 sm:w-80 p-2 sm:p-3" align={isArabic ? "end" : "start"}>
                    <div className="grid grid-cols-8 gap-1 sm:gap-2">
                      {emojis.map((emoji) => (
                        <motion.button
                          key={emoji}
                          whileHover={{ scale: 1.3 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => addEmoji(emoji)}
                          className="text-lg sm:text-2xl p-1 hover:bg-accent rounded transition-colors"
                        >
                          {emoji}
                        </motion.button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Attachment Menu */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 sm:h-10 sm:w-10 hover:bg-accent transition-all duration-300 hover:scale-105 flex-shrink-0"
                    >
                      <Paperclip className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-2" align={isArabic ? "end" : "start"}>
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        className="justify-start gap-2"
                        onClick={() => handleFileSelect("image")}
                      >
                        <ImageIcon className="h-4 w-4 text-blue-500" />
                        {isArabic ? "صورة" : "Photo"}
                      </Button>
                      <Button
                        variant="ghost"
                        className="justify-start gap-2"
                        onClick={() => handleFileSelect("file")}
                      >
                        <File className="h-4 w-4 text-purple-500" />
                        {isArabic ? "ملف" : "Document"}
                      </Button>
                      <Button
                        variant="ghost"
                        className="justify-start gap-2"
                        onClick={() => {}}
                      >
                        <Camera className="h-4 w-4 text-pink-500" />
                        {isArabic ? "كاميرا" : "Camera"}
                      </Button>
                      <Button
                        variant="ghost"
                        className="justify-start gap-2"
                        onClick={() => {}}
                      >
                        <MapPin className="h-4 w-4 text-green-500" />
                        {isArabic ? "موقع" : "Location"}
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Message Input */}
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={isArabic ? "اكتب رسالة..." : "Type a message..."}
                  className="flex-1 bg-secondary/50 border-0 text-sm sm:text-base h-9 sm:h-10"
                  disabled={isRecording}
                />

                {/* Send or Voice Button */}
                {newMessage.trim() ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500 }}
                  >
                    <Button
                      onClick={handleSendMessage}
                      size="icon"
                      className="h-8 w-8 sm:h-10 sm:w-10 bg-emerald-500 hover:bg-emerald-600 transition-all duration-300 hover:scale-105 flex-shrink-0"
                    >
                      <Send className={cn("h-4 w-4 sm:h-5 sm:w-5", isArabic && "rotate-180")} />
                    </Button>
                  </motion.div>
                ) : (
                  <Button
                    variant={isRecording ? "destructive" : "ghost"}
                    size="icon"
                    className={cn(
                      "h-8 w-8 sm:h-10 sm:w-10 transition-all duration-300 hover:scale-105 flex-shrink-0",
                      isRecording && "animate-pulse"
                    )}
                    onClick={handleVoiceRecord}
                  >
                    {isRecording ? (
                      <X className="h-4 w-4 sm:h-5 sm:w-5" />
                    ) : (
                      <Mic className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                    )}
                  </Button>
                )}
              </div>
            </motion.div>
          </>
        ) : (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex items-center justify-center bg-gradient-to-br from-muted/20 to-muted/40"
          >
            <div className="text-center p-4">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 rounded-full bg-emerald-500/20 flex items-center justify-center"
              >
                <Send className="h-8 w-8 sm:h-12 sm:w-12 text-emerald-500" />
              </motion.div>
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
                {isArabic ? "مرحباً بك في المحادثات" : "Welcome to Chats"}
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground max-w-xs mx-auto">
                {isArabic
                  ? "اختر محادثة من القائمة لبدء المراسلة"
                  : "Select a chat from the list to start messaging"}
              </p>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  )
}
