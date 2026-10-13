import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Pencil, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/ThemeContext';
import { useConfirm } from '../context/ConfirmContext';
import { useToast } from '../context/ToastContext';
import SearchInput from '../components/SearchInput';
import { TableSkeleton } from '../components/Skeleton';

/** True when a staff member has a welcome message (i.e. is featured as HOD). */
const isHod = (item: any) =>
  typeof item?.welcomeMessage === 'string' && item.welcomeMessage.trim().length > 0;

const SortableStaffRow: React.FC<{
  item: any;
  removingId: string | null;
  onDelete: (item: any) => void;
  dragDisabled: boolean;
}> = ({ item, removingId, onDelete, dragDisabled }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id, disabled: dragDisabled });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : undefined,
  };
  return (
    <tr ref={setNodeRef} style={style} className={isDragging ? 'row-dragging' : undefined}>
      <td className="drag-cell">
        <button
          type="button"
          className="drag-handle"
          aria-label={`Reorder ${item.name ?? 'staff member'}`}
          disabled={dragDisabled}
          {...attributes}
          {...listeners}
        >
          <GripVertical size={15} aria-hidden="true" />
        </button>
      </td>
      <td>
        {item.name}
        {isHod(item) && (
          <span className="badge badge-primary" style={{ marginLeft: 8 }}>HOD</span>
        )}
      </td>
      <td>{item.position}</td>
      <td>{item.department}</td>
      <td>{item.email}</td>
      <td>
        <div className="table-actions">
          <Link to={`/admin/staff/${item.id}/edit`} className="btn btn-sm btn-outline">
            <Pencil size={13} aria-hidden="true" /> Edit
          </Link>
          <button
            className="btn btn-sm btn-outline btn-delete"
            onClick={() => onDelete(item)}
            disabled={removingId === item.id}
          >
            <Trash2 size={13} aria-hidden="true" />
            {removingId === item.id ? ' Deleting...' : ' Delete'}
          </button>
        </div>
      </td>
    </tr>
  );
};

const AdminStaff: React.FC = () => {
  const { token } = useAuth();
  const { confirm } = useConfirm();
  const toast = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/staff?limit=100');
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not load staff');
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load staff');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      [item.name, item.position, item.email]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [items, query]);

  // Drag only reorders the full list, so it's disabled while a search filter
  // is active (indices would otherwise map to the wrong rows).
  const dragDisabled = query.trim().length > 0 || savingOrder;

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(items, oldIndex, newIndex);
    setItems(next); // optimistic
    setSavingOrder(true);
    setError('');
    try {
      const res = await fetch('/api/admin/staff?action=reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ order: next.map((i) => i.id) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not save order');
      toast.success('Staff order saved');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not save order';
      setError(message);
      toast.error(message);
      await load(); // roll back to server state
    } finally {
      setSavingOrder(false);
    }
  };

  const handleDelete = async (item: any) => {
    const ok = await confirm({
      message: `Delete "${item.name ?? item.id}"? This cannot be undone.`,
      confirmLabel: 'Delete',
      tone: 'danger',
    });
    if (!ok) return;
    setError('');
    setRemovingId(item.id);
    try {
      // Query-param id: Vercel file-routing has no /staff/<id> route, and
      // handleResource.getId() reads req.query.id first.
      const res = await fetch(`/api/admin/staff?id=${encodeURIComponent(item.id)}`, {
        method: 'DELETE',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      await load();
      toast.success('Staff member deleted');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Delete failed';
      setError(message);
      toast.error(message);
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div>
      <h1 className="page-title">Staff</h1>
      <p className="page-description">
        Manage the department's staff members. Drag the handle to set the order
        shown on the public Staff page and the homepage welcome message.
      </p>
      <div className="admin-section-header">
        <h2>All Staff Members</h2>
        <Link to="/admin/staff/new" className="btn btn-primary">
          <Plus size={15} aria-hidden="true" /> Add New Staff Member
        </Link>
      </div>
      {error && <div className="login-error">{error}</div>}
      {loading ? (
        <TableSkeleton rows={5} columns={6} />
      ) : items.length === 0 ? (
        <div className="empty-state">No staff yet.</div>
      ) : (
        <>
          <div style={{ marginBottom: 16 }}>
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Search by name, position or email"
              resultCount={filtered.length}
            />
          </div>
          {filtered.length === 0 ? (
            <div className="empty-state">No staff match your search.</div>
          ) : (
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th className="drag-cell" aria-label="Reorder" />
                  <th>Name</th>
                  <th>Position</th>
                  <th>Department</th>
                  <th>Email</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={filtered.map((item) => item.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <tbody>
                    {filtered.map((item) => (
                      <SortableStaffRow
                        key={item.id}
                        item={item}
                        removingId={removingId}
                        onDelete={handleDelete}
                        dragDisabled={dragDisabled}
                      />
                    ))}
                  </tbody>
                </SortableContext>
              </DndContext>
            </table>
          </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminStaff;
