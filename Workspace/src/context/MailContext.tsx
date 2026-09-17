import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { 
  Email, 
  FolderType, 
  ForensicsViewType, 
  FilterStatus, 
  SortOption, 
  ForensicAnalysis 
} from '../types';
import { INITIAL_EMAILS, INITIAL_CONNECTED_ACCOUNT, INITIAL_FOLDER_COUNTS } from '../data/mockEmails';
import { toast } from 'sonner';

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
  disconnectGmail: () => void;
  reconnectGmail: () => void;
  refreshEmails: () => void;
  openUrlWarning: (data: { url: string; domain: string; status: 'SAFE' | 'SUSPICIOUS' | 'MALICIOUS'; reasons: string[] }) => void;
  closeUrlWarning: () => void;
}

const MailContext = createContext<MailContextType | undefined>(undefined);

export function MailProvider({ children }: { children: React.ReactNode }) {
  const [emails, setEmails] = useState<Email[]>(INITIAL_EMAILS);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [selectedEmailIds, setSelectedEmailIds] = useState<Set<string>>(new Set());
  const [currentFolder, setCurrentFolderState] = useState<FolderType>('inbox');
  const [forensicsView, setForensicsViewState] = useState<ForensicsViewType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('ALL');
  const [sortOption, setSortOption] = useState<SortOption>('NEWEST');
  const [analyzingEmailIds, setAnalyzingEmailIds] = useState<Set<string>>(new Set());
  const [isConnected, setIsConnected] = useState(true);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [safeUrlWarning, setSafeUrlWarning] = useState<{
    isOpen: boolean;
    url: string;
    domain: string;
    status: 'SAFE' | 'SUSPICIOUS' | 'MALICIOUS';
    reasons: string[];
  } | null>(null);

  const selectedEmail = useMemo(() => {
    return emails.find((e) => e.id === selectedEmailId) || null;
  }, [emails, selectedEmailId]);

  const activeThreatsCount = useMemo(() => {
    return emails.filter(e => 
      e.threatStatus === 'MALICIOUS' || 
      e.threatStatus === 'PHISHING' || 
      e.threatStatus === 'BEC' || 
      e.threatStatus === 'IMPERSONATION' || 
      e.threatStatus === 'SUSPICIOUS'
    ).length;
  }, [emails]);

  const folderCounts = useMemo(() => {
    const counts = { ...INITIAL_FOLDER_COUNTS };
    // recalculate dynamically based on active emails
    counts.inbox = emails.filter((e) => e.folder === 'inbox' && !e.isDeleted).length + 8835;
    counts.important = emails.filter((e) => (e.folder === 'important' || e.labels?.includes('Important')) && !e.isDeleted).length + 665;
    counts.sent = emails.filter((e) => e.folder === 'sent' && !e.isDeleted).length + 104;
    counts.starred = emails.filter((e) => e.isStarred && !e.isDeleted).length + 10;
    counts.spam = emails.filter((e) => e.folder === 'spam' && !e.isDeleted).length + 8;
    counts.trash = emails.filter((e) => e.isDeleted).length + 3;
    return counts;
  }, [emails]);

  const setCurrentFolder = useCallback((folder: FolderType) => {
    setCurrentFolderState(folder);
    setForensicsViewState(null);
    setSelectedEmailId(null);
    setSelectedEmailIds(new Set());
  }, []);

  const setForensicsView = useCallback((view: ForensicsViewType | null) => {
    setForensicsViewState(view);
    setSelectedEmailId(null);
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
      // If all currently visible are selected, deselect all. Otherwise, select all
      const visible = emails.filter(e => forensicsView === 'threats' ? (e.threatStatus !== 'SAFE' && e.threatStatus !== 'NOT_ANALYZED') : (e.folder === currentFolder && !e.isDeleted));
      if (prev.size === visible.length && visible.length > 0) {
        return new Set();
      }
      return new Set(visible.map(e => e.id));
    });
  }, [emails, currentFolder, forensicsView]);

  const clearSelection = useCallback(() => {
    setSelectedEmailIds(new Set());
  }, []);

  const toggleStar = useCallback((id: string) => {
    setEmails((prev) =>
      prev.map((e) => (e.id === id ? { ...e, isStarred: !e.isStarred } : e))
    );
  }, []);

  const markAsRead = useCallback((ids: string[], isRead: boolean) => {
    setEmails((prev) =>
      prev.map((e) => (ids.includes(e.id) ? { ...e, isRead } : e))
    );
    toast.success(isRead ? 'Marked as read' : 'Marked as unread');
  }, []);

  const archiveEmails = useCallback((ids: string[]) => {
    setEmails((prev) =>
      prev.map((e) => (ids.includes(e.id) ? { ...e, isArchived: true, folder: 'trash' as FolderType } : e))
    );
    setSelectedEmailIds(new Set());
    if (selectedEmailId && ids.includes(selectedEmailId)) {
      setSelectedEmailId(null);
    }
    toast.success(`${ids.length} email${ids.length > 1 ? 's' : ''} archived`);
  }, [selectedEmailId]);

  const deleteEmails = useCallback((ids: string[]) => {
    setEmails((prev) =>
      prev.map((e) => (ids.includes(e.id) ? { ...e, isDeleted: true, folder: 'trash' as FolderType } : e))
    );
    setSelectedEmailIds(new Set());
    if (selectedEmailId && ids.includes(selectedEmailId)) {
      setSelectedEmailId(null);
    }
    toast.success(`${ids.length} email${ids.length > 1 ? 's' : ''} moved to Trash`);
  }, [selectedEmailId]);

  const runAnalysis = useCallback(async (emailId: string) => {
    setAnalyzingEmailIds((prev) => new Set(prev).add(emailId));
    toast.info('Initiating MailForensix deep forensic threat analysis...');

    // Simulate forensic pipeline scanning (SPF, DKIM, DMARC, WHOIS, Sandboxing, NLP)
    await new Promise((resolve) => setTimeout(resolve, 1800));

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

    setEmails((prev) =>
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
  }, []);

  const sendEmail = useCallback((draft: { to: string; cc?: string; bcc?: string; subject: string; message: string }) => {
    const newEmail: Email = {
      id: `sent-${Date.now()}`,
      threadId: `th-sent-${Date.now()}`,
      sender: {
        name: INITIAL_CONNECTED_ACCOUNT.name,
        email: INITIAL_CONNECTED_ACCOUNT.email,
        domain: 'gmail.com',
        isVerifiedDomain: true,
      },
      recipient: {
        name: draft.to.split('@')[0],
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

    setEmails((prev) => [newEmail, ...prev]);
    setIsComposeOpen(false);
    toast.success('Message sent securely via Gmail API');
  }, []);

  const disconnectGmail = useCallback(() => {
    setIsConnected(false);
    toast.error('Gmail connection disabled');
  }, []);

  const reconnectGmail = useCallback(() => {
    setIsConnected(true);
    toast.success('Gmail workspace connection restored');
  }, []);

  const refreshEmails = useCallback(() => {
    toast.info('Checking Gmail workspace for new messages...');
    setTimeout(() => {
      toast.success('Inbox up to date');
    }, 700);
  }, []);

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
        emails,
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
        isComposeOpen,
        isCommandPaletteOpen,
        folderCounts,
        activeThreatsCount,
        safeUrlWarning,

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
