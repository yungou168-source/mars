---
name: extension-authoring
version: 1.0.0
description: Create an auditable Mars AI extension manifest and package.
---

# Extension authoring

1. Define one task and its expected inputs and outputs.
2. Declare only the permissions required for that task.
3. Put executable files or skill content in the directory named by the manifest.
4. Calculate SHA-256 for every executable or loadable file and record it in `integrity.files`.
5. Test the package in an isolated environment before submission.
6. Never include credentials, wallet secrets, user data or private endpoints.

The client must display declared permissions and receive user confirmation before installation or activation.
