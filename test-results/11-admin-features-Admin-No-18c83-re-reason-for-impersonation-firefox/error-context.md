# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e4]:
    - generic [ref=e5]:
      - generic [ref=e7]: EaseMail
      - generic [ref=e8]: Welcome back
      - generic [ref=e9]: Sign in to your account to continue
    - generic [ref=e10]:
      - generic [ref=e11]:
        - generic [ref=e12]:
          - text: Email
          - textbox "Email" [ref=e13]:
            - /placeholder: you@example.com
        - generic [ref=e14]:
          - generic [ref=e15]:
            - generic [ref=e16]: Password
            - link "Forgot password?" [ref=e17] [cursor=pointer]:
              - /url: /reset-password
          - textbox "Password" [ref=e18]:
            - /placeholder: ••••••••
      - generic [ref=e19]:
        - button "Sign In" [ref=e20] [cursor=pointer]
        - paragraph [ref=e21]:
          - text: Don't have an account?
          - link "Sign up" [ref=e22] [cursor=pointer]:
            - /url: /signup
  - region "Notifications alt+T"
  - button "Open Next.js Dev Tools" [ref=e28] [cursor=pointer]:
    - img [ref=e29]
  - alert [ref=e33]
```