import { Guide } from "@/types/guide";

export const slackGuide: Guide = {
  slug: "slack",
  provider_name: "Slack",
  category: "Team Collaboration & Chat",
  description:
    "Installing Slack apps and bots into single or multiple workspaces using OAuth v2, Bot token scopes, and User token scopes.",
  official_domain: "slack.com",
  documentation_urls: [
    "https://api.slack.com/authentication/oauth-v2",
    "https://api.slack.com/start/quickstart",
    "https://api.slack.com/scopes",
    "https://api.slack.com/docs/slack-marketplace",
  ],
  oauth_portal_url: "https://api.slack.com/apps",
  last_researched_at: "2026-10-30",
  research_status: "verified",
  readiness_summary:
    "Self-serve direct multi-workspace installation is available immediately via OAuth v2 Public Distribution. Listing in the official Slack App Directory requires manual app review and security compliance.",
  complexity: "Moderate",
  is_seed: true,
  readiness: {
    development: {
      title: "Development Workspace Installation",
      status: "Instant Self-Serve",
      summary:
        "Install directly to your development Slack workspace from the App Management console with a single click.",
      allowed_users: "Members of the development workspace.",
      verification_required: false,
      details: [
        "Create an app at api.slack.com/apps.",
        "Add Bot Token Scopes (e.g., chat:write, channels:read).",
        "Click 'Install to Workspace' to authorize immediately and obtain a `xoxb-` bot token.",
      ],
    },
    external_testing: {
      title: "Multi-Workspace Direct OAuth (External Testing)",
      status: "Available via Public Distribution switch",
      summary:
        "Enable 'Manage Distribution' to generate a shareable direct OAuth install link for test workspaces outside your own.",
      allowed_users: "Any Slack workspace administrator with the install link.",
      verification_required: false,
      details: [
        "Must configure at least one HTTPS Redirect URL.",
        "Toggle 'Remove Hardcoded Information' and activate Public Distribution.",
        "Direct install link allows external teams to test without App Directory listing.",
      ],
    },
    public_distribution: {
      title: "Direct Public OAuth Distribution",
      status: "Self-Serve (Direct Install Link)",
      summary:
        "Public distribution allows anyone to install the app via your 'Add to Slack' button. No formal Slack approval queue required for direct installation.",
      allowed_users: "Global Slack workspaces.",
      verification_required: false,
      details: [
        "Embed the official 'Add to Slack' button on your marketing website.",
        "Direct installations do not require approval from Slack Inc., though individual enterprise workspaces may require local Admin approval.",
      ],
    },
    production: {
      title: "Slack App Directory / Marketplace Listing",
      status: "Manual Provider Review Required",
      summary:
        "Listing in the Slack App Directory for discovery by millions of Slack teams requires passing the formal Slack App Directory review.",
      allowed_users: "All Slack users via in-client directory.",
      verification_required: "Mandatory Review & Security Audit",
      details: [
        "Submit app through App Directory Submission checklist.",
        "Slack reviewers test OAuth installation, bot behavior, error handling, and privacy policies.",
        "App must adhere to Slack App Quality Guidelines.",
      ],
    },
  },
  managed_oauth: {
    available: "yes",
    provider: "Composio",
    what_it_handles: [
      "OAuth v2 token exchange (`oauth.v2.access`) and workspace credentials storage",
      "Handling incoming Slash Commands, Interactivity payloads, and Events",
      "Managing team-specific Bot User and User Token contexts",
    ],
    what_you_configure: [
      "Slack App Client ID and Client Secret in Composio Dashboard",
      "Composio redirect URI in your Slack App Settings (OAuth & Permissions)",
    ],
    prototyping_suitability:
      "High. Saves writing token exchange routines and handling workspace deinstallation events.",
    limitations: [
      "Events API webhook subscriptions still need endpoint verification (`url_verification` challenge).",
      "Interactive payloads must be routed through Composio proxy.",
    ],
    sources: [
      {
        title: "Composio Slack Integration Guide",
        url: "https://docs.composio.dev/framework/integrations/slack",
      },
    ],
  },
  custom_oauth: {
    available: true,
    prerequisites: [
      "A Slack account with permission to install apps in at least one workspace",
      "A registered domain with HTTPS for redirect URIs and event endpoints",
      "Privacy policy and support contact URLs for public distribution",
    ],
    branding_and_consent_requirements: [
      "App Name and Short Description (max 10 lines)",
      "App Icon (512x512px PNG, JPEG, or GIF; no transparent backgrounds)",
      "Background color hex code",
      "Long description, privacy policy link, and support email",
    ],
    verification_checklist: [
      "Implement the OAuth v2 state parameter check to mitigate CSRF attacks",
      "Validate Slack request signatures using the Signing Secret (`x-slack-signature`)",
      "Store workspace Bot tokens (`xoxb-`) and User tokens (`xoxp-`) encrypted at rest",
      "Handle token revocation webhooks (`tokens_revoked` event)",
    ],
    production_checklist: [
      "Complete the 'Manage Distribution' checklist in the Slack Developer Portal",
      "Set up TLS 1.2+ HTTPS endpoints for all OAuth redirects and Event subscriptions",
      "Submit for App Directory review if in-directory discovery is required",
    ],
    setup_steps: [
      {
        id: "slack-step-1",
        step_number: 1,
        title: "Create App from Scratch or App Manifest",
        explanation:
          "Slack apps are created at api.slack.com/apps using either the interactive portal UI or a declarative YAML/JSON manifest.",
        exact_action:
          "Click 'Create New App', choose 'From scratch' or 'From an app manifest', name your app, and select your development workspace.",
        required_inputs: ["App name", "Development Slack Workspace"],
        expected_result: "App created; Basic Information page displayed.",
        responsibility: "HUMAN REQUIRED",
        source_evidence_id: "slack-claim-1",
      },
      {
        id: "slack-step-2",
        step_number: 2,
        title: "Configure OAuth Redirect URLs",
        explanation:
          "Specify the HTTPS endpoints where Slack will redirect users with the authorization code.",
        exact_action:
          "Navigate to 'OAuth & Permissions', click 'Add New Redirect URL', enter your callback URL, and click 'Save URLs'.",
        required_inputs: ["HTTPS Callback URL (e.g., https://yourdomain.com/api/auth/callback/slack)"],
        expected_result: "Redirect URL registered.",
        responsibility: "HUMAN REQUIRED",
        source_evidence_id: "slack-claim-2",
      },
      {
        id: "slack-step-3",
        step_number: 3,
        title: "Select Bot Token and User Token Scopes",
        explanation:
          "Slack strictly separates Bot Token Scopes (actions the bot performs as itself) from User Token Scopes (actions performed on behalf of the installing user).",
        exact_action:
          "Under 'OAuth & Permissions' -> 'Scopes', add required Bot Token Scopes (e.g. `chat:write`, `channels:read`).",
        required_inputs: ["List of required scopes"],
        expected_result: "Scopes saved to app specification.",
        responsibility: "HUMAN REQUIRED",
        source_evidence_id: "slack-claim-3",
      },
      {
        id: "slack-step-4",
        step_number: 4,
        title: "Generate OAuth v2 Authorization URL & Button",
        explanation:
          "Generate the standard Slack OAuth v2 authorization URL with client_id, scope, user_scope, redirect_uri, and state.",
        exact_action:
          "Redirect user to https://slack.com/oauth/v2/authorize with query params client_id, scope, redirect_uri, and state.",
        required_inputs: ["Client ID", "Bot scopes", "User scopes", "State token"],
        expected_result: "User sees Slack consent dialog requesting workspace access.",
        responsibility: "AGENT AUTOMATABLE",
        source_evidence_id: "slack-claim-2",
      },
      {
        id: "slack-step-5",
        step_number: 5,
        title: "Exchange Temporary Code via `oauth.v2.access`",
        explanation:
          "Exchange the temporary authorization code received at the redirect URL for workspace bot credentials and team ID.",
        exact_action:
          "Send POST request to https://slack.com/api/oauth.v2.access with code, client_id, client_secret, and redirect_uri.",
        required_inputs: ["Temporary authorization code", "Client ID", "Client Secret"],
        expected_result: "Response containing `access_token` (bot token `xoxb-`), `team`, and `authed_user`.",
        responsibility: "AGENT AUTOMATABLE",
        source_evidence_id: "slack-claim-2",
      },
      {
        id: "slack-step-6",
        step_number: 6,
        title: "Activate Public Distribution",
        explanation:
          "To allow installations across different Slack workspaces outside your development team, activate Public Distribution.",
        exact_action:
          "Navigate to 'Manage Distribution', verify all checklist items have green checks, and click 'Activate Public Distribution'.",
        required_inputs: ["Completed distribution checklist"],
        expected_result: "App can now be installed across arbitrary external workspaces via direct link.",
        responsibility: "HUMAN REQUIRED",
        source_evidence_id: "slack-claim-4",
      },
    ],
  },
  scopes: [
    {
      id: "slack-scope-chat-write",
      name: "chat:write",
      description: "Send messages as your app into public and joined channels.",
      risk_tier: "standard",
      category: "Messaging",
      verification_requirements: ["None. Self-serve."],
      source_ids: ["slack-claim-3"],
    },
    {
      id: "slack-scope-channels-read",
      name: "channels:read",
      description: "View basic information about public channels in a workspace.",
      risk_tier: "standard",
      category: "Channels",
      verification_requirements: ["None. Self-serve."],
      source_ids: ["slack-claim-3"],
    },
    {
      id: "slack-scope-commands",
      name: "commands",
      description: "Add slash commands and shortcuts that users can invoke.",
      risk_tier: "standard",
      category: "Interactivity",
      verification_requirements: ["None. Self-serve."],
      source_ids: ["slack-claim-3"],
    },
    {
      id: "slack-scope-channels-history",
      name: "channels:history",
      description: "View messages and other content in public channels that the app has been added to.",
      risk_tier: "sensitive",
      category: "Messages & History",
      verification_requirements: [
        "High user and admin scrutiny on consent screen.",
        "Enterprise Slack workspace admins often restrict automated reading of channel history.",
      ],
      warnings: [
        "Grants read access to message text in all public channels where the app resides.",
      ],
      source_ids: ["slack-claim-3"],
    },
    {
      id: "slack-scope-groups-history",
      name: "groups:history",
      description: "View messages and other content in private channels the app has joined.",
      risk_tier: "sensitive",
      category: "Messages & History",
      verification_requirements: [
        "Sensitive scope. Admins frequently block apps requesting private channel history without explicit review.",
      ],
      source_ids: ["slack-claim-3"],
    },
    {
      id: "slack-scope-admin",
      name: "admin",
      description: "Perform administrative actions on a Slack workspace or Enterprise Grid.",
      risk_tier: "restricted",
      category: "Workspace Administration",
      verification_requirements: [
        "Restricted to Enterprise Grid org owners and admins.",
        "Cannot be installed by standard users or standard workspace admins.",
      ],
      warnings: [
        "Extremely high privilege. Never request unless building dedicated enterprise administration tooling.",
      ],
      source_ids: ["slack-claim-3"],
    },
  ],
  effort_and_timeline: {
    active_setup: {
      value: "30 - 60 minutes",
      is_estimate: true,
      is_documented: false,
      details:
        "Developer creates app in Slack portal, defines bot scopes, implements OAuth v2 callback endpoint, and activates direct distribution.",
    },
    external_review: {
      value: "0 days for Direct Install; 2 - 4 weeks for App Directory listing",
      is_estimate: true,
      is_documented: true,
      details:
        "Direct installation via 'Add to Slack' requires zero external review. Official documentation notes Slack App Directory listing undergoes manual review before publication.",
      source_id: "slack-claim-5",
    },
    audit_cost: {
      value: "$0 (Free)",
      is_estimate: false,
      is_documented: true,
      details:
        "Slack charges no review fee or certification fee for App Directory submission or direct distribution.",
      source_id: "slack-claim-5",
    },
  },
  blockers: [
    {
      id: "slack-blocker-1",
      error_or_symptom: "invalid_code",
      likely_cause:
        "The temporary `code` provided in the redirect URL was already used or has expired (valid for 10 minutes).",
      suggested_resolution:
        "Exchange the code immediately upon receipt in a single server request; do not retry with the same code.",
      relevant_source_url:
        "https://api.slack.com/authentication/oauth-v2#exchanging",
    },
    {
      id: "slack-blocker-2",
      error_or_symptom: "bad_redirect_uri",
      likely_cause:
        "The redirect_uri passed in the request does not match any of the registered Redirect URLs configured under OAuth & Permissions.",
      suggested_resolution:
        "Check that protocol (https), domain, and path match the Slack portal configuration character-for-character.",
      relevant_source_url:
        "https://api.slack.com/authentication/oauth-v2#redirect_urls",
    },
    {
      id: "slack-blocker-3",
      error_or_symptom: "Approval Required / Request Submitted to Admin",
      likely_cause:
        "The target Slack workspace has 'Require App Approval' turned on in workspace settings.",
      suggested_resolution:
        "The app install request will be routed to the workspace admin's Slackbot notifications for approval. Provide clear instructions to the user to contact their admin.",
      relevant_source_url:
        "https://slack.com/help/articles/222386047-Manage-app-approval-for-your-workspace",
    },
  ],
  unknowns_and_limitations: [
    "Slack does not guarantee exact review turnaround timelines for App Directory review (estimates vary between 2 to 4 weeks depending on queue volume).",
    "App manifests allow declarative configuration, but activating public distribution still requires human confirmation in the portal UI.",
  ],
  claims_and_evidence: [
    {
      id: "slack-claim-1",
      claim:
        "Slack applications can be defined declaratively via App Manifests or configured through the developer portal.",
      evidence_type: "DOC_BACKED",
      source_title: "Slack API - App Manifests",
      source_url: "https://api.slack.com/reference/manifests",
      verbatim_quote:
        "App manifests make it easier to share, configure, and manage Slack apps. Instead of clicking through various configuration pages in the app management UI, you can describe your app configuration using a YAML or JSON file.",
    },
    {
      id: "slack-claim-2",
      claim:
        "Slack OAuth v2 uses distinct endpoints and separate parameters for Bot token scopes and User token scopes.",
      evidence_type: "DOC_BACKED",
      source_title: "Slack API - Installing with OAuth v2",
      source_url: "https://api.slack.com/authentication/oauth-v2",
      verbatim_quote:
        "OAuth v2 handles scopes for bot tokens separately from user tokens... use the scope parameter for bot token scopes and user_scope for user token scopes.",
    },
    {
      id: "slack-claim-3",
      claim:
        "Scopes are granular permissions that dictate what an app can see and do within a Slack workspace.",
      evidence_type: "DOC_BACKED",
      source_title: "Slack API - Scopes",
      source_url: "https://api.slack.com/scopes",
      verbatim_quote:
        "Slack apps request access to specific scopes when asking for authorization. Requesting only the scopes your app strictly needs increases the likelihood that workspace admins approve installation.",
    },
    {
      id: "slack-claim-4",
      claim:
        "Public distribution can be activated to allow direct installation without requiring an App Directory listing.",
      evidence_type: "DOC_BACKED",
      source_title: "Slack API - Distributing your app",
      source_url: "https://api.slack.com/start/distributing",
      verbatim_quote:
        "You can distribute your app to other workspaces without submitting it to the Slack App Directory. Enabling public distribution allows anyone with the direct install link to add the app to their workspace.",
    },
    {
      id: "slack-claim-5",
      claim:
        "Listing in the official Slack App Directory requires manual review by the Slack team, but incurs no review fees.",
      evidence_type: "DOC_BACKED",
      source_title: "Slack API - App Directory Review Guide",
      source_url: "https://api.slack.com/docs/slack-marketplace",
      verbatim_quote:
        "Submitting your app to the App Directory is free of charge. The review team will test your app's installation flow, user experience, and security adherence before approving it for directory listing.",
    },
  ],
};
