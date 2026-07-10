'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSession } from 'next-auth/react';

interface Contact {
  id: string;
  username: string;
  email: string;
  role: string;
}

interface ConversationSummary {
  id: string;
  other: { id: string; username: string; role: string };
  lastMessage: { content: string; createdAt: string } | null;
  unreadCount: number;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
}

const roleLabel: Record<string, string> = {
  SUPER_ADMIN: 'Admin',
  SCHOOL_OWNER: "Chef d'établissement",
  TEACHER: 'Enseignant',
  PARENT: 'Parent',
};

export default function MessagesPage() {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeOther, setActiveOther] = useState<{ username: string; role: string } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [showContacts, setShowContacts] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadConversations = useCallback(async () => {
    const res = await fetch('/api/messages/conversations');
    if (res.ok) setConversations(await res.json());
  }, []);

  const loadContacts = useCallback(async () => {
    const res = await fetch('/api/messages/contacts');
    if (res.ok) setContacts(await res.json());
  }, []);

  const openConversation = useCallback(async (id: string) => {
    setActiveId(id);
    setShowContacts(false);
    const res = await fetch(`/api/messages/conversations/${id}`);
    if (res.ok) {
      const data = await res.json();
      setActiveOther(data.other);
      setMessages(data.messages);
      loadConversations();
    }
  }, [loadConversations]);

  const startConversation = async (contact: Contact) => {
    const res = await fetch('/api/messages/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ otherUserId: contact.id }),
    });
    if (res.ok) {
      const { id } = await res.json();
      openConversation(id);
    }
  };

  const sendMessage = async () => {
    if (!draft.trim() || !activeId) return;
    const content = draft;
    setDraft('');
    const res = await fetch(`/api/messages/conversations/${activeId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    if (res.ok) {
      const msg = await res.json();
      setMessages((prev) => [...prev, msg]);
      loadConversations();
    }
  };

  useEffect(() => {
    loadConversations();
    loadContacts();
    const interval = setInterval(loadConversations, 8000);
    return () => clearInterval(interval);
  }, [loadConversations, loadContacts]);

  useEffect(() => {
    if (!activeId) return;
    const interval = setInterval(async () => {
      const res = await fetch(`/api/messages/conversations/${activeId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [activeId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 140px)', border: '1px solid #E5E9F0', borderRadius: 12, overflow: 'hidden', fontFamily: 'Inter, sans-serif' }}>
      {/* Sidebar */}
      <div style={{ width: 280, borderRight: '1px solid #E5E9F0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #E5E9F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <strong style={{ color: '#071B4A', fontSize: 15 }}>Messages</strong>
          <button
            onClick={() => setShowContacts((s) => !s)}
            style={{ background: '#FFB400', color: '#071B4A', border: 'none', borderRadius: 14, padding: '4px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
          >
            {showContacts ? 'Retour' : '+ Nouveau'}
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {showContacts ? (
            contacts.map((c) => (
              <button
                key={c.id}
                onClick={() => startConversation(c)}
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 16px', border: 'none', background: 'transparent', cursor: 'pointer', borderBottom: '1px solid #F5F5F5' }}
              >
                <div style={{ fontSize: 14, fontWeight: 600, color: '#071B4A' }}>{c.username}</div>
                <div style={{ fontSize: 12, color: '#5A6A7A' }}>{roleLabel[c.role] ?? c.role}</div>
              </button>
            ))
          ) : conversations.length === 0 ? (
            <p style={{ padding: 16, fontSize: 13, color: '#5A6A7A' }}>
              Aucune conversation. Cliquez sur "+ Nouveau" pour commencer.
            </p>
          ) : (
            conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => openConversation(c.id)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '12px 16px',
                  border: 'none',
                  background: activeId === c.id ? '#FAF6E8' : 'transparent',
                  cursor: 'pointer',
                  borderBottom: '1px solid #F5F5F5',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#071B4A' }}>{c.other.username}</span>
                  {c.unreadCount > 0 && (
                    <span style={{ background: '#FFB400', color: '#071B4A', fontSize: 11, fontWeight: 700, borderRadius: 10, padding: '1px 7px' }}>
                      {c.unreadCount}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: '#5A6A7A' }}>{roleLabel[c.other.role] ?? c.other.role}</div>
                {c.lastMessage && (
                  <div style={{ fontSize: 12, color: '#5A6A7A', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.lastMessage.content}
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Thread */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {activeId && activeOther ? (
          <>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #E5E9F0' }}>
              <strong style={{ color: '#071B4A', fontSize: 15 }}>{activeOther.username}</strong>
              <span style={{ marginLeft: 8, fontSize: 12, color: '#5A6A7A' }}>{roleLabel[activeOther.role] ?? activeOther.role}</span>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {messages.map((m) => {
                const mine = m.senderId === session?.user?.id;
                return (
                  <div key={m.id} style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start' }}>
                    <div
                      style={{
                        maxWidth: '70%',
                        background: mine ? '#071B4A' : '#F0F2F5',
                        color: mine ? '#fff' : '#1A1A2E',
                        padding: '8px 14px',
                        borderRadius: 14,
                        fontSize: 14,
                      }}
                    >
                      {m.content}
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            <div style={{ padding: 14, borderTop: '1px solid #E5E9F0', display: 'flex', gap: 8 }}>
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Écrire un message..."
                style={{ flex: 1, padding: '10px 14px', borderRadius: 20, border: '1px solid #DCE1E8', fontSize: 14, outline: 'none' }}
              />
              <button
                onClick={sendMessage}
                style={{ background: '#FFB400', color: '#071B4A', border: 'none', borderRadius: 20, padding: '0 20px', fontWeight: 600, cursor: 'pointer' }}
              >
                Envoyer
              </button>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5A6A7A', fontSize: 14 }}>
            Sélectionnez une conversation pour commencer
          </div>
        )}
      </div>
    </div>
  );
}