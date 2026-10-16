"use client";

import { useEffect, useState, type FormEvent } from "react";

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

  if (loading) return <p className="text-muted">در حال دریافت ویژگی‌ها...</p>;

  return (
    <div className="space-y-8">
      {notice ? <p className="rounded-2xl border border-cyan-500/40 px-4 py-3 text-sm">{notice}</p> : null}
      {error ? <p className="rounded-2xl border border-red-500/40 px-4 py-3 text-sm text-red-300">{error}</p> : null}
      <p className="text-sm text-muted">برچسب‌های آزاد روی فرم طرح جدا از این ویژگی‌ها هستند و صفحه سئوی جدا نمی‌سازند.</p>
      {groups.length === 0 ? <p className="text-muted">گروه ویژگی‌ای ثبت نشده است.</p> : null}
      <div className="grid gap-4">
        {groups.map((group) => (
          <section key={group.id} className="rounded-3xl border border-border bg-surface p-4">
            <h2 className="font-bold">{group.name}</h2>
            <p className="text-xs text-muted">{group.slug}</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {values
                .filter((value) => value.groupId === group.id)
                .map((value) => (
                  <li key={value.id} className="rounded-full border border-border px-3 py-1 text-xs">
                    {value.name}
                  </li>
                ))}
            </ul>
          </section>
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
        <select value={valueGroupId} onChange={(event) => setValueGroupId(event.target.value)} className={inputClass}>
          {groups.map((group) => (
            <option key={group.id} value={group.id}>{group.name}</option>
          ))}
        </select>
        <input value={valueName} onChange={(event) => setValueName(event.target.value)} placeholder="نام مقدار" className={inputClass} required />
        <button type="submit" className="rounded-2xl bg-cyan-500 px-4 py-2 text-sm font-bold text-black">ذخیره مقدار</button>
      </form>
    </div>
  );
}
