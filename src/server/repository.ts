import { SqliteStore, PostgresStore, type Store } from './database';
import { randomBytes, randomUUID, createHash } from 'node:crypto';
import { databaseConfiguration } from './database-config';
import { consumeGuestLimit, assertGuestCapacity } from './guest-limits';
import { z } from 'zod';
import {
  findProduct,
  MAX_QUANTITY,
  unitPrice,
  FREE_SHIPPING,
  SHIPPING_FEE,
} from '@/domain/catalog';
import {
  configKey,
  configSchema,
  DomainError,
  idSchema,
  productInput,
  previewSchema,
} from '@/domain/validation';
import {
  ADDRESSES,
  type DemoState,
  type DemoOrder,
  type SavedDesign,
  type OrderStatus,
  type OrderItem,
} from '@/domain/types';

const now = () => new Date().toISOString();
const tokenHash = (token: string) =>
  createHash('sha256').update(token).digest('hex');

/** One commerce implementation shared by local SQLite and cloud PostgreSQL. */
export class DemoRepository {
  readonly store: Store;
  constructor(path: string | Store) {
    this.store = typeof path === 'string' ? new SqliteStore(path) : path;
  }
  async row(sql: string, ...params: (string | number | null)[]) {
    return (await this.store.rows(sql, params))[0];
  }
  async rows(sql: string, ...params: (string | number | null)[]) {
    return this.store.rows(sql, params);
  }
  async run(sql: string, ...params: (string | number | null)[]) {
    return this.store.run(sql, params);
  }
  async transaction<T>(fn: () => Promise<T>): Promise<T> {
    return this.store.transaction(fn);
  }
  async close() {
    await this.store.close();
  }
  async account(provider: string, providerId: string, name: string) {
    return this.transaction(async () => {
      const id = randomUUID();
      await this.run(
        'INSERT INTO accounts VALUES(?,?,?,?) ON CONFLICT(provider,provider_id) DO NOTHING',
        id,
        provider,
        providerId,
        name.slice(0, 50) || 'NIJOOW 멤버',
      );
      return String(
        (await this.row(
          'SELECT id FROM accounts WHERE provider=? AND provider_id=?',
          provider,
          providerId,
        ))!.id,
      );
    });
  }
  async workspace(token?: string, accountId?: string) {
    return await this.transaction(async () => {
      let current =
        token && /^[a-f0-9]{64}$/.test(token)
          ? await this.row(
              'SELECT * FROM workspaces WHERE token_hash=?',
              tokenHash(token),
            )
          : undefined;
      // A logged-out/different account never inherits a previous member's workspace.
      if (current?.account_id && current.account_id !== accountId)
        current = undefined;
      if (
        current &&
        !current.account_id &&
        Date.now() - Date.parse(String(current.updated_at)) > 7 * 86400000
      )
        current = undefined;
      if (accountId) {
        const member = await this.row(
          'SELECT * FROM workspaces WHERE account_id=? ORDER BY updated_at DESC LIMIT 1',
          accountId,
        );
        if (
          member &&
          current &&
          member.id !== current.id &&
          !current.account_id
        ) {
          const from = String(current.id),
            to = String(member.id);
          for (const table of ['cart', 'designs', 'orders', 'shares'])
            await this.run(
              `UPDATE ${table} SET workspace_id=? WHERE workspace_id=?`,
              to,
              from,
            );
          await this.run(
            'INSERT OR IGNORE INTO favorites SELECT ?,product_id FROM favorites WHERE workspace_id=?',
            to,
            from,
          );
          await this.run('DELETE FROM favorites WHERE workspace_id=?', from);
          for (const inv of await this.rows(
            'SELECT * FROM inventory WHERE workspace_id=?',
            from,
          )) {
            const productId = String(inv.product_id),
              size = String(inv.size);
            const merged = Math.max(
              0,
              (await this.stock(to, productId, size)) -
                (20 - Number(inv.stock)),
            );
            await this.run(
              'INSERT INTO inventory VALUES(?,?,?,?) ON CONFLICT(workspace_id,product_id,size) DO UPDATE SET stock=excluded.stock',
              to,
              productId,
              size,
              merged,
            );
          }
          await this.run('DELETE FROM inventory WHERE workspace_id=?', from);
          await this.run(
            'DELETE FROM operation_limits WHERE key IN (?,?)',
            `save:${from}`,
            `share:${from}`,
          );
          await this.run('DELETE FROM workspaces WHERE id=?', from);
          current = member;
        } else if (member) current = member;
        else if (current) {
          await this.run(
            'UPDATE workspaces SET account_id=? WHERE id=?',
            accountId,
            String(current.id),
          );
          current.account_id = accountId;
        }
      }
      if (!current) {
        if (!accountId) {
          await assertGuestCapacity(this.store, 'workspaces');
          await consumeGuestLimit(this.store, 'create');
        }
        const fresh = randomBytes(32).toString('hex'),
          id = randomUUID();
        await this.run(
          'INSERT INTO workspaces VALUES(?,?,?,?)',
          id,
          tokenHash(fresh),
          accountId ?? null,
          now(),
        );
        return { id, token: fresh };
      }
      // Rotate the browser token on authenticated adoption; only the new cookie is usable.
      const effectiveToken = accountId
        ? randomBytes(32).toString('hex')
        : token!;
      await this.run(
        'UPDATE workspaces SET token_hash=?,updated_at=? WHERE id=?',
        tokenHash(effectiveToken),
        now(),
        String(current.id),
      );
      return { id: String(current.id), token: effectiveToken };
    });
  }
  async stock(workspace: string, product: string, size: string) {
    return Number(
      (
        await this.row(
          'SELECT stock FROM inventory WHERE workspace_id=? AND product_id=? AND size=?',
          workspace,
          product,
          size,
        )
      )?.stock ?? 20,
    );
  }
  async state(workspace: string): Promise<DemoState> {
    const ws = (await this.row(
      'SELECT * FROM workspaces WHERE id=?',
      workspace,
    ))!;
    const account = ws.account_id
      ? await this.row(
          'SELECT name FROM accounts WHERE id=?',
          String(ws.account_id),
        )
      : null;
    return {
      workspaceId: workspace,
      signedIn: !!account,
      name: account ? String(account.name) : '게스트 에디터',
      favorites: (
        await this.rows(
          'SELECT product_id FROM favorites WHERE workspace_id=?',
          workspace,
        )
      ).map(r => String(r.product_id)),
      cart: (
        await Promise.all(
          (
            await this.rows(
              'SELECT * FROM cart WHERE workspace_id=? ORDER BY id',
              workspace,
            )
          ).map(async r => {
            const product = findProduct(String(r.product_id));
            if (!product) return null;
            const config = r.config ? JSON.parse(String(r.config)) : null;
            return {
              id: String(r.id),
              productId: product.id,
              size: String(r.size),
              quantity: Number(r.quantity),
              config,
              product,
              unitPrice: unitPrice(product, config),
              stock: await this.stock(workspace, product.id, String(r.size)),
              preview: r.preview ? String(r.preview) : null,
            };
          }),
        )
      ).filter((line): line is NonNullable<typeof line> => line !== null),
      designs: (
        await this.rows(
          'SELECT * FROM designs WHERE workspace_id=? ORDER BY updated_at DESC',
          workspace,
        )
      ).map(r => ({
        id: String(r.id),
        name: String(r.name),
        config: JSON.parse(String(r.config)),
        version: Number(r.version),
        updatedAt: String(r.updated_at),
        preview: r.preview ? String(r.preview) : null,
      })),
      orders: (
        await this.rows(
          "SELECT payload FROM orders WHERE workspace_id=? ORDER BY json_extract(payload,'$.createdAt') DESC,id DESC",
          workspace,
        )
      ).map(r => JSON.parse(String(r.payload))),
    };
  }
  async addCart(workspace: string, input: unknown) {
    const { product, config, size, quantity, preview } = productInput(input);
    return await this.transaction(async () => {
      const key = configKey(config);
      const same = await this.row(
        'SELECT * FROM cart WHERE workspace_id=? AND product_id=? AND size=? AND config_key=?',
        workspace,
        product.id,
        size,
        key,
      );
      const next = Number(same?.quantity ?? 0) + quantity;
      if (next > MAX_QUANTITY)
        throw new DomainError(
          'QUANTITY_LIMIT',
          `같은 구성은 최대 ${MAX_QUANTITY}개까지 담을 수 있습니다.`,
        );
      if (next > (await this.stock(workspace, product.id, size)))
        throw new DomainError(
          'OUT_OF_STOCK',
          '선택 가능한 수량을 초과했습니다. 수량을 조정해 주세요.',
        );
      if (
        !same &&
        Number(
          (await this.row(
            'SELECT COUNT(*) AS count FROM cart WHERE workspace_id=?',
            workspace,
          ))!.count,
        ) >= 30
      )
        throw new DomainError(
          'CART_LIMIT',
          '장바구니는 30개 구성까지 담을 수 있습니다.',
        );
      const id = String(same?.id ?? randomUUID());
      if (same)
        await this.run('UPDATE cart SET quantity=? WHERE id=?', next, id);
      else
        await this.run(
          'INSERT INTO cart VALUES(?,?,?,?,?,?,?,?)',
          id,
          workspace,
          product.id,
          size,
          next,
          config ? JSON.stringify(config) : null,
          key,
          preview ?? null,
        );
      return id;
    });
  }
  async changeQuantity(workspace: string, id: string, quantity: number) {
    return this.transaction(async () => {
      z.number().int().min(1).max(MAX_QUANTITY).parse(quantity);
      const line = await this.row(
        'SELECT * FROM cart WHERE id=? AND workspace_id=?',
        id,
        workspace,
      );
      if (!line)
        throw new DomainError(
          'NOT_FOUND',
          '장바구니 항목을 찾을 수 없습니다.',
          404,
        );
      if (
        quantity >
        (await this.stock(
          workspace,
          String(line.product_id),
          String(line.size),
        ))
      )
        throw new DomainError(
          'OUT_OF_STOCK',
          '선택 가능한 수량을 초과했습니다.',
        );
      await this.run(
        'UPDATE cart SET quantity=? WHERE id=? AND workspace_id=?',
        quantity,
        id,
        workspace,
      );
    });
  }
  async replaceCart(workspace: string, id: string, input: unknown) {
    const changes = z
      .object({
        size: z.string(),
        config: configSchema,
        preview: previewSchema,
      })
      .strict()
      .parse(input);
    return await this.transaction(async () => {
      const current = await this.row(
        'SELECT * FROM cart WHERE id=? AND workspace_id=?',
        id,
        workspace,
      );
      if (!current)
        throw new DomainError(
          'NOT_FOUND',
          '수정할 장바구니 항목을 찾을 수 없습니다.',
          404,
        );
      const item = productInput({
        productId: String(current.product_id),
        quantity: Number(current.quantity),
        ...changes,
      });
      const key = configKey(item.config);
      const same = await this.row(
        'SELECT * FROM cart WHERE workspace_id=? AND id!=? AND product_id=? AND size=? AND config_key=?',
        workspace,
        id,
        item.product.id,
        item.size,
        key,
      );
      const quantity = item.quantity + Number(same?.quantity ?? 0);
      if (
        quantity > MAX_QUANTITY ||
        quantity > (await this.stock(workspace, item.product.id, item.size))
      )
        throw new DomainError(
          'QUANTITY_LIMIT',
          '같은 구성의 수량을 확인해 주세요.',
        );
      const resultId = String(same?.id ?? id);
      await this.run(
        'UPDATE cart SET size=?,quantity=?,config=?,config_key=?,preview=? WHERE id=? AND workspace_id=?',
        item.size,
        quantity,
        JSON.stringify(item.config),
        key,
        item.preview ?? null,
        resultId,
        workspace,
      );
      if (same) await this.removeCart(workspace, id);
      return resultId;
    });
  }
  async removeCart(workspace: string, id: string) {
    await this.run(
      'DELETE FROM cart WHERE id=? AND workspace_id=?',
      id,
      workspace,
    );
  }
  async favorite(workspace: string, product: string) {
    return this.transaction(async () => {
      if (!findProduct(product))
        throw new DomainError('NOT_FOUND', '상품을 찾을 수 없습니다.', 404);
      if (
        await this.row(
          'SELECT * FROM favorites WHERE workspace_id=? AND product_id=?',
          workspace,
          product,
        )
      )
        await this.run(
          'DELETE FROM favorites WHERE workspace_id=? AND product_id=?',
          workspace,
          product,
        );
      else
        await this.run('INSERT INTO favorites VALUES(?,?)', workspace, product);
    });
  }
  async saveDesign(workspace: string, input: unknown) {
    const data = z
      .object({
        id: idSchema,
        name: z.string().trim().min(1).max(40),
        config: configSchema,
        version: z.number().int().nonnegative(),
        preview: previewSchema,
      })
      .strict()
      .parse(input);
    return await this.transaction(async () => {
      const existing = await this.row(
        'SELECT * FROM designs WHERE id=?',
        data.id,
      );
      if (existing && existing.workspace_id !== workspace)
        throw new DomainError('NOT_FOUND', '디자인을 찾을 수 없습니다.', 404);
      if (!existing && data.version > 0)
        throw new DomainError(
          'CONFLICT',
          '삭제된 디자인입니다. 현재 내용을 사본으로 저장해 주세요.',
          409,
        );
      if (existing && Number(existing.version) !== data.version)
        throw new DomainError(
          'CONFLICT',
          '다른 창에서 디자인이 변경되었습니다. 현재 내용을 사본으로 저장해 주세요.',
          409,
        );
      if (
        !existing &&
        Number(
          (await this.row(
            'SELECT COUNT(*) AS count FROM designs WHERE workspace_id=?',
            workspace,
          ))!.count,
        ) >= 50
      )
        throw new DomainError(
          'DESIGN_LIMIT',
          '디자인은 50개까지 저장할 수 있습니다.',
        );
      if (
        !(
          await this.row(
            'SELECT account_id FROM workspaces WHERE id=?',
            workspace,
          )
        )?.account_id
      ) {
        if (!existing) await assertGuestCapacity(this.store, 'designs');
        await consumeGuestLimit(this.store, 'save', workspace);
      }
      const version = (Number(existing?.version) || 0) + 1;
      const updatedAt = now();
      await this.run(
        'INSERT INTO designs VALUES(?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,config=excluded.config,version=excluded.version,updated_at=excluded.updated_at,preview=excluded.preview',
        data.id,
        workspace,
        data.name,
        JSON.stringify(data.config),
        version,
        updatedAt,
        data.preview ?? null,
      );
      return { ...data, version, updatedAt } as SavedDesign;
    });
  }
  async deleteDesign(workspace: string, id: string) {
    await this.run(
      'DELETE FROM designs WHERE id=? AND workspace_id=?',
      id,
      workspace,
    );
  }
  async share(workspace: string, id: string) {
    return this.transaction(async () => {
      const row = await this.row(
        'SELECT * FROM designs WHERE id=? AND workspace_id=?',
        id,
        workspace,
      );
      if (!row)
        throw new DomainError(
          'NOT_FOUND',
          '저장한 디자인을 먼저 선택해 주세요.',
          404,
        );
      if (
        !(
          await this.row(
            'SELECT account_id FROM workspaces WHERE id=?',
            workspace,
          )
        )?.account_id
      ) {
        await assertGuestCapacity(this.store, 'shares', workspace);
        await consumeGuestLimit(this.store, 'share', workspace);
      }
      const token = randomBytes(18).toString('base64url');
      await this.run(
        'INSERT INTO shares VALUES(?,?,?,?)',
        token,
        workspace,
        JSON.stringify({
          name: row.name,
          config: JSON.parse(String(row.config)),
        }),
        new Date(Date.now() + 7 * 86400000).toISOString(),
      );
      return token;
    });
  }
  async shared(token: string) {
    const row = await this.row(
      'SELECT payload FROM shares WHERE token=? AND expires_at>?',
      token,
      now(),
    );
    return row
      ? (JSON.parse(String(row.payload)) as Pick<
          SavedDesign,
          'name' | 'config'
        >)
      : null;
  }
  async resetOrders(workspace: string) {
    await this.transaction(async () => {
      for (const table of ['orders', 'cart', 'inventory'])
        await this.run(`DELETE FROM ${table} WHERE workspace_id=?`, workspace);
    });
  }
  async checkout(workspace: string, input: unknown) {
    const data = z
      .object({
        requestKey: z.string().uuid(),
        lineIds: z.array(idSchema).min(1).max(30),
        addressId: z.enum(['studio', 'home']),
        quotedTotal: z.number().int().positive(),
        scenario: z.enum(['success', 'declined', 'delayed']),
      })
      .strict()
      .parse(input);
    return await this.transaction(async () => {
      const existing = await this.row(
        'SELECT payload FROM orders WHERE workspace_id=? AND request_key=?',
        workspace,
        data.requestKey,
      );
      if (existing) return JSON.parse(String(existing.payload)) as DemoOrder;
      if (data.scenario === 'declined')
        throw new DomainError(
          'DEMO_DECLINED',
          '모의 결제가 거절되었습니다. 구성을 유지한 채 다시 시도할 수 있습니다.',
        );
      const cart = (await this.state(workspace)).cart;
      const ids = [...new Set(data.lineIds)];
      const selected = ids.map(id => cart.find(line => line.id === id));
      if (selected.some(line => !line))
        throw new DomainError(
          'CART_CHANGED',
          '장바구니 구성이 변경되었습니다. 다시 확인해 주세요.',
          409,
        );
      const lines = selected.filter(
        (line): line is NonNullable<typeof line> => !!line,
      );
      const quantities = new Map<
        string,
        { product: string; size: string; quantity: number }
      >();
      const items: OrderItem[] = lines.map(line => {
        productInput({
          productId: line.productId,
          size: line.size,
          quantity: line.quantity,
          config: line.config,
        });
        const key = `${line.productId}:${line.size}`;
        const previous = quantities.get(key);
        quantities.set(key, {
          product: line.productId,
          size: line.size,
          quantity: (previous?.quantity ?? 0) + line.quantity,
        });
        return {
          productId: line.productId,
          name: line.product.name,
          image: line.product.image,
          size: line.size,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          config: line.config,
          preview: line.preview,
        };
      });
      const subtotal = items.reduce(
          (sum, line) => sum + line.unitPrice * line.quantity,
          0,
        ),
        shipping = subtotal >= FREE_SHIPPING ? 0 : SHIPPING_FEE,
        total = subtotal + shipping;
      if (total !== data.quotedTotal)
        throw new DomainError(
          'QUOTE_CHANGED',
          '상품 금액이 변경되었습니다. 새로운 금액을 확인해 주세요.',
          409,
        );
      for (const value of quantities.values()) {
        const stock = await this.stock(workspace, value.product, value.size);
        if (value.quantity > stock)
          throw new DomainError(
            'OUT_OF_STOCK',
            '같은 사이즈를 사용하는 디자인의 합계 수량이 선택 가능한 수량을 초과했습니다.',
          );
        await this.run(
          'INSERT OR IGNORE INTO inventory VALUES(?,?,?,?)',
          workspace,
          value.product,
          value.size,
          20,
        );
        const result = await this.run(
          'UPDATE inventory SET stock=stock-? WHERE workspace_id=? AND product_id=? AND size=? AND stock>=?',
          value.quantity,
          workspace,
          value.product,
          value.size,
          value.quantity,
        );
        if (result.changes !== 1)
          throw new DomainError(
            'OUT_OF_STOCK',
            '선택 가능한 수량이 변경되었습니다. 수량을 다시 확인해 주세요.',
          );
      }
      const createdAt = now(),
        id = randomUUID();
      const order: DemoOrder = {
        id,
        number: `NJ-${Date.now().toString(36).toUpperCase()}-${randomBytes(2).toString('hex').toUpperCase()}`,
        status: 'CONFIRMED',
        subtotal,
        shipping,
        total,
        items,
        address: ADDRESSES.find(a => a.id === data.addressId)!.text,
        createdAt,
        events: [{ status: 'CONFIRMED', at: createdAt }],
        requestKey: data.requestKey,
      };
      await this.run(
        'INSERT INTO orders VALUES(?,?,?,?)',
        id,
        workspace,
        data.requestKey,
        JSON.stringify(order),
      );
      for (const line of lines) await this.removeCart(workspace, line.id);
      return order;
    });
  }
  async advanceOrder(workspace: string, id: string, target: OrderStatus) {
    return await this.transaction(async () => {
      const row = await this.row(
        'SELECT payload FROM orders WHERE id=? AND workspace_id=?',
        id,
        workspace,
      );
      if (!row)
        throw new DomainError('NOT_FOUND', '주문을 찾을 수 없습니다.', 404);
      const order = JSON.parse(String(row.payload)) as DemoOrder;
      if (order.status === target) return order;
      const allowed: Record<OrderStatus, OrderStatus[]> = {
        CONFIRMED: ['PREPARING', 'CANCELLED'],
        PREPARING: ['SHIPPED', 'CANCELLED'],
        SHIPPED: ['DELIVERED'],
        DELIVERED: ['RETURN_REQUESTED'],
        RETURN_REQUESTED: ['REFUNDED'],
        CANCELLED: [],
        REFUNDED: [],
      };
      if (!allowed[order.status].includes(target))
        throw new DomainError(
          'INVALID_TRANSITION',
          '현재 주문 상태에서는 이 작업을 할 수 없습니다.',
          409,
        );
      if (target === 'CANCELLED' || target === 'REFUNDED')
        for (const item of order.items)
          await this.run(
            'UPDATE inventory SET stock=stock+? WHERE workspace_id=? AND product_id=? AND size=?',
            item.quantity,
            workspace,
            item.productId,
            item.size,
          );
      order.status = target;
      order.events.push({ status: target, at: now() });
      await this.run(
        'UPDATE orders SET payload=? WHERE id=? AND workspace_id=?',
        JSON.stringify(order),
        id,
        workspace,
      );
      return order;
    });
  }
}
const globalDb = globalThis as typeof globalThis & { nijoowStore?: Store };
let currentRepository: DemoRepository | undefined;
export function repository() {
  if (!currentRepository) {
    let store = globalDb.nijoowStore;
    if (!store) {
      const config = databaseConfiguration(process.env);
      store =
        config.kind === 'postgres'
          ? new PostgresStore(config.url)
          : new SqliteStore(config.path);
      globalDb.nijoowStore = store;
    }
    currentRepository = new DemoRepository(store);
  }
  return currentRepository;
}
