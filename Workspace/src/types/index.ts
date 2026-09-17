export type ThreatStatus = 
  | 'SAFE' 
  | 'SUSPICIOUS' 
  | 'MALICIOUS' 
  | 'PHISHING' 
  | 'BEC' 
  | 'IMPERSONATION' 
  | 'UNKNOWN' 
  | 'NOT_ANALYZED';

export type FolderType = 
  | 'inbox' 
  | 'important' 
  | 'sent' 
  | 'starred' 
  | 'drafts' 
  | 'spam' 
  | 'trash';

export type ForensicsViewType = 
  | 'threats' 
  | 'investigations' 
  | 'ioc_search' 
  | 'reports';

export interface EmailAttachment {
  id: string;
  name: string;
  size: string;
  type: string;
  status: 'Clean' | 'Suspicious' | 'Malicious';
  sha256?: string;
  downloadUrl?: string;
}

export interface DetectedUrl {
  url: string;
  domain: string;
  status: 'SAFE' | 'SUSPICIOUS' | 'MALICIOUS';
  reasons: string[];
  expandedUrl?: string;
  destinationIp?: string;
}

export interface IOCItem {
  id: string;
  type: 'url' | 'domain' | 'ip' | 'email' | 'hash' | 'cve';
  value: string;
  threatLevel: 'SAFE' | 'SUSPICIOUS' | 'MALICIOUS' | 'low' | 'medium' | 'high';
  description?: string;
  reasons?: string[];
  firstSeen?: string;
}

export interface SenderInfo {
  name: string;
  email: string;
  avatar?: string;
  domain: string;
  isVerifiedDomain?: boolean;
}

export interface BehavioralIndicator {
  id: string;
  type: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface ForensicChainStep {
  stage: string;
  label: string;
  detail: string;
  status: 'SAFE' | 'SUSPICIOUS' | 'MALICIOUS';
}

export interface ForensicAnalysis {
  id: string;
  emailId: string;
  analyzedAt: string;
  status: 'analyzed' | 'pending' | 'failed';
  riskScore: number; // 0 - 100
  riskLevel: 'LOW RISK' | 'MODERATE RISK' | 'HIGH RISK' | 'CRITICAL';
  threatClassification: string;
  confidence: number; // e.g. 94%
  summary: string;
  aiExplanation: string;
  mitreAttack?: {
    techniqueId: string;
    name: string;
    tactic: string;
  }[];
  authentication: {
    spf: 'PASS' | 'FAIL' | 'SOFTFAIL' | 'NEUTRAL';
    spfDetails?: string;
    dkim: 'PASS' | 'FAIL' | 'NONE';
    dkimDetails?: string;
    dmarc: 'PASS' | 'FAIL' | 'NONE';
    dmarcDetails?: string;
    aligned: boolean;
  };
  senderIntelligence: {
    displayName: string;
    emailAddress: string;
    domain: string;
    domainAge: string;
    reputation: string;
    registrar: string;
    creationDate: string;
    spfRecord?: string;
  };
  ipIntelligence: {
    sourceIp: string;
    isp: string;
    asn: string;
    country: string;
    city: string;
    countryCode: string;
    organization: string;
    reputationScore: number;
    isTorOrVpn: boolean;
  };
  domainIntelligence: {
    domain: string;
    registrar: string;
    created: string;
    expires: string;
    reputation: string;
    dnsServers: string[];
    typosquattingTarget?: string;
  };
  iocs: IOCItem[];
  behavioralIndicators: BehavioralIndicator[];
  detectedUrls: DetectedUrl[];
  chain?: ForensicChainStep[];
}

export interface Email {
  id: string;
  threadId: string;
  sender: SenderInfo;
  recipient: {
    name: string;
    email: string;
  };
  subject: string;
  snippet: string;
  bodyHtml: string;
  bodyText?: string;
  date: string;
  timestamp: number;
  isRead: boolean;
  isStarred: boolean;
  isArchived?: boolean;
  isDeleted?: boolean;
  folder: FolderType;
  labels?: string[];
  threatStatus: ThreatStatus;
  analysis?: ForensicAnalysis;
  attachments?: EmailAttachment[];
}

export type FilterStatus = 'ALL' | 'UNREAD' | 'SAFE' | 'SUSPICIOUS' | 'MALICIOUS' | 'NOT_ANALYZED';
export type SortOption = 'NEWEST' | 'OLDEST' | 'RISK_SCORE';
