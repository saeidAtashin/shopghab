"use client";

import { useEffect, useState, type FormEvent } from "react";

import AdminSelect from "@/app/components/admin/AdminSelect";
import { adminJson } from "@/app/components/admin/AdminShell";
import type { AttributeGroupRecord, AttributeValueRecord } from "@/lib/catalog/schema";

const inputClass =
  "w-full rounded-2xl border border-border bg-input-bg px-4 py-3 outline-none focus:border-cyan-500";

export default function AttributeAdmin() {
  const [groups, setGroups] = useState<AttributeGroupRecord[]>([]);
  const [values, setValues] = useState<AttributeValueRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [groupName, setGroupName] = useState("");
  const [groupSlug, setGroupSlug] = useState("");
  const [valueGroupId, setValueGroupId] = useState("");
  const [valueName, setValueName] = useState("");

  async function load() {
    const body = await adminJson<{ groups: AttributeGroupRecord[]; values: AttributeValueRecord[] }>(
      "/api/admin/catalog/attributes",
    );
    setGroups(body.groups);
    setValues(body.values);
    setValueGroupId((current) => current || body.groups[0]?.id || "");
  }

  useEffect(() => {
    let active = true;
    async function fetchAttributes() {
      try {
        const body = await adminJson<{ groups: AttributeGroupRecord[]; values: AttributeValueRecord[] }>(
          "/api/admin/catalog/attributes",
        );
        if (!active) return;
        setGroups(body.groups);
        setValues(body.values);
        setValueGroupId((current) => current || body.groups[0]?.id || "");
      } catch (reason: unknown) {
        if (!active) return;
        setError(reason instanceof Error ? reason.message : "دریافت ویژگی‌ها انجام نشد");
      } finally {
        if (active) setLoading(false);
      }
    }
    void fetchAttributes();
    return () => {
      active = false;
    };
  }, []);

  async function createGroup(event: FormEvent) {
    event.preventDefault();
    setError("");
    setNotice("");
    try {
      await adminJson("/api/admin/catalog/attributes", {
        method: "POST",
        body: JSON.stringify({ kind: "group", name: groupName, slug: groupSlug }),
      });
      setGroupName("");
      setGroupSlug("");
      setNotice("گروه ویژگی ذخیره شد.");
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "ذخیره انجام نشد");
    }
  }

  async function createValue(event: FormEvent) {
    event.preventDefault();
    setError("");
    setNotice("");
    try {
      await adminJson("/api/admin/catalog/attributes", {
        method: "POST",
        body: JSON.stringify({ kind: "value", groupId: valueGroupId, name: valueName }),
      });
      setValueName("");
      setNotice("مقدار ویژگی ذخیره شد.");
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "ذخیره انجام نشد");
    }
  }

  async function saveGroup(group: AttributeGroupRecord, name: string, slug: string) {
    setError("");
    setNotice("");
    await adminJson("/api/admin/catalog/attributes", {
      method: "PATCH",
      body: JSON.stringify({ kind: "group", id: group.id, name, slug }),
    });
    setNotice("گروه ویژگی ذخیره شد.");
    await load();
  }

  async function saveValue(value: AttributeValueRecord, name: string) {
    setError("");
    setNotice("");
    await adminJson("/api/admin/catalog/attributes", {
      method: "PATCH",
      body: JSON.stringify({ kind: "value", id: value.id, name }),
    });
    setNotice("مقدار ویژگی ذخیره شد.");
    await load();
  }

  async function remove(kind: "group" | "value", id: string, label: string) {
    if (!window.confirm(`${label} حذف شود؟`)) return;
    setError("");
    setNotice("");
    try {
      await adminJson("/api/admin/catalog/attributes", {
        method: "DELETE",
        body: JSON.stringify({ kind, id }),
      });
      setNotice(kind === "group" ? "گروه ویژگی حذف شد." : "مقدار ویژگی حذف شد.");
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "حذف انجام نشد");
    }
  }

  if (loading) return <p className="text-muted">در حال دریافت ویژگی‌ها...</p>;

  return (
    <div className="space-y-8">
      {notice ? <p className="rounded-2xl border border-cyan-500/40 px-4 py-3 text-sm">{notice}</p> : null}
      {error ? <p className="rounded-2xl border border-red-500/40 px-4 py-3 text-sm text-red-300">{error}</p> : null}
      <p className="text-sm text-muted">برچسب‌های آزاد روی فرم طرح جدا از این ویژگی‌ها هستند و صفحه سئوی جدا نمی‌سازند.</p>
      {groups.length === 0 ? <p className="text-muted">گروه ویژگی‌ای ثبت نشده است.</p> : null}
      <div className="grid gap-4">
        {groups.map((group) => (
          <GroupEditor
            key={`${group.id}:${group.updatedAt}`}
            group={group}
            values={values.filter((value) => value.groupId === group.id)}
            onSaveGroup={saveGroup}
            onSaveValue={saveValue}
            onDelete={remove}
            onError={(message) => {
              setNotice("");
              setError(message);
            }}
          />
        ))}
      </div>
      <form onSubmit={(event) => void createGroup(event)} className="grid max-w-xl gap-3 rounded-3xl border border-border p-4">
        <h2 className="font-bold">گروه جدید</h2>
        <input value={groupName} onChange={(event) => setGroupName(event.target.value)} placeholder="نام فارسی" className={inputClass} required />
        <input value={groupSlug} onChange={(event) => setGroupSlug(event.target.value)} placeholder="slug" dir="ltr" className={`${inputClass} text-left`} required />
        <button type="submit" className="rounded-2xl bg-cyan-500 px-4 py-2 text-sm font-bold text-black">ذخیره گروه</button>
      </form>
      <form onSubmit={(event) => void createValue(event)} className="grid max-w-xl gap-3 rounded-3xl border border-border p-4">
        <h2 className="font-bold">مقدار جدید</h2>
        <AdminSelect
          value={valueGroupId}
          onChange={setValueGroupId}
          ariaLabel="گروه ویژگی"
          options={groups.map((group) => ({ value: group.id, label: group.name }))}
        />
        <input value={valueName} onChange={(event) => setValueName(event.target.value)} placeholder="نام مقدار" className={inputClass} required />
        <button type="submit" className="rounded-2xl bg-cyan-500 px-4 py-2 text-sm font-bold text-black">ذخیره مقدار</button>
      </form>
    </div>
  );
}

function GroupEditor({
  group,
  values,
  onSaveGroup,
  onSaveValue,
  onDelete,
  onError,
}: {
  group: AttributeGroupRecord;
  values: AttributeValueRecord[];
  onSaveGroup: (group: AttributeGroupRecord, name: string, slug: string) => Promise<void>;
  onSaveValue: (value: AttributeValueRecord, name: string) => Promise<void>;
  onDelete: (kind: "group" | "value", id: string, label: string) => Promise<void>;
  onError: (message: string) => void;
}) {
  const [name, setName] = useState(group.name);
  const [slug, setSlug] = useState(group.slug);
  const [saving, setSaving] = useState(false);

  async function save(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await onSaveGroup(group, name, slug);
    } catch (reason) {
      onError(reason instanceof Error ? reason.message : "ذخیره انجام نشد");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-3xl border border-border bg-surface p-4">
      <form onSubmit={(event) => void save(event)} className="grid gap-3 md:grid-cols-[1fr_1fr_auto_auto] md:items-end">
        <label className="text-sm">
          نام گروه
          <input value={name} onChange={(event) => setName(event.target.value)} className={`${inputClass} mt-1`} required />
        </label>
        <label className="text-sm">
          اسلاگ
          <input value={slug} onChange={(event) => setSlug(event.target.value)} dir="ltr" className={`${inputClass} mt-1 text-left`} required />
        </label>
        <button type="submit" disabled={saving} className="rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-bold text-black disabled:opacity-60">
          ذخیره
        </button>
        <button
          type="button"
          onClick={() => void onDelete("group", group.id, `گروه «${group.name}» و مقدارهایش`)}
          className="rounded-2xl border border-border px-4 py-3 text-sm"
        >
          حذف
        </button>
      </form>
      <ul className="mt-4 grid gap-2">
        {values.map((value) => (
          <ValueEditor
            key={`${value.id}:${value.updatedAt}`}
            value={value}
            onSave={onSaveValue}
            onDelete={onDelete}
            onError={onError}
          />
        ))}
      </ul>
    </section>
  );
}

function ValueEditor({
  value,
  onSave,
  onDelete,
  onError,
}: {
  value: AttributeValueRecord;
  onSave: (value: AttributeValueRecord, name: string) => Promise<void>;
  onDelete: (kind: "group" | "value", id: string, label: string) => Promise<void>;
  onError: (message: string) => void;
}) {
  const [name, setName] = useState(value.name);
  const [saving, setSaving] = useState(false);

  async function save(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await onSave(value, name);
    } catch (reason) {
      onError(reason instanceof Error ? reason.message : "ذخیره انجام نشد");
    } finally {
      setSaving(false);
    }
  }

  return (
    <li>
      <form onSubmit={(event) => void save(event)} className="grid grid-cols-1 items-center gap-2 md:grid-cols-[minmax(0,1fr)_5.5rem_5rem]">
        <input value={name} onChange={(event) => setName(event.target.value)} className={inputClass} required aria-label={`نام ${value.name}`} />
        <button type="submit" disabled={saving} className="rounded-2xl border border-border px-3 py-2 text-xs disabled:opacity-60">
          ذخیره
        </button>
        <button
          type="button"
          onClick={() => void onDelete("value", value.id, `مقدار «${value.name}»`)}
          className="rounded-2xl border border-border px-3 py-2 text-xs"
        >
          حذف
        </button>
      </form>
    </li>
  );
}
