import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useNavigate,Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import PageHeader from '@/components/layout/PageHeader';

const schema=z.object({username:z.string().trim().min(2,'Use at least 2 characters').max(32,'Use no more than 32 characters')});
export default function EditUsername(){const {user,updateProfile}=useAuth();const navigate=useNavigate();const [busy,setBusy]=useState(false);const {register,handleSubmit,formState:{errors}}=useForm<{username:string}>({resolver:zodResolver(schema),defaultValues:{username:user?.username||''}});const save=async(v:{username:string})=>{setBusy(true);if(await updateProfile(v.username))navigate('/account/profile');else setBusy(false);};return <main className="standard-page account-auth-page"><PageHeader title="Nickname"/>{user?<form className="account-form" onSubmit={handleSubmit(save)}><label>Nickname<input autoComplete="nickname" maxLength={32} {...register('username')}/></label>{errors.username&&<p className="field-error">{errors.username.message}</p>}<button className="primary-button" disabled={busy}>{busy?'Saving…':'Save nickname'}</button></form>:<Link to="/login" className="primary-button">Sign in</Link>}</main>;}
