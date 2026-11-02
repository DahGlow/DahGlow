import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Search } from 'lucide-react';

interface Fields {query:string;}
interface Props {initial:string;onSearch:(query:string)=>void;}
const schema=z.object({query:z.string().trim().max(200)});
export default function StoreSearchForm({initial,onSearch}:Props){const {register,handleSubmit}=useForm<Fields>({defaultValues:{query:initial},resolver:zodResolver(schema)});return <form className="search-form store-search-form" onSubmit={handleSubmit(v=>onSearch(v.query))}><label className="sr-only" htmlFor="vendor-search">Search this store</label><input id="vendor-search" placeholder="Search this store" {...register('query')}/><button type="submit" aria-label="Search store"><Search size={20}/></button></form>;}
