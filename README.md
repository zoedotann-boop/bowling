# Next.js template

This is a Next.js template with shadcn/ui.

## Adding components

To add components to your app, run the following command:

```bash
npx shadcn@latest add button
```

This will place the ui components in the `components` directory.

## Using components

To use the components in your app, import them as follows:

```tsx
import { Button } from "@/components/ui/button"
```

## Environment variables

Create a `.env` file (git-ignored). The event booking form
(`app/api/events/booking/route.ts`) emails submissions via [Resend](https://resend.com):

| Variable             | Description                                                                 |
| -------------------- | --------------------------------------------------------------------------- |
| `RESEND_API_KEY`     | Resend API key (Resend dashboard → API Keys).                               |
| `CONTACT_FROM_EMAIL` | Sender address on a **domain verified in Resend** (e.g. `events@yourdomain.com`). Unverified domains are rejected. |
| `EVENTS_TO_EMAIL`    | Inbox that receives event booking submissions (the signature is attached as `signature.png`). |

If any of these are missing, the route responds with `500 { error: "Email service is not configured." }`.
