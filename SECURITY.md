# Security policy

NahaAdmin is a static frontend template. Demo authentication, validation, and local
state are not production security controls. Add server-side authentication,
authorization, validation, and storage in your application; never embed secrets.

## Reporting a vulnerability

Do not disclose vulnerabilities, exploit details, credentials, or personal data in
public issues or pull requests.

1. If GitHub shows **Report a vulnerability** under this repository's **Security**
   tab, use that private channel. Availability depends on repository settings.
2. Otherwise, email the existing project contact, **hello@sepsu.dev**, with subject
   `NahaAdmin security report`. Start with a brief summary and ask for a private
   exchange before sending sensitive material. Email encryption is not configured
   by this repository.

Include the affected page, commit or dependency version, reproduction steps using
synthetic data, impact, and any proposed fix. Coordinate disclosure before opening
a public pull request. Do not send real credentials or user data.

## Scope and maintenance

Reports about template code and shipped examples are welcome. For third-party
library defects, also follow the upstream security policy. Dependency versions and
license sources are listed in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

No release support matrix or response-time guarantee is currently published.
Report the exact commit tested; historical releases are not promised backports.
Integrators remain responsible for production configuration and dependency updates.
