export interface Groupable {
  id: string;
  revenue: number;
}

export interface GroupResult<T> {
  groupNumber: number;
  members: T[];
  totalRevenue: number;
}

/**
 * Splits items into groups of exactly `groupSize` (default 50), balancing
 * total revenue across groups as evenly as possible. Every group has
 * exactly `groupSize` members except the last one, which takes the
 * remainder (e.g. 130 leads -> groups of 50, 50, and 30).
 *
 * Approach: sort by revenue descending, then greedily assign each item to
 * whichever group (among those that haven't yet reached their target size)
 * currently has the lowest total revenue. This is the standard
 * longest-processing-time heuristic for balanced multiway partitioning.
 * Because every group's capacity is fixed up front and capacities sum to
 * exactly the item count, every group ends up filled to its target size.
 */
export function buildBalancedGroups<T extends Groupable>(
  items: T[],
  groupSize = 50,
): GroupResult<T>[] {
  if (items.length === 0) return [];

  const numGroups = Math.ceil(items.length / groupSize);
  const remainder = items.length % groupSize;
  const capacities = Array.from({ length: numGroups }, (_, i) =>
    remainder !== 0 && i === numGroups - 1 ? remainder : groupSize,
  );

  const sorted = [...items].sort((a, b) => b.revenue - a.revenue);

  const groups: GroupResult<T>[] = Array.from({ length: numGroups }, (_, i) => ({
    groupNumber: i + 1,
    members: [],
    totalRevenue: 0,
  }));

  for (const item of sorted) {
    let best = -1;
    for (let i = 0; i < numGroups; i++) {
      if (groups[i].members.length >= capacities[i]) continue;
      if (best === -1 || groups[i].totalRevenue < groups[best].totalRevenue) {
        best = i;
      }
    }
    groups[best].members.push(item);
    groups[best].totalRevenue += item.revenue;
  }

  return groups;
}
