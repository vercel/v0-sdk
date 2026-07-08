import { createId } from 'legid' // v0 uses legid for chat IDs

export const createChatId = () => createId({ approximateLength: 11, step: 3 })