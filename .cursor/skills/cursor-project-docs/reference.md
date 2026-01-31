# Reputable Sources for Repository Documentation

Use these when writing or updating docs. Consult the relevant page for structure, audience, and best practices.

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

## Product Requirements Documents (PRDs)

- **How to Write a PRD (Product School)**  
  https://productschool.com/blog/product-management-2/how-to-write-prd  
  Comprehensive guide on PRD structure, content, and best practices.

- **Writing Great PRDs (Silicon Valley Product Group)**  
  https://www.svpg.com/assets/Files/goodprd.pdf  
  Marty Cagan's classic guide on effective product requirements.

- **PRD Template (Atlassian)**  
  https://www.atlassian.com/agile/product-management/requirements  
  Practical PRD template and guidance from Atlassian.

**Key PRD principles**:
- Define the problem before the solution
- Focus on user needs and business outcomes
- Include measurable success criteria
- Keep requirements testable (acceptance criteria)
- Separate "what" (PRD) from "how" (technical design)

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

When in doubt:
- For GitHub docs: Prefer official GitHub docs for README, CONTRIBUTING, and SECURITY structure
- For PRDs: Focus on user needs and measurable outcomes; keep technical details out
- For HLD: System-wide architecture; reference PRD requirements
- For Tech Plans: Implementation details; reference HLD components

## Document Workflow Summary

```
PRD (Product Requirements)
    ↓ Defines WHAT and WHY
    ↓ Stakeholder approval required
    
HLD (High-Level Design)
    ↓ Defines HOW at system level
    ↓ Architecture approval required
    
Tech Plans (Implementation Specs)
    ↓ Defines HOW at component level
    ↓ Engineering approval required
    
Implementation
    ↓ Code follows Tech Plans
    ↓ PRD acceptance criteria guide testing
```

**Never skip steps**: PRDs must exist before HLD. HLD must exist before Tech Plans.
