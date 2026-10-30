import { Guide } from "@/types/guide";

export const googleDriveGuide: Guide = {
  slug: "google-drive",
  provider_name: "Google Drive (Google Workspace)",
  category: "Cloud Storage & Files",
  description:
    "Integrating Google Drive file storage, creation, and synchronization via Google Cloud OAuth 2.0 with scope-based verification tiers.",
  official_domain: "google.com",
  documentation_urls: [
    "https://developers.google.com/workspace/drive/api/guides/api-specific-auth",
    "https://developers.google.com/identity/protocols/oauth2",
    "https://support.google.com/cloud/answer/13463817",
    "https://developers.google.com/identity/protocols/oauth2/production-readiness",
  ],
  oauth_portal_url: "https://console.cloud.google.com/apis/credentials",
  last_researched_at: "2026-10-30",
  research_status: "verified",
  readiness_summary:
    "Multi-tiered readiness. Testing mode is instant but limited to 100 test users with 7-day token expiration. Production release using standard scopes (`drive.file`) requires basic verification. Using broad restricted scopes (`drive`, `drive.readonly`) mandates Google Trust & Safety verification and an annual CASA Tier 2/3 independent security assessment.",
  complexity: "Very High",
  is_seed: true,
  readiness: {
    development: {
      title: "Testing Mode (Google Cloud Console)",
      status: "Instant with Severe Limitations",
      summary:
        "Apps start in 'Testing' publishing status. Useful for initial development with explicitly whitelisted test accounts.",
      allowed_users: "Up to 100 explicitly listed Google test accounts.",
      verification_required: false,
      details: [
        "Unverified app warning screen displayed to users upon authorization ('Google hasn't verified this app').",
        "Authorizing users must click 'Advanced' -> 'Go to app (unsafe)' to proceed.",
        "Refresh tokens expire automatically after 7 days for external apps in testing status.",
      ],
    },
    external_testing: {
      title: "Internal Audience (Google Workspace) vs External Testing",
      status: "Instant for Workspace Organizations; Limited for External",
      summary:
        "If configured with 'Internal' user type within a Google Workspace domain, zero verification is needed. If 'External', users remain capped at 100 test accounts.",
      allowed_users: "All corporate domain users (Internal) OR 100 test users (External).",
      verification_required: "None for Internal; Verification required to uncap External testing.",
      details: [
        "Internal user type is only available to Google Workspace customers, not personal @gmail accounts.",
        "External apps requesting sensitive or restricted scopes cannot onboard external beta testers without verification or explicit test-user addition.",
      ],
    },
    public_distribution: {
      title: "Public External Production (`In production`)",
      status: "Google Verification Required",
      summary:
        "Moving publishing status to 'In production' removes the 100-user cap and prevents 7-day token expiration, but requires Google Trust & Safety verification.",
      allowed_users: "All consumer and Google Workspace accounts.",
      verification_required: "Mandatory Google App Verification",
      details: [
        "Domain ownership must be verified in Google Search Console.",
        "Must provide a public Privacy Policy and Terms of Service URL.",
        "Must submit a YouTube video demonstration showing OAuth consent screen and how requested scopes are used inside the application.",
      ],
    },
    production: {
      title: "Restricted Scope Compliance (CASA Security Assessment)",
      status: "Independent Third-Party Security Audit Required",
      summary:
        "If using restricted Drive scopes (e.g. `drive`, `drive.readonly`), the app must pass an annual Cloud Application Security Assessment (CASA) Tier 2/3 assessment by an authorized assessor lab.",
      allowed_users: "Public production users.",
      verification_required: "CASA Tier 2/3 Third-Party Security Assessment",
      details: [
        "Authorized assessor labs (e.g. Bishop Fox, Leviathan, PwC) perform dynamic scanning and security review.",
        "Assessment fees are paid directly to the third-party lab (typically $1,500 - $6,000+ per year).",
        "Must re-certify annually to maintain production OAuth grant status.",
      ],
    },
  },
  managed_oauth: {
    available: "yes",
    provider: "Composio",
    what_it_handles: [
      "OAuth consent handshake and refresh token lifecycle management",
      "Automatic token refreshing before expiration",
      "Unified Google Drive file upload, download, and search APIs",
    ],
    what_you_configure: [
      "Your Google Cloud Client ID and Client Secret in Composio Dashboard (for white-labeled consent)",
      "Add Composio redirect URI to Google Cloud Credentials console",
    ],
    prototyping_suitability:
      "Moderate. Excellent for rapid prototyping with test users, but using broad restricted scopes still requires passing Google verification if deploying to public end users.",
    limitations: [
      "Using managed OAuth does NOT exempt your product from Google's restricted scope verification policy if your end users connect their personal Google Drive accounts.",
      "Third-party CASA audits remain necessary for public external deployment of restricted scopes.",
    ],
    sources: [
      {
        title: "Composio Google Drive Integration",
        url: "https://docs.composio.dev/framework/integrations/googledrive",
      },
    ],
  },
  custom_oauth: {
    available: true,
    prerequisites: [
      "A Google Cloud Platform (GCP) project with Google Drive API enabled",
      "A verified domain in Google Search Console for production redirect URIs and branding",
      "Publicly accessible Privacy Policy and Terms of Service URLs",
      "A unlisted YouTube video demonstration showing user consent and feature usage",
    ],
    branding_and_consent_requirements: [
      "App name, user support email, and developer contact information",
      "App logo (120x120px square PNG or JPEG)",
      "Authorized domains (must match verified domain in Search Console)",
      "Privacy policy and Terms of service URLs hosted on the authorized domain",
    ],
    verification_checklist: [
      "Verify domain ownership in Google Search Console before configuring OAuth consent screen",
      "Record an unlisted YouTube screencast showing the OAuth consent dialog displaying your Client ID in the browser URL bar",
      "Draft explicit written justifications for each requested scope explaining why narrower scopes are insufficient",
      "Ensure Privacy Policy explicitly complies with the Google API Services User Data Policy, including Limited Use requirements",
    ],
    production_checklist: [
      "Publish OAuth consent screen to 'In production'",
      "Complete Google Trust & Safety Brand and Scope verification",
      "Engage an authorized CASA assessor lab if requesting restricted Drive scopes",
      "Implement automated token refresh handling using standard 3600-second expiry tokens",
    ],
    setup_steps: [
      {
        id: "gdrive-step-1",
        step_number: 1,
        title: "Create Google Cloud Project and Enable Drive API",
        explanation:
          "Google APIs are organized by GCP projects. The Google Drive API must be explicitly activated.",
        exact_action:
          "Navigate to Google Cloud Console -> APIs & Services -> Library. Search for 'Google Drive API' and click 'Enable'.",
        required_inputs: ["Google Cloud Platform account"],
        expected_result: "Google Drive API activated for the project.",
        responsibility: "HUMAN REQUIRED",
        source_evidence_id: "gdrive-claim-1",
      },
      {
        id: "gdrive-step-2",
        step_number: 2,
        title: "Configure OAuth Consent Screen Audience",
        explanation:
          "Choose between Internal (Google Workspace organization only) or External (any Google account).",
        exact_action:
          "Navigate to 'OAuth consent screen', select User Type ('Internal' or 'External'), and click 'Create'. Fill required app name, support email, and authorized domains.",
        required_inputs: ["App name", "Support email", "Developer contact email"],
        expected_result: "OAuth consent screen profile saved in 'Testing' status.",
        responsibility: "HUMAN REQUIRED",
        source_evidence_id: "gdrive-claim-2",
      },
      {
        id: "gdrive-step-3",
        step_number: 3,
        title: "Create OAuth 2.0 Web Client Credentials",
        explanation:
          "Create credentials for web application to obtain Client ID and Client Secret, and set authorized redirect URIs.",
        exact_action:
          "Go to Credentials -> 'Create Credentials' -> 'OAuth client ID'. Select 'Web application'. Add Authorized redirect URIs (e.g., https://yourdomain.com/api/auth/callback/google).",
        required_inputs: ["Redirect URIs"],
        expected_result: "Client ID and Client Secret generated.",
        responsibility: "HUMAN REQUIRED",
        source_evidence_id: "gdrive-claim-2",
      },
      {
        id: "gdrive-step-4",
        step_number: 4,
        title: "Audit and Select Scopes (Standard vs Restricted)",
        explanation:
          "Audit required scopes carefully. Selecting `drive.file` avoids restricted scope verification and avoids CASA security audits. Selecting `drive` triggers full restricted scope verification.",
        exact_action:
          "Under OAuth consent screen -> 'Scopes', add `https://www.googleapis.com/auth/drive.file` for per-file access or restricted scopes if full drive access is indispensable.",
        required_inputs: ["Scope list"],
        expected_result: "Scopes registered with associated sensitivity tier.",
        responsibility: "AGENT AUTOMATABLE",
        source_evidence_id: "gdrive-claim-3",
      },
      {
        id: "gdrive-step-5",
        step_number: 5,
        title: "Draft Scope Justification and Prepare Demo Screencast",
        explanation:
          "Google verification requires a written justification for each requested scope explaining why narrower scopes cannot accomplish the feature, plus a video recording.",
        exact_action:
          "Draft scope justification document and record video showing OAuth consent URL with client_id visible in browser address bar.",
        required_inputs: ["Feature description", "Video walkthrough"],
        expected_result: "Verification collateral ready for Google review submission.",
        responsibility: "HYBRID",
        source_evidence_id: "gdrive-claim-4",
      },
      {
        id: "gdrive-step-6",
        step_number: 6,
        title: "Submit for Google Verification and CASA Assessment",
        explanation:
          "Submit app verification in Google Cloud Console. If restricted scopes were selected, complete Cloud Application Security Assessment (CASA) with an external audit lab.",
        exact_action:
          "Click 'Submit for Verification' on the OAuth consent screen. Follow instructions from the Google Trust & Safety team regarding CASA assessment lab selection.",
        required_inputs: ["Verification submission form", "CASA portal submission"],
        expected_result: "App approved for public production distribution.",
        responsibility: "HUMAN REQUIRED",
        source_evidence_id: "gdrive-claim-5",
      },
    ],
  },
  scopes: [
    {
      id: "gdrive-scope-drive-file",
      name: "https://www.googleapis.com/auth/drive.file",
      description:
        "Per-file access: view and manage Google Drive files and folders that have been opened or created by this app (or selected via Google Picker).",
      risk_tier: "standard",
      category: "Files & Documents",
      verification_requirements: [
        "Non-sensitive / Standard scope in Drive API.",
        "Does NOT require restricted scope verification.",
        "Does NOT require CASA Tier 2/3 third-party security assessment.",
      ],
      warnings: [],
      alternative_recommendation:
        "RECOMMENDED ARCHITECTURE: Always use `drive.file` in combination with Google Picker API. Avoids months of external review and thousands of dollars in audit fees.",
      source_ids: ["gdrive-claim-3"],
    },
    {
      id: "gdrive-scope-drive-appdata",
      name: "https://www.googleapis.com/auth/drive.appdata",
      description:
        "View and manage its own configuration and app data folder in Google Drive (hidden from user).",
      risk_tier: "standard",
      category: "Application Data",
      verification_requirements: [
        "Standard scope. No restricted verification required.",
      ],
      source_ids: ["gdrive-claim-3"],
    },
    {
      id: "gdrive-scope-drive-metadata-readonly",
      name: "https://www.googleapis.com/auth/drive.metadata.readonly",
      description:
        "View metadata for files in Google Drive (such as file names, dates, MIME types) without access to file contents.",
      risk_tier: "sensitive",
      category: "Metadata",
      verification_requirements: [
        "Sensitive scope. Requires Google Trust & Safety verification (Privacy Policy, domain ownership, and YouTube video demo).",
        "Does NOT trigger CASA restricted scope security assessment.",
      ],
      warnings: [
        "Requires written justification explaining why file metadata is required.",
      ],
      source_ids: ["gdrive-claim-3", "gdrive-claim-4"],
    },
    {
      id: "gdrive-scope-drive-readonly",
      name: "https://www.googleapis.com/auth/drive.readonly",
      description:
        "View the contents of all files in Google Drive.",
      risk_tier: "restricted",
      category: "Files & Documents",
      verification_requirements: [
        "RESTRICTED SCOPE. Officially designated as restricted by Google.",
        "Requires Google Trust & Safety verification, domain verification, and video demo.",
        "Mandatory annual Cloud Application Security Assessment (CASA Tier 2 or 3) by an authorized independent assessment lab.",
        "Direct audit fees payable to third-party assessor.",
      ],
      warnings: [
        "Will trigger substantial launch delay (4-8 weeks) and third-party audit expenses.",
      ],
      alternative_recommendation:
        "Use `drive.file` and allow users to select only the files they want to view via the Google Picker component.",
      source_ids: ["gdrive-claim-3", "gdrive-claim-5"],
    },
    {
      id: "gdrive-scope-drive",
      name: "https://www.googleapis.com/auth/drive",
      description:
        "Full, permissive scope to view, edit, create, and delete all files in Google Drive.",
      risk_tier: "restricted",
      category: "Files & Documents",
      verification_requirements: [
        "RESTRICTED SCOPE. Highest risk tier in Google Workspace ecosystem.",
        "Requires Google Trust & Safety verification.",
        "Mandatory Cloud Application Security Assessment (CASA) Tier 2/3 independent security assessment by accredited third-party lab.",
        "Annual re-certification required.",
      ],
      warnings: [
        "Extremely broad access. Google reviewers reject requests unless a clear, documented architectural necessity is proven.",
      ],
      alternative_recommendation:
        "Replace with `drive.file` for document creation/management or `drive.appdata` for app-specific files.",
      source_ids: ["gdrive-claim-3", "gdrive-claim-5"],
    },
  ],
  effort_and_timeline: {
    active_setup: {
      value: "1 - 2 hours",
      is_estimate: true,
      is_documented: false,
      details:
        "Setting up GCP project, configuring consent screen, registering redirect URIs, and implementing OAuth token exchange.",
    },
    external_review: {
      value: "3 - 5 business days for Sensitive; 4 - 8 weeks for Restricted (CASA)",
      is_estimate: true,
      is_documented: true,
      details:
        "Google documentation indicates basic brand verification typically takes 3-5 business days. Restricted scope verification involving third-party CASA security assessment typically requires 4-8 weeks depending on assessor availability.",
      source_id: "gdrive-claim-4",
    },
    audit_cost: {
      value: "$0 (Google review) + $1,500 - $6,000+ paid to CASA lab if using Restricted scopes",
      is_estimate: true,
      is_documented: true,
      details:
        "Google does not charge for app verification. However, third-party CASA security assessments for restricted scopes are conducted by independent authorized labs (e.g. Bishop Fox, Leviathan) who bill developers directly.",
      source_id: "gdrive-claim-5",
    },
  },
  blockers: [
    {
      id: "gdrive-blocker-1",
      error_or_symptom: "Unverified App Warning ('Google hasn't verified this app')",
      likely_cause:
        "The OAuth client is in 'Testing' status or requesting sensitive/restricted scopes before completing Google verification.",
      suggested_resolution:
        "During development, add the user's email to 'Test users' in the Google Cloud Console. For production, submit the app for verification.",
      relevant_source_url:
        "https://support.google.com/cloud/answer/7454865",
    },
    {
      id: "gdrive-blocker-2",
      error_or_symptom: "Token Expiry After 7 Days (invalid_grant)",
      likely_cause:
        "The OAuth app is in 'Testing' publishing status. Google automatically expires refresh tokens after 7 days for external apps in testing mode.",
      suggested_resolution:
        "Move publishing status to 'In production' (which requires verification for sensitive/restricted scopes) or use an Internal user type if in Google Workspace.",
      relevant_source_url:
        "https://developers.google.com/identity/protocols/oauth2#expiration",
    },
    {
      id: "gdrive-blocker-3",
      error_or_symptom: "redirect_uri_mismatch (Error 400)",
      likely_cause:
        "The redirect_uri passed in the request does not match the Authorized redirect URIs configured for the OAuth 2.0 Client ID in Google Cloud Console.",
      suggested_resolution:
        "Verify protocol, domain, port, and trailing slashes. Note that Google Cloud requires exact string matching and does not support wildcards.",
      relevant_source_url:
        "https://developers.google.com/identity/protocols/oauth2/web-server#creatingcred",
    },
    {
      id: "gdrive-blocker-4",
      error_or_symptom: "Scope Verification Rejection / Insufficient Justification",
      likely_cause:
        "Google Trust & Safety rejected the restricted scope request because the app could function with a narrower scope (such as `drive.file`).",
      suggested_resolution:
        "Refactor your application to use `drive.file` with the Google Picker API, or provide a detailed architectural justification showing why broader access is strictly required.",
      relevant_source_url:
        "https://developers.google.com/identity/protocols/oauth2/production-readiness#restricted-scopes",
    },
  ],
  unknowns_and_limitations: [
    "CASA assessment pricing is determined by third-party authorized lab vendors and is not published directly by Google on a single fixed rate schedule.",
    "Turnaround times for Google Trust & Safety reviews vary substantially based on queue depth and responsiveness to reviewer inquiries.",
  ],
  claims_and_evidence: [
    {
      id: "gdrive-claim-1",
      claim:
        "Google Drive API requires explicit activation within a Google Cloud Platform project before OAuth credentials can access Drive resources.",
      evidence_type: "DOC_BACKED",
      source_title: "Google Workspace - Drive API Prerequisites",
      source_url:
        "https://developers.google.com/workspace/drive/api/guides/api-specific-auth",
      verbatim_quote:
        "Before you can use Google Drive APIs, you must enable them in a Google Cloud project. You can enable one or more APIs in a single project.",
    },
    {
      id: "gdrive-claim-2",
      claim:
        "Refresh tokens expire after 7 days if the OAuth consent screen is configured with an external user type in testing status.",
      evidence_type: "DOC_BACKED",
      source_title: "Google Identity - OAuth 2.0 Token Expiration",
      source_url:
        "https://developers.google.com/identity/protocols/oauth2#expiration",
      verbatim_quote:
        "A Google Cloud Platform project with an OAuth consent screen configured for an external user type and a publishing status of 'Testing' is issued a refresh token authorizing access for up to 100 test accounts. A refresh token issued to a test account expires 7 days after it is issued.",
    },
    {
      id: "gdrive-claim-3",
      claim:
        "Google Drive API officially classifies broad Drive scopes as restricted, while drive.file is classified as non-sensitive.",
      evidence_type: "DOC_BACKED",
      source_title:
        "Google Workspace - Choose Drive API scopes",
      source_url:
        "https://developers.google.com/workspace/drive/api/guides/api-specific-auth#drive-scopes",
      verbatim_quote:
        "Scopes are classified into sensitivity tiers: standard, sensitive, and restricted. Broad drive scopes such as https://www.googleapis.com/auth/drive and drive.readonly are restricted scopes that require a security assessment. In contrast, drive.file is non-sensitive and only grants access to files created or opened by the app.",
    },
    {
      id: "gdrive-claim-4",
      claim:
        "Verification for sensitive scopes requires public privacy policies, verified domain ownership in Search Console, and a YouTube demo video.",
      evidence_type: "DOC_BACKED",
      source_title:
        "Google Cloud - OAuth App Verification Requirements",
      source_url: "https://support.google.com/cloud/answer/13463817",
      verbatim_quote:
        "To protect user data, Google requires OAuth apps requesting sensitive or restricted scopes to go through a verification process... You must provide a YouTube video that demonstrates how the application will use the requested scopes.",
    },
    {
      id: "gdrive-claim-5",
      claim:
        "Restricted scopes require an independent Cloud Application Security Assessment (CASA) Tier 2 or Tier 3 assessment paid directly to an authorized lab.",
      evidence_type: "DOC_BACKED",
      source_title:
        "Google Identity - Cloud Application Security Assessment (CASA)",
      source_url:
        "https://developers.google.com/identity/protocols/oauth2/production-readiness#security-assessment",
      verbatim_quote:
        "If your application accesses restricted scopes, it must pass a third-party security assessment. You must engage with an authorized security assessor. Assessment fees are paid directly to the assessor.",
    },
  ],
};
