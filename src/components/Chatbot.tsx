import React, { useState, useRef } from 'react';
import { MessageCircle, X, Send, Image as ImageIcon, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ChatMessage {
  text: string;
  isBot: boolean;
  image?: string;
  isEscalated?: boolean;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      text: "Hi! How can I help you today? I'm your Food Fix support assistant. I can answer policy questions or help you resolve food quality issues.",
      isBot: true,
    },
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSend = async () => {
    if (!message.trim() && !image) return;

    const userMessage = message;
    const userImage = image;

    // Add user message to state
    setMessages((prev) => [
      ...prev,
      { text: userMessage || "Sent an image for verification", isBot: false, image: userImage || undefined },
    ]);
    setMessage('');
    setImage(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: userMessage || "Please check this food image.",
          history: messages.slice(-10), // Send last 10 messages for conversation context
          image: userImage,
        }),
      });

      const responseText = await response.text();
      let data: any = null;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        // Response was not JSON (could be direct text or HTML error page)
      }

      if (response.ok && data) {
        // Use backend's explicit isEscalated value. Fallback to a precise check only if undefined.
        const isEscalated = typeof data.isEscalated === 'boolean'
          ? data.isEscalated
          : ((data.text || "").toLowerCase().includes("routing you to a human") || 
             (data.text || "").toLowerCase().includes("transferring you to a human agent") ||
             (data.text || "").toLowerCase().includes("escalating to our human support team"));

        setMessages((prev) => [
          ...prev,
          {
            text: data.text,
            isBot: true,
            isEscalated: isEscalated,
          },
        ]);
      } else {
        const errorDetails = data ? (data.details || data.error) : `HTTP ${response.status}: ${responseText.slice(0, 150)}`;
        setMessages((prev) => [
          ...prev,
          {
            text: `Support Service Error: ${errorDetails || "We encountered an unexpected response from the support model."}`,
            isBot: true,
          },
        ]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          text: `Technical Connection Failed: ${err.message || err || "Please make sure your server is booted and check your API keys."}`,
          isBot: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      {/* Heavy brutalist launcher button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05, rotate: 2 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-8 right-8 p-5 bg-yellow-300 text-zinc-900 rounded-2xl border-3 border-zinc-900 shadow-[4px_4px_0px_0px_#18181b] z-50 hover:shadow-[6px_6px_0px_0px_#18181b] transition-all cursor-pointer flex items-center justify-center"
      >
        {isOpen ? <X size={28} className="stroke-[2.5px]" /> : <MessageCircle size={28} className="stroke-[2.5px]" />}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            className="fixed inset-4 sm:bottom-28 sm:right-8 sm:inset-auto sm:w-96 sm:h-[480px] bg-white border-3 border-zinc-900 rounded-[28px] shadow-[8px_8px_0px_0px_#18181b] z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-5 border-b-3 border-zinc-900 flex justify-between items-center bg-zinc-900 text-white">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-ping" />
                <h3 className="font-black text-lg uppercase tracking-tight">Food Fix Support</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
              >
                <X size={20} className="stroke-[2.5px]" />
              </button>
            </div>

            {/* Conversation Flow */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-zinc-50">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col gap-1 max-w-[85%] ${msg.isBot ? 'mr-auto' : 'ml-auto items-end'}`}
                >
                  <div
                    className={`p-4 border-2.5 border-zinc-900 shadow-[3px_3px_0px_0px_rgba(24,24,27,1)] text-sm font-medium ${
                      msg.isBot
                        ? 'bg-zinc-100 text-zinc-900 rounded-[20px] rounded-tl-none'
                        : 'bg-orange-500 text-zinc-950 rounded-[20px] rounded-tr-none'
                    }`}
                  >
                    {/* User message uploaded image preview */}
                    {msg.image && (
                      <div className="mb-2 border-2 border-zinc-900 rounded-lg overflow-hidden max-h-32 bg-white">
                        <img src={msg.image} alt="Uploaded attachment" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <span className="whitespace-pre-wrap">{msg.text}</span>
                  </div>

                  {/* Escalated/Human support tag */}
                  {msg.isEscalated && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-100 border-2 border-zinc-900 text-zinc-900 font-extrabold text-[10px] uppercase rounded-full shadow-[2px_2px_0px_0px_rgba(24,24,27,1)] mt-1 animate-pulse">
                      <AlertCircle size={10} className="stroke-[3px]" /> Escalated to Human Agent
                    </span>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-2 text-zinc-500 font-extrabold text-xs uppercase tracking-wider ml-1 mt-2">
                  <Loader2 size={16} className="animate-spin stroke-zinc-900 stroke-[2.5px]" />
                  <span>Support Bot is inspecting...</span>
                </div>
              )}
            </div>

            {/* Footer with rich controls */}
            <div className="p-4 border-t-3 border-zinc-900 bg-white flex flex-col gap-3">
              {/* Image Preview inside footer before sending */}
              {image && (
                <div className="relative inline-flex items-center border-2 border-zinc-900 p-2 rounded-xl bg-orange-100 gap-2 self-start max-w-full">
                  <div className="relative w-12 h-12 border-2 border-zinc-900 rounded-md overflow-hidden bg-white">
                    <img src={image} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-xs font-black uppercase text-zinc-900 truncate max-w-[140px]">Attached Photo</span>
                  <button
                    onClick={() => setImage(null)}
                    className="p-1 bg-zinc-900 text-white rounded-full hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    <X size={12} className="stroke-[3px]" />
                  </button>
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  className="hidden"
                />

                {/* Styled brutalist image upload button */}
                <button
                  onClick={triggerFileInput}
                  disabled={isLoading}
                  title="Upload Food Image"
                  className="bg-yellow-300 text-zinc-900 p-3.5 border-2.5 border-zinc-900 rounded-2xl shadow-[3px_3px_0px_0px_rgba(24,24,27,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_rgba(24,24,27,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer flex items-center justify-center disabled:opacity-50"
                >
                  <ImageIcon size={18} className="stroke-zinc-900 stroke-[2.5px]" />
                </button>

                <input
                  type="text"
                  placeholder="Ask a policy or reporting issue..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  disabled={isLoading}
                  className="flex-1 bg-zinc-50 border-2.5 border-zinc-900 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:bg-white text-zinc-900 placeholder-zinc-500"
                />

                <button
                  onClick={handleSend}
                  disabled={isLoading || (!message.trim() && !image)}
                  className="bg-orange-500 text-zinc-900 p-3.5 border-2.5 border-zinc-900 rounded-2xl shadow-[3px_3px_0px_0px_rgba(24,24,27,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_rgba(24,24,27,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer flex items-center justify-center disabled:opacity-50"
                >
                  <Send size={18} className="stroke-zinc-900 stroke-[2.5px]" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
