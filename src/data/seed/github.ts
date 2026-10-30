import { Guide } from "@/types/guide";

export const githubGuide: Guide = {
  slug: "github",
  provider_name: "GitHub",
  category: "Code & Version Control",
  description:
    "Authorizing user access to repositories, organizations, and profiles via standard GitHub OAuth Apps and GitHub Apps.",
  official_domain: "github.com",
  documentation_urls: [
    "https://docs.github.com/en/apps/oauth-apps",
    "https://docs.github.com/en/apps/creating-oauth-apps",
    "https://docs.github.com/en/apps/oauth-apps/building-oauth-apps",
  ],
  oauth_portal_url: "https://github.com/settings/developers",
  last_researched_at: "2026-10-30",
  research_status: "verified",
  readiness_summary:
    "Instant self-serve production readiness. GitHub OAuth apps require no formal app review or approval fees for direct user authorization, though organization admins may require manual approval for corporate repositories.",
  complexity: "Low",
  is_seed: true,
  readiness: {
    development: {
      title: "Local Development & Prototyping",
      status: "Instant Self-Serve",
      summary:
        "Register an OAuth App in Developer Settings. Use `http://localhost` or port-specific callback URLs for local testing.",
      allowed_users: "Any GitHub account with direct login.",
      verification_required: false,
      details: [
        "Create an OAuth App under personal account or organization.",
        "Set authorization callback URL to local dev server (e.g., http://localhost:3000/api/auth/callback/github).",
        "Client Secret is shown once upon generation; store safely.",
      ],
    },
    external_testing: {
      title: "External User & Staging Testing",
      status: "Immediate",
      summary:
        "External users can authenticate immediately with your client ID. No test-user whitelist restrictions exist.",
      allowed_users: "All public GitHub users.",
      verification_required: false,
      details: [
        "No sandbox or test user limit enforced by GitHub.",
        "Users in organizations with OAuth restrictions must request organization admin approval.",
      ],
    },
    public_distribution: {
      title: "Public Direct OAuth Distribution",
      status: "Immediate (No Provider Review)",
      summary:
        "Distribute your OAuth login link directly to any user. GitHub does not gate OAuth authorization behind an approval queue.",
      allowed_users: "Global GitHub user base.",
      verification_required: false,
      details: [
        "Host your app with a production callback URL using HTTPS.",
        "Display clear privacy policy and terms on your application website.",
        "Users authorize directly via github.com/login/oauth/authorize.",
      ],
    },
    production: {
      title: "Enterprise & Marketplace Production",
      status: "Self-Serve for OAuth; Marketplace Listing requires Publisher Verification",
      summary:
        "Standard OAuth apps are immediately production-ready. Listing on the GitHub Marketplace requires converting to a GitHub App with publisher verification.",
      allowed_users: "Enterprise and public users.",
      verification_required: "Optional (Only for GitHub Marketplace listing or verified badge)",
      details: [
        "OAuth Apps are not eligible for Marketplace listing; GitHub recommends GitHub Apps for fine-grained permissions.",
        "Domain verification is optional for individual OAuth apps, but verified organization badges build user trust.",
      ],
    },
  },
  managed_oauth: {
    available: "yes",
    provider: "Composio",
    what_it_handles: [
      "Token refresh and credential vaulting",
      "Multi-tenant user session management",
      "Standard GitHub API proxy and webhook dispatching",
    ],
    what_you_configure: [
      "Composio API key in your backend",
      "Optional custom GitHub OAuth app credentials if white-labeling the consent screen",
    ],
    prototyping_suitability:
      "High. Enables instant GitHub authentication and API execution without manual callback handler boilerplate.",
    limitations: [
      "Shared consent screen branded under Composio unless custom client credentials are provided.",
      "Webhook processing routed through third-party infrastructure.",
    ],
    sources: [
      {
        title: "Composio GitHub Integration Guide",
        url: "https://docs.composio.dev/framework/integrations/github",
      },
    ],
  },
  custom_oauth: {
    available: true,
    prerequisites: [
      "A GitHub personal account or GitHub Organization",
      "A registered application homepage URL",
      "A secure HTTPS redirect URI (HTTP allowed for localhost)",
    ],
    branding_and_consent_requirements: [
      "Application name (visible on OAuth consent screen)",
      "Homepage URL",
      "Application description",
      "Application logo (badge displayed on user authorization prompt)",
    ],
    verification_checklist: [
      "Ensure Client Secret is stored server-side only; never in browser or mobile bundle",
      "Implement CSRF protection using random `state` parameter in OAuth handshake",
      "Handle Organization access request rejections gracefully in UI",
    ],
    production_checklist: [
      "Replace localhost callback with production HTTPS domain",
      "Rotate Client Secret regularly or upon suspicion of compromise",
      "Consider migrating to GitHub App if granular repository-level access is required",
    ],
    setup_steps: [
      {
        id: "gh-step-1",
        step_number: 1,
        title: "Access GitHub Developer Settings",
        explanation:
          "GitHub OAuth applications are registered under user settings or organization settings.",
        exact_action:
          "Navigate to GitHub Settings -> Developer settings -> OAuth Apps, and click 'New OAuth App'.",
        required_inputs: ["GitHub account session"],
        expected_result: "OAuth Application Registration form opens.",
        responsibility: "HUMAN REQUIRED",
        source_evidence_id: "gh-claim-1",
      },
      {
        id: "gh-step-2",
        step_number: 2,
        title: "Configure App Details and Authorization Callback URL",
        explanation:
          "Provide the user-facing name and the callback endpoint that receives the temporary code.",
        exact_action:
          "Fill Application name, Homepage URL, and Authorization callback URL (e.g., https://yourdomain.com/api/auth/callback/github).",
        required_inputs: ["Application name", "Homepage URL", "Callback URL"],
        expected_result: "Application registered, Client ID generated.",
        responsibility: "HUMAN REQUIRED",
        source_evidence_id: "gh-claim-2",
      },
      {
        id: "gh-step-3",
        step_number: 3,
        title: "Generate Client Secret",
        explanation:
          "GitHub does not generate a secret by default. You must create one and copy it immediately.",
        exact_action:
          "Click 'Generate a new client secret' and copy the secret string into your server environment variables.",
        required_inputs: ["Two-Factor Authentication / Sudo password prompt"],
        expected_result: "Client secret displayed once in the portal.",
        responsibility: "HUMAN REQUIRED",
        source_evidence_id: "gh-claim-2",
      },
      {
        id: "gh-step-4",
        step_number: 4,
        title: "Build OAuth Authorization URL and State Param",
        explanation:
          "Construct the authorization redirect endpoint including required scopes and a cryptographically secure state token to prevent CSRF.",
        exact_action:
          "Redirect user to https://github.com/login/oauth/authorize?client_id=...&scope=...&state=...",
        required_inputs: ["Client ID", "Scope list", "Random state string"],
        expected_result: "User sees GitHub consent screen with requested scopes.",
        responsibility: "AGENT AUTOMATABLE",
        source_evidence_id: "gh-claim-3",
      },
      {
        id: "gh-step-5",
        step_number: 5,
        title: "Exchange Temporary Code for Access Token",
        explanation:
          "Exchange the `code` returned on the redirect URI for an OAuth access token via server-to-server POST.",
        exact_action:
          "POST to https://github.com/login/oauth/access_token with client_id, client_secret, code, and Accept: application/json.",
        required_inputs: ["Client ID", "Client Secret", "Authorization code"],
        expected_result: "JSON response containing `access_token` and `token_type`.",
        responsibility: "AGENT AUTOMATABLE",
        source_evidence_id: "gh-claim-3",
      },
      {
        id: "gh-step-6",
        step_number: 6,
        title: "Handle Organization Access Restrictions",
        explanation:
          "If the user belongs to a GitHub Organization with restricted OAuth policies, the token may not access organization repositories until approved.",
        exact_action:
          "Display explicit UI advising user to request admin authorization or check the 'Organization access' section in their settings.",
        required_inputs: ["GitHub user authorization response"],
        expected_result: "Graceful error message or request notification to org admin.",
        responsibility: "HYBRID",
        source_evidence_id: "gh-claim-4",
      },
    ],
  },
  scopes: [
    {
      id: "gh-scope-read-user",
      name: "read:user",
      description: "Grants read access to a user's profile data.",
      risk_tier: "standard",
      category: "User Profile",
      verification_requirements: ["None. Self-serve."],
      source_ids: ["gh-claim-3"],
    },
    {
      id: "gh-scope-user-email",
      name: "user:email",
      description: "Grants read access to a user's verified email addresses.",
      risk_tier: "standard",
      category: "User Profile",
      verification_requirements: ["None. Self-serve."],
      source_ids: ["gh-claim-3"],
    },
    {
      id: "gh-scope-public-repo",
      name: "public_repo",
      description: "Grants read and write access to code in public repositories.",
      risk_tier: "standard",
      category: "Repositories",
      verification_requirements: ["None. Self-serve."],
      source_ids: ["gh-claim-3"],
    },
    {
      id: "gh-scope-repo",
      name: "repo",
      description:
        "Grants full control of private repositories including code, commit statuses, repository invitations, collaborators, deployment statuses, and webhooks.",
      risk_tier: "sensitive",
      category: "Repositories",
      verification_requirements: [
        "High user friction: full private repository access triggers high scrutiny on consent screen.",
        "Consider GitHub Apps with fine-grained repository permissions if full private repo access is not strictly required.",
      ],
      warnings: [
        "Grants broad write/delete access across all private repos belonging to the authorizing account.",
      ],
      alternative_recommendation:
        "For production SaaS products, build a GitHub App instead of an OAuth App to request repository-specific access.",
      source_ids: ["gh-claim-3", "gh-claim-5"],
    },
    {
      id: "gh-scope-workflow",
      name: "workflow",
      description: "Grants the ability to add and update GitHub Actions workflow files.",
      risk_tier: "sensitive",
      category: "CI/CD & Automation",
      verification_requirements: ["None from GitHub, but extreme user caution."],
      warnings: [
        "Allows modification of CI/CD pipelines which can execute arbitrary code in runner environments.",
      ],
      source_ids: ["gh-claim-3"],
    },
    {
      id: "gh-scope-admin-org",
      name: "admin:org",
      description: "Fully manage the organization and its teams, projects, and memberships.",
      risk_tier: "restricted",
      category: "Organization Administration",
      verification_requirements: [
        "Must be approved or granted by an Organization Owner.",
      ],
      warnings: [
        "Dangerous scope. Most enterprise organizations prohibit this scope for third-party integrations.",
      ],
      source_ids: ["gh-claim-3", "gh-claim-4"],
    },
  ],
  effort_and_timeline: {
    active_setup: {
      value: "15 - 30 minutes",
      is_estimate: true,
      is_documented: false,
      details:
        "Developer registers app in GitHub settings, configures callback URL, generates secret, and sets up token exchange.",
    },
    external_review: {
      value: "0 days (Instant)",
      is_estimate: false,
      is_documented: true,
      details:
        "Official GitHub documentation confirms that OAuth Apps do not undergo any mandatory manual review before going live.",
      source_id: "gh-claim-1",
    },
    audit_cost: {
      value: "$0 (Free)",
      is_estimate: false,
      is_documented: true,
      details:
        "GitHub charges zero review or certification fees for registering and running OAuth applications.",
      source_id: "gh-claim-1",
    },
  },
  blockers: [
    {
      id: "gh-blocker-1",
      error_or_symptom: "redirect_uri_mismatch",
      likely_cause:
        "The redirect_uri provided in the authorization request does not exactly match the Authorization callback URL configured in Developer Settings.",
      suggested_resolution:
        "Verify that protocol (http vs https), domain, port, and path match the registered callback URL exactly.",
      relevant_source_url:
        "https://docs.github.com/en/apps/oauth-apps/maintaining-oauth-apps/troubleshooting-oauth-app-access-token-request-errors",
    },
    {
      id: "gh-blocker-2",
      error_or_symptom: "Organization approval required / 404 on organization repos",
      likely_cause:
        "The target repository belongs to a GitHub Organization with OAuth App access restrictions enabled.",
      suggested_resolution:
        "Instruct the user to navigate to their organization settings and grant or request access for the OAuth App.",
      relevant_source_url:
        "https://docs.github.com/en/organizations/managing-oauth-access-to-your-organizations-data/about-oauth-app-access-restrictions",
    },
    {
      id: "gh-blocker-3",
      error_or_symptom: "bad_verification_code",
      likely_cause:
        "The temporary authorization code has expired (valid for 10 minutes) or has already been redeemed.",
      suggested_resolution:
        "Ensure the server-side code exchange runs immediately upon receiving the callback and never attempts to reuse code strings.",
      relevant_source_url:
        "https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps",
    },
  ],
  unknowns_and_limitations: [
    "GitHub does not publish an automated mechanism to programmatically create standard OAuth Apps without personal access tokens.",
    "OAuth Apps grant account-wide repository access rather than fine-grained repository permissions; GitHub Apps should be preferred for granular access.",
  ],
  claims_and_evidence: [
    {
      id: "gh-claim-1",
      claim:
        "GitHub OAuth Apps require no manual app approval process or verification fees for public distribution.",
      evidence_type: "DOC_BACKED",
      source_title: "GitHub Docs - Creating an OAuth App",
      source_url: "https://docs.github.com/en/apps/creating-oauth-apps",
      verbatim_quote:
        "You can create an OAuth App under your personal account or under any organization you have administrative access to... Once created, your app is immediately ready for use.",
    },
    {
      id: "gh-claim-2",
      claim:
        "Client secret must be securely handled and callback URLs must match configured endpoints.",
      evidence_type: "DOC_BACKED",
      source_title: "GitHub Docs - Authorizing OAuth Apps",
      source_url:
        "https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps",
      verbatim_quote:
        "The redirect_uri parameter is optional. If left out, GitHub will redirect users to the callback URL configured in the OAuth App settings. If provided, the redirect URL's host and port must exactly match the callback URL.",
    },
    {
      id: "gh-claim-3",
      claim:
        "Scopes specify user access permissions and can be combined as comma-separated values in the authorization URL.",
      evidence_type: "DOC_BACKED",
      source_title: "GitHub Docs - Scopes for OAuth Apps",
      source_url:
        "https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/scopes-for-oauth-apps",
      verbatim_quote:
        "Scopes let you specify exactly what type of access you need. Scopes limit access for OAuth tokens. They do not grant any additional permission beyond that which the user already has.",
    },
    {
      id: "gh-claim-4",
      claim:
        "Organizations can restrict OAuth app access by default to protect organization data.",
      evidence_type: "DOC_BACKED",
      source_title:
        "GitHub Docs - About OAuth app access restrictions",
      source_url:
        "https://docs.github.com/en/organizations/managing-oauth-access-to-your-organizations-data/about-oauth-app-access-restrictions",
      verbatim_quote:
        "When an organization has OAuth app access restrictions enabled, organization members cannot authorize OAuth apps to access the organization's resources unless an organization owner approves the request.",
    },
    {
      id: "gh-claim-5",
      claim:
        "GitHub Apps are recommended over OAuth Apps when granular repository-level access is required.",
      evidence_type: "DOC_BACKED",
      source_title:
        "GitHub Docs - Differences between GitHub Apps and OAuth Apps",
      source_url:
        "https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/differences-between-github-apps-and-oauth-apps",
      verbatim_quote:
        "GitHub Apps offer fine-grained permissions, giving you more control over the data the app can access... OAuth apps always act as the user, while GitHub Apps can act independently or on behalf of a user.",
    },
  ],
};
