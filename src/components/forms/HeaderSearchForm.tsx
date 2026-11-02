import { useEffect } from 'react';
import { Link,useNavigate,useSearchParams } from 'react-router-dom';
import { Camera,Search } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
const schema=z.object({query:z.string().trim().max(200)});
interface Props {id:string;}
export default function HeaderSearchForm({id}:Props){const navigate=useNavigate();const [params]=useSearchParams();const {register,handleSubmit,setValue}=useForm<z.infer<typeof schema>>({resolver:zodResolver(schema),defaultValues:{query:params.get('q')||''}});useEffect(()=>setValue('query',params.get('q')||''),[params.get('q'),setValue]);return <form className="header-search" onSubmit={handleSubmit(v=>navigate(`/search?q=${encodeURIComponent(v.query)}`))}><label className="sr-only" htmlFor={id}>Search products</label><input id={id} placeholder="Search your next favorite" {...register('query')}/><Link className="header-camera" to="/scan-product" aria-label="Search with a photo"><Camera size={20}/></Link><button type="submit" aria-label="Search products"><Search size={22}/></button></form>;}
