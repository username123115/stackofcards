import { createContext } from 'react';
import type { UserInfo } from './types/wss'

export const UserContext = createContext<[UserInfo | null, ((user: UserInfo) => void) | null]>([null, null]);
