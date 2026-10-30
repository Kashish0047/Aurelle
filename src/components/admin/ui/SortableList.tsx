"use client";

import { useMemo, useOptimistic, useRef, useState, useTransition, type KeyboardEvent, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Reorder, useDragControls } from "framer-motion";
import { deleteRow, reorderRows, setPublished, type AdminTable } from "@/lib/admin/list-actions";
import { cn } from "@/lib/cn";
import { useToast } from "@/components/admin/Toaster";
import { useConfirm } from "./ConfirmDialog";
import { Toggle } from "./Toggle";

export interface ListColumn<T> {
  header: string;
  cell: (row: T) => ReactNode;
  /** Makes the column sortable. */
  sortValue?: (row: T) => string | number;
  /** Only offered as a sort option, not shown in the row. */
  sortOnly?: boolean;
}

interface Props<T extends { id: string }> {
  rows: T[];
  table: AdminTable;
  /** Singular, lower-case: "service" → "Delete this service?" */
  itemName: string;
  title: (row: T) => string;
  subtitle?: (row: T) => ReactNode;
  thumbnail?: (row: T) => string | null;
  columns?: ListColumn<T>[];
  searchText: (row: T) => string;
  editHref: (row: T) => string;
  /** Boolean column that controls visibility on the website (omit if the item can't be hidden). */
  publishKey?: keyof T & string;
  publishLabels?: { on: string; off: string };
  filters?: { label: string; match: (row: T) => boolean }[];
  empty: { title: string; text: string; actionLabel: string; actionHref: string };
  reorderable?: boolean;
}

type Change<T> = { type: "reorder"; ids: string[] } | { type: "patch"; id: string; patch: Partial<T> } | { type: "remove"; id: string };

/**
 * The list view used by every admin section:
 *  - search, filter chips, sort by column (or "Your order")
 *  - drag-and-drop reordering (touch + mouse via the ⠿ handle; ↑/↓ keys when the handle is focused),
 *    saved as sort_order — only while showing "Your order" with no search/filter
 *  - publish toggle, edit link, delete with confirmation (offering "Hide instead")
 * Changes appear instantly (optimistic) and roll back with an error toast if saving fails.
 */
export function SortableList<T extends { id: string }>(props: Props<T>) {
  const { rows, table, itemName, title, subtitle, thumbnail, columns = [], searchText, editHref, publishKey, filters = [], empty } = props;
  const labels = props.publishLabels ?? { on: "Published", off: "Hidden" };
  const reorderable = props.reorderable ?? true;
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const [, startTransition] = useTransition();

  const [optimistic, apply] = useOptimistic(rows, (state: T[], change: Change<T>) => {
    if (change.type === "reorder") {
      const byId = new Map(state.map((r) => [r.id, r]));
      return change.ids.map((id) => byId.get(id)).filter((r): r is T => !!r);
    }
    if (change.type === "remove") return state.filter((r) => r.id !== change.id);
    return state.map((r) => (r.id === change.id ? { ...r, ...change.patch } : r));
  });

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<number | null>(null);
  const [sort, setSort] = useState<{ col: number; dir: 1 | -1 } | null>(null);
  const [dragOrder, setDragOrder] = useState<string[] | null>(null);
  const dragRef = useRef<string[] | null>(null);

  const visible = useMemo(() => {
    const byId = new Map(optimistic.map((r) => [r.id, r]));
    let list = dragOrder ? dragOrder.map((id) => byId.get(id)).filter((r): r is T => !!r) : optimistic;
    const q = query.trim().toLowerCase();
    if (q) list = list.filter((r) => searchText(r).toLowerCase().includes(q));
    const f = filter !== null ? filters[filter] : undefined;
    if (f) list = list.filter(f.match);
    const sortValue = sort ? columns[sort.col]?.sortValue : undefined;
    if (sort && sortValue) {
      list = [...list].sort((a, b) => {
        const x = sortValue(a);
        const y = sortValue(b);
        return (typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y))) * sort.dir;
      });
    }
    return list;
  }, [optimistic, dragOrder, query, filter, filters, sort, columns, searchText]);

  const canDrag = reorderable && !sort && !query.trim() && filter === null && visible.length > 1;

  /** Run a change optimistically, save it, then refresh from the server. */
  const run = (change: Change<T>, save: () => Promise<{ ok: boolean; error?: string }>, success: string) =>
    startTransition(async () => {
      apply(change);
      const result = await save();
      if (result.ok) toast(success);
      else toast(result.error ?? "Couldn't save that change.", "error");
      router.refresh();
    });

  const commitOrder = (ids: string[]) => {
    setDragOrder(null);
    dragRef.current = null;
    if (ids.join() === optimistic.map((r) => r.id).join()) return;
    run({ type: "reorder", ids }, () => reorderRows(table, ids), "New order saved");
  };

  const moveBy = (id: string, delta: number) => {
    const ids = visible.map((r) => r.id);
    const i = ids.indexOf(id);
    const j = i + delta;
    if (i < 0 || j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j]!, ids[i]!];
    commitOrder(ids);
  };

  const togglePublish = (row: T, value: boolean) => {
    if (!publishKey) return;
    run(
      { type: "patch", id: row.id, patch: { [publishKey]: value } as Partial<T> },
      () => setPublished(table, row.id, value),
      value ? `Now showing on your website` : `Hidden from your website`,
    );
  };

  const remove = async (row: T) => {
    const shown = publishKey ? Boolean(row[publishKey]) : false;
    const answer = await confirm({
      title: `Delete this ${itemName}?`,
      message: `"${title(row)}" will be removed permanently${shown ? ". If you might need it again, hide it instead." : "."}`,
      confirmLabel: "Delete",
      danger: true,
      alternativeLabel: shown ? "Hide instead" : undefined,
    });
    if (answer === "alternative") return togglePublish(row, false);
    if (answer !== true) return;
    run({ type: "remove", id: row.id }, () => deleteRow(table, row.id), `${itemName[0]!.toUpperCase()}${itemName.slice(1)} deleted`);
  };

  if (!rows.length) {
    return (
      <div className="rounded-2xl border border-dashed border-line bg-surface px-6 py-14 text-center">
        <h2 className="font-serif text-2xl">{empty.title}</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted">{empty.text}</p>
        <Link href={empty.actionHref} className="mt-6 inline-block rounded-full bg-ink px-5 py-2.5 text-sm text-bg">
          {empty.actionLabel}
        </Link>
      </div>
    );
  }

  const sortable = columns.map((c, i) => ({ ...c, i })).filter((c) => c.sortValue);

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${itemName}s…`}
          aria-label={`Search ${itemName}s`}
          className="h-11 w-full rounded-full border border-line bg-surface px-5 text-sm outline-none focus:border-ink md:max-w-xs"
        />
        <div className="flex flex-wrap items-center gap-2">
          {filters.length > 0 && (
            <div role="group" aria-label="Filter" className="flex flex-wrap gap-1.5">
              {[{ label: "All" }, ...filters].map((f, i) => {
                const value = i === 0 ? null : i - 1;
                return (
                  <button
                    key={f.label}
                    type="button"
                    aria-pressed={filter === value}
                    onClick={() => setFilter(value)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs",
                      filter === value ? "border-ink bg-ink text-bg" : "border-line bg-surface",
                    )}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
          )}
          {sortable.length > 0 && (
            <select
              aria-label="Sort"
              value={sort ? `${sort.col}:${sort.dir}` : ""}
              onChange={(e) => {
                const [col, dir] = e.target.value.split(":");
                setSort(e.target.value ? { col: Number(col), dir: dir === "-1" ? -1 : 1 } : null);
              }}
              className="h-9 rounded-full border border-line bg-surface px-3 text-xs"
            >
              <option value="">Your order</option>
              {sortable.flatMap((c) => [
                <option key={`${c.i}:1`} value={`${c.i}:1`}>{`${c.header} ↑`}</option>,
                <option key={`${c.i}:-1`} value={`${c.i}:-1`}>{`${c.header} ↓`}</option>,
              ])}
            </select>
          )}
        </div>
      </div>

      {!canDrag && reorderable && visible.length > 1 && (
        <p className="mb-3 text-xs text-muted">To drag items into a new order, clear the search and filters and choose “Your order”.</p>
      )}

      {visible.length === 0 ? (
        <p className="rounded-2xl border border-line bg-surface px-6 py-10 text-center text-sm text-muted">No {itemName}s match.</p>
      ) : (
        <Reorder.Group
          as="ul"
          axis="y"
          values={visible.map((r) => r.id)}
          onReorder={(ids: string[]) => {
            dragRef.current = ids;
            setDragOrder(ids);
          }}
          className="flex flex-col gap-2"
        >
          {visible.map((row) => (
            <Row
              key={row.id}
              row={row}
              canDrag={canDrag}
              onDragEnd={() => dragRef.current && commitOrder(dragRef.current)}
              onMove={(d) => moveBy(row.id, d)}
              title={title(row)}
              subtitle={subtitle?.(row)}
              thumbnail={thumbnail?.(row) ?? null}
              cells={columns.filter((c) => !c.sortOnly).map((c) => ({ header: c.header, value: c.cell(row) }))}
              editHref={editHref(row)}
              published={publishKey ? Boolean(row[publishKey]) : null}
              labels={labels}
              onPublish={(v) => togglePublish(row, v)}
              onDelete={() => remove(row)}
            />
          ))}
        </Reorder.Group>
      )}
    </div>
  );
}

interface RowProps {
  row: { id: string };
  canDrag: boolean;
  onDragEnd: () => void;
  onMove: (delta: number) => void;
  title: string;
  subtitle?: ReactNode;
  thumbnail: string | null;
  cells: { header: string; value: ReactNode }[];
  editHref: string;
  published: boolean | null;
  labels: { on: string; off: string };
  onPublish: (value: boolean) => void;
  onDelete: () => void;
}

function Row({ row, canDrag, onDragEnd, onMove, title, subtitle, thumbnail, cells, editHref, published, labels, onPublish, onDelete }: RowProps) {
  const controls = useDragControls();
  const onHandleKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      onMove(-1);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      onMove(1);
    }
  };

  return (
    <Reorder.Item
      as="li"
      value={row.id}
      dragListener={false}
      dragControls={controls}
      onDragEnd={onDragEnd}
      className={cn("rounded-2xl border border-line bg-surface", published === false && "opacity-70")}
    >
      <div className="flex flex-wrap items-center gap-3 p-3 sm:flex-nowrap">
        {canDrag && (
          <button
            type="button"
            aria-label={`Reorder ${title}. Use arrow keys to move.`}
            onPointerDown={(e) => controls.start(e)}
            onKeyDown={onHandleKey}
            className="grid size-9 shrink-0 cursor-grab touch-none place-items-center rounded-lg text-muted hover:bg-bg-alt active:cursor-grabbing"
          >
            <svg aria-hidden viewBox="0 0 16 16" className="size-4" fill="currentColor">
              <circle cx="5" cy="3" r="1.3" /><circle cx="11" cy="3" r="1.3" />
              <circle cx="5" cy="8" r="1.3" /><circle cx="11" cy="8" r="1.3" />
              <circle cx="5" cy="13" r="1.3" /><circle cx="11" cy="13" r="1.3" />
            </svg>
          </button>
        )}
        {thumbnail !== null && (
          <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-bg-alt">
            {thumbnail && <Image src={thumbnail} alt="" fill sizes="56px" unoptimized className="object-cover" />}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <Link href={editHref} className="block truncate font-medium hover:underline">
            {title}
          </Link>
          {subtitle && <p className="truncate text-xs text-muted">{subtitle}</p>}
          {cells.length > 0 && (
            <dl className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted">
              {cells.map((c) => (
                <div key={c.header} className="flex gap-1">
                  <dt>{c.header}:</dt>
                  <dd className="text-ink">{c.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
        <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end">
          {published !== null && (
            <span className="flex items-center gap-2 text-xs text-muted">
              <Toggle checked={published} onChange={onPublish} label={`${published ? labels.on : labels.off}: ${title}`} hideLabel />
              <span className="w-16">{published ? labels.on : labels.off}</span>
            </span>
          )}
          <div className="flex gap-1">
            <Link href={editHref} className="rounded-full border border-line px-4 py-2 text-xs hover:border-ink/40">
              Edit
            </Link>
            <button type="button" onClick={onDelete} className="rounded-full px-3 py-2 text-xs text-muted hover:bg-accent/10 hover:text-ink">
              Delete
            </button>
          </div>
        </div>
      </div>
    </Reorder.Item>
  );
}
