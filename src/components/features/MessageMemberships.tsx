import { Link } from 'react-router-dom';

const BENEFITS=[{name:'DAH GLOW CLUB',image:'https://img.ltwebstatic.com/images3_ccc/2024/05/07/e1/1715080483fec0280f7bf7eaf119b3fbb0349eef9b.png',description:'Explore your account rewards and available points.',to:'/us/user/points',action:'View rewards'},{name:'DAH GLOW SAVER',image:'https://img.shein.com/v4/p/shein/2026/08/12/ee/1786508342586fb9db5fdb04303927918a76cf35f7.png',description:'See the coupons currently available to your account.',to:'/us/user/coupons',action:'View coupons'}];
export default function MessageMemberships(){return <div className="message-benefits">{BENEFITS.map(b=><article key={b.name}><img src={b.image} alt={b.name}/><div><h2>{b.name}</h2><p>{b.description}</p><Link to={b.to}>{b.action}</Link></div></article>)}</div>;}
