import { Email } from '../types/mailforensix';

export const INITIAL_CONNECTED_ACCOUNT = {
  name: 'Milap Modi',
  email: 'milapmodi43@gmail.com',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
  status: 'Connected',
  connectedSince: 'Aug 14, 2026',
  storageUsed: '4.8 GB of 15 GB',
  threatsBlocked: 14,
};

export const INITIAL_FOLDER_COUNTS = {
  inbox: 8843,
  important: 668,
  sent: 105,
  starred: 12,
  drafts: 10,
  spam: 10,
  trash: 3,
};

export const INITIAL_EMAILS: Email[] = [
  {
    id: 'msg-001',
    threadId: 'th-001',
    sender: {
      name: 'GitHub',
      email: 'noreply@github.com',
      domain: 'github.com',
      isVerifiedDomain: true,
      avatar: 'https://github.githubassets.com/favicons/favicon.png',
    },
    recipient: {
      name: 'Milap Modi',
      email: 'milapmodi43@gmail.com',
    },
    subject: '[GitHub] Sudo email verification code: 849-210',
    snippet: 'Please verify your identity. Here is your temporary one-time verification code to approve repository access.',
    bodyHtml: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #24292f; line-height: 1.6;">
        <div style="border-bottom: 1px solid #e1e4e8; padding-bottom: 16px; margin-bottom: 24px;">
          <h2 style="font-size: 20px; font-weight: 600; margin: 0; color: #24292f;">GitHub Security Authentication</h2>
        </div>
        <p style="font-size: 15px; margin-bottom: 16px;">Hi <strong>@milapmodi</strong>,</p>
        <p style="font-size: 15px; margin-bottom: 20px;">We received a request to perform a sudo action (SSH Key modification) on your GitHub account. Use the one-time code below to verify your session:</p>
        
        <div style="background-color: #f6f8fa; border: 1px solid #d0d7de; border-radius: 8px; padding: 18px 24px; display: inline-block; margin: 12px 0 24px 0;">
          <span style="font-family: monospace; font-size: 28px; font-weight: 700; letter-spacing: 4px; color: #0969da;">849-210</span>
        </div>

        <p style="font-size: 14px; color: #57606a;">This code will expire in 10 minutes. If you did not make this request, your credentials may be compromised. Please review your security logs immediately at <a href="https://github.com/settings/security-log" style="color: #0969da; text-decoration: underline;">github.com/settings/security-log</a>.</p>
        
        <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e1e4e8; font-size: 12px; color: #8c959f;">
          GitHub, Inc. · 88 Colin P Kelly Jr St · San Francisco, CA 94107
        </div>
      </div>
    `,
    date: 'Sep 9',
    timestamp: Date.now() - 1000 * 60 * 45, // 45 mins ago
    isRead: false,
    isStarred: true,
    folder: 'inbox',
    labels: ['GitHub', 'Security', 'Inbox'],
    threatStatus: 'SAFE',
    analysis: {
      id: 'analysis-001',
      emailId: 'msg-001',
      analyzedAt: '2026-09-09T14:15:00Z',
      status: 'analyzed',
      riskScore: 4,
      riskLevel: 'LOW RISK',
      threatClassification: 'AUTHENTIC NOTIFICATION',
      confidence: 99,
      summary: 'Email originates from verified GitHub infrastructure with valid cryptographically signed DKIM and aligned SPF records. No malicious anomalies found.',
      aiExplanation: 'The email headers, return-path, and cryptographic signatures strictly correlate with GitHub Inc infrastructure (AS36459). SPF evaluates to pass for IP 192.30.252.204. No deceptive URLs or suspicious encoding observed.',
      mitreAttack: [],
      authentication: {
        spf: 'PASS',
        spfDetails: 'v=spf1 include:_netblocks.github.com include:_netblocks2.github.com ~all',
        dkim: 'PASS',
        dkimDetails: 'v=1; a=rsa-sha256; d=github.com; s=s2024; c=relaxed/relaxed',
        dmarc: 'PASS',
        dmarcDetails: 'v=DMARC1; p=reject; pct=100; rua=mailto:d@rua.github.com',
        aligned: true,
      },
      senderIntelligence: {
        displayName: 'GitHub',
        emailAddress: 'noreply@github.com',
        domain: 'github.com',
        domainAge: '18 years, 7 months',
        reputation: 'Clean',
        registrar: 'MarkMonitor Inc.',
        creationDate: '2007-10-09',
        spfRecord: 'v=spf1 ip4:192.30.252.0/22 ~all',
      },
      ipIntelligence: {
        sourceIp: '192.30.252.204',
        isp: 'GitHub Inc.',
        asn: 'AS36459',
        country: 'United States',
        city: 'San Francisco',
        countryCode: 'US',
        organization: 'GitHub Infrastructure Services',
        reputationScore: 98,
        isTorOrVpn: false,
      },
      domainIntelligence: {
        domain: 'github.com',
        registrar: 'MarkMonitor Inc.',
        created: '2007-10-09',
        expires: '2028-10-09',
        reputation: 'Clean - Top 100 Global Domain',
        dnsServers: ['dns1.p08.nsone.net', 'ns-1283.awsdns-32.org'],
      },
      iocs: [
        { id: 'ioc-1', type: 'domain', value: 'github.com', threatLevel: 'SAFE' },
        { id: 'ioc-2', type: 'ip', value: '192.30.252.204', threatLevel: 'SAFE' },
        { id: 'ioc-3', type: 'url', value: 'https://github.com/settings/security-log', threatLevel: 'SAFE' },
      ],
      behavioralIndicators: [
        { id: 'bi-1', type: 'Auth Verification', description: 'DKIM signature matches sender domain exactly (strict alignment)', severity: 'info' },
        { id: 'bi-2', type: 'Known ASN', description: 'Sender IP matches registered GitHub autonomous system', severity: 'info' },
      ],
      detectedUrls: [
        {
          url: 'https://github.com/settings/security-log',
          domain: 'github.com',
          status: 'SAFE',
          reasons: ['Valid HTTPS', 'Official domain of sender', 'Legitimate security settings page'],
        }
      ],
      chain: [
        { stage: 'Email', label: 'Message Header', detail: 'Received from 192.30.252.204', status: 'SAFE' },
        { stage: 'Sender', label: 'noreply@github.com', detail: 'Display matches header envelope', status: 'SAFE' },
        { stage: 'IP', label: '192.30.252.204', detail: 'AS36459 (GitHub Inc)', status: 'SAFE' },
        { stage: 'Location', label: 'San Francisco, US', detail: 'Verified US datacenter', status: 'SAFE' },
        { stage: 'Domain', label: 'github.com', detail: '18yr registered MarkMonitor', status: 'SAFE' },
        { stage: 'URL', label: 'github.com/settings', detail: 'No redirection or payload', status: 'SAFE' },
      ],
    },
  },
  {
    id: 'msg-002',
    threadId: 'th-002',
    sender: {
      name: 'Microsoft 365 Security',
      email: 'security-alert@login-micros0ft-support.com',
      domain: 'login-micros0ft-support.com',
      isVerifiedDomain: false,
    },
    recipient: {
      name: 'Milap Modi',
      email: 'milapmodi43@gmail.com',
    },
    subject: 'Action Required: Microsoft 365 Password Expiry & Immediate Credential Sync',
    snippet: 'Your corporate account credentials will expire in 2 hours. Review and retain your current password immediately to prevent active directory lockout.',
    bodyHtml: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1f1f1f; line-height: 1.5; max-width: 600px;">
        <div style="background-color: #d83b01; color: white; padding: 12px 18px; border-radius: 4px; font-weight: 600; font-size: 14px; margin-bottom: 20px;">
          CRITICAL NOTICE: Account Lockout Pending
        </div>
        <p style="font-size: 15px; margin-bottom: 16px;">Dear User,</p>
        <p style="font-size: 14px; color: #333;">Your Microsoft 365 enterprise directory password for <strong>milapmodi43@gmail.com</strong> has reached its mandatory 90-day lifecycle limit and is scheduled for automatic revocation at <strong>18:00 UTC today</strong>.</p>
        
        <p style="font-size: 14px; color: #333;">To retain your existing password or sync single sign-on tokens across all endpoints, you must validate your identity through our self-service directory management console:</p>
        
        <div style="margin: 28px 0;">
          <a href="https://login-micros0ft-support.com/auth/sync?user=milapmodi43" style="background-color: #0078d4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: 600; display: inline-block; font-size: 14px;">
            Retain Current Password & Sync
          </a>
        </div>

        <p style="font-size: 13px; color: #666;">Failure to complete synchronization will terminate your access to Teams, OneDrive, and Outlook Mail.</p>
        
        <div style="margin-top: 30px; padding-top: 15px; border-top: 1px solid #e5e5e5; font-size: 11px; color: #777;">
          Microsoft Corporation · One Microsoft Way, Redmond, WA 98052 · This is an automated system communication.
        </div>
      </div>
    `,
    date: 'Sep 7',
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 2, // 2 days ago
    isRead: false,
    isStarred: false,
    folder: 'important',
    labels: ['Important', 'Threats', 'Security'],
    threatStatus: 'PHISHING',
    analysis: {
      id: 'analysis-002',
      emailId: 'msg-002',
      analyzedAt: '2026-09-07T18:32:10Z',
      status: 'analyzed',
      riskScore: 94,
      riskLevel: 'CRITICAL',
      threatClassification: 'CREDENTIAL HARVESTING PHISHING',
      confidence: 97,
      summary: 'Severe threat: Typosquatting domain attempting impersonation of Microsoft 365. Contains weaponized credential-harvesting landing page and counterfeit authentication headers.',
      aiExplanation: 'The sender leverages domain "login-micros0ft-support.com" with an intentional 0 (zero) substitution mimicking Microsoft. The origin IP is hosted on a bulletproof hosting provider in Saint Petersburg. DMARC fails authentication with unaligned SPF. Urgent psychological pressure tactics detected.',
      mitreAttack: [
        { techniqueId: 'T1566.002', name: 'Spearphishing Link', tactic: 'Initial Access' },
        { techniqueId: 'T1598.003', name: 'Phishing for Information: Spearphishing Link', tactic: 'Reconnaissance' },
        { techniqueId: 'T1036.005', name: 'Masquerading: Match Legitimate Name or Location', tactic: 'Defense Evasion' },
      ],
      authentication: {
        spf: 'FAIL',
        spfDetails: 'IP 185.220.101.5 is not authorized by legitimate microsoft.com SPF policy',
        dkim: 'FAIL',
        dkimDetails: 'Signature body hash does not verify (a=rsa-sha256; d=login-micros0ft-support.com)',
        dmarc: 'FAIL',
        dmarcDetails: 'Header From domain does not align with DKIM/SPF envelope. Policy: quarantine/reject',
        aligned: false,
      },
      senderIntelligence: {
        displayName: 'Microsoft 365 Security',
        emailAddress: 'security-alert@login-micros0ft-support.com',
        domain: 'login-micros0ft-support.com',
        domainAge: '3 days (Registered 2026-09-04)',
        reputation: 'High Risk',
        registrar: 'NameCheap / PrivacyGuardian Proxy',
        creationDate: '2026-09-04',
        spfRecord: 'v=spf1 +all (Dangerous wildcard)',
      },
      ipIntelligence: {
        sourceIp: '185.220.101.5',
        isp: 'Zapp-Host Virtual Private Networks',
        asn: 'AS59796',
        country: 'Russian Federation',
        city: 'Saint Petersburg',
        countryCode: 'RU',
        organization: 'Offshore Hosting LLC',
        reputationScore: 12,
        isTorOrVpn: true,
      },
      domainIntelligence: {
        domain: 'login-micros0ft-support.com',
        registrar: 'NameCheap Inc.',
        created: '2026-09-04',
        expires: '2027-09-04',
        reputation: 'Blacklisted on 7 DNSBL feeds',
        dnsServers: ['ns1.bulletproof-dns.to', 'ns2.bulletproof-dns.to'],
        typosquattingTarget: 'microsoft.com (Levenshtein distance: 3)',
      },
      iocs: [
        { id: 'ioc-201', type: 'url', value: 'https://login-micros0ft-support.com/auth/sync?user=milapmodi43', threatLevel: 'MALICIOUS', reasons: ['Credential harvester', 'Phishing kit landing page'] },
        { id: 'ioc-202', type: 'domain', value: 'login-micros0ft-support.com', threatLevel: 'MALICIOUS', reasons: ['Typosquatting spoof', 'Newly registered (3 days old)'] },
        { id: 'ioc-203', type: 'ip', value: '185.220.101.5', threatLevel: 'MALICIOUS', reasons: ['Known bulletproof proxy', 'Flagged in Spamhaus ZEN'] },
        { id: 'ioc-204', type: 'email', value: 'security-alert@login-micros0ft-support.com', threatLevel: 'MALICIOUS', reasons: ['Impersonation source address'] },
      ],
      behavioralIndicators: [
        { id: 'bi-201', type: 'Urgent Threat Call-to-Action', description: 'Artificial 2-hour deadline designed to induce psychological duress', severity: 'critical' },
        { id: 'bi-202', type: 'Domain Typosquatting', description: 'Substituted "o" with numeric digit "0" (micros0ft)', severity: 'critical' },
        { id: 'bi-203', type: 'Credential Harvesting Link', description: 'Link points to untrusted external form querying directory passwords', severity: 'critical' },
        { id: 'bi-204', type: 'Brand Spoofing', description: 'Unauthorized usage of Microsoft 365 brand marks and visual styling', severity: 'warning' },
      ],
      detectedUrls: [
        {
          url: 'https://login-micros0ft-support.com/auth/sync?user=milapmodi43',
          domain: 'login-micros0ft-support.com',
          status: 'MALICIOUS',
          reasons: ['Weaponized phishing landing page', 'Credential capture endpoint', 'Unregistered Microsoft proxy'],
          destinationIp: '185.220.101.5',
        }
      ],
      chain: [
        { stage: 'Email', label: 'Received Header', detail: 'From unverified Russian transit IP', status: 'MALICIOUS' },
        { stage: 'Sender', label: 'login-micros0ft-support.com', detail: 'Typosquatting 3-day old domain', status: 'MALICIOUS' },
        { stage: 'IP', label: '185.220.101.5', detail: 'AS59796 Bulletproof ISP', status: 'MALICIOUS' },
        { stage: 'Location', label: 'Saint Petersburg, RU', detail: 'High threat anomaly score', status: 'MALICIOUS' },
        { stage: 'Domain', label: 'login-micros0ft-support.com', detail: 'Blacklisted across 7 DNSBL feeds', status: 'MALICIOUS' },
        { stage: 'URL', label: '.../auth/sync?user=...', detail: 'Direct POST credential harvesting kit', status: 'MALICIOUS' },
      ],
    },
  },
  {
    id: 'msg-003',
    threadId: 'th-003',
    sender: {
      name: 'MongoDB Atlas',
      email: 'cloud-support@mongodb.com',
      domain: 'mongodb.com',
      isVerifiedDomain: true,
    },
    recipient: {
      name: 'Milap Modi',
      email: 'milapmodi43@gmail.com',
    },
    subject: 'Invitation to collaborate on Project Alpha cluster',
    snippet: 'Sarah Jenkins invited you to join the "Project Alpha" MongoDB Atlas organization as Database Administrator.',
    bodyHtml: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #001e2b; line-height: 1.6;">
        <h2 style="color: #00684a; font-size: 20px; font-weight: 700; margin-bottom: 16px;">MongoDB Atlas Team Invitation</h2>
        <p style="font-size: 15px;">Hello Milap,</p>
        <p style="font-size: 15px;">Sarah Jenkins (sarah.j@enterprise-tech.io) has invited you to collaborate on the <strong>Project Alpha Cluster</strong> organization on MongoDB Cloud.</p>
        
        <div style="background-color: #f9fbfa; border: 1px solid #e8edeb; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="margin: 0 0 6px 0; font-size: 14px;"><strong>Assigned Role:</strong> Project Data Access Admin</p>
          <p style="margin: 0; font-size: 14px;"><strong>Organization:</strong> Enterprise Core Infrastructure</p>
        </div>

        <div style="margin: 24px 0;">
          <a href="https://cloud.mongodb.com/invitation?token=alpha-9821034" style="background-color: #00684a; color: white; padding: 11px 22px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
            Accept Atlas Invitation
          </a>
        </div>

        <p style="font-size: 13px; color: #5c6c75;">If you were not expecting this invitation, you can ignore this email or contact support at cloud-support@mongodb.com.</p>
      </div>
    `,
    date: 'Sep 9',
    timestamp: Date.now() - 1000 * 60 * 180, // 3 hrs ago
    isRead: true,
    isStarred: false,
    folder: 'inbox',
    labels: ['MongoDB', 'Cloud', 'Inbox'],
    threatStatus: 'SAFE',
    analysis: {
      id: 'analysis-003',
      emailId: 'msg-003',
      analyzedAt: '2026-09-09T11:45:22Z',
      status: 'analyzed',
      riskScore: 2,
      riskLevel: 'LOW RISK',
      threatClassification: 'LEGITIMATE COLLABORATION INVITE',
      confidence: 99,
      summary: 'Verified invitation from MongoDB Inc. Cryptographic DKIM matches mongodb.com. SPF and DMARC passing.',
      aiExplanation: 'Valid transactional email from SendGrid enterprise pool delegated for mongodb.com. All links resolve to cloud.mongodb.com behind valid TLS 1.3 certs.',
      mitreAttack: [],
      authentication: {
        spf: 'PASS',
        spfDetails: 'v=spf1 include:sendgrid.net include:mailgun.org ~all',
        dkim: 'PASS',
        dkimDetails: 'v=1; a=rsa-sha256; d=mongodb.com; s=s1; c=relaxed/relaxed',
        dmarc: 'PASS',
        dmarcDetails: 'v=DMARC1; p=reject; rua=mailto:dmarc@mongodb.com',
        aligned: true,
      },
      senderIntelligence: {
        displayName: 'MongoDB Atlas',
        emailAddress: 'cloud-support@mongodb.com',
        domain: 'mongodb.com',
        domainAge: '15 years',
        reputation: 'Clean',
        registrar: 'CSC Corporate Domains',
        creationDate: '2011-04-12',
      },
      ipIntelligence: {
        sourceIp: '167.89.86.12',
        isp: 'SendGrid Inc. / Twilio',
        asn: 'AS11377',
        country: 'United States',
        city: 'Denver',
        countryCode: 'US',
        organization: 'Twilio SendGrid Dedicated Relays',
        reputationScore: 96,
        isTorOrVpn: false,
      },
      domainIntelligence: {
        domain: 'mongodb.com',
        registrar: 'CSC Corporate Domains',
        created: '2011-04-12',
        expires: '2029-04-12',
        reputation: 'Clean Enterprise',
        dnsServers: ['ns-102.awsdns-12.com', 'ns-1492.awsdns-58.org'],
      },
      iocs: [
        { id: 'ioc-301', type: 'domain', value: 'mongodb.com', threatLevel: 'SAFE' },
        { id: 'ioc-302', type: 'url', value: 'https://cloud.mongodb.com/invitation?token=alpha-9821034', threatLevel: 'SAFE' },
      ],
      behavioralIndicators: [
        { id: 'bi-301', type: 'Strict Header Alignment', description: 'Sender envelope and DMARC From are 100% aligned', severity: 'info' }
      ],
      detectedUrls: [
        {
          url: 'https://cloud.mongodb.com/invitation?token=alpha-9821034',
          domain: 'cloud.mongodb.com',
          status: 'SAFE',
          reasons: ['Official MongoDB cloud subdomain', 'Valid high-assurance SSL certificate'],
        }
      ],
    },
  },
  {
    id: 'msg-004',
    threadId: 'th-004',
    sender: {
      name: 'Instagram Security',
      email: 'security@mail.instagram.com',
      domain: 'mail.instagram.com',
      isVerifiedDomain: true,
    },
    recipient: {
      name: 'Milap Modi',
      email: 'milapmodi43@gmail.com',
    },
    subject: 'New login from Firefox on Linux, Sofia Bulgaria',
    snippet: 'We noticed a login to your account @milapmodi from an unrecognized device in Sofia, Bulgaria on September 8 at 03:12 AM.',
    bodyHtml: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #262626; line-height: 1.5; max-width: 540px;">
        <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 12px; color: #262626;">Unusual Login Activity Detected</h3>
        <p style="font-size: 14px; margin-bottom: 16px;">We noticed a login to your Instagram account <strong>@milapmodi</strong> from a device or location you don't usually use:</p>
        
        <div style="background-color: #fafafa; border: 1px solid #dbdbdb; border-radius: 6px; padding: 14px; margin: 16px 0; font-size: 13px;">
          <p style="margin: 0 0 6px 0;"><strong>Device:</strong> Firefox on Linux x86_64</p>
          <p style="margin: 0 0 6px 0;"><strong>Location:</strong> Sofia, Sofia-Capital, Bulgaria</p>
          <p style="margin: 0;"><strong>IP Address:</strong> 94.156.71.182</p>
        </div>

        <p style="font-size: 14px;">If this was you, you can safely ignore this notification. If this wasn't you, please secure your account right now:</p>

        <div style="margin: 20px 0;">
          <a href="https://instagram.com/accounts/security/change_password" style="background-color: #0095f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: 600; display: inline-block; font-size: 13px;">
            Secure Your Account
          </a>
        </div>
        
        <p style="font-size: 12px; color: #8e8e8e;">From Meta Platforms, Inc. · 1 Hacker Way, Menlo Park, CA 94025</p>
      </div>
    `,
    date: 'Sep 8',
    timestamp: Date.now() - 1000 * 60 * 60 * 28, // 28 hours ago
    isRead: true,
    isStarred: false,
    folder: 'inbox',
    labels: ['Instagram', 'Security Alert'],
    threatStatus: 'SUSPICIOUS',
    analysis: {
      id: 'analysis-004',
      emailId: 'msg-004',
      analyzedAt: '2026-09-08T07:22:15Z',
      status: 'analyzed',
      riskScore: 52,
      riskLevel: 'MODERATE RISK',
      threatClassification: 'AUTHENTIC ALERT - ACTIVE COMPROMISE INDICATOR',
      confidence: 91,
      summary: 'Email itself is legitimate and originated from Meta Platforms, but describes an active unauthorized credential compromise from an anomalous geographic IP.',
      aiExplanation: 'Email cryptographic authentication passes (Meta/Instagram DMARC pass). However, MailForensix threat intelligence flags the reported session IP (94.156.71.182) as a known residential proxy network associated with automated credential stuffing campaigns.',
      mitreAttack: [
        { techniqueId: 'T1110.004', name: 'Credential Stuffing', tactic: 'Credential Access' },
      ],
      authentication: {
        spf: 'PASS',
        spfDetails: 'v=spf1 include:mail.instagram.com ip4:66.220.144.0/20 -all',
        dkim: 'PASS',
        dkimDetails: 'v=1; a=rsa-sha256; d=mail.instagram.com; s=s1024',
        dmarc: 'PASS',
        dmarcDetails: 'v=DMARC1; p=reject; pct=100; sp=reject',
        aligned: true,
      },
      senderIntelligence: {
        displayName: 'Instagram Security',
        emailAddress: 'security@mail.instagram.com',
        domain: 'mail.instagram.com',
        domainAge: '14 years',
        reputation: 'Clean Verified Enterprise',
        registrar: 'RegistrarSafe, LLC',
        creationDate: '2012-06-04',
      },
      ipIntelligence: {
        sourceIp: '66.220.144.135',
        isp: 'Meta Platforms, Inc.',
        asn: 'AS32934',
        country: 'United States',
        city: 'Prineville',
        countryCode: 'US',
        organization: 'Meta Data Center Network',
        reputationScore: 95,
        isTorOrVpn: false,
      },
      domainIntelligence: {
        domain: 'mail.instagram.com',
        registrar: 'RegistrarSafe, LLC',
        created: '2012-06-04',
        expires: '2028-06-04',
        reputation: 'Official Meta Mail Exchanger',
        dnsServers: ['a.ns.instagram.com', 'b.ns.instagram.com'],
      },
      iocs: [
        { id: 'ioc-401', type: 'ip', value: '94.156.71.182', threatLevel: 'SUSPICIOUS', reasons: ['Reported login IP in Sofia, BG', 'Associated with SOCKS5 proxy rotate'] },
        { id: 'ioc-402', type: 'url', value: 'https://instagram.com/accounts/security/change_password', threatLevel: 'SAFE' },
      ],
      behavioralIndicators: [
        { id: 'bi-401', type: 'Anomalous Geolocation', description: 'Session initialized 5,800 miles away from user primary location', severity: 'warning' },
        { id: 'bi-402', type: 'Unusual User-Agent', description: 'Linux headless browser fingerprint detected on target account', severity: 'warning' },
      ],
      detectedUrls: [
        {
          url: 'https://instagram.com/accounts/security/change_password',
          domain: 'instagram.com',
          status: 'SAFE',
          reasons: ['Official Instagram security recovery endpoint'],
        }
      ],
    },
  },
  {
    id: 'msg-005',
    threadId: 'th-005',
    sender: {
      name: 'DocuSign Document Service',
      email: 'dse@docu-sign-verify-cloud.net',
      domain: 'docu-sign-verify-cloud.net',
      isVerifiedDomain: false,
    },
    recipient: {
      name: 'Milap Modi',
      email: 'milapmodi43@gmail.com',
    },
    subject: 'Financial Statement Review - Immediate Signature Required',
    snippet: 'Auditing Department sent you "Q3_Consolidated_Audit_Report.pdf" to review and sign before close of business today.',
    bodyHtml: `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5; max-width: 580px;">
        <div style="background-color: #2e3192; padding: 16px; border-radius: 4px; text-align: center;">
          <span style="color: white; font-size: 20px; font-weight: bold; letter-spacing: 1px;">DocuSign Electronic Routing</span>
        </div>
        <div style="padding: 20px; border: 1px solid #e2e2e2; border-top: none; border-radius: 0 0 4px 4px;">
          <p style="font-size: 15px; font-weight: bold; color: #222;">Review and sign document today</p>
          <p style="font-size: 14px;"><strong>Corporate Auditing Committee</strong> sent you a mandatory disclosure statement to complete via secure envelope.</p>
          
          <div style="background-color: #fff9e6; border-left: 4px solid #fbb03b; padding: 12px; margin: 16px 0; font-size: 13px;">
            Document: <strong>Q3_Consolidated_Audit_Report.pdf</strong><br />
            Expires: Today at 23:59 PST
          </div>

          <div style="text-align: center; margin: 24px 0;">
            <a href="https://docu-sign-verify-cloud.net/dse/view-envelope?id=98212-audit" style="background-color: #ffcc00; color: #222; font-weight: bold; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block; font-size: 15px;">
              VIEW COMPLETED ENVELOPE
            </a>
          </div>

          <p style="font-size: 12px; color: #777;">Do not share this email. The links are personalized to your identity.</p>
        </div>
      </div>
    `,
    date: 'Sep 6',
    timestamp: Date.now() - 1000 * 60 * 60 * 72,
    isRead: false,
    isStarred: false,
    folder: 'spam',
    labels: ['Spam', 'Threats'],
    threatStatus: 'BEC',
    attachments: [
      {
        id: 'att-501',
        name: 'Q3_Consolidated_Audit_Report.pdf.html',
        size: '142 KB',
        type: 'text/html',
        status: 'Malicious',
        sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
      }
    ],
    analysis: {
      id: 'analysis-005',
      emailId: 'msg-005',
      analyzedAt: '2026-09-06T14:10:00Z',
      status: 'analyzed',
      riskScore: 96,
      riskLevel: 'CRITICAL',
      threatClassification: 'BUSINESS EMAIL COMPROMISE (BEC) & PHISHING',
      confidence: 98,
      summary: 'Critical BEC campaign imitating DocuSign electronic signature services. Contains a double-extension HTML credential smuggling attachment and spoofed lookup infrastructure.',
      aiExplanation: 'The domain "docu-sign-verify-cloud.net" is unassociated with official DocuSign infrastructure (docusign.com / docusign.net). The attachment masquerades as a PDF but utilizes an .html suffix to execute an obfuscated SVG/JS login prompt designed to harvest Office 365 tokens.',
      mitreAttack: [
        { techniqueId: 'T1566.001', name: 'Spearphishing Attachment', tactic: 'Initial Access' },
        { techniqueId: 'T1027.006', name: 'HTML Smuggling', tactic: 'Defense Evasion' },
      ],
      authentication: {
        spf: 'FAIL',
        spfDetails: 'Sender IP 194.26.29.11 not permitted in official docusign.com SPF records',
        dkim: 'FAIL',
        dkimDetails: 'DKIM signature invalid or forged for domain docu-sign-verify-cloud.net',
        dmarc: 'FAIL',
        dmarcDetails: 'Strict DMARC failure on sender domain impersonation',
        aligned: false,
      },
      senderIntelligence: {
        displayName: 'DocuSign Document Service',
        emailAddress: 'dse@docu-sign-verify-cloud.net',
        domain: 'docu-sign-verify-cloud.net',
        domainAge: '5 days (Registered 2026-09-01)',
        reputation: 'High Risk',
        registrar: 'Tucows Domains Inc.',
        creationDate: '2026-09-01',
      },
      ipIntelligence: {
        sourceIp: '194.26.29.11',
        isp: 'Bacloud Datacenter LT',
        asn: 'AS44050',
        country: 'Lithuania',
        city: 'Vilnius',
        countryCode: 'LT',
        organization: 'Host Universal Cloud Hosting',
        reputationScore: 8,
        isTorOrVpn: true,
      },
      domainIntelligence: {
        domain: 'docu-sign-verify-cloud.net',
        registrar: 'Tucows Domains Inc.',
        created: '2026-09-01',
        expires: '2027-09-01',
        reputation: 'Flagged by PhishTank & Google Safe Browsing',
        dnsServers: ['ns1.free-dns-zone.org', 'ns2.free-dns-zone.org'],
        typosquattingTarget: 'docusign.com',
      },
      iocs: [
        { id: 'ioc-501', type: 'domain', value: 'docu-sign-verify-cloud.net', threatLevel: 'MALICIOUS', reasons: ['DocuSign spoofing brand mimic'] },
        { id: 'ioc-502', type: 'url', value: 'https://docu-sign-verify-cloud.net/dse/view-envelope?id=98212-audit', threatLevel: 'MALICIOUS', reasons: ['Payload delivery URL'] },
        { id: 'ioc-503', type: 'hash', value: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08', threatLevel: 'MALICIOUS', reasons: ['HTML smuggling dropper payload'] },
        { id: 'ioc-504', type: 'ip', value: '194.26.29.11', threatLevel: 'MALICIOUS', reasons: ['Lithuanian bulletproof proxy server'] },
      ],
      behavioralIndicators: [
        { id: 'bi-501', type: 'Double Extension Masking', description: 'File named .pdf.html designed to deceive email clients', severity: 'critical' },
        { id: 'bi-502', type: 'Brand Hijacking', description: 'Counterfeit DocuSign header styling and corporate logos', severity: 'critical' },
        { id: 'bi-503', type: 'High Urgency Financial Review', description: 'Presents time-sensitive audit compliance requirement', severity: 'warning' },
      ],
      detectedUrls: [
        {
          url: 'https://docu-sign-verify-cloud.net/dse/view-envelope?id=98212-audit',
          domain: 'docu-sign-verify-cloud.net',
          status: 'MALICIOUS',
          reasons: ['Credential theft portal', 'Unregistered domain proxy'],
          destinationIp: '194.26.29.11',
        }
      ],
      chain: [
        { stage: 'Email', label: 'Inbound Envelope', detail: 'From Bacloud Datacenter 194.26.29.11', status: 'MALICIOUS' },
        { stage: 'Sender', label: 'dse@docu-sign-verify-cloud.net', detail: 'Impersonation of DocuSign sender', status: 'MALICIOUS' },
        { stage: 'IP', label: '194.26.29.11', detail: 'Lithuania AS44050', status: 'MALICIOUS' },
        { stage: 'Location', label: 'Vilnius, LT', detail: 'Flagged cybercrime proxy host', status: 'MALICIOUS' },
        { stage: 'Domain', label: 'docu-sign-verify-cloud.net', detail: 'Lookalike domain registered 5 days ago', status: 'MALICIOUS' },
        { stage: 'URL', label: '.../dse/view-envelope', detail: 'HTML smuggling payload', status: 'MALICIOUS' },
      ],
    },
  },
  {
    id: 'msg-006',
    threadId: 'th-006',
    sender: {
      name: 'Amazon Web Services',
      email: 'no-reply-aws@amazon.com',
      domain: 'amazon.com',
      isVerifiedDomain: true,
    },
    recipient: {
      name: 'Milap Modi',
      email: 'milapmodi43@gmail.com',
    },
    subject: 'Amazon Web Services Invoice Available - Account #47640538761',
    snippet: 'Your AWS billing statement for the month of August 2026 is now available for download in the AWS Billing Console.',
    bodyHtml: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #16191f; line-height: 1.5; max-width: 600px;">
        <h2 style="font-size: 18px; color: #232f3e; margin-bottom: 12px;">AWS Billing Statement Available</h2>
        <p style="font-size: 14px;">Greetings from Amazon Web Services,</p>
        <p style="font-size: 14px;">Your latest monthly invoice for billing cycle August 2026 is now ready in the AWS Management Console for account <strong>47640538761</strong>.</p>
        
        <div style="background-color: #f2f3f3; padding: 14px 18px; border-radius: 4px; margin: 18px 0; font-size: 14px;">
          <p style="margin: 0 0 6px 0;"><strong>Total Amount Due:</strong> $42.18 USD</p>
          <p style="margin: 0;"><strong>Automatic Charge Date:</strong> Sep 12, 2026</p>
        </div>

        <p style="font-size: 14px;">You can view detailed itemized breakdown and usage metrics at <a href="https://console.aws.amazon.com/billing/home" style="color: #0073bb; text-decoration: underline;">AWS Billing Dashboard</a>.</p>
        
        <div style="margin-top: 30px; font-size: 11px; color: #545b64; border-top: 1px solid #eaeded; padding-top: 14px;">
          Amazon Web Services, Inc. · 410 Terry Avenue North, Seattle, WA 98109-5210
        </div>
      </div>
    `,
    date: 'Sep 5',
    timestamp: Date.now() - 1000 * 60 * 60 * 96,
    isRead: true,
    isStarred: false,
    folder: 'inbox',
    labels: ['AWS', 'Invoices', 'Inbox'],
    threatStatus: 'SAFE',
    attachments: [
      {
        id: 'att-601',
        name: 'AWS_Invoice_Aug2026.pdf',
        size: '184 KB',
        type: 'application/pdf',
        status: 'Clean',
        sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      }
    ],
    analysis: {
      id: 'analysis-006',
      emailId: 'msg-006',
      analyzedAt: '2026-09-05T09:12:00Z',
      status: 'analyzed',
      riskScore: 3,
      riskLevel: 'LOW RISK',
      threatClassification: 'AUTHENTIC BILLING NOTIFICATION',
      confidence: 99,
      summary: 'Valid AWS billing dispatch with verified cryptographic Amazon SES signatures and legitimate attachment.',
      aiExplanation: 'Originating IP belongs to Amazon.com AS16509. DMARC policy evaluated to pass with 100% strict alignment.',
      authentication: {
        spf: 'PASS',
        spfDetails: 'v=spf1 include:amazon.com ~all',
        dkim: 'PASS',
        dkimDetails: 'v=1; a=rsa-sha256; d=amazon.com; s=amazon2024',
        dmarc: 'PASS',
        dmarcDetails: 'v=DMARC1; p=reject; pct=100',
        aligned: true,
      },
      senderIntelligence: {
        displayName: 'Amazon Web Services',
        emailAddress: 'no-reply-aws@amazon.com',
        domain: 'amazon.com',
        domainAge: '31 years',
        reputation: 'Clean',
        registrar: 'MarkMonitor Inc.',
        creationDate: '1994-11-01',
      },
      ipIntelligence: {
        sourceIp: '54.240.27.12',
        isp: 'Amazon.com, Inc.',
        asn: 'AS16509',
        country: 'United States',
        city: 'Seattle',
        countryCode: 'US',
        organization: 'Amazon Web Services Infrastructure',
        reputationScore: 99,
        isTorOrVpn: false,
      },
      domainIntelligence: {
        domain: 'amazon.com',
        registrar: 'MarkMonitor Inc.',
        created: '1994-11-01',
        expires: '2030-10-31',
        reputation: 'Clean Global Enterprise',
        dnsServers: ['ns1.p31.dynect.net', 'ns2.p31.dynect.net'],
      },
      iocs: [
        { id: 'ioc-601', type: 'domain', value: 'amazon.com', threatLevel: 'SAFE' },
        { id: 'ioc-602', type: 'url', value: 'https://console.aws.amazon.com/billing/home', threatLevel: 'SAFE' },
      ],
      behavioralIndicators: [],
      detectedUrls: [
        {
          url: 'https://console.aws.amazon.com/billing/home',
          domain: 'amazon.com',
          status: 'SAFE',
          reasons: ['Official AWS portal', 'Secured with high assurance SSL'],
        }
      ],
    },
  },
  {
    id: 'msg-007',
    threadId: 'th-007',
    sender: {
      name: 'David Sterling (Executive Office)',
      email: 'ceo.david.sterling@exec-corporation-board.com',
      domain: 'exec-corporation-board.com',
      isVerifiedDomain: false,
    },
    recipient: {
      name: 'Milap Modi',
      email: 'milapmodi43@gmail.com',
    },
    subject: 'CONFIDENTIAL: Urgent Wire Transfer Authorization - Project Meridian',
    snippet: 'Milap, are you currently at your desk? Need you to facilitate an urgent wire settlement for our closing escrow before 4 PM.',
    bodyHtml: `
      <div style="font-family: Arial, sans-serif; color: #111; line-height: 1.6;">
        <p>Milap,</p>
        <p>Are you available at your desk right now? I am currently in back-to-back board meetings regarding the Project Meridian acquisition closing.</p>
        <p>Our lead outside counsel notified us that the initial $87,400 earnest retainer must be wired prior to 4:00 PM EST to avoid defaulting on the escrow agreement. I need you to execute this payment through our corporate treasury immediately.</p>
        <p>Please reply directly to this email so I can forward the updated wiring routing numbers and account documentation. <strong>Keep this strictly confidential between us for SEC disclosure compliance until Monday.</strong></p>
        <br />
        <p>Best regards,</p>
        <p><strong>David Sterling</strong><br />Chief Executive Officer & Chairman</p>
      </div>
    `,
    date: 'Sep 4',
    timestamp: Date.now() - 1000 * 60 * 60 * 120,
    isRead: false,
    isStarred: true,
    folder: 'important',
    labels: ['Important', 'Executive', 'Threats'],
    threatStatus: 'IMPERSONATION',
    analysis: {
      id: 'analysis-007',
      emailId: 'msg-007',
      analyzedAt: '2026-09-04T16:05:30Z',
      status: 'analyzed',
      riskScore: 92,
      riskLevel: 'CRITICAL',
      threatClassification: 'EXECUTIVE IMPERSONATION (CEO FRAUD)',
      confidence: 96,
      summary: 'Targeted Business Email Compromise: Impersonation of company leadership requesting unauthorized emergency wire funds transfer while demanding secrecy.',
      aiExplanation: 'The sender uses display name spoofing ("David Sterling") paired with a newly registered external lookalike domain "exec-corporation-board.com". Text matches classic CEO Fraud indicators: urgent wire request, request for secrecy, and claims of being unavailable in meetings.',
      mitreAttack: [
        { techniqueId: 'T1566.002', name: 'Spearphishing', tactic: 'Initial Access' },
        { techniqueId: 'T1036.005', name: 'Masquerading: Match Legitimate Name', tactic: 'Defense Evasion' },
      ],
      authentication: {
        spf: 'SOFTFAIL',
        spfDetails: 'v=spf1 ~all - Originates from random public webmail server',
        dkim: 'NONE',
        dkimDetails: 'No DKIM signature found on incoming message',
        dmarc: 'FAIL',
        dmarcDetails: 'Domain does not provide valid DMARC policy record',
        aligned: false,
      },
      senderIntelligence: {
        displayName: 'David Sterling (Executive Office)',
        emailAddress: 'ceo.david.sterling@exec-corporation-board.com',
        domain: 'exec-corporation-board.com',
        domainAge: '2 days (Registered 2026-09-02)',
        reputation: 'High Risk',
        registrar: 'Hostinger Operations, UAB',
        creationDate: '2026-09-02',
      },
      ipIntelligence: {
        sourceIp: '109.236.81.44',
        isp: 'WorldStream B.V.',
        asn: 'AS49981',
        country: 'Netherlands',
        city: 'Naaldwijk',
        countryCode: 'NL',
        organization: 'Worldstream Shared Servers',
        reputationScore: 15,
        isTorOrVpn: false,
      },
      domainIntelligence: {
        domain: 'exec-corporation-board.com',
        registrar: 'Hostinger Operations, UAB',
        created: '2026-09-02',
        expires: '2027-09-02',
        reputation: 'Identified in recent threat actor infrastructure dump',
        dnsServers: ['ns1.dns-parking.com', 'ns2.dns-parking.com'],
      },
      iocs: [
        { id: 'ioc-701', type: 'domain', value: 'exec-corporation-board.com', threatLevel: 'MALICIOUS', reasons: ['Brand impersonation', 'Executive impersonation infrastructure'] },
        { id: 'ioc-702', type: 'email', value: 'ceo.david.sterling@exec-corporation-board.com', threatLevel: 'MALICIOUS', reasons: ['Spoofed CEO address'] },
        { id: 'ioc-703', type: 'ip', value: '109.236.81.44', threatLevel: 'SUSPICIOUS', reasons: ['Known commercial relay host'] },
      ],
      behavioralIndicators: [
        { id: 'bi-701', type: 'Wire Transfer Demand', description: 'Explicit request for urgent escrow fund execution ($87,400)', severity: 'critical' },
        { id: 'bi-702', type: 'Executive Display Name Spoofing', description: 'Display name matches CEO, sender domain is unassociated third-party', severity: 'critical' },
        { id: 'bi-703', type: 'Enforced Secrecy', description: 'Instructs recipient not to disclose action or consult peer staff', severity: 'critical' },
        { id: 'bi-704', type: 'Meeting Excuse / Out of Office', description: 'Fabricates inaccessibility ("in back-to-back board meetings") to avoid voice verification', severity: 'warning' },
      ],
      detectedUrls: [],
      chain: [
        { stage: 'Email', label: 'Message Transmission', detail: 'Received via Netherlands WorldStream AS49981', status: 'MALICIOUS' },
        { stage: 'Sender', label: 'exec-corporation-board.com', detail: 'Impersonates CEO David Sterling', status: 'MALICIOUS' },
        { stage: 'IP', label: '109.236.81.44', detail: 'Netherlands bulletproof relay', status: 'SUSPICIOUS' },
        { stage: 'Domain', label: 'exec-corporation-board.com', detail: 'Registered 2 days ago via Hostinger', status: 'MALICIOUS' },
      ],
    },
  },
  {
    id: 'msg-008',
    threadId: 'th-008',
    sender: {
      name: 'DHL Express Dispatch',
      email: 'delivery-notice@dhl-express-tracking-portal.com',
      domain: 'dhl-express-tracking-portal.com',
      isVerifiedDomain: false,
    },
    recipient: {
      name: 'Milap Modi',
      email: 'milapmodi43@gmail.com',
    },
    subject: 'Action Required: Parcel #US8921102 on hold - Customs Fee Unpaid',
    snippet: 'Your international shipment #US8921102 could not be cleared due to outstanding regional import duty ($3.45). Download receipt.',
    bodyHtml: `
      <div style="font-family: Arial, Helvetica, sans-serif; color: #222; line-height: 1.5; max-width: 580px;">
        <div style="background-color: #fc0; padding: 16px; border-bottom: 3px solid #d40511;">
          <h2 style="margin: 0; color: #d40511; font-size: 22px; font-weight: bold;">DHL EXPRESS NOTICE</h2>
        </div>
        <div style="padding: 20px; background-color: #fff; border: 1px solid #ddd; border-top: none;">
          <p style="font-size: 15px; margin-top: 0;">Dear Customer,</p>
          <p style="font-size: 14px;">Your international courier package with tracking number <strong>#US8921102</strong> has arrived at our regional hub but is currently on hold by customs authorities.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px;">
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px 0; color: #666;">Tracking ID:</td>
              <td style="padding: 8px 0; font-weight: bold;">DHL-US8921102-EXP</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px 0; color: #666;">Status:</td>
              <td style="padding: 8px 0; color: #d40511; font-weight: bold;">Customs Processing Delayed</td>
            </tr>
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 8px 0; color: #666;">Unpaid Fee:</td>
              <td style="padding: 8px 0; font-weight: bold;">$3.45 USD</td>
            </tr>
          </table>

          <p style="font-size: 14px;">Please open the attached automated customs dispatch bill to pay and print the authorization label.</p>
        </div>
      </div>
    `,
    date: 'Sep 3',
    timestamp: Date.now() - 1000 * 60 * 60 * 140,
    isRead: false,
    isStarred: false,
    folder: 'spam',
    labels: ['Spam', 'Threats'],
    threatStatus: 'MALICIOUS',
    attachments: [
      {
        id: 'att-801',
        name: 'DHL_Customs_Duty_Invoice_8921102.pdf.exe',
        size: '2.4 MB',
        type: 'application/x-msdownload',
        status: 'Malicious',
        sha256: 'a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0',
      }
    ],
    analysis: {
      id: 'analysis-008',
      emailId: 'msg-008',
      analyzedAt: '2026-09-03T11:20:00Z',
      status: 'analyzed',
      riskScore: 98,
      riskLevel: 'CRITICAL',
      threatClassification: 'MALICIOUS ATTACHMENT (TROJAN DROPPER)',
      confidence: 99,
      summary: 'High-severity malware delivery campaign. The attached file uses double extension technique to disguise a PE executable trojan payload.',
      aiExplanation: 'Static analysis of attachment "DHL_Customs_Duty_Invoice_8921102.pdf.exe" identifies high entropy and packed sections corresponding to AsyncRAT info-stealer. SPF and DMARC failing against legitimate dhl.com records.',
      mitreAttack: [
        { techniqueId: 'T1204.002', name: 'User Execution: Malicious File', tactic: 'Execution' },
        { techniqueId: 'T1036.007', name: 'Double File Extension', tactic: 'Defense Evasion' },
      ],
      authentication: {
        spf: 'FAIL',
        spfDetails: 'v=spf1 -all (IP 185.196.8.44 unlisted)',
        dkim: 'FAIL',
        dkimDetails: 'Signature forged',
        dmarc: 'FAIL',
        dmarcDetails: 'Header domain not aligned with dhl.com',
        aligned: false,
      },
      senderIntelligence: {
        displayName: 'DHL Express Dispatch',
        emailAddress: 'delivery-notice@dhl-express-tracking-portal.com',
        domain: 'dhl-express-tracking-portal.com',
        domainAge: '4 days old',
        reputation: 'High Risk / Malicious',
        registrar: 'Regtime Ltd',
        creationDate: '2026-08-30',
      },
      ipIntelligence: {
        sourceIp: '185.196.8.44',
        isp: 'Bite LLC / FastFlux',
        asn: 'AS208046',
        country: 'Romania',
        city: 'Bucharest',
        countryCode: 'RO',
        organization: 'Eastern Euro FastFlux Network',
        reputationScore: 4,
        isTorOrVpn: true,
      },
      domainIntelligence: {
        domain: 'dhl-express-tracking-portal.com',
        registrar: 'Regtime Ltd',
        created: '2026-08-30',
        expires: '2027-08-30',
        reputation: 'Flagged on 12 AV engines',
        dnsServers: ['ns1.fastflux-relay.com', 'ns2.fastflux-relay.com'],
      },
      iocs: [
        { id: 'ioc-801', type: 'hash', value: 'a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0', threatLevel: 'MALICIOUS', reasons: ['AsyncRAT InfoStealer signature match'] },
        { id: 'ioc-802', type: 'domain', value: 'dhl-express-tracking-portal.com', threatLevel: 'MALICIOUS', reasons: ['DHL brand spoofing domain'] },
        { id: 'ioc-803', type: 'ip', value: '185.196.8.44', threatLevel: 'MALICIOUS', reasons: ['FastFlux command-and-control node'] },
      ],
      behavioralIndicators: [
        { id: 'bi-801', type: 'Double Extension', description: 'Executable masked with .pdf.exe extension', severity: 'critical' },
        { id: 'bi-802', type: 'Low Dollar Lure ($3.45)', description: 'Trivial fee requested to encourage quick thoughtless compliance', severity: 'warning' },
      ],
      detectedUrls: [],
    },
  },
  {
    id: 'msg-009',
    threadId: 'th-009',
    sender: {
      name: 'Stripe Payments',
      email: 'notifications@stripe.com',
      domain: 'stripe.com',
      isVerifiedDomain: true,
    },
    recipient: {
      name: 'Milap Modi',
      email: 'milapmodi43@gmail.com',
    },
    subject: 'Payout of $4,850.00 sent to your Chase bank account',
    snippet: 'Your scheduled daily payout of $4,850.00 USD has been initiated and should arrive in your bank account in 1-2 business days.',
    bodyHtml: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #3c4257; line-height: 1.6; max-width: 560px;">
        <h2 style="color: #635bff; font-size: 20px; font-weight: 700; margin-bottom: 16px;">Stripe Payout Initiated</h2>
        <p style="font-size: 15px;">Hi Milap,</p>
        <p style="font-size: 15px;">A payout of <strong>$4,850.00 USD</strong> is on its way to your account ending in <strong>•••• 4019</strong>.</p>
        
        <div style="background-color: #f7fafc; border: 1px solid #e3e8ee; border-radius: 8px; padding: 16px; margin: 20px 0; font-size: 14px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="color: #697386;">Payout ID</span>
            <span style="font-family: monospace; font-weight: 600;">po_1P9x82019al</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #697386;">Expected Arrival</span>
            <span style="font-weight: 600;">September 4, 2026</span>
          </div>
        </div>

        <p style="font-size: 14px;">You can view the breakdown of transactions in your <a href="https://dashboard.stripe.com/payouts" style="color: #635bff; text-decoration: underline;">Stripe Dashboard</a>.</p>
      </div>
    `,
    date: 'Sep 2',
    timestamp: Date.now() - 1000 * 60 * 60 * 160,
    isRead: true,
    isStarred: true,
    folder: 'inbox',
    labels: ['Finance', 'Stripe'],
    threatStatus: 'SAFE',
    analysis: {
      id: 'analysis-009',
      emailId: 'msg-009',
      analyzedAt: '2026-09-02T10:00:00Z',
      status: 'analyzed',
      riskScore: 1,
      riskLevel: 'LOW RISK',
      threatClassification: 'VERIFIED FINANCIAL TRANSACTION',
      confidence: 100,
      summary: 'Cryptographically authentic payout receipt from Stripe Inc. All transport security criteria and DMARC passing.',
      aiExplanation: 'Valid DKIM signature verified against stripe.com 2048-bit key. Origin IP matches official Stripe mail relays.',
      authentication: {
        spf: 'PASS',
        spfDetails: 'v=spf1 include:stripe.com ~all',
        dkim: 'PASS',
        dkimDetails: 'v=1; a=rsa-sha256; d=stripe.com; s=m1; c=relaxed/relaxed',
        dmarc: 'PASS',
        dmarcDetails: 'v=DMARC1; p=reject; pct=100',
        aligned: true,
      },
      senderIntelligence: {
        displayName: 'Stripe Payments',
        emailAddress: 'notifications@stripe.com',
        domain: 'stripe.com',
        domainAge: '15 years',
        reputation: 'Clean Verified Global',
        registrar: 'MarkMonitor Inc.',
        creationDate: '2011-02-14',
      },
      ipIntelligence: {
        sourceIp: '54.187.174.85',
        isp: 'Stripe, Inc.',
        asn: 'AS16509',
        country: 'United States',
        city: 'Portland',
        countryCode: 'US',
        organization: 'Stripe Global Transit',
        reputationScore: 99,
        isTorOrVpn: false,
      },
      domainIntelligence: {
        domain: 'stripe.com',
        registrar: 'MarkMonitor Inc.',
        created: '2011-02-14',
        expires: '2031-02-14',
        reputation: 'Clean Top Enterprise',
        dnsServers: ['ns-105.awsdns-13.com', 'ns-1854.awsdns-39.co.uk'],
      },
      iocs: [
        { id: 'ioc-901', type: 'domain', value: 'stripe.com', threatLevel: 'SAFE' },
        { id: 'ioc-902', type: 'url', value: 'https://dashboard.stripe.com/payouts', threatLevel: 'SAFE' },
      ],
      behavioralIndicators: [],
      detectedUrls: [
        {
          url: 'https://dashboard.stripe.com/payouts',
          domain: 'stripe.com',
          status: 'SAFE',
          reasons: ['Official Stripe merchant dashboard'],
        }
      ],
    },
  },
  {
    id: 'msg-010',
    threadId: 'th-010',
    sender: {
      name: 'Internal DevSecOps Lead',
      email: 'sec-ops@internal-company.net',
      domain: 'internal-company.net',
      isVerifiedDomain: true,
    },
    recipient: {
      name: 'Milap Modi',
      email: 'milapmodi43@gmail.com',
    },
    subject: 'Pending Threat Review: New Inbound Suspicious Sample Attached',
    snippet: 'Team, please review the raw EML extract received on the security triage inbox. Needs full threat correlation.',
    bodyHtml: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #111; line-height: 1.6;">
        <p>Milap,</p>
        <p>A suspicious message bypass report was escalated by the tier 1 SOC queue. The raw mail sample has been parsed into your workspace queue for forensic correlation.</p>
        <p>Please run the full MailForensix analysis engine on this item to extract IOC signatures, inspect domain WHOIS registration delta, and evaluate MITRE ATT&CK technique classifications.</p>
        <div style="background-color: #f1f5f9; border-left: 4px solid #00c896; padding: 12px; margin: 16px 0; font-size: 13px;">
          Status: <strong>Awaiting Analyst Triggered Deep Scan</strong>
        </div>
      </div>
    `,
    date: 'Just now',
    timestamp: Date.now() - 1000 * 60 * 5, // 5 mins ago
    isRead: false,
    isStarred: false,
    folder: 'inbox',
    labels: ['Inbox', 'Pending Analysis'],
    threatStatus: 'NOT_ANALYZED', // Allows user to click "Run Full Analysis"
  },
];
