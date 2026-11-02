
import type { Money,PageInfo } from '@/types/shop';
export interface CreditAccount {id:string;balance:Money;}
export interface WalletTransaction {__typename:string;amount:Money;balanceAfterTransaction:Money;createdAt:string;event:string;}
export interface WalletData {accounts:CreditAccount[];transactions:WalletTransaction[];pageInfo:PageInfo;accountId?:string;}
