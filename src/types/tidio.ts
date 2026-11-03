export interface TidioContact {
 id:string;
 first_name:string|null;
 last_name:string|null;
 email:string|null;
 phone:string|null;
 country:string|null;
 city:string|null;
 created_at:string|null;
}

export interface TidioMessage {
 id:string;
 author_type:'contact'|'operator'|'bot';
 author_id:string|null;
 message:string;
 created_at:string;
}

export interface TidioPage<T>{
 [key:string]:unknown;
 contacts?:T[];
 messages?:T[];
 meta:{cursor:string|null;limit:number};
 conversation_url?:string|null;
}

export interface TidioOperator{
 id:string;
 name:string|null;
 email:string|null;
 role:string|null;
 active:boolean;
 last_seen:string|null;
 picture:string|null;
}

export interface TidioEvent{
 webhook_id:string;
 topic:string;
 contact_id:string|null;
 ticket_id:number|null;
 occurred_at:string;
 reason:string|null;
 received_at:string;
}
