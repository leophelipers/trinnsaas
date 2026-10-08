/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as adminCredits from "../adminCredits.js";
import type * as adminPricing from "../adminPricing.js";
import type * as antiAbuse from "../antiAbuse.js";
import type * as chat from "../chat.js";
import type * as credits from "../credits.js";
import type * as dashboard from "../dashboard.js";
import type * as featureFlags from "../featureFlags.js";
import type * as http from "../http.js";
import type * as messages from "../messages.js";
import type * as observability from "../observability.js";
import type * as studioElements from "../studioElements.js";
import type * as studioGenerations from "../studioGenerations.js";
import type * as studioProjects from "../studioProjects.js";
import type * as studioScripts from "../studioScripts.js";
import type * as tasks from "../tasks.js";
import type * as users from "../users.js";
import type * as utils_antiAbuseUtils from "../utils/antiAbuseUtils.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  adminCredits: typeof adminCredits;
  adminPricing: typeof adminPricing;
  antiAbuse: typeof antiAbuse;
  chat: typeof chat;
  credits: typeof credits;
  dashboard: typeof dashboard;
  featureFlags: typeof featureFlags;
  http: typeof http;
  messages: typeof messages;
  observability: typeof observability;
  studioElements: typeof studioElements;
  studioGenerations: typeof studioGenerations;
  studioProjects: typeof studioProjects;
  studioScripts: typeof studioScripts;
  tasks: typeof tasks;
  users: typeof users;
  "utils/antiAbuseUtils": typeof utils_antiAbuseUtils;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
