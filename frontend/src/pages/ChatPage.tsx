import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { chatApi } from '../lib/api';
import { ChatMessage, ChatSession } from '../types/api';
import { formatRelativeTime } from '../lib/utils';

export function ChatPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    if (activeSessionId) {
      loadMessages(activeSessionId);
    }
  }, [activeSessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadSessions = async () => {
    try {
      const data = await chatApi.getSessions();
      setSessions(data);
      if (data.length > 0 && !activeSessionId) {
        setActiveSessionId(data[0].id);
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  };

  const loadMessages = async (sessionId: number) => {
    try {
      const data = await chatApi.getMessages(sessionId);
      setMessages(data);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const handleNewSession = async () => {
    try {
      const session = await chatApi.createSession();
      setSessions([session, ...sessions]);
      setActiveSessionId(session.id);
      setMessages([]);
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeSessionId) return;

    const userMessage = inputMessage;
    setInputMessage('');
    setLoading(true);

    try {
      const response = await chatApi.sendMessage(activeSessionId, userMessage);
      setMessages([...messages, response.userMessage, response.assistantMessage]);
    } catch (error: any) {
      console.error('Failed to send message:', error);

      // Add error message to chat
      const errorMessage: ChatMessage = {
        id: Date.now(),
        sessionId: activeSessionId,
        role: 'assistant',
        content: '⚠️ Unable to process your message. This feature requires Anthropic API credits. Please add credits to your account to use the AI chat assistant.',
        createdAt: new Date().toISOString(),
      };
      setMessages([...messages, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const activeSession = sessions.find(s => s.id === activeSessionId);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Chat</h1>
        <p className="text-muted-foreground mt-2">
          Ask questions about your finances in natural language
        </p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Sessions Sidebar */}
        <div className="col-span-3">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">Sessions</CardTitle>
                <Button size="sm" variant="outline" onClick={handleNewSession}>
                  New
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {sessions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No sessions yet</p>
                ) : (
                  sessions.map((session) => (
                    <button
                      key={session.id}
                      onClick={() => setActiveSessionId(session.id)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        activeSessionId === session.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                    >
                      <p className="text-sm font-medium truncate">
                        {session.title || `Session ${session.id}`}
                      </p>
                      <p className="text-xs opacity-70 mt-1">
                        {formatRelativeTime(session.createdAt)}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat Area */}
        <div className="col-span-9">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle>Financial Assistant</CardTitle>
              <CardDescription>
                Powered by Claude AI - {activeSession ? activeSession.title || 'New conversation' : 'Select or create a session'}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto mb-4 p-4 border rounded-lg bg-muted/20">
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-12">
                    <div className="text-6xl mb-4">💬</div>
                    <p>Start a conversation with your financial assistant</p>
                    <p className="text-sm mt-2">
                      Try: "How much did I spend on dining last month?"
                    </p>
                    <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm max-w-md mx-auto">
                      <p className="font-medium">⚠️ AI Features Require Credits</p>
                      <p className="mt-1">This chat assistant uses the Anthropic API and requires credits to function.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {formatRelativeTime(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                    {loading && (
                      <div className="flex justify-start">
                        <div className="bg-muted rounded-lg p-3">
                          <p className="text-sm text-muted-foreground">Thinking...</p>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  type="text"
                  placeholder={
                    activeSessionId
                      ? 'Ask a question about your finances...'
                      : 'Create a session to start chatting'
                  }
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  disabled={!activeSessionId || loading}
                />
                <Button type="submit" disabled={!activeSessionId || loading || !inputMessage.trim()}>
                  Send
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
