# Reputable Sources for Repository Documentation

Use these when writing or updating GitHub repo docs. Consult the relevant page for structure, audience, and best practices.

## GitHub Docs (docs.github.com)

- **Best practices for repositories**  
  https://docs.github.com/en/repositories/creating-and-managing-repositories/best-practices-for-repositories  
  High-level guidance: README, SECURITY, dependency alerts, branch protection, and security features.

- **About README**  
  https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes  
  What READMEs are for; where GitHub looks (root, docs/, .github/); what to include (what, why, how to get started, where to get help).

- **Setting guidelines for repository contributors (CONTRIBUTING)**  
  https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/setting-guidelines-for-repository-contributors  
  How CONTRIBUTING is used; where to place it (root, docs/, .github/); what to include for contributors.

- **Adding a security policy (SECURITY.md)**  
  https://docs.github.com/en/code-security/getting-started/adding-a-security-policy-to-your-repository  
  Supported versions; how to report vulnerabilities; where to place SECURITY.md (root, docs/, .github/).

## Technical Design Documentation

- **GitLab Architecture Design Documents**  
  https://handbook.gitlab.com/handbook/engineering/architecture/design-documents  
  How GitLab structures architecture design docs as version-controlled artifacts.

- **GitLab Architecture Workflow**  
  https://handbook.gitlab.com/handbook/engineering/architecture/workflow  
  Process for creating and iterating on design documents.

- **Microsoft Engineering Playbook: Documentation**  
  https://microsoft.github.io/code-with-engineering-playbook/documentation/  
  Best practices for engineering documentation, onboarding, and organization.

- **High-Level vs Low-Level Design (GeeksforGeeks)**  
  https://geeksforgeeks.org/system-design/difference-between-high-level-design-and-low-level-design  
  Clear explanation of HLD vs LLD scope and content.

- **System Design Handbook: HLD vs LLD**  
  https://www.systemdesignhandbook.com/blog/low-level-design-vs-high-level-design/  
  Practical guidance on when to use each level of design documentation.

## Optional / Further Reading

- **Open source guides (GitHub)**  
  https://opensource.guide/  
  Broader open-source practices; can inform CONTRIBUTING, CODE_OF_CONDUCT, and community docs.

- **GitBook: Documentation Structure Tips**  
  https://docs.gitbook.com/guides/best-practices/documentation-structure-tips  
  Information architecture best practices for technical documentation.

## WHOOP Engineering Standards

- **Doubling Down on Documentation**  
  https://engineering.prod.whoop.com/tech-docs/  
  WHOOP's approach to automated documentation generation, discoverability, and standardization.

- **WHOOP Developer Platform**  
  https://developer.whoop.com/docs/introduction  
  Example of structured documentation: WHOOP 101 (concepts), Developing Your App (guides), Tutorials (examples), API Reference (specs).

- **WHOOP API Design**  
  https://engineering.whoop.com/dev-platform  
  Principles for API documentation: stability, consistency, self-service documentation.

**Key WHOOP Principles**:
1. **Automation**: Couple documentation with code deployments
2. **Discoverability**: Centralized portal, search, filtering
3. **Standardization**: Uniform format across all documentation
4. **Collaboration**: Direct links, easy sharing, version history

When in doubt:
- **Primary**: Follow [WinPodiums Documentation Standards](../../docs/standards/documentation-standards.md)
- For GitHub docs: Prefer official GitHub docs for README, CONTRIBUTING, and SECURITY structure
- For technical docs: Follow WHOOP-inspired patterns for PRD/Technical Plan/ADR structure
