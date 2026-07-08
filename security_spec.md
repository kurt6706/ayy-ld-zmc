# Security Specifications - Ayyıldız Motosiklet Kulübü Firestore Rules

## 1. Data Invariants
- **User profiles**:
  - Every user document ID must match their userId.
  - A standard user cannot change their own `role` or elevate their privileges to `admin`.
  - Sensitive PII (like phone numbers, blood type, and emergency contacts) is restricted to approved members and admin.
- **Events / Routes / Blog Posts**:
  - Only administrators can create, update, or delete events, routes, and blog posts (except for blog likes/comments).
  - Users can increment likes or append to comments on a blog post.
- **Chat Messages**:
  - Anyone can read or send a chat message. Chat messages must have a valid sender name, message body, and valid timestamp.

## 2. The "Dirty Dozen" Payloads (Exploit Scenarios)
1. **Privilege Escalation**: Standard member attempts to update their user document to set `role: "admin"`.
2. **Identity Spoofing**: User A attempts to overwrite User B's profile.
3. **Empty/Shadow Fields**: Malicious create request with extra unknown parameters ("ghost fields") or missing mandatory fields.
4. **Invalid Input Poisoning**: Injecting 10MB string into username, name, or role.
5. **State Shortcutting**: Updating a registration or user status from `pending` directly to `approved` without admin authorization.
6. **Fake Likes Spike**: Directly writing a high number of likes without using a incremental approach.
7. **Malicious ID Injection**: Creating a document with a non-alphanumeric or extremely long ID.
8. **Impersonated Chat**: Sending a message where `sender` doesn't match the user's name or is empty.
9. **Event Spoil**: Standard user attempting to delete an upcoming club ride.
10. **Route Overwrite**: Unauthenticated user trying to change GPS coordinate links of official routes.
11. **Future Timestamps**: Submitting a blog post or comment with a future timestamp to pin it to the top.
12. **Blanket Query Abuse**: Attempting a complete unchecked read of private profiles.

## 3. Security Rules Architecture
- Use `rules_version = '2';`.
- Catch-all default deny block.
- Standard validations: `isValidId`, `incoming`, `existing`.
- Use helper functions `isValidUser`, `isValidEvent`, `isValidBlogPost`, `isValidRoute`, `isValidChatMessage`.
