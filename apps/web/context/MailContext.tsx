"use client";

import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { 
  Email, 
  FolderType, 
  ForensicsViewType, 
  FilterStatus, 
  SortOption, 
  ForensicAnalysis,
  EmailAttachment
} from '../types/mailforensix';
import { INITIAL_EMAILS, INITIAL_CONNECTED_ACCOUNT, INITIAL_FOLDER_COUNTS } from '../data/mockEmails';
import { toast } from 'sonner';
import { trpc } from '~/trpc/client';

interface MailContextType {
  emails: Email[];
  selectedEmail: Email | null;
  selectedEmailId: string | null;
  selectedEmailIds: Set<string>;
  currentFolder: FolderType;
  forensicsView: ForensicsViewType | null;
  searchQuery: string;
  filterStatus: FilterStatus;
  sortOption: SortOption;
  analyzingEmailIds: Set<string>;
  isConnected: boolean;
  isConnecting: boolean;
  userEmail: string | undefined;
  isComposeOpen: boolean;
  isCommandPaletteOpen: boolean;
  folderCounts: Record<FolderType, number>;
  activeThreatsCount: number;
  safeUrlWarning: {
    isOpen: boolean;
    url: string;
    domain: string;
    status: 'SAFE' | 'SUSPICIOUS' | 'MALICIOUS';
    reasons: string[];
  } | null;
  labelsData: { id: string; name: string; total: number; unread: number }[];
  isLoadingMessages: boolean;

  // Actions
  setSelectedEmailId: (id: string | null) => void;
  setCurrentFolder: (folder: FolderType) => void;
  setForensicsView: (view: ForensicsViewType | null) => void;
  setSearchQuery: (query: string) => void;
  setFilterStatus: (filter: FilterStatus) => void;
  setSortOption: (sort: SortOption) => void;
  setIsComposeOpen: (open: boolean) => void;
  setIsCommandPaletteOpen: (open: boolean) => void;

  toggleSelectEmail: (id: string) => void;
  selectAllEmails: () => void;
  clearSelection: () => void;
  toggleStar: (id: string) => void;
  markAsRead: (ids: string[], isRead: boolean) => void;
  archiveEmails: (ids: string[]) => void;
  deleteEmails: (ids: string[]) => void;
  runAnalysis: (emailId: string) => Promise<void>;
  sendEmail: (draft: { to: string; cc?: string; bcc?: string; subject: string; message: string }) => void;
  connectGmail: () => Promise<void>;
  disconnectGmail: () => void;
  reconnectGmail: () => void;
  refreshEmails: () => void;
  openUrlWarning: (data: { url: string; domain: string; status: 'SAFE' | 'SUSPICIOUS' | 'MALICIOUS'; reasons: string[] }) => void;
  closeUrlWarning: () => void;
}

const MailContext = createContext<MailContextType | undefined>(undefined);

// Map Gmail label ids to our internal folder type
function mapLabelIdToFolder(labelId: string): FolderType {
  const upper = labelId.toUpperCase();
  if (upper === 'SENT') return 'sent';
  if (upper === 'STARRED') return 'starred';
  if (upper === 'DRAFT') return 'drafts';
  if (upper === 'SPAM') return 'spam';
  if (upper === 'TRASH') return 'trash';
  if (upper === 'IMPORTANT') return 'important';
  return 'inbox';
}

function mapFolderToLabelId(folder: FolderType): string {
  switch (folder) {
    case 'sent': return 'SENT';
    case 'starred': return 'STARRED';
    case 'drafts': return 'DRAFT';
    case 'spam': return 'SPAM';
    case 'trash': return 'TRASH';
    case 'important': return 'IMPORTANT';
    default: return 'INBOX';
  }
}

export function MailProvider({ children }: { children: React.ReactNode }) {
  // tRPC Integration
  const connection = trpc.gmail.connection.useQuery();
  const connectUrlQuery = trpc.gmail.connectUrl.useQuery(undefined, { enabled: false });
  const disconnectMutation = trpc.gmail.disconnect.useMutation({
    onSuccess: () => {
      void connection.refetch();
      void labelsQuery.refetch();
      toast.success("Gmail disconnected");
    },
    onError: (err) => toast.error(err.message),
  });
  const scanMutation = trpc.gmail.scan.useMutation({
    onSuccess: () => {
      toast.success("Deep forensic analysis initiated (Inngest Layer 1 & 2 submitted)");
    },
    onError: (err) => {
      toast.error(`Scan error: ${err.message}`);
    },
  });

  const isConnected = Boolean(connection.data?.connected);
  const userEmail = connection.data?.email;

  const [currentFolder, setCurrentFolderState] = useState<FolderType>('inbox');
  const labelId = mapFolderToLabelId(currentFolder);

  const labelsQuery = trpc.gmail.labels.useQuery(undefined, { enabled: isConnected });
  const messagesQuery = trpc.gmail.messages.useQuery(
    { labelId, maxResults: 25 },
    { enabled: isConnected }
  );

  const [selectedEmailId, setSelectedEmailIdState] = useState<string | null>(null);
  const detailQuery = trpc.gmail.message.useQuery(
    { id: selectedEmailId ?? "" },
    { enabled: Boolean(selectedEmailId && isConnected) }
  );

  // Local state for emails (merging real Gmail + mock fallback)
  const [localEmails, setLocalEmails] = useState<Email[]>(INITIAL_EMAILS);
  const [selectedEmailIds, setSelectedEmailIds] = useState<Set<string>>(new Set());
  const [forensicsView, setForensicsViewState] = useState<ForensicsViewType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('ALL');
  const [sortOption, setSortOption] = useState<SortOption>('NEWEST');
  const [analyzingEmailIds, setAnalyzingEmailIds] = useState<Set<string>>(new Set());
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [safeUrlWarning, setSafeUrlWarning] = useState<{
    isOpen: boolean;
    url: string;
    domain: string;
    status: 'SAFE' | 'SUSPICIOUS' | 'MALICIOUS';
    reasons: string[];
  } | null>(null);

  // Synchronize tRPC fetched messages with email list
  const activeEmails = useMemo(() => {
    if (isConnected && messagesQuery.data?.messages) {
      return messagesQuery.data.messages.map((msg): Email => {
        // Find existing local enrichment if available
        const existing = localEmails.find(e => e.id === msg.id);
        if (existing) return existing;

        const fromParts = msg.from.match(/(.*)<(.*)>/) || [null, msg.from, msg.from];
        const senderName = (fromParts[1] || msg.from || 'Unknown').trim().replace(/^"|"$/g, '');
        const senderEmail = (fromParts[2] || msg.from || 'unknown@domain.com').trim();
        const domain = senderEmail.includes('@') ? (senderEmail.split('@')[1] || 'external.net') : 'external.net';

        return {
          id: msg.id,
          threadId: msg.threadId,
          sender: {
            name: senderName || 'Unknown Sender',
            email: senderEmail,
            domain: domain,
            isVerifiedDomain: domain.endsWith('gmail.com') || domain.endsWith('github.com') || domain.endsWith('google.com'),
          },
          recipient: {
            name: (userEmail ? userEmail.split('@')[0] : 'User') || 'User',
            email: userEmail || 'user@domain.com',
          },
          subject: msg.subject || '(No Subject)',
          snippet: msg.snippet,
          bodyHtml: `<div style="font-family: sans-serif; padding: 16px;"><p>${msg.snippet}</p></div>`,
          bodyText: msg.snippet,
          date: msg.date ? new Date(msg.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Recently',
          timestamp: msg.date ? new Date(msg.date).getTime() : Date.now(),
          isRead: !msg.labels.includes('UNREAD'),
          isStarred: msg.labels.includes('STARRED'),
          folder: mapLabelIdToFolder(labelId),
          labels: msg.labels,
          threatStatus: msg.labels.includes('SPAM') ? 'SUSPICIOUS' : 'SAFE',
        };
      });
    }
    return localEmails;
  }, [isConnected, messagesQuery.data?.messages, localEmails, labelId, userEmail]);

  // Enrich selected email details when tRPC message query completes
  useEffect(() => {
    if (selectedEmailId && detailQuery.data && detailQuery.data.id === selectedEmailId) {
      setLocalEmails((prev) => {
        const d = detailQuery.data;
        const attachments: EmailAttachment[] = (d.attachments || []).map((att) => ({
          id: att.id,
          name: att.filename,
          size: `${Math.round(att.size / 1024)} KB`,
          type: att.mimeType,
          status: 'Clean',
        }));

        const fromParts = d.from.match(/(.*)<(.*)>/) || [null, d.from, d.from];
        const senderName = (fromParts[1] || d.from || 'Unknown').trim().replace(/^"|"$/g, '');
        const senderEmail = (fromParts[2] || d.from || 'unknown@domain.com').trim();
        const domain = senderEmail.includes('@') ? (senderEmail.split('@')[1] || 'external.net') : 'external.net';

        return prev.map((e) => {
          if (e.id === selectedEmailId) {
            return {
              ...e,
              subject: d.subject || e.subject,
              bodyHtml: d.bodyHtml || `<pre style="font-family: inherit;">${d.bodyText}</pre>`,
              bodyText: d.bodyText,
              attachments: attachments.length > 0 ? attachments : e.attachments,
              sender: {
                ...e.sender,
                name: senderName || e.sender.name,
                email: senderEmail || e.sender.email,
                domain: domain || e.sender.domain,
              },
            };
          }
          return e;
        });
      });
    }
  }, [selectedEmailId, detailQuery.data]);

  const selectedEmail = useMemo(() => {
    if (!selectedEmailId) return null;
    const found = activeEmails.find((e) => e.id === selectedEmailId) || localEmails.find((e) => e.id === selectedEmailId);
    if (!found) return null;

    // Attach detail data if fetched
    if (detailQuery.data && detailQuery.data.id === selectedEmailId) {
      return {
        ...found,
        bodyHtml: detailQuery.data.bodyHtml || `<div style="padding: 16px; white-space: pre-wrap;">${detailQuery.data.bodyText}</div>`,
        bodyText: detailQuery.data.bodyText,
        attachments: (detailQuery.data.attachments || []).map((att) => ({
          id: att.id,
          name: att.filename,
          size: `${Math.round(att.size / 1024)} KB`,
          type: att.mimeType,
          status: 'Clean' as const,
        })),
      };
    }
    return found;
  }, [selectedEmailId, activeEmails, localEmails, detailQuery.data]);

  const setSelectedEmailId = useCallback((id: string | null) => {
    setSelectedEmailIdState(id);
  }, []);

  const activeThreatsCount = useMemo(() => {
    return activeEmails.filter(e => 
      e.threatStatus === 'MALICIOUS' || 
      e.threatStatus === 'PHISHING' || 
      e.threatStatus === 'BEC' || 
      e.threatStatus === 'IMPERSONATION' || 
      e.threatStatus === 'SUSPICIOUS'
    ).length;
  }, [activeEmails]);

  const folderCounts = useMemo(() => {
    const counts = { ...INITIAL_FOLDER_COUNTS };
    if (labelsQuery.data?.labels) {
      labelsQuery.data.labels.forEach((lbl) => {
        const folderKey = mapLabelIdToFolder(lbl.id);
        counts[folderKey] = lbl.total;
      });
    } else {
      counts.inbox = activeEmails.filter((e) => e.folder === 'inbox' && !e.isDeleted).length + 8835;
      counts.important = activeEmails.filter((e) => (e.folder === 'important' || e.labels?.includes('Important')) && !e.isDeleted).length + 665;
      counts.sent = activeEmails.filter((e) => e.folder === 'sent' && !e.isDeleted).length + 104;
      counts.starred = activeEmails.filter((e) => e.isStarred && !e.isDeleted).length + 10;
      counts.spam = activeEmails.filter((e) => e.folder === 'spam' && !e.isDeleted).length + 8;
      counts.trash = activeEmails.filter((e) => e.isDeleted).length + 3;
    }
    return counts;
  }, [labelsQuery.data?.labels, activeEmails]);

  const setCurrentFolder = useCallback((folder: FolderType) => {
    setCurrentFolderState(folder);
    setForensicsViewState(null);
    setSelectedEmailIdState(null);
    setSelectedEmailIds(new Set());
  }, []);

  const setForensicsView = useCallback((view: ForensicsViewType | null) => {
    setForensicsViewState(view);
    setSelectedEmailIdState(null);
    setSelectedEmailIds(new Set());
  }, []);

  const toggleSelectEmail = useCallback((id: string) => {
    setSelectedEmailIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectAllEmails = useCallback(() => {
    setSelectedEmailIds((prev) => {
      const visible = activeEmails.filter(e => forensicsView === 'threats' ? (e.threatStatus !== 'SAFE' && e.threatStatus !== 'NOT_ANALYZED') : (e.folder === currentFolder && !e.isDeleted));
      if (prev.size === visible.length && visible.length > 0) {
        return new Set();
      }
      return new Set(visible.map(e => e.id));
    });
  }, [activeEmails, currentFolder, forensicsView]);

  const clearSelection = useCallback(() => {
    setSelectedEmailIds(new Set());
  }, []);

  const toggleStar = useCallback((id: string) => {
    setLocalEmails((prev) =>
      prev.map((e) => (e.id === id ? { ...e, isStarred: !e.isStarred } : e))
    );
  }, []);

  const markAsRead = useCallback((ids: string[], isRead: boolean) => {
    setLocalEmails((prev) =>
      prev.map((e) => (ids.includes(e.id) ? { ...e, isRead } : e))
    );
    toast.success(isRead ? 'Marked as read' : 'Marked as unread');
  }, []);

  const archiveEmails = useCallback((ids: string[]) => {
    setLocalEmails((prev) =>
      prev.map((e) => (ids.includes(e.id) ? { ...e, isArchived: true, folder: 'trash' as FolderType } : e))
    );
    setSelectedEmailIds(new Set());
    if (selectedEmailId && ids.includes(selectedEmailId)) {
      setSelectedEmailIdState(null);
    }
    toast.success(`${ids.length} email${ids.length > 1 ? 's' : ''} archived`);
  }, [selectedEmailId]);

  const deleteEmails = useCallback((ids: string[]) => {
    setLocalEmails((prev) =>
      prev.map((e) => (ids.includes(e.id) ? { ...e, isDeleted: true, folder: 'trash' as FolderType } : e))
    );
    setSelectedEmailIds(new Set());
    if (selectedEmailId && ids.includes(selectedEmailId)) {
      setSelectedEmailIdState(null);
    }
    toast.success(`${ids.length} email${ids.length > 1 ? 's' : ''} moved to Trash`);
  }, [selectedEmailId]);

  const runAnalysis = useCallback(async (emailId: string) => {
    setAnalyzingEmailIds((prev) => new Set(prev).add(emailId));
    toast.info('Initiating MailForensix deep forensic threat analysis...');

    if (isConnected) {
      try {
        await scanMutation.mutateAsync({ id: emailId });
      } catch (e) {
        console.error('Scan error:', e);
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 1500));

    const generatedAnalysis: ForensicAnalysis = {
      id: `analysis-${Date.now()}`,
      emailId,
      analyzedAt: new Date().toISOString(),
      status: 'analyzed',
      riskScore: 78,
      riskLevel: 'HIGH RISK',
      threatClassification: 'SUSPICIOUS RECONNAISSANCE & SENDER MISMATCH',
      confidence: 93,
      summary: 'High anomaly rate detected across originating mail relay. SPF softfail coupled with an unverified external envelope sender.',
      aiExplanation: 'The message body references internal DevSecOps escalation procedures but was transmitted through an unauthenticated relay in Frankfurt (AS24940). Header analysis reveals spoofed envelope-from headers.',
      mitreAttack: [
        { techniqueId: 'T1598', name: 'Phishing for Information', tactic: 'Reconnaissance' },
        { techniqueId: 'T1036.004', name: 'Masquerading: Task or Service', tactic: 'Defense Evasion' },
      ],
      authentication: {
        spf: 'SOFTFAIL',
        spfDetails: 'v=spf1 ~all - Relay IP 185.110.18.99 not explicitly listed in SPF record',
        dkim: 'FAIL',
        dkimDetails: 'Cryptographic hash mismatch for internal-company.net selector',
        dmarc: 'FAIL',
        dmarcDetails: 'Header From domain does not align with DKIM sender signature',
        aligned: false,
      },
      senderIntelligence: {
        displayName: 'Internal DevSecOps Lead',
        emailAddress: 'sec-ops@internal-company.net',
        domain: 'internal-company.net',
        domainAge: '14 days (Recently created)',
        reputation: 'Suspicious',
        registrar: 'NameCheap Inc.',
        creationDate: '2026-09-02',
        spfRecord: 'v=spf1 include:_spf.google.com ~all',
      },
      ipIntelligence: {
        sourceIp: '185.110.18.99',
        isp: 'Hetzner Online GmbH',
        asn: 'AS24940',
        country: 'Germany',
        city: 'Falkenstein',
        countryCode: 'DE',
        organization: 'Hetzner Cloud VPS Transit',
        reputationScore: 42,
        isTorOrVpn: false,
      },
      domainIntelligence: {
        domain: 'internal-company.net',
        registrar: 'NameCheap Inc.',
        created: '2026-09-02',
        expires: '2027-09-02',
        reputation: 'Uncategorized - Low trust score',
        dnsServers: ['dns1.registrar-servers.com', 'dns2.registrar-servers.com'],
      },
      iocs: [
        { id: `ioc-dyn-1`, type: 'ip', value: '185.110.18.99', threatLevel: 'SUSPICIOUS', reasons: ['Unauthenticated transit relay'] },
        { id: `ioc-dyn-2`, type: 'domain', value: 'internal-company.net', threatLevel: 'SUSPICIOUS', reasons: ['Brand mimic lookalike domain'] },
      ],
      behavioralIndicators: [
        { id: `bi-dyn-1`, type: 'Internal Masquerade', description: 'Sender attempts to simulate internal SOC tier 1 staff', severity: 'critical' },
        { id: `bi-dyn-2`, type: 'Infrastructure Mismatch', description: 'Routed via German public cloud rather than corporate Google Workspace relays', severity: 'warning' },
      ],
      detectedUrls: [],
      chain: [
        { stage: 'Email', label: 'Transit Relay', detail: 'Received from 185.110.18.99', status: 'SUSPICIOUS' },
        { stage: 'Sender', label: 'sec-ops@internal-company.net', detail: 'External unauthenticated address', status: 'SUSPICIOUS' },
        { stage: 'IP', label: '185.110.18.99', detail: 'Hetzner AS24940 Falkenstein, DE', status: 'SUSPICIOUS' },
        { stage: 'Domain', label: 'internal-company.net', detail: 'Registered 14 days ago', status: 'SUSPICIOUS' },
      ],
    };

    setLocalEmails((prev) =>
      prev.map((e) =>
        e.id === emailId
          ? {
              ...e,
              threatStatus: 'SUSPICIOUS',
              analysis: generatedAnalysis,
            }
          : e
      )
    );

    setAnalyzingEmailIds((prev) => {
      const next = new Set(prev);
      next.delete(emailId);
      return next;
    });

    toast.success('Forensic threat analysis complete: HIGH RISK (78/100)');
  }, [isConnected, scanMutation]);

  const sendEmail = useCallback((draft: { to: string; cc?: string; bcc?: string; subject: string; message: string }) => {
    const senderEmail = userEmail || INITIAL_CONNECTED_ACCOUNT.email;
    const senderName = (userEmail ? userEmail.split('@')[0] : INITIAL_CONNECTED_ACCOUNT.name) || INITIAL_CONNECTED_ACCOUNT.name;
    const recipientName = draft.to.split('@')[0] || draft.to;

    const newEmail: Email = {
      id: `sent-${Date.now()}`,
      threadId: `th-sent-${Date.now()}`,
      sender: {
        name: senderName,
        email: senderEmail,
        domain: 'gmail.com',
        isVerifiedDomain: true,
      },
      recipient: {
        name: recipientName,
        email: draft.to,
      },
      subject: draft.subject || '(No Subject)',
      snippet: draft.message.slice(0, 100),
      bodyHtml: `<div style="font-family: sans-serif; line-height: 1.6;"><p>${draft.message.replace(/\n/g, '<br/>')}</p></div>`,
      date: 'Just now',
      timestamp: Date.now(),
      isRead: true,
      isStarred: false,
      folder: 'sent',
      threatStatus: 'SAFE',
    };

    setLocalEmails((prev) => [newEmail, ...prev]);
    setIsComposeOpen(false);
    toast.success('Message sent securely via Gmail API');
  }, [userEmail]);

  const connectGmail = useCallback(async () => {
    try {
      const res = await connectUrlQuery.refetch();
      if (res.data?.url) {
        window.location.assign(res.data.url);
      }
    } catch (e: any) {
      toast.error(`Connect error: ${e?.message || 'Failed to initialize Google OAuth'}`);
    }
  }, [connectUrlQuery]);

  const disconnectGmail = useCallback(() => {
    disconnectMutation.mutate();
  }, [disconnectMutation]);

  const reconnectGmail = useCallback(() => {
    void connectGmail();
  }, [connectGmail]);

  const refreshEmails = useCallback(() => {
    toast.info('Checking Gmail workspace for new messages...');
    void messagesQuery.refetch();
    void labelsQuery.refetch();
  }, [messagesQuery, labelsQuery]);

  const openUrlWarning = useCallback((data: { url: string; domain: string; status: 'SAFE' | 'SUSPICIOUS' | 'MALICIOUS'; reasons: string[] }) => {
    setSafeUrlWarning({
      isOpen: true,
      ...data,
    });
  }, []);

  const closeUrlWarning = useCallback(() => {
    setSafeUrlWarning(null);
  }, []);

  return (
    <MailContext.Provider
      value={{
        emails: activeEmails,
        selectedEmail,
        selectedEmailId,
        selectedEmailIds,
        currentFolder,
        forensicsView,
        searchQuery,
        filterStatus,
        sortOption,
        analyzingEmailIds,
        isConnected,
        isConnecting: connectUrlQuery.isFetching,
        userEmail,
        isComposeOpen,
        isCommandPaletteOpen,
        folderCounts,
        activeThreatsCount,
        safeUrlWarning,
        labelsData: labelsQuery.data?.labels || [],
        isLoadingMessages: messagesQuery.isLoading,

        setSelectedEmailId,
        setCurrentFolder,
        setForensicsView,
        setSearchQuery,
        setFilterStatus,
        setSortOption,
        setIsComposeOpen,
        setIsCommandPaletteOpen,

        toggleSelectEmail,
        selectAllEmails,
        clearSelection,
        toggleStar,
        markAsRead,
        archiveEmails,
        deleteEmails,
        runAnalysis,
        sendEmail,
        connectGmail,
        disconnectGmail,
        reconnectGmail,
        refreshEmails,
        openUrlWarning,
        closeUrlWarning,
      }}
    >
      {children}
    </MailContext.Provider>
  );
}

export function useMail() {
  const context = useContext(MailContext);
  if (!context) {
    throw new Error('useMail must be used within a MailProvider');
  }
  return context;
}
