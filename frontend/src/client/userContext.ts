import { createContext } from 'react';
import type { UserInfo } from '@bindings/UserInfo'

export const UserContext = createContext<[UserInfo | null, ((user: UserInfo) => void) | null]>([null, null]);
