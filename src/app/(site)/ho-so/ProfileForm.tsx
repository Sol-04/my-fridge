"use client";

import { useState, useTransition } from "react";

import { Chip, NumberField, TextField } from "@/components/form";
import { buttonClass, Notice, PendingDots } from "@/components/ui";
import {
  ACTIVITY_OPTIONS,
  calcTargetCalories,
  GENDER_OPTIONS,
  GOAL_OPTIONS,
  INPUT_LIMITS,
  parseUserInput,
  type Activity,
  type Gender,
  type Goal,
} from "@/lib/meal-plan";

import { updateProfile } from "./actions";
import { Icon, Icons } from "@/components/icons";

export type ProfileFormValues = {
  displayName: string;
  gender: Gender;
  age: string;
  heightCm: string;
  weightKg: string;
  activity: Activity;
  goal: Goal;
};

// Form hồ sơ: tên hiển thị + thông tin cơ thể (dùng để tự điền khi tạo thực đơn)
export function ProfileForm({ initial }: { initial: ProfileFormValues }) {
  const [v, setV] = useState(initial);
  const set = <K extends keyof ProfileFormValues>(k: K, value: ProfileFormValues[K]) => {
    setV((prev) => ({ ...prev, [k]: value }));
    setStatus(null);
  };
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [saving, startSaving] = useTransition();

  const body = parseUserInput({
    gender: v.gender,
    age: Number(v.age),
    heightCm: Number(v.heightCm),
    weightKg: Number(v.weightKg),
    activity: v.activity,
    goal: v.goal,
  });
  const target = body ? calcTargetCalories(body) : null;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startSaving(async () => {
      try {
        const res = await updateProfile(v);
        setStatus(res.ok ? { ok: true, text: "Đã lưu hồ sơ. Lần tới tạo thực đơn sẽ tự điền sẵn thông tin này." } : { ok: false, text: res.error });
      } catch {
        setStatus({ ok: false, text: "Không kết nối được máy chủ. Bạn kiểm tra mạng rồi thử lại nhé." });
      }
    });
  };

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <TextField
        label="Tên hiển thị"
        value={v.displayName}
        onChange={(e) => set("displayName", e.target.value)}
        maxLength={60}
        autoComplete="name"
        error={v.displayName.trim() === "" ? "Vui lòng nhập tên" : undefined}
      />

      <fieldset>
        <legend className="text-sm font-semibold text-ink">Giới tính</legend>
        <div className="mt-1 grid grid-cols-2 gap-2">
          {GENDER_OPTIONS.map((o) => (
            <Chip key={o.value} active={v.gender === o.value} onClick={() => set("gender", o.value)}>
              {o.label}
            </Chip>
          ))}
        </div>
      </fieldset>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <NumberField label="Tuổi" unit="tuổi" value={v.age} onChange={(x) => set("age", x)} limits={INPUT_LIMITS.age} />
        <NumberField label="Chiều cao" unit="cm" value={v.heightCm} onChange={(x) => set("heightCm", x)} limits={INPUT_LIMITS.heightCm} />
        <NumberField label="Cân nặng" unit="kg" value={v.weightKg} onChange={(x) => set("weightKg", x)} limits={INPUT_LIMITS.weightKg} />
      </div>

      <fieldset>
        <legend className="text-sm font-semibold text-ink">Mức vận động</legend>
        <div className="mt-1 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {ACTIVITY_OPTIONS.map((o) => (
            <Chip key={o.value} active={v.activity === o.value} onClick={() => set("activity", o.value)} stacked>
              <span className="block">{o.label}</span>
              <span className={`block text-xs font-normal ${v.activity === o.value ? "text-brand-100" : "text-muted"}`}>{o.hint}</span>
            </Chip>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-semibold text-ink">Mục tiêu</legend>
        <div className="mt-1 grid grid-cols-3 gap-2">
          {GOAL_OPTIONS.map((o) => (
            <Chip key={o.value} active={v.goal === o.value} onClick={() => set("goal", o.value)}>
              {o.label}
            </Chip>
          ))}
        </div>
      </fieldset>

      <div className="rounded-2xl bg-aqua-50 p-4" aria-live="polite">
        {target ? (
          <p className="flex flex-wrap items-center gap-2 text-brand-900">
            <Icon icon={Icons.target} size={18} />
            Calo mục tiêu mỗi ngày: <strong className="text-xl">{target} kcal</strong>
          </p>
        ) : (
          <p className="text-sm text-muted">Nhập tuổi, chiều cao, cân nặng để xem lượng calo bạn cần mỗi ngày.</p>
        )}
      </div>

      {status && (
        <Notice tone={status.ok ? "success" : "error"} title={status.ok ? undefined : "Chưa lưu được hồ sơ"}>
          {status.text}
        </Notice>
      )}

      <button type="submit" disabled={saving || v.displayName.trim() === ""} className={buttonClass("primary", "lg", "w-full sm:w-auto")}>
        {saving ? (
          <>
            Đang lưu…
            <PendingDots />
          </>
        ) : (
          "Lưu hồ sơ"
        )}
      </button>
    </form>
  );
}
