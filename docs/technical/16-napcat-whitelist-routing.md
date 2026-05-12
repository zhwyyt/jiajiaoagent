# NapCat Whitelist Routing

## Purpose

Define the first shared-entry routing rule when one NapCat runtime is used to serve multiple upper-layer projects on this machine.

Current targets:

- `autoribao`
- `jiajiaoagent`

This document records the current whitelist decision and the minimum safe routing behavior.

## Current Decision

Use one shared NapCat entrypoint and route by QQ `user_id` whitelist.

Do not rely on:

- QQ client-side contact grouping;
- nickname matching;
- message content heuristics.

Use:

- explicit `user_id` whitelist;
- explicit target mapping;
- `ignore` as the default unmatched behavior.

## Current Whitelist

### Route To `autoribao`

- `1647127576`
- `794618446`

### Route To `jiajiaoagent`

- `584201119`
- `963028199`

Canonical config file:

- `config/napcat-routing.json`

## Why Default Must Be `ignore`

At the current stage, shared-entry routing should optimize for:

1. not串线;
2. not accidentally exposing one project to the other project's users;
3. controlled trial rollout.

So the safest default is:

- if `user_id` does not match any whitelist entry, do not route it to either project automatically.

## Minimum Runtime Behavior

The NapCat-side router should behave like this:

1. read inbound `user_id`;
2. check `config/napcat-routing.json` or equivalent runtime mapping;
3. if user is in `autoribao.userIds`, send to `autoribao`;
4. if user is in `jiajiaoagent.userIds`, send to `jiajiaoagent`;
5. if user matches nothing, ignore or log as `unmatched_user`;
6. never let the same user hit both projects.

## Conflict Rule

If one `user_id` appears in multiple targets:

1. treat it as config error;
2. fail closed;
3. do not auto-route that user until the conflict is resolved.

## Rollout Recommendation

Recommended rollout order:

1. add whitelist config first;
2. add runtime logging for matched target and unmatched user;
3. test one `autoribao` user;
4. test one `jiajiaoagent` user;
5. confirm there is no cross-project bleed;
6. only then expand the whitelist.

## Current Limitation

This repository now records the routing decision and canonical config.

The live shared NapCat runtime still needs to consume this config in the actual entrypoint code outside this repo if that runtime remains located in:

- `I:\\autoweb\\autoribao`

or another external workspace.

So this file is the source of truth for the rule, but not yet proof that the live runtime is already reading it.

## Next Step

The next implementation step is to patch the live NapCat router so it:

1. loads `config/napcat-routing.json`;
2. routes by `user_id`;
3. logs matched target decisions;
4. ignores unmatched users by default.
