import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// `src/sanity/env.ts` throws at import time when these are unset. The helpers
// under test never reach the network, so stub values are enough to let modules
// that transitively import the Sanity client load under jsdom and in CI.
// `||=` keeps any real values from a local `.env.local`.
process.env.NEXT_PUBLIC_SANITY_DATASET ||= "test";
process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||= "test";

afterEach(() => cleanup());
