// ActivityPanel.jsx
import { useEffect, useRef, useState } from "react";
import { sendMessage } from "../api/report.api";
import { playNotificationSound } from "../utils/playSound";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs
} from "firebase/firestore";
import { db } from "../pages/firebase";
import AppLoader from "./AppLoader";

// ── Helpers ──────────────────────────────────────────────────────────────────

const formatTime = (ts) => {
  if (!ts) return "";
  try {
    const date = ts?.toDate ? ts.toDate() : new Date(ts);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
};

const SendIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

const SpinIcon = () => (
  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

// ── Sub-components ──────────────────────────────────────────────────────────

const EmptyMessages = () => (
  <div className="flex flex-col items-center justify-center h-full text-center py-10 px-6">
    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mb-3">
      <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
      </svg>
    </div>
    <p className="text-xs font-semibold text-slate-400">No messages yet</p>
    <p className="text-xs text-slate-300 mt-0.5">Start the conversation below</p>
  </div>
);

const NoCase = () => (
  <div className="flex flex-col items-center justify-center h-full text-center px-6">
    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
      <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    </div>
    <p className="text-sm font-semibold text-slate-400">Activity Feed</p>
    <p className="text-xs text-slate-300 mt-1">Select a case to view messages</p>
  </div>
);

// ── Main Component ───────────────────────────────────────────────────────────

export default function ActivityPanel({ caseData }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const prevCountRef = useRef(0);
  const bottomRef = useRef(null);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const isResolved = caseData?.status === "resolved";


  useEffect(() => {
    if (!caseData?.caseId) return;

    let unsubscribe;

    const setupRealtime = async () => {
      setMessagesLoading(true);

      try {
        const q = query(
          collection(db, "report"),
          where("caseId", "==", caseData.caseId)
        );

        const snap = await getDocs(q);

        if (snap.empty) {
          setMessages([]);
          setMessagesLoading(false);
          return;
        }

        const reportDoc = snap.docs[0];

        const msgQuery = query(
          collection(db, "report", reportDoc.id, "messages"),
          orderBy("createdAt", "asc")
        );

        unsubscribe = onSnapshot(msgQuery, (msgSnap) => {
          const realtimeMessages = msgSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));

          if (realtimeMessages.length > prevCountRef.current) {
            const lastMessage =
              realtimeMessages[realtimeMessages.length - 1];

            const isFromWorker =
              lastMessage.senderRole === "caseworker" ||
              lastMessage.senderRole === "admin";

            if (!isFromWorker) {
              playNotificationSound();
            }
          }

          prevCountRef.current = realtimeMessages.length;

          setMessages(realtimeMessages);

          // stop loading after first realtime response
          setMessagesLoading(false);
        });

      } catch (err) {
        console.error("Realtime error:", err);
        setMessagesLoading(false);
      }
    };

    setupRealtime();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [caseData]);

  // ─── SEND MESSAGE (logic unchanged) ──────────────────────────────────────
  const handleSend = async () => {
    if (caseData?.status === "resolved") {
      return;
    }
    console.log(caseData.caseId);
    if (!text.trim()) return;

    setLoading(true);

    try {
      await sendMessage({
        caseId: caseData.caseId,
        message: text,
      });
      setText("");
    } catch (err) {
      console.error(err);
      
    } finally {
      setLoading(false);
    }
  };
  
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  const isClaimed = !!caseData?.assignment?.individualId;

  // ─── No case selected ────────────────────────────────────────────────────
  if (!caseData) return <NoCase />;

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 py-3.5 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-800 leading-none">Activity</h3>
            <p className="text-[10px] text-slate-400 font-mono mt-1">#{caseData.caseId}</p>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700
            bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            Live
          </div>
        </div>
      </div>

      {/* Message Thread */}
      {/* Message Thread */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3 bg-slate-50">

        {!isClaimed ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">

            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mb-4">
              <svg
                className="w-7 h-7 text-amber-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            <h3 className="text-sm font-semibold text-slate-700">
              Awaiting Case Assignment
            </h3>

            <p className="text-xs text-slate-400 mt-2 max-w-xs leading-relaxed">
              This case has not yet been claimed by a caseworker.
              Messaging will become available once a responder accepts the case.
            </p>

          </div>
        ) : (
          <>
              {/* Loading State */}
              {messagesLoading && (
                <AppLoader
                  title="Loading Messages"
                  subtitle="Connecting to activity feed..."
                />
              )}

              {/* Empty State */}
              {!messagesLoading && messages.length === 0 && (
                <EmptyMessages />
              )}

            {messages.map((msg, i) => {
              if (!msg) return null;
              const isWorker =
                msg.senderRole === "caseworker" ||
                msg.senderRole === "admin";
              const time = formatTime(msg.createdAt);

              return (
                <div
                  key={msg.id || i}
                  className={`flex ${isWorker ? "justify-end" : "justify-start"}`}
                >
                  <div className="max-w-[80%]">
                    {/* Bubble */}
                    <div
                      className={`px-3.5 py-2.5 text-sm leading-relaxed shadow-sm
                    ${isWorker
                          ? "bg-blue-600 text-white rounded-2xl rounded-br-md"
                          : "bg-white border border-slate-200 text-slate-700 rounded-2xl rounded-bl-md"
                        }`}
                    >
                      {msg.message || ""}
                    </div>

                    {/* Meta: role + time */}
                    <div className={`flex items-center gap-1.5 mt-1 px-1
                  ${isWorker ? "justify-end" : "justify-start"}`}>
                      <span className="text-[10px] text-slate-400 font-medium capitalize">
                        {msg.senderRole}
                      </span>
                      {time && (
                        <>
                          <span className="text-[10px] text-slate-300">·</span>
                          <span className="text-[10px] text-slate-400 font-mono">{time}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Input Area */}
      {isClaimed && (
        <div className="border-t border-slate-200 p-3 bg-white shrink-0">

          {isResolved ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
              <p className="text-sm font-semibold text-emerald-700">
                This case has been resolved.
              </p>
              <p className="mt-1 text-xs text-emerald-600">
                Messaging has been closed for this case.
              </p>
            </div>
          ) : (
            <>
              <div
                className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl
          px-3 py-2 transition-all duration-150
          focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 focus-within:bg-white"
              >
                <input
                  type="text"
                  placeholder="Type a message…"
                  className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400
            outline-none min-w-0"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={handleKeyDown}
                />

                <button
                  onClick={handleSend}
                  disabled={loading || !text.trim()}
                  className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0
            transition-all duration-150
            bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white
            disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
                >
                  {loading ? <SpinIcon /> : <SendIcon />}
                </button>
              </div>

              <p className="text-[10px] text-slate-400 mt-1.5 px-1">
                Press{" "}
                <kbd className="font-mono bg-slate-100 border border-slate-200 rounded px-1 py-0.5 text-[9px]">
                  Enter
                </kbd>{" "}
                to send
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}