import { tool } from 'ai'
import { z } from 'zod'
import { createClient, type V0ClientConfig } from 'v0-sdk'

/**
 * Creates user-related AI SDK tools
 */
export function createUserTools(config: V0ClientConfig = {}) {
  const client = createClient(config)

  const getCurrentUser = tool({
    description: 'Get current user information',
    inputSchema: z.object({}),
    execute: async () => {
      const result = await client.user.get()

      return {
        userId: result.id,
        name: result.name,
        email: result.email,
        avatar: result.avatar,
      }
    },
  })

  const getUserBilling = tool({
    description: 'Get current user billing information',
    inputSchema: z.object({
      scope: z.string().optional().describe('Scope for billing information'),
    }),
    execute: async (params) => {
      const { scope } = params
      const result = await client.user.getBilling({ scope })

      if (result.billingType === 'token') {
        return {
          billingType: result.billingType,
          plan: result.data.plan,
          role: result.data.role,
          billingMode: result.data.billingMode,
          billingCycle: {
            start: result.data.billingCycle.start,
            end: result.data.billingCycle.end,
          },
          balance: {
            remaining: result.data.balance.remaining,
            total: result.data.balance.total,
          },
          onDemand: {
            balance: result.data.onDemand.balance,
            blocks: result.data.onDemand.blocks,
          },
        }
      } else {
        return {
          billingType: result.billingType,
          remaining: result.data.remaining,
          reset: result.data.reset,
          limit: result.data.limit,
        }
      }
    },
  })

  const getUserPlan = tool({
    description: 'Get current user plan information',
    inputSchema: z.object({}),
    execute: async () => {
      const result = await client.user.getPlan()

      return {
        plan: result.plan,
        billingCycle: {
          start: result.billingCycle.start,
          end: result.billingCycle.end,
        },
        balance: {
          remaining: result.balance.remaining,
          total: result.balance.total,
        },
      }
    },
  })

  const getUserScopes = tool({
    description: 'Get user scopes/permissions',
    inputSchema: z.object({}),
    execute: async () => {
      const result = await client.user.getScopes()

      return {
        scopes: result.data.map((scope) => ({
          id: scope.id,
          name: scope.name,
        })),
      }
    },
  })

  const getRateLimits = tool({
    description: 'Get current rate limit information',
    inputSchema: z.object({
      scope: z.string().optional().describe('Scope for rate limit information'),
    }),
    execute: async (params) => {
      const { scope } = params
      const result = await client.rateLimits.find({ scope })

      return {
        remaining: result.remaining,
        reset: result.reset,
        limit: result.limit,
      }
    },
  })

  return {
    getCurrentUser,
    getUserBilling,
    getUserPlan,
    getUserScopes,
    getRateLimits,
  }
}
