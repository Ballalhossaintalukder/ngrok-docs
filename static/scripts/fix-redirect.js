const getNormalizedPaths = (from, path) => {
	return {
		normalizedFrom: from.endsWith("/") ? from.slice(0, -1) : from,
		normalizedPath: path.endsWith("/") ? path.slice(0, -1) : path,
	};
};

const fromExact = (from) => (path) => {
	const { normalizedFrom, normalizedPath } = getNormalizedPaths(from, path);
	return [normalizedFrom, normalizedPath === normalizedFrom]; // [xyz]
};

const fromIncludes = (from) => (path) => {
	// Normalize both paths by removing trailing slashes if present

	const { normalizedFrom, normalizedPath } = getNormalizedPaths(from, path);

	return [normalizedFrom, normalizedPath.includes(normalizedFrom)];
};

const toExact = (to) => () => to; // x -> y
const toReplace = (to) => (path, from) => path.replace(from, to); // abc/x -> xyz/x

// List of redirects
//  String values are treated as exacts by default.
//  Exact matches should be listed first as redirects are stacked
//
// To change behavior you can use the following method structures:
//  [0 - from]: (path) => [matchStr, boolean (true for match, false for do not match)]
//  [1 - to]:  (path, from) => string (returned value becomes the new path)
const redirects = [
	[fromIncludes("/docs/1"), "/docs/"],
	[fromIncludes("/docs/2"), "/docs/"],
	[fromIncludes("/docs/overview"), "/docs/"],
	[fromIncludes("/docs/ngrok-link"), "/docs/universal-gateway/overview/"],
	[fromIncludes("/docs/api/api-clients"), "/docs/api/#client-libraries"],
	[fromIncludes("/docs/api/client-libraries"), "/docs/api/#client-libraries"],
	[fromIncludes("/docs/api/terraform"), "/docs/api/#terraform-provider"],
	[fromIncludes("/docs/platform/api"), "/docs/api/"],
	[fromIncludes("/docs/platform/events"), "/docs/events/"],
	[fromIncludes("/docs/events/filtering"), "/docs/events/#filters"],
	[
		fromIncludes("/docs/http-header-templates/"),
		"/docs/traffic-policy/actions/add-headers/",
	],
	[
		fromIncludes("/docs/network-edge/pops"),
		"/docs/universal-gateway/points-of-presence/",
	],
	[
		fromIncludes("/docs/platform/pops"),
		"/docs/universal-gateway/points-of-presence/",
	],
	[
		fromIncludes("/docs/best-practices/security-dev-productivity/"),
		"/docs/guides/security-dev-productivity/",
	],
	[
		fromIncludes("/docs/platform/ip-policies/"),
		"/docs/api/resources/ip-policies/",
	],
	[
		fromIncludes("/docs/platform/botusers/"),
		"/docs/user-management/#bot-users",
	],
	[fromIncludes("/docs/platform/dashboard/"), "/docs/user-management/#sso"],
	[
		fromIncludes("/docs/cloud-edge/modules/webhook/"),
		"/docs/api/resources/edge-route-webhook-verification-module",
	],
	[
		fromIncludes("/docs/cloud-edge/modules/oauth/amazon/"),
		"/docs/integrations/amazon/oauth/",
	],
	[
		fromIncludes("/docs/cloud-edge/modules/oauth/facebook/"),
		"/docs/integrations/facebook/oauth/",
	],
	[
		fromIncludes("/docs/cloud-edge/modules/oauth/github/"),
		"/docs/integrations/github/oauth/",
	],
	[
		fromIncludes("/docs/cloud-edge/modules/oauth/gitlab/"),
		"/docs/integrations/gitlab/oauth/",
	],
	[
		fromIncludes("/docs/cloud-edge/modules/oauth/google/"),
		"/docs/integrations/google/oauth/",
	],
	[
		fromIncludes("/docs/cloud-edge/modules/oauth/linkedin/"),
		"/docs/integrations/linkedin/oauth/",
	],
	[
		fromIncludes("/docs/cloud-edge/modules/oauth/microsoft/"),
		"/docs/integrations/microsoft/oauth/",
	],
	[
		fromIncludes("/docs/cloud-edge/modules/oauth/twitch/"),
		"/docs/integrations/twitch/oauth/",
	],
	[
		fromIncludes("/docs/cloud-edge/http-header-templates/"),
		"/docs/traffic-policy/actions/add-headers/",
	],
	[
		fromIncludes("/docs/integrations/awscloudwatch"),
		"/docs/integrations/amazon-cloudwatch/",
	],
	[
		fromIncludes("/docs/integrations/awsfirehose"),
		"/docs/integrations/amazon-firehose/",
	],
	[
		fromIncludes("/docs/integrations/awskinesis"),
		"/docs/integrations/amazon-kinesis/",
	],
	[
		fromIncludes("/docs/secure-tunnels/tunnels/tcp-tunnels"),
		"/docs/universal-gateway/tcp/",
	],
	[
		fromIncludes("/docs/secure-tunnels/tunnels/ssh-reverse-tunnel-agent"),
		"/docs/agent/ssh-reverse-tunnel-agent",
	],

	// /docs/guides -> /docs/guides/other-guides
	// /docs/guides/how-to-set-up-a-custom-domain -> /docs/guides/other-guides/how-to-set-up-a-custom-domain
	[
		fromIncludes("/docs/guides/how-to-set-up-a-custom-domain"),
		"/docs/universal-gateway/custom-domains/",
	],
	[
		fromIncludes("/docs/guides/other-guides/how-to-set-up-a-custom-domain"),
		"/docs/universal-gateway/custom-domains/",
	],

	[fromIncludes("/docs/guides/limits"), "/docs/pricing-limits"],

	[fromIncludes("/docs/guides/licensing"), "/docs/pricing-limits/"],

	// /docs/guides/upgrade-v2-v3 -> /docs/guides/other-guides/upgrade-v2-v3
	[
		fromIncludes("/docs/guides/upgrade-v2-v3"),
		"/docs/guides/other-guides/upgrade-v2-v3",
	],

	// /docs/guides/security-dev-productivity -> /docs/guides/other-guides/security-dev-productivity
	[
		fromIncludes("/docs/guides/security-dev-productivity"),
		"/docs/guides/other-guides/security-dev-productivity",
	],

	// /docs/guides/securing-your-tunnels -> /docs/guides/other-guides/securing-your-tunnels
	[
		fromIncludes("/docs/guides/securing-your-tunnels"),
		"/docs/guides/other-guides/securing-your-tunnels",
	],

	// /docs/guides/running-behind-firewalls -> /docs/guides/other-guides/running-behind-firewalls
	[
		fromIncludes("/docs/guides/running-behind-firewalls"),
		"/docs/guides/other-guides/running-behind-firewalls",
	],

	// /docs/guides/using-tls-mutual-authentication -> /docs/guides/other-guides/using-tls-mutual-authentication
	[
		fromIncludes("/docs/guides/using-tls-mutual-authentication"),
		"/docs/guides/other-guides/using-tls-mutual-authentication",
	],

	// /docs/guides/dashboard-sso-okta-setup -> /docs/integrations/okta/dashboard-sso-okta-setup
	[
		fromIncludes("/docs/guides/dashboard-sso-okta-setup"),
		"/docs/integrations/okta/dashboard-sso-okta-setup",
	],

	// /docs/guides/load-balancing-with-cloud-edges -> /docs/guides/other-guides/load-balancing-with-cloud-edges
	[
		fromIncludes("/docs/guides/load-balancing-with-cloud-edges"),
		"/docs/guides/other-guides/load-balancing-with-cloud-edges",
	],

	// /docs/guides/how-to-round-robin-load-balance-with-ngrok-cloud-edges -> /docs/guides/other-guides/how-to-round-robin-load-balance-with-ngrok-cloud-edges
	[
		fromIncludes(
			"/docs/guides/how-to-round-robin-load-balance-with-ngrok-cloud-edges",
		),
		"/docs/guides/other-guides/how-to-round-robin-load-balance-with-ngrok-cloud-edges",
	],

	// /docs/guides/how-to-do-weighted-load-balancing-with-ngrok-cloud-edges -> /docs/guides/other-guides/how-to-do-weighted-load-balancing-with-ngrok-cloud-edges
	[
		fromIncludes(
			"/docs/guides/how-to-do-weighted-load-balancing-with-ngrok-cloud-edges",
		),
		"/docs/guides/other-guides/how-to-do-weighted-load-balancing-with-ngrok-cloud-edges",
	],

	// /docs/guides/using-labels-within-ngrok -> /docs/guides/other-guides/using-labels-within-ngrok
	[
		fromIncludes("/docs/guides/using-labels-within-ngrok"),
		"/docs/guides/other-guides/using-labels-within-ngrok",
	],

	[
		fromIncludes("/docs/guides/site-to-site-dbs"),
		"/docs/guides/site-to-site-connectivity/",
	],

	[
		fromIncludes("/docs/guides/site-to-site-apis"),
		"/docs/guides/site-to-site-connectivity/",
	],

	[
		fromIncludes("/docs/guides/site-to-site-apis-mtls"),
		"/docs/guides/site-to-site-connectivity/",
	],

	[
		fromIncludes("/docs/guides/site-to-site-dbs-mtls"),
		"/docs/guides/site-to-site-connectivity/",
	],

	// /docs/guides -> /docs/guides/identity-aware-proxy
	// /docs/guides/securing-with-oauth-> /docs/guides/identity-aware-proxy/securing-with-oauth
	[
		fromIncludes("/docs/guides/securing-with-oauth"),
		"/docs/guides/identity-aware-proxy/securing-with-oauth",
	],

	// /docs/guides -> /docs/guides/developer-preview
	// /docs/guides/getting-started-> /docs/guides/developer-preview/getting-started
	[
		fromIncludes("/docs/guides/getting-started"),
		"/docs/guides/developer-preview/getting-started",
	],

	// /docs/events/* -> /docs/obs/*
	[fromIncludes("/docs/events/"), toReplace("/docs/obs/")],

	// redirects for ngrok agent, redirect cli first
	[
		fromIncludes("/docs/secure-tunnels/ngrok-agent/reference/api/"),
		"/docs/agent/api/",
	],
	[
		fromIncludes("/docs/secure-tunnels/ngrok-agent/reference/changelog/"),
		"/docs/agent/changelog/",
	],
	[
		fromIncludes("/docs/secure-tunnels/ngrok-agent/reference/config/"),
		"/docs/agent/config/",
	],
	[
		fromIncludes("/docs/secure-tunnels/ngrok-agent/reference/ngrok/"),
		"/docs/agent/cli/",
	],
	[
		fromIncludes("/docs/secure-tunnels/ngrok-agent/remote-management/"),
		"/docs/agent/#remote-management",
	],
	[
		fromIncludes("/docs/secure-tunnels/ngrok-agent/shell-autocompletion/"),
		"/docs/agent/#tab-completion",
	],
	[
		fromIncludes("/docs/secure-tunnels/ngrok-agent/supported-platforms/"),
		"/docs/agent/#system-requirements",
	],
	[
		fromIncludes("/docs/secure-tunnels/ngrok-agent/tunnel-authtokens/"),
		"/docs/agent/#authtokens",
	],
	[
		fromIncludes("/docs/secure-tunnels/ngrok-agent/web-inspection-interface/"),
		"/docs/agent/web-inspection-interface/",
	],
	[
		fromIncludes("/docs/secure-tunnels/ngrok-agent/api-access/"),
		"/docs/agent/api/",
	],
	[
		fromIncludes("/docs/secure-tunnels/ngrok-agent/automatic-updates/"),
		"/docs/agent/#updates",
	],
	[
		fromIncludes("/docs/secure-tunnels/ngrok-agent/configuration-file/"),
		"/docs/agent/config/",
	],
	[
		fromIncludes("/docs/secure-tunnels/ngrok-agent/diagnose-command/"),
		"/docs/agent/#troubleshooting-connectivity",
	],
	[
		fromIncludes("/docs/secure-tunnels/ngrok-agent/installing-as-a-service/"),
		"/docs/agent/#background-service",
	],
	[
		fromIncludes("/docs/secure-tunnels/ngrok-agent/"),
		toReplace("/docs/agent/"),
	],

	// redirects for secure-tunnels
	[fromIncludes("/docs/secure-tunnels/agent_ingress/"), "/docs/agent/ingress/"],
	[
		fromIncludes("/docs/secure-tunnels/agentless/"),
		"/docs/agent/#using-ngrok-without-the-agent",
	],
	[
		fromIncludes("/docs/secure-tunnels/non-local/"),
		"/docs/http/#forward-to-non-local",
	],
	[fromIncludes("/docs/secure-tunnels/tunnels/"), "/docs/agent/"],
	[
		fromIncludes("/docs/secure-tunnels/tunnels/http-tunnels/"),
		"/docs/universal-gateway/http/",
	],
	[
		fromIncludes("/docs/secure-tunnels/tunnels/ssh-reverse-tunnel-agent/"),
		"/docs/agent/ssh-reverse-tunnel-agent/",
	],
	[
		fromIncludes("/docs/secure-tunnels/tunnels/tcp-tunnels/"),
		"/docs/universal-gateway/tcp/",
	],
	[
		fromIncludes("/docs/secure-tunnels/tunnels/tls-tunnels/"),
		"/docs/universal-gateway/tls/",
	],
	[fromIncludes("/docs/secure-tunnels/"), "/docs/agent/"],

	// redirects for cloud edges
	[
		fromIncludes("/docs/cloud-edge/app-users/"),
		"/docs/traffic-policy/identities/",
	],
	[fromIncludes("/docs/cloud-edge/edges/"), "/docs/universal-gateway/edges/"],
	[
		fromIncludes("/docs/cloud-edge/edges/https/"),
		"/docs/universal-gateway/http/",
	],
	[fromIncludes("/docs/cloud-edge/edges/tcp/"), "/docs/universal-gateway/tcp/"],
	[fromIncludes("/docs/cloud-edge/edges/tls/"), "/docs/universal-gateway/tls/"],
	[
		fromIncludes("/docs/cloud-edge/endpoints/"),
		"/docs/universal-gateway/http/",
	],
	[
		fromIncludes("/docs/cloud-edge/ip-policies/"),
		"/docs/http/#ip-restrictions",
	],
	[
		fromIncludes("/docs/cloud-edge/modules/circuit-breaker/"),
		"/docs/traffic-policy/actions/circuit-breaker/",
	],
	[
		fromIncludes("/docs/cloud-edge/modules/compression/"),
		"/docs/traffic-policy/actions/compress-response/",
	],
	[
		fromIncludes("/docs/cloud-edge/modules/ip-restrictions/"),
		"/docs/traffic-policy/actions/restrict-ips/",
	],
	[
		fromIncludes("/docs/cloud-edge/modules/mutual-tls/"),
		"/docs/traffic-policy/actions/terminate-tls/#enabling-mutual-tls",
	],
	[
		fromIncludes("/docs/cloud-edge/modules/oauth/"),
		"/docs/traffic-policy/actions/oauth/",
	],
	[
		fromIncludes("/docs/cloud-edge/modules/openid-connect/"),
		"/docs/traffic-policy/actions/oidc/",
	],
	[
		fromIncludes("/docs/cloud-edge/modules/request-headers/"),
		"/docs/traffic-policy/actions/add-headers/",
	],
	[
		fromIncludes("/docs/cloud-edge/modules/response-headers/"),
		"/docs/traffic-policy/actions/custom-response/",
	],
	[
		fromIncludes("/docs/cloud-edge/modules/saml/"),
		"/docs/traffic-policy/actions/saml",
	],
	[
		fromIncludes("/docs/cloud-edge/modules/tls-termination/"),
		"/docs/http/tls-termination/",
	],
	[
		fromIncludes("/docs/cloud-edge/modules/webhook-verification/"),
		"/docs/http/webhook-verification/",
	],
	[fromIncludes("/docs/cloud-edge/modules/"), "/docs/http/#modules"],
	[
		fromIncludes("/docs/cloud-edge/observability/"),
		"/docs/http/#observability",
	],
	[
		fromIncludes("/docs/cloud-edge/pops/"),
		"/docs/universal-gateway/points-of-presence/",
	],
	[
		fromIncludes("/docs/cloud-edge/zero-knowledge-tls/"),
		"/docs/traffic-policy/actions/terminate-tls/",
	],
	[
		fromIncludes("/docs/tls/tls/termination/"),
		"/docs/traffic-policy/actions/terminate-tls/",
	],
	[fromIncludes("/docs/cloud-edge/"), "/docs/universal-gateway/overview/"],
	[
		fromExact("/docs/integrations/home-assistant/home-assistant"),
		"/docs/integrations/home-assistant/home-assistant-with-ngrok",
	],

	// Redirects for Traffic Policy Expressions
	[
		fromIncludes("/docs/http/traffic-policy/expressions/#connection-variables"),
		"/docs/http/traffic-policy/expressions/variables#connection-variables",
	],
	[
		fromIncludes("/docs/http/traffic-policy/expressions/#request-variables"),
		"/docs/http/traffic-policy/expressions/variables#request-variables",
	],
	[
		fromIncludes("/docs/http/traffic-policy/expressions/#response-variables"),
		"/docs/http/traffic-policy/expressions/variables#response-variables",
	],
	[
		fromIncludes("/docs/http/traffic-policy/expressions/#macros"),
		"/docs/http/traffic-policy/expressions/macros",
	],
	[
		fromIncludes("/docs/tls/traffic-policy/expressions/#connection-variables"),
		"/docs/tls/traffic-policy/expressions/variables#connection-variables",
	],
	[
		fromIncludes("/docs/tls/traffic-policy/expressions/#macros"),
		"/docs/tls/traffic-policy/expressions/macros",
	],
	[
		fromIncludes("/docs/tcp/traffic-policy/expressions/#connection-variables"),
		"/docs/traffic-policy/variables/",
	],
	[
		fromIncludes("/docs/tcp/traffic-policy/expressions/#macros"),
		"/docs/traffic-policy/macros/",
	],

	// /docs/user-management/* -> /docs/iam/*
	[fromIncludes("/docs/user-management/#bot-users"), "/docs/iam/bot-users/"],
	[
		fromIncludes("/docs/user-management/#sso"),
		"/docs/iam/users/#dashboard-access",
	],
	[fromIncludes("/docs/user-management/#rbac"), "/docs/iam/rbac/"],
	[fromIncludes("/docs/user-management"), "/docs/iam/"],

	// BL misc SEO fixes
	[
		fromIncludes("/docs/api/resources/edge-route-policy-module"),
		"/docs/api/resources/edge-route-traffic-policy-module/",
	],
	[
		fromIncludes("/docs/api/resources/tcp-edge-policy-module"),
		"/docs/api/resources/tcp-edge-traffic-policy-module/",
	],
	[
		fromIncludes("/docs/api/resources/tls-edge-policy-module"),
		"/docs/api/resources/tls-edge-traffic-policy-module/",
	],
	[fromIncludes("/docs/ngrok-agent/ngrok"), "/docs/agent/"],
	[
		fromIncludes("/docs/network-edge/modules/webhook-verification"),
		"/docs/api/resources/edge-route-webhook-verification-module/",
	],
	[
		fromIncludes("/docs/platform/ip-policies"),
		"/docs/api/resources/ip-policies/",
	],
	[
		fromIncludes("/docs/http-header-templates"),
		"/docs/traffic-policy/actions/add-headers/",
	],

	// (DEC 2024) New Traffic Policy
	[
		fromIncludes("/docs/traffic-policy/gallery/"),
		"/docs/traffic-policy/examples/a-b-tests/",
	],
	[
		fromIncludes("/docs/http/traffic-policy/gallery/"),
		"/docs/traffic-policy/examples/a-b-tests/",
	],
	[
		fromIncludes("/docs/tls/traffic-policy/gallery/"),
		"/docs/traffic-policy/examples/a-b-tests/",
	],
	[
		fromIncludes("/docs/tcp/traffic-policy/gallery/"),
		"/docs/traffic-policy/examples/a-b-tests/",
	],
	[
		fromIncludes("/docs/http/traffic-policy/expressions/writing-guide/"),
		"/docs/traffic-policy/concepts/expressions/#writing-expressions",
	],
	[
		fromIncludes("/docs/tls/traffic-policy/expressions/writing-guide/"),
		"/docs/traffic-policy/concepts/expressions/#writing-expressions",
	],
	[
		fromIncludes("/docs/tcp/traffic-policy/expressions/writing-guide/"),
		"/docs/traffic-policy/concepts/expressions/#writing-expressions",
	],
	[
		fromIncludes(
			"/docs/http/traffic-policy/expressions/variables/#action-result-variables",
		),
		"/docs/traffic-policy/variables/action/",
	],
	[
		fromIncludes(
			"/docs/http/traffic-policy/expressions/variables/#connection-variables",
		),
		"/docs/traffic-policy/variables/connection/",
	],
	[
		fromIncludes(
			"/docs/http/traffic-policy/expressions/variables/#connection-geo-variables",
		),
		"/docs/traffic-policy/variables/connection/#connection-geo-variables",
	],
	[
		fromIncludes(
			"/docs/http/traffic-policy/expressions/variables/#connection-tls-variables",
		),
		"/docs/traffic-policy/variables/connection/#connection-tls-variables",
	],
	[
		fromIncludes(
			"/docs/http/traffic-policy/expressions/variables/#connection-tls-client-variables",
		),
		"/docs/traffic-policy/variables/connection/#connection-tls-client-variables",
	],
	[
		fromIncludes(
			"/docs/http/traffic-policy/expressions/variables/#connection-tls-server-variables",
		),
		"/docs/traffic-policy/variables/connection/#connection-tls-server-variables",
	],
	[
		fromIncludes(
			"/docs/http/traffic-policy/expressions/variables/#endpoint-variables",
		),
		"/docs/traffic-policy/variables/endpoint/",
	],
	[
		fromIncludes(
			"/docs/http/traffic-policy/expressions/variables/#time-variables",
		),
		"/docs/traffic-policy/variables/time/",
	],
	[
		fromIncludes(
			"/docs/tls/traffic-policy/expressions/variables/#action-result-variables",
		),
		"/docs/traffic-policy/variables/action/",
	],
	[
		fromIncludes(
			"/docs/tls/traffic-policy/expressions/variables/#connection-variables",
		),
		"/docs/traffic-policy/variables/connection/",
	],
	[
		fromIncludes(
			"/docs/tls/traffic-policy/expressions/variables/#connection-geo-variables",
		),
		"/docs/traffic-policy/variables/connection/#connection-geo-variables",
	],
	[
		fromIncludes(
			"/docs/tls/traffic-policy/expressions/variables/#connection-tls-variables",
		),
		"/docs/traffic-policy/variables/connection/#connection-tls-variables",
	],
	[
		fromIncludes(
			"/docs/tls/traffic-policy/expressions/variables/#connection-tls-client-variables",
		),
		"/docs/traffic-policy/variables/connection/#connection-tls-client-variables",
	],
	[
		fromIncludes(
			"/docs/tls/traffic-policy/expressions/variables/#connection-tls-server-variables",
		),
		"/docs/traffic-policy/variables/connection/#connection-tls-server-variables",
	],
	[
		fromIncludes(
			"/docs/tls/traffic-policy/expressions/variables/#endpoint-variables",
		),
		"/docs/traffic-policy/variables/endpoint/",
	],
	[
		fromIncludes(
			"/docs/tls/traffic-policy/expressions/variables/#time-variables",
		),
		"/docs/traffic-policy/variables/time/",
	],
	[
		fromIncludes(
			"/docs/tcp/traffic-policy/expressions/variables/#action-result-variables",
		),
		"/docs/traffic-policy/variables/action/",
	],
	[
		fromIncludes(
			"/docs/tcp/traffic-policy/expressions/variables/#connection-variables",
		),
		"/docs/traffic-policy/variables/connection/",
	],
	[
		fromIncludes(
			"/docs/tcp/traffic-policy/expressions/variables/#connection-geo-variables",
		),
		"/docs/traffic-policy/variables/connection/#connection-geo-variables",
	],
	[
		fromIncludes(
			"/docs/tcp/traffic-policy/expressions/variables/#connection-tls-variables",
		),
		"/docs/traffic-policy/variables/connection/#connection-tls-variables",
	],
	[
		fromIncludes(
			"/docs/tcp/traffic-policy/expressions/variables/#connection-tls-client-variables",
		),
		"/docs/traffic-policy/variables/connection/#connection-tls-client-variables",
	],
	[
		fromIncludes(
			"/docs/tcp/traffic-policy/expressions/variables/#connection-tls-server-variables",
		),
		"/docs/traffic-policy/variables/connection/#connection-tls-server-variables",
	],
	[
		fromIncludes(
			"/docs/tcp/traffic-policy/expressions/variables/#endpoint-variables",
		),
		"/docs/traffic-policy/variables/endpoint/",
	],
	[
		fromIncludes(
			"/docs/tcp/traffic-policy/expressions/variables/#time-variables",
		),
		"/docs/traffic-policy/variables/time/",
	],
	[
		fromIncludes("/docs/tcp/traffic-policy/expressions/variables/"),
		"/docs/traffic-policy/variables/",
	],
	[
		fromIncludes("/docs/http/traffic-policy/expressions/variables/"),
		"/docs/traffic-policy/variables/",
	],
	[
		fromIncludes("/docs/tls/traffic-policy/expressions/variables/"),
		"/docs/traffic-policy/variables/",
	],
	[
		fromIncludes("/docs/tcp/traffic-policy/expressions/variables/"),
		"/docs/traffic-policy/variables/",
	],
	[
		fromIncludes("/docs/http/traffic-policy/expressions/macros/"),
		"/docs/traffic-policy/macros/",
	],
	[
		fromIncludes("/docs/tls/traffic-policy/expressions/macros/"),
		"/docs/traffic-policy/macros/",
	],
	[
		fromIncludes("/docs/tcp/traffic-policy/expressions/macros/"),
		"/docs/traffic-policy/macros/",
	],
	[
		fromIncludes("/docs/http/traffic-policy/expressions/"),
		"/docs/traffic-policy/concepts/expressions/",
	],
	[
		fromIncludes("/docs/tls/traffic-policy/expressions/"),
		"/docs/traffic-policy/concepts/expressions/",
	],
	[
		fromIncludes("/docs/tcp/traffic-policy/expressions/"),
		"/docs/traffic-policy/concepts/expressions/",
	],
	[fromIncludes("/docs/http/traffic-policy/"), "/docs/traffic-policy/"],
	[fromIncludes("/docs/tls/traffic-policy/"), "/docs/traffic-policy/"],

	// DEC 2024
	[
		fromExact("/docs/traffic-policy/getting-started/"),
		"/docs/traffic-policy/getting-started/agent-endpoints/cli",
	],

	// JAN 2025
	[
		fromIncludes("/docs/tls/tls-termination/"),
		"/docs/traffic-policy/actions/terminate-tls/",
	],
	[
		fromIncludes("/docs/traffic-policy/templates/"),
		"/docs/traffic-policy/examples/a-b-tests/",
	],

	// IA Restructure redirects
	[
		fromIncludes("/docs/tls/termination/agent-tls-termination/"),
		"/docs/agent/agent-tls-termination/",
	],
	[fromIncludes("/docs/concepts/"), "/docs/"],
	// HTTP Redirects
	[
		fromIncludes("/docs/http/basic-auth"),
		"/docs/traffic-policy/actions/basic-auth/",
	],
	[
		fromIncludes("/docs/http/circuit-breaker"),
		"/docs/traffic-policy/actions/circuit-breaker/",
	],
	[
		fromIncludes("/docs/http/compression/"),
		"/docs/traffic-policy/actions/compress-response/",
	],
	[
		fromIncludes("/docs/http/ip-restrictions/"),
		"/docs/traffic-policy/actions/restrict-ips/",
	],
	[
		fromIncludes("/docs/http/mutual-tls/"),
		"/docs/traffic-policy/actions/terminate-tls/#enabling-mutual-tls",
	],
	[fromIncludes("/docs/http/oauth/"), "/docs/traffic-policy/actions/oauth"],
	[
		fromIncludes("/docs/http/openid-connect/"),
		"/docs/traffic-policy/actions/oidc",
	],
	[
		fromIncludes("/docs/http/request-headers/"),
		"/docs/traffic-policy/actions/add-headers",
	],
	[
		fromIncludes("/docs/http/response-headers/"),
		"/docs/traffic-policy/actions/custom-response",
	],
	[fromIncludes("/docs/http/saml/"), "/docs/traffic-policy/actions/saml"],
	// Network Edge
	[fromIncludes("/docs/network-edge/edges"), "/docs/universal-gateway/edges"],
	[
		fromIncludes("/docs/network-edge/cloud-endpoints"),
		"/docs/universal-gateway/cloud-endpoints",
	],
	[
		fromIncludes("/docs/network-edge/domains-and-tcp-addresses"),
		"/docs/universal-gateway/domains",
	],
	[
		fromIncludes("/docs/network-edge/internal-endpoints"),
		"/docs/universal-gateway/internal-endpoints",
	],
	[
		fromIncludes("/docs/network-edge/tls-certificates"),
		"/docs/universal-gateway/tls-certificates",
	],
	[
		fromIncludes("/docs/network-edge/app-users/"),
		"/docs/traffic-policy/identities/",
	],
	[
		fromIncludes("/docs/network-edge/gslb/"),
		"/docs/universal-gateway/global-load-balancer/",
	],
	[fromIncludes("/docs/network-edge/"), "/docs/universal-gateway/edges"],
	// obs
	[fromIncludes("/docs/obs/reference"), "/docs/obs/events/reference"],
	// tcp
	[
		fromIncludes("/docs/tcp/ip-restrictions"),
		"/docs/traffic-policy/actions/restrict-ips/",
	],
	[
		fromIncludes("/docs/tcp/traffic-policy/actions/deny/"),
		"/docs/traffic-policy/actions/deny/",
	],
	[
		fromIncludes("/docs/tcp/traffic-policy/actions/log/"),
		"/docs/traffic-policy/actions/log",
	],
	[
		fromIncludes("/docs/tcp/traffic-policy/actions/restrict-ips/"),
		"/docs/traffic-policy/actions/restrict-ips",
	],
	[
		fromIncludes("/docs/tcp/traffic-policy/actions/"),
		"/docs/traffic-policy/actions/",
	],
	[fromExact("/docs/tcp/traffic-policy/"), "/docs/traffic-policy/"],
	// tls
	[
		fromExact("/docs/tls/ip-restrictions/"),
		"/docs/traffic-policy/actions/restrict-ips",
	],
	[
		fromExact("/docs/tls/mutual-tls/"),
		"/docs/traffic-policy/actions/terminate-tls/#enabling-mutual-tls",
	],
	[
		fromExact("/docs/tls/termination/"),
		"/docs/traffic-policy/actions/terminate-tls/",
	],
	// Universal Gateway
	[fromExact("/docs/http/"), "/docs/universal-gateway/http/"],
	[fromExact("/docs/tcp/"), "/docs/universal-gateway/tcp/"],
	[fromExact("/docs/tls/"), "/docs/universal-gateway/tls/"],

	// Kubernetes Operator Revamp
	[fromExact("/docs/k8s/advanced-deployments/"), "/docs/k8s"],
	[fromExact("/docs/k8s/deployment-guide/"), "/docs/k8s"],
	[fromExact("/docs/k8s/developer-guide/"), "/docs/k8s"],
	[fromExact("/docs/k8s/installation/install/"), "/docs/k8s"],
	[
		fromExact("/docs/k8s/guides/quickstart/"),
		"/docs/getting-started/kubernetes/ingress",
	],
	[
		fromExact("/docs/k8s/developer-guide/architecture/"),
		"/docs/k8s/installation/architecture/",
	],
	[fromExact("/docs/k8s/developer-guide/releasing/"), "/docs/k8s/releasing/"],
	[fromExact("/docs/k8s/developer-guide/internal-crds/"), "/docs/k8s/crds/"],
	[
		fromExact("/docs/k8s/getting-started-gwapi/"),
		"/docs/k8s/guides/using-gwapi",
	],
	[
		fromExact("/docs/k8s/getting-started-kic/"),
		"/docs/k8s/guides/using-ingresses/",
	],
	[fromExact("/docs/k8s/custom-domain/"), "/docs/k8s/guides/custom-domain/"],
	[fromExact("/docs/k8s/user-guide/"), "/docs/k8s/"],
	[fromExact("/docs/k8s/with-edges/"), "/docs/k8s/guides/using-ingresses/"],
	[fromExact("/docs/using-ngrok-with/k8s/"), "/docs/k8s"],

	// Load balancing guides
	[
		fromExact(
			"/docs/guides/other-guides/how-to-round-robin-load-balance-with-ngrok-cloud-edges",
		),
		"/docs/guides/other-guides/load-balancing-multiple-clouds/",
	],
	[
		fromExact(
			"/docs/guides/other-guides/how-to-do-weighted-load-balancing-with-ngrok-cloud-edges/",
		),
		"/docs/guides/other-guides/load-balancing-multiple-clouds/",
	],
	[
		fromExact("/docs/guides/other-guides/load-balancing-with-cloud-edges/"),
		"/docs/guides/other-guides/load-balancing-multiple-clouds/",
	],
	[
		fromExact("/docs/getting-started/kubernetes/"),
		"/docs/k8s/installation/install",
	],
	[
		fromExact("/docs/guides/other-guides/how-to-set-up-a-custom-domain"),
		"/docs/universal-gateway/custom-domains",
	],
	[
		fromExact("/docs/guides/other-guides/"),
		"/docs/guides/security-dev-productivity/",
	],
	[
		fromExact("/docs/guides/using-ngrok-with/"),
		"/docs/using-ngrok-with/minecraft/",
	],
	[
		fromExact("/docs/guides/device-gateway/"),
		"/docs/guides/device-gateway/agent/",
	],
	[fromIncludes("/docs/guides/developer-preview/"), "/docs/"],
	[
		fromExact("/docs/guides/identity-aware-proxy/"),
		"/docs/guides/identity-aware-proxy/securing-with-oauth/",
	],
	[
		fromExact("/docs/guides/other-guides/security-dev-productivity/"),
		"/docs/guides/security-dev-productivity/",
	],
	[
		fromExact(
			"/docs/guides/other-guides/security-dev-productivity/security-dev-productivity/",
		),
		"/docs/guides/security-dev-productivity/",
	],
	[
		fromExact("/docs/using-ngrok-with/python/"),
		"/docs/getting-started/python/",
	],
	[
		fromExact("/docs/using-ngrok-with/node-js/"),
		"/docs/getting-started/javascript/",
	],
	[
		fromExact("/docs/using-ngrok-with/django/"),
		"/docs/getting-started/python/",
	],
	[fromExact("/docs/using-ngrok-with/go/"), "/docs/getting-started/go/"],
	[fromExact("/docs/using-ngrok-with/rust/"), "/docs/getting-started/rust/"],
	[fromExact("/docs/using-ngrok-with/rdp/"), "/docs/guides/ssh-rdp"],
	//site-to-site redirects
	[
		fromExact("/docs/guides/site-to-site-connectivity/dbs/"),
		"/docs/guides/site-to-site-connectivity/",
	],
	[
		fromExact("/docs/guides/site-to-site-connectivity/dbs-mtls/"),
		"/docs/guides/site-to-site-connectivity/",
	],
	[
		fromExact("/docs/guides/site-to-site-connectivity/apis-mtls/"),
		"/docs/guides/site-to-site-connectivity/",
	],
	[
		fromExact("/docs/guides/site-to-site-connectivity/apis/"),
		"/docs/guides/site-to-site-connectivity/",
	],
	[
		fromExact("/docs/guides/other-guides/securing-your-tunnels/"),
		"/docs/guides/security-dev-productivity/securing-your-tunnels",
	],
	[fromExact("/docs/guides/other-guides/licensing"), "/docs/pricing-limits/"],
	[
		fromExact("/docs/guides/other-guides/upgrade-v2-v3/"),
		"/docs/agent/upgrade-v2-v3/",
	],
	[
		fromExact("/docs/using-ngrok-with/wordpress/"),
		"/docs/universal-gateway/examples/wordpress",
	],
	[
		fromExact("/docs/guides/other-guides/n8n"),
		"/docs/universal-gateway/examples/n8n",
	],
	[
		fromExact("/docs/using-ngrok-with/ollama"),
		"/docs/universal-gateway/examples/ollama",
	],
	[
		fromExact("/docs/guides/other-guides/load-balancing-multiple-clouds/"),
		"/docs/universal-gateway/load-balancing-multiple-clouds/",
	],
	[
		fromExact("/docs/guides/other-guides/load-balancing-kubernetes/"),
		"/docs/k8s/load-balancing/load-balancing-kubernetes/",
	],
	[
		fromExact("/docs/guides/other-guides/load-balancing-kubernetes-clusters/"),
		"/docs/k8s/load-balancing/load-balancing-kubernetes-clusters/",
	],
	[
		fromExact("/docs/getting-started/cloud-endpoints-quickstart/"),
		"/docs/getting-started/cloud-endpoints-quickstart",
	],
	// Traffic Policy Macros consolidation (2025)
	[
		fromExact("/docs/traffic-policy/macros/core"),
		"/docs/traffic-policy/macros/",
	],
	[
		fromExact("/docs/traffic-policy/macros/ext"),
		"/docs/traffic-policy/macros/",
	],
	[
		fromExact("/docs/traffic-policy/macros/http"),
		"/docs/traffic-policy/macros/",
	],
	[
		fromExact("/docs/traffic-policy/macros/security"),
		"/docs/traffic-policy/macros/",
	],
	[
		fromExact("/docs/traffic-policy/macros/utility"),
		"/docs/traffic-policy/macros/",
	],

	[
		fromExact(
			"/docs/guides/other-guides/how-to-terminate-traffic-with-ngrok-configs",
		),
		"/docs/agent/agent-tls-termination/",
	],
	[
		fromExact("/docs/guides/other-guides/using-tls-mutual-authentication"),
		"/docs/agent/agent-mutual-tls-termination/",
	],
	[
		fromExact("/docs/guides/other-guides/using-mcp/"),
		"/docs/using-ngrok-with/using-mcp/",
	],
	[
		fromExact("/docs/guides/other-guides/running-behind-firewalls/"),
		"/docs/guides/running-behind-firewalls/",
	],
	[
		fromExact("/docs/universal-gateway/examples/combine-auth-methods/"),
		"/docs/universal-gateway/examples/ip-restrictions-basic-auth/",
	],
	[
		fromExact(
			"/docs/guides/other-guides/path-based-routing-and-policy-decentralization-with-cloud-endpoints",
		),
		"/docs/universal-gateway/cloud-endpoints/routing-and-policy-decentralization/",
	],
	[
		fromExact(
			"/docs/guides/other-guides/forwarding-and-load-balancing-with-cloud-endpoints",
		),
		"/docs/universal-gateway/cloud-endpoints/forwarding-and-load-balancing/",
	],
	[
		fromExact(
			"/docs/guides/other-guides/how-to-set-up-auth-on-your-endpoint-using-traffic-policy",
		),
		"/docs/traffic-policy/examples/oauth-protection",
	],
	[
		fromExact("/docs/guides/other-guides/dashboard-sso-okta-setup/"),
		"/docs/integrations/okta/dashboard-sso-okta-setup",
	],
	// Just a redirect so the top-level guides path goes somewhere (there's no guides/index)
	[fromExact("/docs/guides/"), "/docs/guides/api-gateway/get-started/"],
];

// get current href from window
const currentPath = window.location.pathname;

// set new path to current path
let newPath = currentPath;
let val = "";
// iterate over each redirect, when a match is found, update newPath
// we do this until the list is finished letting us stack redirects:
// redirect A (2018) -> redirect B (2020) -> redirect C (current year)
for (const redirect of redirects) {
	let fromFn = redirect[0];
	let toFn = redirect[1];

	// Sugar for exact matching
	if (typeof fromFn === "string") {
		fromFn = fromExact(fromFn);
	}

	// Sugar for exact replacement
	if (typeof toFn === "string") {
		toFn = toExact(toFn);
	}

	const [from, fromResult] = fromFn(newPath);
	val = { from, fromResult };
	if (fromResult) {
		newPath = toFn(newPath, from);
	}
}

// redirect when the path has changed
if (newPath !== currentPath && newPath !== window.location.pathname) {
	window.location.href = newPath;
} else {
	console.error(
		`ignoring redirect from ${window.location.href} to ${newPath}; looks loopy`,
	);
}
