import { getOrdersByUserId } from '@/lib/database/order';
import { getUserByUserId } from '@/lib/database/user';
import { commaToCurrency } from '@/utils';
import { User } from '@/types/types';
import { auth } from 'auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getMyAddresses } from './addresses/action';
import OrderList from './_components/OrderList';

const PROFILE_FIELDS = [
  'email',
  'name',
  'nickname',
  'phone_number',
  'birth',
  'gender',
] as const;

const getProfileCompletion = (user: User) => {
  const filled = PROFILE_FIELDS.filter(field => user[field]).length;

  return Math.round((filled / PROFILE_FIELDS.length) * 100);
};

const StatCard = ({
  label,
  value,
  unit,
  href,
}: {
  label: string;
  value: string | number;
  unit: string;
  href: string;
}) => (
  <Link
    href={href}
    className="street-card street-card-hover flex flex-col gap-3 p-4"
  >
    <span className="display text-0.75 tracking-widest text-muted-foreground">
      {label}
    </span>
    <div className="flex items-end gap-1.5">
      <span className="display text-1.75 leading-none">{value}</span>
      <span className="display text-0.75 text-muted-foreground">{unit}</span>
    </div>
  </Link>
);

export default async function MyPage() {
  const session = await auth();

  if (!session?.user.user_id) redirect('/auth/login');

  const [user, addresses, orders] = await Promise.all([
    getUserByUserId(session.user.user_id),
    getMyAddresses(),
    getOrdersByUserId(session.user.user_id),
  ]);

  if (!user) throw new Error('User not found');

  const displayName = user.name ?? user.nickname;

  return (
    <div className="flex w-full flex-col gap-8">
      <header className="flex flex-col gap-1 border-b border-border pb-5">
        <h2 className="display text-1.5 leading-tight">
          HELLO, <span className="text-outline">{displayName}</span>
        </h2>
        <p className="text-0.875 text-muted-foreground">{user.email}</p>
      </header>

      <section className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <StatCard
          label="PROFILE"
          value={`${getProfileCompletion(user)}%`}
          unit="COMPLETED"
          href="/my-page/information"
        />
        <StatCard
          label="ORDERS"
          value={orders.length}
          unit="TOTAL"
          href="/my-page"
        />
        <StatCard
          label="POINTS"
          value={commaToCurrency(user.point ?? 0)}
          unit="P"
          href="/my-page"
        />
        <StatCard
          label="ADDRESSES"
          value={addresses.length}
          unit="SAVED"
          href="/my-page/addresses"
        />
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="display text-1 tracking-widest">RECENT ORDERS</h3>
        <OrderList orders={orders} />
      </section>
    </div>
  );
}
