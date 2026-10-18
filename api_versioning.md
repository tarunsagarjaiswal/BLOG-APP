# API Versioning: A Quick Guide

**API Versioning** lets you update your system without breaking existing client integrations. 

## When to Version?
*   **Version Needed (Breaking Changes):** Removing endpoints, renaming fields, changing data types, making optional fields required.
*   **No Version Needed (Non-Breaking):** Adding new endpoints, optional parameters, or new response fields.

## 4 Main Strategies

1. **URI Path (Most Common)** 
   * `GET /api/v1/users`
   * *Pros:* Easy to use, cache, and test in browsers. *Cons:* Clutters the URL.
2. **Query Parameter**
   * `GET /api/users?v=1`
   * *Pros:* Clean base URL. *Cons:* Can complicate routing; sometimes ignored by legacy caches.
3. **Custom Header**
   * `X-API-Version: 1`
   * *Pros:* URLs stay pristine; architecturally clean. *Cons:* Harder to test manually (requires tools like Postman).
4. **Accept Header (Content Negotiation)**
   * `Accept: application/vnd.myapi.v1+json`
   * *Pros:* Purest REST approach. *Cons:* Highly complex to implement and document.

## Best Practices
* **Version from Day 1:** Always launch your initial API as `v1`. 
* **Keep it Simple:** Use major versions only (e.g., `v1`, `v2`). Roll non-breaking changes into the active version.
* **Deprecate Gracefully:** Communicate timelines clearly and use `Deprecation` and `Sunset` HTTP headers before turning off old versions.