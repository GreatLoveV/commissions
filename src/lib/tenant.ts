import { prisma } from "@/lib/db";

// Tables that belong to one artist. Each has an artistId column.
const TENANT_MODELS = [
  "PortfolioImage",
  "CommissionType",
  "Request",
  "RequestFile",
  "RequestEvent",
  "Payment",
];

// Operations that take a `where`. The artist id is added to it.
const WHERE_OPERATIONS = [
  "findMany",
  "findFirst",
  "findFirstOrThrow",
  "findUnique",
  "findUniqueOrThrow",
  "count",
  "aggregate",
  "groupBy",
  "update",
  "updateMany",
  "delete",
  "deleteMany",
];

type LooseArgs = {
  where?: object;
  data?: object | object[];
};

/**
 * Returns a database client that can only see and change rows of one artist.
 *
 *   const artist = await requireArtist();
 *   const db = tenantDb(artist.id);
 *   const types = await db.commissionType.findMany();
 *
 * How it works: every query passes through the function below before it
 * reaches the database. Reads, updates and deletes get `artistId` added to
 * their `where`. Creates and updates get `artistId` written into `data`,
 * replacing whatever the caller put there.
 *
 * Two things to know when using it:
 * - pass plain ids in `data` (commissionTypeId: "..."), not
 *   `{ connect: ... }`. Prisma does not allow mixing the two styles.
 * - anything not listed above (upsert, raw sql) throws. Add it here on
 *   purpose when it is needed, with its own scoping.
 */
export function tenantDb(artistId: string) {
  if (!artistId) {
    throw new Error("tenantDb needs an artist id");
  }

  const scoped = prisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          if (!TENANT_MODELS.includes(model)) {
            throw new Error(`${model} is not a tenant table`);
          }

          const next = { ...args } as LooseArgs;
          let handled = false;

          if (WHERE_OPERATIONS.includes(operation)) {
            next.where = { ...next.where, artistId };
            handled = true;
          }

          if (operation === "create" || operation === "update" || operation === "updateMany") {
            // on update this stops a row from being moved to another artist
            next.data = { ...next.data, artistId };
            handled = true;
          }

          if (operation === "createMany" || operation === "createManyAndReturn") {
            const rows = Array.isArray(next.data) ? next.data : [next.data];
            next.data = rows.map((row) => ({ ...row, artistId }));
            handled = true;
          }

          // fail closed: an operation we did not scope never runs
          if (!handled) {
            throw new Error(`${operation} is not allowed through tenantDb`);
          }

          return query(next as typeof args);
        },
      },
    },
  });

  // Only the tenant tables are exposed, so db.user or db.artist do not
  // even exist on the returned object.
  return {
    portfolioImage: scoped.portfolioImage,
    commissionType: scoped.commissionType,
    request: scoped.request,
    requestFile: scoped.requestFile,
    requestEvent: scoped.requestEvent,
    payment: scoped.payment,
  };
}

export type TenantDb = ReturnType<typeof tenantDb>;
